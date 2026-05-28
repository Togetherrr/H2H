"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import Image from "next/image"
import {
  CalendarDays,
  Radio,
  Trophy,
  ArrowUpRight,
  Sparkles,
  Heart,
  Play,
  X,
  Film,
} from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"
import { cn } from "@/lib/utils"
import type { HomeStatsSnapshot } from "@/lib/home-stats"
import type { FilmFrame } from "@/lib/release-catalog"
import { useTimeZoneStore } from "@/lib/timezone-store"
import { timeZoneToIana } from "@/lib/timezone"
import type { TimeZone } from "@/components/navbar"

type HomeStatsSnapshotData = HomeStatsSnapshot

type StatCard = {
  slug: string
  key: string
  icon: any
  value: number
  badge: string
  className: string
  iconBg: string
  iconColor: string
  textColor: string
  debutDate?: string
  hasFilmStrip?: boolean
  hasHearts?: boolean
  hasVideoModal?: boolean
  label?: string
  countUpValue?: number
  sparkleColor?: "sky" | "violet"
  desc?: string
}

const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@hearts2hearts.official"
const YOUTUBE_RANDOM_API = "/api/youtube/random"

type RandomVideo = {
  videoId: string
  title: string
  url: string
  thumbnail?: string | null
}

type VideoStatus = "idle" | "loading" | "ready" | "error"

type RandomVideoError = {
  error?: string
  message?: string
}

type HomeStatsSectionProps = {
  snapshot: HomeStatsSnapshotData
  filmStripFrames?: FilmFrame[]
}

// ─── Date utils ──────────────────────────────────────────────────────────────

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
  const diff = new Date().getTime() - parsed.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

// ─── FlipDigit (GIỮ NGUYÊN STYLE CŨ, CHỈ CHỈNH SIZE LG GỌN LẠI) ────────────────

type FlipDigitProps = { value: string; size?: "sm" | "lg" }

