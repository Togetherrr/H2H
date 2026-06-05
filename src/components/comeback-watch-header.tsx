"use client"

import { useEffect, useState } from "react"
import { Link2, Music, Play, ShoppingCart, Youtube } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/useTranslation"
import type { HomeStatsSnapshot } from "@/lib/home-stats"
import { useTimeZoneStore } from "@/lib/timezone-store"
import { timeZoneToIana } from "@/lib/timezone"

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

function safeUrl(value: string | null | undefined) {
  const trimmed = value?.trim()
  if (!trimmed) return null
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed
  return null
}

function formatReleaseWindow(date: Date, timeZone: string | undefined, suffix: string) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone,
  })

  return `${formatter.format(date).replace(/\b(am|pm)\b/i, (m) => m.toUpperCase())} ${suffix}`
}

export function ComebackWatchHeader({
  snapshot
}: {
  snapshot: HomeStatsSnapshot
}) {
  const { t } = useTranslation()
  const timeZone = useTimeZoneStore((s) => s.timeZone)
  const [countdown, setCountdown] = useState<CountdownParts | null>(null)

  useEffect(() => {
    if (!snapshot.upcomingComeback) { setCountdown(null); return }
    const update = () => setCountdown(formatCountdownParts(snapshot.upcomingComeback?.releaseAt ?? ""))
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [snapshot.upcomingComeback])

  const hasComeback = !!snapshot.upcomingComeback
  const configuredTitle = (snapshot.upcomingComeback?.title ?? "").trim()
  const releaseAt = snapshot.upcomingComeback?.releaseAt ?? ""
  const hasConfiguredComeback = hasComeback && configuredTitle.length > 0 && releaseAt.trim().length > 0
  const albumTitle = configuredTitle || t("stats.comeback.templateTitle")
  const shoppingUrl = safeUrl(snapshot.upcomingComeback?.shoppingUrl ?? null)
  const streamUrl = safeUrl(snapshot.upcomingComeback?.streamUrl ?? null) ?? safeUrl(snapshot.latestRelease?.mvUrl ?? null)
  const sourceUrl = safeUrl(snapshot.upcomingComeback?.source?.href ?? null)

  const formattedDate = snapshot.upcomingComeback
    ? (() => {
      const parsed = parseIsoDate(releaseAt)
      if (!parsed) return releaseAt
      return formatReleaseWindow(parsed, timeZoneToIana(timeZone), timeZone)
    })()
    : null

  const countdownItems = [
    { label: t("stats.comeback.days"), value: countdown?.days ?? 0 },
    { label: t("stats.comeback.hours"), value: countdown?.hours ?? 0 },
    { label: t("stats.comeback.minutes"), value: countdown?.minutes ?? 0 },
    { label: t("stats.comeback.seconds"), value: countdown?.seconds ?? 0 },
  ]

  return (
    <section className="relative flex flex-col justify-center items-center pt-28 pb-8 px-4 sm:px-6">
      <div className="w-full max-w-[80rem] mx-auto">
        <div className="relative isolate overflow-hidden rounded-[2rem] border border-slate-200 shadow-[0_20px_60px_rgba(2,6,23,0.12)] group transition-all duration-700">

          {/* Ảnh nền gốc sắc nét 100%, ĐÃ BỎ hiệu ứng chói sáng trắng */}
          <div
            className="absolute inset-0 bg-cover bg-center pointer-events-none"
            style={{ backgroundImage: "var(--bg-album-art, var(--background-image, none))" }}
          />

          {/* Noise texture giữ lại một chút để trông mộc mạc (cinematic) */}
          <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] xl:grid-cols-[1.5fr_1fr] gap-8 lg:gap-12 p-8 sm:p-10 md:p-12 items-center">

            {/* Phần trái: thông tin */}
            <div className="flex flex-col items-start justify-center space-y-7">
              {/* Status badge */}
              <div className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 shadow-sm">
                {hasConfiguredComeback ? (
                  <div className="flex items-end gap-[2px] h-2.5">
                    <span className="w-1 bg-[#FF708A] rounded-full animate-[bounce_1s_infinite] h-full" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 bg-[#FF708A] rounded-full animate-[bounce_1s_infinite] h-[60%]" style={{ animationDelay: '200ms' }} />
                    <span className="w-1 bg-[#FF708A] rounded-full animate-[bounce_1s_infinite] h-[80%]" style={{ animationDelay: '400ms' }} />
                    <span className="w-1 bg-[#FF708A] rounded-full animate-[bounce_1s_infinite] h-[40%]" style={{ animationDelay: '600ms' }} />
                  </div>
                ) : (
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-slate-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-slate-400" />
                  </span>
                )}
                <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-slate-800">
                  {hasConfiguredComeback ? "ACTIVE COMEBACK" : "STANDBY MODE"}
                </span>
              </div>

              {/* Nội dung text */}
              <div className="space-y-4">
                <div className="inline-flex max-w-full rounded-full border border-slate-200 bg-white/95 px-5 py-2 shadow-sm backdrop-blur-sm">
                  <p
                    className={cn(
                      "text-sm sm:text-base font-black tracking-[0.15em] uppercase bg-clip-text text-transparent bg-gradient-to-r whitespace-normal sm:whitespace-nowrap",
                      hasConfiguredComeback ? "from-rose-600 via-pink-500 to-rose-400" : "from-slate-600 to-slate-400"
                    )}
                  >
                    {hasConfiguredComeback ? albumTitle : t("home.comeback.preparing")}
                  </p>
                </div>
                <h2 className={cn(
                  "font-black tracking-tight text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.1] uppercase drop-shadow-sm",
                  hasComeback
                    ? "text-slate-900 drop-shadow-[0_2px_12px_rgba(255,255,255,1)]"
                    : "italic text-slate-500"
                )}>
                  {hasComeback ? formattedDate : t("voting.comingSoon")}
                </h2>
              </div>

              {/* Nút bấm hành động */}
              {hasComeback && (
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {shoppingUrl ? (
                    <a
                      href={shoppingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative flex max-w-full min-w-0 items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white shadow-lg transition-all hover:-translate-y-0.5 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                      <ShoppingCart className="size-4 relative z-10" />
                      <span className="relative z-10 whitespace-normal text-left leading-tight">{t("home.comeback.preOrder")}</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="flex max-w-full min-w-0 items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white shadow-md opacity-50 cursor-not-allowed"
                    >
                      <ShoppingCart className="size-4" />
                      <span className="whitespace-normal text-left leading-tight">{t("home.comeback.preOrder")}</span>
                    </button>
                  )}

                  {sourceUrl ? (
                    <a
                      href={sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex max-w-full min-w-0 items-center gap-2 rounded-full border border-slate-300 bg-white/90 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-900 shadow-sm transition-all hover:bg-white hover:-translate-y-0.5"
                    >
                      <Link2 className="size-4" />
                      <span className="whitespace-normal text-left leading-tight">{t("home.comeback.preSave")}</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="flex max-w-full min-w-0 items-center gap-2 rounded-full border border-slate-300 bg-white/90 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-900 shadow-sm opacity-50 cursor-not-allowed"
                    >
                      <Music className="size-4" />
                      <span className="whitespace-normal text-left leading-tight">{t("home.comeback.preSave")}</span>
                    </button>
                  )}

                  {countdown?.isLive && streamUrl && (
                    <a
                      href={streamUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex max-w-full min-w-0 items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-rose-600 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white shadow-lg transition-all hover:scale-105"
                    >
                      <Youtube className="size-4" />
                      <span className="whitespace-normal text-left leading-tight">Stream</span>
                      <Play className="size-4 fill-white" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Phần phải: đếm ngược được làm đặc lại */}
            <div className="flex items-center justify-center w-full mt-6 lg:mt-0">
              <div className="relative w-full max-w-md overflow-hidden rounded-[24px] border border-white bg-white/95 p-6 shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-transform duration-500 hover:-translate-y-1 sm:p-8 backdrop-blur-md">

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                    <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500 text-center">
                      Time Remaining
                    </p>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                  </div>

                  <div className="flex justify-between items-center gap-2 sm:gap-4">
                    {countdownItems.map((item, index) => (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div className="relative mb-3 flex w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white py-3 shadow-sm transition-all duration-300 group/digit hover:-translate-y-1 hover:border-sky-300 hover:shadow-md sm:py-4">
                          <span className="relative z-10 font-mono text-2xl font-black tracking-tighter text-slate-800 transition-colors group-hover/digit:text-sky-500 sm:text-3xl lg:text-4xl">
                            {pad2(item.value)}
                          </span>
                        </div>
                        <span className="text-center text-[9px] font-black uppercase tracking-[0.15em] text-[#FF708A] sm:text-[10px]">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}