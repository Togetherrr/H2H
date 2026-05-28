import { createStaticClient } from "@/lib/supabase/static"
import type { TimeZone } from "@/components/navbar"

export type HomeStatSource = {
  label: string
  href: string
}

export type UpcomingComeback = {
  title: string
  releaseAt: string
  timeZone?: TimeZone
  note: string
  source: HomeStatSource
  shoppingUrl?: string | null
  shoppingLabel?: string | null
  streamUrl?: string | null
  streamLabel?: string | null
}

export type ComebackProviderKey = "env" | "supabase"

type ComebackWatchMetadata = {
  title?: string
  albumTitle?: string
  releaseAt?: string
  release_at?: string
  timeZone?: TimeZone
  time_zone?: TimeZone
  note?: string
  shoppingUrl?: string
  shopping_url?: string
  shoppingLabel?: string
  shopping_label?: string
  streamUrl?: string
  stream_url?: string
  streamLabel?: string
  stream_label?: string
  sourceLabel?: string
  source_label?: string
  sourceUrl?: string
  source_url?: string
}

function normalizeTimeZone(value: unknown): TimeZone {
  if (value === "KST" || value === "EDT" || value === "UTC" || value === "LOCAL") {
    return value
  }

  return "KST"
}

function getOffsetSuffix(timeZone: TimeZone, value: string) {
  switch (timeZone) {
    case "KST":
      return "+09:00"
    case "EDT":
      return "-04:00"
    case "UTC":
      return "Z"
    case "LOCAL": {
      const localDate = new Date(value)
      const offsetMinutes = -localDate.getTimezoneOffset()
      const sign = offsetMinutes >= 0 ? "+" : "-"
      const absoluteMinutes = Math.abs(offsetMinutes)
      const hours = String(Math.floor(absoluteMinutes / 60)).padStart(2, "0")
      const minutes = String(absoluteMinutes % 60).padStart(2, "0")
      return `${sign}${hours}:${minutes}`
    }
  }
}

function buildReleaseAt(value: string, timeZone: TimeZone) {
  const input = value.trim()
  if (!input) return ""

  if (/T/.test(input)) {
    return /([+-]\d{2}:\d{2}|Z)$/.test(input) ? input : `${input}:00${getOffsetSuffix(timeZone, input)}`
  }

  return `${input}T00:00:00${getOffsetSuffix(timeZone, input)}`
}

function normalizeComebackWatch(metadata: ComebackWatchMetadata | null | undefined): UpcomingComeback | null {
  if (!metadata) return null

  const title = (metadata.title ?? metadata.albumTitle ?? "").trim()
  const releaseAtRaw = (metadata.releaseAt ?? metadata.release_at ?? "").trim()
  const timeZone = normalizeTimeZone(metadata.timeZone ?? metadata.time_zone)

  if (!title || !releaseAtRaw) return null

  const releaseAt = buildReleaseAt(releaseAtRaw, timeZone)

  if (!releaseAt) return null

  return {
    title,
    releaseAt,
    timeZone,
    note: (metadata.note ?? "").trim() || "Official comeback schedule",
    source: {
      label: (metadata.sourceLabel ?? metadata.source_label ?? "Official announcement").trim(),
      href: (metadata.sourceUrl ?? metadata.source_url ?? "https://www.youtube.com").trim(),
    },
    shoppingUrl: (metadata.shoppingUrl ?? metadata.shopping_url ?? "").trim() || null,
    shoppingLabel: (metadata.shoppingLabel ?? metadata.shopping_label ?? "").trim() || null,
    streamUrl: (metadata.streamUrl ?? metadata.stream_url ?? "").trim() || null,
    streamLabel: (metadata.streamLabel ?? metadata.stream_label ?? "").trim() || null,
  }
}

function normalizeComebackDateInput(input: string) {
  const value = input.trim()

  if (!value) {
    return ""
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/")
    return `${year}-${month}-${day}`
  }

  return value
}

function getUpcomingComebackFromEnv(): UpcomingComeback | null {
  const releaseAtRaw = process.env.H2H_COMEBACK_AT?.trim() || process.env.H2H_COMEBACK_DATE?.trim() || ""
  const timeZone = normalizeTimeZone((process.env.H2H_COMEBACK_TIMEZONE?.trim() || "KST") as TimeZone)
  const releaseAt = buildReleaseAt(normalizeComebackDateInput(releaseAtRaw), timeZone)

  if (!releaseAt) {
    return null
  }

  return {
    title: process.env.H2H_COMEBACK_TITLE?.trim() || "Next comeback",
    releaseAt,
    timeZone,
    note:
      process.env.H2H_COMEBACK_NOTE?.trim() ||
      "Enter the official comeback date and the countdown will update automatically.",
    source: {
      label: process.env.H2H_COMEBACK_SOURCE_LABEL?.trim() || "Official announcement",
      href: process.env.H2H_COMEBACK_SOURCE_URL?.trim() || "https://weverse.io/hearts2hearts",
    },
    shoppingUrl: process.env.H2H_COMEBACK_SHOPPING_URL?.trim() || null,
    shoppingLabel: process.env.H2H_COMEBACK_SHOPPING_LABEL?.trim() || null,
    streamUrl: process.env.H2H_COMEBACK_STREAM_URL?.trim() || null,
    streamLabel: process.env.H2H_COMEBACK_STREAM_LABEL?.trim() || null,
  }
}

async function getUpcomingComebackFromSupabase(): Promise<UpcomingComeback | null> {
  try {
    const supabase = createStaticClient()
    const { data, error } = await supabase.from("site_settings").select("metadata").eq("id", 1).maybeSingle()
    if (error) return null

    const metadata = (data?.metadata as any) || {}
    const comeback = normalizeComebackWatch((metadata.comeback_watch ?? metadata.upcoming_comeback) as ComebackWatchMetadata | undefined)
    if (comeback) return comeback
  } catch {
    return null
  }

  return null
}

export async function getUpcomingComeback(): Promise<UpcomingComeback | null> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return null
  }

  // Default to Supabase so admin-managed settings drive the public countdown.
  const provider = (process.env.H2H_COMEBACK_PROVIDER ?? "supabase").toLowerCase() as ComebackProviderKey

  let comeback: UpcomingComeback | null = null

  if (provider === "env") {
    comeback = getUpcomingComebackFromEnv()
  } else {
    comeback = await getUpcomingComebackFromSupabase()

    if (!comeback && process.env.H2H_COMEBACK_PROVIDER !== "supabase") {
      comeback = getUpcomingComebackFromEnv()
    }
  }

  /* 
   * TEMPLATE: Uncomment this block to test a future comeback countdown.
   * Note: The releaseAt format should be "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss+09:00"
   */
  /*
  if (!comeback) {
    return {
      title: "ALBUM_TITLE",
      releaseAt: "2026-06-01T18:00:00+09:00",
      note: "Official teaser note here.",
      source: {
        label: "Official Trailer",
        href: "https://youtube.com"
      }
    }
  }
  */

  return comeback
}
