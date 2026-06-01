import { NextResponse } from "next/server"
import { getRealtimeSnapshotFromDb } from "@/lib/realtime/db-snapshot"

export const dynamic = "force-dynamic"

export async function GET() {
  const snapshot = await getRealtimeSnapshotFromDb()
  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "no-store",
    },
  })
}