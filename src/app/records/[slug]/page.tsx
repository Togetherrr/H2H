"use client"

import { useState, useEffect, useRef } from "react"
import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  ExternalLink,
  Trophy,
  Radio,
  CalendarDays,
  RefreshCw,
} from "lucide-react"
import { Navbar, type TimeZone } from "@/components/navbar"
import { useTranslation } from "@/hooks/useTranslation"
import {
  HOME_STAT_SLUGS,
  getHomeStatDetailPage,
} from "@/lib/home-stat-details"
import type { HomeStatSlug, HomeStatDetailPage } from "@/lib/home-stat-details"

// ─── Types từ API /api/wins ───────────────────────────────────────────────────

type MusicShowWin = {
  id: string
  date: string
  song: string
  program: string
  headline: string
  href: string
}

type AwardCeremonyWin = {
  id: string
  ceremony: string
  year: string
  category: string
  href: string
}

type WinsApiResponse = {
  musicShowWins: MusicShowWin[]
  awardCeremonyWins: AwardCeremonyWin[]
  syncedAt: string | null
  fetchedAt: string
}

// ─── Transform API data → HomeStatDetailPage format ──────────────────────────

function transformMusicShowWins(wins: MusicShowWin[]): HomeStatDetailPage {
  // Group by program
  const byProgram = new Map<string, MusicShowWin[]>()
  for (const win of wins) {
    const list = byProgram.get(win.program) ?? []
    list.push(win)
    byProgram.set(win.program, list)
  }

  const sections = Array.from(byProgram.entries()).map(([program, items]) => ({
    title: program,
    description: `${items.length} win${items.length !== 1 ? "s" : ""}`,
    items: items.map((win) => ({
      title: win.song,
      subtitle: win.headline || undefined,
      meta: win.date
        ? new Date(win.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        })
        : undefined,
      href: win.href || undefined,
      hrefLabel: "Wikipedia",
    })),
  }))

  return {
    slug: "music-show-wins",
    eyebrow: "Records",
    title: "Music Show Wins",
    total: wins.length,
    totalLabel: "wins",
    summary:
      "Every music show win earned by Hearts2Hearts, sourced automatically from Wikipedia chart winner lists.",
    sourceHref: "https://en.wikipedia.org",
    sourceLabel: "Wikipedia",
    sourceNote: "Data is automatically synced from Wikipedia chart winner pages.",
    sections,
  }
}

function transformAwardCeremonyWins(wins: AwardCeremonyWin[]): HomeStatDetailPage {
  // Group by year
  const byYear = new Map<string, AwardCeremonyWin[]>()
  for (const win of wins) {
    const list = byYear.get(win.year) ?? []
    list.push(win)
    byYear.set(win.year, list)
  }

  const sections = Array.from(byYear.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([year, items]) => ({
      title: year,
      description: `${items.length} award${items.length !== 1 ? "s" : ""}`,
      items: items.map((win) => ({
        title: win.category,
        subtitle: win.ceremony,
        chips: [win.ceremony],
        href: win.href || undefined,
        hrefLabel: "Wikipedia",
      })),
    }))

  return {
    slug: "award-ceremony-wins",
    eyebrow: "Records",
    title: "Award Ceremony Wins",
    total: wins.length,
    totalLabel: "awards",
    summary:
      "All award ceremony wins by Hearts2Hearts, sourced automatically from Wikipedia.",
    sourceHref: "https://en.wikipedia.org",
    sourceLabel: "Wikipedia",
    sourceNote: "Data is automatically synced from the Hearts2Hearts Wikipedia page.",
    sections,
  }
}

// ─── Slug meta ────────────────────────────────────────────────────────────────

const SLUG_META: Record<
  HomeStatSlug,
  {
    icon: React.ElementType
    accent: string
    accentLight: string
    bg: string
    badgeColor: string
    particleColor: string
  }
> = {
  "debut-days": {
    icon: CalendarDays,
    accent: "#FF708A",
    accentLight: "#FFD1DC",
    bg: "from-[#FFF0F5] via-[#FFE4EC] to-[#FFD1DC]",
    badgeColor: "bg-pink-100 text-pink-600",
    particleColor: "#FF708A",
  },
  "album-projects": {
    icon: CalendarDays,
    accent: "#6366f1",
    accentLight: "#c7d2fe",
    bg: "from-indigo-50 via-purple-50 to-violet-100",
    badgeColor: "bg-indigo-100 text-indigo-600",
    particleColor: "#6366f1",
  },
  "music-show-wins": {
    icon: Radio,
    accent: "#0ea5e9",
    accentLight: "#bae6fd",
    bg: "from-sky-50 via-blue-50 to-cyan-100",
    badgeColor: "bg-sky-100 text-sky-600",
    particleColor: "#0ea5e9",
  },
  "award-ceremony-wins": {
    icon: Trophy,
    accent: "#7c3aed",
    accentLight: "#ddd6fe",
    bg: "from-violet-50 via-purple-50 to-fuchsia-100",
    badgeColor: "bg-violet-100 text-violet-600",
    particleColor: "#7c3aed",
  },
}

