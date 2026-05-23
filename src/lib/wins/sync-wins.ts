import { createServiceClient } from "@/lib/supabase/service"
import { fetchAwardCeremonyWinsFromWikipedia, fetchMusicShowWinsFromWikipediaShowLists } from "@/lib/wins/wins-sources"

export type MusicShowWinRow = {
  id: string
  date: string
  song: string
  program: string
  headline: string
  href: string
}

export type AwardCeremonyWinRow = {
  id: string
  ceremony: string
  year: string
  category: string
  href: string
}

export type WinsSyncResult = {
  syncedAt: string
  musicShowWins: number
  awardCeremonyWins: number
}

export async function syncWinsFromSources(): Promise<WinsSyncResult> {
  const supabase = createServiceClient()
  const syncedAt = new Date().toISOString()

  const { data: settings } = await supabase
    .from("site_settings")
    .select("metadata")
    .eq("id", 1)
    .maybeSingle()

  const existingMetadata = (settings?.metadata as Record<string, unknown>) ?? {}

  // Fetch từ Wikipedia song song
  const [musicWins, awardWins] = await Promise.all([
    fetchMusicShowWinsFromWikipediaShowLists().catch(() => [] as MusicShowWinRow[]),
    fetchAwardCeremonyWinsFromWikipedia().catch(() => [] as AwardCeremonyWinRow[]),
  ])

  // Upsert music show wins
  if (musicWins.length > 0) {
    const { error } = await supabase
      .from("music_show_wins")
      .upsert(
        musicWins.map((win) => ({
          id: win.id,
          date: win.date,
          song: win.song,
          program: win.program,
          headline: win.headline,
          href: win.href,
        })),
        { onConflict: "id" }
      )
    if (error) {
      console.error("[sync-wins] music_show_wins upsert error:", error.message)
    }
  }

  // Upsert award ceremony wins
  if (awardWins.length > 0) {
    const { error } = await supabase
      .from("award_ceremony_wins")
      .upsert(
        awardWins.map((win) => ({
          id: win.id,
          ceremony: win.ceremony,
          year: win.year,
          category: win.category,
          href: win.href,
        })),
        { onConflict: "id" }
      )
    if (error) {
      console.error("[sync-wins] award_ceremony_wins upsert error:", error.message)
    }
  }

  // Ghi lại thời gian sync vào site_settings metadata
  await supabase
    .from("site_settings")
    .update({
      metadata: {
        ...existingMetadata,
        wins_sync: {
          syncedAt,
          musicShowWins: musicWins.length,
          awardCeremonyWins: awardWins.length,
        },
      },
    })
    .eq("id", 1)

  return {
    syncedAt,
    musicShowWins: musicWins.length,
    awardCeremonyWins: awardWins.length,
  }
}
