import { fetchYouTubeVideos } from "@/lib/track-performance"

function requireTestSecret(req: Request) {
    const configured = process.env.H2H_TEST_SECRET

    if (!configured) {
        return false
    }

    const url = new URL(req.url)
    const querySecret = url.searchParams.get("secret")
    const headerSecret = req.headers.get("x-test-secret")

    return querySecret === configured || headerSecret === configured
}

export async function GET(req: Request) {
    if (!requireTestSecret(req)) {
        return Response.json({ error: "unauthorized" }, { status: 401 })
    }

    const result = await fetchYouTubeVideos()
    return Response.json({
        ok: result !== null,
        trackCount: result?.items.length ?? 0,
        totalValue: result?.totalValue,
        sample: result?.items.slice(0, 3),
    })
}