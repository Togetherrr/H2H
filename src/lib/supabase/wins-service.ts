import { createStaticClient } from "@/lib/supabase/static"
import { fetchAwardCeremonyWinsFromWikipedia, fetchMusicShowWinsFromWikipediaShowLists } from "@/lib/wins/wins-sources"

export type MusicShowWin = {
  id: string
  date: string
  song: string
  program: string
  headline: string
  href: string
  created_at: string
}

export type AwardCeremonyWin = {
  id: string
  ceremony: string
  year: string
  category: string
  href: string
  created_at: string
}

let supabaseOfflineUntil = 0

function shouldLogSupabaseError(error: unknown) {
  if (process.env.H2H_LOG_SUPABASE_ERRORS === "1") return true
  if (process.env.NODE_ENV === "development") return true

  const message = typeof (error as any)?.message === "string" ? (error as any).message : ""
  const details = typeof (error as any)?.details === "string" ? (error as any).details : ""
  const combined = `${message} ${details}`.trim()

  if (combined.length === 0) return false

  // Common network issues during build/prerender or locked-down environments.
  if (/(fetch failed|EACCES|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|ECONNRESET)/i.test(combined)) {
    return false
  }

  return true
}

function markSupabaseOfflineTemporarily(error: unknown) {
  const message = typeof (error as any)?.message === "string" ? (error as any).message : ""
  const details = typeof (error as any)?.details === "string" ? (error as any).details : ""
  const combined = `${message} ${details}`.trim()

  if (/(fetch failed|EACCES|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|ECONNRESET)/i.test(combined)) {
    supabaseOfflineUntil = Date.now() + 5 * 60_000
  }
}

function canUseSupabase() {
  if (process.env.H2H_SUPABASE_OFFLINE === "1") return false
  if (supabaseOfflineUntil > Date.now()) return false
  return true
}

/**
 * Service to fetch wins data from Supabase.
 * Falls back to external sources when the tables are empty.
 */
export async function getMusicShowWins() {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return []
  }

  if (canUseSupabase()) {
    try {
      const supabase = createStaticClient()
      const { data, error } = await (supabase as any)
        .from("music_show_wins")
        .select("*")
        .order("date", { ascending: false })
        .limit(500)

      if (error) {
        markSupabaseOfflineTemporarily(error)
        if (shouldLogSupabaseError(error)) {
          console.error("Error fetching music show wins:", error)
        }
      } else {
        const wins = (data ?? []) as MusicShowWin[]
        if (wins.length > 0) return wins
      }
    } catch (err) {
      markSupabaseOfflineTemporarily(err)
      if (shouldLogSupabaseError(err)) {
        console.warn("Supabase music_show_wins unavailable; falling back to external source.", err)
      }
    }
  }

  try {
    const external = await fetchMusicShowWinsFromWikipediaShowLists()
    if (external.length === 0) return []
    const now = new Date().toISOString()
    return external.map((win) => ({
      id: win.id,
      date: win.date,
      song: win.song,
      program: win.program,
      headline: win.headline,
      href: win.href,
      created_at: now,
    })) as MusicShowWin[]
  } catch {
    return []
  }
}

export async function getAwardCeremonyWins() {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return []
  }

  if (canUseSupabase()) {
    try {
      const supabase = createStaticClient()
      const { data, error } = await (supabase as any)
        .from("award_ceremony_wins")
        .select("*")
        .order("year", { ascending: false })
        .order("ceremony", { ascending: true })
        .limit(500)

      if (error) {
        markSupabaseOfflineTemporarily(error)
        if (shouldLogSupabaseError(error)) {
          console.error("Error fetching award ceremony wins:", error)
        }
      } else {
        const wins = (data ?? []) as AwardCeremonyWin[]
        if (wins.length > 0) return wins
      }
    } catch (err) {
      markSupabaseOfflineTemporarily(err)
      if (shouldLogSupabaseError(err)) {
        console.warn("Supabase award_ceremony_wins unavailable; falling back to external source.", err)
      }
    }
  }

  try {
    const external = await fetchAwardCeremonyWinsFromWikipedia()
    if (external.length === 0) return []
    const now = new Date().toISOString()
    return external.map((win) => ({
      id: win.id,
      ceremony: win.ceremony,
      year: win.year,
      category: win.category,
      href: win.href,
      created_at: now,
    })) as AwardCeremonyWin[]
  } catch {
    return []
  }
}

export async function getWinsCount() {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return { musicShowWins: 0, awardCeremonyWins: 0 }
  }

  if (canUseSupabase()) {
    try {
      const supabase = createStaticClient()

      const [musicResult, awardResult] = await Promise.all([
        (supabase as any).from("music_show_wins").select("*", { count: "exact", head: true }),
        (supabase as any).from("award_ceremony_wins").select("*", { count: "exact", head: true }),
      ])

      const musicCount = musicResult.count ?? 0
      const awardCount = awardResult.count ?? 0

      if (musicCount > 0 || awardCount > 0) {
        return { musicShowWins: musicCount, awardCeremonyWins: awardCount }
      }
    } catch (err) {
      markSupabaseOfflineTemporarily(err)
      if (shouldLogSupabaseError(err)) {
        console.warn("Supabase wins count unavailable; falling back to external sources.", err)
      }
    }
  }

  const [externalMusic, externalAwards] = await Promise.all([
    fetchMusicShowWinsFromWikipediaShowLists().catch(() => []),
    fetchAwardCeremonyWinsFromWikipedia().catch(() => []),
  ])

  return {
    musicShowWins: externalMusic.length,
    awardCeremonyWins: externalAwards.length,
  }
}
