"use client"

/* eslint-disable @next/next/no-img-element */

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Disc3,
  Sparkles,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/useTranslation"
import type { TimelineEvent } from "../lib/release-catalog"

type YearGroup = { year: string; events: TimelineEvent[] }
type TStrFn = (key: string) => string

// --- Helpers ---
const TIMELINE_TYPE_TRANSLATION_KEYS: Partial<Record<string, string>> = {
  debut: "timeline.type.debut",
  comeback: "timeline.type.comeback",
  "pre-release": "timeline.type.preRelease",
  "1st ep": "timeline.type.firstEp",
  ep: "timeline.type.ep",
  single: "timeline.type.single",
  album: "timeline.type.album",
}

const TYPE_COLORS: Record<string, string> = {
  debut:        "bg-violet-500 text-white",
  comeback:     "bg-pink-500 text-white",
  "pre-release":"bg-amber-400 text-amber-900",
  "1st ep":     "bg-sky-500 text-white",
  ep:           "bg-sky-500 text-white",
  single:       "bg-emerald-500 text-white",
  album:        "bg-rose-500 text-white",
  release:      "bg-slate-700 text-white",
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
      ; (acc[year] ??= []).push(ev)
    return acc
  }, {})

  return Object.entries(grouped)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([year, yearEvents]) => ({ year, events: yearEvents }))
}

function getTimelineTypeLabel(type: string, tStr: TStrFn) {
  const translationKey = TIMELINE_TYPE_TRANSLATION_KEYS[type.trim().toLowerCase()] ?? "timeline.type.release"
  const translated = tStr(translationKey)
  return translated === translationKey ? type : translated
}

function getTypeColor(type: string) {
  return TYPE_COLORS[type.trim().toLowerCase()] ?? TYPE_COLORS.release
}

// --- Album Card ---
function TimelineCard({
  event,
  isNewest,
  tStr,
  index,
}: {
  event: TimelineEvent
  isNewest: boolean
  tStr: TStrFn
  index: number
}) {
  const typeLabel = getTimelineTypeLabel(event.type, tStr)
  const typeColor = getTypeColor(event.type)

  return (
    <li
      className="w-[200px] shrink-0 sm:w-[240px] group/card"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Date row */}
      <div className="mb-3 flex items-center gap-2 px-1">
        <div className={cn(
          "size-2 rounded-full shrink-0",
          isNewest
            ? "bg-pink-500 shadow-[0_0_6px_2px_rgba(236,72,153,0.5)] animate-pulse"
            : "bg-slate-300"
        )} />
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 tabular-nums">
          {event.date}
        </span>
        {isNewest && (
          <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-50 border border-pink-200 text-[8px] font-black uppercase tracking-widest text-pink-600">
            <Star className="size-2.5 fill-current" />
            New
          </span>
        )}
      </div>

      {/* Cover image */}
      <Link
        href={`/albums/${event.slug}`}
        className={cn(
          "block relative aspect-square overflow-hidden rounded-[1.75rem] p-1.5",
          "border bg-white/60 backdrop-blur-sm",
          "transition-all duration-500",
          "hover:-translate-y-2 hover:rotate-1",
          isNewest
            ? "border-pink-300/60 shadow-[0_8px_32px_-4px_rgba(236,72,153,0.25)]  hover:shadow-[0_20px_40px_-8px_rgba(236,72,153,0.35)]"
            : "border-white/70 shadow-lg hover:shadow-2xl hover:shadow-slate-200/80"
        )}
      >
        {/* Inner image container */}
        <div className="relative h-full w-full overflow-hidden rounded-[1.25rem]">
          <img
            src={event.cover}
            alt={event.title}
            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover/card:scale-110"
          />

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />

          {/* Hover CTA */}
          <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover/card:opacity-100 transition-all duration-300 translate-y-2 group-hover/card:translate-y-0">
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/95 backdrop-blur-sm text-[11px] font-black uppercase tracking-widest text-slate-900 shadow-lg">
              Discover
              <ArrowUpRight className="size-3.5" />
            </span>
          </div>
        </div>

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className={cn(
            "px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-md",
            typeColor
          )}>
            {typeLabel}
          </span>
        </div>

        {/* Newest glow ring */}
        {isNewest && (
          <div className="absolute inset-0 rounded-[1.75rem] ring-2 ring-pink-400/40 ring-offset-2 ring-offset-transparent pointer-events-none" />
        )}
      </Link>

      {/* Title */}
      <div className="mt-3.5 px-1">
        <h4 className="text-[13px] font-black uppercase tracking-tight text-slate-900 line-clamp-1 group-hover/card:text-pink-500 transition-colors duration-200">
          {event.title}
        </h4>
      </div>
    </li>
  )
}

// --- Year Section Header ---
function YearHeader({ group }: { group: YearGroup }) {
  return (
    <div className="flex items-center gap-4 mb-2">
      {/* Year badge with gradient */}
      <div className="relative flex items-center justify-center px-6 py-3 rounded-2xl overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-sky-500/10" />
        <span className="relative text-2xl font-black tracking-tighter text-white">{group.year}</span>
      </div>

      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
          Season Collection
        </p>
        <p className="text-[13px] font-black text-slate-900 mt-0.5">
          {group.events.length}{" "}
          <span className="text-pink-500">{group.events.length === 1 ? "Release" : "Releases"}</span>
        </p>
      </div>
    </div>
  )
}

