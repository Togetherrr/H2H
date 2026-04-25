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
}

export const REVALIDATE_SECONDS = 60 * 60

const fallbackReleaseCatalog: ReleaseRecord[] = [
  {
    slug: "the-chase",
    date: "24/02/2025",
    title: "The Chase",
    type: "Debut",
    cover: "/the-chase.jpg",
    subtitle: "Debut Era",
    summary:
      "Debut chính thức của Hearts2Hearts, mở đầu hành trình của nhóm với màu sắc bí ẩn nhưng giàu cảm xúc.",
    tracks: ["The Chase", "Butterflies"],
  },
  {
    slug: "style",
    date: "18/06/2025",
    title: "Style",
    type: "Comeback",
    cover: "/style.jpg",
    subtitle: "Summer Comeback",
    summary:
      "Một đợt trở lại mang năng lượng tươi sáng hơn, giúp mở rộng hình ảnh của nhóm sau debut.",
    tracks: ["Style"],
  },
  {
    slug: "pretty-please",
    date: "24/09/2025",
    title: "Pretty Please",
    type: "Pre-release",
    cover: "/style.jpg",
    subtitle: "Pre-release",
    summary:
      "Bản phát hành mở màn cho giai đoạn EP đầu tay, cho thấy hướng phát triển rõ ràng về âm nhạc và concept.",
    tracks: ["Pretty Please"],
  },
  {
    slug: "focus",
    date: "20/10/2025",
    title: "Focus",
    type: "1st EP",
    cover: "/focus.jpg",
    subtitle: "1st EP",
    summary:
      "EP đầu tiên đánh dấu cột mốc trưởng thành của Hearts2Hearts với hệ thống bài hát và concept hoàn chỉnh hơn.",
    tracks: ["Focus", "Pretty Please", "Apple Pie", "Flutter", "Blue Moon"],
  },
  {
    slug: "rude",
    date: "20/02/2026",
    title: "RUDE!",
    type: "Comeback",
    cover: "/group.png",
    subtitle: "2026 Comeback",
    summary:
      "Comback đầu năm 2026 với hình ảnh sắc nét và năng lượng mạnh mẽ hơn, mở nhịp hoạt động mới của nhóm.",
    tracks: ["RUDE!"],
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

  const response = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: {
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    return ""
  }

  const data = (await response.json()) as { extract?: string }
  return data.extract ?? ""
}

async function fetchWikidataCatalog(): Promise<ReleaseRecord[]> {
  const qid = process.env.WIKIDATA_ARTIST_QID

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
  const response = await fetch(endpoint, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: {
      Accept: "application/sparql-results+json",
      "User-Agent": "H2H-Timeline/1.0 (Next.js; contact: local-project)",
    },
  })

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
        const summary = await fetchWikipediaSummary(title)

        return {
          slug: toSlug(title),
          title,
          date,
          type,
          cover: binding.cover?.value ?? "/group.png",
          subtitle: year ? `${year} ${type}` : type,
          summary: summary || `Auto-synced from Wikidata for ${title}.`,
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
  const wikiCatalog = await fetchWikidataCatalog()
  return wikiCatalog.length > 0 ? wikiCatalog : fallbackReleaseCatalog
})

export async function getReleaseBySlug(slug: string) {
  const catalog = await getReleaseCatalog()
  return catalog.find((release) => release.slug === slug)
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