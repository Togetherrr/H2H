import { createServiceClient } from "@/lib/supabase/service"
import { createStaticClient } from "@/lib/supabase/static"
import type { PlatformPerformance } from "@/lib/track-performance"

export type SocialPlatformStats = {
  followers?: number | null
  monthlyListeners?: number | null
  subscribers?: number | null
  videoCount?: number | null
}

export type SocialStatsSnapshot = {
  spotify: SocialPlatformStats
  youtube: SocialPlatformStats
  sources: {
    spotify?: string
    youtube?: string
  }
  updatedAt: string
}

export type SpotifyDebugSnapshot = {
  artistId: string
  artistName: string
  source: string
  url: string
  page: {
    ok: boolean
    status: number | null
    monthlyListenersRaw: string | null
    followersRaw: string | null
    monthlyListeners: number | null
    followers: number | null
    snippet: string | null
    message: string | null
  }
  fallback: {
    manualFollowers: number | null
    kworbMonthlyListeners: number | null
    note: string | null
  }
  stats: SocialPlatformStats
}

type LiveSocialStatsSnapshot = Omit<SocialStatsSnapshot, "updatedAt">

const READ_CACHE_TTL_MS = 60_000
const LIVE_CACHE_TTL_MS = 5 * 60 * 1000
const DEFAULT_SPOTIFY_ARTIST_ID = process.env.H2H_SPOTIFY_ARTIST_ID || "1ZLU77nRzQIaP23mVSYpCQ"
const DEFAULT_SPOTIFY_ARTIST_NAME = process.env.H2H_SPOTIFY_ARTIST_NAME || "Hearts2Hearts"
const DEFAULT_SPOTIFY_FOLLOWERS = process.env.H2H_SPOTIFY_FOLLOWERS ?? null
const DEFAULT_YOUTUBE_CHANNEL_HANDLE = process.env.H2H_YOUTUBE_CHANNEL_HANDLE || "hearts2hearts.official"

const isDebug = process.env.NODE_ENV !== "production"
const logDebug = (...args: unknown[]) => {
  if (isDebug) {
    console.log(...args)
  }
}

let readCache:
  | {
    fetchedAt: number
    data: SocialStatsSnapshot | null
  }
  | null = null

let liveCache:
  | {
    fetchedAt: number
    data: LiveSocialStatsSnapshot
  }
  | null = null

function isValidNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

async function fetchJson<T>(url: string, init?: RequestInit, timeoutMs = 8000): Promise<T | null> {
  try {
    const response = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

function slugifyArtistName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "-")
}

function parseCompactCount(value: string | null | undefined) {
  if (!value) return null

  const normalized = value.replace(/,/g, "").trim().toLowerCase()
  const match = normalized.match(/^([\d.]+)\s*(k|m|million)?$/)
  if (!match) {
    const digitsOnly = Number(normalized.replace(/[^\d]/g, ""))
    return Number.isFinite(digitsOnly) ? digitsOnly : null
  }

  const amount = Number(match[1])
  if (!Number.isFinite(amount)) return null

  const suffix = match[2]
  if (!suffix) return Math.round(amount)
  if (suffix === "k") return Math.round(amount * 1_000)
  return Math.round(amount * 1_000_000)
}

