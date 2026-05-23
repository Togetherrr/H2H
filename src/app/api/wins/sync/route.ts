import { NextResponse } from "next/server"
import { syncWinsFromSources } from "@/lib/wins/sync-wins"
import { createServiceClient } from "@/lib/supabase/service"

export const runtime = "nodejs"

// ─── GET — đọc từ Supabase ra UI ─────────────────────────────────────────────
// Dùng bởi page.tsx để hiển thị wins live

export async function GET() {
  try {
    const supabase = createServiceClient()

    const [musicResult, awardResult, settingsResult] = await Promise.all([
      (supabase as any)
        .from("music_show_wins")
        .select("*")
        .order("date", { ascending: false }),
      (supabase as any)
        .from("award_ceremony_wins")
        .select("*")
        .order("year", { ascending: false })
        .order("ceremony", { ascending: true }),
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
          // Cache 10 phút ở CDN, cho phép stale-while-revalidate
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

// ─── POST — trigger sync từ Wikipedia → Supabase ─────────────────────────────
// Gọi từ cron job hoặc thủ công với header Authorization: Bearer <token>

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