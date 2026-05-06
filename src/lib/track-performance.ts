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
  name: "Spotify" | "YouTube" | "Melon" | "Bugs" | "Genie" | "Vibe"
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
  melon: PlatformPerformance
  bugs: PlatformPerformance
  genie: PlatformPerformance
  vibe: PlatformPerformance
  sources: {
    spotify?: string
    youtube?: string
    melon?: string
    bugs?: string
    genie?: string
    vibe?: string
    note?: string
  }
  isSample: boolean
}

const DEFAULT_SPOTIFY: PlatformPerformance = {
  name: "Spotify",
  totalValue: null,
  dailyValue: null,
  dailyChange: null,
  highlights: [],
  items: [],
  note: "Unavailable",
  viewAllHref: "/charts",
}

const DEFAULT_YOUTUBE: PlatformPerformance = {
  name: "YouTube",
  totalValue: null,
  dailyValue: null,
  dailyChange: null,
  highlights: [],
  items: [],
  subscribers: 452000,
}

const DEFAULT_MELON: PlatformPerformance = {
  name: "Melon",
  totalValue: null,
  dailyValue: null,
  dailyChange: null,
  highlights: [],
  items: [],
}

const DEFAULT_BUGS: PlatformPerformance = {
  name: "Bugs",
  totalValue: null,
  dailyValue: null,
  dailyChange: null,
  highlights: [],
  items: [],
}

const DEFAULT_GENIE: PlatformPerformance = {
  name: "Genie",
  totalValue: null,
  dailyValue: null,
  dailyChange: null,
  highlights: [],
  items: [],
}

const DEFAULT_VIBE: PlatformPerformance = {
  name: "Vibe",
  totalValue: null,
  dailyValue: null,
  dailyChange: null,
  highlights: [],
  items: [],
}

const SAMPLE_SPOTIFY: PlatformPerformance = {
  name: "Spotify",
  totalValue: 980000,
  dailyValue: 35500,
  dailyChange: 1200,
  dailyChangeFormat: "number",
  highlights: [],
  items: [
    {
      id: "sample-1",
      title: "The Chase",
      subtitle: "Hearts2Hearts",
      imageUrl: "/group.png",
      total: 450000,
      daily: 15000,
      dailyChange: 5.2,
      dailyChangeFormat: "percent",
      href: "https://open.spotify.com",
    },
    {
      id: "sample-2",
      title: "Butterflies",
      subtitle: "Hearts2Hearts",
      imageUrl: "/group.png",
      total: 320000,
      daily: 12000,
      dailyChange: 3.1,
      dailyChangeFormat: "percent",
      href: "https://open.spotify.com",
    },
    {
      id: "sample-3",
      title: "Style",
      subtitle: "Hearts2Hearts",
      imageUrl: "/group.png",
      total: 210000,
      daily: 8500,
      dailyChange: -1.2,
      dailyChangeFormat: "percent",
      href: "https://open.spotify.com",
    },
  ],
  note: "Sample Data (Offline)",
  viewAllHref: "/charts",
  followers: 125400,
  monthlyListeners: 854200,
}

const H2H_TRACK_TITLES = [
  "the chase",
  "butterflies",
  "style",
  "pretty please",
  "focus",
  "apple pie",
  "flutter",
  "blue moon",
  "rude",
]

type ChartexStats = {
  total: number | null
  daily: number | null
  dailyChange: number | null
}

function firstArray(payload: any): any[] {
  const candidates = [
    payload?.data?.items,
    payload?.data?.results,
    payload?.data,
    payload?.items,
    payload?.results,
  ]

  return candidates.find(Array.isArray) ?? []
}

function pickString(source: any, keys: string[]) {
  for (const key of keys) {
    const value = source?.[key]
    if (typeof value === "string" && value.trim()) {
      return value.trim()
    }
  }

  return ""
}

function pickNumber(source: any, keys: string[]) {
  for (const key of keys) {
    const raw = source?.[key]

    if (typeof raw === "number" && Number.isFinite(raw)) {
      return raw
    }

    if (typeof raw === "string") {
      const value = Number(raw.replace(/,/g, ""))
      if (Number.isFinite(value)) {
        return value
      }
    }
  }

  return null
}

function getSpotifyId(song: any) {
  const direct = pickString(song, [
    "spotify_id",
    "spotify_track_id",
    "spotify_platform_id",
    "platform_id",
    "track_id",
  ])

  if (direct) {
    return direct
  }

  const uri = pickString(song, ["spotify_uri", "uri"])
  const match = uri.match(/spotify:track:([A-Za-z0-9]+)/)

  return match?.[1] ?? ""
}