// --- Main Section ---
export function TimelineSection({ events }: { events: TimelineEvent[] }) {
  const { t } = useTranslation()
  const tStr = (key: string) => t(key)

  const groups = useMemo(() => groupEventsByYear(events), [events])
  const [activeYear, setActiveYear] = useState("")
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const railRef = useRef<HTMLDivElement | null>(null)
  const yearRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const isManualScrolling = useRef(false)

  const latestRelease = useMemo(
    () => [...events].sort((a, b) => parseTimelineDate(b.date) - parseTimelineDate(a.date))[0],
    [events],
  )

  const updateScrollState = useCallback(() => {
    const rail = railRef.current
    if (!rail || isManualScrolling.current) return

    setCanScrollLeft(rail.scrollLeft > 20)
    setCanScrollRight(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 20)

    const railRect = rail.getBoundingClientRect()
    const detectionPoint = railRect.left + 120

    for (const group of groups) {
      const el = yearRefs.current[group.year]
      if (el) {
        const rect = el.getBoundingClientRect()
        if (rect.left <= detectionPoint + 20 && rect.right >= detectionPoint - 20) {
          setActiveYear(group.year)
          break
        }
      }
    }
  }, [groups])

  const scrollToYear = (year: string) => {
    const target = yearRefs.current[year]
    if (!target) return

    isManualScrolling.current = true
    setActiveYear(year)
    target.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" })

    setTimeout(() => {
      isManualScrolling.current = false
      updateScrollState()
    }, 800)
  }

  const scroll = (direction: "left" | "right") => {
    const rail = railRef.current
    if (!rail) return
    const amount = rail.clientWidth * 0.7
    rail.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" })

    isManualScrolling.current = true
    setTimeout(() => {
      isManualScrolling.current = false
      updateScrollState()
    }, 1000)
  }

  useEffect(() => {
    const rail = railRef.current
    if (rail) {
      updateScrollState()
      rail.addEventListener("scroll", updateScrollState, { passive: true })
      window.addEventListener("resize", updateScrollState)
      return () => {
        rail.removeEventListener("scroll", updateScrollState)
        window.removeEventListener("resize", updateScrollState)
      }
    }
  }, [groups, updateScrollState])

  useEffect(() => {
    if (groups.length > 0 && !activeYear) {
      setActiveYear(groups[0].year)
    }
  }, [groups, activeYear])

  if (!events.length) return null

  return (
    <section id="timeline" className="py-16 select-none relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 relative z-10">

        {/* ── Header ── */}
        <div className="mb-10 relative z-30 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-sky-100 bg-white/80 backdrop-blur-sm shadow-sm">
              <Clock className="size-3.5 text-sky-500" />
              <p className="text-sky-600 font-black uppercase tracking-widest text-[9px]">
                {tStr("timeline.label") || "TIMELINE"}
              </p>
            </div>
            <h2 className="section-title">Annual Discography</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Year pill nav */}
            <nav className="flex items-center gap-1 p-1 rounded-full bg-white/70 border border-white/80 shadow-md backdrop-blur-md">
              {groups.map((group) => (
                <button
                  key={group.year}
                  onClick={() => scrollToYear(group.year)}
                  className={cn(
                    "px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 relative",
                    activeYear === group.year
                      ? "text-white"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {activeYear === group.year && (
                    <span className="absolute inset-0 rounded-full z-0 bg-gradient-to-r from-pink-500 to-rose-400 shadow-lg shadow-pink-500/30" />
                  )}
                  <span className="relative z-10">{group.year}</span>
                </button>
              ))}
            </nav>

            {/* Scroll arrows */}
            <div className="flex gap-1.5">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className="size-9 rounded-full border border-white/80 bg-white/80 backdrop-blur-sm flex items-center justify-center text-slate-500 disabled:opacity-20 hover:bg-white hover:text-pink-500 hover:border-pink-200 hover:shadow-md transition-all active:scale-90"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className="size-9 rounded-full border border-white/80 bg-white/80 backdrop-blur-sm flex items-center justify-center text-slate-500 disabled:opacity-20 hover:bg-white hover:text-pink-500 hover:border-pink-200 hover:shadow-md transition-all active:scale-90"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Card container ── */}
        <div className="card-premium relative overflow-hidden">
          {/* Decorative blobs inside card */}
          <div className="absolute top-0 right-0 size-64 bg-pink-300/10 blur-[80px] rounded-full -mr-10 -mt-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 size-64 bg-sky-300/10 blur-[80px] rounded-full -ml-10 -mb-10 pointer-events-none" />

          <div className="p-6 md:p-10 relative z-10">
            {/* Fade edges for scroll hint */}
            <div className="relative">
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-20 bg-gradient-to-r from-white/60 to-transparent" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-20 bg-gradient-to-l from-white/80 to-transparent" />

              <div
                ref={railRef}
                className="relative flex gap-16 overflow-x-auto [scrollbar-width:none] snap-x snap-mandatory pb-4 scroll-px-8"
              >
                {groups.map((group) => (
                  <div
                    key={group.year}
                    ref={el => { yearRefs.current[group.year] = el }}
                    className="flex flex-col gap-6 shrink-0 snap-start"
                  >
                    <YearHeader group={group} />

                    <ol className="flex gap-6">
                      {group.events.map((event, i) => (
                        <TimelineCard
                          key={`${event.date}-${event.title}`}
                          event={event}
                          isNewest={latestRelease?.slug === event.slug}
                          tStr={tStr}
                          index={i}
                        />
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer strip */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Disc3 className="size-4 text-pink-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                  Official H2H Catalog
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-sky-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {events.length} releases
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
