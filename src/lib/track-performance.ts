/**
 * track-performance.ts
 * Spotify  → Kworb
 * YouTube  → YouTube Data API v3 + Supabase snapshots for dailyChange
 */

import { createClient } from "@supabase/supabase-js"
import { fetchKworbSpotify } from "@/lib/realtime/kworb"
import { getSocialStatsSnapshotFromDb, mergeSocialStats, refreshSocialStatsSnapshot } from "@/lib/realtime/social-stats"

/* =========================================================
   TYPES
========================================================= */

export type PerformanceItem = {
  id: string
  title: string
  subtitle?: string
  imageUrl: string
  daily: number | null
  total: number | null
  dailyChange: number | null
  dailyChangeFormat?: "number" | "percent"
  href?: string
  meta?: string
}

export type PlatformPerformance = {
  name: "Spotify" | "YouTube"
  totalValue: number | null
  dailyValue: number | null
  dailyChange: number | null
  dailyChangeFormat?: "number" | "percent"
  highlights: any[]
  items: PerformanceItem[]
  note?: string
  viewAllHref?: string
  followers?: number | null
  monthlyListeners?: number | null
  subscribers?: number | null
  videoCount?: number | null
}

export type TrackPerformanceSnapshot = {
  updatedAt: string
  spotify: PlatformPerformance
  youtube: PlatformPerformance
  sources: {
    spotify?: string
    youtube?: string
    note?: string
  }
  isSample: boolean
}

/* =========================================================
   DEFAULTS
========================================================= */

const DEFAULT_SPOTIFY: PlatformPerformance = {
  name: "Spotify",
  totalValue: null,
  dailyValue: null,
  dailyChange: null,
  highlights: [],
  items: [],
  followers: null,
  monthlyListeners: null,
  note: "No realtime data available",
  viewAllHref: "/charts",
}

const DEFAULT_YOUTUBE: PlatformPerformance = {
  name: "YouTube",
  totalValue: null,
  dailyValue: null,
  dailyChange: null,
  highlights: [],
  items: [],
  subscribers: null,
  videoCount: null,
}

/* =========================================================
   SUPABASE CLIENT (server-side only)
========================================================= */

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.warn("SUPABASE: Missing env vars — snapshot tracking disabled")
    return null
  }

  return createClient(url, key)
}

/* =========================================================
   SNAPSHOT HELPERS
========================================================= */

type SnapshotRow = {
  video_id: string
  view_count: number
}

/**
 * Save current view counts to Supabase.
 * Called after every successful YouTube fetch.
 */
async function saveYouTubeSnapshot(items: PerformanceItem[]): Promise<void> {
  const supabase = getSupabaseClient()
  if (!supabase || items.length === 0) return

  const rows = items
    .filter((item) => item.total !== null)
    .map((item) => ({
      video_id: item.id,
      view_count: item.total as number,
      recorded_at: new Date().toISOString(),
    }))

  const { error } = await supabase.from("youtube_snapshots").insert(rows)

  if (error) {
    console.error("YOUTUBE SNAPSHOT: Failed to save", error.message)
  } else {
    console.log(`YOUTUBE SNAPSHOT: Saved ${rows.length} rows`)
  }
}

/**
 * Fetch the closest snapshot from ~24h ago (within a 4h window).
 * Returns a map of video_id → view_count.
 */
async function getYesterdaySnapshot(): Promise<Map<string, number>> {
  const supabase = getSupabaseClient()
  if (!supabase) return new Map()

  // Look for snapshots between 20h–28h ago to handle irregular cron timing
  const from = new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString()
  const to = new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from("youtube_snapshots")
    .select("video_id, view_count, recorded_at")
    .gte("recorded_at", from)
    .lte("recorded_at", to)
    .order("recorded_at", { ascending: false })

  if (error) {
    console.error("YOUTUBE SNAPSHOT: Failed to fetch yesterday", error.message)
    return new Map()
  }

  if (!data || data.length === 0) return new Map()

  // Keep only the most recent snapshot per video in that window
  const map = new Map<string, number>()
  for (const row of data as SnapshotRow[]) {
    if (!map.has(row.video_id)) {
      map.set(row.video_id, row.view_count)
    }
  }

  console.log(`YOUTUBE SNAPSHOT: Found yesterday data for ${map.size} videos`)
  return map
}

/* =========================================================
   YOUTUBE FETCH
========================================================= */

const YOUTUBE_CACHE_TTL_MS = 5 * 60 * 1000
const isDebug = process.env.NODE_ENV !== "production"
const logDebug = (...args: unknown[]) => { if (isDebug) console.log(...args) }

let youtubeCache: { fetchedAt: number; data: PlatformPerformance } | null = null

export function invalidateTrackPerformanceCache() {
  youtubeCache = null
}

