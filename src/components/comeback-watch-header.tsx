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

// Fixed offset mapping relative to UTC
const TZ_OFFSETS: Record<string, number> = {
  KST: 9,
  EDT: -4,
  UTC: 0,
}

function parseIsoDate(date: string) {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    const [day, month, year] = date.split("/")
    // Default assumption is KST (UTC+9) for the source data
    return new Date(`${year}-${month}-${day}T00:00:00+09:00`)
  }

  // If already ISO, assume it has an offset or use KST as fallback
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
        
        // Calculate offset for non-LOCAL zones
        let displayDate = parsed
        if (timeZone !== "LOCAL") {
          const offset = TZ_OFFSETS[timeZone] ?? 0
          // Convert target to UTC first, then apply selected offset
          const utc = parsed.getTime() // This is already absolute UTC timestamp
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
    { label: "DAYS", value: countdown?.days ?? 0 },
    { label: "HOURS", value: countdown?.hours ?? 0 },
    { label: "MINS", value: countdown?.minutes ?? 0 },
    { label: "SECS", value: countdown?.seconds ?? 0 },
  ]

  return (
    <div className="reveal-up relative mx-auto w-full max-w-4xl px-4">
      <div className="relative flex flex-col items-center text-center">
        {/* Status Badge */}
        <div className="mb-6 flex items-center gap-2 rounded-full border border-white/60 bg-white/40 px-5 py-2 shadow-sm backdrop-blur-md">
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
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E05670]">
            {hasComeback ? "Active Comeback Preparation" : "Standby Mode"}
          </span>
        </div>

        {/* Album Subtitle */}
        <p className="text-[11px] font-black tracking-[0.25em] text-[#4A90E2] uppercase drop-shadow-sm">
          {hasComeback ? `#${albumTitle.replace(/\s+/g, '')}` : "Preparing for next era"}
        </p>

        {/* Main Date Display */}
        <h2
          className={cn(
            "mt-3 text-4xl font-black leading-none tracking-tighter text-slate-900 sm:text-6xl lg:text-7xl xl:text-8xl uppercase text-gradient drop-shadow-[0_2px_10px_rgba(255,255,255,0.8)]",
            !hasComeback && "opacity-40 italic"
          )}
        >
          {hasComeback ? formattedDate : "Coming Soon"}
        </h2>

        {/* Countdown Area */}
        <div className="mt-12 flex items-center justify-center gap-4 sm:gap-10">
          {countdownItems.map((item, index) => (
            <div key={item.label} className="flex items-center gap-4 sm:gap-10">
              <div className="flex flex-col items-center">
                <span className="font-mono text-5xl font-black tracking-tighter text-slate-900 sm:text-7xl lg:text-9xl">
                  {pad2(item.value)}
                </span>
                <span className="mt-3 text-[10px] font-black tracking-[0.4em] text-[#4A90E2] uppercase">
                  {item.label}
                </span>
              </div>
              
              {index < 3 && (
                <span className="mb-10 text-4xl font-black text-[#FFC2D1] sm:text-6xl">:</span>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-5">
          {hasComeback ? (
            <>
              <button className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-[#FF99AC] to-[#FF708A] px-10 py-5 text-[11px] font-black uppercase tracking-[0.3em] text-white shadow-lg shadow-pink-200/50 transition-all hover:scale-105 hover:shadow-xl">
                <ShoppingCart className="size-4 relative z-10" />
                <span className="relative z-10">Pre-order</span>
              </button>
              <button className="group flex items-center gap-3 rounded-full border-2 border-[#A2D2FF] bg-white/40 px-10 py-5 text-[11px] font-black uppercase tracking-[0.3em] text-[#4A90E2] backdrop-blur-md transition-all hover:bg-white hover:scale-105">
                <Music className="size-4" />
                Pre-save
              </button>
            </>
          ) : (
            <button className="group flex items-center gap-3 rounded-full border border-slate-200 bg-white/40 px-10 py-5 text-[11px] font-black uppercase tracking-[0.3em] text-slate-600 shadow-sm backdrop-blur-md transition-all hover:bg-white">
              <Bell className="size-4" />
              Notify me
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
