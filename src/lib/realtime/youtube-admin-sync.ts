import { createServiceClient } from "@/lib/supabase/service"
import { fetchKworbYoutubeDaily } from "@/lib/realtime/kworb-youtube"
import { floorToMinutes } from "@/lib/realtime/utils"

type YoutubeVideoStats = {
  total: number
  title: string | null
  coverUrl: string | null
}

async function fetchYoutubeVideoStats(videoId: string): Promise<YoutubeVideoStats | null> {
  const apiKey = process.env.H2H_YOUTUBE_API_KEY?.trim()
  if (!apiKey) {
    console.warn("YOUTUBE ADMIN SYNC: Missing H2H_YOUTUBE_API_KEY")
    return null
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/videos")
  url.searchParams.set("part", "snippet,statistics")
  url.searchParams.set("id", videoId)
  url.searchParams.set("key", apiKey)

  try {
    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    })

    if (!response.ok) {
      console.warn(`YOUTUBE ADMIN SYNC [${videoId}]: HTTP ${response.status}`)
      return null
    }

    const payload = await response.json()
    const row = payload?.items?.[0]
    const totalRaw = row?.statistics?.viewCount ?? null
    const total = totalRaw ? Number(totalRaw) : null

    if (!row?.id || total === null || Number.isNaN(total)) {
      console.warn(`YOUTUBE ADMIN SYNC [${videoId}]: missing viewCount`)
      return null
    }

    const coverUrl =
      row.snippet?.thumbnails?.high?.url ??
      row.snippet?.thumbnails?.medium?.url ??
      row.snippet?.thumbnails?.default?.url ??
      null

    return {
      total,
      title: row.snippet?.title ?? null,
      coverUrl,
    }
  } catch (err: any) {
    console.warn(`YOUTUBE ADMIN SYNC [${videoId}]: error`, err?.message)
    return null
  }
}

export async function seedYoutubeRealtimeSnapshot(videoId: string) {
  const supabase = createServiceClient()
  const bucketTs = floorToMinutes(new Date(), 5).toISOString()

  const [itemResult, statsResult, dailyMap] = await Promise.all([
    supabase
      .from("h2h_items")
      .select("id")
      .eq("type", "youtube_video")
      .eq("platform_id", videoId)
      .maybeSingle(),
    fetchYoutubeVideoStats(videoId),
    fetchKworbYoutubeDaily([videoId]),
  ])

  if (itemResult.error) {
    return { error: itemResult.error.message }
  }

  const item = itemResult.data
  if (!item) {
    return { error: "YouTube item not found for snapshot seeding" }
  }

  if (!statsResult) {
    return { error: "Unable to fetch YouTube live stats" }
  }

  const dailyKworb = dailyMap.get(videoId) ?? null

  const { error } = await supabase.from("h2h_item_snapshots").upsert(
    {
      item_id: item.id,
      ts: bucketTs,
      total: statsResult.total,
      daily_kworb: dailyKworb,
    },
    { onConflict: "item_id,ts" },
  )

  if (error) {
    return { error: error.message }
  }

  return {
    success: true,
    bucketTs,
    total: statsResult.total,
    dailyKworb,
    title: statsResult.title,
    coverUrl: statsResult.coverUrl,
  }
}
