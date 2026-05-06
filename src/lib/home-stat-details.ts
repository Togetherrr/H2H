import { hearts2heartsOfficialProfile } from "@/lib/group-official-profile"
import { getReleaseCatalog } from "@/lib/release-catalog"

export type HomeStatSlug =
  | "debut-days"
  | "album-projects"
  | "music-show-wins"
  | "award-ceremony-wins"

export type DetailListItem = {
  title: string
  subtitle?: string
  meta?: string
  value?: string
  href?: string
  hrefLabel?: string
  chips?: string[]
}

export type DetailSection = {
  title: string
  description?: string
  items: DetailListItem[]
}

export type HomeStatDetailPage = {
  slug: HomeStatSlug
  eyebrow: string
  title: string
  summary: string
  total: number
  totalLabel: string
  sourceLabel: string
  sourceHref: string
  sourceNote: string
  sections: DetailSection[]
}

type MusicShowWinEntry = {
  date: string
  song: string
  program: string
  headline: string
  href: string
}

type AwardCeremonyWinEntry = {
  ceremony: string
  year: string
  category: string
  href: string
}

const musicShowWins: MusicShowWinEntry[] = [
  {
    date: "2025-03-11",
    song: "The Chase",
    program: "The Show",
    headline: "1st-ever win on The Show",
    href: "https://www.soompi.com/article/1729235wpp/watch-hearts2hearts-takes-1st-ever-win-on-the-show-with-the-chase-performances-by-onewe-young-posse-and-more",
  },
  {
    date: "2025-10-28",
    song: "FOCUS",
    program: "The Show",
    headline: "1st win for FOCUS",
    href: "https://www.soompi.com/article/1793694wpp/watch-hearts2hearts-takes-1st-win-for-focus-on-the-show-performances-by-jang-haneum-izna-and-more",
  },
  {
    date: "2026-03-05",
    song: "RUDE!",
    program: "M Countdown",
    headline: "1st win for RUDE!",
    href: "https://www.soompi.com/article/1823164wpp/watch-hearts2hearts-takes-1st-win-for-rude-on-m-countdown-performances-by-woodz-tunexx-and-more",
  },
  {
    date: "2026-03-14",
    song: "RUDE!",
    program: "Music Core",
    headline: "2nd win for RUDE!",
    href: "https://www.soompi.com/article/1824999wpp/watch-hearts2hearts-takes-1st-ever-public-broadcast-network-music-show-win-on-music-core-with-rude-performances-by-yena-and-more",
  },
  {
    date: "2026-03-19",
    song: "RUDE!",
    program: "M Countdown",
    headline: "3rd win for RUDE!",
    href: "https://www.soompi.com/article/1826437wpp/watch-hearts2hearts-takes-3rd-win-for-rude-on-m-countdown-performances-by-itzy-ab6ix-and-more",
  },
  {
    date: "2026-03-21",
    song: "RUDE!",
    program: "Music Core",
    headline: "4th win for RUDE!",
    href: "https://www.soompi.com/article/1826804wpp/watch-hearts2hearts-takes-4th-win-for-rude-on-music-core-performances-by-yena-p1harmony-and-more",
  },
  {
    date: "2026-03-22",
    song: "RUDE!",
    program: "Inkigayo",
    headline: "5th win for RUDE!",
    href: "https://www.soompi.com/article/1826879wpp/watch-hearts2hearts-takes-1st-ever-inkigayo-win-with-rude-performances-by-yena-p1harmony-and-more",
  },
]

