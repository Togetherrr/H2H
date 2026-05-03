"use client"

import { useEffect, useRef, useState } from "react"
import {
  CalendarDays,
  Disc3,
  Radio,
  Sparkles,
  Trophy,
  ArrowUpRight
} from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"
import { cn } from "@/lib/utils"
import type { HomeStatsSnapshot } from "@/lib/home-stats"

type HomeStatsSectionProps = {
  snapshot: HomeStatsSnapshot
}

type AnimatedNumberProps = {
  value: number
  active: boolean
}

function parseIsoDate(date: string) {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    const [day, month, year] = date.split("/")
    return new Date(`${year}-${month}-${day}T00:00:00+09:00`)
  }
  const normalized = /T/.test(date) ? date : `${date}T00:00:00+09:00`
  const parsed = new Date(normalized)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function diffInDaysFrom(date: string) {
  const parsed = parseIsoDate(date)
  if (!parsed) return 0
  const now = new Date()
  const diff = now.getTime() - parsed.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

function AnimatedNumber({ value, active }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!active) return
    let frame = 0
    const duration = 1500
    const start = performance.now()
    const tick = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      setDisplayValue(Math.round(value * eased))
      if (progress < 1) frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [active, value])

  return <>{mounted ? displayValue.toLocaleString() : "0"}</>
}

export function HomeStatsSection({ snapshot }: HomeStatsSectionProps) {
  const { t } = useTranslation()
  const sectionRef = useRef<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [debutDays, setDebutDays] = useState(0)

  useEffect(() => {
    setMounted(true)
    setDebutDays(diffInDaysFrom("24/02/2025"))

    const node = sectionRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const statCards = [
    {
      slug: "debut-days",
      key: "debut",
      icon: CalendarDays,
      label: t("stats.debutDays"),
      value: debutDays,
      color: "bg-sky-400",
      accent: "text-sky-600",
      badge: t("home.stats.badge.debutMilestone"),
      desc: t("home.stats.desc.sinceDebut")
    },
    {
      slug: "album-projects",
      key: "albums",
      icon: Disc3,
      label: t("stats.albums"),
      value: snapshot.albumCount,
      color: "bg-pink-300",
      accent: "text-sky-600",
      badge: t("home.stats.badge.releaseCatalog"),
      desc: t("home.stats.desc.fullDiscography")
    },
    {
      slug: "music-show-wins",
      key: "music-shows",
      icon: Radio,
      label: t("stats.musicShows"),
      value: snapshot.musicShowWins,
      color: "bg-sky-300",
      accent: "text-sky-600",
      badge: t("home.stats.badge.liveTrophies"),
      desc: t("home.stats.desc.broadcastWins")
    },
    {
      slug: "award-ceremony-wins",
      key: "award-ceremonies",
      icon: Trophy,
      label: t("stats.awardCeremonies"),
      value: snapshot.awardCeremonyWins,
      color: "bg-sky-500",
      accent: "text-sky-600",
      badge: t("home.stats.badge.globalAwards"),
      desc: t("home.stats.desc.industryHonors")
    },
  ]

  return (
    <section ref={sectionRef} className="reveal-up py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20 px-4">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 text-sky-500 mb-6">
            <Sparkles className="size-6 fill-current animate-pulse" />
            <p className="text-[12px] font-black uppercase tracking-[0.5em]">{t("stats.eyebrow")}</p>
          </div>
          <h2 className="text-title text-5xl sm:text-7xl">
            {t("home.stats.careerRecords").split(" ")[0]} <span className="text-gradient">{t("home.stats.careerRecords").split(" ").slice(1).join(" ")}</span>
          </h2>
        </div>
      </div>

      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 px-4">
        {statCards.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.key}
              className="group relative flex flex-col justify-between overflow-hidden rounded-[4rem] bg-white/6 p-12 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_30px_80px_rgba(0,0,0,0.4)] hover:border-sky-400/25 hover:bg-white/10"
            >
              <div className="relative z-10">
                <div className={cn(
                  "flex h-20 w-20 items-center justify-center rounded-[2rem] shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12",
                  card.color,
                  "text-white"
                )}>
                  <Icon className="size-10" />
                </div>
                
                <div className="mt-12 space-y-2">
                  <span className={cn(
                    "inline-flex px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/8",
                    card.accent
                  )}>
                    {card.badge}
                  </span>
                  <p className={cn("text-[13px] font-black uppercase tracking-widest block pt-2", card.accent)}>
                    {card.label}
                  </p>
                  <h3 className="text-7xl font-black tracking-tighter text-white pt-2">
                    {mounted ? (
                      <AnimatedNumber value={card.value} active={isVisible} />
                    ) : (
                      "0"
                    )}
                  </h3>
                  <p className="text-[12px] font-bold text-white/50 pt-2 uppercase tracking-widest">
                    {card.desc}
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-16 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/8 text-white/40 group-hover:bg-sky-500 group-hover:text-white transition-all duration-500">
                  <ArrowUpRight className="size-6" />
                </div>
              </div>

              {/* Decorative icon bg */}
              <div className="absolute top-0 right-0 p-8 opacity-[0.04] group-hover:opacity-[0.10] transition-opacity">
                <Icon className="size-40 text-white" />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
