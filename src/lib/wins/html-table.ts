export type HtmlTableCell = {
  text: string
  href?: string
  rowspan: number
  colspan: number
}

export type HtmlTable = {
  headers: string[]
  rows: { cells: HtmlTableCell[] }[]
}

function decodeEntities(input: string) {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function stripTags(input: string) {
  return input.replace(/<[^>]*>/g, "")
}

function cleanText(input: string) {
  return decodeEntities(stripTags(input))
    .replace(/\s+/g, " ")
    .replace(/^\s+|\s+$/g, "")
}

function parseAttrInt(tag: string, name: string, fallback: number) {
  const match =
    tag.match(new RegExp(`${name}\\s*=\\s*"(\\d+)"`, "i")) ??
    tag.match(new RegExp(`${name}\\s*=\\s*(\\d+)`, "i"))
  if (!match) return fallback
  const value = Number(match[1])
  return Number.isFinite(value) && value > 0 ? value : fallback
}

function extractFirstHref(cellHtml: string, baseUrl?: string) {
  const match = cellHtml.match(/href\s*=\s*"([^"]+)"/i)
  if (!match) return undefined
  const href = match[1]
  if (/^https?:\/\//i.test(href)) return href
  if (href.startsWith("//")) return `https:${href}`
  if (href.startsWith("/") && baseUrl) return `${baseUrl}${href}`
  return href
}

function parseCells(rowHtml: string, baseUrl?: string) {
  const cells: HtmlTableCell[] = []
  const cellRe = /<(td|th)\b([^>]*)>([\s\S]*?)<\/\1>/gi
  let match: RegExpExecArray | null
  while ((match = cellRe.exec(rowHtml))) {
    const attrs = match[2] ?? ""
    const inner = match[3] ?? ""
    const rowspan = parseAttrInt(attrs, "rowspan", 1)
    const colspan = parseAttrInt(attrs, "colspan", 1)
    const text = cleanText(inner)
    const href = extractFirstHref(inner, baseUrl)
    cells.push({ text, href, rowspan, colspan })
  }
  return cells
}

function extractRows(tableHtml: string, baseUrl?: string) {
  const rows: { cells: HtmlTableCell[] }[] = []
  const rowRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi
  let match: RegExpExecArray | null
  while ((match = rowRe.exec(tableHtml))) {
    const inner = match[1] ?? ""
    const cells = parseCells(inner, baseUrl)
    if (cells.length) rows.push({ cells })
  }
  return rows
}

// ─── Nested table-safe extraction ────────────────────────────────────────────
// Regex không xử lý được nested tables (<table> lồng nhau).
// Dùng stack-based approach để tìm đúng boundary của mỗi table.

export function extractHtmlTables(html: string): string[] {
  const tables: string[] = []
  let i = 0

  while (i < html.length) {
    // Tìm <table (opening tag)
    const openIdx = html.toLowerCase().indexOf("<table", i)
    if (openIdx === -1) break

    // Track depth để xử lý nested tables
    let depth = 0
    let j = openIdx

    while (j < html.length) {
      const nextOpen = html.toLowerCase().indexOf("<table", j + 1)
      const nextClose = html.toLowerCase().indexOf("</table", j)

      if (nextClose === -1) break // malformed HTML

      if (nextOpen !== -1 && nextOpen < nextClose) {
        // Gặp nested <table> trước khi đóng
        depth++
        j = nextOpen
      } else {
        if (depth === 0) {
          // Đây là </table> của outer table
          const closeEnd = html.indexOf(">", nextClose) + 1
          tables.push(html.slice(openIdx, closeEnd))
          i = closeEnd
          break
        } else {
          depth--
          j = nextClose
        }
      }
    }

    // Nếu không tìm được closing tag hợp lệ, bỏ qua
    if (j >= html.length) break
  }

  return tables
}

export function parseHtmlTable(tableHtml: string, baseUrl?: string): HtmlTable {
  // Loại bỏ nested tables trước khi parse rows
  // để tránh nested <td> làm lệch parsing
  const stripped = tableHtml.replace(/<table\b[\s\S]*?<\/table>/gi, (match, offset) => {
    // Giữ lại outer table (offset = 0), bỏ nested
    return offset === 0 ? match : ""
  })

  const rows = extractRows(stripped, baseUrl)
  const headerRow = rows.find((row) => row.cells.some((cell) => cell.text)) ?? { cells: [] }
  const headers = headerRow.cells.map((cell) => cell.text).filter(Boolean)
  return { headers, rows }
}

type PendingCell = { value: string; href?: string; remaining: number }

export function expandTableRowspans(rows: { cells: HtmlTableCell[] }[]) {
  const expanded: { values: { text: string; href?: string }[] }[] = []
  const pending: (PendingCell | null)[] = []

  for (const row of rows) {
    const out: { text: string; href?: string }[] = []

    const ensureLen = (index: number) => {
      while (pending.length <= index) pending.push(null)
      while (out.length <= index) out.push({ text: "" })
    }

    // Prefill từ pending rowspans
    for (let col = 0; col < pending.length; col++) {
      const p = pending[col]
      if (!p) continue
      ensureLen(col)
      out[col] = { text: p.value, href: p.href }
      p.remaining -= 1
      if (p.remaining <= 0) pending[col] = null
    }

    let colIndex = 0
    for (const cell of row.cells) {
      while (out[colIndex]?.text && colIndex < 200) colIndex++
      ensureLen(colIndex)

      const repeat = Math.max(1, cell.colspan)
      for (let span = 0; span < repeat; span++) {
        const targetCol = colIndex + span
        ensureLen(targetCol)
        out[targetCol] = { text: cell.text, href: cell.href }

        if (cell.rowspan > 1) {
          pending[targetCol] = {
            value: cell.text,
            href: cell.href,
            remaining: cell.rowspan - 1,
          }
        }
      }

      colIndex += repeat
    }

    // Trim trailing empties
    while (out.length && !out[out.length - 1]?.text) out.pop()
    expanded.push({ values: out })
  }

  return expanded
}