const awardCeremonyWins: AwardCeremonyWinEntry[] = [
  {
    ceremony: "Asia Star Entertainer Awards",
    year: "2025",
    category: "The Best New Artist",
    href: "https://en.wikipedia.org/wiki/Hearts2Hearts#Accolades",
  },
  {
    ceremony: "Brand of the Year Awards",
    year: "2025",
    category: "Female Idol Rising Star – Indonesia",
    href: "https://en.wikipedia.org/wiki/Hearts2Hearts#Accolades",
  },
  {
    ceremony: "Brand of the Year Awards",
    year: "2025",
    category: "Female Rookie Idol",
    href: "https://en.wikipedia.org/wiki/Hearts2Hearts#Accolades",
  },
  {
    ceremony: "D Awards",
    year: "2026",
    category: "Dreams Silver Label",
    href: "https://en.wikipedia.org/wiki/Hearts2Hearts#Accolades",
  },
  {
    ceremony: "The Fact Music Awards",
    year: "2025",
    category: "Next Leader Award",
    href: "https://en.wikipedia.org/wiki/Hearts2Hearts#Accolades",
  },
  {
    ceremony: "Golden Disc Awards",
    year: "2026",
    category: "Most Popular Artist – Female",
    href: "https://en.wikipedia.org/wiki/Hearts2Hearts#Accolades",
  },
  {
    ceremony: "Hanteo Music Awards",
    year: "2026",
    category: "Rookie of the Year",
    href: "https://en.wikipedia.org/wiki/Hearts2Hearts#Accolades",
  },
  {
    ceremony: "Hanteo Music Awards",
    year: "2026",
    category: "Best Artist Pick – Female",
    href: "https://en.wikipedia.org/wiki/Hearts2Hearts#Accolades",
  },
  {
    ceremony: "K-World Dream Awards",
    year: "2025",
    category: "Super Rookie Award",
    href: "https://en.wikipedia.org/wiki/Hearts2Hearts#Accolades",
  },
  {
    ceremony: "Korea First Brand Awards",
    year: "2026",
    category: "Female Rookie Idol",
    href: "https://en.wikipedia.org/wiki/Hearts2Hearts#Accolades",
  },
  {
    ceremony: "Korea First Brand Awards",
    year: "2026",
    category: "Female Rookie Idol (Indonesia)",
    href: "https://en.wikipedia.org/wiki/Hearts2Hearts#Accolades",
  },
  {
    ceremony: "Korea First Brand Awards",
    year: "2026",
    category: "Female Rookie Idol (Vietnam)",
    href: "https://en.wikipedia.org/wiki/Hearts2Hearts#Accolades",
  },
  {
    ceremony: "Korea Grand Music Awards",
    year: "2025",
    category: "IS Rising Star",
    href: "https://en.wikipedia.org/wiki/Hearts2Hearts#Accolades",
  },
  {
    ceremony: "MAMA Awards",
    year: "2025",
    category: "Best New Artist",
    href: "https://en.wikipedia.org/wiki/Hearts2Hearts#Accolades",
  },
  {
    ceremony: "MAMA Awards",
    year: "2025",
    category: "Fans' Choice Top 10 – Female",
    href: "https://en.wikipedia.org/wiki/Hearts2Hearts#Accolades",
  },
  {
    ceremony: "MAMA Awards",
    year: "2025",
    category: "Olive Young K-Beauty Artist",
    href: "https://en.wikipedia.org/wiki/Hearts2Hearts#Accolades",
  },
  {
    ceremony: "Melon Music Awards",
    year: "2025",
    category: "Berriz Global Fans' Choice",
    href: "https://en.wikipedia.org/wiki/Hearts2Hearts#Accolades",
  },
  {
    ceremony: "Melon Music Awards",
    year: "2025",
    category: "New Artist of the Year",
    href: "https://en.wikipedia.org/wiki/Hearts2Hearts#Accolades",
  },
  {
    ceremony: "Seoul Music Awards",
    year: "2025",
    category: "Rookie of the Year",
    href: "https://en.wikipedia.org/wiki/Hearts2Hearts#Accolades",
  },
]

