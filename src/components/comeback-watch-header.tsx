"use client"

import { useEffect, useState } from "react"
import { Bell, Music, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/useTranslation"
import type { HomeStatsSnapshot } from "@/lib/home-stats"
import type { TimeZone } from "@/components/navbar"

type CountdownParts = {
  days: number
  hours: number
  minutes: number
  seconds: number
  isLive: boolean
}

const TZ_OFFSETS: Record<string, number> = {
  KST: 9,
  EDT: -4,
  UTC: 0,
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

function formatCountdownParts(target: string): CountdownParts | null {
  const parsed = parseIsoDate(target)
  if (!parsed) return null

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

function pad2(value: number) {
  return Math.max(0, value).toString().padStart(2, "0")
}

export function ComebackWatchHeader({
  snapshot,
  timeZone = "KST"
}: {
  snapshot: HomeStatsSnapshot,
  timeZone?: TimeZone
}) {
  const { t, lang } = useTranslation()
  const [countdown, setCountdown] = useState<CountdownParts | null>(null)

  useEffect(() => {
    if (!snapshot.upcomingComeback) {
      setCountdown(null)
      return
    }

    const update = () => {
      setCountdown(formatCountdownParts(snapshot.upcomingComeback?.releaseAt ?? ""))
    }

    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [snapshot.upcomingComeback])

  const hasComeback = !!snapshot.upcomingComeback
  const albumTitle = snapshot.upcomingComeback?.title || t("stats.comeback.templateTitle")
  const releaseAt = snapshot.upcomingComeback?.releaseAt ?? ""

  const formattedDate = snapshot.upcomingComeback
    ? (() => {
      const parsed = parseIsoDate(releaseAt)
      if (!parsed) return releaseAt

      let displayDate = parsed
      if (timeZone !== "LOCAL") {
        const utc = parsed.getTime()
        displayDate = new Date(utc)
      }

      const locale = lang === "vi" ? "vi-VN" : "en-GB"

      const options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: timeZone === "LOCAL" ? undefined : timeZone === "EDT" ? "America/New_York" : timeZone === "KST" ? "Asia/Seoul" : "UTC"
      }

      return new Intl.DateTimeFormat(locale, options).format(displayDate).toUpperCase() + ` ${timeZone}`
    })()
    : null

  const countdownItems = [
    { label: t("stats.comeback.days"), value: countdown?.days ?? 0 },
    { label: t("stats.comeback.hours"), value: countdown?.hours ?? 0 },
    { label: t("stats.comeback.minutes"), value: countdown?.minutes ?? 0 },
    { label: t("stats.comeback.seconds"), value: countdown?.seconds ?? 0 },
  ]

  return (
    <div className="reveal-up relative mx-auto w-full max-w-4xl">
      {/* Card wrapper: Tăng độ đặc của nền và độ nhòe để tách biệt với logo phía sau */}
      <div className="card-premium relative bg-white/60 backdrop-blur-2xl px-6 py-12 sm:px-12 sm:py-20 shadow-2xl shadow-pink-100/40">
        <div className="relative flex flex-col items-center text-center">
          {/* Status Badge */}
          <div className="mb-8 flex items-center gap-2 rounded-full border border-white/80 bg-white/60 px-6 py-2.5 shadow-sm backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className={cn(
                "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                hasComeback ? "bg-[#FF708A]" : "bg-slate-400"
              )} />
              <span className={cn(
                "relative inline-flex h-2 w-2 rounded-full",
                hasComeback ? "bg-[#FF708A]" : "bg-slate-400"
              )} />
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E05670]">
              {hasComeback ? t("home.comeback.active") : t("home.comeback.standby")}
            </span>
          </div>

          {/* Album Subtitle */}
          <p className="text-[12px] font-black tracking-[0.3em] text-sky-500 uppercase drop-shadow-sm mb-4">
            {hasComeback ? `#${(albumTitle as string).replace(/\s+/g, '')}` : t("home.comeback.preparing")}
          </p>

          {/* Main Date Display */}
          <h2
            className={cn(
              "text-title text-4xl leading-none sm:text-6xl lg:text-7xl xl:text-8xl uppercase",
              !hasComeback && "italic text-slate-800/80"
            )}
          >
            {hasComeback ? formattedDate : t("voting.comingSoon")}
          </h2>

          {/* Countdown Area */}
          <div className="mt-12 flex items-center justify-center gap-3 sm:gap-8">
            {countdownItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3 sm:gap-8">
                <div className="flex flex-col items-center">
                  <span className="text-title font-mono text-5xl tracking-tighter sm:text-7xl lg:text-8xl text-slate-900">
                    {pad2(item.value)}
                  </span>
                  <span className="mt-2 text-[9px] font-black tracking-[0.4em] text-sky-500 uppercase">
                    {item.label}
                  </span>
                </div>

                {index < 3 && (
                  <span className="mb-8 text-3xl font-black text-[#FFC2D1] sm:text-5xl lg:text-6xl">:</span>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons - Only show when there's a comeback */}
          {hasComeback && (
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
              <button className="group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#FF99AC] to-[#FF708A] px-12 py-5 text-[11px] font-black uppercase tracking-[0.3em] text-white shadow-xl shadow-pink-200/50 transition-all hover:scale-105 hover:shadow-2xl">
                <ShoppingCart className="size-4" />
                <span>{t("home.comeback.preOrder")}</span>
              </button>
              <button className="group flex items-center gap-3 rounded-2xl border-2 border-sky-100 bg-white/40 px-12 py-5 text-[11px] font-black uppercase tracking-[0.3em] text-sky-600 backdrop-blur-md transition-all hover:bg-white hover:scale-105">
                <Music className="size-4" />
                {t("home.comeback.preSave")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

  )
}
