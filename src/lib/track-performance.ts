/**
 * track-performance.ts
 * Spotify metrics come from Kworb.
 * YouTube metrics now also come from Kworb, with YouTube API as metadata fallback.
 */

import { fetchKworbSpotify } from "@/lib/realtime/kworb"
import { fetchKworbYoutubeStats } from "@/lib/realtime/kworb-youtube"
import { computeRolling24h, getKstDayStart, type RealtimeItem, type RealtimeSnapshot } from "@/lib/realtime/rolling24h"
import { createStaticClient } from "@/lib/supabase/static"

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

const YOUTUBE_CACHE_TTL_MS = 5 * 60 * 1000
const isDebug = process.env.NODE_ENV !== "production"
const logDebug = (...args: unknown[]) => {
  if (isDebug) {
    console.log(...args)
  }
}

let youtubeCache:
  | {
      fetchedAt: number
      data: PlatformPerformance
    }
  | null = null

export function invalidateTrackPerformanceCache() {
  youtubeCache = null
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
   YOUTUBE
========================================================= */

async function fetchJsonWithTimeout(url: string, timeoutMs: number) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
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

async function fetchYouTubeMetadata(videoIds: string[], apiKey: string) {
  if (!apiKey) return new Map<string, YouTubeVideoRow>()

  const rows: YouTubeVideoRow[] = []
  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50)
    const url = new URL("https://www.googleapis.com/youtube/v3/videos")
    url.searchParams.set("part", "snippet,statistics")
    url.searchParams.set("id", chunk.join(","))
    url.searchParams.set("key", apiKey)

    const payload = await fetchJsonWithTimeout(url.toString(), 8000)
    if (!payload) return null

    const chunkRows = (payload?.items ?? []) as YouTubeVideoRow[]
    rows.push(...chunkRows)
  }

  const map = new Map<string, YouTubeVideoRow>()
  for (const row of rows) {
    if (row.id) map.set(row.id, row)
  }
  return map
}

async function fetchTrackedYouTubeVideoIds() {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from("h2h_items")
    .select("platform_id")
    .eq("type", "youtube_video")
    .eq("is_active", true)
    .limit(100)

  return (data ?? [])
    .map((row) => row.platform_id)
    .filter((value): value is string => typeof value === "string" && value.length > 0)
}

export async function fetchYouTubeVideos(): Promise<PlatformPerformance | null> {
  if (youtubeCache && Date.now() - youtubeCache.fetchedAt < YOUTUBE_CACHE_TTL_MS) {
    return youtubeCache.data
  }

  const apiKey = process.env.H2H_YOUTUBE_API_KEY?.trim() ?? ""
  const trackedVideoIds = await fetchTrackedYouTubeVideoIds()
  const envVideoIds = (process.env.H2H_YOUTUBE_VIDEO_IDS?.trim() ?? "")
    .split(/[,\s]+/g)
    .map((s) => s.trim())
    .filter(Boolean)
  const videoIds = Array.from(new Set([...trackedVideoIds, ...envVideoIds]))

  if (videoIds.length === 0) {
    console.warn("YOUTUBE: Missing tracked YouTube items and H2H_YOUTUBE_VIDEO_IDS")
    return youtubeCache?.data ?? null
  }

  const [metadataMap, kworbStats] = await Promise.all([
    fetchYouTubeMetadata(videoIds, apiKey),
    fetchKworbYoutubeStats(videoIds),
  ])

  if ((!metadataMap || metadataMap.size === 0) && kworbStats.size === 0) {
    return youtubeCache?.data ?? null
  }

  const supabase = createStaticClient()
  const { data: dbItems } = await supabase
    .from("h2h_items")
    .select("id,type,platform_id,title,cover_url,release_date,is_active,source_updated_at")
    .eq("type", "youtube_video")
    .eq("is_active", true)
    .in("platform_id", videoIds)
    .limit(100)

  const dbTypedItems = (dbItems ?? []) as unknown as RealtimeItem[]
  const now = new Date()
  const oldestIso = new Date(
    getKstDayStart(now).getTime() - 14 * 24 * 60 * 60_000,
  ).toISOString()

  const itemIds = dbTypedItems.map((item) => item.id)
  let dbSnapshots: RealtimeSnapshot[] = []
  if (itemIds.length > 0) {
    const { data } = await supabase
      .from("h2h_item_snapshots")
      .select("item_id,ts,total,daily_kworb")
      .in("item_id", itemIds)
      .gte("ts", oldestIso)
      .order("ts", { ascending: false })
      .limit(5000)

    dbSnapshots = (data ?? []) as unknown as RealtimeSnapshot[]
  }

  const computed = computeRolling24h(
    dbTypedItems,
    dbSnapshots,
    now,
  )

  const computedByPlatformId = new Map(
    computed.rows.map((row) => [row.item.platform_id, row]),
  )

  const items: PerformanceItem[] = videoIds
    .map((id) => {
      const metadata = metadataMap?.get(id)
      const kworb = kworbStats.get(id) ?? null
      const computedRow = computedByPlatformId.get(id)
      const apiTotalRaw = metadata?.statistics?.viewCount ?? null
      const apiTotal = apiTotalRaw ? Number(apiTotalRaw) : null
      const total = kworb?.total ?? apiTotal

      if (total === null || Number.isNaN(total)) return null

      const title = metadata?.snippet?.title ?? id
      const imageUrl =
        metadata?.snippet?.thumbnails?.high?.url ??
        metadata?.snippet?.thumbnails?.medium?.url ??
        metadata?.snippet?.thumbnails?.default?.url ??
        "/group.png"

      return {
        id,
        title,
        subtitle: "Official MV",
        imageUrl,
        daily: kworb?.dailyKworb ?? computedRow?.delta24h ?? null,
        total,
        dailyChange: computedRow?.delta24hChange ?? null,
        href: `https://www.youtube.com/watch?v=${id}`,
        meta: id,
      } satisfies PerformanceItem
    })
    .filter(Boolean) as PerformanceItem[]

  if (items.length === 0) return youtubeCache?.data ?? null

  const payload: PlatformPerformance = {
    name: "YouTube",
    totalValue: items.reduce((sum, item) => sum + (item.total || 0), 0),
    dailyValue: items.reduce((sum, item) => sum + (item.daily || 0), 0),
    dailyChange: computed.delta24hChange,
    highlights: [],
    items,
    note: apiKey ? "Kworb + YouTube API metadata" : "Kworb",
  }

  youtubeCache = {
    fetchedAt: Date.now(),
    data: payload,
  }

  logDebug("YOUTUBE: cached", payload.items.length, "items")

  return payload
}

/* =========================================================
   MAIN SNAPSHOT
========================================================= */

export async function getTrackPerformanceSnapshot(): Promise<TrackPerformanceSnapshot> {
  const [spotify, youtube] = await Promise.all([
    fetchKworbSpotify(),
    fetchYouTubeVideos(),
  ])

  return {
    updatedAt: new Date().toISOString(),
    spotify: spotify ?? DEFAULT_SPOTIFY,
    youtube: youtube ?? DEFAULT_YOUTUBE,
    sources: {
      spotify: spotify ? "Kworb" : "No data",
      youtube: youtube ? "Kworb" : "No data",
    },
    isSample: false,
  }
}