function readManualFollowers() {
  return parseCompactCount(DEFAULT_SPOTIFY_FOLLOWERS)
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

async function fetchMusicMetricsVaultArtistStats(artistId: string, artistName = DEFAULT_SPOTIFY_ARTIST_NAME) {
  const slug = slugifyArtistName(artistName)
  const url = `https://www.musicmetricsvault.com/artists/${slug}/${artistId}`

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    })

    const html = response.ok ? await response.text().catch(() => null) : null
    const normalized = html?.replace(/\u00a0/g, " ") ?? null
    const compact = normalized?.replace(/\s+/g, " ") ?? null
    const metaStatsMatch = html?.match(
      /content="[^"]*?([\d.,]+\s*(?:million|k|m)?)\s+monthly listeners[^"]*?([\d.,]+\s*(?:million|k|m)?)\s+followers/i,
    )
    const monthlyListenersMatch = metaStatsMatch?.[1]
      ? [metaStatsMatch[1]]
      : compact?.match(/Monthly Listeners\s*([\d.,]+\s*(?:million|k|m)?)/i) ?? null
    const followersMatch = metaStatsMatch?.[2]
      ? [metaStatsMatch[2]]
      : compact?.match(/Followers\s*([\d.,]+\s*(?:million|k|m)?)/i) ?? null

    return {
      ok: response.ok,
      status: response.status,
      url,
      monthlyListenersRaw: monthlyListenersMatch?.[0] ?? null,
      followersRaw: followersMatch?.[0] ?? null,
      monthlyListeners: parseCompactCount(monthlyListenersMatch?.[0]),
      followers: parseCompactCount(followersMatch?.[0]),
      snippet: compact?.slice(0, 600) ?? null,
      message: response.ok ? "Music Metrics Vault page fetched" : "Music Metrics Vault request failed",
    }
  } catch {
    return {
      ok: false,
      status: null,
      url,
      monthlyListenersRaw: null,
      followersRaw: null,
      monthlyListeners: null,
      followers: null,
      snippet: null,
      message: "Music Metrics Vault request threw an error.",
    }
  }
}

async function fetchKworbMonthlyListeners(artistName = DEFAULT_SPOTIFY_ARTIST_NAME) {
  try {
    const response = await fetch("https://kworb.net/spotify/listeners.html", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    })

    const html = response.ok ? await response.text().catch(() => null) : null
    const compact = html?.replace(/\s+/g, " ") ?? null
    const pattern = new RegExp(`${escapeRegExp(artistName)}\\s*\\|\\s*([\\d,]+)`, "i")
    const match = compact?.match(pattern)

    return {
      ok: response.ok,
      status: response.status,
      monthlyListeners: match?.[1] ? Number(match[1].replace(/,/g, "")) : null,
      snippet: compact?.slice(0, 500) ?? null,
    }
  } catch {
    return {
      ok: false,
      status: null,
      monthlyListeners: null,
      snippet: null,
    }
  }
}

async function fetchSpotifyLiveStats(artistId: string, artistName = DEFAULT_SPOTIFY_ARTIST_NAME): Promise<SocialPlatformStats> {
  const [mmv, kworb] = await Promise.all([
    fetchMusicMetricsVaultArtistStats(artistId, artistName),
    fetchKworbMonthlyListeners(artistName),
  ])
  const manualFollowers = readManualFollowers()

  return {
    followers: mmv.followers ?? manualFollowers,
    monthlyListeners: mmv.monthlyListeners ?? kworb.monthlyListeners ?? null,
  }
}

export async function inspectSpotifyLiveStats(artistId = DEFAULT_SPOTIFY_ARTIST_ID): Promise<SpotifyDebugSnapshot> {
  const artistName = DEFAULT_SPOTIFY_ARTIST_NAME
  const [mmv, kworb] = await Promise.all([
    fetchMusicMetricsVaultArtistStats(artistId, artistName),
    fetchKworbMonthlyListeners(artistName),
  ])
  const manualFollowers = readManualFollowers()
  const followers = mmv.followers ?? manualFollowers
  const monthlyListeners = mmv.monthlyListeners ?? kworb.monthlyListeners ?? null

  return {
    artistId,
    artistName,
    source: "Music Metrics Vault + KWORB fallback",
    url: mmv.url,
    page: {
      ok: mmv.ok,
      status: mmv.status,
      monthlyListenersRaw: mmv.monthlyListenersRaw,
      followersRaw: mmv.followersRaw,
      monthlyListeners,
      followers,
      snippet: mmv.snippet,
      message: mmv.message,
    },
    fallback: {
      manualFollowers,
      kworbMonthlyListeners: kworb.monthlyListeners,
      note:
        mmv.followers == null && manualFollowers != null
          ? "Using manual Spotify followers fallback."
          : mmv.monthlyListeners == null && kworb.monthlyListeners != null
            ? "Using KWORB monthly listeners fallback."
            : null,
    },
    stats: {
      followers,
      monthlyListeners,
    },
  }
}

