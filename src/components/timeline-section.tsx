"use client"

/* eslint-disable @next/next/no-img-element */

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Disc3,
  Music,
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
  debut: "text-violet-700",
  comeback: "text-pink-700",
  "pre-release": "text-amber-700",
  "1st ep": "text-sky-700",
  ep: "text-sky-700",
  single: "text-emerald-700",
  album: "text-rose-700",
  release: "text-slate-600",
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
  const sorted = [...events].sort(
    (a, b) => parseTimelineDate(a.date) - parseTimelineDate(b.date)
  )
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
  const translationKey =
    TIMELINE_TYPE_TRANSLATION_KEYS[type.trim().toLowerCase()] ??
    "timeline.type.release"
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
      className="w-[160px] shrink-0 flex flex-col"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Date row */}
      <div className="mb-2 flex items-center justify-between gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-sky-700/70 tabular-nums">
          {event.date}
        </span>
        {isNewest && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 border border-sky-200 text-[8px] font-black uppercase tracking-widest text-sky-700">
            <Star className="size-2 fill-current" />
            New
          </span>
        )}
      </div>

      {/* Cover image */}
      <Link
        href={`/albums/${event.slug}`}
        className={cn(
          "block relative aspect-square overflow-hidden rounded-2xl",
          "transition-transform duration-300 hover:-translate-y-1",
          isNewest
            ? "ring-2 ring-sky-400/40 shadow-[0_8px_24px_-6px_rgba(14,165,233,0.25)]"
            : "shadow-[0_4px_16px_-4px_rgba(13,33,55,0.1)] ring-1 ring-slate-900/5"
        )}
      >
        {event.cover ? (
          <img
            src={event.cover}
            alt={event.title}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-sky-100 to-sky-200">
            <Music className="size-8 text-sky-400/60" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-200" />

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <span
            className={cn(
              "px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[8px] font-black uppercase tracking-widest",
              typeColor
            )}
          >
            {typeLabel}
          </span>
        </div>
      </Link>

      {/* Title */}
      <p className="mt-2 text-[11px] font-black uppercase tracking-tight text-slate-800 line-clamp-1">
        {event.title}
      </p>
    </li>
  )
}

