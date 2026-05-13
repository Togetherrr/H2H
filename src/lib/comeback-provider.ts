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
  return null
}

export async function getUpcomingComeback(): Promise<UpcomingComeback | null> {
  // Switch provider by setting H2H_COMEBACK_PROVIDER=env|supabase.
  const provider = (process.env.H2H_COMEBACK_PROVIDER ?? "env").toLowerCase() as ComebackProviderKey

  let comeback: UpcomingComeback | null = null

  if (provider === "supabase") {
    comeback = await getUpcomingComebackFromSupabase()
  } else {
    comeback = getUpcomingComebackFromEnv()
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
