import { NextResponse } from "next/server"
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server"
import { computeRolling24h, getKstDayStart, type RealtimeItem, type RealtimeSnapshot } from "@/lib/realtime/rolling24h"

export const runtime = "nodejs"
export const revalidate = 0

export async function GET(req: Request) {
  const url = new URL(req.url)
  const type = url.searchParams.get("type")

  if (type && type !== "spotify_track" && type !== "youtube_video") {
    return NextResponse.json({ error: "bad_request", message: "Invalid type." }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()
  const { data: items, error: itemsError } = await supabase
    .from("h2h_items")
    .select("id,type,platform_id,title,cover_url,release_date,is_active")
    .eq("is_active", true)
    .order("release_date", { ascending: false })
    .limit(100)

  if (itemsError) {
    return NextResponse.json(
      { error: "db_error", step: "items", message: itemsError.message },
      { status: 502 },
    )
  }

  const filteredItems = (items ?? []).filter((row) => (type ? row.type === type : true)) as RealtimeItem[]

  if (filteredItems.length === 0) {
    return NextResponse.json({
      ok: true,
      type: type ?? "all",
      updatedAt: null,
      total: 0,
      delta24h: 0,
      delta24hChange: 0,
      rows: [],
    })
  }

  const now = new Date()
  const kstDayStart = getKstDayStart(now)
  const oldestMs = kstDayStart.getTime() - 14 * 24 * 60 * 60_000 // wider buffer for stable fallback history
  const oldestIso = new Date(oldestMs).toISOString()

  const itemIds = filteredItems.map((i) => i.id)
  const { data: snapshots, error: snapshotsError } = await supabase
    .from("h2h_item_snapshots")
    .select("item_id,ts,total,daily_kworb")
    .in("item_id", itemIds)
    .gte("ts", oldestIso)
    .order("ts", { ascending: false })
    .limit(5000)

  if (snapshotsError) {
    return NextResponse.json(
      { error: "db_error", step: "snapshots", message: snapshotsError.message },
      { status: 502 },
    )
  }

  const computed = computeRolling24h(filteredItems, (snapshots ?? []) as unknown as RealtimeSnapshot[], now)

  return NextResponse.json({
    ok: true,
    type: type ?? "all",
    updatedAt: computed.updatedAt,
    total: computed.total,
    delta24h: computed.delta24h,
    delta24hChange: computed.delta24hChange,
    rows: computed.rows.map((row) => ({
      id: row.item.id,
      type: row.item.type,
      platformId: row.item.platform_id,
      title: row.item.title,
      coverUrl: row.item.cover_url,
      releaseDate: row.item.release_date,
      total: row.total,
      daily: row.delta24h,
      dailyChange: row.delta24hChange,
      lastTs: row.lastTs,
    })),
  })
}
