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

const TYPE_PALETTE: Record<string, { bg: string; text: string }> = {
  debut: { bg: "bg-[#A2D2FF]/20", text: "text-[#4A90E2]" },
  comeback: { bg: "bg-[#FFC2D1]/20", text: "text-[#FF708A]" },
  "pre-release": { bg: "bg-slate-100", text: "text-slate-600" },
  "1st ep": { bg: "bg-[#A2D2FF]/20", text: "text-[#4A90E2]" },
  ep: { bg: "bg-[#A2D2FF]/20", text: "text-[#4A90E2]" },
  single: { bg: "bg-slate-100", text: "text-slate-600" },
  album: { bg: "bg-[#FFC2D1]/20", text: "text-[#FF708A]" },
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
  const palette = TYPE_PALETTE[event.type.toLowerCase()] ?? { bg: "bg-slate-100", text: "text-slate-600" }
  const typeLabel = getTimelineTypeLabel(event.type, tStr)

  return (
    <li className="w-[280px] shrink-0 snap-start sm:w-[320px]">
      <div className="mb-4 flex items-center gap-3">
        <div className={cn(
          "size-2.5 rounded-full",
          isNewest ? "bg-[#FF708A] animate-pulse" : "bg-slate-200"
        )} />
        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{event.date}</span>
      </div>

      <Link
        href={`/albums/${event.slug}`}
        className="group block overflow-hidden rounded-[2rem] border border-white bg-white/40 p-3 shadow-sm backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:bg-white hover:shadow-xl"
      >
        <div className="relative aspect-square overflow-hidden rounded-[1.6rem]">
          <img
            src={event.cover}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          <div className="absolute top-4 left-4">
            <span className={cn(
              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md",
              palette.bg,
              palette.text
            )}>
              {typeLabel}
            </span>
          </div>
        </div>

        <div className="p-4">
          <p className="text-[16px] font-black uppercase tracking-tight text-slate-900 group-hover:text-[#FF708A] transition-colors">{event.title}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400">{viewLabel}</span>
            <div className="size-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#FFC2D1]/30 group-hover:text-[#FF708A] transition-all">
              <ArrowRight className="size-4" />
            </div>
          </div>
        </div>
      </Link>
    </li>
  )
}

import { ArrowRight, ChevronLeft, ChevronRight, Clock } from "lucide-react"

export function TimelineSection({ events }: TimelineSectionProps) {
  const { t, lang } = useTranslation()
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
  
  const railRef = useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  
  const latestRelease = useMemo(
    () => [...events].sort((a, b) => parseTimelineDate(b.date) - parseTimelineDate(a.date))[0],
    [events],
  )

  const updateScrollState = () => {
    const rail = railRef.current
    if (!rail) return
    setCanScrollLeft(rail.scrollLeft > 10)
    setCanScrollRight(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 10)
  }

  useEffect(() => {
    updateScrollState()
    window.addEventListener("resize", updateScrollState)
    return () => window.removeEventListener("resize", updateScrollState)
  }, [visibleGroups])

  const scroll = (direction: "left" | "right") => {
    const rail = railRef.current
    if (!rail) return
    const amount = direction === "left" ? -400 : 400
    rail.scrollBy({ left: amount, behavior: "smooth" })
  }

  return (
    <section id="timeline" className="reveal-up">
      <div className="glass-panel rounded-[3rem] p-8 lg:p-12">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-12">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 text-[#A2D2FF]">
              <Clock className="size-5" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em]">{tStr("timeline.label")}</p>
            </div>
            <h2 className="mt-5 text-4xl uppercase leading-none text-slate-900 sm:text-5xl">
              {tStr("timeline.title")}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="size-12 rounded-full border border-white bg-white/40 flex items-center justify-center text-slate-600 disabled:opacity-30 hover:bg-white transition-all shadow-sm"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="size-12 rounded-full border border-white bg-white/40 flex items-center justify-center text-slate-600 disabled:opacity-30 hover:bg-white transition-all shadow-sm"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </header>

        <div
          ref={railRef}
          onScroll={updateScrollState}
          className="flex gap-10 overflow-x-auto [scrollbar-width:none] snap-x pb-8"
        >
          {visibleGroups.map((group) => (
            <div key={group.year} className="flex flex-col gap-8 shrink-0">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-black italic text-slate-200">{group.year}</span>
                <div className="h-px w-20 bg-gradient-to-r from-slate-200 to-transparent" />
              </div>
              
              <ol className="flex gap-6">
                {group.events.map((event) => (
                  <TimelineCard
                    key={`${event.date}-${event.title}`}
                    event={event}
                    isNewest={latestRelease?.slug === event.slug}
                    viewLabel={tStr("timeline.view")}
                    tStr={tStr}
                  />
                ))}
              </ol>
            </div>
          ))}
        </div>

        {groups.length > visibleYearCount && (
          <div className="mt-10 pt-10 border-t border-white/40 text-center">
            <button
              onClick={() => setVisibleYearCount(prev => prev + 2)}
              className="px-10 py-4 rounded-full border border-[#FFC2D1] bg-[#FFC2D1]/10 text-[#FF708A] text-[11px] font-black uppercase tracking-widest hover:bg-[#FFC2D1] hover:text-white transition-all"
            >
              {tStr("timeline.showMoreYears")}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}