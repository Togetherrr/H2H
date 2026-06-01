import { fetchMediaWikiSectionHtml, fetchMediaWikiSections } from "@/lib/wins/mediawiki"
import { extractHtmlTables, expandTableRowspans, parseHtmlTable } from "@/lib/wins/html-table"

export type ExternalMusicShowWin = {
  id: string
  date: string
  song: string
  program: string
  headline: string
  href: string
}

export type ExternalAwardCeremonyWin = {
  id: string
  ceremony: string
  year: string
  category: string
  href: string
}

function stableId(parts: string[]) {
  const input = parts.join("|")
  // FNV-1a 32-bit hash (deterministic, works in Edge + Node).
  let hash = 0x811c9dc5
  let i = 0
  while (i < input.length) {
    hash ^= input.charCodeAt(i)
    hash = (hash * 0x01000193) >>> 0
    i++
  }

  return hash.toString(16).padStart(8, "0")
}

function normalizeIsoDate(input: string) {
  const trimmed = input.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  // Best-effort: try Date parsing.
  const parsed = Date.parse(trimmed)
  if (Number.isNaN(parsed)) return ""
  const date = new Date(parsed)
  const yyyy = String(date.getUTCFullYear())
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0")
  const dd = String(date.getUTCDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function findSectionIndex(sections: { line: string; index: string }[], needle: string) {
  const lowerNeedle = needle.toLowerCase()
  const match = sections.find((s) => s.line.toLowerCase().includes(lowerNeedle))
  return match?.index ?? null
}

export async function fetchMusicShowWinsFromKpopFandom() {
  const apiBaseUrl = "https://kpop.fandom.com/api.php"
  const page = process.env.H2H_WINS_FANDOM_PAGE?.trim() || "List_of_awards_and_nominations_received_by_Hearts2Hearts"

  const sections = await fetchMediaWikiSections(apiBaseUrl, page, 2500)
  const sectionIndex =
    findSectionIndex(sections, "Music show wins") ??
    findSectionIndex(sections, "Music show") ??
    findSectionIndex(sections, "Wins")

  const html = await fetchMediaWikiSectionHtml({
    apiBaseUrl,
    page,
    section: sectionIndex ?? undefined,
    timeoutMs: 2500,
  })

  const tables = extractHtmlTables(html)
  if (tables.length === 0) return []

  // Pick the table that looks like: Year | Date | Song | Program
  const candidate = tables.find((tableHtml) => {
    const table = parseHtmlTable(tableHtml, "https://kpop.fandom.com")
    const headers = table.headers.map((h) => h.toLowerCase())
    return headers.includes("year") && headers.includes("date") && headers.includes("song") && headers.includes("program")
  })

  if (!candidate) return []

  const table = parseHtmlTable(candidate, "https://kpop.fandom.com")
  const expanded = expandTableRowspans(table.rows)

  let currentYear = ""
  const mapped: ExternalMusicShowWin[] = expanded
    .map((row) => {
      const yearCell = row.values[0]?.text ?? ""
      const dateCell = row.values[1]?.text ?? ""
      const songCell = row.values[2]?.text ?? ""
      const programCell = row.values[3]?.text ?? ""

      if (yearCell) currentYear = yearCell

      const fullDate = currentYear ? `${dateCell} ${currentYear}` : dateCell
      const date = normalizeIsoDate(fullDate)
      const song = songCell.replace(/^"|"$/g, "").trim()
      const program = programCell.trim()
      const href = row.values.find((cell) => cell.href && /^https?:\/\//.test(cell.href))?.href ?? ""
      const headline = song && program ? `${song} wins ${program}` : ""

      if (!date || !song || !program) return null

      return {
        id: stableId([date, song, program]),
        date,
        song,
        program,
        headline,
        href,
      }
    })
    .filter(Boolean) as ExternalMusicShowWin[]

  return mapped.sort((a, b) => (a.date < b.date ? 1 : -1))
}

function htmlToLooseText(html: string) {
  return html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*(p|div|li|tr|h\d)\s*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\u00a0/g, " ")
    .trim()
}

function parseSoridataDateRange(rangeLine: string) {
  const match = rangeLine.match(/(\d{2}-\d{2})\s*~\s*(\d{2}-\d{2})/)
  if (!match) return null
  return { start: match[1], end: match[2] }
}

// Note: Soridata's compact layout omits per-row show names; we only track year + song.

export async function fetchMusicShowWinsFromSoridata() {
  const artistKey = process.env.H2H_WINS_SORIDATA_ARTIST?.trim() || "Hearts2Hearts"
  const url = `https://soridata.com/en/awards/${encodeURIComponent(artistKey)}.html?layout=1`

  const response = await fetch(url, {
    headers: { Accept: "text/html" },
    next: { revalidate: 60 * 10 },
  })

  if (!response.ok) {
    return []
  }

  const html = await response.text()
  const text = htmlToLooseText(html)
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean)

  return parseSoridataWinsFromLines({ lines, artistKey, url })
}

function parseSoridataWinsFromLines({
  lines,
  artistKey,
  url,
}: {
  lines: string[]
  artistKey: string
  url: string
}) {

  let currentYear: number | null = null
  let currentRange: { start: string; end: string } | null = null
  const wins: ExternalMusicShowWin[] = []

  const normalizedArtist = artistKey.toLowerCase()

  let lineIndex = 0
  while (lineIndex < lines.length) {
    const line = lines[lineIndex]!
    lineIndex++
    const yearWeek = line.match(/^(\d{4})\s+(\d{1,2})$/)
    if (yearWeek) {
      currentYear = Number(yearWeek[1])
      currentRange = null
      continue
    }

    const parsedRange = parseSoridataDateRange(line)
    if (parsedRange && currentYear) {
      currentRange = parsedRange
      // The same line may include a first "artist winner" cell; ignore and read subsequent detail lines.
      continue
    }

    if (!currentYear || !currentRange) continue

    // Detail lines usually look like: "<Song> ... Hearts2Hearts" OR just "<Song>" on its own line.
    // We only need year + song, so we do not try to infer the exact program/date.
    const lower = line.toLowerCase()
    const includesArtist = lower.includes(normalizedArtist)

    let song = ""
    if (includesArtist) {
      const clean = line.replace(/\[[^\]]+\]/g, "").replace(/\s+/g, " ").trim()
      const idx = clean.toLowerCase().lastIndexOf(normalizedArtist)
      song = (idx > 0 ? clean.slice(0, idx) : clean).replace(/[-–—]+$/, "").trim()
    } else {
      // Likely a standalone song line (e.g. "RUDE!")
      // Skip obvious non-song lines.
      if (/^week\b/i.test(line)) continue
      if (/^\d{2}-\d{2}\s*~\s*\d{2}-\d{2}$/.test(line)) continue
      if (/^\d{4}\s+\d{1,2}$/.test(line)) continue
      if (line === "-" || line === "—") continue
      // keep short-ish lines that have at least 2 letters/numbers
      if (!/[a-z0-9]/i.test(line)) continue
      song = line.replace(/\[[^\]]+\]/g, "").trim()
    }

    song = song.replace(/^"|"$/g, "").trim()
    if (!song) continue

    const year = currentYear
    if (!year) continue

    // Represent the win date as Jan 1 of the winning year so downstream schema stays intact.
    const date = `${year}-01-01`

    wins.push({
      id: stableId([String(year), song]),
      date,
      song,
      program: "Music show win",
      headline: `${song} music show win`,
      href: url,
    })
  }

  // Dedup + sort
  const deduped = new Map<string, ExternalMusicShowWin>()
  let winIndex = 0
  while (winIndex < wins.length) {
    const win = wins[winIndex]!
    deduped.set(win.id, win)
    winIndex++
  }
  return Array.from(deduped.values()).sort((a, b) => (a.date < b.date ? 1 : -1))
}

