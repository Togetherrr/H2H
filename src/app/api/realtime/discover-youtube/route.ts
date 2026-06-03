import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { seedYoutubeRealtimeSnapshot } from "@/lib/realtime/youtube-admin-sync"

export const runtime = "nodejs"
export const revalidate = 0

type YouTubeSearchItem = {
  id?: { videoId?: string }
  snippet?: {
    title?: string
    thumbnails?: {
      high?: { url?: string }
      medium?: { url?: string }
      default?: { url?: string }
    }
  }
}

type YouTubeVideosListItem = {
  id?: string
  contentDetails?: { duration?: string }
}

function requireCronSecret(req: Request) {
  const configured = process.env.H2H_CRON_SECRET
  if (!configured) throw new Error("Missing H2H_CRON_SECRET.")

  const url = new URL(req.url)
  const querySecret = url.searchParams.get("secret")
  const headerSecret = req.headers.get("x-cron-secret")
  const vercelCronSecret = req.headers.get("authorization")?.replace("Bearer ", "")

  return (
    querySecret === configured ||
    headerSecret === configured ||
    vercelCronSecret === configured
  )
}

function parseIso8601DurationSeconds(duration: string) {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(duration)
  if (!match) return null
  const hours = match[1] ? Number(match[1]) : 0
  const minutes = match[2] ? Number(match[2]) : 0
  const seconds = match[3] ? Number(match[3]) : 0
  if ([hours, minutes, seconds].some((n) => Number.isNaN(n))) return null
  return hours * 3600 + minutes * 60 + seconds
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function resolveChannelId(apiKey: string) {
  const explicitChannelId = process.env.H2H_YOUTUBE_CHANNEL_ID?.trim()
  if (explicitChannelId) return explicitChannelId

  const channelHandle = process.env.H2H_YOUTUBE_CHANNEL_HANDLE?.trim() || "hearts2hearts.official"
  const url = new URL("https://www.googleapis.com/youtube/v3/channels")
  url.searchParams.set("part", "id")
  url.searchParams.set("forHandle", channelHandle)
  url.searchParams.set("key", apiKey)

  const response = await fetchWithTimeout(url, { next: { revalidate: 300 } }, 8000)
  if (!response.ok) return null

  const payload = (await response.json()) as { items?: Array<{ id?: string }> }
  return payload.items?.[0]?.id ?? null
}

async function discoverRecentVideos() {
  const apiKey = process.env.H2H_YOUTUBE_API_KEY?.trim()
  if (!apiKey) return { error: "Missing H2H_YOUTUBE_API_KEY." as const }

  const channelId = await resolveChannelId(apiKey)
  if (!channelId) return { error: "Unable to resolve YouTube channel." as const }

  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search")
  searchUrl.searchParams.set("part", "snippet")
  searchUrl.searchParams.set("channelId", channelId)
  searchUrl.searchParams.set("maxResults", "12")
  searchUrl.searchParams.set("order", "date")
  searchUrl.searchParams.set("type", "video")
  searchUrl.searchParams.set("key", apiKey)

  const searchResponse = await fetchWithTimeout(searchUrl, { next: { revalidate: 300 } }, 8000)
  if (!searchResponse.ok) return { error: `YouTube search HTTP ${searchResponse.status}` as const }

  const searchPayload = (await searchResponse.json()) as { items?: YouTubeSearchItem[] }
  const items = (searchPayload.items ?? []).filter((item) => item.id?.videoId)
  if (items.length === 0) return { videos: [] as Array<{ id: string; title: string; thumbnail: string | null }> }

  const videoIds = items.map((item) => item.id!.videoId!).filter(Boolean)
  const detailsUrl = new URL("https://www.googleapis.com/youtube/v3/videos")
  detailsUrl.searchParams.set("part", "contentDetails")
  detailsUrl.searchParams.set("id", videoIds.join(","))
  detailsUrl.searchParams.set("key", apiKey)

  const detailsResponse = await fetchWithTimeout(detailsUrl, { next: { revalidate: 300 } }, 8000)
  const durationMap = new Map<string, boolean>()

  if (detailsResponse.ok) {
    const detailsPayload = (await detailsResponse.json()) as { items?: YouTubeVideosListItem[] }
    for (const item of detailsPayload.items ?? []) {
      const duration = item.contentDetails?.duration
      const seconds = duration ? parseIso8601DurationSeconds(duration) : null
      if (item.id && seconds !== null && seconds > 60) {
        durationMap.set(item.id, true)
      }
    }
  }

  const videos = items
    .map((item) => {
      const id = item.id?.videoId
      if (!id) return null
      if (durationMap.size > 0 && !durationMap.has(id)) return null
      return {
        id,
        title: item.snippet?.title ?? id,
        thumbnail:
          item.snippet?.thumbnails?.high?.url ??
          item.snippet?.thumbnails?.medium?.url ??
          item.snippet?.thumbnails?.default?.url ??
          null,
      }
    })
    .filter(Boolean) as Array<{ id: string; title: string; thumbnail: string | null }>

  return { videos }
}

export async function GET(req: Request) {
  try {
    if (!requireCronSecret(req)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const dryRun =
      url.searchParams.get("dryRun") === "1" ||
      url.searchParams.get("dryRun") === "true"

    const discovery = await discoverRecentVideos()
    if ("error" in discovery) {
      return NextResponse.json({ ok: false, error: discovery.error }, { status: 502 })
    }

    if (dryRun) {
      return NextResponse.json({
        ok: true,
        dryRun: true,
        discovered: discovery.videos.length,
        changed: 0,
        results: discovery.videos.map((video) => ({
          id: video.id,
          action: "would_insert_or_reactivate",
          title: video.title,
        })),
      })
    }

    const supabase = createServiceClient()
    const results: Array<{ id: string; action: string }> = []

    for (const video of discovery.videos) {
      const { data: existing, error: existingError } = await supabase
        .from("h2h_items")
        .select("id,is_active")
        .eq("type", "youtube_video")
        .eq("platform_id", video.id)
        .maybeSingle()

      if (existingError) {
        return NextResponse.json(
          { ok: false, error: existingError.message, step: "lookup_item" },
          { status: 502 },
        )
      }

      if (existing?.is_active) {
        continue
      }

      if (existing) {
        const { error: updateError } = await supabase
          .from("h2h_items")
          .update({
            is_active: true,
            title: video.title,
            cover_url: video.thumbnail ?? null,
          })
          .eq("id", existing.id)

        if (updateError) {
          return NextResponse.json(
            { ok: false, error: updateError.message, step: "reactivate_item" },
            { status: 502 },
          )
        }

        await seedYoutubeRealtimeSnapshot(video.id)
        results.push({ id: video.id, action: "reactivated" })
        continue
      }

      const { error: insertError } = await supabase.from("h2h_items").insert({
        type: "youtube_video",
        platform_id: video.id,
        title: video.title,
        cover_url: video.thumbnail ?? null,
        is_active: true,
      })

      if (insertError) {
        return NextResponse.json(
          { ok: false, error: insertError.message, step: "insert_item" },
          { status: 502 },
        )
      }

      await seedYoutubeRealtimeSnapshot(video.id)
      results.push({ id: video.id, action: "inserted" })
    }

    return NextResponse.json({
      ok: true,
      discovered: discovery.videos.length,
      changed: results.length,
      results,
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
