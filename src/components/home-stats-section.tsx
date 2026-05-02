"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  CalendarDays,
  Clock3,
  Disc3,
  ExternalLink,
  PlayCircle,
  Radio,
  Sparkles,
  Trophy,
} from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"
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

function formatComebackDate(date: string, lang: string) {
  const parsed = parseIsoDate(date)

  if (!parsed) {
    return date
  }

  const locale = lang === "vi" ? "vi-VN" : "en-GB"
  const formatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  })

  const formatted = formatter.format(parsed)
  return `${formatted} (KST)`
}

function parseDdMmYyyy(date: string) {
  const [day, month, year] = date.split("/").map(Number)

  if (!day || !month || !year) {
    return null
  }

  return new Date(year, month - 1, day)
}

function diffInDaysFrom(date: string) {
  const parsed = parseIsoDate(date)

  if (!parsed) {
    return 0
  }

  const now = new Date()
  const diff = now.getTime() - parsed.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

function formatCountdownParts(target: string) {
  const parsed = parseIsoDate(target)

  if (!parsed) {
    return null
  }

  const diff = parsed.getTime() - Date.now()
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true }
  }

  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / (60 * 60 * 24))
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60))
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds, isLive: false }
}

function AnimatedNumber({ value, active }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!active) {
      return
    }

    let frame = 0
    const duration = 1200
    const start = performance.now()

    const tick = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(value * eased))

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick)
      }
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [active, value])

  return <>{displayValue.toLocaleString()}</>
}

