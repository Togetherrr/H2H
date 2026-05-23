function stripTemplates(input: string) {
  let value = input
  // Best-effort template removal; not a full wikicode parser.
  for (let i = 0; i < 6; i++) {
    const next = value.replace(/\{\{[^{}]*\}\}/g, "")
    if (next === value) break
    value = next
  }
  return value
}

function stripRefs(input: string) {
  return input
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, "")
    .replace(/<ref[^/>]*\/>/gi, "")
}

function stripHtml(input: string) {
  return input.replace(/<[^>]+>/g, "")
}

function decodeEntities(input: string) {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

export function cleanWikicodeCell(input: string) {
  let value = input

  value = stripRefs(value)
  value = stripTemplates(value)

  // External links: [url label] -> label
  value = value.replace(/\[(https?:\/\/[^\s\]]+)\s+([^\]]+)\]/g, "$2")

  // Internal links: [[Page|Label]] -> Label, [[Page]] -> Page
  value = value.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
  value = value.replace(/\[\[([^\]]+)\]\]/g, "$1")

  value = stripHtml(value)
  value = decodeEntities(value)

  return value
    .replace(/\s+/g, " ")
    .replace(/^[-–—•:\s]+/, "")
    .replace(/\s+$/, "")
}

export type WikiTable = {
  headers: string[]
  rows: string[][]
  rawRows: string[][]
}

export function extractFirstWikiTable(wikitext: string) {
  const start = wikitext.indexOf("{|")
  const end = wikitext.indexOf("|}", start + 2)
  if (start === -1 || end === -1) return null
  return wikitext.slice(start, end + 2)
}

export function parseWikiTable(tableText: string): WikiTable {
  const lines = tableText.split(/\r?\n/)
  const headers: string[] = []
  const rows: string[][] = []
  const rawRows: string[][] = []

  let currentRow: string[] = []
  let currentRawRow: string[] = []
  let inHeader = true

  const flushRow = () => {
    const cleaned = currentRow.map((cell) => cleanWikicodeCell(cell)).filter(Boolean)
    if (cleaned.length) {
      rows.push(cleaned)
      rawRows.push(currentRawRow.slice())
    }
    currentRow = []
    currentRawRow = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    if (line.startsWith("|-")) {
      if (currentRow.length) flushRow()
      inHeader = false
      continue
    }

    if (line.startsWith("!")) {
      const parts = line
        .replace(/^!+/, "!")
        .slice(1)
        .split("!!")
        .map((part) => part.replace(/^[^|]*\|\s*/, ""))
        .map((part) => cleanWikicodeCell(part))
        .filter(Boolean)
      headers.push(...parts)
      continue
    }

    if (line.startsWith("|")) {
      const payload = line.slice(1)
      const parts = payload
        .split("||")
        .map((part) => part.replace(/^[^|]*\|\s*/, ""))

      currentRow.push(...parts)
      currentRawRow.push(...parts)

      if (inHeader) {
        // Some tables use header rows with |.
        if (headers.length === 0 && currentRow.length) {
          headers.push(...currentRow.map((cell) => cleanWikicodeCell(cell)).filter(Boolean))
          currentRow = []
          currentRawRow = []
        }
      }
    }
  }

  if (currentRow.length) flushRow()

  return { headers, rows, rawRows }
}
