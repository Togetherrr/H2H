import { HomePageClient } from "@/components/home-page-client"
import { officialLinks as staticOfficialLinks } from "@/lib/home-content"
import { getFilmFrames, getTimelineEvents } from "@/lib/release-catalog"
import { memberProfiles as staticMemberProfiles } from "@/lib/member-profiles"
import { hearts2heartsOfficialProfile } from "@/lib/group-official-profile"
import { getHomeStatsSnapshot } from "@/lib/home-stats"
import { getRealtimeSnapshotFromDb } from "@/lib/realtime/db-snapshot"
import type { FilmFrame } from "@/lib/release-catalog"

import { createStaticClient } from "@/lib/supabase/static"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { getActiveAwardsVoteApps, getLegacyActiveVoteApps } from "@/lib/supabase/voting-service-server"
import type { PopulatedAwardEvent, PopulatedEventApp } from "@/lib/supabase/voting-service-server"
import type { MappedAwardEvent, MappedEventApp } from "@/hooks/useAwardEvents"
import { ALL_NOTICES, mapNoticeRow } from "@/lib/notices"

export const revalidate = 60 // Enable ISR: Revalidate every 60 seconds

async function safeSupabaseResult<T>(work: () => PromiseLike<T>, fallback: T): Promise<T> {
  try {
    return await work()
  } catch {
    return fallback
  }
}

function formatIsoDateToDdMmYyyy(input: string) {
  const match = input.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return ""
  const [, yyyy, mm, dd] = match
  return `${dd}/${mm}/${yyyy}`
}

function normalizeCareerRecordsFilmFrames(metadata: unknown): FilmFrame[] | undefined {
  const rawFrames = (metadata as any)?.career_records_film_strip

  if (!Array.isArray(rawFrames)) {
    return undefined
  }

  const normalized = rawFrames
    .map((frame: any, index: number) => ({
      src: typeof frame?.src === "string"
        ? frame.src.trim()
        : typeof frame?.url === "string"
          ? frame.url.trim()
          : "",
      alt: typeof frame?.alt === "string" && frame.alt.trim().length > 0
        ? frame.alt.trim()
        : typeof frame?.title === "string" && frame.title.trim().length > 0
          ? frame.title.trim()
          : `Career records frame ${index + 1}`,
      label: typeof frame?.title === "string" && frame.title.trim().length > 0
        ? frame.title.trim()
        : `Frame ${index + 1}`,
    }))
    .filter((frame) => frame.src.length > 0)

  return normalized.length > 0 ? normalized : undefined
}

function mapAwardEventApp(ea: PopulatedEventApp): MappedEventApp {
  return {
    id: ea.app.id,
    eventAppId: ea.eventAppId,
    name: ea.app.name,
    iconImageSrc: ea.app.logo_url ?? undefined,
    androidHref: ea.app.android_url ?? undefined,
    iosHref: ea.app.ios_url ?? undefined,
    websiteHref: (ea.app as any).website_url ?? undefined,
    guideUrl: (ea.guideUrl ?? (ea.app as any).guide_url) ?? undefined,
    awardName: ea.awardName ?? undefined,
    awards: ea.awards ?? [],
    description: ea.description ?? ea.app.description,
    currencies: ea.app.currencies ?? [],
    collection: ea.app.collection_methods ?? [],
    strategies: ea.strategies.map((s) => s.content),
    guideSteps: ea.guideSteps,
    rounds: ea.rounds,
    activeRound: ea.activeRound,
    isActiveNow: ea.activeRound !== null,
  }
}

function mapAwardEvent(event: PopulatedAwardEvent): MappedAwardEvent {
  return {
    id: event.id,
    name: event.name,
    nominations: event.nominations ?? [],
    ceremony_at: event.ceremony_at,
    reflection_rate: event.reflection_rate ?? [],
    hasActiveVoting: event.hasActiveVoting,
    apps: event.eventApps.map(mapAwardEventApp),
  }
}

