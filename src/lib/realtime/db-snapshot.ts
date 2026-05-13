import { createClient } from "@/lib/supabase/server"
import { computeRolling24h, getKstDayStart, type RealtimeItem, type RealtimeSnapshot } from "@/lib/realtime/rolling24h"
import type { PerformanceItem, PlatformPerformance, TrackPerformanceSnapshot } from "@/lib/track-performance"

type RealtimeType = "spotify_track" | "youtube_video"

const EMPTY_PLATFORM = (name: PlatformPerformance["name"]): PlatformPerformance => ({
  name,
  totalValue: null,
  dailyValue: null,
  dailyChange: null,
  highlights: [],
  items: [],
})
function buildPlatformPerformance(
  name: PlatformPerformance["name"],
  type: RealtimeType,
  items: RealtimeItem[],
  snapshots: RealtimeSnapshot[],
  now: Date,
): { platform: PlatformPerformance; updatedAt: string | null } {
  if (items.length === 0) {
    return { platform: EMPTY_PLATFORM(name), updatedAt: null }
  }

  const computed = computeRolling24h(items, snapshots, now)

  // ✅ FIX: Lấy source_updated_at mới nhất từ items
  const sourceUpdatedAt =
    items
      .map((i) => i.source_updated_at)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null

  function formatReleaseDate(releaseDate: string | null) {
    if (!releaseDate) return null
    const parsed = new Date(releaseDate)
    if (Number.isNaN(parsed.getTime())) return null
    const year = parsed.getFullYear()
    const month = String(parsed.getMonth() + 1).padStart(2, "0")
    const day = String(parsed.getDate()).padStart(2, "0")
    return `${year}.${month}.${day}`
  }

  const performanceItems: PerformanceItem[] = computed.rows.map((row) => {
    const platformId = row.item.platform_id
    const href =
      type === "spotify_track"
        ? `https://open.spotify.com/track/${platformId}`
        : `https://www.youtube.com/watch?v=${platformId}`
    const formattedDate = formatReleaseDate(row.item.release_date)
    const subtitle =
      type === "spotify_track"
        ? formattedDate
          ? `Hearts2Hearts • ${formattedDate}`
          : "Hearts2Hearts"
        : formattedDate
          ? `Official MV • ${formattedDate}`
          : "Official MV"

    return {
      id: platformId,
      title: row.item.title ?? "",
      imageUrl: row.item.cover_url ?? "/group.png",
      subtitle,
      daily: row.delta24h,
      total: row.total,
      dailyChange: row.delta24hChange,
      dailyChangeFormat: row.delta24hChange !== null ? "number" : undefined,
      href,
      note: "Supabase snapshots",
      meta: platformId,
    }
  })

  const platform: PlatformPerformance = {
    name,
    totalValue: computed.total,
    dailyValue: computed.delta24h,
    dailyChange: computed.delta24hChange,
    highlights: [],
    items: performanceItems,
    note: sourceUpdatedAt
      ? `Kworb • Updated ${sourceUpdatedAt}`
      : "Supabase snapshots",
    viewAllHref: "/charts",
  }

  return { platform, updatedAt: computed.updatedAt }
}
export async function getRealtimeSnapshotFromDb(): Promise<TrackPerformanceSnapshot> {
  const supabase = await createClient()
  const { data: items, error: itemsError } = await supabase
    .from("h2h_items")
    .select("id,type,platform_id,title,cover_url,release_date,is_active,source_updated_at")
    .eq("is_active", true)
    .order("release_date", { ascending: false })

  if (itemsError) {
    return {
      updatedAt: "",
      spotify: EMPTY_PLATFORM("Spotify"),
      youtube: EMPTY_PLATFORM("YouTube"),
      sources: {
        spotify: "Supabase snapshots",
        youtube: "Supabase snapshots",
        note: itemsError.message,
      },
      isSample: false,
    }
  }

  const typedItems = (items ?? []) as unknown as RealtimeItem[]
  const now = new Date()
  const kstDayStart = getKstDayStart(now)
  const oldestMs = kstDayStart.getTime() - 25 * 60 * 60_000
  const oldestIso = new Date(oldestMs).toISOString()

  let snapshots: RealtimeSnapshot[] = []
  if (typedItems.length > 0) {
    const itemIds = typedItems.map((item) => item.id)
    const { data: snapshotRows } = await supabase
      .from("h2h_item_snapshots")
      .select("item_id,ts,total,daily_kworb")
      .in("item_id", itemIds)
      .gte("ts", oldestIso)
      .order("ts", { ascending: false })

    snapshots = (snapshotRows ?? []) as unknown as RealtimeSnapshot[]
  }

  const spotifyItems = typedItems.filter((item) => item.type === "spotify_track")
  const youtubeItems = typedItems.filter((item) => item.type === "youtube_video")
  const spotifyIds = new Set(spotifyItems.map((item) => item.id))
  const youtubeIds = new Set(youtubeItems.map((item) => item.id))

  const kworkUpdatedAt =
    spotifyItems
      .map((i) => i.source_updated_at)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null
  const { platform: spotify, updatedAt: spotifyUpdatedAt } = buildPlatformPerformance(
    "Spotify",
    "spotify_track",
    spotifyItems,
    snapshots.filter((row) => spotifyIds.has(row.item_id)),
    now,
  )

  const { platform: youtube, updatedAt: youtubeUpdatedAt } = buildPlatformPerformance(
    "YouTube",
    "youtube_video",
    youtubeItems,
    snapshots.filter((row) => youtubeIds.has(row.item_id)),
    now,
  )

  const updatedAtCandidates = [spotifyUpdatedAt, youtubeUpdatedAt].filter(Boolean) as string[]
  const updatedAt = updatedAtCandidates.sort().at(-1) ?? ""

  return {
    updatedAt,
    spotify,
    youtube,
    sources: {
      spotify: "Supabase snapshots",
      youtube: "Supabase snapshots",
      note: kworkUpdatedAt ? `Kworb • Updated ${kworkUpdatedAt}` : undefined,
    },
    isSample: false,
  }
}
