import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { getReleaseCatalog } from "@/lib/release-catalog"

export const runtime = "nodejs"

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

function parseDdMmYyyyToIso(input: string) {
  const match = input.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return ""
  const [, dd, mm, yyyy] = match
  return `${yyyy}-${mm}-${dd}`
}

export async function POST(request: Request) {
  const token = process.env.H2H_TIMELINE_SYNC_TOKEN?.trim()
  if (!token) {
    return NextResponse.json({ error: "Missing H2H_TIMELINE_SYNC_TOKEN" }, { status: 500 })
  }

  const auth = request.headers.get("authorization") ?? ""
  if (auth !== `Bearer ${token}`) {
    return unauthorized()
  }

  try {
    const supabase = createServiceClient()
    const catalog = await getReleaseCatalog()

    const timelineRows = catalog
      .map((release) => {
        const event_date = parseDdMmYyyyToIso(release.date)
        if (!event_date) return null

        return {
          slug: release.slug,
          event_date,
          event_type: release.type,
          title: release.title,
          summary: release.summary ?? null,
          cover_url: release.cover ?? null,
          source_url: release.sourceUrl ?? null,
          is_published: true,
        }
      })
      .filter(Boolean) as Array<{
      slug: string
      event_date: string
      event_type: string
      title: string
      summary: string | null
      cover_url: string | null
      source_url: string | null
      is_published: boolean
    }>

    if (timelineRows.length === 0) {
      return NextResponse.json({ ok: true, insertedOrUpdated: 0 })
    }

    const slugs = Array.from(new Set(timelineRows.map((row) => row.slug)))

    const { data: existingRows, error: existingError } = await supabase
      .from("timeline_events")
      .select("id,slug,event_date")
      .in("slug", slugs)
      .limit(2000)

    if (existingError) {
      return NextResponse.json({ ok: false, error: existingError.message }, { status: 500 })
    }

    const existingIdByKey = new Map<string, string>()
    for (const row of existingRows ?? []) {
      if (!row?.id || !row?.slug || !row?.event_date) continue
      existingIdByKey.set(`${row.slug}::${row.event_date}`, row.id)
    }

    const upsertRows = timelineRows.map((row) => {
      const id = existingIdByKey.get(`${row.slug}::${row.event_date}`)
      return id ? { id, ...row } : row
    })

    const { error: upsertError } = await supabase.from("timeline_events").upsert(upsertRows as any)
    if (upsertError) {
      return NextResponse.json({ ok: false, error: upsertError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, insertedOrUpdated: upsertRows.length, fetchedAt: new Date().toISOString() })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "Timeline sync failed" }, { status: 500 })
  }
}

