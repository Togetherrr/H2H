/**
 * track-performance.ts
 * Spotify now loads from Kworb
 * YouTube stays on YouTube Data API v3
 */

import { fetchKworbSpotify } from "@/lib/realtime/kworb"
import { getSocialStatsSnapshotFromDb, mergeSocialStats } from "@/lib/realtime/social-stats"

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

/* =========================================================
   PLACEHOLDER (dùng khi chưa load xong)
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
   YOUTUBE — kept as-is, only env vars needed:
   H2H_YOUTUBE_API_KEY=...
   H2H_YOUTUBE_VIDEO_IDS=id1,id2,id3,...
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

export async function fetchYouTubeVideos(): Promise<PlatformPerformance | null> {
  if (youtubeCache && Date.now() - youtubeCache.fetchedAt < YOUTUBE_CACHE_TTL_MS) {
    return youtubeCache.data
  }

  const apiKey = process.env.H2H_YOUTUBE_API_KEY
  const rawVideoIds = process.env.H2H_YOUTUBE_VIDEO_IDS

  if (!apiKey || !rawVideoIds) {
    console.warn("YOUTUBE: Missing H2H_YOUTUBE_API_KEY or H2H_YOUTUBE_VIDEO_IDS")
    return youtubeCache?.data ?? null
  }

  const videoIds = rawVideoIds
    .split(/[,\s]+/g)
    .map((s) => s.trim())
    .filter(Boolean)

  if (videoIds.length === 0) return null

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
    if (!payload) {
      return youtubeCache?.data ?? null
    }
    const rows = (payload?.items ?? []) as YouTubeVideoRow[]
    allRows.push(...rows)
  }

  if (allRows.length === 0) return youtubeCache?.data ?? null

  const items: PerformanceItem[] = allRows
    .map((row) => {
      const id = row.id
      if (!id) return null

      const totalRaw = row.statistics?.viewCount ?? null
      const total = totalRaw ? Number(totalRaw) : null
      if (total === null || Number.isNaN(total)) return null

      const title = row.snippet?.title ?? ""
      const imageUrl =
        row.snippet?.thumbnails?.high?.url ??
        row.snippet?.thumbnails?.medium?.url ??
        row.snippet?.thumbnails?.default?.url ??
        "/group.png"

      return {
        id,
        title,
        subtitle: "Official MV",
        imageUrl,
        daily: null, // YouTube API does not return daily — computed from DB snapshots
        total,
        dailyChange: null,
        href: `https://www.youtube.com/watch?v=${id}`,
        meta: id,
      } satisfies PerformanceItem
    })
    .filter(Boolean) as PerformanceItem[]

  if (items.length === 0) return youtubeCache?.data ?? null

  const payload: PlatformPerformance = {
    name: "YouTube",
    totalValue: items.reduce((sum, item) => sum + (item.total || 0), 0),
    dailyValue: null,
    dailyChange: null,
    highlights: [],
    items,
    note: "YouTube API",
  }

  youtubeCache = {
    fetchedAt: Date.now(),
    data: payload,
  }

  logDebug("YOUTUBE: cached", payload.items.length, "items")

  return payload
}

/* =========================================================
   MAIN SNAPSHOT — calls Kworb + YouTube in parallel
========================================================= */

export async function getTrackPerformanceSnapshot(): Promise<TrackPerformanceSnapshot> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return getTrackPerformancePlaceholderSnapshot()
  }

  const [spotify, youtube, socialStats] = await Promise.all([
    fetchKworbSpotify(),   // ← Spotify snapshot from Kworb
    fetchYouTubeVideos(),  // ← YouTube Data API v3
    getSocialStatsSnapshotFromDb(),
  ])

  const spotifyWithSocialStats = mergeSocialStats(spotify ?? DEFAULT_SPOTIFY, socialStats?.spotify)
  const youtubeWithSocialStats = mergeSocialStats(youtube ?? DEFAULT_YOUTUBE, socialStats?.youtube)

  return {
    updatedAt: new Date().toISOString(),
    spotify: spotifyWithSocialStats,
    youtube: youtubeWithSocialStats,
    sources: {
      spotify: spotify ? "Kworb" : "No data",
      youtube: youtube ? "Hearts2Hearts official channel · YouTube API" : "No data",
    },
    isSample: false,
  }
}
