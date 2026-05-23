import { getReleaseCatalog, type ReleaseRecord } from "@/lib/release-catalog"
import { getUpcomingComeback, type HomeStatSource, type UpcomingComeback } from "@/lib/comeback-provider"
import { getWinsCount } from "@/lib/supabase/wins-service"

export type HomeStatsSnapshot = {
  debutDate: string
  albumCount: number
  musicShowWins: number
  musicShowSourceNote: string
  awardCeremonyWins: number
  awardCeremonySourceNote: string
  latestRelease: {
    slug: string
    title: string
    date: string
    mvUrl: string | null
    mvLabel: string
    sourceLabel: string
  }
  sources: {
    debut: HomeStatSource
    albums: HomeStatSource
    musicShows: HomeStatSource
    awardCeremonies: HomeStatSource
  }
  upcomingComeback: UpcomingComeback | null
}

const MUSIC_SHOW_SOURCE_NOTE = "Auto-synced from Wikipedia winner lists for major music programs."
const AWARD_CEREMONY_SOURCE_NOTE = "Auto-synced from Wikipedia Accolades when available."
const RELEASE_VIDEO_MAP: Record<string, string> = {
  "the-chase": "https://www.youtube.com/results?search_query=Hearts2Hearts+The+Chase+MV",
  style: "https://www.youtube.com/results?search_query=Hearts2Hearts+Style+MV",
  "pretty-please": "https://www.youtube.com/results?search_query=Hearts2Hearts+Pretty+Please+MV",
  focus: "https://www.youtube.com/results?search_query=Hearts2Hearts+Focus+MV",
  rude: "https://www.youtube.com/watch?v=F7sGJVUrkjQ&list=RDF7sGJVUrkjQ&start_radio=1&pp=ygUVSGVhcnRzMkhlYXJ0cyBSVURFIE1WoAcB",
}

function parseReleaseDate(date: string) {
  const [day, month, year] = date.split("/").map(Number)

  if (day && month && year) {
    return new Date(year, month - 1, day).getTime()
  }

  const fallback = Date.parse(date)
  return Number.isNaN(fallback) ? 0 : fallback
}


function isAlbumProject(release: ReleaseRecord) {
  const normalized = release.type.toLowerCase()

  if (normalized.includes("remix")) {
    return false
  }

  return (
    normalized.includes("album") ||
    normalized.includes("ep") ||
    normalized.includes("mini") ||
    normalized.includes("debut")
  )
}


function getLatestReleaseVideoUrl(release: ReleaseRecord) {
  const override = process.env.H2H_LATEST_RELEASE_MV_URL?.trim()

  if (override) {
    return override
  }

  return RELEASE_VIDEO_MAP[release.slug] ?? null
}

export async function getHomeStatsSnapshot(debutDate: string): Promise<HomeStatsSnapshot> {
  const catalog = await getReleaseCatalog()
  const sortedCatalog = [...catalog].sort((a, b) => parseReleaseDate(b.date) - parseReleaseDate(a.date))
  const latestRelease =
    sortedCatalog[0] ??
    ({
      slug: "latest-release-template",
      title: "Latest release template",
      date: "",
      type: "",
      cover: "/group.png",
      subtitle: "",
      summary: "",
      tracks: [],
    } satisfies ReleaseRecord)
  const latestReleaseMvUrl = getLatestReleaseVideoUrl(latestRelease)
  const { musicShowWins, awardCeremonyWins } = await getWinsCount()
  const safeMusicShowWins = musicShowWins > 0 ? musicShowWins : 0
  const safeAwardCeremonyWins = awardCeremonyWins > 0 ? awardCeremonyWins : 0

  return {
    debutDate,
    albumCount: catalog.filter(isAlbumProject).length,
    musicShowWins: safeMusicShowWins,
    musicShowSourceNote: MUSIC_SHOW_SOURCE_NOTE,
    awardCeremonyWins: safeAwardCeremonyWins,
    awardCeremonySourceNote: AWARD_CEREMONY_SOURCE_NOTE,
    latestRelease: {
      slug: latestRelease.slug,
      title: latestRelease.title,
      date: latestRelease.date,
      mvUrl: latestReleaseMvUrl,
      mvLabel: process.env.H2H_LATEST_RELEASE_MV_LABEL?.trim() || "Official MV",
      sourceLabel: process.env.H2H_LATEST_RELEASE_SOURCE_LABEL?.trim() || "Latest release template",
    },
    sources: {
      debut: {
        label: "Wikipedia - Hearts2Hearts",
        href: "https://en.wikipedia.org/wiki/Hearts2Hearts",
      },
      albums: {
        label: "Discography references",
        href: "https://en.wikipedia.org/wiki/Hearts2Hearts#Discography",
      },
      musicShows: {
        label: "Wikipedia - Music show winners lists",
        href: "https://en.wikipedia.org/wiki/List_of_M_Countdown_Chart_winners_(2026)",
      },
      awardCeremonies: {
        label: "Wikipedia - Accolades",
        href: "https://en.wikipedia.org/wiki/Hearts2Hearts#Accolades",
      },
    },
    upcomingComeback: await getUpcomingComeback(),
  }
}
