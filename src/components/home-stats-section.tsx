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
}

// ─── Date utils (unchanged) ──────────────────────────────────────────────────

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

// ─── FlipDigit / FlipNumber (unchanged) ─────────────────────────────────────

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
      "relative rounded-md md:rounded-xl overflow-hidden shadow-lg border border-black/8 transition-all duration-300 bg-[#FFF9F0]",
      size === "lg" ? "w-10 h-14 md:w-16 md:h-24" : "w-8 h-12 md:w-12 md:h-16"
    )}>
      <div className="absolute inset-0 flex flex-col">
        <div className="flex-1 bg-gradient-to-b from-white to-[#FFF9F0] border-b border-black/8" />
        <div className="flex-1 bg-gradient-to-b from-[#FFF9F0] to-[#F5E6D3]" />
      </div>
      <div className={cn(
        "relative z-10 flex items-center justify-center h-full transition-all duration-500",
        isFlipping ? "opacity-0 scale-95" : "opacity-100 scale-100"
      )}>
        <span className={cn(
          "font-black text-slate-800 drop-shadow-sm transition-all",
          size === "lg" ? "text-3xl md:text-6xl" : "text-2xl md:text-4xl"
        )}>{current}</span>
      </div>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/40 to-transparent" />
      <div className="absolute top-1/2 left-0 right-0 h-[1px] z-20 bg-black/8" />
    </div>
  )
}

function FlipNumber({ value, size = "sm" }: { value: number; size?: "sm" | "lg" }) {
  const digits = value.toString().split("")
  return (
    <div className={cn(
      "flex justify-center py-3",
      size === "lg" ? "gap-2 md:gap-4" : "gap-1 md:gap-2"
    )}>
      {digits.map((d, i) => <FlipDigit key={i} value={d} size={size} />)}
    </div>
  )
}

// ─── Live Ticker — debut card ─────────────────────────────────────────────────

const DEBUT_MV_TIMESTAMP = new Date("2025-02-24T18:00:00+09:00").getTime()

function getElapsed() {
  const diff = Math.max(0, Date.now() - DEBUT_MV_TIMESTAMP)
  const totalSeconds = Math.floor(diff / 1000)
  return {
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

function pad2(n: number) {
  return n.toString().padStart(2, "0")
}

function LiveTicker() {
  const [elapsed, setElapsed] = useState(getElapsed)
  useEffect(() => {
    const id = setInterval(() => setElapsed(getElapsed()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center justify-center gap-1 mt-2">
      <div className="flex flex-col items-center">
        <span className="text-[18px] md:text-[22px] font-black tabular-nums text-slate-700 leading-none">
          {pad2(elapsed.hours)}
        </span>
        <span className="text-[7px] font-bold uppercase tracking-widest text-black/30 mt-0.5">hrs</span>
      </div>
      <span className="text-[18px] md:text-[22px] font-black text-[#FF708A] mb-3 leading-none">:</span>
      <div className="flex flex-col items-center">
        <span className="text-[18px] md:text-[22px] font-black tabular-nums text-slate-700 leading-none">
          {pad2(elapsed.minutes)}
        </span>
        <span className="text-[7px] font-bold uppercase tracking-widest text-black/30 mt-0.5">min</span>
      </div>
      <span className="text-[18px] md:text-[22px] font-black text-[#FF708A] mb-3 leading-none">:</span>
      <div className="flex flex-col items-center">
        <span className="text-[18px] md:text-[22px] font-black tabular-nums text-[#FF708A] leading-none">
          {pad2(elapsed.seconds)}
        </span>
        <span className="text-[7px] font-bold uppercase tracking-widest text-[#FF708A]/40 mt-0.5">sec</span>
      </div>
    </div>
  )
}

// ─── Count-up hook — award cards ─────────────────────────────────────────────

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

// ─── Floating sparkles — award cards ─────────────────────────────────────────

function AwardSparkles({ color }: { color: "sky" | "violet" }) {
  const particles = [
    { x: "20%", delay: "0ms", dur: "1.8s", size: 3 },
    { x: "50%", delay: "200ms", dur: "2.1s", size: 2 },
    { x: "75%", delay: "100ms", dur: "1.6s", size: 3 },
    { x: "35%", delay: "350ms", dur: "2.3s", size: 2 },
    { x: "62%", delay: "500ms", dur: "1.9s", size: 2 },
    { x: "85%", delay: "250ms", dur: "2.0s", size: 3 },
  ]
  const baseColor = color === "sky" ? "#38bdf8" : "#a78bfa"

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute bottom-0 rounded-full"
          style={{
            left: p.x,
            width: p.size,
            height: p.size,
            background: baseColor,
            animationName: "awardFloatUp",
            animationDuration: p.dur,
            animationDelay: p.delay,
            animationTimingFunction: "ease-out",
            animationIterationCount: "infinite",
            animationFillMode: "both",
          }}
        />
      ))}
      <style>{`
        @keyframes awardFloatUp {
          0%   { transform: translateY(0) scale(1);         opacity: 0; }
          15%  { opacity: 1; }
          80%  { opacity: 0.6; }
          100% { transform: translateY(-140px) scale(0.3);  opacity: 0; }
        }
      `}</style>
    </div>
  )
}

// ─── Shimmer sweep — award cards ─────────────────────────────────────────────

function ShimmerSweep() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden rounded-3xl">
      <div
        className="absolute inset-y-0 w-[60%] -left-[60%] group-hover:left-[110%] transition-all duration-700 ease-in-out"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.45) 50%, transparent 60%)",
        }}
      />
    </div>
  )
}

