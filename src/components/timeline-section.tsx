"use client"

/* eslint-disable @next/next/no-img-element */

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import type { TimelineEvent } from "../lib/release-catalog"

type TimelineSectionProps = {
  events: TimelineEvent[]
}

type YearGroup = {
  year: string
  events: TimelineEvent[]
}

const TIMELINE_OBSERVER_THRESHOLDS = [0.45, 0.7]

function getYear(date: string) {
  return date.split("/")[2] ?? date
}

function groupEventsByYear(events: TimelineEvent[]) {
  return events.reduce<YearGroup[]>((groups, event) => {
    const year = getYear(event.date)
    const lastGroup = groups[groups.length - 1]

    if (lastGroup?.year === year) {
      lastGroup.events.push(event)
      return groups
    }

    groups.push({ year, events: [event] })
    return groups
  }, [])
}

function formatReleaseCount(count: number) {
  return `${count} release${count > 1 ? "s" : ""}`
}

function TimelineCard({ event, isLast }: { event: TimelineEvent; isLast: boolean }) {
  return (
    <li className="w-[250px] shrink-0 snap-start sm:w-[270px]">
      <div className="mb-3 flex items-center gap-2">
        <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full border border-white bg-sky-500 shadow-[0_0_0_6px_rgba(148,214,255,0.22)]">
          <span
            aria-hidden="true"
            className={cn("absolute h-4 w-4 rounded-full bg-sky-300/65", isLast && "animate-ping")}
          />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-800/80">{event.date}</span>
      </div>

      <Link
        href={`/albums/${event.slug}`}
        className="group block overflow-hidden rounded-[1.5rem] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(245,251,255,0.72))] p-3 shadow-[0_18px_34px_rgba(94,140,182,0.11)] transition duration-300 hover:-translate-y-1 hover:border-sky-200/90 hover:shadow-[0_22px_44px_rgba(78,145,194,0.18)]"
      >
        <div className="relative overflow-hidden rounded-[1.2rem] border border-sky-100/70 bg-sky-50/70">
          <img
            src={event.cover}
            alt={`${event.title} cover`}
            className="h-36 w-full object-cover transition duration-700 group-hover:scale-110 sm:h-40"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/35 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="rounded-full border border-sky-100/80 bg-white/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-sky-700/80">
            {event.type}
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Tap for detail</span>
        </div>
        <p className="mt-2 text-[1.02rem] uppercase tracking-[0.08em] text-slate-950">{event.title}</p>
      </Link>
    </li>
  )
}

export function TimelineSection({ events }: TimelineSectionProps) {
  const groups = useMemo(() => groupEventsByYear(events), [events])
  const firstYear = groups[0]?.year ?? ""
  const lastYear = groups[groups.length - 1]?.year ?? "-"
  const yearRefs = useRef<Record<string, HTMLElement | null>>({})
  const railRef = useRef<HTMLDivElement | null>(null)
  const activeYearRef = useRef(firstYear)
  const pendingYearRef = useRef<string>("")
  const rafRef = useRef<number | null>(null)
  const [activeYear, setActiveYear] = useState(firstYear)

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
    activeYearRef.current = firstYear
    setActiveYear(firstYear)
  }, [firstYear])

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
  }, [groups])

  function handleYearSelect(year: string) {
    const target = yearRefs.current[year]

    if (!target) {
      return
    }

    activeYearRef.current = year
    setActiveYear(year)
    target.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" })
  }

  return (
    <div className="reveal-up delay-4 relative mt-10 overflow-hidden rounded-[2rem] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(233,246,255,0.62))] p-4 shadow-[0_20px_48px_rgba(94,140,182,0.14)] backdrop-blur-xl sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-10 top-2 h-28 w-28 rounded-full bg-sky-300/25 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 bottom-0 h-24 w-24 rounded-full bg-cyan-300/20 blur-2xl"
      />

      <div className="relative mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <p className="rounded-full border border-sky-200/60 bg-white/70 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-sky-700/90">
            Hearts2Hearts Timeline
          </p>
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Tap năm để nhảy tới album</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-slate-500">
          <span className="rounded-full border border-white/70 bg-white/60 px-3 py-1">{events.length} eras</span>
          <span className="rounded-full border border-white/70 bg-white/60 px-3 py-1">
            {firstYear || "-"} - {lastYear}
          </span>
        </div>
      </div>

      <div className="relative mb-5 overflow-hidden rounded-[1.6rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(240,248,255,0.62))] px-4 py-4 shadow-[0_12px_28px_rgba(94,140,182,0.08)]">
        <div className="absolute left-5 right-5 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-sky-300/80 to-transparent" />
        <div className="relative flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {groups.map((group) => {
            const isActive = group.year === activeYear

            return (
              <button
                key={group.year}
                type="button"
                onClick={() => handleYearSelect(group.year)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] transition",
                  isActive
                    ? "border-sky-300 bg-sky-500 text-white shadow-[0_10px_22px_rgba(72,155,227,0.28)]"
                    : "border-white/80 bg-white/75 text-slate-500 hover:border-sky-200 hover:text-sky-700",
                )}
                aria-pressed={isActive}
              >
                {group.year}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3 px-1 text-[10px] uppercase tracking-[0.24em] text-slate-400">
        <span>Drag horizontally or tap a year above</span>
        <span>{activeYear ? `Viewing ${activeYear}` : ""}</span>
      </div>

      <div ref={railRef} className="relative overflow-x-auto pb-2 [scrollbar-width:thin]">
        <div className="flex min-w-max gap-10 px-1">
          {groups.map((group) => (
            <section
              key={group.year}
              ref={(node) => {
                yearRefs.current[group.year] = node
              }}
              data-year={group.year}
              className="min-w-max scroll-mx-6 rounded-[1.8rem] border border-white/60 bg-white/35 p-4 shadow-[0_10px_28px_rgba(94,140,182,0.08)]"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-full border border-white/80 bg-white/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-800/85 shadow-sm">
                  {group.year}
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                  {formatReleaseCount(group.events.length)}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-sky-200/70 via-sky-300/50 to-transparent" />
              </div>

              <ol className="flex gap-4 pb-1">
                {group.events.map((event, index) => (
                  <TimelineCard
                    key={`${event.date}-${event.title}`}
                    event={event}
                    isLast={index === group.events.length - 1}
                  />
                ))}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
