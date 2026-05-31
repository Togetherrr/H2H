import type { PlatformPerformance, PerformanceItem } from "@/lib/track-performance"

const KWORB_URL =
    "https://kworb.net/spotify/artist/1ZLU77nRzQIaP23mVSYpCQ_songs.html"

const KWORB_CACHE_TTL_MS = 5 * 60 * 1000
const isDebug = process.env.NODE_ENV !== "production"
const logDebug = (...args: unknown[]) => {
    if (isDebug) console.log(...args)
}

let kworbCache: { fetchedAt: number; data: PlatformPerformance } | null = null

export async function fetchKworbSpotify(): Promise<PlatformPerformance | null> {
    try {
        if (kworbCache && Date.now() - kworbCache.fetchedAt < KWORB_CACHE_TTL_MS) {
            return kworbCache.data
        }

        const res = await fetch(KWORB_URL, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html",
                "Accept-Language": "en-US,en;q=0.9",
            },
            signal: AbortSignal.timeout(10000),
            cache: "no-store",
        })

        if (!res.ok) {
            console.warn("KWORB: fetch failed", res.status)
            return kworbCache?.data ?? null
        }

        const html = await res.text()

        const rowRegex =
            /href="(https:\/\/open\.spotify\.com\/track\/([A-Za-z0-9]+))"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<td[^>]*>([\d,]+)<\/td>[\s\S]*?<td[^>]*>([\d,]+)<\/td>/g

        const items: PerformanceItem[] = []
        let match

        while ((match = rowRegex.exec(html)) !== null) {
            const href = match[1]
            const trackId = match[2]
            const title = match[3].replace(/<[^>]+>/g, "").trim()
            const total = Number(match[4].replace(/,/g, ""))
            const daily = Number(match[5].replace(/,/g, ""))

            if (!trackId || !title || isNaN(total) || isNaN(daily)) continue

            items.push({
                id: trackId,
                title,
                subtitle: "Hearts2Hearts",
                imageUrl: "/group.png",
                daily,
                total,
                dailyChange: null, // poll route tính từ DB snapshot
                href,
                meta: trackId,
            })
        }

        const lastUpdatedMatch = html.match(/Last updated:\s*([\d]{4}\/[\d]{2}\/[\d]{2})/)
        const lastUpdated = lastUpdatedMatch?.[1] ?? null

        if (items.length === 0) {
            console.warn("KWORB: parsed 0 tracks — HTML structure may have changed")
            logDebug("KWORB: HTML snippet:", html.slice(0, 500))
            return kworbCache?.data ?? null
        }

        logDebug(`KWORB: parsed ${items.length} tracks`)

        const payload: PlatformPerformance = {
            name: "Spotify",
            totalValue: items.reduce((s, i) => s + (i.total ?? 0), 0),
            dailyValue: items.reduce((s, i) => s + (i.daily ?? 0), 0),
            dailyChange: null, // tính bởi computeRolling24h() từ h2h_item_snapshots
            highlights: [],
            items,
            note: lastUpdated ? `Kworb • Updated ${lastUpdated}` : "Kworb",
            viewAllHref: "/charts",
        }

        kworbCache = { fetchedAt: Date.now(), data: payload }

        return payload
    } catch (err: any) {
        console.warn("KWORB: error", err?.message)
        return kworbCache?.data ?? null
    }
}