async function resolveYouTubeChannelId() {
  const apiKey = process.env.H2H_YOUTUBE_API_KEY
  const channelId = process.env.H2H_YOUTUBE_CHANNEL_ID

  if (!apiKey) return null
  if (channelId) return channelId

  const url = new URL("https://www.googleapis.com/youtube/v3/channels")
  url.searchParams.set("part", "id")
  url.searchParams.set("forHandle", DEFAULT_YOUTUBE_CHANNEL_HANDLE)
  url.searchParams.set("key", apiKey)

  const result = await fetchJson<{
    items?: Array<{ id?: string }>
  }>(url.toString())

  return result?.items?.[0]?.id ?? null
}

async function fetchYouTubeLiveStats(): Promise<SocialPlatformStats> {
  const apiKey = process.env.H2H_YOUTUBE_API_KEY
  if (!apiKey) return {}

  const channelId = await resolveYouTubeChannelId()
  if (!channelId) return {}

  const url = new URL("https://www.googleapis.com/youtube/v3/channels")
  url.searchParams.set("part", "statistics")
  url.searchParams.set("id", channelId)
  url.searchParams.set("key", apiKey)

  const payload = await fetchJson<{
    items?: Array<{
      statistics?: {
        subscriberCount?: string
        videoCount?: string
      }
    }>
  }>(url.toString())

  const statistics = payload?.items?.[0]?.statistics
  const subscribers = statistics?.subscriberCount ? Number(statistics.subscriberCount) : null
  const videoCount = statistics?.videoCount ? Number(statistics.videoCount) : null

  return {
    subscribers: isValidNumber(subscribers) ? subscribers : null,
    videoCount: isValidNumber(videoCount) ? videoCount : null,
  }
}

function normalizeSocialSnapshot(
  spotify: SocialPlatformStats,
  youtube: SocialPlatformStats,
  updatedAt = new Date().toISOString(),
): SocialStatsSnapshot {
  return {
    spotify: {
      followers: spotify.followers ?? null,
      monthlyListeners: spotify.monthlyListeners ?? null,
    },
    youtube: {
      subscribers: youtube.subscribers ?? null,
      videoCount: youtube.videoCount ?? null,
    },
    sources: {
      spotify: "Music Metrics Vault + KWORB fallback",
      youtube: "YouTube Data API v3",
    },
    updatedAt,
  }
}

async function fetchLiveSocialSnapshot(options?: { forceRefresh?: boolean }): Promise<LiveSocialStatsSnapshot> {
  if (!options?.forceRefresh && liveCache && Date.now() - liveCache.fetchedAt < LIVE_CACHE_TTL_MS) {
    return liveCache.data
  }

  const [spotify, youtube] = await Promise.all([fetchSpotifyLiveStats(DEFAULT_SPOTIFY_ARTIST_ID), fetchYouTubeLiveStats()])

  const data: LiveSocialStatsSnapshot = {
    spotify,
    youtube,
    sources: {
      spotify: "Music Metrics Vault + KWORB fallback",
      youtube: "YouTube Data API v3",
    },
  }

  liveCache = {
    fetchedAt: Date.now(),
    data,
  }

  logDebug("SOCIAL LIVE STATS:", data)

  return data
}

