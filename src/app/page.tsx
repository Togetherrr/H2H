import { HomePageClient } from "@/components/home-page-client"
import { officialLinks } from "@/lib/home-content"
import { getFilmFrames, getTimelineEvents } from "../lib/release-catalog"
import { memberProfiles } from "@/lib/member-profiles"
import { hearts2heartsOfficialProfile } from "@/lib/group-official-profile"

export const revalidate = 3600

export default async function HomePage() {
  const [timelineEvents, filmFrames] = await Promise.all([getTimelineEvents(), getFilmFrames(4)])

  return (
    <HomePageClient
      filmFrames={filmFrames}
      timelineEvents={timelineEvents}
      memberProfiles={memberProfiles}
      officialLinks={officialLinks}
      officialProfile={hearts2heartsOfficialProfile}
    />
  )
}