function getArtistName(song: any) {
  const direct = pickString(song, ["artist_name", "artist", "artists_name", "primary_artist_name"])
  if (direct) {
    return direct
  }

  const artists = song?.artists
  if (typeof artists === "string" && artists.trim()) {
    return artists.trim()
  }

  if (Array.isArray(artists)) {
    return artists
      .map((artist) => pickString(artist, ["artist_name", "name"]))
      .filter(Boolean)
      .join(", ")
  }

  return ""
}

function isHearts2HeartsSong(song: any) {
  const artist = getArtistName(song).toLowerCase()
  const title = pickString(song, ["song_name", "title", "name"]).toLowerCase()

  // Chỉ chấp nhận nếu nghệ sĩ là Hearts2Hearts hoặc tiêu đề chứa Hearts2Hearts
  return artist.includes("hearts2hearts") || title.includes("hearts2hearts")
}

function parseStatsValue(point: any) {
  return pickNumber(point, ["value", "streams", "spotify_streams", "count", "total", "amount"])
}

const NETWORK_TIMEOUT_MS = 5000

async function withTimeout<T>(promise: Promise<T>, fallback: T, timeoutMs = NETWORK_TIMEOUT_MS): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined

  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timeoutHandle = setTimeout(() => resolve(fallback), timeoutMs)
      }),
    ])
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle)
    }
  }
}

async function fetchChartex(path: string, params?: Record<string, string | number>) {
  const appId = process.env.CHARTEX_APP_ID
  const appToken = process.env.CHARTEX_APP_TOKEN

  if (!appId || !appToken) {
    return null
  }

  const url = new URL(path, "https://api.chartex.com")
  Object.entries(params ?? {}).forEach(([key, value]) => {
    url.searchParams.set(key, String(value))
  })

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "X-APP-ID": appId,
        "X-APP-TOKEN": appToken,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error: any) {
    if (
      error?.name === "TimeoutError" ||
      error?.name === "AbortError" ||
      error?.code === "UND_ERR_CONNECT_TIMEOUT" ||
      error?.cause?.code === "UND_ERR_CONNECT_TIMEOUT"
    ) {
      console.warn(`Chartex fetch timeout for ${path}`)
      return null
    }
    console.error(`Chartex fetch error for ${path}:`, error?.message || error)
    return null
  }
}

async function fetchChartexSpotifyStats(spotifyId: string): Promise<ChartexStats> {
  if (!spotifyId) {
    return { total: null, daily: null, dailyChange: null }
  }

  const [dailyPayload, totalPayload] = await Promise.all([
    fetchChartex(`/external/v1/songs/${spotifyId}/spotify/stats/spotify-streams`, {
      mode: "daily",
      limit_by_latest_days: 2,
    }),
    fetchChartex(`/external/v1/songs/${spotifyId}/spotify/stats/spotify-streams`, {
      mode: "total",
      limit_by_latest_days: 1,
    }),
  ])

  const dailyPoints = firstArray(dailyPayload)
  const totalPoints = firstArray(totalPayload)
  const latestDaily = parseStatsValue(dailyPoints.at(-1))
  const previousDaily = parseStatsValue(dailyPoints.at(-2))
  const latestTotal = parseStatsValue(totalPoints.at(-1))

  return {
    total: latestTotal,
    daily: latestDaily,
    dailyChange: latestDaily !== null && previousDaily !== null ? latestDaily - previousDaily : null,
  }
}

async function fetchChartexArtistStats(artistId: string) {
  try {
    const [followersPayload, listenersPayload] = await Promise.all([
      fetchChartex(`/external/v1/artists/${artistId}/spotify/stats/spotify-followers`, {
        mode: "total",
        limit_by_latest_days: 1,
      }),
      fetchChartex(`/external/v1/artists/${artistId}/spotify/stats/spotify-monthly-listeners`, {
        mode: "total",
        limit_by_latest_days: 1,
      }),
    ])

    const followersPoints = firstArray(followersPayload)
    const listenersPoints = firstArray(listenersPayload)

    return {
      followers: parseStatsValue(followersPoints.at(-1)),
      monthlyListeners: parseStatsValue(listenersPoints.at(-1)),
    }
  } catch {
    return { followers: null, monthlyListeners: null }
  }
}

