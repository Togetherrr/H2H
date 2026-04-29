import { getReleaseCatalog, type ReleaseRecord } from "@/lib/release-catalog"
import { getUpcomingComeback, type HomeStatSource, type UpcomingComeback } from "@/lib/comeback-provider"

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

const MUSIC_SHOW_WINS = 7
const MUSIC_SHOW_SOURCE_NOTE =
  "Counted public weekly wins: The Show (The Chase, FOCUS) and RUDE! on M Countdown, Music Core twice, and Inkigayo."
const AWARD_CEREMONY_WINS = 19
const AWARD_CEREMONY_SOURCE_NOTE =
  "Wikipedia accolades snapshot counted group award-ceremony wins only as of April 27, 2026."
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

  return {
    debutDate,
    albumCount: catalog.filter(isAlbumProject).length,
    musicShowWins: MUSIC_SHOW_WINS,
    musicShowSourceNote: MUSIC_SHOW_SOURCE_NOTE,
    awardCeremonyWins: AWARD_CEREMONY_WINS,
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
        label: "Music show wins references",
        href: "https://kpop.fandom.com/wiki/List_of_awards_and_nominations_received_by_Hearts2Hearts",
      },
      awardCeremonies: {
        label: "Accolades snapshot",
        href: "https://en.wikipedia.org/wiki/Hearts2Hearts#Accolades",
      },
    },
    upcomingComeback: await getUpcomingComeback(),
  }
}
