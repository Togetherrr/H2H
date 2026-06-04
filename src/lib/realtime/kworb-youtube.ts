/**
 * lib/realtime/kworb-youtube.ts
 *
 * Fetch YouTube metrics from Kworb HTML pages.
 * URL: https://kworb.net/youtube/video/{VIDEO_ID}.html
 *
 * Callers can keep YouTube API/oEmbed as metadata fallback only.
 */

const KWORB_YT_BASE = "https://kworb.net/youtube/video"
const FETCH_TIMEOUT_MS = 10_000
const DELAY_MS = 600

const isDebug = process.env.NODE_ENV !== "production"
const logDebug = (...args: unknown[]) => {
  if (isDebug) console.log(...args)
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export type KworbYoutubeStats = {
  total: number | null
  dailyKworb: number | null
}

function parseKworbYtPage(html: string): KworbYoutubeStats {
  const totalMatch = html.match(/Total views:\s*([\d,]+)/)
  const total = totalMatch ? Number(totalMatch[1].replace(/,/g, "")) : null

  const rowRegex = /<tr><td>(20\d{2}\/\d{2}\/\d{2})<\/td><td>([\d,]+)<\/td><\/tr>/g
  let lastViews: number | null = null
  let match: RegExpExecArray | null
  while ((match = rowRegex.exec(html)) !== null) {
    lastViews = Number(match[2].replace(/,/g, ""))
  }

  return { total, dailyKworb: lastViews }
}

async function fetchOneYtVideo(videoId: string): Promise<KworbYoutubeStats | null> {
  try {
    const res = await fetch(`${KWORB_YT_BASE}/${videoId}.html`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      cache: "no-store",
    })

    if (!res.ok) {
      console.warn(`KWORB YT [${videoId}]: HTTP ${res.status}`)
      return null
    }

    const html = await res.text()
    const stats = parseKworbYtPage(html)

    if (stats.total === null) {
      console.warn(`KWORB YT [${videoId}]: could not parse - HTML may have changed`)
      logDebug(`KWORB YT [${videoId}]: snippet:`, html.slice(0, 400))
      return null
    }

    logDebug(`KWORB YT [${videoId}]: total=${stats.total} daily=${stats.dailyKworb}`)
    return stats
  } catch (err: any) {
    console.warn(`KWORB YT [${videoId}]: error`, err?.message)
    return null
  }
}

/**
 * Fetch Kworb stats for a list of YouTube video IDs.
 * Returns only the videos that parsed successfully.
 */
export async function fetchKworbYoutubeStats(
  videoIds: string[],
): Promise<Map<string, KworbYoutubeStats>> {
  const map = new Map<string, KworbYoutubeStats>()
  if (videoIds.length === 0) return map

  for (let i = 0; i < videoIds.length; i++) {
    const videoId = videoIds[i]
    const result = await fetchOneYtVideo(videoId)

    if (result) {
      map.set(videoId, result)
    }

    if (i < videoIds.length - 1) await sleep(DELAY_MS)
  }

  logDebug(`KWORB YT: fetched stats for ${map.size}/${videoIds.length} videos`)
  return map
}

/**
 * Backward-compatible helper for existing callers that only need daily views.
 */
export async function fetchKworbYoutubeDaily(
  videoIds: string[],
): Promise<Map<string, number>> {
  const stats = await fetchKworbYoutubeStats(videoIds)
  const map = new Map<string, number>()

  for (const [videoId, value] of stats.entries()) {
    if (value.dailyKworb != null) {
      map.set(videoId, value.dailyKworb)
    }
  }

  return map
}
