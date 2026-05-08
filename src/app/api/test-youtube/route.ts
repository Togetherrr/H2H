import { fetchYouTubeVideos } from "@/lib/track-performance"

export async function GET() {
    const result = await fetchYouTubeVideos()
    return Response.json({
        ok: result !== null,
        trackCount: result?.items.length ?? 0,
        totalValue: result?.totalValue,
        sample: result?.items.slice(0, 3),
    })
}