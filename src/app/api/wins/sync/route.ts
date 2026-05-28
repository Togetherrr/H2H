import { NextResponse } from "next/server"
import { syncWinsFromSources } from "@/lib/wins/sync-wins"
import { createStaticClient } from "@/lib/supabase/static"

export const runtime = "nodejs"

// ─── GET — đọc từ Supabase ra UI ─────────────────────────────────────────────
export async function GET(request: Request) {
  // Nếu có Authorization header → kiểm tra token để chạy sync
  const syncToken = process.env.H2H_WINS_SYNC_TOKEN?.trim()
  const cronSecret = process.env.CRON_SECRET?.trim() 
  const h2hCronSecret = process.env.H2H_CRON_SECRET?.trim()
  const auth = request.headers.get("authorization")?.replace("Bearer ", "")

  const isAuthorized = auth && (
    (syncToken && auth === syncToken) ||
    (cronSecret && auth === cronSecret) ||
    (h2hCronSecret && auth === h2hCronSecret)
  )

  if (isAuthorized) {
    try {
      const result = await syncWinsFromSources()
      return NextResponse.json({ ok: true, result })
    } catch (err: any) {
      return NextResponse.json({ ok: false, error: err?.message ?? "Sync failed" }, { status: 500 })
    }
  }

  // Không có token → là UI đang fetch data bình thường
  try {
    const supabase = createStaticClient()

    const [musicResult, awardResult, settingsResult] = await Promise.all([
      (supabase as any)
        .from("music_show_wins")
        .select("*")
        .order("date", { ascending: false })
        .limit(500),
      (supabase as any)
        .from("award_ceremony_wins")
        .select("*")
        .order("year", { ascending: false })
        .order("ceremony", { ascending: true })
        .limit(500),
      supabase.from("site_settings").select("metadata").eq("id", 1).maybeSingle(),
    ])

    const rawSettings = settingsResult as { data?: { metadata?: Record<string, any> } | null }
    const syncMeta = rawSettings.data?.metadata?.["wins_sync"] ?? null

    return NextResponse.json(
      {
        musicShowWins: musicResult.data ?? [],
        awardCeremonyWins: awardResult.data ?? [],
        syncedAt: syncMeta?.syncedAt ?? null,
        fetchedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60",
        },
      }
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Failed to fetch wins" },
      { status: 500 }
    )
  }
}

// ─── POST — trigger sync thủ công ────────────────────────────────────────────
function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export async function POST(request: Request) {
  const token = process.env.H2H_WINS_SYNC_TOKEN?.trim()
  if (!token) {
    return NextResponse.json({ error: "Missing H2H_WINS_SYNC_TOKEN" }, { status: 500 })
  }

  const auth = request.headers.get("authorization") ?? ""
  if (auth !== `Bearer ${token}`) {
    return unauthorized()
  }

  try {
    const result = await syncWinsFromSources()
    return NextResponse.json({ ok: true, result })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "Sync failed" }, { status: 500 })
  }
}