import { NextResponse } from "next/server"
import { getTrackPerformanceSnapshot } from "@/lib/track-performance"

export const dynamic = "force-dynamic"

export async function GET() {
  const snapshot = await getTrackPerformanceSnapshot()
  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "no-store",
    },
  })
}