export function HomeStatsSection({ snapshot }: HomeStatsSectionProps) {
  const { t, lang } = useTranslation()
  const sectionRef = useRef<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [debutDays, setDebutDays] = useState(() => diffInDaysFrom(snapshot.debutDate))
  const [countdown, setCountdown] = useState(() =>
    snapshot.upcomingComeback ? formatCountdownParts(snapshot.upcomingComeback.releaseAt) : null,
  )

  useEffect(() => {
    const node = sectionRef.current

    if (!node) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return
        }

        setIsVisible(true)
        observer.disconnect()
      },
      { threshold: 0.35 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    setDebutDays(diffInDaysFrom(snapshot.debutDate))
  }, [snapshot.debutDate])

  useEffect(() => {
    if (!snapshot.upcomingComeback) {
      setCountdown(null)
      return
    }

    const updateCountdown = () => {
      setCountdown(formatCountdownParts(snapshot.upcomingComeback?.releaseAt ?? ""))
    }

    updateCountdown()
    const timer = window.setInterval(updateCountdown, 1_000)
    return () => window.clearInterval(timer)
  }, [snapshot.upcomingComeback])

  const latestReleaseDate = useMemo(() => parseDdMmYyyy(snapshot.latestRelease.date), [snapshot.latestRelease.date])
  const formattedLatestReleaseDate = latestReleaseDate?.toLocaleDateString(lang === "vi" ? "vi-VN" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
  const formattedComebackDate = snapshot.upcomingComeback
    ? formatComebackDate(snapshot.upcomingComeback.releaseAt, lang)
    : null

  const statCards = [
    {
      slug: "debut-days",
      key: "debut",
      icon: CalendarDays,
      label: t("stats.debutDays"),
      value: debutDays,
      source: snapshot.sources.debut,
    },
    {
      slug: "album-projects",
      key: "albums",
      icon: Disc3,
      label: t("stats.albums"),
      value: snapshot.albumCount,
      source: snapshot.sources.albums,
    },
    {
      slug: "music-show-wins",
      key: "music-shows",
      icon: Radio,
      label: t("stats.musicShows"),
      value: snapshot.musicShowWins,
      source: snapshot.sources.musicShows,
      note: snapshot.musicShowSourceNote,
    },
    {
      slug: "award-ceremony-wins",
      key: "award-ceremonies",
      icon: Trophy,
      label: t("stats.awardCeremonies"),
      value: snapshot.awardCeremonyWins,
      source: snapshot.sources.awardCeremonies,
      note: snapshot.awardCeremonySourceNote,
    },
  ]
  const countdownItems = [
    {
      key: "days",
      value: countdown?.days ?? 0,
      label: t("stats.comeback.days"),
    },
    {
      key: "hours",
      value: countdown?.hours ?? 0,
      label: t("stats.comeback.hours"),
    },
    {
      key: "minutes",
      value: countdown?.minutes ?? 0,
      label: t("stats.comeback.minutes"),
    },
    {
      key: "seconds",
      value: countdown?.seconds ?? 0,
      label: t("stats.comeback.seconds"),
    },
  ]
  const latestReleaseCardContent = (
    <>
      <p className="text-[11px] uppercase tracking-[0.2em] text-primary/80">{t("stats.latestRelease")}</p>
      <div className="mt-2 flex items-center gap-2">
        <p className="text-lg text-foreground">{snapshot.latestRelease.title}</p>
        {snapshot.latestRelease.mvUrl ? (
          <span className="inline-flex items-center justify-center rounded-full border border-primary/20 bg-background/90 p-1 text-primary opacity-70 transition duration-300 group-hover:opacity-100">
            <ExternalLink className="size-3.5 stroke-[2.2]" />
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-sm text-foreground/60">{formattedLatestReleaseDate ?? snapshot.latestRelease.date}</p>
      <p className="mt-2 text-xs text-foreground/50">{snapshot.latestRelease.sourceLabel}</p>
      {snapshot.latestRelease.mvUrl ? null : (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-dashed border-primary/30 bg-background/65 px-4 py-2 text-xs uppercase tracking-[0.2em] text-foreground/50">
          <PlayCircle className="size-4" />
          {t("stats.latestRelease.mvPending")}
        </div>
      )}
      <p className="mt-2 text-xs text-foreground/50">{t("stats.comeback.placeholderDesc")}</p>
    </>
  )

  return (
    <section ref={sectionRef} className="reveal-up delay-4 mt-12">
      <div className="overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-background/90 via-secondary/70 to-background/90 shadow-[0_28px_80px_hsla(var(--primary),0.12)]">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="border-b border-primary/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3 text-primary">
              <Sparkles className="size-4" />
              <p className="text-xs uppercase tracking-[0.42em]">{t("stats.eyebrow")}</p>
            </div>

            <h2 className="mt-4 text-3xl uppercase leading-none text-foreground sm:text-4xl">
              {t("stats.title")}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-foreground/70">{t("stats.desc")}</p>

            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => {
                const Icon = card.icon

                return (
                  <Link
                    key={card.key}
                    href={`/stats/${card.slug}`}
                    className="group rounded-[1.5rem] border border-primary/15 bg-background/50 p-4 shadow-[0_14px_34px_hsla(var(--primary),0.08)] transition hover:-translate-y-1 hover:border-primary/40 hover:bg-background/80"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full border border-primary/10 bg-primary/5 p-2 text-primary">
                        <Icon className="size-4" />
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.18em] text-primary/70">
                        {t("stats.viewDetails")}
                      </span>
                    </div>
 
                    <p className="mt-5 text-[11px] uppercase tracking-[0.22em] text-foreground/50">{card.label}</p>
                    <p className="mt-3 text-4xl font-light tracking-tight text-foreground sm:text-[3.1rem]">
                      <AnimatedNumber value={card.value} active={isVisible} />
                    </p>
                    <p className="mt-3 text-xs text-foreground/40">{card.source.label}</p>
                    {"note" in card && card.note ? <p className="mt-2 text-xs leading-5 text-foreground/40">{card.note}</p> : null}
                  </Link>
                )
              })}
            </div>
          </div>

          <aside className="p-6 sm:p-8">
            <div className="flex items-center gap-3 text-primary">
              <Clock3 className="size-4" />
              <p className="text-xs uppercase tracking-[0.42em]">{t("stats.comeback.eyebrow")}</p>
            </div>

            <h3 className="mt-4 text-3xl uppercase leading-none text-foreground sm:text-4xl">
              {t("stats.comeback.templateTitle")}
            </h3>
            <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-primary/80">
              {snapshot.upcomingComeback?.title ?? t("stats.comeback.templateLabel")}
            </p>
            <p className="mt-4 text-sm leading-7 text-foreground/70">
              {snapshot.upcomingComeback?.note ?? t("stats.comeback.pendingDesc")}
            </p>

            <div className="mt-6 rounded-[1.7rem] border border-primary/20 bg-gradient-to-b from-background/90 to-secondary/80 p-4 shadow-[0_18px_44px_hsla(var(--primary),0.12)]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/50">
                  {t("stats.comeback.templateDisplay")}
                </p>
                <span
                  className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${
                    snapshot.upcomingComeback
                      ? "bg-primary text-white"
                      : "border border-dashed border-primary/30 bg-background/50 text-foreground/50"
                  }`}
                >
                  {snapshot.upcomingComeback ? t("stats.comeback.ready") : t("stats.comeback.placeholder")}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {countdownItems.map((item) => (
                  <div
                    key={item.key}
                    className={`rounded-[1.3rem] px-3 py-4 text-center ${
                      snapshot.upcomingComeback
                        ? "border border-primary/20 bg-background/80 shadow-[0_14px_34px_hsla(var(--primary),0.08)]"
                        : "border border-dashed border-primary/30 bg-background/50"
                    }`}
                  >
                    <p className="text-3xl font-light text-foreground">
                      {item.value.toLocaleString(undefined, { minimumIntegerDigits: 2 })}
                    </p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-foreground/50">{item.label}</p>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-center text-sm tracking-[0.28em] text-foreground/30">
                {countdownItems
                  .map((item) => item.value.toLocaleString(undefined, { minimumIntegerDigits: 2 }))
                  .join(" : ")}
              </p>
            </div>

            <div className="mt-6 rounded-[1.4rem] border border-primary/15 bg-background/50 p-4">
              {snapshot.upcomingComeback ? (
                <>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-primary/80">
                    {t("stats.comeback.date")}
                  </p>
                  <p className="mt-2 text-sm text-foreground/70">{formattedComebackDate ?? snapshot.upcomingComeback.releaseAt}</p>
                  <p className="mt-2 text-xs text-foreground/40">{t("stats.comeback.realtime")}</p>
                  <a
                    href={snapshot.upcomingComeback.source.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex text-xs text-sky-700 underline underline-offset-4"
                  >
                    {snapshot.upcomingComeback.source.label}
                  </a>
                </>
              ) : (
                <>
                  {snapshot.latestRelease.mvUrl ? (
                    <a
                      href={snapshot.latestRelease.mvUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group block rounded-[1.15rem] transition hover:-translate-y-0.5"
                      aria-label={`${snapshot.latestRelease.title} MV`}
                    >
                      {latestReleaseCardContent}
                    </a>
                  ) : (
                    <div className="rounded-[1.15rem]">{latestReleaseCardContent}</div>
                  )}
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
