import { cache } from "react"

export type TimelineEvent = {
  slug: string
  date: string
  title: string
  type: string
  cover: string
}

export type FilmFrame = {
  src: string
  alt: string
  label: string
}

export type ReleaseRecord = {
  slug: string
  date: string
  title: string
  type: string
  cover: string
  subtitle: string
  summary: string
  tracks: string[]
  sourceUrl?: string
  spotifyId?: string
  youtubeId?: string
}

export const REVALIDATE_SECONDS = 60 * 60
const WIKIDATA_TIMEOUT_MS = 1500
const WIKIPEDIA_TIMEOUT_MS = 900

let lastGoodCatalog: ReleaseRecord[] | null = null

const fallbackReleaseCatalog: ReleaseRecord[] = [
  {
    slug: "the-chase",
    date: "24/02/2025",
    title: "The Chase",
    type: "Debut Single",
    cover: "/the-chase.jpg",
    subtitle: "The Beginning",
    summary:
      "The official debut of Hearts2Hearts, marking the start of their journey with a mysterious yet emotional soundscape that explores the thrill of the hunt for one's true self.",
    tracks: ["The Chase", "Butterflies"],
    spotifyId: "6E6oNstYdE6pE0N6U9O0O9", 
    youtubeId: "kxUA2wwYiME", 
  },
  {
    slug: "style",
    date: "18/06/2025",
    title: "Style",
    type: "Single",
    cover: "/style.jpg",
    subtitle: "Summer Vibes",
    summary:
      "A vibrant summer comeback that showcases a more energetic and colorful side of the group, celebrating individuality and personal flair.",
    tracks: ["Style"],
    spotifyId: "123StyleID456",
    youtubeId: "n7kFRxFIPrI",
  },
  {
    slug: "pretty-please",
    date: "24/09/2025",
    title: "Pretty Please",
    type: "Pre-release",
    cover: "/style.jpg",
    subtitle: "First Glimpse",
    summary:
      "A sophisticated pre-release track that sets the stage for the group's first EP, blending retro pop elements with modern production.",
    tracks: ["Pretty Please"],
    spotifyId: "PrettyPleaseID789",
    youtubeId: "ufwB9Uja_wM",
  },
  {
    slug: "focus",
    date: "20/10/2025",
    title: "Focus",
    type: "1st EP",
    cover: "/focus.jpg",
    subtitle: "The Collection",
    summary:
      "Hearts2Hearts' first EP marks their artistic maturity, featuring a diverse range of tracks from upbeat dance anthems to soul-stirring ballads.",
    tracks: ["Focus", "Pretty Please", "Apple Pie", "Flutter", "Blue Moon"],
    spotifyId: "4cM1oGfJ5fLwV7G5h7O5fL",
    youtubeId: "Ur7aK4FvK-U",
  },
  {
    slug: "rude",
    date: "20/02/2026",
    title: "RUDE!",
    type: "Single",
    cover: "/group.png",
    subtitle: "Bold Statement",
    summary:
      "A powerful early-2026 comeback with a sharp visual style and high-octane energy, signaling a new chapter of confidence for the group.",
    tracks: ["RUDE!"],
    spotifyId: "RUDE_spotify_id",
    youtubeId: "F7sGJVUrkjQ",
  },
]

function formatDateDDMMYYYY(input: string) {
  const clean = input.replace(/^\+/, "")
  const date = new Date(clean)

  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  const day = String(date.getUTCDate()).padStart(2, "0")
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const year = String(date.getUTCFullYear())

  return `${day}/${month}/${year}`
}

function getYearFromDate(date: string) {
  return date.split("/")[2] ?? ""
}

function parseDateFromDDMMYYYY(date: string) {
  const [day, month, year] = date.split("/").map(Number)

  if (day && month && year) {
    return new Date(year, month - 1, day).getTime()
  }

  const fallback = Date.parse(date)
  return Number.isNaN(fallback) ? 0 : fallback
}

function toSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

type WikidataBinding = {
  item?: { value?: string }
  itemLabel?: { value?: string }
  releaseDate?: { value?: string }
  instanceLabel?: { value?: string }
  cover?: { value?: string }
}

