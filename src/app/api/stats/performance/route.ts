import { NextResponse } from "next/server"
import { getRealtimeSnapshotFromDb } from "@/lib/realtime/db-snapshot"
export const dynamic = 'force-dynamic'
export const revalidate = 300

export async function GET() {
  try {
    const snapshot = await getRealtimeSnapshotFromDb()
    return NextResponse.json(snapshot, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    })
  } catch (err) {
    console.error("Performance API error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