// --- Year Section ---
function YearSection({
  group,
  latestSlug,
  tStr,
  yearRef,
}: {
  group: YearGroup
  latestSlug: string | undefined
  tStr: TStrFn
  yearRef: (el: HTMLDivElement | null) => void
}) {
  return (
    <div ref={yearRef} className="relative flex items-stretch gap-6 shrink-0">
      {/* Year label column — pointer-events-none so it never blocks clicks */}
      <div className="pointer-events-none select-none flex flex-col justify-end pb-1 pr-5 border-r border-sky-200/80 min-w-[80px]">
        <span className="text-[64px] font-black tracking-tighter leading-none text-sky-900/10">
          {group.year}
        </span>
        <div className="flex items-center gap-2 mt-1">
          <div className="h-px w-5 bg-sky-300" />
          <span className="text-[9px] font-bold uppercase tracking-[.18em] text-sky-600/70">
            {group.events.length}&nbsp;
            {group.events.length === 1 ? "release" : "releases"}
          </span>
        </div>
      </div>

      {/* Cards row — relative + z-10 ensures it sits above everything */}
      <ol className="relative z-10 flex gap-3 items-end pb-1">
        {group.events.map((event, i) => (
          <TimelineCard
            key={`${event.date}-${event.title}`}
            event={event}
            isNewest={latestSlug === event.slug}
            tStr={tStr}
            index={i}
          />
        ))}
      </ol>
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
    () =>
      [...events].sort(
        (a, b) => parseTimelineDate(b.date) - parseTimelineDate(a.date)
      )[0],
    [events]
  )

  const updateScrollState = useCallback(() => {
    const rail = railRef.current
    if (!rail || isManualScrolling.current) return

    setCanScrollLeft(rail.scrollLeft > 20)
    
    // Increased tolerance to 64px to account for flex gaps at the end
    const isAtEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 64
    setCanScrollRight(!isAtEnd)

    const railRect = rail.getBoundingClientRect()
    // Move detection point to 30% of the container to better detect items
    const detectionPoint = railRect.left + railRect.width * 0.3

    let currentYear = groups[0]?.year

    if (isAtEnd && groups.length > 0) {
      currentYear = groups[groups.length - 1].year
    } else {
      for (const group of groups) {
        const el = yearRefs.current[group.year]
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.left <= detectionPoint) {
            currentYear = group.year
          }
        }
      }
    }

    if (currentYear) {
      setActiveYear(currentYear)
    }
  }, [groups])

  const scrollToYear = (year: string) => {
    const target = yearRefs.current[year]
    const rail = railRef.current
    if (!target || !rail) return

    isManualScrolling.current = true
    setActiveYear(year)

    const railScrollLeft = rail.scrollLeft
    const railRectLeft = rail.getBoundingClientRect().left
    const targetRectLeft = target.getBoundingClientRect().left
    const targetOffset = targetRectLeft - railRectLeft + railScrollLeft

    rail.scrollTo({ left: targetOffset - 32, behavior: "smooth" })

    setTimeout(() => {
      isManualScrolling.current = false
      // Do NOT call updateScrollState here, so we don't overwrite the user's explicit click
      if (railRef.current) {
        setCanScrollLeft(railRef.current.scrollLeft > 20)
        setCanScrollRight(
          railRef.current.scrollLeft + railRef.current.clientWidth < railRef.current.scrollWidth - 64
        )
      }
    }, 800)
  }

  const scroll = (direction: "left" | "right") => {
    const rail = railRef.current
    if (!rail) return
    const amount = rail.clientWidth * 0.7
    rail.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    })

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
    <section id="timeline" className="py-16 select-none">
      <div className="max-w-5xl mx-auto px-4">

        {/* ── Header ── */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-sky-200 bg-white/70 backdrop-blur-sm">
              <Clock className="size-3.5 text-sky-500" />
              <span className="text-sky-600 font-black uppercase tracking-widest text-[9px]">
                {tStr("timeline.label") || "Timeline"}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-slate-900">
              Discography
            </h2>
          </div>

          <div className="relative z-10 flex items-center gap-3 w-full md:w-auto">
            {/* Year pill nav */}
            <nav className="flex items-center gap-1 p-1 rounded-full bg-white/60 border border-sky-200/60 backdrop-blur-sm overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-1 md:flex-none">
              {groups.map((group) => (
                <button
                  key={group.year}
                  onClick={() => scrollToYear(group.year)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all duration-200 shrink-0",
                    activeYear === group.year
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-sky-600 hover:text-slate-900 hover:bg-white/70"
                  )}
                >
                  {group.year}
                </button>
              ))}
            </nav>

            {/* Scroll arrows */}
            <div className="flex gap-1.5">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label="Scroll left"
                className="size-8 rounded-full border border-sky-200 bg-white/70 backdrop-blur-sm flex items-center justify-center text-sky-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95"
              >
                <ChevronLeft className="size-3.5" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Scroll right"
                className="size-8 rounded-full border border-sky-200 bg-white/70 backdrop-blur-sm flex items-center justify-center text-sky-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Card rail container ── */}
        <div className="relative rounded-[1.75rem] border border-white/70 bg-white/40 backdrop-blur-xl shadow-lg overflow-hidden">

          <div className="px-8 md:px-12 pt-10 pb-6 relative">
            {/* Scroll fade hints */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 z-10 bg-gradient-to-r from-white/50 to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-white/70 to-transparent" />

            <div
              ref={railRef}
              className="flex gap-10 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x pb-4 scroll-px-8"
            >
              {groups.map((group) => (
                <YearSection
                  key={group.year}
                  group={group}
                  latestSlug={latestRelease?.slug}
                  tStr={tStr}
                  yearRef={(el) => {
                    yearRefs.current[group.year] = el
                  }}
                />
              ))}
            </div>

            {/* Footer strip */}
            <div className="mt-2 pt-5 border-t border-sky-200/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-600/70">
                <Disc3 className="size-3.5" />
                <span className="text-[9px] font-black uppercase tracking-[.2em]">
                  Official Catalog
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sky-600/70">
                <Sparkles className="size-3" />
                <span className="text-[9px] font-bold uppercase tracking-widest">
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