import { NextResponse } from "next/server"
import { getTrackPerformanceSnapshot } from "@/lib/track-performance"

export const revalidate = 0
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const snapshot = await getTrackPerformanceSnapshot()
    return NextResponse.json(snapshot)
  } catch (err) {
    console.error("Performance API error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
