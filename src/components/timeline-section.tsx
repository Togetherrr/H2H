"use client"

/* eslint-disable @next/next/no-img-element */

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/useTranslation"
import type { TranslationKey } from "@/i18n/translations"
import type { TimelineEvent } from "../lib/release-catalog"

type TimelineSectionProps = { events: TimelineEvent[] }
type YearGroup = { year: string; events: TimelineEvent[] }
type TStrFn = (key: TranslationKey) => string

const TIMELINE_OBSERVER_THRESHOLDS = [0.45, 0.7]
const INITIAL_VISIBLE_YEAR_GROUPS = 4
const TIMELINE_TYPE_TRANSLATION_KEYS: Partial<Record<string, TranslationKey>> = {
  debut: "timeline.type.debut",
  comeback: "timeline.type.comeback",
  "pre-release": "timeline.type.preRelease",
  "1st ep": "timeline.type.firstEp",
  ep: "timeline.type.ep",
  single: "timeline.type.single",
  album: "timeline.type.album",
}

function parseTimelineDate(date: string) {
  const [day, month, year] = date.split("/").map(Number)
  if (day && month && year) return new Date(year, month - 1, day).getTime()
  const fallback = Date.parse(date)
  return Number.isNaN(fallback) ? 0 : fallback
}

function getYear(date: string) {
  return date.split("/")[2] ?? date
}

function groupEventsByYear(events: TimelineEvent[]): YearGroup[] {
  const sorted = [...events].sort((a, b) => parseTimelineDate(a.date) - parseTimelineDate(b.date))
  const grouped = sorted.reduce<Record<string, TimelineEvent[]>>((acc, ev) => {
    const year = getYear(ev.date)
    ;(acc[year] ??= []).push(ev)
    return acc
  }, {})

  return Object.entries(grouped)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([year, yearEvents]) => ({ year, events: yearEvents }))
}

function getTimelineTypeLabel(type: string, tStr: TStrFn) {
  const translationKey = TIMELINE_TYPE_TRANSLATION_KEYS[type.trim().toLowerCase()] ?? "timeline.type.release"
  return tStr(translationKey)
}

function formatReleaseCount(
  count: number,
  singularLabel: string,
  pluralLabel: string,
) {
  return `${count} ${count > 1 ? pluralLabel : singularLabel}`
}

const TYPE_PALETTE: Record<string, { bg: string; text: string; dot: string }> = {
  debut: { bg: "#e0f2fe", text: "#0369a1", dot: "#0ea5e9" },
  comeback: { bg: "#dbeafe", text: "#1d4ed8", dot: "#3b82f6" },
  "pre-release": { bg: "#f0f9ff", text: "#0284c7", dot: "#38bdf8" },
  "1st ep": { bg: "#ecfeff", text: "#0e7490", dot: "#06b6d4" },
  ep: { bg: "#ecfeff", text: "#0e7490", dot: "#06b6d4" },
  single: { bg: "#e0f2fe", text: "#075985", dot: "#0ea5e9" },
  album: { bg: "#dbeafe", text: "#1e40af", dot: "#60a5fa" },
}

const DEFAULT_PALETTE = { bg: "#f0f9ff", text: "#0369a1", dot: "#7dd3fc" }

function typePalette(type: string) {
  return TYPE_PALETTE[type.toLowerCase()] ?? DEFAULT_PALETTE
}

