import { NextResponse } from "next/server"

type YouTubeSearchItem = {
  id?: { videoId?: string }
  snippet?: {
    title?: string
    thumbnails?: {
      medium?: { url?: string }
      high?: { url?: string }
      default?: { url?: string }
    }
  }
}

export const runtime = "nodejs"

type CachedVideos = {
  items: YouTubeSearchItem[]
  fetchedAt: number
}

let cachedChannelId: string | null = null
let cachedVideos: CachedVideos | null = null
const CACHE_TTL_MS = 1000 * 60 * 10

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number
) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

export async function GET() {
  const apiKey = process.env.H2H_YOUTUBE_API_KEY
  const channelId = process.env.H2H_YOUTUBE_CHANNEL_ID
  const channelHandle = process.env.H2H_YOUTUBE_CHANNEL_HANDLE || "hearts2hearts.official"
  const fallbackVideoId = process.env.H2H_YOUTUBE_FALLBACK_VIDEO_ID

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "missing_config",
        message: "Missing H2H_YOUTUBE_API_KEY.",
      },
      { status: 424 }
    )
  }

  let resolvedChannelId = channelId || cachedChannelId

  if (!resolvedChannelId) {
    const channelUrl = new URL("https://www.googleapis.com/youtube/v3/channels")
    channelUrl.searchParams.set("part", "id")
    channelUrl.searchParams.set("forHandle", channelHandle)
    channelUrl.searchParams.set("key", apiKey)

    let channelResponse: Response

    try {
      channelResponse = await fetchWithTimeout(channelUrl, { next: { revalidate: 300 } }, 8000)
    } catch {
      return NextResponse.json(
        {
          error: "timeout",
          message: "YouTube API handle lookup timed out.",
        },
        { status: 504 }
      )
    }

    if (!channelResponse.ok) {
      return NextResponse.json(
        {
          error: "upstream_error",
          message: "YouTube API handle lookup failed.",
        },
        { status: 502 }
      )
    }

    const channelData = (await channelResponse.json()) as { items?: { id?: string }[] }
    resolvedChannelId = channelData.items?.[0]?.id ?? null

    if (!resolvedChannelId) {
      return NextResponse.json(
        {
          error: "not_found",
          message: "No channel found for this handle.",
        },
        { status: 404 }
      )
    }

    cachedChannelId = resolvedChannelId
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/search")
  url.searchParams.set("part", "snippet")
  url.searchParams.set("channelId", resolvedChannelId)
  url.searchParams.set("maxResults", "25")
  url.searchParams.set("order", "date")
  url.searchParams.set("type", "video")
  url.searchParams.set("key", apiKey)

  const now = Date.now()
  let items: YouTubeSearchItem[] = []

  if (cachedVideos && now - cachedVideos.fetchedAt < CACHE_TTL_MS) {
    items = cachedVideos.items
  } else {
    try {
      const response = await fetchWithTimeout(url, { next: { revalidate: 300 } }, 8000)

      if (!response.ok) {
        return NextResponse.json(
          {
            error: "upstream_error",
            message: "YouTube API request failed.",
          },
          { status: 502 }
        )
      }

      const data = (await response.json()) as { items?: YouTubeSearchItem[] }
      items = (data.items ?? []).filter((item) => item.id?.videoId)
      cachedVideos = { items, fetchedAt: now }
    } catch {
      if (cachedVideos?.items.length) {
        items = cachedVideos.items
      } else if (fallbackVideoId) {
        return NextResponse.json({
          videoId: fallbackVideoId,
          title: "Hearts2Hearts",
          url: `https://www.youtube.com/watch?v=${fallbackVideoId}`,
          thumbnail: null,
        })
      } else {
        return NextResponse.json(
          {
            error: "timeout",
            message: "YouTube API request timed out.",
          },
          { status: 504 }
        )
      }
    }
  }

  if (items.length === 0) {
    return NextResponse.json(
      {
        error: "empty",
        message: "No videos found for this channel.",
      },
      { status: 404 }
    )
  }

  const randomItem = items[Math.floor(Math.random() * items.length)]
  const videoId = randomItem.id?.videoId
  const title = randomItem.snippet?.title ?? "Hearts2Hearts"
  const thumbnail =
    randomItem.snippet?.thumbnails?.high?.url ??
    randomItem.snippet?.thumbnails?.medium?.url ??
    randomItem.snippet?.thumbnails?.default?.url ??
    null

  return NextResponse.json({
    videoId,
    title,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    thumbnail,
  })
}
