import { NextResponse } from "next/server"
import { refreshSocialStatsSnapshot } from "@/lib/realtime/social-stats"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  const snapshot = await refreshSocialStatsSnapshot({ forceRefresh: true })

  return NextResponse.json(
    {
      ok: true,
      snapshot,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    },
  )
}
