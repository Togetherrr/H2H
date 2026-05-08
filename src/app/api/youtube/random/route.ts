import { NextResponse } from "next/server"

type YouTubeSearchItem = {
  id?: { videoId?: string }
  snippet?: {
    title?: string
    thumbnails?: {
      medium?: { url?: string }
      high?: { url?: string }
      default?: { url?: string }
    }
  }
}

export const runtime = "nodejs"

type YouTubeVideosListItem = {
  id?: string
  contentDetails?: {
    duration?: string
  }
}

type YouTubeVideosListResponse = {
  items?: YouTubeVideosListItem[]
}

type CachedVideos = {
  items: YouTubeSearchItem[]
  eligibleItems?: YouTubeSearchItem[]
  fetchedAt: number
}

let cachedChannelId: string | null = null
let cachedVideos: CachedVideos | null = null
const CACHE_TTL_MS = 1000 * 60 * 10
const MIN_VIDEO_SECONDS = 60

function parseIso8601DurationSeconds(duration: string) {
  // Examples: PT59S, PT1M2S, PT1H3M4S
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(duration)
  if (!match) return null
  const hours = match[1] ? Number(match[1]) : 0
  const minutes = match[2] ? Number(match[2]) : 0
  const seconds = match[3] ? Number(match[3]) : 0
  if ([hours, minutes, seconds].some((n) => Number.isNaN(n))) return null
  return hours * 3600 + minutes * 60 + seconds
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number
) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

