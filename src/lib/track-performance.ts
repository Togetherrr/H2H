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
}

const SAMPLE_SPOTIFY: PlatformPerformance = {
  name: "Spotify",
  totalValue: 1245000,
  dailyValue: 45200,
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
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error(`Chartex fetch error for ${path}:`, error)
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

async function fetchChartexSpotify(): Promise<PlatformPerformance | null> {
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
    }
  } catch {
    return null
  }
}

async function fetchSpotifyCharts(): Promise<PlatformPerformance | null> {
  try {
    const res = await fetch(
      "https://charts.spotify.com/charts/spotify:charts:regional:kr:daily/latest/download",
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) },
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
      next: { revalidate: 3600 },
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
    })

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
    }
  } catch (err) {
    console.error(err)
    return null
  }
}

export async function getTrackPerformanceSnapshot(): Promise<TrackPerformanceSnapshot> {
  const chartex = await fetchChartexSpotify()
  const fallback = await fetchSpotifyCharts()
  const youtube = await fetchYouTubeSnapshot()

  const spotify = chartex ?? fallback ?? SAMPLE_SPOTIFY

  return {
    updatedAt: new Date().toISOString(),
    spotify,
    youtube: youtube ?? DEFAULT_YOUTUBE,
    sources: {
      spotify: chartex ? "Chartex API" : fallback ? "Spotify Charts" : "No data",
      youtube: youtube ? "YouTube API" : "No data",
      note:
        !chartex && !fallback
          ? "Không lấy được dữ liệu ChartEX/Spotify từ server hiện tại. Hãy kiểm tra kết nối tới chartex.com hoặc API credentials."
          : undefined,
    },
    isSample: !chartex && !fallback,
  }
}
