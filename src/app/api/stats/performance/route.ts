import { NextResponse } from "next/server"
import { getRealtimeSnapshotFromDb } from "@/lib/realtime/db-snapshot"
export const dynamic = 'force-dynamic'
export const revalidate = 300

const CACHE_TTL_MS = 5 * 60_000
let cached: { expiresAt: number; value: any } | null = null
let inFlight: Promise<any> | null = null

export async function GET() {
  try {
    const now = Date.now()
    if (cached && cached.expiresAt > now) {
      return NextResponse.json(cached.value, {
        headers: { "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600" },
      })
    }

    if (!inFlight) {
      inFlight = getRealtimeSnapshotFromDb()
        .then((snapshot) => {
          cached = { expiresAt: Date.now() + CACHE_TTL_MS, value: snapshot }
          return snapshot
        })
        .finally(() => {
          inFlight = null
        })
    }

    const snapshot = await inFlight
    return NextResponse.json(snapshot, {
      headers: { "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600" },
    })
  } catch (err) {
    console.error("Performance API error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
