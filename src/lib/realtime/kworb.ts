import type { PlatformPerformance, PerformanceItem } from "@/lib/track-performance"

const KWORB_URL =
    "https://kworb.net/spotify/artist/1ZLU77nRzQIaP23mVSYpCQ_songs.html"

export async function fetchKworbSpotify(): Promise<PlatformPerformance | null> {
    try {
        const res = await fetch(KWORB_URL, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html",
                "Accept-Language": "en-US,en;q=0.9",
            },
            signal: AbortSignal.timeout(10000),
            // Không cache — luôn lấy data mới nhất
            cache: "no-store",
        })

        if (!res.ok) {
            console.warn("KWORB: fetch failed", res.status)
            return null
        }

        const html = await res.text()

        // Kworb HTML structure:
        // <td><a href="https://open.spotify.com/track/TRACK_ID">Song Title</a></td>
        // <td>108,618,925</td>   ← total streams
        // <td>196,565</td>       ← daily streams
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
                dailyChange: null,
                href,
                meta: trackId,
            })
        }
        // Parse "Last updated: 2026/05/04"
        const lastUpdatedMatch = html.match(/Last updated:\s*([\d]{4}\/[\d]{2}\/[\d]{2})/)
        const lastUpdated = lastUpdatedMatch?.[1] ?? null

        if (items.length === 0) {
            console.warn("KWORB: parsed 0 tracks — HTML structure may have changed")
            console.warn("KWORB: HTML snippet:", html.slice(0, 500))
            return null
        }
        if (items.length === 0) {
            console.warn("KWORB: parsed 0 tracks — HTML structure may have changed")
            console.warn("KWORB: HTML snippet:", html.slice(0, 500))
            return null
        }

        console.log(`KWORB: parsed ${items.length} tracks`)

        return {
            name: "Spotify",
            totalValue: items.reduce((s, i) => s + (i.total ?? 0), 0),
            dailyValue: items.reduce((s, i) => s + (i.daily ?? 0), 0),
            dailyChange: null,
            highlights: [],
            items,
            note: lastUpdated ? `Kworb • Updated ${lastUpdated}` : "Kworb",
            viewAllHref: "/charts",
        }
    } catch (err: any) {
        console.warn("KWORB: error", err?.message)
        return null
    }
}