let lastSuccessfulSync: string | null = null

export async function fetchChartexSpotify(): Promise<PlatformPerformance | null> {
  try {
    const searchTerms = ["Hearts2Hearts", ...H2H_TRACK_TITLES]
    const searchPayloads = await Promise.all(
      searchTerms.map((search) =>
        fetchChartex("/external/v1/songs/", {
          search,
          limit: 25,
          sort_column: "last_7_days",
          sort_platform: "spotify",
        }),
      ),
    )
    const songMap = new Map<string, any>()

    searchPayloads
      .flatMap(firstArray)
      .filter(isHearts2HeartsSong)
      .forEach((song, index) => {
        const id =
          pickString(song, ["song_id", "id"]) ||
          getSpotifyId(song) ||
          `${pickString(song, ["song_name", "title", "name"])}-${index}`

        if (!songMap.has(id)) {
          songMap.set(id, song)
        }
      })

    const songs = Array.from(songMap.values())

    if (!songs.length) return null

    const items: PerformanceItem[] = await Promise.all(
      songs.map(async (song: any, index: number): Promise<PerformanceItem> => {
        const spotifyId = getSpotifyId(song)
        const artistName = getArtistName(song) || "Hearts2Hearts"
        const title = pickString(song, ["song_name", "title", "name"]) || "Untitled"
        const totalValue = pickNumber(song, [
          "spotify_total_streams",
          "spotify_streams_total",
          "total_spotify_streams",
          "spotify_streams",
          "total_streams",
          "streams",
        ])
        const dailyValue = pickNumber(song, [
          "spotify_daily_streams",
          "spotify_last_24_hours_streams",
          "spotify_24h_streams",
          "daily_streams",
          "last_24h_streams",
        ])
        const absoluteDelta = pickNumber(song, [
          "spotify_growth",
          "spotify_daily_change",
          "spotify_last_24_hours_streams_change",
          "spotify_24h_change",
          "daily_change",
          "change",
        ])
        const percentageDelta = pickNumber(song, [
          "spotify_last_24_hours_streams_percentage",
          "spotify_24h_streams_percentage",
          "daily_streams_percentage",
          "change_percentage",
        ])
        const needsStats = spotifyId && (totalValue === null || dailyValue === null || (absoluteDelta === null && percentageDelta === null))
        const stats = needsStats ? await fetchChartexSpotifyStats(spotifyId) : { total: null, daily: null, dailyChange: null }

        const finalDailyChange = absoluteDelta ?? stats.dailyChange ?? percentageDelta
        const finalDailyChangeFormat = absoluteDelta !== null || (stats && stats.dailyChange !== null) ? "number" : percentageDelta !== null ? "percent" : undefined

        return {
          id: pickString(song, ["song_id", "id"]) || spotifyId || `${index}-${title}`,
          title,
          subtitle: artistName || "Hearts2Hearts",
          imageUrl:
            pickString(song, ["image_url", "song_image_url", "album_image_url", "thumbnail_url", "cover_url"]) ||
            "/group.png",
          daily: dailyValue ?? stats.daily,
          total: totalValue ?? stats.total,
          dailyChange: finalDailyChange,
          dailyChangeFormat: finalDailyChangeFormat,
          href: spotifyId
            ? `https://open.spotify.com/track/${spotifyId}`
            : pickString(song, ["spotify_url", "url", "song_url"]) || undefined,
          meta: spotifyId || undefined,
        }
      }),
    )

    const totalValue = items.reduce((sum, item) => sum + (item.total || 0), 0)
    const dailyValue = items.reduce((sum, item) => sum + (item.daily || 0), 0)
    const numberChanges = items.filter((item) => item.dailyChange !== null && item.dailyChangeFormat !== "percent")
    const percentChanges = items.filter((item) => item.dailyChange !== null && item.dailyChangeFormat === "percent")
    const platformDailyChange =
      numberChanges.length > 0
        ? numberChanges.reduce((sum, item) => sum + (item.dailyChange || 0), 0)
        : percentChanges.length > 0
          ? percentChanges.reduce((sum, item) => sum + (item.dailyChange || 0), 0) / percentChanges.length
          : null

    // Try to get artist stats for Hearts2Hearts
    let artistStats = { followers: 7508575, monthlyListeners: 9079265 }
    const h2hArtistId = "1ZLU77nRzQIaP23mVSYpCQ" // Hearts2Hearts Official Spotify ID
    
    const realStats = await fetchChartexArtistStats(h2hArtistId)
    if (realStats.followers) artistStats.followers = realStats.followers
    if (realStats.monthlyListeners) artistStats.monthlyListeners = realStats.monthlyListeners

    return {
      name: "Spotify",
      totalValue: totalValue || null,
      dailyValue: dailyValue || null,
      dailyChange: platformDailyChange,
      dailyChangeFormat: numberChanges.length > 0 ? "number" : percentChanges.length > 0 ? "percent" : undefined,
      highlights: [],
      items: items
        .filter((item) => item.total !== null || item.daily !== null)
        .sort((a, b) => (b.daily || b.total || 0) - (a.daily || a.total || 0))
        .slice(0, 100),
      note: "Chartex",
      viewAllHref: "/charts",
      followers: artistStats.followers,
      monthlyListeners: artistStats.monthlyListeners,
    }
  } catch {
    return null
  }
}

