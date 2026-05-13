import { readFileSync, readdirSync, lstatSync } from "node:fs"
import { join, basename } from "node:path"

/**
 * H2H Performance Guard Engine (Professional Version)
 * Scalable rule-based architecture for code auditing.
 */

const GREEN = "\x1b[32m"
const RED = "\x1b[31m"
const YELLOW = "\x1b[33m"
const RESET = "\x1b[0m"

// --- Types & Interfaces ---

type Severity = "ERROR" | "WARN"

interface AuditContext {
  filePath: string
  fileName: string
  content: string
  codeOnly: string
}

interface Issue {
  ruleId: number
  severity: Severity
  message: string
  filePath: string
}

interface Rule {
  id: number
  name: string
  check: (ctx: AuditContext) => Issue[]
}

// --- State ---

let fileCount = 0
const allIssues: Issue[] = []

// --- Utils ---

function getCodeOnly(content: string): string {
  return content
    .replace(/`[^`\n]*`/g, "\"\"")
    .replace(/'[^'\n]*'/g, "''")
    .replace(/"[^"\n]*"/g, '""')
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*/g, "")
}

const ignoreRule = (content: string, ruleId: number) => 
  content.includes("@perf-ignore-all") || content.includes(`@perf-ignore-rule-${ruleId}`)

// --- Rules Definitions ---

const rules: Rule[] = [
  {
    id: 1,
    name: "Supabase Waterfall",
    check: (ctx) => {
      if (ignoreRule(ctx.content, 1)) return []
      const matches = ctx.codeOnly.match(/await\s+supabase\./g) || []
      if (matches.length > 1 && !ctx.codeOnly.includes("Promise.all")) {
        return [{ ruleId: 1, severity: "ERROR", message: `Sequential Supabase calls (${matches.length}). Use Promise.all().`, filePath: ctx.filePath }]
      }
      return []
    }
  },
  {
    id: 2,
    name: "ISR/Static Guard",
    check: (ctx) => {
      if (ignoreRule(ctx.content, 2)) return []
      const results: Issue[] = []
      if (ctx.filePath.includes("src/app") && ctx.fileName === "page.tsx") {
        const isClient = ctx.content.includes('"use client"') || ctx.content.includes("'use client'")
        if (isClient) return []

        const hasISR = /export\s+const\s+revalidate\s*=/.test(ctx.content)
        const isDynamic = /export\s+const\s+dynamic\s*=\s*["']force-dynamic["']/.test(ctx.content)
        const usesCookies = /createClient\(/.test(ctx.content) && ctx.content.includes("@/lib/supabase/server")

        if (!hasISR && !isDynamic) {
          results.push({ ruleId: 2, severity: "ERROR", message: "Missing ISR/Dynamic config.", filePath: ctx.filePath })
        }
        if (hasISR && usesCookies) {
          results.push({ ruleId: 2, severity: "ERROR", message: "ISR/Cookie conflict.", filePath: ctx.filePath })
        }
      }
      return results
    }
  },
  {
    id: 3,
    name: "N+1 Query Detection",
    check: (ctx) => {
      if (ignoreRule(ctx.content, 3)) return []
      // Heuristic: Only detects await in single-level callbacks. Nested blocks may be missed.
      if (/\.(map|forEach)\s*\(\s*(async\s+)?\(.*\)\s*=>\s*\{[^}]*await\s+/.test(ctx.codeOnly)) {
        return [{ ruleId: 3, severity: "ERROR", message: "Potential N+1 query: detected 'await' inside loop.", filePath: ctx.filePath }]
      }
      return []
    }
  },
  {
    id: 4,
    name: "Supabase select('*')",
    check: (ctx) => {
      if (ignoreRule(ctx.content, 4)) return []
      if (/\.select\(\s*["']\*["']\s*\)/.test(ctx.codeOnly)) {
        return [{ ruleId: 4, severity: "WARN", message: "Inefficient select('*').", filePath: ctx.filePath }]
      }
      return []
    }
  },
  {
    id: 5,
    name: "Supabase Missing .limit()",
    check: (ctx) => {
      if (ignoreRule(ctx.content, 5)) return []
      const isQuery = /\.from\s*\(.*\)\s*\.select\(.*\)/.test(ctx.codeOnly)
      const hasLimit = ctx.codeOnly.includes(".limit(")
      const isSingleRow = ctx.codeOnly.includes(".single()") || ctx.codeOnly.includes(".maybeSingle()") || /\.eq\(\s*["']id["']/.test(ctx.codeOnly)
      
      if (isQuery && !hasLimit && !isSingleRow) {
        return [{ ruleId: 5, severity: "WARN", message: "Missing .limit() on potential multi-row query.", filePath: ctx.filePath }]
      }
      return []
    }
  },
  {
    id: 6,
    name: "Legacy <img> Tag",
    check: (ctx) => {
      if (ignoreRule(ctx.content, 6)) return []
      if (ctx.fileName.endsWith(".tsx") && /<img\s+/.test(ctx.codeOnly)) {
        return [{ ruleId: 6, severity: "WARN", message: "Use <Image> from 'next/image'.", filePath: ctx.filePath }]
      }
      return []
    }
  },
  {
    id: 7,
    name: "Inefficient Lodash Import",
    check: (ctx) => {
      if (ignoreRule(ctx.content, 7)) return []
      if (/import\s+_\s+from\s+["']lodash["']/.test(ctx.content)) {
        return [{ ruleId: 7, severity: "WARN", message: "Use tree-shakeable lodash imports.", filePath: ctx.filePath }]
      }
      return []
    }
  }
]

// --- Core Logic ---

function auditFile(filePath: string) {
  try {
    const content = readFileSync(filePath, "utf-8")
    const normalizedFilePath = filePath.replace(/\\/g, "/")
    const ctx: AuditContext = {
      filePath: normalizedFilePath,
      fileName: basename(filePath),
      content,
      codeOnly: getCodeOnly(content)
    }

    for (const rule of rules) {
      const issues = rule.check(ctx)
      if (issues.length > 0) allIssues.push(...issues)
    }
  } catch (e) {
    allIssues.push({ ruleId: 0, severity: "WARN", message: `Cannot read file: ${(e as Error).message}`, filePath })
  }
}

function walkDir(dir: string) {
  try {
    const files = readdirSync(dir)
    for (const file of files) {
      const path = join(dir, file)
      const stats = lstatSync(path)
      if (stats.isDirectory()) {
        if (!["node_modules", ".next", ".git"].includes(file)) walkDir(path)
      } else if (stats.isFile() && /\.(tsx|ts)$/.test(file)) {
        fileCount++
        auditFile(path)
      }
    }
  } catch (e) {
    allIssues.push({ ruleId: 0, severity: "WARN", message: `Cannot access directory: ${(e as Error).message}`, filePath: dir })
  }
}

// --- Execution ---

const targetDir = process.argv[2] ?? "src"
const isJsonOutput = process.argv.includes("--format=json")

if (!isJsonOutput) console.log(`🚀 Starting H2H Performance Guard on [${targetDir}]...`)

walkDir(targetDir)

if (isJsonOutput) {
  console.log(JSON.stringify({ fileCount, issues: allIssues }, null, 2))
} else {
  if (allIssues.length > 0) {
    console.log("\n--- Issues Found ---")
    allIssues.forEach(i => {
      const color = i.severity === "ERROR" ? RED : YELLOW
      const label = i.ruleId === 0 ? "SYSTEM" : `Rule ${i.ruleId}`
      console.log(`${color}[${i.severity}]${RESET} [${label}] ${i.filePath}: ${i.message}`)
    })
  }

  console.log("\n--- Summary ---")
  console.log(`✔ Scanned ${fileCount} files in [${targetDir}]`)
  
  const errors = allIssues.filter(i => i.severity === "ERROR").length
  const warnings = allIssues.filter(i => i.severity === "WARN").length

  if (errors === 0 && warnings === 0) {
    console.log(`${GREEN}✔ All checks passed! Your code is optimized.${RESET}`)
  } else {
    console.log(`${RED}Errors: ${errors}${RESET}`)
    console.log(`${YELLOW}Warnings: ${warnings}${RESET}`)
  }

  if (errors > 0) {
    console.log(`\n${RED}FAILED:${RESET} Please fix the errors before merging.`)
    process.exit(1)
  }
}
