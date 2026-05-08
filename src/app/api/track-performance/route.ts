import { NextResponse } from "next/server"
import { getRealtimeSnapshotFromDb } from "@/lib/realtime/db-snapshot"

export const revalidate = 60

export async function GET() {
  const snapshot = await getRealtimeSnapshotFromDb()
  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
    },
  })
}