function TimelineCard({
  event,
  isNewest,
  viewLabel,
  tStr,
}: {
  event: TimelineEvent
  isNewest: boolean
  viewLabel: string
  tStr: TStrFn
}) {
  const palette = typePalette(event.type)
  const typeLabel = getTimelineTypeLabel(event.type, tStr)

  return (
    <li className="w-[188px] shrink-0 snap-start sm:w-[205px] lg:w-[220px]">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5 items-center justify-center">
          {isNewest ? (
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
              style={{ backgroundColor: palette.dot }}
            />
          ) : null}
          <span
            className="relative h-2 w-2 rounded-full"
            style={{
              backgroundColor: palette.dot,
              boxShadow: `0 0 0 3px ${palette.dot}33`,
            }}
          />
        </span>
        <span className="tl-body text-[10px] uppercase tracking-[0.18em] text-slate-400">{event.date}</span>
      </div>

      <Link
        href={`/albums/${event.slug}`}
        className="group block overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_2px_12px_rgba(14,165,233,0.06)] transition-all duration-500 hover:-translate-y-1.5 hover:border-sky-300 hover:shadow-[0_16px_40px_rgba(14,165,233,0.14)]"
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={event.cover}
            alt={`${event.title} cover`}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(12,74,110,0.55)_0%,rgba(12,74,110,0.1)_45%,transparent_100%)]" />

          <span
            className="tl-body absolute left-2.5 top-2.5 rounded-full px-2.5 py-0.5 text-[9px] uppercase tracking-[0.2em]"
            style={{
              backgroundColor: palette.bg,
              color: palette.text,
            }}
          >
            {typeLabel}
          </span>

          <p className="tl-display absolute bottom-0 left-0 right-0 px-3 pb-2.5 text-[1.05rem] italic leading-tight text-white">
            {event.title}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-sky-100 px-3 py-2">
          <span className="tl-body text-[9px] uppercase tracking-[0.16em] text-slate-400">{event.date}</span>
          <span className="tl-body text-[9px] uppercase tracking-[0.14em] text-slate-400 transition-colors duration-300 group-hover:text-sky-500">
            {viewLabel} →
          </span>
        </div>
      </Link>
    </li>
  )
}