async function fetchWikipediaSummary(title: string) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), WIKIPEDIA_TIMEOUT_MS)

  const response = await fetch(url, {
    signal: controller.signal,
    next: { revalidate: REVALIDATE_SECONDS },
    headers: {
      Accept: "application/json",
    },
  }).finally(() => clearTimeout(timeout))

  if (!response.ok) {
    return ""
  }

  const data = (await response.json()) as { extract?: string }
  return data.extract ?? ""
}

async function fetchWikidataCatalog(): Promise<ReleaseRecord[]> {
  const qid = process.env.WIKIDATA_ARTIST_QID || "Q134267440" // Hearts2Hearts Real QID

  if (!qid) {
    return []
  }

  const query = `
SELECT ?item ?itemLabel ?releaseDate ?instanceLabel ?cover WHERE {
  ?item wdt:P175 wd:${qid};
        wdt:P577 ?releaseDate.
  OPTIONAL { ?item wdt:P31 ?instance. }
  OPTIONAL { ?item wdt:P18 ?cover. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY ?releaseDate
`

  const endpoint = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), WIKIDATA_TIMEOUT_MS)

  const response = await fetch(endpoint, {
    signal: controller.signal,
    next: { revalidate: REVALIDATE_SECONDS },
    headers: {
      Accept: "application/sparql-results+json",
      "User-Agent": "H2H-Timeline/1.0 (Next.js; contact: local-project)",
    },
  }).finally(() => clearTimeout(timeout))

  if (!response.ok) {
    return []
  }

  const payload = (await response.json()) as {
    results?: { bindings?: WikidataBinding[] }
  }

  const bindings = payload.results?.bindings ?? []
  if (bindings.length === 0) {
    return []
  }

  const mapped = await Promise.all(
    bindings
      .filter((binding) => binding.itemLabel?.value && binding.releaseDate?.value)
      .map(async (binding) => {
        const title = binding.itemLabel?.value ?? "Untitled"
        const date = formatDateDDMMYYYY(binding.releaseDate?.value ?? "")
        const type = binding.instanceLabel?.value ?? "Release"
        const year = getYearFromDate(date)
        return {
          slug: toSlug(title),
          title,
          date,
          type,
          cover: binding.cover?.value ?? "/group.png",
          subtitle: year ? `${year} ${type}` : type,
          summary: `Auto-synced from Wikidata for ${title}.`,
          tracks: [],
          sourceUrl: binding.item?.value,
        } satisfies ReleaseRecord
      }),
  )

  const deduped = new Map<string, ReleaseRecord>()
  mapped.forEach((release) => {
    const key = `${release.slug}-${release.date}`
    if (!deduped.has(key)) {
      deduped.set(key, release)
    }
  })

  return Array.from(deduped.values())
}

export const getReleaseCatalog = cache(async () => {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return fallbackReleaseCatalog
  }

  try {
    const wikiCatalog = await fetchWikidataCatalog()
    if (wikiCatalog.length > 0) {
      lastGoodCatalog = wikiCatalog
      return wikiCatalog
    }
  } catch {
    // ignore
  }

  return lastGoodCatalog?.length ? lastGoodCatalog : fallbackReleaseCatalog
})

export async function getReleaseBySlug(slug: string) {
  const catalog = await getReleaseCatalog()
  const release = catalog.find((r) => r.slug === slug)
  
  if (release && release.summary.includes("Auto-synced")) {
    try {
      const summary = await fetchWikipediaSummary(release.title)
      if (summary) {
        return { ...release, summary }
      }
    } catch {
      // stay with fallback
    }
  }
  
  return release
}

export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  const catalog = await getReleaseCatalog()
  return [...catalog]
    .sort((a, b) => parseDateFromDDMMYYYY(a.date) - parseDateFromDDMMYYYY(b.date))
    .map(({ slug, date, title, type, cover }) => ({
    slug,
    date,
    title,
    type,
    cover,
    }))
}

export async function getFilmFrames(limit = 4): Promise<FilmFrame[]> {
  const catalog = await getReleaseCatalog()

  return catalog
    .slice(-limit)
    .reverse()
    .map((release) => ({
      src: release.cover,
      alt: `${release.title} concept frame`,
      label: release.title,
    }))
}
