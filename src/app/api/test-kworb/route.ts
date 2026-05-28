import { fetchKworbSpotify } from "@/lib/realtime/kworb"

function requireTestSecret(req: Request) {
    if (process.env.NODE_ENV === "production") {
        return false
    }

    const configured = process.env.H2H_TEST_SECRET

    if (!configured) {
        return false
    }

    const headerSecret = req.headers.get("x-test-secret")

    return headerSecret === configured
}

export async function GET(req: Request) {
    if (!requireTestSecret(req)) {
        return Response.json({ error: "unauthorized" }, { status: 401 })
    }

    const result = await fetchKworbSpotify()
    return Response.json({
        ok: result !== null,
        trackCount: result?.items.length ?? 0,
        totalValue: result?.totalValue,
        dailyValue: result?.dailyValue,
        sample: result?.items.slice(0, 3),
    })
}