export async function GET() {
  const apiKey = process.env.H2H_YOUTUBE_API_KEY
  const channelId = process.env.H2H_YOUTUBE_CHANNEL_ID
  const channelHandle = process.env.H2H_YOUTUBE_CHANNEL_HANDLE || "hearts2hearts.official"
  const fallbackVideoId = process.env.H2H_YOUTUBE_FALLBACK_VIDEO_ID

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "missing_config",
        message: "Missing H2H_YOUTUBE_API_KEY.",
      },
      { status: 424 }
    )
  }

  let resolvedChannelId = channelId || cachedChannelId

  if (!resolvedChannelId) {
    const channelUrl = new URL("https://www.googleapis.com/youtube/v3/channels")
    channelUrl.searchParams.set("part", "id")
    channelUrl.searchParams.set("forHandle", channelHandle)
    channelUrl.searchParams.set("key", apiKey)

    let channelResponse: Response

    try {
      channelResponse = await fetchWithTimeout(channelUrl, { next: { revalidate: 300 } }, 8000)
    } catch {
      return NextResponse.json(
        {
          error: "timeout",
          message: "YouTube API handle lookup timed out.",
        },
        { status: 504 }
      )
    }

    if (!channelResponse.ok) {
      return NextResponse.json(
        {
          error: "upstream_error",
          message: "YouTube API handle lookup failed.",
        },
        { status: 502 }
      )
    }

    const channelData = (await channelResponse.json()) as { items?: { id?: string }[] }
    resolvedChannelId = channelData.items?.[0]?.id ?? null

    if (!resolvedChannelId) {
      return NextResponse.json(
        {
          error: "not_found",
          message: "No channel found for this handle.",
        },
        { status: 404 }
      )
    }

    cachedChannelId = resolvedChannelId
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/search")
  url.searchParams.set("part", "snippet")
  url.searchParams.set("channelId", resolvedChannelId)
  url.searchParams.set("maxResults", "25")
  url.searchParams.set("order", "date")
  url.searchParams.set("type", "video")
  url.searchParams.set("key", apiKey)

  const now = Date.now()
  let items: YouTubeSearchItem[] = []
  let cachedEligible: YouTubeSearchItem[] | undefined

  if (cachedVideos && now - cachedVideos.fetchedAt < CACHE_TTL_MS) {
    items = cachedVideos.items
    cachedEligible = cachedVideos.eligibleItems
  } else {
    try {
      const response = await fetchWithTimeout(url, { next: { revalidate: 300 } }, 8000)

      if (!response.ok) {
        return NextResponse.json(
          {
            error: "upstream_error",
            message: "YouTube API request failed.",
          },
          { status: 502 }
        )
      }

      const data = (await response.json()) as { items?: YouTubeSearchItem[] }
      items = (data.items ?? []).filter((item) => item.id?.videoId)
      cachedVideos = { items, fetchedAt: now }
    } catch {
      if (cachedVideos?.items.length) {
        items = cachedVideos.items
        cachedEligible = cachedVideos.eligibleItems
      } else if (fallbackVideoId) {
        return NextResponse.json({
          videoId: fallbackVideoId,
          title: "Hearts2Hearts",
          url: `https://www.youtube.com/watch?v=${fallbackVideoId}`,
          thumbnail: null,
        })
      } else {
        return NextResponse.json(
          {
            error: "timeout",
            message: "YouTube API request timed out.",
          },
          { status: 504 }
        )
      }
    }
  }

  if (items.length === 0) {
    return NextResponse.json(
      {
        error: "empty",
        message: "No videos found for this channel.",
      },
      { status: 404 }
    )
  }

  // Filter out Shorts / very short videos by checking duration.
  // Search API doesn't support a strict "> 60s" filter, so we call videos.list once for the batch.
  const videoIds = items.map((item) => item.id?.videoId).filter(Boolean) as string[]
  let eligibleItems = cachedEligible && cachedEligible.length ? cachedEligible : items

  if ((!cachedEligible || cachedEligible.length === 0) && videoIds.length) {
    try {
      const detailsUrl = new URL("https://www.googleapis.com/youtube/v3/videos")
      detailsUrl.searchParams.set("part", "contentDetails")
      detailsUrl.searchParams.set("id", videoIds.join(","))
      detailsUrl.searchParams.set("key", apiKey)

      const detailsResponse = await fetchWithTimeout(detailsUrl, { next: { revalidate: 300 } }, 8000)

      if (detailsResponse.ok) {
        const details = (await detailsResponse.json()) as YouTubeVideosListResponse
        const eligibleIds = new Set(
          (details.items ?? [])
            .map((it) => {
              const dur = it.contentDetails?.duration
              if (!it.id || !dur) return null
              const seconds = parseIso8601DurationSeconds(dur)
              if (seconds === null) return null
              return seconds > MIN_VIDEO_SECONDS ? it.id : null
            })
            .filter(Boolean) as string[]
        )
        const filtered = items.filter((item) => item.id?.videoId && eligibleIds.has(item.id.videoId))
        if (filtered.length > 0) {
          eligibleItems = filtered
          if (cachedVideos && cachedVideos.items === items) {
            cachedVideos.eligibleItems = filtered
          }
        }
      }
    } catch {
      // If duration lookup fails, fall back to the unfiltered list.
    }
  }

  if (eligibleItems.length === 0) {
    if (fallbackVideoId) {
      return NextResponse.json({
        videoId: fallbackVideoId,
        title: "Hearts2Hearts",
        url: `https://www.youtube.com/watch?v=${fallbackVideoId}`,
        thumbnail: null,
      })
    }
    return NextResponse.json(
      {
        error: "empty_filtered",
        message: `No videos longer than ${MIN_VIDEO_SECONDS}s found for this channel.`,
      },
      { status: 404 }
    )
  }

  const randomItem = eligibleItems[Math.floor(Math.random() * eligibleItems.length)]
  const videoId = randomItem.id?.videoId
  const title = randomItem.snippet?.title ?? "Hearts2Hearts"
  const thumbnail =
    randomItem.snippet?.thumbnails?.high?.url ??
    randomItem.snippet?.thumbnails?.medium?.url ??
    randomItem.snippet?.thumbnails?.default?.url ??
    null

  return NextResponse.json({
    videoId,
    title,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    thumbnail,
  })
}