function FlipDigit({ value, size = "sm" }: FlipDigitProps) {
  const [current, setCurrent] = useState(value)
  const [isFlipping, setIsFlipping] = useState(false)

  useEffect(() => {
    if (value !== current) {
      setIsFlipping(true)
      const timer = setTimeout(() => {
        setCurrent(value)
        setIsFlipping(false)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [value, current])

  return (
    <div className={cn(
      "relative rounded-lg md:rounded-2xl overflow-hidden shadow-[0_18px_40px_rgba(15,23,42,0.14)] border border-black/10 transition-all duration-300 bg-[#FFF9F0]",
      // Gom nhẹ kích thước size lg lại một chút để không chiếm quá nhiều chỗ
      size === "lg" ? "w-16 h-22 md:w-28 md:h-34" : "w-9 h-12 md:w-12 md:h-16"
    )}>
      <div className="absolute inset-0 flex flex-col">
        <div className="flex-1 bg-gradient-to-b from-white to-[#FFF9F0] border-b border-black/8" />
        <div className="flex-1 bg-gradient-to-b from-[#FFF9F0] to-[#F5E6D3]" />
      </div>
      <div className={cn(
        "relative z-10 flex items-center justify-center h-full transition-all duration-500 px-3",
        isFlipping ? "opacity-0 scale-95" : "opacity-100 scale-100"
      )}>
        <span className={cn(
          "font-black tabular-nums tracking-tight text-slate-900 drop-shadow-[0_1px_0_rgba(255,255,255,0.5)] transition-all leading-none whitespace-nowrap",
        size === "lg" ? "text-[2.6rem] md:text-[3.6rem]" : "text-2xl md:text-4xl"
        )}>{current}</span>
      </div>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/40 to-transparent" />
      <div className="absolute top-1/2 left-0 right-0 h-[1px] z-20 bg-black/8" />
    </div>
  )
}

function FlipNumber({ value, size = "sm" }: { value: number; size?: "sm" | "lg" }) {
  return <FlipDigit value={value.toLocaleString("en-US")} size={size} />
}

// ─── Các component phụ trợ (FilmStrip, Ticker...) ─────────────────────────────

function FilmStrip({ frames = [] }: { frames?: FilmFrame[] }) {
  const images = frames.length > 0 ? (frames.length >= 8 ? frames.slice(0, 8) : Array.from({ length: 8 }, (_, i) => frames[i % frames.length])) : []
  if (images.length === 0) return null
  const marqueeFrames = [...images, ...images]

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-14 group-hover:opacity-30 transition-opacity duration-1000 z-0">
      <div className="flex h-full w-max flex-nowrap animate-marquee items-center gap-10 py-6 px-16">
        {marqueeFrames.map((frame, idx) => (
          <div key={idx} className="relative w-[214px] h-[284px] md:w-[256px] md:h-[340px] flex-shrink-0 overflow-hidden rounded-xl border-[6px] border-white/40 bg-slate-900 shadow-xl rotate-1 group-hover:rotate-0 transition-transform duration-500">
            <Image src={frame.src} alt={frame.alt} fill className="object-contain bg-slate-950 p-3.5 contrast-105" />
          </div>
        ))}
      </div>
    </div>
  )
}

const DEBUT_MV_TIMESTAMP = new Date("2025-02-24T18:00:00+09:00").getTime()
const DEBUT_MV_DATE = new Date("2025-02-24T18:00:00+09:00")

function getDebutDisplayInfo(timeZone: TimeZone) {
  const iana = timeZoneToIana(timeZone) ?? Intl.DateTimeFormat().resolvedOptions().timeZone
  const dateParts = new Intl.DateTimeFormat("en-US", {
    year: "numeric", month: "2-digit", day: "2-digit", timeZone: iana,
  }).formatToParts(DEBUT_MV_DATE)
  const y = dateParts.find(p => p.type === "year")?.value ?? "2025"
  const m = dateParts.find(p => p.type === "month")?.value ?? "02"
  const d = dateParts.find(p => p.type === "day")?.value ?? "24"
  const dateFormatted = `${y}.${m}.${d}`
  const timeFormatted = new Intl.DateTimeFormat("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true, timeZone: iana,
  }).format(DEBUT_MV_DATE)
  const tzLabel = timeZone === "LOCAL"
    ? new Intl.DateTimeFormat("en-US", { timeZoneName: "short", timeZone: iana })
        .formatToParts(DEBUT_MV_DATE).find(p => p.type === "timeZoneName")?.value ?? "LOCAL"
    : timeZone
  return { date: dateFormatted, time: timeFormatted, tz: tzLabel }
}

function getElapsed() {
  const diff = Math.max(0, Date.now() - DEBUT_MV_TIMESTAMP)
  const totalSeconds = Math.floor(diff / 1000)
  return {
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}
function pad2(n: number) { return n.toString().padStart(2, "0") }

function LiveTicker({ tzLabel }: { tzLabel: string }) {
  const [elapsed, setElapsed] = useState({ hours: 0, minutes: 0, seconds: 0 })
  useEffect(() => {
    const update = () => setElapsed(getElapsed())
    update()
    const id = setInterval(() => setElapsed(getElapsed()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col items-center gap-1 mt-1">
      <div className="flex items-center justify-center gap-1">
        <div className="flex flex-col items-center">
          <span className="text-[18px] md:text-[20px] font-black tabular-nums text-slate-700 leading-none">{pad2(elapsed.hours)}</span>
          <span className="text-[7px] font-bold uppercase tracking-widest text-black/30 mt-0.5">hrs</span>
        </div>
        <span className="text-[18px] font-black text-[#FF708A] mb-3 leading-none">:</span>
        <div className="flex flex-col items-center">
          <span className="text-[18px] md:text-[20px] font-black tabular-nums text-slate-700 leading-none">{pad2(elapsed.minutes)}</span>
          <span className="text-[7px] font-bold uppercase tracking-widest text-black/30 mt-0.5">min</span>
        </div>
        <span className="text-[18px] font-black text-[#FF708A] mb-3 leading-none">:</span>
        <div className="flex flex-col items-center">
          <span className="text-[18px] md:text-[20px] font-black tabular-nums text-[#FF708A] leading-none">{pad2(elapsed.seconds)}</span>
          <span className="text-[7px] font-bold uppercase tracking-widest text-[#FF708A]/40 mt-0.5">sec</span>
        </div>
      </div>
      <span className="inline-flex items-center gap-0.5 text-[7px] font-black uppercase tracking-widest text-black/40 bg-black/6 px-2 py-0.5 rounded-full border border-black/8">
        {tzLabel}
      </span>
    </div>
  )
}

function useCountUp(target: number, isVisible: boolean, duration = 1200) {
  const [count, setCount] = useState(0)
  const hasRun = useRef(false)
  useEffect(() => {
    if (!isVisible || hasRun.current) return
    hasRun.current = true
    const startTime = performance.now()
    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [isVisible, target, duration])
  return count
}

function AwardSparkles({ color }: { color: "sky" | "violet" }) {
  const baseColor = color === "sky" ? "#38bdf8" : "#a78bfa"
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="absolute bottom-0 rounded-full bg-current animate-award-float" style={{ left: `${20 + i * 15}%`, width: '2px', height: '2px', backgroundColor: baseColor, animationDuration: '2s', animationDelay: `${i * 0.2}s` }} />
      ))}
      <style>{`@keyframes award-float { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: 1; } 100% { transform: translateY(-140px); opacity: 0; } }`}</style>
    </div>
  )
}

function ShimmerSweep() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
      <div className="absolute inset-y-0 w-1/2 -left-full group-hover:left-full transition-all duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  )
}

function DebutVideoModal({ isOpen, onClose, status, video, onRetry, errorMessage }: any) {
  if (!isOpen) return null
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/10" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white"><X className="size-6" /></button>
        <div className="p-8">
          <h3 className="text-white font-bold mb-4">Random Performance</h3>
          <p className="mb-4 text-sm leading-6 text-white/50">
            This opens a random official Hearts2Hearts video.
          </p>
          <div className="aspect-video bg-black rounded-xl overflow-hidden">
            {status === 'ready' && video ? <iframe src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`} className="w-full h-full" allowFullScreen /> : <div className="flex items-center justify-center h-full text-white/40">{status === 'loading' ? 'Loading...' : 'Error loading video'}</div>}
          </div>
          <button onClick={onRetry} className="mt-6 w-full py-3 rounded-xl bg-[#FF708A] text-white font-bold hover:opacity-90 transition-opacity">Another Random Video</button>
        </div>
      </div>
    </div>, document.body
  )
}

// ─── Main Section ────────────────────────────────────────────────────────────

export function HomeStatsSection({ snapshot, filmStripFrames = [] }: HomeStatsSectionProps) {
  const { t } = useTranslation()
  const { timeZone } = useTimeZoneStore()
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [debutDays, setDebutDays] = useState(0)
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [videoStatus, setVideoStatus] = useState<VideoStatus>("idle")
  const [randomVideo, setRandomVideo] = useState<RandomVideo | null>(null)

  const debutInfo = getDebutDisplayInfo(timeZone)

  useEffect(() => {
    setMounted(true)
    setDebutDays(diffInDaysFrom("24/02/2025"))
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setIsVisible(true); obs.disconnect() } }, { threshold: 0.1 })
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  const fetchRandomVideo = useCallback(async () => {
    setVideoStatus("loading")
    try {
      const res = await fetch(YOUTUBE_RANDOM_API)
      const data = await res.json()
      setRandomVideo(data); setVideoStatus("ready")
    } catch { setVideoStatus("error") }
  }, [])

  const statCards: StatCard[] = [
    { slug: "debut-days", key: "debut", icon: CalendarDays, value: debutDays, debutDate: "2025.02.24", badge: t("home.stats.badge.debutMilestone"), className: "col-span-1 md:col-span-2 row-span-2 bg-gradient-to-br from-[#FFF0F5] via-[#FFE4EC] to-[#FFD1DC]", iconBg: "bg-white/60", iconColor: "text-[#FF708A]", textColor: "text-black", hasFilmStrip: true, hasHearts: true, hasVideoModal: true },
    { slug: "music-show-wins", key: "music-shows", icon: Radio, label: t("stats.musicShows"), value: snapshot.musicShowWins, countUpValue: useCountUp(snapshot.musicShowWins, isVisible), sparkleColor: "sky", badge: t("home.stats.badge.liveTrophies"), className: "bg-gradient-to-br from-white via-sky-50 to-blue-50", iconBg: "bg-sky-100", iconColor: "text-sky-500", textColor: "text-slate-800" },
    { slug: "award-ceremony-wins", key: "award-ceremonies", icon: Trophy, label: t("stats.awardCeremonies"), value: snapshot.awardCeremonyWins, countUpValue: useCountUp(snapshot.awardCeremonyWins, isVisible), sparkleColor: "violet", badge: t("home.stats.badge.globalAwards"), className: "bg-gradient-to-br from-white via-violet-50 to-purple-50", iconBg: "bg-violet-100", iconColor: "text-violet-500", textColor: "text-slate-800" },
  ]

  return (
    <section ref={sectionRef} className="relative py-20 select-none overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10 px-4 md:px-0">
        <div className="card-premium shimmer-border p-6 md:p-10 relative overflow-hidden">
          <DebutVideoModal isOpen={videoModalOpen} onClose={() => setVideoModalOpen(false)} status={videoStatus} video={randomVideo} onRetry={fetchRandomVideo} />

          <div className="mb-10">
            <div className="flex items-center gap-3 text-pink-500 mb-3">
              <Sparkles className="size-5 fill-current animate-pulse" />
              <p className="text-[11px] font-black uppercase tracking-[0.4em]">Official Performance</p>
            </div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-slate-900">{t("home.stats.careerRecords")}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(140px,auto)]">
            {statCards.map((card) => {
              const Icon = card.icon
              const isDebut = "hasVideoModal" in card

              return (
                <div key={card.key} className={cn("group relative flex flex-col justify-between overflow-hidden rounded-[3rem] p-6 border border-white/60 shadow-xl transition-all duration-500 hover:-translate-y-2", isDebut ? "md:p-10" : "md:p-8", card.className)}>

                  {card.hasFilmStrip && <FilmStrip frames={filmStripFrames} />}

                  {card.hasHearts && (
                    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                      {[...Array(5)].map((_, idx) => (
                        <Heart key={idx} className="absolute text-[#FF708A]/15 fill-current animate-pulse" style={{ top: `${20 + idx * 15}%`, left: `${15 + idx * 20}%`, width: '1.5rem', height: '1.5rem' }} />
                      ))}
                    </div>
                  )}

                  {card.sparkleColor && <><ShimmerSweep /><AwardSparkles color={card.sparkleColor as any} /></>}

                  <div className="relative z-20 flex flex-col h-full justify-between gap-4">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", card.iconBg, card.iconColor)}><Icon className="size-5" /></div>

                    <div className="flex-1 flex flex-col justify-center">
                      {isDebut ? (
                        /* ── Khung kính D-Day (Đã gom nhẹ lại - py-8) ── */
                        <div className="flex flex-col items-center rounded-[2.5rem] bg-[#FFF9F0]/70 backdrop-blur-md border border-white/80 shadow-sm px-6 py-6 mx-auto w-full relative overflow-hidden">
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-black/35">Debut MV</span>
                            <span className="w-1 h-1 rounded-full bg-[#FF708A]/40" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF708A]">The Chase</span>
                          </div>

                          {mounted && isVisible ? <FlipNumber value={card.value} size="lg" /> : <div className="w-14 h-20 md:w-24 md:h-30 rounded-lg bg-[#FFF9F0]/80" />}

                          <p className="mt-2 text-[11px] font-black uppercase tracking-[0.35em] text-slate-700/80 mb-2">days</p>

                          <div className="mt-2 w-full flex flex-col items-center gap-1.5">
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-black/35">Official Release</span>
                              <div className="flex items-baseline gap-1.5">
                                <p className="text-[13px] font-black uppercase tracking-[0.25em] text-[#FF708A]">{debutInfo.date}</p>
                                <span className="text-[10px] font-black text-[#FF708A]/70">{debutInfo.time} {debutInfo.tz}</span>
                              </div>
                            </div>
                            <LiveTicker tzLabel={debutInfo.tz} />
                          </div>
                        </div>
                      ) : (
                        /* ── Thẻ Award ── */
                        <Link href={`/records/${card.slug}`} className="flex flex-col items-center rounded-[2rem] bg-[#FFF9F0]/60 backdrop-blur-md border border-white/80 py-6">
                          {mounted && isVisible ? <FlipNumber value={card.countUpValue ?? card.value} size="lg" /> : <div className="w-16 h-22 bg-[#FFF9F0]/80 rounded-lg" />}
                        </Link>
                      )}
                    </div>

                    <div className="flex items-end justify-between pt-4 border-t border-black/5">
                      <div>
                        <p className="text-[12px] font-black uppercase tracking-widest text-slate-900">{isDebut ? "OUR DEBUT DAYS" : card.label}</p>
                        <span className="inline-flex px-2 py-0.5 rounded text-[8px] font-black bg-black/5 text-black uppercase mt-1">{card.badge}</span>
                      </div>
                      {isDebut ? (
                        <button
                          onClick={() => { setVideoModalOpen(true); fetchRandomVideo() }}
                          className="group/vid flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#FF708A]/10 hover:bg-[#FF708A] border border-[#FF708A]/20 hover:border-[#FF708A] transition-all duration-300 hover:shadow-[0_4px_20px_rgba(255,112,138,0.35)]"
                        >
                          <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-[#FF708A] group-hover/vid:bg-white transition-colors flex-shrink-0">
                            <span className="absolute inset-0 rounded-full bg-[#FF708A] animate-ping opacity-40" />
                            <Play className="size-3.5 ml-0.5 text-white group-hover/vid:text-[#FF708A] transition-colors" />
                          </span>
                          <div className="flex flex-col items-start">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#FF708A] group-hover/vid:text-white transition-colors leading-none">Random</span>
                            <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-black/40 group-hover/vid:text-white/70 transition-colors leading-none mt-0.5">Official Video</span>
                          </div>
                        </button>
                      ) : (
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-black/5 group-hover:scale-110 transition-all"><ArrowUpRight className="size-5" /></div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}