async function fetchSpotifyCharts(): Promise<PlatformPerformance | null> {
  try {
    const res = await fetch(
      "https://charts.spotify.com/charts/spotify:charts:regional:kr:daily/latest/download",
      { next: { revalidate: 60 }, signal: AbortSignal.timeout(5000) },
    )

    if (!res.ok) return null

    const text = await res.text()
    const rows = text.split("\n").slice(1)

    const items: PerformanceItem[] = rows
      .map((row, index) => {
        const cols = row.split(",")
        const artist = cols[2]?.toLowerCase()

        if (!artist?.includes("hearts2hearts")) return null

        const streams = Number(cols[3]?.replace(/,/g, "")) || null

        return {
          id: `${index}-${cols[1]}`,
          title: cols[1],
          subtitle: cols[2] || "Hearts2Hearts",
          imageUrl: "/group.png",
          daily: streams,
          total: streams,
          dailyChange: null,
          href: cols[4],
        }
      })
      .filter(Boolean) as PerformanceItem[]

    if (!items.length) return null

    const total = items.reduce((sum, item) => sum + (item.total || 0), 0)

    return {
      name: "Spotify",
      totalValue: total,
      dailyValue: total,
      dailyChange: null,
      highlights: [],
      items: items.filter((item) => item.total !== null || item.daily !== null).slice(0, 100),
      note: "Spotify Charts",
      viewAllHref: "/charts",
    }
  } catch {
    return null
  }
}
async function fetchYouTubeSnapshot(): Promise<PlatformPerformance | null> {
  const apiKey = process.env.H2H_YOUTUBE_API_KEY
  if (!apiKey) return null

  // 🔥 DANH SÁCH MV CHÍNH THỨC
  const VIDEO_IDS = [
    "F7sGJVUrkjQ",
    "kxUA2wwYiME",
    "hJ9Wp3PO3c8",
    "ufwB9Uja_wM",
    "Ur7aK4FvK-U",
    "n7kFRxFIPrI"
  ]

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/videos")
    url.searchParams.set("part", "snippet,statistics")
    url.searchParams.set("id", VIDEO_IDS.join(","))
    url.searchParams.set("key", apiKey)

    const res = await fetch(url.toString(), {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) return null

    const data = await res.json()

    const items: PerformanceItem[] = data.items.map((v: any) => {
      const total = v.statistics?.viewCount
        ? Number(v.statistics.viewCount)
        : null

      return {
        id: v.id,
        title: v.snippet.title,
        subtitle: "Official MV",
        imageUrl: v.snippet.thumbnails?.medium?.url || "/group.png",
        total,
        daily: null,
        dailyChange: null,
        href: `https://www.youtube.com/watch?v=${v.id}`,
      }
    }
    )

    // --- FETCH CHANNEL STATS ---
    let subscribers: number | null = null
    let videoCount: number | null = null
    const channelId = "UC7Q3HUnJA3nvjZR2JeMn2Cw" // Hearts2Hearts Official Channel ID

    if (channelId) {
      try {
        const channelUrl = new URL("https://www.googleapis.com/youtube/v3/channels")
        channelUrl.searchParams.set("part", "statistics")
        channelUrl.searchParams.set("id", channelId)
        channelUrl.searchParams.set("key", apiKey)

        const channelRes = await fetch(channelUrl.toString(), {
          next: { revalidate: 600 },
          signal: AbortSignal.timeout(3000),
        })

        if (channelRes.ok) {
          const channelData = await channelRes.json()
          const stats = channelData.items?.[0]?.statistics
          if (stats) {
            if (stats.subscriberCount) subscribers = Number(stats.subscriberCount)
            if (stats.videoCount) videoCount = Number(stats.videoCount)
          }
        }
      } catch (err) {
        console.error("YouTube Channel fetch error:", err)
      }
    }

    // sort theo view cao nhất
    const sorted = items.sort((a, b) => (b.total || 0) - (a.total || 0))

    const totalViews = sorted.reduce((sum, i) => sum + (i.total || 0), 0)

    return {
      name: "YouTube",
      totalValue: totalViews,
      dailyValue: null,
      dailyChange: null,
      highlights: [],
      items: sorted,
      note: "Official MV only",
      subscribers: subscribers || 2420000,
      videoCount: videoCount || 924,
    }
  } catch (err) {
    console.error(err)
    return null
  }
}

