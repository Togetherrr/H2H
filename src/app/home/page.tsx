import { HomePageClient } from "@/components/home-page-client"
import { officialLinks as staticOfficialLinks } from "@/lib/home-content"
import { getFilmFrames, getTimelineEvents } from "@/lib/release-catalog"
import { memberProfiles as staticMemberProfiles } from "@/lib/member-profiles"
import { hearts2heartsOfficialProfile } from "@/lib/group-official-profile"
import { getHomeStatsSnapshot } from "@/lib/home-stats"
import { getTrackPerformancePlaceholderSnapshot } from "@/lib/track-performance"

export default async function HomePage() {
  const [timelineEvents, filmFrames, homeStatsSnapshot] = await Promise.all([
    getTimelineEvents(),
    getFilmFrames(4),
    getHomeStatsSnapshot(hearts2heartsOfficialProfile.debutDate),
  ])
  let memberProfiles = staticMemberProfiles
  let officialLinks = staticOfficialLinks

  return (
    <HomePageClient
      filmFrames={filmFrames}
      timelineEvents={timelineEvents}
      memberProfiles={memberProfiles}
      officialLinks={officialLinks}
      officialProfile={hearts2heartsOfficialProfile}
      homeStatsSnapshot={homeStatsSnapshot}
      trackPerformanceSnapshot={getTrackPerformancePlaceholderSnapshot()}
    />
  )
}