async function fetchJsonWithTimeout(url: string, timeoutMs: number) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}
console.log("FETCH YOUTUBE CALLED")
export async function fetchYouTubeVideos(): Promise<PlatformPerformance | null> {

  if (youtubeCache && Date.now() - youtubeCache.fetchedAt < YOUTUBE_CACHE_TTL_MS) {
    return youtubeCache.data
  }

  const apiKey = process.env.H2H_YOUTUBE_API_KEY

  if (!apiKey) {
    console.warn("YOUTUBE: Missing H2H_YOUTUBE_API_KEY")
    return youtubeCache?.data ?? null
  }
  const supabase = getSupabaseClient()

  if (!supabase) {
    console.warn("YOUTUBE: Supabase unavailable")
    return youtubeCache?.data ?? null
  }
  const { data: youtubeItems, error } = await supabase
    .from("h2h_items")
    .select("platform_id")
    .eq("type", "youtube_video")
    .eq("is_active", true)

  if (error) {
    console.error("YOUTUBE: Failed to load active videos", error)
    return youtubeCache?.data ?? null
  }

  const videoIds = (youtubeItems ?? [])
    .map((item) => item.platform_id)
    .filter(Boolean)
  if (videoIds.length === 0) {
    console.warn("YOUTUBE: No active videos configured")
    return youtubeCache?.data ?? null
  }
  type YouTubeVideoRow = {
    id?: string
    snippet?: {
      title?: string
      thumbnails?: {
        high?: { url?: string }
        medium?: { url?: string }
        default?: { url?: string }
      }
    }
    statistics?: { viewCount?: string }
  }

  const allRows: YouTubeVideoRow[] = []

  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50)
    const url = new URL("https://www.googleapis.com/youtube/v3/videos")
    url.searchParams.set("part", "snippet,statistics")
    url.searchParams.set("id", chunk.join(","))
    url.searchParams.set("key", apiKey)

    const payload = await fetchJsonWithTimeout(url.toString(), 8000)
    if (!payload) return youtubeCache?.data ?? null

    allRows.push(...((payload?.items ?? []) as YouTubeVideoRow[]))
    console.log(
      "YOUTUBE API RETURNED",
      payload?.items?.map((v: any) => ({
        id: v.id,
        title: v.snippet?.title,
      }))
    )
  }

  if (allRows.length === 0) return youtubeCache?.data ?? null

  // Build items from YouTube API (daily still null at this point)
  const rawItems: PerformanceItem[] = allRows
    .map((row) => {
      const id = row.id
      const totalRaw = row.statistics?.viewCount ?? null
      const total = totalRaw ? Number(totalRaw) : null

      if (!id || total === null || Number.isNaN(total)) return null

      const imageUrl =
        row.snippet?.thumbnails?.high?.url ??
        row.snippet?.thumbnails?.medium?.url ??
        row.snippet?.thumbnails?.default?.url ??
        "/group.png"

      return {
        id,
        title: row.snippet?.title ?? "",
        subtitle: "Official MV",
        imageUrl,
        daily: 0,
        total,
        dailyChange: 0,
        href: `https://www.youtube.com/watch?v=${id}`,
        meta: id,
      } satisfies PerformanceItem
    })
    .filter(Boolean) as PerformanceItem[]

  if (rawItems.length === 0) return youtubeCache?.data ?? null

  // ── Fetch yesterday snapshot + compute daily & dailyChange ──────────────
  const [yesterdayMap] = await Promise.all([
    getYesterdaySnapshot(),
    saveYouTubeSnapshot(rawItems), // fire-and-forget (save current)
  ])
  const items: PerformanceItem[] = rawItems.map((item) => {
    const yesterday = yesterdayMap.get(item.id) ?? null

    let daily: number | null = null

    if (yesterday !== null && item.total !== null) {
      daily = item.total - yesterday
    }
    return {
      ...item,
      daily,
      dailyChange: daily ?? 0,
    }
  })
  // Sort by total views desc
  items.sort((a, b) => (b.total ?? 0) - (a.total ?? 0))

  const totalValue = items.reduce((sum, item) => sum + (item.total ?? 0), 0)
  const dailyValue = items.reduce((sum, item) => sum + (item.daily ?? 0), 0)

  // Overall dailyChange = sum of all daily gains
  const dailyChange = yesterdayMap.size > 0 ? dailyValue : 0

  const payload: PlatformPerformance = {
    name: "YouTube",
    totalValue,
    dailyValue: dailyValue > 0 ? dailyValue : 0,
    dailyChange,
    highlights: [],
    items,
    note: "YouTube API + Supabase snapshots",
  }

  youtubeCache = { fetchedAt: Date.now(), data: payload }

  logDebug("YOUTUBE: cached", payload.items.length, "items | dailyChange:", payload.dailyChange)

  return payload
}

/* =========================================================
   PLACEHOLDER
========================================================= */

export function getTrackPerformancePlaceholderSnapshot(): TrackPerformanceSnapshot {
  return {
    updatedAt: "",
    spotify: DEFAULT_SPOTIFY,
    youtube: DEFAULT_YOUTUBE,
    sources: { note: "Loading realtime stats..." },
    isSample: true,
  }
}

/* =========================================================
   MAIN SNAPSHOT
========================================================= */

export async function getTrackPerformanceSnapshot(options?: { liveSocialStats?: boolean }): Promise<TrackPerformanceSnapshot> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return getTrackPerformancePlaceholderSnapshot()
  }

  const useLiveSocialStats = options?.liveSocialStats ?? false

  const [spotify, youtube, socialStats] = await Promise.all([
    fetchKworbSpotify(),
    fetchYouTubeVideos(),
    useLiveSocialStats ? refreshSocialStatsSnapshot() : getSocialStatsSnapshotFromDb(),
  ])

  const spotifyWithSocialStats = mergeSocialStats(spotify ?? DEFAULT_SPOTIFY, socialStats?.spotify)
  const youtubeWithSocialStats = mergeSocialStats(youtube ?? DEFAULT_YOUTUBE, socialStats?.youtube)

  return {
    updatedAt: new Date().toISOString(),
    spotify: spotifyWithSocialStats,
    youtube: youtubeWithSocialStats,
    sources: {
      spotify: spotify ? "Kworb" : "No data",
      youtube: youtube ? "YouTube API + Supabase snapshots" : "No data",
    },
    isSample: false,
  }
}
