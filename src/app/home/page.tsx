import { HomePageClient } from "@/components/home-page-client"
import { officialLinks as staticOfficialLinks } from "@/lib/home-content"
import { getFilmFrames, getTimelineEvents } from "@/lib/release-catalog"
import { memberProfiles as staticMemberProfiles } from "@/lib/member-profiles"
import { hearts2heartsOfficialProfile } from "@/lib/group-official-profile"
import { getHomeStatsSnapshot } from "@/lib/home-stats"
import { getRealtimeSnapshotFromDb } from "@/lib/realtime/db-snapshot"

import { createStaticClient } from "@/lib/supabase/static"
import { hasSupabaseEnv } from "@/lib/supabase/env"

export const revalidate = 60 // Enable ISR: Revalidate every 60 seconds

export default async function HomePage() {
  // ── Parallel Data Fetching ──
  // We fetch everything in parallel to minimize waiting time (TTFB)
  const [
    timelineEvents, 
    filmFrames, 
    homeStatsSnapshot, 
    trackPerformanceSnapshot,
    dbMembersResult,
    dbLinksResult
  ] = await Promise.all([
    getTimelineEvents(),
    getFilmFrames(4),
    getHomeStatsSnapshot(hearts2heartsOfficialProfile.debutDate),
    getRealtimeSnapshotFromDb(),
    // Fetch members and links in the same parallel batch if Supabase is enabled
    hasSupabaseEnv() 
      ? createStaticClient().from("members").select("*").order("sort_order", { ascending: true })
      : Promise.resolve({ data: null }),
    hasSupabaseEnv()
      ? createStaticClient().from("social_links").select("*").order("sort_order", { ascending: true })
      : Promise.resolve({ data: null })
  ])

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

  return (
    <HomePageClient
      filmFrames={filmFrames}
      timelineEvents={timelineEvents}
      memberProfiles={memberProfiles}
      officialLinks={officialLinks}
      officialProfile={hearts2heartsOfficialProfile}
      homeStatsSnapshot={homeStatsSnapshot}
      trackPerformanceSnapshot={trackPerformanceSnapshot}
    />
  )
}

