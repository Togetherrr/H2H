import { HomePageClient } from "@/components/home-page-client"
import { officialLinks as staticOfficialLinks } from "@/lib/home-content"
import { getFilmFrames, getTimelineEvents } from "../lib/release-catalog"
import { memberProfiles as staticMemberProfiles } from "@/lib/member-profiles"
import { hearts2heartsOfficialProfile } from "@/lib/group-official-profile"
import { getHomeStatsSnapshot } from "@/lib/home-stats"
import { getTrackPerformanceSnapshot } from "@/lib/track-performance"


export default async function HomePage() {
  const [timelineEvents, filmFrames, homeStatsSnapshot, trackPerformanceSnapshot] = await Promise.all([
    getTimelineEvents(),
    getFilmFrames(4),
    getHomeStatsSnapshot(hearts2heartsOfficialProfile.debutDate),
    getTrackPerformanceSnapshot(),
  ])
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
      trackPerformanceSnapshot={trackPerformanceSnapshot}
    />
  )
}
