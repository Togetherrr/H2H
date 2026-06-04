import { NextResponse } from "next/server"
import { refreshSocialStatsSnapshot } from "@/lib/realtime/social-stats"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
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
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to refresh social stats snapshot.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  }
}