type WikiShowSource = {
  program: string
  pageBase: string
}

const WIKI_SHOW_SOURCES: WikiShowSource[] = [
  { program: "The Show", pageBase: "List_of_The_Show_Chart_winners" },
  { program: "Show Champion", pageBase: "List_of_Show_Champion_Chart_winners" },
  { program: "M Countdown", pageBase: "List_of_M_Countdown_Chart_winners" },
  { program: "Music Bank", pageBase: "List_of_Music_Bank_Chart_winners" },
  { program: "Music Core", pageBase: "List_of_Show!_Music_Core_Chart_winners" },
  { program: "Inkigayo", pageBase: "List_of_Inkigayo_Chart_winners" },
]

function parseWikipediaDateToIso(input: string, targetYear?: number) {
  const trimmed = input.trim()
  if (!trimmed) return ""
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed

  let dateToParse = trimmed
  if (targetYear && !/\b\d{4}\b/.test(trimmed)) {
    dateToParse = `${trimmed}, ${targetYear}`
  }

  const parsed = Date.parse(dateToParse)
  if (Number.isNaN(parsed)) return ""
  const date = new Date(parsed)
  const yyyy = String(date.getUTCFullYear())
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0")
  const dd = String(date.getUTCDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export async function fetchMusicShowWinsFromWikipediaShowLists() {
  const apiBaseUrl = "https://en.wikipedia.org/w/api.php"
  const artist = process.env.H2H_WINS_ARTIST_NAME?.trim() || "Hearts2Hearts"

  const startYear = Number(process.env.H2H_DEBUT_YEAR ?? "2025") || 2025
  const endYear = new Date().getUTCFullYear()
  const years = Array.from({ length: Math.max(0, endYear - startYear + 1) }, (_, idx) => startYear + idx)
  const pages = WIKI_SHOW_SOURCES.flatMap((source) =>
    years.map((year) => ({ program: source.program, page: `${source.pageBase}_(${year})`, year })),
  )

  const results = await Promise.all(
    pages.map((source) =>
      fetchMediaWikiSectionHtml({
        apiBaseUrl,
        page: source.page,
        timeoutMs: 3000,
      })
        .then((html) => {
          const tables = extractHtmlTables(html)
          const candidate = tables.find((tableHtml) => {
            const table = parseHtmlTable(tableHtml, "https://en.wikipedia.org")
            const headers = table.headers.map((h) => h.toLowerCase())
            return headers.includes("date") && headers.includes("artist") && headers.includes("song")
          })

          if (!candidate) return [] as ExternalMusicShowWin[]

          const table = parseHtmlTable(candidate, "https://en.wikipedia.org")
          const headers = table.headers.map((h) => h.toLowerCase())
          const dateIndex = headers.indexOf("date")
          const artistIndex = headers.indexOf("artist")
          const songIndex = headers.indexOf("song")

          const expanded = expandTableRowspans(table.rows)

          const pageHref = `https://en.wikipedia.org/wiki/${encodeURIComponent(source.page)}`

          return expanded
            .map((row) => {
              const artistCell = row.values[(artistIndex === -1 ? 2 : artistIndex)]?.text ?? ""
              if (!artistCell.toLowerCase().includes(artist.toLowerCase())) return null

              const rawDate = row.values[(dateIndex === -1 ? 1 : dateIndex)]?.text ?? ""
              const rawSong = row.values[(songIndex === -1 ? 3 : songIndex)]?.text ?? ""

              const date = parseWikipediaDateToIso(rawDate, source.year)
              const song = rawSong.replace(/^"|"$/g, "").trim()
              if (!date || !song) return null

              return {
                id: stableId([date, source.program, song]),
                date,
                song,
                program: source.program,
                headline: `${song} wins on ${source.program}`,
                href: pageHref,
              } satisfies ExternalMusicShowWin
            })
            .filter(Boolean) as ExternalMusicShowWin[]
        })
        .catch(() => [] as ExternalMusicShowWin[]),
    ),
  )

  const flattened = results.flat()
  const deduped = new Map<string, ExternalMusicShowWin>()
  flattened.forEach((win) => deduped.set(win.id, win))
  return Array.from(deduped.values()).sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function fetchAwardCeremonyWinsFromWikipedia() {
  const apiBaseUrl = "https://en.wikipedia.org/w/api.php"
  const page = process.env.H2H_WINS_WIKIPEDIA_PAGE?.trim() || "Hearts2Hearts"

  const sections = await fetchMediaWikiSections(apiBaseUrl, page, 1500)
  const sectionIndex = findSectionIndex(sections, "Accolades") ?? findSectionIndex(sections, "Awards and nominations")

  const html = await fetchMediaWikiSectionHtml({
    apiBaseUrl,
    page,
    section: sectionIndex ?? undefined,
    timeoutMs: 1500,
  })

  const tables = extractHtmlTables(html)
  if (tables.length === 0) return []

  const candidate = tables.find((tableHtml) => {
    const table = parseHtmlTable(tableHtml, "https://en.wikipedia.org")
    const headers = table.headers.map((h) => h.toLowerCase())
    return headers.includes("award ceremony") && headers.includes("year") && headers.includes("category") && headers.includes("result")
  })

  if (!candidate) return []

  const table = parseHtmlTable(candidate, "https://en.wikipedia.org")
  const expanded = expandTableRowspans(table.rows)

  const pageHref = `https://en.wikipedia.org/wiki/${encodeURIComponent(page)}#Accolades`

  const mapped: ExternalAwardCeremonyWin[] = expanded
    .map((row) => {
      // Wikipedia table order: Award ceremony | Year | Category | Nominee/work | Result | Ref
      // But some rows can have missing nominee/work or extra columns; prefer header-based lookup.
      const headers = table.headers.map((h) => h.toLowerCase())

      const ceremonyIndex = headers.indexOf("award ceremony")
      const yearIndex = headers.indexOf("year")
      const categoryIndex = headers.indexOf("category")
      const resultIndex = headers.indexOf("result")

      const ceremony = (row.values[(ceremonyIndex === -1 ? 0 : ceremonyIndex)]?.text ?? "").trim()
      const year = (row.values[(yearIndex === -1 ? 1 : yearIndex)]?.text ?? "").trim()
      const category = (row.values[(categoryIndex === -1 ? 2 : categoryIndex)]?.text ?? "").trim()
      const resultRaw = (row.values[(resultIndex === -1 ? 4 : resultIndex)]?.text ?? "").toLowerCase()
      const result = resultRaw.replace(/\s+/g, " ").trim()

      if (!ceremony || !year || !category) return null
      if (result) {
        const normalized = result.replace(/[^\w ]+/g, "").trim()
        if (normalized !== "won" && normalized !== "winner" && normalized !== "win") return null
      }

      return {
        id: stableId([year, ceremony, category]),
        ceremony,
        year,
        category,
        href: pageHref,
      } satisfies ExternalAwardCeremonyWin
    })
    .filter(Boolean) as ExternalAwardCeremonyWin[]

  return mapped.sort((a, b) => (a.year < b.year ? 1 : a.ceremony.localeCompare(b.ceremony)))
}
