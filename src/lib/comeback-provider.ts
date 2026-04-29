import { createClient } from "@/lib/supabase/server"

export type HomeStatSource = {
  label: string
  href: string
}

export type UpcomingComeback = {
  title: string
  releaseAt: string
  note: string
  source: HomeStatSource
}

export type ComebackProviderKey = "env" | "supabase"

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
  const releaseAt = normalizeComebackDateInput(releaseAtRaw)

  if (!releaseAt) {
    return null
  }

  return {
    title: process.env.H2H_COMEBACK_TITLE?.trim() || "Next comeback",
    releaseAt,
    note:
      process.env.H2H_COMEBACK_NOTE?.trim() ||
      "Enter the official comeback date and the countdown will update automatically.",
    source: {
      label: process.env.H2H_COMEBACK_SOURCE_LABEL?.trim() || "Official announcement",
      href: process.env.H2H_COMEBACK_SOURCE_URL?.trim() || "https://weverse.io/hearts2hearts",
    },
  }
}

async function getUpcomingComebackFromSupabase(): Promise<UpcomingComeback | null> {
  try {
    await createClient()
  } catch {
    return null
  }

  // TODO: Replace this stub with a real table query when the DB is ready.
  // Example shape:
  // const client = await createClient()
  // const { data } = await client.from("comeback_settings").select("title, release_at, note, source_label, source_url").single()
  // return data?.release_at ? { title: data.title, releaseAt: data.release_at, note: data.note, source: { label: data.source_label, href: data.source_url } } : null
  return null
}

export async function getUpcomingComeback(): Promise<UpcomingComeback | null> {
  // Switch provider by setting H2H_COMEBACK_PROVIDER=env|supabase.
  const provider = (process.env.H2H_COMEBACK_PROVIDER ?? "env").toLowerCase() as ComebackProviderKey

  if (provider === "supabase") {
    return getUpcomingComebackFromSupabase()
  }

  return getUpcomingComebackFromEnv()
}
