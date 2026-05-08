import { fetchKworbSpotify } from "@/lib/realtime/kworb"

export async function GET() {
    const result = await fetchKworbSpotify()
    return Response.json({
        ok: result !== null,
        trackCount: result?.items.length ?? 0,
        totalValue: result?.totalValue,
        dailyValue: result?.dailyValue,
        sample: result?.items.slice(0, 3),
    })
}