import { fetchMediaWikiSectionHtml } from "../src/lib/wins/mediawiki"
import { extractHtmlTables, parseHtmlTable, expandTableRowspans } from "../src/lib/wins/html-table"

async function run() {
  const apiBaseUrl = "https://en.wikipedia.org/w/api.php"
  const page = "List_of_The_Show_Chart_winners_(2025)"

  console.log(`Fetching HTML for ${page}...`)
  const html = await fetchMediaWikiSectionHtml({
    apiBaseUrl,
    page,
    timeoutMs: 5000,
  })

  const tables = extractHtmlTables(html)
  const candidate = tables.find((tableHtml) => {
    const table = parseHtmlTable(tableHtml, "https://en.wikipedia.org")
    const headers = table.headers.map((h) => h.toLowerCase())
    return headers.includes("date") && headers.includes("artist") && headers.includes("song")
  })

  if (!candidate) {
    console.error("Candidate table not found")
    return
  }

  const table = parseHtmlTable(candidate, "https://en.wikipedia.org")
  console.log("Headers:", table.headers)

  const expanded = expandTableRowspans(table.rows)
  const h2hRows = expanded.filter(row => {
    const text = JSON.stringify(row.values)
    return text.toLowerCase().includes("hearts2hearts") || text.toLowerCase().includes("h2h")
  })

  console.log(`Found ${h2hRows.length} rows matching Hearts2Hearts:`)
  h2hRows.forEach(row => {
    console.log(JSON.stringify(row.values.map(v => ({ text: v.text, html: v.href })), null, 2))
  })
}

run()
