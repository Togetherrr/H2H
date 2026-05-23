import { cache } from "react"

export type MediaWikiSection = {
  line: string
  number: string
  index: string
}

export type MediaWikiWikitextResponse = {
  parse?: {
    title?: string
    pageid?: number
    wikitext?: {
      "*": string
    }
    text?: {
      "*": string
    }
    sections?: MediaWikiSection[]
  }
  error?: {
    info?: string
  }
}

export type FetchWikitextOptions = {
  apiBaseUrl: string
  page: string
  section?: string | number
  timeoutMs?: number
}

async function fetchJsonWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  const response = await fetch(url, {
    signal: controller.signal,
    headers: {
      Accept: "application/json",
      // Wikipedia APIs may throttle/deny generic serverless traffic without a UA.
      "User-Agent": "H2H-Wins/1.0 (Next.js; contact: local-project)",
    },
    // Wins tables can update frequently; keep cache short so "latest trophies" show up quickly.
    next: { revalidate: 60 * 10 },
  }).finally(() => clearTimeout(timeout))

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`)
  }

  return response.json()
}

export const fetchMediaWikiSections = cache(async (apiBaseUrl: string, page: string, timeoutMs = 1500) => {
  const url =
    `${apiBaseUrl}?action=parse&prop=sections&format=json&origin=*` +
    `&page=${encodeURIComponent(page)}`

  const payload = (await fetchJsonWithTimeout(url, timeoutMs)) as MediaWikiWikitextResponse
  const sections = payload.parse?.sections ?? []
  return sections
})

export const fetchMediaWikiWikitext = cache(async (options: FetchWikitextOptions) => {
  const timeoutMs = options.timeoutMs ?? 1500
  const sectionParam =
    typeof options.section === "undefined" ? "" : `&section=${encodeURIComponent(String(options.section))}`

  const url =
    `${options.apiBaseUrl}?action=parse&prop=wikitext&format=json&origin=*` +
    `&page=${encodeURIComponent(options.page)}` +
    sectionParam

  const payload = (await fetchJsonWithTimeout(url, timeoutMs)) as MediaWikiWikitextResponse
  const text = payload.parse?.wikitext?.["*"] ?? ""

  if (!text) {
    const message = payload.error?.info ?? "Missing wikitext payload."
    throw new Error(message)
  }

  return text
})

export type FetchHtmlOptions = FetchWikitextOptions

export const fetchMediaWikiSectionHtml = cache(async (options: FetchHtmlOptions) => {
  const timeoutMs = options.timeoutMs ?? 1500
  const sectionParam =
    typeof options.section === "undefined" ? "" : `&section=${encodeURIComponent(String(options.section))}`

  const url =
    `${options.apiBaseUrl}?action=parse&prop=text&format=json&origin=*` +
    `&page=${encodeURIComponent(options.page)}` +
    sectionParam

  const payload = (await fetchJsonWithTimeout(url, timeoutMs)) as MediaWikiWikitextResponse
  const html = payload.parse?.text?.["*"] ?? ""

  if (!html) {
    const message = payload.error?.info ?? "Missing HTML payload."
    throw new Error(message)
  }

  return html
})