const WINS_SLUGS: HomeStatSlug[] = ["music-show-wins", "award-ceremony-wins"]

// ─── Count-up hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, trigger: boolean, duration = 1400) {
  const [count, setCount] = useState(0)
  const hasRun = useRef(false)

  useEffect(() => {
    if (!trigger || hasRun.current || target === 0) return
    hasRun.current = true
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [trigger, target, duration])

  return count
}

// ─── Floating orbs background ────────────────────────────────────────────────

function FloatingOrbs({ accent, accentLight }: { accent: string; accentLight: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full blur-[100px] opacity-25 animate-[pulse_8s_ease-in-out_infinite]"
        style={{ background: accentLight }}
      />
      <div
        className="absolute top-1/3 -left-20 w-[300px] h-[300px] rounded-full blur-[80px] opacity-20 animate-[pulse_5s_ease-in-out_infinite_1s]"
        style={{ background: accent }}
      />
      <div
        className="absolute -bottom-20 right-1/3 w-[250px] h-[250px] rounded-full blur-[60px] opacity-15 animate-[pulse_7s_ease-in-out_infinite_2s]"
        style={{ background: accentLight }}
      />
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}

// ─── Animated row ─────────────────────────────────────────────────────────────

function AnimatedRow({
  children,
  index,
  accent,
}: {
  children: React.ReactNode
  index: number
  accent: string
}) {
  const ref = useRef<HTMLTableRowElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <tr
      ref={ref}
      className="border-b border-black/5 last:border-0 group/row relative transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-12px)",
        transition: `opacity 0.4s ease ${index * 40}ms, transform 0.4s ease ${index * 40}ms`,
      }}
    >
      <td
        className="absolute left-0 top-0 bottom-0 w-0 group-hover/row:w-1 transition-all duration-300 rounded-r-full"
        style={{ background: accent }}
        aria-hidden
      />
      {children}
    </tr>
  )
}

// ─── Section progress bar ─────────────────────────────────────────────────────

function SectionProgress({
  count,
  total,
  accent,
}: {
  count: number
  total: number
  accent: string
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 200)
    return () => clearTimeout(t)
  }, [pct])

  return (
    <div className="flex items-center gap-2 mt-3 ml-5">
      <div className="flex-1 h-1 bg-black/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, background: accent }}
        />
      </div>
      <span className="text-[10px] font-bold text-black/30 tabular-nums">{pct}%</span>
    </div>
  )
}

// ─── Sticky summary bar ───────────────────────────────────────────────────────