export default async function HomePage() {
  // ── Parallel Data Fetching ──
  // We fetch everything in parallel to minimize waiting time (TTFB)
  const [
    timelineEventsFromCatalog,
    filmFrames,
    homeStatsSnapshot,
    trackPerformanceSnapshot,
    dbMembersResult,
    dbLinksResult,
    awardEventsResult,
    activeVoteAppsResult,
    siteSettingsResult,
    noticesResult,
  ] = await Promise.all([
    getTimelineEvents(),
    getFilmFrames(4),
    getHomeStatsSnapshot(hearts2heartsOfficialProfile.debutDate),
    getRealtimeSnapshotFromDb(),
    // Fetch members and links in the same parallel batch if Supabase is enabled
    hasSupabaseEnv()
      ? safeSupabaseResult(
          () => createStaticClient().from("members").select("*").order("sort_order", { ascending: true }).limit(20),
          { data: null, error: null } as any,
        )
      : Promise.resolve({ data: null }),
    hasSupabaseEnv()
      ? safeSupabaseResult(
          () => createStaticClient().from("social_links").select("*").order("sort_order", { ascending: true }).limit(50),
          { data: null, error: null } as any,
        )
      : Promise.resolve({ data: null }),
    hasSupabaseEnv()
      ? getActiveAwardsVoteApps()
      : Promise.resolve({ events: [], error: null }),
    hasSupabaseEnv()
      ? getLegacyActiveVoteApps()
      : Promise.resolve({ apps: [], error: null }),
    hasSupabaseEnv()
      ? safeSupabaseResult(
          () => createStaticClient().from("site_settings").select("metadata").eq("id", 1).maybeSingle(),
          { data: null, error: null } as any,
        )
      : Promise.resolve({ data: null }),
    hasSupabaseEnv()
      ? safeSupabaseResult(
          () => createStaticClient()
            .from("notices")
            .select("*")
            .eq("is_active", true)
            .order("is_pinned", { ascending: false })
            .order("sort_order", { ascending: true })
            .order("published_at", { ascending: false }),
          { data: null, error: null } as any,
        )
      : Promise.resolve({ data: null }),
  ])

  const timelineEvents = await (async () => {
    if (!hasSupabaseEnv()) return timelineEventsFromCatalog

    const { data, error } = await safeSupabaseResult(
      () =>
        createStaticClient()
          .from("timeline_events")
          .select("slug,event_date,title,event_type,cover_url")
          .eq("is_published", true)
          .order("event_date", { ascending: true })
          .limit(2000),
      { data: null, error: null } as any,
    )

    if (error || !data || data.length === 0) return timelineEventsFromCatalog

    const mapped = data
      .map((row: any) => ({
        slug: row.slug,
        date: formatIsoDateToDdMmYyyy(row.event_date) || row.event_date,
        title: row.title,
        type: row.event_type,
        cover: row.cover_url || "",
      }))
      .filter((row: any) => row.slug && row.date && row.title && row.type)

    return mapped.length > 0 ? mapped : timelineEventsFromCatalog
  })()

  let memberProfiles = staticMemberProfiles
  let officialLinks = staticOfficialLinks

  // Process Members data if available
  const dbMembers = dbMembersResult.data
  if (dbMembers && dbMembers.length > 0) {
    memberProfiles = dbMembers.map((m: any) => ({
      slug: m.slug,
      name: m.stage_name,
      position: (m.card as any)?.role_label || (m.positions && (m.positions as any).length > 0 ? (m.positions as any)[0] : (m.position || m.role || "Member")),
      image: m.profile_image_url || "",
      intro: m.bio_short_en || m.intro || m.bio_short || "",
      keywords: m.keywords || [],
      sourceName: m.detail?.source_name || "Official",
      sourceUrl: m.detail?.source_url || "#",
      nameKr: m.stage_name_kr,
      fullName: m.english_name || m.full_name,
      fullNameKr: m.full_name_kr,
      englishName: m.english_name,
      birthDate: m.birth_date,
      zodiac: m.zodiac,
      bloodType: m.blood_type,
      mbti: m.mbti,
      heightCm: m.height_cm,
      nationality: m.nationality,
      birthplace: m.birthplace,
      emoji: m.emoji,
      trainingYears: m.training_years,
      roleModel: m.role_model,
      character: m.hakyuha_character,
      nicknames: m.nicknames || [],
      funFacts: m.fun_facts_en || m.fun_facts_vi || [],
      favorites: m.favorites || {},
      detail: {
        ...(m.detail as any),
        bio: (m.detail as any)?.bio_en || (m.detail as any)?.bio || m.bio_short_en,
        highlights: (m.detail as any)?.highlights || [],
      },
    }))
  }

  // Process Official Links if available
  const dbLinks = dbLinksResult.data
  if (dbLinks && dbLinks.length > 0) {
    officialLinks = dbLinks.map((l: any) => ({
      id: l.id,
      name: l.label,
      href: l.url,
      note: l.note || "",
      platform: l.note || undefined,
    }))
  }

  const careerRecordsFilmFrames = normalizeCareerRecordsFilmFrames((siteSettingsResult as any).data?.metadata)
  const notices = noticesResult.data && !noticesResult.error
    ? noticesResult.data.map(mapNoticeRow)
    : ALL_NOTICES

  return (
    <HomePageClient
      filmFrames={filmFrames}
      careerRecordsFilmFrames={careerRecordsFilmFrames}
      timelineEvents={timelineEvents}
      memberProfiles={memberProfiles}
      officialLinks={officialLinks}
      officialProfile={hearts2heartsOfficialProfile}
      homeStatsSnapshot={homeStatsSnapshot}
      trackPerformanceSnapshot={trackPerformanceSnapshot}
      awardEvents={(awardEventsResult.events ?? []).map(mapAwardEvent)}
      activeVoteApps={activeVoteAppsResult.apps}
      notices={notices}
    />
  )
}

