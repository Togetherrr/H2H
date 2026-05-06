"use client"

import { useEffect, useState } from "react"
import { Music, ShoppingCart } from "lucide-react"
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
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true }
  const totalSeconds = Math.floor(diff / 1000)
  return {
    days: Math.floor(totalSeconds / (60 * 60 * 24)),
    hours: Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60)),
    minutes: Math.floor((totalSeconds % (60 * 60)) / 60),
    seconds: totalSeconds % 60,
    isLive: false,
  }
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
  const { t } = useTranslation()
  const [countdown, setCountdown] = useState<CountdownParts | null>(null)

  useEffect(() => {
    if (!snapshot.upcomingComeback) { setCountdown(null); return }
    const update = () => setCountdown(formatCountdownParts(snapshot.upcomingComeback?.releaseAt ?? ""))
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
        const options: Intl.DateTimeFormatOptions = {
          month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
          timeZone: timeZone === "LOCAL" ? undefined : timeZone === "EDT" ? "America/New_York" : timeZone === "KST" ? "Asia/Seoul" : "UTC"
        }
        return new Intl.DateTimeFormat("en-GB", options).format(parsed).toUpperCase() + ` ${timeZone}`
      })()
    : null

  const countdownItems = [
    { label: t("stats.comeback.days"), value: countdown?.days ?? 0 },
    { label: t("stats.comeback.hours"), value: countdown?.hours ?? 0 },
    { label: t("stats.comeback.minutes"), value: countdown?.minutes ?? 0 },
    { label: t("stats.comeback.seconds"), value: countdown?.seconds ?? 0 },
  ]

  return (
    /* Hero: just provides vertical spacing + centering — body::before handles the global overlay */
    <section className="relative min-h-[75vh] flex flex-col justify-center items-center pt-32 pb-12 px-6">
      <div className="w-full max-w-6xl flex flex-col items-center text-center">

        {/* Status Badge */}
        <div className="mb-10 flex items-center gap-2 rounded-full border border-white/60 bg-white/40 px-6 py-2.5 shadow-xl backdrop-blur-md">
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
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black">
            {hasComeback ? t("home.comeback.active") : t("home.comeback.standby")}
          </span>
        </div>

        {/* Album Subtitle */}
        <p className="text-[14px] font-black tracking-[0.4em] text-[#FF708A] uppercase mb-6 drop-shadow-sm">
          {hasComeback ? `#${(albumTitle as string).replace(/\s+/g, '')}` : t("home.comeback.preparing")}
        </p>

        {/* Main Date Display */}
        <h2 className={cn(
          "font-black tracking-tighter text-5xl leading-none sm:text-7xl lg:text-8xl xl:text-9xl uppercase text-black drop-shadow-[0_10px_25px_rgba(255,255,255,0.4)]",
          !hasComeback && "italic text-black/30"
        )}>
          {hasComeback ? formattedDate : t("voting.comingSoon")}
        </h2>

        {/* Countdown - Individual Floating Cards */}
        <div className="mt-16 grid grid-cols-2 md:flex items-center justify-center gap-4 sm:gap-6">
          {countdownItems.map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="flex size-24 sm:size-32 lg:size-40 flex-col items-center justify-center rounded-[2rem] bg-gradient-to-br from-[#FFF0F5] to-[#FFD1DC] border border-white shadow-2xl shadow-pink-500/5">
                <span className="font-mono font-black text-4xl sm:text-5xl lg:text-7xl tracking-tighter text-black">
                  {pad2(item.value)}
                </span>
                <span className="mt-1 text-[9px] font-black tracking-[0.3em] text-[#FF708A] uppercase">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        {hasComeback && (
          <div className="mt-16 flex flex-wrap items-center justify-center gap-6">
            <button className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#FF99AC] to-[#FF708A] px-12 py-5 text-[11px] font-black uppercase tracking-[0.3em] text-white shadow-xl shadow-pink-500/25 transition-all hover:scale-105 hover:shadow-2xl">
              <ShoppingCart className="size-4" />
              <span>{t("home.comeback.preOrder")}</span>
            </button>
            <button className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md px-12 py-5 text-[11px] font-black uppercase tracking-[0.3em] text-white transition-all hover:bg-white/25 hover:scale-105">
              <Music className="size-4" />
              {t("home.comeback.preSave")}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