function StickySummary({
  title,
  total,
  totalLabel,
  accent,
  Icon,
}: {
  title: string
  total: number
  totalLabel: string
  accent: string
  Icon: React.ElementType
}) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = () => setShow(window.scrollY > 320)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <div
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${show ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
    >
      <div
        className="w-full px-6 py-4 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.08)] border-b border-white/40"
        style={{
          background: `rgba(255, 249, 240, 0.85)`,
          backdropFilter: "blur(24px)",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl shadow-sm border border-white/60"
            style={{ background: `${accent}18` }}
          >
            <Icon className="size-4" style={{ color: accent }} />
          </div>
          <span className="text-[13px] font-black uppercase tracking-[0.25em] text-black/80">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[22px] font-black tabular-nums tracking-tighter"
            style={{ color: accent }}
          >
            {total.toLocaleString()}
          </span>
          <span className="text-[9px] font-black text-black/30 uppercase tracking-[0.2em] hidden sm:block mt-1">
            {totalLabel}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Live data badge ──────────────────────────────────────────────────────────

function LiveBadge({ syncedAt, accent }: { syncedAt: string | null; accent: string }) {
  if (!syncedAt) return null
  const formatted = new Date(syncedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  })
  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold border"
      style={{ background: `${accent}10`, borderColor: `${accent}25`, color: accent }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full animate-pulse"
        style={{ background: accent }}
      />
      Live · synced {formatted} UTC
    </div>
  )
}

// ─── Main content ─────────────────────────────────────────────────────────────

function RecordDetailContent({
  page,
  slug,
  syncedAt,
  t,
}: {
  page: HomeStatDetailPage
  slug: HomeStatSlug
  syncedAt?: string | null
  t: (key: string) => string
}) {
  const meta = SLUG_META[slug]
  const Icon = meta.icon
  const [heroVisible, setHeroVisible] = useState(false)
  const countUpValue = useCountUp(page.total, heroVisible)

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  const maxSectionItems = Math.max(...page.sections.map((s) => s.items.length), 1)

  return (
    <>
      <StickySummary
        title={page.title}
        total={page.total}
        totalLabel={page.totalLabel}
        accent={meta.accent}
        Icon={Icon}
      />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div
        className={`relative bg-gradient-to-br ${meta.bg} border-b border-black/5 pt-36 pb-16 overflow-hidden`}
      >
        <FloatingOrbs accent={meta.accent} accentLight={meta.accentLight} />

        <div
          className="absolute right-[-60px] top-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none select-none"
          style={{ transform: "translateY(-50%) rotate(-8deg)" }}
        >
          <Icon style={{ width: 480, height: 480, color: meta.accent }} />
        </div>

        <div className="section-shell relative z-10">
          <Link
            href="/home#album"
            className="group inline-flex items-center gap-2.5 mb-10 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm text-[10px] font-black uppercase tracking-[0.3em] text-black/50 hover:text-[#FF708A] hover:bg-white/80 transition-all"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateX(0)" : "translateX(-8px)",
              transition:
                "opacity 0.5s ease, transform 0.5s ease, color 0.3s ease, background-color 0.3s ease",
            }}
          >
            <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-1" />
            {t("records.backToRecords")}
          </Link>

          <div className="flex items-start gap-6">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.75rem] shadow-2xl border-2"
              style={{
                background: `linear-gradient(135deg, white 0%, ${meta.accentLight} 100%)`,
                borderColor: `${meta.accent}30`,
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "scale(1)" : "scale(0.8)",
                transition: "opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s",
              }}
            >
              <Icon className="size-10" style={{ color: meta.accent }} />
            </div>

            <div className="flex-1 min-w-0">
              <p
                className="font-sans text-[11px] font-black uppercase tracking-[0.4em] mb-3 drop-shadow-sm"
                style={{
                  color: meta.accent,
                  opacity: heroVisible ? 1 : 0,
                  transition: "opacity 0.5s ease 0.15s",
                }}
              >
                {t("records.officialRecords")}
              </p>
              <div className="relative mb-4">
                {/* Glow effect phía sau */}
                <div
                  className="absolute -inset-4 blur-3xl opacity-30 z-0 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${meta.accentLight}, ${meta.accent})`,
                    opacity: heroVisible ? 0.4 : 0,
                    transform: heroVisible ? "scale(1)" : "scale(0.8)",
                    transition: "opacity 1s ease 0.2s, transform 1s ease 0.2s",
                  }}
                />
                
                <h1
                  className="font-sans text-5xl md:text-7xl lg:text-[5rem] font-black uppercase tracking-tighter leading-[0.9] relative z-10"
                  style={{
                    background: `linear-gradient(135deg, #0f172a 30%, ${meta.accent} 110%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: `drop-shadow(0px 10px 20px ${meta.accent}20)`,
                    opacity: heroVisible ? 1 : 0,
                    transform: heroVisible ? "translateY(0)" : "translateY(20px)",
                    transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s",
                  }}
                >
                  {page.title}
                </h1>
              </div>
              <p
                className="font-sans text-sm md:text-base font-bold text-slate-600/90 leading-relaxed max-w-2xl"
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transition: "opacity 0.5s ease 0.35s",
                }}
              >
                {page.summary}
              </p>

              {/* Live badge — chỉ hiện cho wins slugs */}
              {WINS_SLUGS.includes(slug) && syncedAt && (
                <div
                  className="mt-4"
                  style={{
                    opacity: heroVisible ? 1 : 0,
                    transition: "opacity 0.5s ease 0.4s",
                  }}
                >
                  <LiveBadge syncedAt={syncedAt} accent={meta.accent} />
                </div>
              )}
            </div>
          </div>

          {/* Stats bar */}
          <div
            className="mt-12 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.6s ease 0.45s, transform 0.6s ease 0.45s",
            }}
          >
            <div
              className="group relative flex items-center justify-between gap-8 px-8 py-5 rounded-[2rem] shadow-xl backdrop-blur-md overflow-hidden border border-white/50"
              style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)`,
                boxShadow: `0 20px 40px ${meta.accent}15`,
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at top right, ${meta.accentLight}50, transparent 70%)`,
                }}
              />
              <div className="flex flex-col relative z-10">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">
                  Total
                </span>
                <div className="flex items-baseline gap-3">
                  <span
                    className="text-5xl font-black tracking-tighter drop-shadow-sm leading-none"
                    style={{ color: meta.accent }}
                  >
                    {countUpValue.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {page.totalLabel}
                  </span>
                </div>
              </div>
            </div>

            <a
              href={page.sourceHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-4 px-8 py-5 h-full sm:h-auto rounded-[2rem] backdrop-blur-md border border-white/40 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 100%)`,
              }}
            >
               <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, ${meta.accentLight}20 0%, transparent 100%)`,
                }}
              />
              <div
                className="flex items-center justify-center size-10 rounded-full shadow-sm bg-white/80 group-hover:scale-110 transition-transform duration-500"
              >
                <ExternalLink className="size-4" style={{ color: meta.accent }} />
              </div>
              <div className="flex flex-col items-start relative z-10">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {t("records.dataSource")}
                </span>
                <span className="text-[13px] font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                  {page.sourceLabel}
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* ── Content sections ───────────────────────────────────────── */}
      <div className="section-shell py-16 space-y-14">
        {page.sections.map((section, si) => (
          <section key={`${section.title}-${si}`}>
            <div className="flex items-center gap-4 mb-3">
              <div
                className="h-7 w-2 rounded-full shadow-sm"
                style={{ background: meta.accent }}
              />
              <h2 className="text-[15px] font-black uppercase tracking-[0.4em] text-black/80">
                {section.title}
              </h2>
              <div className="flex-1 h-[1px] bg-black/5 ml-2" />
              <span
                className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-sm border border-white/60 ${meta.badgeColor}`}
              >
                {section.items.length} {t("records.entries")}
              </span>
            </div>

            {section.description && (
              <>
                <p className="text-[13px] text-black/40 mb-1 ml-5">{section.description}</p>
                <SectionProgress
                  count={section.items.length}
                  total={maxSectionItems}
                  accent={meta.accent}
                />
              </>
            )}
            {!section.description && (
              <SectionProgress
                count={section.items.length}
                total={maxSectionItems}
                accent={meta.accent}
              />
            )}

            <div
              className="mt-6 rounded-[2.5rem] bg-[#FFF9F0]/90 backdrop-blur-xl border border-white/60 overflow-hidden shadow-2xl relative transition-all duration-500 hover:shadow-[0_30px_70px_rgba(0,0,0,0.12)]"
              style={{ boxShadow: `0 20px 60px ${meta.accent}08` }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-[3px] opacity-60"
                style={{
                  background: `linear-gradient(90deg, ${meta.accent}, ${meta.accentLight}, transparent)`,
                }}
              />
              <table className="w-full text-sm">
                <tbody>
                  {section.items.map((item, ii) => (
                    <AnimatedRow
                      key={`${section.title}-${item.title}-${ii}`}
                      index={ii}
                      accent={meta.accent}
                    >
                      <td className="w-16 pl-8 py-6 text-[12px] font-black text-black/15 tabular-nums">
                        {String(ii + 1).padStart(2, "0")}
                      </td>

                      <td className="px-4 py-6">
                        <p className="font-bold text-black text-[15px] leading-snug group-hover/row:text-black transition-colors">
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="text-[12px] font-medium text-black/35 mt-0.5 tracking-tight">
                            {item.subtitle}
                          </p>
                        )}
                        {item.chips && item.chips.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {item.chips.map((chip, ci) => (
                              <span
                                key={`${item.title}-${chip}-${ci}`}
                                className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all shadow-sm border border-white/40"
                                style={{ background: `white`, color: meta.accent }}
                              >
                                {chip}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {item.meta && (
                        <td className="px-4 py-6 text-right hidden sm:table-cell">
                          <span className="text-[11px] font-black uppercase tracking-widest text-black/25 whitespace-nowrap">
                            {item.meta}
                          </span>
                        </td>
                      )}

                      {item.value && (
                        <td className="px-4 py-6 text-right">
                          <span
                            className="inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all shadow-sm border border-white/60 group-hover/row:scale-105"
                            style={{ background: `white`, color: meta.accent }}
                          >
                            {item.value}
                          </span>
                        </td>
                      )}

                      {item.href && (
                        <td className="pr-8 py-6 text-right">
                          <a
                            href={item.href}
                            target={item.href.startsWith("http") ? "_blank" : undefined}
                            rel={
                              item.href.startsWith("http") ? "noopener noreferrer" : undefined
                            }
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 text-[9px] font-black uppercase tracking-[0.2em] text-black/30 hover:text-black/60 hover:bg-black/10 opacity-0 group-hover/row:opacity-100 transition-all whitespace-nowrap"
                          >
                            <ExternalLink className="size-3" />
                            {item.hrefLabel || t("records.openSource")}
                          </a>
                        </td>
                      )}
                    </AnimatedRow>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}

        {/* Source note */}
        <div
          className="flex items-start gap-3 px-6 py-5 rounded-[2rem] border"
          style={{
            background: `${meta.accent}06`,
            borderColor: `${meta.accent}15`,
          }}
        >
          <div
            className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0"
            style={{ background: meta.accent }}
          />
          <p className="text-[12px] text-black/40 leading-relaxed">
            <span className="font-bold text-black/50">{t("records.dataSource")}: </span>
            {page.sourceNote}{" "}
            <a
              href={page.sourceHref}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-black/70 transition-colors"
              style={{ color: meta.accent }}
            >
              {page.sourceLabel}
            </a>
          </p>
        </div>
      </div>

      <footer className="section-shell pb-12">
        <div className="card-premium !rounded-[2.5rem] p-10 text-center">
          <p className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-500">
            {t("records.copyright")}
          </p>
        </div>
      </footer>
    </>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton({ accent }: { accent: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-10 w-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: `${accent} transparent transparent transparent` }}
        />
        <p className="text-[11px] font-black uppercase tracking-widest text-black/30">
          Loading…
        </p>
      </div>
    </div>
  )
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ accent, onRetry }: { accent: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-6 text-center px-6">
        <p className="text-[13px] font-medium text-black/50">
          Couldn&apos;t load data. Wikipedia may be temporarily unavailable.
        </p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest border transition-all hover:scale-105"
          style={{
            color: accent,
            borderColor: `${accent}30`,
            background: `${accent}08`,
          }}
        >
          <RefreshCw className="size-3" />
          Retry
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RecordDetailPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug as HomeStatSlug
  const { t } = useTranslation()
  const [timeZone, setTimeZone] = useState<TimeZone>("KST")
  const [page, setPage] = useState<HomeStatDetailPage | null>(null)
  const [syncedAt, setSyncedAt] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState(false)

  const isWinsSlug = WINS_SLUGS.includes(slug as HomeStatSlug)
  const meta = SLUG_META[slug as HomeStatSlug]

  const loadData = async () => {
    setError(false)
    setMounted(false)

    try {
      if (isWinsSlug) {
        // ── Wins slugs: fetch live từ /api/wins/sync (Wikipedia → Supabase) ──────
        const res = await fetch("/api/wins/sync", { cache: "no-store" })
        if (!res.ok) throw new Error(`API error ${res.status}`)

        const data: WinsApiResponse = await res.json()
        setSyncedAt(data.syncedAt)

        if (slug === "music-show-wins") {
          setPage(transformMusicShowWins(data.musicShowWins))
        } else {
          setPage(transformAwardCeremonyWins(data.awardCeremonyWins))
        }
      } else {
        // ── Các slug khác: giữ nguyên source cũ ─────────────────────────────
        const data = await getHomeStatDetailPage(slug)
        setPage(data)
      }

      setMounted(true)
    } catch {
      setError(true)
    }
  }

  useEffect(() => {
    if (!HOME_STAT_SLUGS.includes(slug as HomeStatSlug)) return
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  if (!HOME_STAT_SLUGS.includes(slug as HomeStatSlug)) {
    notFound()
  }

  return (
    <main className="relative min-h-screen selection:bg-[#A2D2FF]/30">
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] size-[500px] rounded-full bg-[#A2D2FF]/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] size-[500px] rounded-full bg-[#FFC2D1]/10 blur-[120px]" />
      </div>

      <Navbar timeZone={timeZone} onTimeZoneChange={setTimeZone} />

      {error ? (
        <ErrorState accent={meta?.accent ?? "#0ea5e9"} onRetry={loadData} />
      ) : mounted && page ? (
        <RecordDetailContent
          page={page}
          slug={slug}
          syncedAt={syncedAt}
          t={t}
        />
      ) : (
        <LoadingSkeleton accent={meta?.accent ?? "#0ea5e9"} />
      )}
    </main>
  )
}