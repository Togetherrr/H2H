import { HomePageClient } from "@/components/home-page-client"
import { getCurrentProfile } from "@/lib/auth"
import { officialLinks as staticOfficialLinks } from "@/lib/home-content"
import { getFilmFrames, getTimelineEvents } from "../lib/release-catalog"
import { memberProfiles as staticMemberProfiles } from "@/lib/member-profiles"
import { hearts2heartsOfficialProfile } from "@/lib/group-official-profile"
import { getHomeStatsSnapshot } from "@/lib/home-stats"
import { hasSupabaseEnv } from "@/lib/supabase/env"

export const revalidate = 3600

export default async function HomePage() {
  const [timelineEvents, filmFrames, homeStatsSnapshot] = await Promise.all([
    getTimelineEvents(),
    getFilmFrames(4),
    getHomeStatsSnapshot(hearts2heartsOfficialProfile.debutDate),
  ])
  const { user, profile } = hasSupabaseEnv()
    ? await getCurrentProfile()
    : { user: null, profile: null }

  const headerAccount = user
    ? {
      avatarUrl: profile?.avatar_url ?? null,
      displayName: profile?.full_name ?? user.email ?? "User",
      href: profile?.role === "admin" ? "/admin" : "/",
      isAdmin: profile?.role === "admin",
    }
    : null

  let memberProfiles = staticMemberProfiles
  let officialLinks = staticOfficialLinks

  /* 
   * TEMPORARILY DISABLED: Waiting for admin to finish adding data.
   * To re-enable, uncomment the block below.
   */
  /*
  if (hasSupabaseEnv()) {
    const supabase = await createClient()
    const { data: dbMembers } = await supabase.from("members").select("*").order("sort_order", { ascending: true })
    if (dbMembers && dbMembers.length > 0) {
      memberProfiles = dbMembers.map((m) => ({
        slug: m.slug,
        name: m.stage_name,
        position: m.position || "",
        image: m.profile_image_url || "",
        intro: m.intro || "",
        keywords: [],
        sourceName: "Official",
        sourceUrl: "#",
      }))
    }

    const { data: dbLinks } = await supabase.from("social_links").select("*").order("sort_order", { ascending: true })
    if (dbLinks && dbLinks.length > 0) {
      officialLinks = dbLinks.map((l) => ({
        name: l.label,
        href: l.url,
        note: l.platform,
      }))
    }
  }
  */

  return (
    <HomePageClient
      filmFrames={filmFrames}
      timelineEvents={timelineEvents}
      memberProfiles={memberProfiles}
      officialLinks={officialLinks}
      officialProfile={hearts2heartsOfficialProfile}
      homeStatsSnapshot={homeStatsSnapshot}
      headerAccount={headerAccount}
    />
  )
}
