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
      <p className="text-[11px] uppercase tracking-[0.2em] text-sky-700/80">{t("stats.latestRelease")}</p>
      <div className="mt-2 flex items-center gap-2">
        <p className="text-lg text-slate-900">{snapshot.latestRelease.title}</p>
        {snapshot.latestRelease.mvUrl ? (
          <span className="inline-flex items-center justify-center rounded-full border border-sky-200 bg-white/90 p-1 text-sky-700 opacity-70 transition duration-300 group-hover:opacity-100">
            <ExternalLink className="size-3.5 stroke-[2.2]" />
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-sm text-slate-500">{formattedLatestReleaseDate ?? snapshot.latestRelease.date}</p>
      <p className="mt-2 text-xs text-slate-500">{snapshot.latestRelease.sourceLabel}</p>
      {snapshot.latestRelease.mvUrl ? null : (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-dashed border-sky-200 bg-white/65 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-500">
          <PlayCircle className="size-4" />
          {t("stats.latestRelease.mvPending")}
        </div>
      )}
      <p className="mt-2 text-xs text-slate-500">{t("stats.comeback.placeholderDesc")}</p>
    </>
  )

  return (
    <section ref={sectionRef} className="section-shell reveal-up delay-4">
      <div className="rounded-[2rem] border border-white/80 bg-white/75 px-6 py-7 shadow-[0_24px_70px_rgba(86,142,190,0.16)]">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.8rem] border border-white/85 bg-white/80 p-7 shadow-[0_18px_50px_rgba(94,140,182,0.12)]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-sky-700">
                <Clock3 className="size-4" />
                <p className="text-xs uppercase tracking-[0.42em]">{t("stats.comeback.eyebrow")}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${
                  snapshot.upcomingComeback
                    ? "bg-sky-100 text-sky-700"
                    : "border border-dashed border-sky-200 bg-white/70 text-slate-500"
                }`}
              >
                {snapshot.upcomingComeback ? t("stats.comeback.ready") : t("stats.comeback.placeholder")}
              </span>
            </div>

            <h3 className="mt-5 text-3xl uppercase leading-none text-slate-950 sm:text-4xl">
              {t("stats.comeback.templateTitle")}
            </h3>
            <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-slate-400">
              {snapshot.upcomingComeback?.title ?? t("stats.comeback.templateLabel")}
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              {snapshot.upcomingComeback?.note ?? t("stats.comeback.pendingDesc")}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">
              {countdownItems.map((item) => (
                <div
                  key={item.key}
                  className="rounded-[1.4rem] border border-slate-200/80 bg-white p-4 text-center"
                >
                  <p className="text-4xl font-light text-slate-950">
                    {item.value.toLocaleString(undefined, { minimumIntegerDigits: 2 })}
                  </p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[1.4rem] border border-slate-200/80 bg-white/80 p-5">
              {snapshot.upcomingComeback ? (
                <>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    {t("stats.comeback.date")}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">{formattedComebackDate ?? snapshot.upcomingComeback.releaseAt}</p>
                  <p className="mt-2 text-xs text-slate-500">{t("stats.comeback.realtime")}</p>
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
          </div>

          <aside className="rounded-[1.6rem] border border-white/80 bg-white/70 p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-sky-700">
                <Sparkles className="size-4" />
                <p className="text-xs uppercase tracking-[0.42em]">{t("stats.eyebrow")}</p>
              </div>
              <span className="text-[9px] uppercase tracking-[0.3em] text-slate-400">
                {t("stats.viewDetails")}
              </span>
            </div>

            <h2 className="mt-4 text-2xl uppercase leading-none text-slate-950">
              {t("stats.title")}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 clamp-3">{t("stats.desc")}</p>

            <div className="mt-6 grid gap-4">
              {statCards.map((card) => {
                const Icon = card.icon

                return (
                  <Link
                    key={card.key}
                    href={`/stats/${card.slug}`}
                    className="group flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3 transition hover:-translate-y-0.5 hover:border-sky-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded-full border border-slate-200/80 bg-white p-2 text-sky-600">
                        <Icon className="size-4" />
                      </span>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500 clamp-1">
                          {card.label}
                        </p>
                        <p className="mt-1 text-xl font-light text-slate-900">
                          <AnimatedNumber value={card.value} active={isVisible} />
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] uppercase tracking-[0.3em] text-slate-400">
                      {t("stats.viewDetails")}
                    </span>
                  </Link>
                )
              })}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