function formatIsoDate(date: string) {
  return new Date(`${date}T00:00:00+09:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function countBy<T>(items: T[], getKey: (item: T) => string) {
  const counts = new Map<string, number>()

  items.forEach((item) => {
    const key = getKey(item)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  })

  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

async function getDebutDaysDetail(): Promise<HomeStatDetailPage> {
  const catalog = await getReleaseCatalog()
  const debutDate = hearts2heartsOfficialProfile.debutDate
  const daysSinceDebut = Math.max(
    0,
    Math.floor((Date.now() - new Date(`${debutDate}T00:00:00+09:00`).getTime()) / (1000 * 60 * 60 * 24)),
  )

  return {
    slug: "debut-days",
    eyebrow: "Home stats detail",
    title: "Days since debut",
    summary:
      "A timeline-style overview of the group's debut anchor and the releases that followed, designed so you can keep adding future milestones without restructuring the page.",
    total: daysSinceDebut,
    totalLabel: "days counted from February 24, 2025",
    sourceLabel: "Wikipedia - Hearts2Hearts",
    sourceHref: "https://en.wikipedia.org/wiki/Hearts2Hearts",
    sourceNote: "Debut date verified from the public group profile entry.",
    sections: [
      {
        title: "Debut anchor",
        items: [
          {
            title: "Hearts2Hearts debut",
            subtitle: "Single album: The Chase",
            meta: "February 24, 2025",
            value: `${daysSinceDebut.toLocaleString()} days active`,
            href: "https://en.wikipedia.org/wiki/Hearts2Hearts",
            hrefLabel: "Open public profile source",
          },
        ],
      },
      {
        title: "Release milestones",
        description: "This list is generated from the current release catalog so later releases can be appended cleanly.",
        items: catalog.map((release) => ({
          title: release.title,
          subtitle: release.type,
          meta: release.date,
          chips: release.tracks.slice(0, 3),
          href: `/albums/${release.slug}`,
          hrefLabel: "Open album detail",
        })),
      },
    ],
  }
}

async function getAlbumProjectsDetail(): Promise<HomeStatDetailPage> {
  const catalog = await getReleaseCatalog()
  const albumProjects = catalog.filter((release) => {
    const normalized = release.type.toLowerCase()
    return normalized.includes("album") || normalized.includes("ep") || normalized.includes("debut")
  })

  return {
    slug: "album-projects",
    eyebrow: "Home stats detail",
    title: "Album projects",
    summary:
      "A scalable release index for album-format projects. As more albums, EPs, or similar packages are added, this page can continue listing them without changing the layout.",
    total: albumProjects.length,
    totalLabel: "album-format projects tracked",
    sourceLabel: "Discography references",
    sourceHref: "https://en.wikipedia.org/wiki/Hearts2Hearts#Discography",
    sourceNote: "Counted from the current discography model used on the homepage.",
    sections: [
      {
        title: "Project list",
        items: albumProjects.map((release) => ({
          title: release.title,
          subtitle: release.subtitle,
          meta: `${release.type} • ${release.date}`,
          value: `${release.tracks.length} track${release.tracks.length === 1 ? "" : "s"}`,
          chips: release.tracks.slice(0, 4),
          href: `/albums/${release.slug}`,
          hrefLabel: "Open album detail",
        })),
      },
    ],
  }
}

function getMusicShowWinsDetail(): HomeStatDetailPage {
  const songCounts = countBy(musicShowWins, (item) => item.song)
  const programCounts = countBy(musicShowWins, (item) => item.program)

  return {
    slug: "music-show-wins",
    eyebrow: "Home stats detail",
    title: "Music show wins",
    summary:
      "A two-layer detail page that can scale as new songs win across more programs: first by song, then by show, followed by a complete win log.",
    total: musicShowWins.length,
    totalLabel: "weekly music show trophies verified",
    sourceLabel: "Soompi win reports",
    sourceHref: "https://www.soompi.com",
    sourceNote: "Counted from individual public win articles for The Show, M Countdown, Music Core, and Inkigayo.",
    sections: [
      {
        title: "Wins by song",
        items: songCounts.map(([song, wins]) => ({
          title: song,
          value: `${wins} win${wins === 1 ? "" : "s"}`,
          chips: musicShowWins.filter((item) => item.song === song).map((item) => item.program),
        })),
      },
      {
        title: "Wins by program",
        items: programCounts.map(([program, wins]) => ({
          title: program,
          value: `${wins} win${wins === 1 ? "" : "s"}`,
          chips: musicShowWins.filter((item) => item.program === program).map((item) => item.song),
        })),
      },
      {
        title: "Full win log",
        description: "Each entry points to the public report for that trophy.",
        items: musicShowWins.map((item) => ({
          title: item.headline,
          subtitle: `${item.song} • ${item.program}`,
          meta: formatIsoDate(item.date),
          href: item.href,
          hrefLabel: "Open source article",
        })),
      },
    ],
  }
}

function getAwardCeremonyWinsDetail(): HomeStatDetailPage {
  const ceremonyCounts = countBy(awardCeremonyWins, (item) => item.ceremony)

  return {
    slug: "award-ceremony-wins",
    eyebrow: "Home stats detail",
    title: "Award ceremony wins",
    summary:
      "A clean trophy archive focused on group wins only. The structure supports future growth by grouping first by ceremony and then listing each winning category in full.",
    total: awardCeremonyWins.length,
    totalLabel: "group award-ceremony wins tracked",
    sourceLabel: "Wikipedia accolades snapshot",
    sourceHref: "https://en.wikipedia.org/wiki/Hearts2Hearts#Accolades",
    sourceNote: "Counted from public accolade entries for group wins only, excluding individual member awards.",
    sections: [
      {
        title: "Wins by ceremony",
        items: ceremonyCounts.map(([ceremony, wins]) => ({
          title: ceremony,
          value: `${wins} win${wins === 1 ? "" : "s"}`,
          chips: awardCeremonyWins
            .filter((item) => item.ceremony === ceremony)
            .map((item) => `${item.year} • ${item.category}`),
        })),
      },
      {
        title: "Full trophy list",
        description: "Each category below is a separate group win that contributes to the homepage total.",
        items: awardCeremonyWins.map((item) => ({
          title: item.category,
          subtitle: item.ceremony,
          meta: item.year,
          href: item.href,
          hrefLabel: "Open accolades source",
        })),
      },
    ],
  }
}

export const HOME_STAT_SLUGS: HomeStatSlug[] = [
  "debut-days",
  "album-projects",
  "music-show-wins",
  "award-ceremony-wins",
]

export async function getHomeStatDetailPage(slug: HomeStatSlug): Promise<HomeStatDetailPage> {
  switch (slug) {
    case "debut-days":
      return getDebutDaysDetail()
    case "album-projects":
      return getAlbumProjectsDetail()
    case "music-show-wins":
      return getMusicShowWinsDetail()
    case "award-ceremony-wins":
      return getAwardCeremonyWinsDetail()
  }
}