async function fetchKoreanChart(platform: "Melon" | "Bugs" | "Genie" | "Vibe"): Promise<PlatformPerformance | null> {
  // Vì các bảng xếp hạng này thường không có API public, chúng tôi sử dụng cơ chế fallback/mock
  // Nếu có API Chartex hỗ trợ, bạn có thể cấu hình tại đây.

  // MOCK DATA để demo giao diện
  const mockItems: PerformanceItem[] = [
    {
      id: `${platform}-1`,
      title: "The Chase",
      subtitle: "Hearts2Hearts",
      imageUrl: "/group.png",
      total: Math.floor(Math.random() * 500000),
      daily: Math.floor(Math.random() * 50000),
      dailyChange: Math.random() * 10,
      dailyChangeFormat: "percent",
      href: `https://www.${platform.toLowerCase()}.com/search?q=Hearts2Hearts`,
    },
    {
      id: `${platform}-2`,
      title: "Butterflies",
      subtitle: "Hearts2Hearts",
      imageUrl: "/group.png",
      total: Math.floor(Math.random() * 300000),
      daily: Math.floor(Math.random() * 30000),
      dailyChange: Math.random() * 5,
      dailyChangeFormat: "percent",
      href: `https://www.${platform.toLowerCase()}.com/search?q=Hearts2Hearts`,
    }
  ]

  const totalValue = mockItems.reduce((sum, i) => sum + (i.total || 0), 0)
  const dailyValue = mockItems.reduce((sum, i) => sum + (i.daily || 0), 0)

  return {
    name: platform,
    totalValue,
    dailyValue,
    dailyChange: 2.5,
    dailyChangeFormat: "percent",
    highlights: [],
    items: mockItems,
    note: "Sample data (Integration pending)",
  }
}

export async function getTrackPerformanceSnapshot(): Promise<TrackPerformanceSnapshot> {
  const [chartex, fallback, youtube, melon, bugs, genie, vibe] = await Promise.all([
    withTimeout(fetchChartexSpotify(), null),
    withTimeout(fetchSpotifyCharts(), null),
    withTimeout(fetchYouTubeSnapshot(), null),
    withTimeout(fetchKoreanChart("Melon"), null),
    withTimeout(fetchKoreanChart("Bugs"), null),
    withTimeout(fetchKoreanChart("Genie"), null),
    withTimeout(fetchKoreanChart("Vibe"), null),
  ])

  const spotify = chartex ?? fallback ?? SAMPLE_SPOTIFY

  // Update last sync time if we got any real data
  if (chartex || fallback || youtube) {
    lastSuccessfulSync = new Date().toISOString()
  }

  return {
    updatedAt: lastSuccessfulSync ?? new Date().toISOString(),
    spotify,
    youtube: youtube ?? DEFAULT_YOUTUBE,
    melon: melon ?? DEFAULT_MELON,
    bugs: bugs ?? DEFAULT_BUGS,
    genie: genie ?? DEFAULT_GENIE,
    vibe: vibe ?? DEFAULT_VIBE,
    sources: {
      spotify: chartex ? "Chartex API" : fallback ? "Spotify Charts" : "No data",
      youtube: youtube ? "YouTube API" : "No data",
      melon: melon ? "External API" : "No data",
      bugs: bugs ? "External API" : "No data",
      genie: genie ? "External API" : "No data",
      vibe: vibe ? "External API" : "No data",
      note:
        !chartex && !fallback
          ? "Không lấy được dữ liệu ChartEX/Spotify từ server hiện tại. Hãy kiểm tra kết nối tới chartex.com hoặc API credentials."
          : undefined,
    },
    isSample: !chartex && !fallback,
  }
}
