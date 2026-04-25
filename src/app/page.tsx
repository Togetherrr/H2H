import { HomePageClient } from "@/components/home-page-client"
import { getCurrentProfile } from "@/lib/auth"
import { officialLinks } from "@/lib/home-content"
import { getFilmFrames, getTimelineEvents } from "../lib/release-catalog"
import { memberProfiles } from "@/lib/member-profiles"
import { hearts2heartsOfficialProfile } from "@/lib/group-official-profile"
import { hasSupabaseEnv } from "@/lib/supabase/env"

export const revalidate = 3600

export default async function HomePage() {
  const [timelineEvents, filmFrames] = await Promise.all([getTimelineEvents(), getFilmFrames(4)])
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

  return (
    <HomePageClient
      filmFrames={filmFrames}
      timelineEvents={timelineEvents}
      memberProfiles={memberProfiles}
      officialLinks={officialLinks}
      officialProfile={hearts2heartsOfficialProfile}
      headerAccount={headerAccount}
    />
  )
}
