"use client"

/* eslint-disable @next/next/no-img-element */

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/useTranslation"
import type { TimelineEvent } from "../lib/release-catalog"

type TimelineSectionProps = { events: TimelineEvent[] }
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

// --- Components ---
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
  const typeLabel = getTimelineTypeLabel(event.type, tStr)

  return (
    <li className="w-[180px] shrink-0 snap-start sm:w-[220px] group/card">
      <div className="mb-3 flex items-center gap-2.5 px-1">
        <div className={cn(
          "size-1.5 rounded-full transition-all duration-300",
          isNewest ? "bg-pink-500 animate-pulse ring-2 ring-pink-500/20" : "bg-slate-300"
        )} />
        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
          {event.date}
        </span>
      </div>

      <Link
        href={`/albums/${event.slug}`}
        className="block relative aspect-square overflow-hidden rounded-[2rem] border border-white/60 bg-white/50 backdrop-blur-md p-1.5 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.08)]"
      >
        <div className="relative h-full w-full overflow-hidden rounded-[1.5rem]">
          <img
            src={event.cover}
            alt={event.title}
            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover/card:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest bg-white text-slate-800 border border-slate-100 shadow-sm">
              {typeLabel}
            </span>
          </div>
        </div>
      </Link>

      <div className="mt-3 px-1">
        <h4 className="text-[12px] font-black uppercase tracking-tight text-slate-900 line-clamp-1 group-hover/card:text-pink-500 transition-colors">
          {event.title}
        </h4>
        <div className="mt-0.5 flex items-center justify-between">
          <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
            {viewLabel}
          </span>
          <ArrowRight className="size-2.5 text-slate-300 group-hover/card:translate-x-1 group-hover/card:text-pink-400 transition-all" />
        </div>
      </div>
    </li>
  )
}

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
    // Align detection point slightly to the right of the rail's left edge
    const detectionPoint = railRect.left + 80 

    for (const group of groups) {
      const el = yearRefs.current[group.year]
      if (el) {
        const rect = el.getBoundingClientRect()
        if (rect.left <= detectionPoint && rect.right >= detectionPoint) {
          setActiveYear(group.year)
          break
        }
      }
    }
  }, [groups])

  const scrollToYear = (year: string) => {
    const rail = railRef.current
    const target = yearRefs.current[year]
    if (!rail || !target) return

    isManualScrolling.current = true
    setActiveYear(year)
    
    // Smooth scroll to the target's position
    rail.scrollTo({ left: target.offsetLeft, behavior: "smooth" })

    // Extended guard time to ensure scroll completion before re-enabling detection
    setTimeout(() => {
      isManualScrolling.current = false
      updateScrollState()
    }, 1000)
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
      setActiveYear(groups[groups.length - 1].year)
    }
  }, [groups, activeYear])

  if (!events.length) return null

  return (
    <section id="timeline" className="py-16 select-none relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        
        {/* Compact Header */}
        <div className="mb-10 relative z-30 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-100 bg-white shadow-sm scale-90 origin-left">
              <Clock className="size-3.5 text-sky-500" />
              <p className="text-sky-600 font-black uppercase tracking-widest text-[9px]">
                {tStr("timeline.label") || "TIMELINE"}
              </p>
            </div>
            <h2 className="section-title">
              Annual Discography
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-1 p-1 rounded-full bg-slate-200/40 border border-slate-200 shadow-sm backdrop-blur-md">
              {groups.map((group) => (
                <button
                  key={group.year}
                  onClick={() => scrollToYear(group.year)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative",
                    activeYear === group.year ? "text-white shadow-xl" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {activeYear === group.year && (
                    <span className="absolute inset-0 bg-slate-900 rounded-full z-0" />
                  )}
                  <span className="relative z-10">{group.year}</span>
                </button>
              ))}
            </nav>

            <div className="flex gap-2">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className="size-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 disabled:opacity-20 hover:bg-slate-900 hover:text-white transition-all shadow-lg active:scale-90"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className="size-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 disabled:opacity-20 hover:bg-slate-900 hover:text-white transition-all shadow-lg active:scale-90"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scaled-down Card Layout */}
        <div className="card-premium p-6 md:p-10 relative overflow-hidden">
          <div
            ref={railRef}
            className="relative flex gap-20 overflow-x-auto [scrollbar-width:none] snap-x snap-mandatory pb-2 scroll-px-10"
          >
            {groups.map((group) => (
              <div 
                key={group.year} 
                ref={el => { yearRefs.current[group.year] = el }}
                className="flex flex-col gap-8 shrink-0 snap-start"
              >
                <div className="flex items-center gap-5">
                  <div className="flex items-center justify-center px-5 py-2.5 rounded-2xl bg-slate-950 text-white shadow-2xl">
                    <span className="text-lg font-black tracking-tighter">{group.year}</span>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-900/80">
                      Season Collection
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-pink-500/60">
                      {group.events.length} Masterpieces
                    </p>
                  </div>
                </div>
                
                <ol className="flex gap-12">
                  {group.events.map((event) => (
                    <TimelineCard
                      key={`${event.date}-${event.title}`}
                      event={event}
                      isNewest={latestRelease?.slug === event.slug}
                      viewLabel={tStr("timeline.view") || "DISCOVER"}
                      tStr={tStr}
                    />
                  ))}
                </ol>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center justify-between border-t border-black/5 pt-8 opacity-30">
             <div className="flex items-center gap-3">
               <Sparkles className="size-4 text-pink-400" />
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Official H2H Catalog</span>
             </div>
             <img src="/logo-remove.png" alt="H2H" className="h-6 grayscale opacity-20" />
          </div>
        </div>
      </div>
    </section>
  )
}