// ─── FilmStrip (unchanged) ───────────────────────────────────────────────────

function FilmStrip() {
  const images = [
    "/bts/bts-1.png",
    "/bts/bts-2.png",
    "/bts/bts-3.png",
    "/bts/bts-1.png",
    "/bts/bts-2.png",
    "/bts/bts-3.png",
  ]
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10 group-hover:opacity-25 transition-opacity duration-1000 z-0">
      <div className="flex h-full animate-marquee items-center gap-6 py-6 px-12">
        {images.map((src, idx) => (
          <div key={idx} className="relative aspect-[4/5] h-3/4 flex-shrink-0 overflow-hidden rounded-lg border-[6px] border-white/40 bg-slate-800 shadow-xl rotate-1 group-hover:rotate-0 transition-transform duration-500">
            <Image src={src} alt="Nostalgic Moment" fill className="object-cover" />
            <div className="absolute top-0 bottom-0 left-0 w-2 flex flex-col justify-around py-2">
              {[...Array(6)].map((_, i) => <div key={i} className="w-1 h-1 rounded-sm bg-white/20 mx-auto" />)}
            </div>
            <div className="absolute top-0 bottom-0 right-0 w-2 flex flex-col justify-around py-2">
              {[...Array(6)].map((_, i) => <div key={i} className="w-1 h-1 rounded-sm bg-white/20 mx-auto" />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── BackgroundEffects (unchanged) ───────────────────────────────────────────

function BackgroundEffects() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-400/5 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-pink-400/5 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: "2s" }} />
    </div>
  )
}

// ─── DebutVideoModal (100% unchanged) ────────────────────────────────────────

function DebutVideoModal({
  isOpen,
  onClose,
  status,
  video,
  onRetry,
  errorMessage,
}: {
  isOpen: boolean
  onClose: () => void
  status: VideoStatus
  video: RandomVideo | null
  onRetry: () => void
  errorMessage: string | null
}) {
  const PREVIEW_SECONDS = 60
  const [previewPlaying, setPreviewPlaying] = useState(false)
  const [mountIframe, setMountIframe] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    if (isOpen) document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) {
      setPreviewPlaying(false)
      setMountIframe(false)
      return
    }
    if (status !== "ready" || !video?.videoId) {
      setPreviewPlaying(false)
      setMountIframe(false)
      return
    }

    // Let the modal paint first to reduce perceived jank, then mount the iframe.
    setPreviewPlaying(true)
    setMountIframe(false)

    const raf = requestAnimationFrame(() => {
      setMountIframe(true)
    })

    const t = setTimeout(() => {
      setPreviewPlaying(false)
      setMountIframe(false)
    }, PREVIEW_SECONDS * 1000)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t)
    }
  }, [isOpen, status, video?.videoId])

  if (!isOpen) return null

  return createPortal((
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" />
      <div
        className="relative w-full max-w-2xl bg-gradient-to-br from-[#1a0a10] to-[#0a0a1a] rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-white/10 animate-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button is rendered outside the player area to avoid iframe click-capture issues */}
        <div className="absolute top-4 right-4 z-[99999] pointer-events-none">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onClose()
            }}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onClose()
            }}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF708A]/20">
              <Film className="size-5 text-[#FF708A]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF708A]/70">Since 2025.02.24</p>
              <h3 className="text-lg font-black text-white tracking-tight">Random from the official channel</h3>
            </div>
          </div>
          <p className="text-white/40 text-[13px]">
            Opens instantly with a cached pick. Tap “Another random” for a new one.
          </p>
        </div>

        <div className="mx-6 mb-6 aspect-video bg-black/50 rounded-2xl overflow-hidden border border-white/10 flex flex-col items-center justify-center gap-4 relative">
          <div
            className="absolute inset-0 opacity-20 mix-blend-overlay"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }}
          />
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)" }}
          />
          <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-4">
            {mountIframe && previewPlaying && status === "ready" && video?.videoId ? (
              <iframe
                title={video.title}
                key={`${video.videoId}-preview`}
                loading="eager"
                src={`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&mute=1&playsinline=1&rel=0&controls=0&modestbranding=1&start=0&end=${PREVIEW_SECONDS}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full pointer-events-none"
              />
            ) : video?.thumbnail ? (
              <Image
                src={video.thumbnail}
                alt={video?.title ?? "YouTube preview"}
                fill
                className="object-cover opacity-80"
                priority
              />
            ) : null}

            {/* Clickable layer to open YouTube (disabled while iframe preview is playing) */}
            {video?.url && !previewPlaying && (
              <a
                href={video.url}
                target="_blank"
                rel="noreferrer"
                className="absolute inset-0 z-10"
                aria-label="Open on YouTube"
              />
            )}
            <div className="absolute inset-0 bg-black/45" />
            {!mountIframe && (
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                <Play className="size-8 text-white/70 ml-1" />
              </div>
            )}
            <p className="relative z-10 text-white/80 text-[12px] font-medium text-center px-8">
              {status === "loading"
                ? "Loading..."
                : status === "ready" && video
                  ? "Open on YouTube to keep watching."
                  : "No video yet. Try another or open the channel."}
            </p>
            {status === "error" && (
              <p className="relative z-10 text-[#FF708A]/80 text-[11px] font-semibold text-center px-10">
                {errorMessage || "Please check the YouTube API configuration."}
              </p>
            )}
            <div className="relative z-10 flex items-center gap-3">
              {video?.url ? (
                <a
                  href={video.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#FF708A]/25 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#FF708A]/35"
                >
                  Watch on YouTube
                </a>
              ) : (
                <a
                  href={YOUTUBE_CHANNEL_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#FF708A]/25 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#FF708A]/35"
                >
                  Open channel
                </a>
              )}
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/20"
              >
                Another random
              </button>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-pink-900/20 pointer-events-none" />
        </div>

        <div className="px-6 pb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {["First stage", "Awards", "Fan meeting", "Behind the scenes", "Highlights"].map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/50 uppercase tracking-wider">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/20">
              View channel
            </a>
          </div>
        </div>
      </div>
    </div>
  ), document.body)
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export function HomeStatsSection({ snapshot }: HomeStatsSectionProps) {
  const { t } = useTranslation()
  const sectionRef = useRef<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [debutDays, setDebutDays] = useState(0)
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [videoStatus, setVideoStatus] = useState<VideoStatus>("idle")
  const [randomVideo, setRandomVideo] = useState<RandomVideo | null>(null)
  const [videoError, setVideoError] = useState<string | null>(null)

  useEffect(() => {
    // Reduce initial latency when opening the YouTube modal.
    const links: Array<{ rel: string; href: string; crossOrigin?: string }> = [
      { rel: "preconnect", href: "https://www.youtube-nocookie.com" },
      { rel: "preconnect", href: "https://i.ytimg.com" },
      { rel: "preconnect", href: "https://www.google.com" },
      { rel: "dns-prefetch", href: "https://www.youtube-nocookie.com" },
      { rel: "dns-prefetch", href: "https://i.ytimg.com" },
      { rel: "dns-prefetch", href: "https://www.google.com" },
    ]

    const added: HTMLLinkElement[] = []
    for (const { rel, href, crossOrigin } of links) {
      if (document.querySelector(`link[rel="${rel}"][href="${href}"]`)) continue
      const el = document.createElement("link")
      el.rel = rel
      el.href = href
      if (crossOrigin) el.crossOrigin = crossOrigin
      document.head.appendChild(el)
      added.push(el)
    }

    return () => {
      for (const el of added) el.remove()
    }
  }, [])

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

  // Count-up values for award cards
  const musicShowCount = useCountUp(snapshot.musicShowWins, isVisible)
  const awardCeremonyCount = useCountUp(snapshot.awardCeremonyWins, isVisible)

  const statCards: StatCard[] = [
    {
      slug: "debut-days",
      key: "debut",
      icon: CalendarDays,
      value: debutDays,
      debutDate: "2025.02.24",
      badge: t("home.stats.badge.debutMilestone"),
      className: "col-span-1 md:col-span-2 row-span-2 bg-gradient-to-br from-[#FFF0F5] via-[#FFE4EC] to-[#FFD1DC]",
      iconBg: "bg-white/60",
      iconColor: "text-[#FF708A]",
      textColor: "text-black",
      hasFilmStrip: true,
      hasHearts: true,
      hasVideoModal: true,
    },
    {
      slug: "music-show-wins",
      key: "music-shows",
      icon: Radio,
      label: t("stats.musicShows"),
      value: snapshot.musicShowWins,
      countUpValue: musicShowCount,
      sparkleColor: "sky" as const,
      badge: t("home.stats.badge.liveTrophies"),
      desc: t("home.stats.desc.broadcastWins"),
      className: "col-span-1 md:col-span-1 row-span-1 bg-gradient-to-br from-white via-sky-50 to-blue-50",
      iconBg: "bg-sky-100",
      iconColor: "text-sky-500",
      textColor: "text-slate-800",
    },
    {
      slug: "award-ceremony-wins",
      key: "award-ceremonies",
      icon: Trophy,
      label: t("stats.awardCeremonies"),
      value: snapshot.awardCeremonyWins,
      countUpValue: awardCeremonyCount,
      sparkleColor: "violet" as const,
      badge: t("home.stats.badge.globalAwards"),
      desc: t("home.stats.desc.industryHonors"),
      className: "col-span-1 md:col-span-1 row-span-1 bg-gradient-to-br from-white via-violet-50 to-purple-50",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-500",
      textColor: "text-slate-800",
    },
  ]

  // ── Video fetch logic (100% unchanged) ──
  const fetchRandomVideo = useCallback(async (attempt: number = 0, showLoading: boolean = true) => {
    if (showLoading) setVideoStatus("loading")
    setVideoError(null)
    try {
      const response = await fetch(YOUTUBE_RANDOM_API, { cache: "no-store" })
      if (!response.ok) {
        let errorMessage = "Unable to load a video."
        try {
          const errorData = (await response.json()) as RandomVideoError
          if (errorData?.message) errorMessage = errorData.message
        } catch { /* ignore */ }
        setVideoStatus("error")
        setVideoError(errorMessage)
        return
      }
      const data = (await response.json()) as RandomVideo
      if (!data?.videoId) {
        setVideoStatus("error")
        setVideoError("No video available yet.")
        return
      }
      if (randomVideo?.videoId && data.videoId === randomVideo.videoId && attempt < 1) {
        void fetchRandomVideo(attempt + 1, showLoading)
        return
      }
      setRandomVideo(data)
      setVideoStatus("ready")
    } catch {
      setVideoStatus("error")
      setVideoError("Network error while fetching a video.")
    }
  }, [randomVideo?.videoId])

  useEffect(() => {
    if (!videoModalOpen) return
    if (!randomVideo || videoStatus !== "ready") {
      void fetchRandomVideo(0, !randomVideo)
    }
  }, [videoModalOpen, fetchRandomVideo, randomVideo, videoStatus])

  useEffect(() => {
    if (!randomVideo && videoStatus === "idle") {
      void fetchRandomVideo(0, false)
    }
  }, [fetchRandomVideo, randomVideo, videoStatus])

  const handleDebutVideoOpen = () => {
    if (!randomVideo && videoStatus === "idle") void fetchRandomVideo(0, false)
    setVideoModalOpen(true)
  }
  const handleDebutVideoClose = () => {
    setVideoModalOpen(false)
  }

  return (
    <section ref={sectionRef} className="relative reveal-up py-20 select-none overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="card-premium shimmer-border p-6 md:p-10 relative overflow-hidden">
          {/* Background blobs - Standardized */}
          <div className="absolute top-0 right-0 size-96 bg-pink-200/20 blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 size-96 bg-sky-200/20 blur-[100px] rounded-full -ml-20 -mb-20 pointer-events-none" />

          <div className="relative z-10">
            <DebutVideoModal
              isOpen={videoModalOpen}
              onClose={handleDebutVideoClose}
              status={videoStatus}
              video={randomVideo}
              onRetry={fetchRandomVideo}
              errorMessage={videoError}
            />

            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <div className="flex items-center gap-3 text-pink-500 mb-3">
                  <Sparkles className="size-5 fill-current animate-pulse" />
                  <p className="text-[11px] font-black uppercase tracking-[0.4em]">Official Performance</p>
                </div>
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-slate-900">
                  {t("home.stats.careerRecords") || "RECORDS"}
                </h2>
              </div>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(140px,auto)]">
              {statCards.map((card, i) => {
                const Icon = card.icon
                const isDark = card.textColor === "text-white"
                const isDebutCard = "hasVideoModal" in card
                const isAwardCard = "sparkleColor" in card

                const cardContent = (
                  <>
                    {/* Hover glow */}
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-colors duration-500 z-10" />

                    {/* Debut: film strip */}
                    {"hasFilmStrip" in card && card.hasFilmStrip && <FilmStrip />}

                    {/* Debut: floating hearts */}
                    {"hasHearts" in card && card.hasHearts && (
                      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                        {[
                          { top: "18%", left: "20%", delay: "0s", dur: "3s", size: "size-6" },
                          { top: "55%", left: "75%", delay: "0.5s", dur: "4s", size: "size-4" },
                          { top: "72%", left: "30%", delay: "1s", dur: "2.5s", size: "size-6" },
                          { top: "30%", left: "60%", delay: "1.5s", dur: "3.5s", size: "size-4" },
                          { top: "80%", left: "55%", delay: "2s", dur: "2s", size: "size-6" },
                          { top: "45%", left: "15%", delay: "2.5s", dur: "4.5s", size: "size-4" },
                        ].map((h, idx) => (
                          <Heart key={idx}
                            className={cn("absolute text-[#FF708A]/15 fill-current animate-pulse", h.size)}
                            style={{ top: h.top, left: h.left, animationDelay: h.delay, animationDuration: h.dur }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Award cards: shimmer + sparkles + hover hint */}
                    {isAwardCard && (
                      <>
                        <ShimmerSweep />
                        <AwardSparkles color={(card as { sparkleColor: "sky" | "violet" }).sparkleColor} />
                        <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center pb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 pointer-events-none">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/6 text-[9px] font-black uppercase tracking-widest text-black/40">
                            View details <ArrowUpRight className="size-2.5" />
                          </span>
                        </div>
                      </>
                    )}

                    {/* Content */}
                    <div className="relative z-20 flex flex-col h-full justify-between gap-4">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3",
                        card.iconBg, card.iconColor
                      )}>
                        <Icon className="size-5" />
                      </div>

                      <div className="flex flex-col flex-1 justify-center">
                        {"debutDate" in card ? (
                          /* ── Debut card: glass info block ── */
                          <div className="flex flex-col items-center rounded-[3rem] bg-[#FFF9F0]/70 backdrop-blur-md border border-white/80 shadow-sm px-10 py-12 mx-auto w-full relative overflow-hidden group/inner">
                            {/* Decorative gradient orb */}
                            <div className="absolute -top-10 -right-10 size-24 bg-[#FF708A]/10 blur-2xl rounded-full" />
                            {/* MV name — info only, no play icon */}
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-black/35">Debut MV</span>
                              <span className="w-1 h-1 rounded-full bg-[#FF708A]/40" />
                              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF708A]">The Chase</span>
                            </div>
                            {mounted && isVisible ? (
                              <FlipNumber value={card.value} size="lg" />
                            ) : (
                              <div className="flex gap-2 justify-center py-4">
                                <div className="w-8 h-12 md:w-12 md:h-16 rounded-lg bg-[#FFF9F0]/80 border border-black/5" />
                              </div>
                            )}
                            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-black/30 -mt-1 mb-2">days</p>
                            <div className="flex items-center gap-3 w-full justify-center mb-1">
                              <div className="h-[1px] flex-1 bg-black/10" />
                              <p className="text-[13px] font-black uppercase tracking-[0.35em] text-[#FF708A]">
                                {card.debutDate}
                              </p>
                              <div className="h-[1px] flex-1 bg-black/10" />
                            </div>
                            {mounted && <LiveTicker />}
                            <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-black/28 mt-2">
                              Since 6:00 PM KST
                            </span>
                          </div>
                        ) : (
                          /* ── Award cards: count-up number ── */
                          <div className="flex flex-col items-center rounded-[2rem] bg-[#FFF9F0]/60 backdrop-blur-md border border-white/80 shadow-sm px-4 py-6 mx-auto w-full relative overflow-hidden">
                            {/* Decorative gradient orb */}
                            <div className="absolute -top-10 -right-10 size-24 bg-white/40 blur-2xl rounded-full" />
                            {mounted && isVisible ? (
                              <FlipNumber value={card.countUpValue ?? card.value} size="lg" />
                            ) : (
                              <div className="flex gap-2 justify-center py-4">
                                <div className="w-8 h-12 md:w-12 md:h-16 rounded-lg bg-[#FFF9F0]/80 border border-black/5" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-end justify-between pt-4 border-t border-black/5">
                        <div className="space-y-0.5">
                          <p className={cn("text-[12px] font-black uppercase tracking-widest", card.textColor)}>
                            {"label" in card ? card.label : "OUR DEBUT DAYS"}
                          </p>
                          <span className={cn(
                            "inline-flex px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest mt-1",
                            isDark ? "bg-white/20 text-white" : "bg-black/5 text-black"
                          )}>
                            {card.badge}
                          </span>
                        </div>
                        <div className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-500 group-hover:scale-110",
                          isDark ? "bg-white/10 text-white" : "bg-black/5 text-black"
                        )}>
                          <ArrowUpRight className="size-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>

                    {/* Debut card: hover CTA overlay (unchanged) */}
                    {isDebutCard && (
                      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-[#FF708A]/10 backdrop-blur-[2px] rounded-3xl">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/80 shadow-xl">
                          <Play className="size-7 text-[#FF708A] ml-1" />
                        </div>
                        <p className="text-[13px] font-black text-black/80 tracking-wide text-center px-6">
                          Play a random Hearts2Hearts video ✨
                        </p>
                        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-black/40">
                          Click to open
                        </span>
                      </div>
                    )}

                    {/* Decorative background icon */}
                    {!("hasFilmStrip" in card && card.hasFilmStrip) && (
                      <div className="absolute -bottom-10 -right-10 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 transition-all duration-700 pointer-events-none z-0">
                        <Icon className={cn("size-[300px]", isDark ? "text-white" : "text-black")} />
                      </div>
                    )}
                  </>
                )

                if (isDebutCard) {
                  return (
                    <button
                      key={card.key}
                      onClick={handleDebutVideoOpen}
                      onPointerEnter={() => {
                        if (!randomVideo && videoStatus === "idle") void fetchRandomVideo(0, false)
                      }}
                      onFocus={() => {
                        if (!randomVideo && videoStatus === "idle") void fetchRandomVideo(0, false)
                      }}
                      className={cn(
                        "group relative flex flex-col justify-between overflow-hidden rounded-[3rem] p-6 border border-white/60 shadow-xl transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_40px_80px_rgba(0,0,0,0.12)] cursor-pointer text-left w-full",
                        isDebutCard ? "md:p-14" : "md:p-8",
                        card.className
                      )}
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      {cardContent}
                    </button>
                  )
                }

                return (
                  <Link
                    href={`/records/${card.slug}`}
                    key={card.key}
                    className={cn(
                      "group relative flex flex-col justify-between overflow-hidden rounded-3xl p-4 md:p-6 border border-white/60 shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer",
                      card.slug === "music-show-wins"
                        ? "hover:shadow-[0_24px_60px_rgba(56,189,248,0.22)]"
                        : "hover:shadow-[0_24px_60px_rgba(167,139,250,0.22)]",
                      card.className
                    )}
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {cardContent}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
