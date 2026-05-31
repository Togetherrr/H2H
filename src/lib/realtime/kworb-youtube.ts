/**
 * lib/realtime/kworb-youtube.ts
 *
 * Fetch daily view counts từ Kworb cho từng YouTube video.
 * URL: https://kworb.net/youtube/video/{VIDEO_ID}.html
 *
 * Chỉ export fetchKworbYoutubeDaily() — trả về Map để poll route dùng.
 * Poll route tự lo việc upsert vào h2h_item_snapshots.
 */

const KWORB_YT_BASE = "https://kworb.net/youtube/video"
const FETCH_TIMEOUT_MS = 10_000
const DELAY_MS = 600 // tránh rate-limit kworb

const isDebug = process.env.NODE_ENV !== "production"
const logDebug = (...args: unknown[]) => { if (isDebug) console.log(...args) }

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// ─── Parser ───────────────────────────────────────────────────────────────────

function parseKworbYtPage(html: string): { total: number | null; dailyKworb: number | null } {
    // Total views: 38,342,630
    const totalMatch = html.match(/Total views:\s*([\d,]+)/)
    const total = totalMatch ? Number(totalMatch[1].replace(/,/g, "")) : null

    // Bảng daily: | 2026/05/26 | 44,424 |
    // Lấy dòng cuối cùng (ngày mới nhất)
    const rowRegex = /\|\s*(20\d{2}\/\d{2}\/\d{2})\s*\|\s*([\d,]+)\s*\|/g
    let lastViews: number | null = null
    let match: RegExpExecArray | null
    while ((match = rowRegex.exec(html)) !== null) {
        lastViews = Number(match[2].replace(/,/g, ""))
    }

    return { total, dailyKworb: lastViews }
}

// ─── Fetch single video ───────────────────────────────────────────────────────

async function fetchOneYtVideo(
    videoId: string,
): Promise<{ total: number; dailyKworb: number | null } | null> {
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
        const { total, dailyKworb } = parseKworbYtPage(html)

        if (total === null) {
            console.warn(`KWORB YT [${videoId}]: could not parse — HTML may have changed`)
            logDebug(`KWORB YT [${videoId}]: snippet:`, html.slice(0, 400))
            return null
        }

        logDebug(`KWORB YT [${videoId}]: total=${total} daily=${dailyKworb}`)
        return { total, dailyKworb }
    } catch (err: any) {
        console.warn(`KWORB YT [${videoId}]: error`, err?.message)
        return null
    }
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Fetch Kworb daily views cho danh sách YouTube video IDs.
 * @returns Map<videoId, dailyViews> — chỉ chứa những video parse được
 */
export async function fetchKworbYoutubeDaily(
    videoIds: string[],
): Promise<Map<string, number>> {
    const map = new Map<string, number>()
    if (videoIds.length === 0) return map

    for (let i = 0; i < videoIds.length; i++) {
        const videoId = videoIds[i]
        const result = await fetchOneYtVideo(videoId)

        if (result?.dailyKworb != null) {
            map.set(videoId, result.dailyKworb)
        }

        // Delay giữa request, trừ cái cuối
        if (i < videoIds.length - 1) await sleep(DELAY_MS)
    }

    logDebug(`KWORB YT: fetched daily for ${map.size}/${videoIds.length} videos`)
    return map
}