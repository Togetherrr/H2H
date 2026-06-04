import { createServiceClient } from "@/lib/supabase/service"
import { fetchKworbYoutubeStats } from "@/lib/realtime/kworb-youtube"
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

  const [itemResult, statsResult, kworbStatsMap] = await Promise.all([
    supabase
      .from("h2h_items")
      .select("id")
      .eq("type", "youtube_video")
      .eq("platform_id", videoId)
      .maybeSingle(),
    fetchYoutubeVideoStats(videoId),
    fetchKworbYoutubeStats([videoId]),
  ])

  if (itemResult.error) {
    return { error: itemResult.error.message }
  }

  const item = itemResult.data
  if (!item) {
    return { error: "YouTube item not found for snapshot seeding" }
  }

  if (!statsResult && !kworbStatsMap.get(videoId)) {
    return { error: "Unable to fetch YouTube live stats" }
  }

  const kworbStats = kworbStatsMap.get(videoId) ?? null
  const total = kworbStats?.total ?? statsResult?.total ?? null
  let dailyKworb = kworbStats?.dailyKworb ?? null

  if (total === null) {
    return { error: "Unable to resolve YouTube total views" }
  }

  if (dailyKworb == null) {
    const { data: previousSnapshot, error: previousSnapshotError } = await supabase
      .from("h2h_item_snapshots")
      .select("total")
      .eq("item_id", item.id)
      .lt("ts", bucketTs)
      .order("ts", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (previousSnapshotError) {
      return { error: previousSnapshotError.message }
    }

    if (previousSnapshot?.total != null) {
      const computed = total - Number(previousSnapshot.total)
      dailyKworb = computed > 0 ? computed : 0
    }
  }

  const { error } = await supabase.from("h2h_item_snapshots").upsert(
    {
      item_id: item.id,
      ts: bucketTs,
      total,
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
    total,
    dailyKworb,
    title: statsResult?.title ?? null,
    coverUrl: statsResult?.coverUrl ?? null,
  }
}
