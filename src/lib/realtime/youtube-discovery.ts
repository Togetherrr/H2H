type YouTubeSearchItem = {
  id?: { videoId?: string }
}

type YouTubeVideosListItem = {
  id?: string
  contentDetails?: {
    duration?: string
  }
}

type YouTubeVideosListResponse = {
  items?: YouTubeVideosListItem[]
}

const CACHE_TTL_MS = 10 * 60 * 1000
const MAX_RESULTS = 12
const MIN_VIDEO_SECONDS = 60

let cachedChannelId: string | null = null
let cachedVideoIds: { fetchedAt: number; ids: string[] } | null = null

function parseIso8601DurationSeconds(duration: string) {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(duration)
  if (!match) return null
  const hours = match[1] ? Number(match[1]) : 0
  const minutes = match[2] ? Number(match[2]) : 0
  const seconds = match[3] ? Number(match[3]) : 0
  if ([hours, minutes, seconds].some((n) => Number.isNaN(n))) return null
  return hours * 3600 + minutes * 60 + seconds
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function resolveYouTubeChannelId(apiKey: string, channelId?: string | null, channelHandle = "hearts2hearts.official") {
  if (channelId) return channelId
  if (cachedChannelId) return cachedChannelId

  const url = new URL("https://www.googleapis.com/youtube/v3/channels")
  url.searchParams.set("part", "id")
  url.searchParams.set("forHandle", channelHandle)
  url.searchParams.set("key", apiKey)

  const response = await fetchWithTimeout(url, { next: { revalidate: 300 } }, 8000)
  if (!response.ok) return null

  const payload = (await response.json()) as { items?: Array<{ id?: string }> }
  const resolved = payload.items?.[0]?.id ?? null
  if (resolved) cachedChannelId = resolved
  return resolved
}

export async function discoverYouTubeVideoIds(): Promise<string[]> {
  const now = Date.now()
  if (cachedVideoIds && now - cachedVideoIds.fetchedAt < CACHE_TTL_MS) {
    return cachedVideoIds.ids
  }

  const apiKey = process.env.H2H_YOUTUBE_API_KEY?.trim()
  if (!apiKey) return []

  const channelId = await resolveYouTubeChannelId(
    apiKey,
    process.env.H2H_YOUTUBE_CHANNEL_ID?.trim() || null,
    process.env.H2H_YOUTUBE_CHANNEL_HANDLE?.trim() || "hearts2hearts.official",
  )

  if (!channelId) return []

  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search")
  searchUrl.searchParams.set("part", "snippet")
  searchUrl.searchParams.set("channelId", channelId)
  searchUrl.searchParams.set("maxResults", String(MAX_RESULTS))
  searchUrl.searchParams.set("order", "date")
  searchUrl.searchParams.set("type", "video")
  searchUrl.searchParams.set("key", apiKey)

  const searchResponse = await fetchWithTimeout(searchUrl, { next: { revalidate: 300 } }, 8000)
  if (!searchResponse.ok) return []

  const searchPayload = (await searchResponse.json()) as { items?: YouTubeSearchItem[] }
  const items = (searchPayload.items ?? []).filter((item) => item.id?.videoId)
  if (items.length === 0) return []

  const videoIds = items.map((item) => item.id!.videoId!).filter(Boolean)
  const detailsUrl = new URL("https://www.googleapis.com/youtube/v3/videos")
  detailsUrl.searchParams.set("part", "contentDetails")
  detailsUrl.searchParams.set("id", videoIds.join(","))
  detailsUrl.searchParams.set("key", apiKey)

  const detailsResponse = await fetchWithTimeout(detailsUrl, { next: { revalidate: 300 } }, 8000)
  if (!detailsResponse.ok) return videoIds

  const detailsPayload = (await detailsResponse.json()) as YouTubeVideosListResponse
  const eligibleIds = new Set(
    (detailsPayload.items ?? [])
      .map((item) => {
        const duration = item.contentDetails?.duration
        if (!item.id || !duration) return null
        const seconds = parseIso8601DurationSeconds(duration)
        if (seconds === null) return null
        return seconds > MIN_VIDEO_SECONDS ? item.id : null
      })
      .filter(Boolean) as string[],
  )

  const filteredIds = videoIds.filter((id) => eligibleIds.has(id))
  cachedVideoIds = { fetchedAt: now, ids: filteredIds }
  return filteredIds
}