export async function refreshSocialStatsSnapshot(options?: { forceRefresh?: boolean }): Promise<SocialStatsSnapshot | null> {
  const live = await fetchLiveSocialSnapshot(options)
  const snapshot = normalizeSocialSnapshot(live.spotify, live.youtube)

  try {
    const supabase = createServiceClient()
    const rows = [
      {
        platform: "spotify",
        followers: snapshot.spotify.followers,
        monthly_listeners: snapshot.spotify.monthlyListeners,
        subscribers: null,
        video_count: null,
        source: snapshot.sources.spotify ?? "Music Metrics Vault",
        fetched_at: snapshot.updatedAt,
      },
      {
        platform: "youtube",
        followers: null,
        monthly_listeners: null,
        subscribers: snapshot.youtube.subscribers,
        video_count: snapshot.youtube.videoCount,
        source: snapshot.sources.youtube ?? "YouTube Data API v3",
        fetched_at: snapshot.updatedAt,
      },
    ]

    const { error } = await supabase.from("h2h_social_stats_snapshots").upsert(rows as any[], {
      onConflict: "platform",
    })

    if (error) {
      logDebug("SOCIAL STATS UPSERT ERROR:", error)
    }

    readCache = {
      fetchedAt: Date.now(),
      data: snapshot,
    }
  } catch (error) {
    logDebug("SOCIAL STATS REFRESH ERROR:", error)
  }

  return snapshot
}

export async function getSocialStatsSnapshotFromDb(options?: {
  allowLiveFallback?: boolean
}): Promise<SocialStatsSnapshot | null> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return null
  }

  const allowLiveFallback = options?.allowLiveFallback ?? true

  if (readCache && Date.now() - readCache.fetchedAt < READ_CACHE_TTL_MS) {
    if (allowLiveFallback && readCache.data) {
      const spotifyMissing = readCache.data.spotify.followers == null && readCache.data.spotify.monthlyListeners == null
      const youtubeMissing = readCache.data.youtube.subscribers == null && readCache.data.youtube.videoCount == null
      if (spotifyMissing || youtubeMissing) {
        readCache = null
      } else {
        return readCache.data
      }
    } else {
      return readCache.data
    }
  }

  try {
    const supabase = createStaticClient()
    const { data, error } = await supabase
      .from("h2h_social_stats_snapshots")
      .select("platform,followers,monthly_listeners,subscribers,video_count,source,fetched_at")
      .in("platform", ["spotify", "youtube"])

    if (error || !data || data.length === 0) {
      if (allowLiveFallback) {
        const refreshed = await refreshSocialStatsSnapshot()
        readCache = {
          fetchedAt: Date.now(),
          data: refreshed,
        }
        return refreshed
      }

      readCache = {
        fetchedAt: Date.now(),
        data: null,
      }
      return null
    }

    const byPlatform = new Map(
      data.map((row) => [
        row.platform,
        row,
      ]),
    )

    const spotify = byPlatform.get("spotify")
    const youtube = byPlatform.get("youtube")

    const snapshot: SocialStatsSnapshot = {
      spotify: {
        followers: spotify?.followers ?? null,
        monthlyListeners: spotify?.monthly_listeners ?? null,
      },
      youtube: {
        subscribers: youtube?.subscribers ?? null,
        videoCount: youtube?.video_count ?? null,
      },
      sources: {
        spotify: spotify?.source ?? "Music Metrics Vault + KWORB fallback",
        youtube: youtube?.source ?? "YouTube Data API v3",
      },
      updatedAt:
        [
          spotify?.fetched_at,
          youtube?.fetched_at,
        ]
          .filter(Boolean)
          .sort()
          .at(-1) ?? "",
    }

    const spotifyMissing = snapshot.spotify.followers == null && snapshot.spotify.monthlyListeners == null
    const youtubeMissing = snapshot.youtube.subscribers == null && snapshot.youtube.videoCount == null
    if (allowLiveFallback && (spotifyMissing || youtubeMissing)) {
      const refreshed = await refreshSocialStatsSnapshot()
      readCache = {
        fetchedAt: Date.now(),
        data: refreshed,
      }
      return refreshed
    }

    readCache = {
      fetchedAt: Date.now(),
      data: snapshot,
    }

    return snapshot
  } catch (error) {
    logDebug("SOCIAL STATS READ ERROR:", error)
    return null
  }
}

export function mergeSocialStats<T extends PlatformPerformance>(
  platform: T,
  stats: SocialPlatformStats | null | undefined,
): T {
  if (!stats) return platform

  return {
    ...platform,
    ...stats,
  }
}