export function TimelineSection({ events }: TimelineSectionProps) {
  const { t, lang } = useTranslation()

  // Wrapper đảm bảo luôn trả về string, fix lỗi TranslationValue<K> không gán được cho string
  const tStr: TStrFn = (key) => {
    const val = t(key)
    return Array.isArray(val) ? val.join(", ") : (val as string)
  }

  const hasEvents = events.length > 0
  const groups = useMemo(() => groupEventsByYear(events), [events])
  const [visibleYearCount, setVisibleYearCount] = useState(INITIAL_VISIBLE_YEAR_GROUPS)
  const visibleGroups = useMemo(
    () => groups.slice(Math.max(0, groups.length - visibleYearCount)),
    [groups, visibleYearCount],
  )
  const hiddenYearCount = Math.max(0, groups.length - visibleGroups.length)
  const firstYear = groups[0]?.year ?? ""
  const lastYear = groups[groups.length - 1]?.year ?? "-"
  const firstVisibleYear = visibleGroups[0]?.year ?? ""
  const latestRelease = useMemo(
    () => [...events].sort((a, b) => parseTimelineDate(b.date) - parseTimelineDate(a.date))[0],
    [events],
  )
  const yearRefs = useRef<Record<string, HTMLElement | null>>({})
  const railRef = useRef<HTMLDivElement | null>(null)
  const activeYearRef = useRef(firstVisibleYear)
  const pendingYearRef = useRef<string>("")
  const rafRef = useRef<number | null>(null)
  const [activeYear, setActiveYear] = useState(firstVisibleYear)
  const releaseLabel = tStr("timeline.type.release")
  const releasePluralLabel = lang === "en" ? `${releaseLabel}s` : releaseLabel

  useEffect(() => {
    setVisibleYearCount(INITIAL_VISIBLE_YEAR_GROUPS)
  }, [events])

  function scheduleActiveYear(year: string) {
    if (!year || year === activeYearRef.current) {
      return
    }

    pendingYearRef.current = year

    if (rafRef.current !== null) {
      return
    }

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const nextYear = pendingYearRef.current

      if (!nextYear || nextYear === activeYearRef.current) {
        return
      }

      activeYearRef.current = nextYear
      setActiveYear(nextYear)
    })
  }

  useEffect(() => {
    yearRefs.current = {}
    activeYearRef.current = firstVisibleYear
    setActiveYear(firstVisibleYear)
  }, [firstVisibleYear])

  useEffect(() => {
    const rail = railRef.current
    if (!rail) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        let targetYear = ""
        let bestRatio = 0

        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.intersectionRatio <= bestRatio) {
            return
          }

          bestRatio = entry.intersectionRatio
          targetYear = (entry.target as HTMLElement).dataset.year ?? ""
        })

        if (!targetYear) {
          return
        }

        scheduleActiveYear(targetYear)
      },
      {
        root: rail,
        threshold: TIMELINE_OBSERVER_THRESHOLDS,
      },
    )

    Object.values(yearRefs.current).forEach((node) => {
      if (node) {
        observer.observe(node)
      }
    })

    return () => {
      observer.disconnect()
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [visibleGroups])

  function handleYearSelect(year: string) {
    const target = yearRefs.current[year]
    if (!target) return

    activeYearRef.current = year
    setActiveYear(year)
    target.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" })
  }

  return (
    <>
      <style>{`
        .tl-display { font-family: var(--font-display, 'Playfair Display', Georgia, serif); }
        .tl-body { font-family: var(--font-body, 'Merriweather', Georgia, serif); }

        .tl-rail::-webkit-scrollbar { height: 2px; }
        .tl-rail::-webkit-scrollbar-track { background: #e0f2fe; border-radius: 9999px; }
        .tl-rail::-webkit-scrollbar-thumb { background: linear-gradient(90deg,#38bdf8,#0ea5e9); border-radius: 9999px; }
        .tl-year-nav::-webkit-scrollbar { display: none; }

        @keyframes tl-rise {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .tl-rise { animation: tl-rise 0.65s cubic-bezier(0.23,1,0.32,1) both; }
        .tl-rise-d1 { animation-delay: 0.06s; }
        .tl-rise-d2 { animation-delay: 0.14s; }
        .tl-rise-d3 { animation-delay: 0.22s; }

        @keyframes tl-shimmer {
          from { background-position: -200% center; }
          to { background-position: 200% center; }
        }

        .tl-yr-active::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          background: linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent);
          background-size: 200% auto;
          animation: tl-shimmer 2s linear infinite;
        }

        .tl-year-wm { transition: color 0.5s ease; }
      `}</style>

      <div className="tl-rise sky-panel relative mt-10 overflow-hidden rounded-[1.75rem] border border-white/70 shadow-[0_24px_60px_rgba(84,138,181,0.12)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")",
            backgroundSize: "160px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full"
          style={{ background: "radial-gradient(circle,rgba(125,211,252,0.18) 0%,transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-10 h-64 w-64 rounded-full"
          style={{ background: "radial-gradient(circle,rgba(186,230,253,0.14) 0%,transparent 70%)" }}
        />

        <header className="tl-rise relative flex flex-wrap items-center justify-between gap-3 border-b border-white/70 px-5 py-4 sm:px-7 sm:py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-sky-700/70">{tStr("timeline.label")}</p>
            <h2 className="tl-display mt-4 text-3xl uppercase leading-none text-slate-950 sm:text-4xl">
              {tStr("timeline.title")}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="tl-body rounded-full border border-white/80 bg-white/75 px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-slate-600">
              {events.length} {tStr("timeline.eras")}
            </span>
            <span className="tl-body rounded-full border border-white/80 bg-white/75 px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-slate-600">
              {firstYear || "-"} - {lastYear}
            </span>
          </div>
        </header>

        {!hasEvents ? (
          <div className="border-b border-white/70 px-5 py-10 text-center sm:px-7">
            <p className="tl-display text-2xl italic text-slate-800">{tStr("timeline.emptyTitle")}</p>
            <p className="tl-body mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
              {tStr("timeline.emptyDesc")}
            </p>
          </div>
        ) : null}

        {latestRelease && hasEvents ? (
          <div className="tl-rise tl-rise-d1 relative overflow-hidden border-b border-white/70">
            <img
              src={latestRelease.cover}
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover opacity-[0.06] blur-xl"
            />

            <div className="relative flex flex-wrap items-center justify-between gap-5 px-5 py-5 sm:px-7 sm:py-6">
              <div className="flex items-stretch gap-4 border-l-[2.5px] border-sky-500 pl-4 sm:gap-5 sm:pl-5">
                <div className="h-[76px] w-[57px] shrink-0 overflow-hidden rounded-xl border border-sky-200 shadow-[0_8px_28px_rgba(14,165,233,0.18)]">
                  <img src={latestRelease.cover} alt={latestRelease.title} className="h-full w-full object-cover" />
                </div>

                <div>
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-500" />
                    <span className="tl-body text-[9px] uppercase tracking-[0.3em] text-sky-500">
                      {tStr("timeline.newestDrop")}
                    </span>
                    <span
                      className="tl-body rounded-full px-2 py-0.5 text-[8px] uppercase tracking-[0.16em]"
                      style={{
                        background: typePalette(latestRelease.type).bg,
                        color: typePalette(latestRelease.type).text,
                      }}
                    >
                      {getTimelineTypeLabel(latestRelease.type, tStr)}
                    </span>
                  </div>

                  <p className="tl-display text-[clamp(1.55rem,4.3vw,2.25rem)] italic leading-none text-slate-900">
                    {latestRelease.title}
                  </p>
                  <p className="tl-body mt-1.5 text-[9px] uppercase tracking-[0.22em] text-slate-400">
                    {latestRelease.date}
                  </p>
                </div>
              </div>

              <Link
                href={`/albums/${latestRelease.slug}`}
                className="group inline-flex items-center gap-2.5 rounded-full border border-white/80 bg-white/80 px-5 py-2.5 text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white hover:shadow-[0_8px_24px_rgba(94,140,182,0.12)]"
              >
                <span className="tl-body text-[10px] uppercase tracking-[0.2em]">{tStr("timeline.openAlbum")}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  <path d="M2 6h8M6 2l4 4-4 4" />
                </svg>
              </Link>
            </div>
          </div>
        ) : null}

        {hiddenYearCount > 0 && hasEvents ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/70 bg-white/55 px-5 py-3 sm:px-7">
            <p className="tl-body text-[9px] uppercase tracking-[0.18em] text-slate-400">
              {tStr("timeline.showingYears")} {visibleGroups.length}/{groups.length} {tStr("timeline.latestYears")}
            </p>
            <button
              type="button"
              onClick={() => setVisibleYearCount((prev) => Math.min(groups.length, prev + INITIAL_VISIBLE_YEAR_GROUPS))}
              className="flex items-center gap-1.5 rounded-full border border-white/80 bg-white px-4 py-1.5 text-slate-700 transition-all duration-200 hover:border-sky-200 hover:shadow-md"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M5 8V2M2 5l3-3 3 3" />
              </svg>
              <span className="tl-body text-[9px] uppercase tracking-[0.18em]">
                {tStr("timeline.showMoreYears")} {Math.min(INITIAL_VISIBLE_YEAR_GROUPS, hiddenYearCount)} {tStr("timeline.olderYears")}
              </span>
            </button>
          </div>
        ) : null}

        <div className="tl-rise tl-rise-d2 border-b border-white/70 px-5 py-4 sm:px-7">
          <div className="tl-year-nav flex items-center gap-2 overflow-x-auto [scrollbar-width:none]">
            {visibleGroups.map((group) => {
              const isActive = group.year === activeYear
              return (
                <button
                  key={group.year}
                  type="button"
                  onClick={() => handleYearSelect(group.year)}
                  aria-pressed={isActive}
                  className={cn(
                    "tl-display relative shrink-0 overflow-hidden rounded-full italic transition-all duration-300",
                    isActive && "tl-yr-active",
                  )}
                  style={{
                    padding: "7px 22px",
                    fontSize: "1.15rem",
                    letterSpacing: "0.02em",
                    border: isActive ? "1.5px solid #7cc5f3" : "1px solid rgba(255,255,255,0.8)",
                    background: isActive
                      ? "linear-gradient(135deg,rgba(94,177,236,0.95) 0%,rgba(56,148,214,0.95) 100%)"
                      : "rgba(255,255,255,0.86)",
                    color: isActive ? "#ffffff" : "#64748b",
                    boxShadow: isActive ? "0 6px 18px rgba(72,155,227,0.28)" : "0 1px 4px rgba(94,140,182,0.06)",
                  }}
                >
                  {group.year}
                  <span
                    className="tl-body ml-2 rounded-full px-1.5 py-0.5 text-[9px] not-italic tracking-[0.14em]"
                    style={{
                      background: isActive ? "rgba(255,255,255,0.25)" : "#e0f2fe",
                      color: isActive ? "white" : "#0369a1",
                    }}
                  >
                    {group.events.length}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-white/60 px-5 py-2 sm:px-7">
          <span className="tl-body flex items-center gap-2 text-[9px] uppercase tracking-[0.22em] text-slate-400">
            <svg
              width="14"
              height="8"
              viewBox="0 0 14 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            >
              <path d="M1 4h12M1 4l2.5-2.5M1 4l2.5 2.5M13 4l-2.5-2.5M13 4l-2.5 2.5" />
            </svg>
            {tStr("timeline.dragHint")}
          </span>
          {activeYear ? <span className="tl-display text-[0.9rem] italic text-sky-500">{activeYear}</span> : null}
        </div>

        <div ref={railRef} className="tl-rail tl-rise tl-rise-d3 overflow-x-auto pb-[6px] [scrollbar-width:thin]">
          <div className="flex min-w-max gap-8 px-5 py-6 sm:gap-10 sm:px-7 sm:py-7">
            {visibleGroups.map((group, groupIndex) => (
              <section
                key={group.year}
                ref={(node) => {
                  yearRefs.current[group.year] = node
                }}
                data-year={group.year}
                className="relative min-w-max scroll-mx-7"
              >
                <div
                  aria-hidden
                  className="tl-display tl-year-wm pointer-events-none absolute -top-3 left-0 select-none text-[clamp(4.2rem,9vw,7rem)] italic leading-none"
                  style={{
                    color:
                      group.year === activeYear ? "rgba(186,230,253,0.55)" : "rgba(224,242,254,0.38)",
                    letterSpacing: "-0.03em",
                    zIndex: 0,
                  }}
                >
                  {group.year}
                </div>

                <div className="relative mb-5 flex items-center gap-3" style={{ zIndex: 1 }}>
                  <span
                    className="tl-display rounded-full px-4 py-1 text-[1.1rem] italic"
                    style={{
                      border: group.year === activeYear ? "1.5px solid #7dd3fc" : "1px solid rgba(255,255,255,0.8)",
                      background:
                        group.year === activeYear
                          ? "linear-gradient(135deg,rgba(224,242,254,0.95),rgba(186,230,253,0.95))"
                          : "rgba(255,255,255,0.85)",
                      color: group.year === activeYear ? "#0369a1" : "#94a3b8",
                      transition: "all 0.35s ease",
                    }}
                  >
                    {group.year}
                  </span>

                  <span className="tl-body text-[9px] uppercase tracking-[0.2em] text-slate-300">
                    {formatReleaseCount(group.events.length, releaseLabel, releasePluralLabel)}
                  </span>

                  {groupIndex < visibleGroups.length - 1 ? (
                    <div
                      className="ml-2 h-px w-12"
                      style={{ background: "linear-gradient(to right,#bae6fd 0%,transparent 100%)" }}
                    />
                  ) : null}
                </div>

                <ol className="relative flex gap-3 pb-2" style={{ zIndex: 1 }}>
                  {group.events.map((event) => {
                    const isNewest = latestRelease?.slug === event.slug && latestRelease.date === event.date

                    return (
                      <TimelineCard
                        key={`${event.date}-${event.title}`}
                        event={event}
                        isNewest={isNewest}
                        viewLabel={tStr("timeline.view")}
                        tStr={tStr}
                      />
                    )
                  })}
                </ol>
              </section>
            ))}
          </div>
        </div>

        <div aria-hidden className="h-[2px] w-full bg-[linear-gradient(to_right,transparent_0%,#d2ecff_22%,#7ec6f5_50%,#d2ecff_78%,transparent_100%)]" />
      </div>
    </>
  )
}