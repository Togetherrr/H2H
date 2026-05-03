"use client"

/* eslint-disable @next/next/no-img-element */

import Link from "next/link"
import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown, Clock, Activity, ExternalLink } from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"
import { cn } from "@/lib/utils"
import type { TrackPerformanceSnapshot, PerformanceItem } from "@/lib/track-performance"

type TrackPerformanceSectionProps = {
  snapshot: TrackPerformanceSnapshot
}

// ─── MetricBadge ────────────────────────────────────────────────────────────
function MetricBadge({ value, format }: { value: number | null; format?: "number" | "percent" }) {
  if (value === null) return null
  const isPositive = value >= 0
  const Icon = isPositive ? TrendingUp : TrendingDown

  const displayValue =
    format === "percent"
      ? `${isPositive ? "+" : ""}${value.toFixed(2)}%`
      : `${isPositive ? "+" : ""}${value.toLocaleString("en-US")}`

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tighter",
        isPositive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"
      )}
    >
      <Icon className="size-3" />
      {displayValue}
    </div>
  )
}

// ─── PerformanceItemRow ──────────────────────────────────────────────────────
export function PerformanceItemRow({ item, index }: { item: PerformanceItem; index: number }) {
  const isPositive = (item.dailyChange || 0) >= 0
  const Icon = isPositive ? TrendingUp : TrendingDown
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <a
      href={item.href || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="group/row grid items-center border-b border-[#FFF0F5] px-4 transition-colors hover:bg-[#FFF8FB] last:border-b-0"
      style={{ gridTemplateColumns: "48px 1fr 140px 120px 100px", minHeight: "68px" }}
    >
      {/* Rank */}
      <div className="text-center">
        <span className="text-[12px] font-black text-[#FFAAC0]">
          #{String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Track info */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="h-[42px] w-[42px] shrink-0 overflow-hidden rounded-[10px] border border-slate-100">
          <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-black text-slate-950">{item.title}</p>
          <p className="truncate text-[11px] font-medium uppercase tracking-widest text-slate-600">{item.subtitle}</p>
        </div>
      </div>

      {/* Total */}
      <div className="hidden text-right font-mono text-[13px] font-bold tabular-nums text-slate-950 lg:block">
        {mounted ? (item.total?.toLocaleString("en-US") ?? "0") : "—"}
      </div>

      {/* Daily */}
      <div className="hidden text-right font-mono text-[13px] font-bold tabular-nums text-emerald-500 md:block">
        {mounted && item.daily !== null ? `+${item.daily.toLocaleString("en-US")}` : "—"}
      </div>

      {/* Change badge */}
      <div className="flex justify-end">
        <div
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase",
            isPositive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"
          )}
        >
          <Icon className="h-3 w-3" />
          {mounted
            ? item.dailyChangeFormat === "percent"
              ? `${(item.dailyChange ?? 0).toFixed(2)}%`
              : (item.dailyChange ?? 0).toLocaleString("en-US")
            : "0%"}
        </div>
      </div>
    </a>
  )
}

// ─── Platform tab button ─────────────────────────────────────────────────────
type PlatformTab = "spotify" | "youtube" | "korea"

function PlatformTabButton({
  active,
  onClick,
  children,
  variant,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  variant: PlatformTab
}) {
  const variantStyles: Record<PlatformTab, string> = {
    spotify: "bg-sky-50 border-sky-200 text-sky-700 shadow-sm",
    youtube: "bg-pink-50 border-pink-200 text-pink-700 shadow-sm",
    korea: "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm",
  }

  const activeStyles = variantStyles[variant] || "bg-slate-50 border-slate-200 text-slate-700 shadow-sm"

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-2xl border px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-all",
        active
          ? activeStyles
          : "border-white bg-white/40 text-slate-400 hover:bg-white/60"
      )}
    >
      {children}
    </button>
  )
}

// ─── Korea Chart Group ──────────────────────────────────────────────────────
function KoreaChartGroup({ 
  platform, 
  icon, 
  color, 
  links 
}: { 
  platform: string; 
  icon: string; 
  color: string; 
  links: { label: string; url: string }[] 
}) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-2">
      {/* Platform Header */}
      <div className={cn("flex items-center gap-3 px-4 py-2 rounded-xl bg-opacity-10", color.replace('bg-', 'bg-').replace('shadow-', ''))} style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
        <div className={cn("flex size-8 items-center justify-center rounded-lg text-sm font-black text-white shadow-md", color)}>
          {icon}
        </div>
        <span className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-800">{platform}</span>
      </div>

      {/* Links List */}
      <div className="grid gap-2 pl-2">
        {links.map((link, idx) => (
          <a
            key={idx}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-2xl border border-white/50 bg-white/30 p-4 transition-all hover:translate-x-1 hover:bg-white hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className={cn("size-1.5 rounded-full", color)} />
              <span className="text-[13px] font-bold text-slate-700 transition-colors group-hover:text-slate-900">
                {platform}, {link.label}
              </span>
            </div>
            <ExternalLink className="size-3.5 text-slate-300 transition-colors group-hover:text-slate-500" />
          </a>
        ))}
      </div>
    </div>
  )
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export function TrackPerformanceSection({ snapshot }: TrackPerformanceSectionProps) {
  const { t, lang } = useTranslation()
  const [mounted, setMounted] = useState(false)
  const [activePlatform, setActivePlatform] = useState<PlatformTab>("spotify")

  useEffect(() => {
    setMounted(true)
  }, [])

  const formattedUpdatedAt = mounted
    ? new Date(snapshot.updatedAt).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "..."

  // Map individual platform data for Spotify and YouTube
  const activePlatformData = activePlatform === "korea" ? null : snapshot[activePlatform as "spotify" | "youtube"]

  // Template links for Korean Charts
  const koreaChartGroups = [
    {
      platform: "Melon",
      icon: "M",
      color: "bg-emerald-500 shadow-emerald-200",
      links: [
        { label: "Top 100", url: "#" },
        { label: "Hot 100", url: "#" },
        { label: "Daily", url: "#" },
        { label: "Weekly", url: "#" },
      ]
    },
    {
      platform: "Genie",
      icon: "G",
      color: "bg-blue-500 shadow-blue-200",
      links: [
        { label: "Realtime", url: "#" },
        { label: "Daily", url: "#" },
        { label: "Weekly", url: "#" },
      ]
    },
    {
      platform: "Bugs",
      icon: "B",
      color: "bg-rose-500 shadow-rose-200",
      links: [
        { label: "Realtime", url: "#" },
        { label: "Daily", url: "#" },
        { label: "Weekly", url: "#" },
      ]
    },
    {
      platform: "Vibe",
      icon: "V",
      color: "bg-slate-800 shadow-slate-200",
      links: [
        { label: "Today Top 100", url: "#" },
        { label: "Weekly", url: "#" },
      ]
    }
  ]

  return (
    <section id="performance" className="reveal-up">
      {/* Section header */}
      <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="pill-base border border-[#FFC2D1] bg-white/40">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF99AC]" />
              <Activity className="size-3.5 text-[#FF99AC]" />
              <p className="text-[#FF99AC]">
                {t("performance.label")}
              </p>
            </div>
          </div>
          <h2 className="text-title text-5xl sm:text-6xl lg:text-7xl">
            {t("home.performance.liveAnalytics").split(" ")[0]} <span className="text-gradient">{t("home.performance.liveAnalytics").split(" ").slice(1).join(" ")}</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/40 px-5 py-2.5 text-slate-500 backdrop-blur-sm self-start md:self-auto">
          <Clock className="size-4" />
          <p className="text-[10px] font-black uppercase tracking-widest">
            {t("performance.updatedAt")}: <span className="text-slate-900">{formattedUpdatedAt}</span>
          </p>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        <PlatformTabButton
          variant="spotify"
          active={activePlatform === "spotify"}
          onClick={() => setActivePlatform("spotify")}
        >
          <img src="/spotify.png" alt="Spotify" className="h-4 w-4 object-contain" />
          {t("performance.spotify")}
        </PlatformTabButton>
        <PlatformTabButton
          variant="youtube"
          active={activePlatform === "youtube"}
          onClick={() => setActivePlatform("youtube")}
        >
          <img src="/Youtube.png" alt="YouTube" className="h-4 w-4 object-contain" />
          {t("performance.youtube")}
        </PlatformTabButton>
        <PlatformTabButton
          variant="korea"
          active={activePlatform === "korea"}
          onClick={() => setActivePlatform("korea")}
        >
          <div className="flex size-4 items-center justify-center rounded-sm bg-emerald-500 text-[8px] font-bold text-white">KR</div>
          {t("performance.korea")}
        </PlatformTabButton>
      </div>

      {/* Main container */}
      {activePlatform === "korea" ? (
        <div className="card-premium p-6 lg:p-10 !rounded-[3rem]">
          <div className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 shadow-xl shadow-emerald-100 border border-emerald-100">
                <Activity className="size-8" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">
                  {t("performance.korea")}
                </p>
                <p className="text-2xl font-black uppercase tracking-tight text-slate-900">
                  Domestic Charts
                </p>
              </div>
            </div>
          </div>

          <p className="mb-10 max-w-2xl text-[14px] font-medium leading-relaxed text-slate-600">
            {t("performance.korea.desc")}
          </p>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {koreaChartGroups.map((group, idx) => (
              <KoreaChartGroup key={idx} {...group} />
            ))}
          </div>
        </div>
      ) : (
        <div className="card-premium p-6 lg:p-10 !rounded-[3rem]">
          {/* Card header */}
          <div className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl shadow-slate-200/50 border border-slate-50",
                  activePlatform === "spotify" ? "text-sky-500" : "text-pink-500"
                )}
              >
                {activePlatform === "spotify" ? (
                  <img src="/spotify.png" alt="Spotify" className="h-9 w-9 object-contain" />
                ) : (
                  <img src="/Youtube.png" alt="YouTube" className="h-9 w-9 object-contain" />
                )}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">
                  {t(`performance.${activePlatform}` as any)}
                </p>
                <p className="text-2xl font-black uppercase tracking-tight text-slate-900">
                  {activePlatform === "youtube" ? t("home.performance.officialMv") : t("home.performance.rankings")}
                </p>
              </div>
            </div>

            <Link
              href={`/charts?platform=${activePlatform}`}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105",
                activePlatform === "spotify" ? "border-sky-100 bg-sky-50 text-sky-600" : "border-pink-100 bg-pink-50 text-pink-600"
              )}
            >
              {activePlatform === "youtube" ? t("home.performance.insights") : t("home.performance.fullCharts")}
              <ExternalLink className="size-3.5" />
            </Link>
          </div>

          {/* Stats row */}
          <div className="mb-10 grid grid-cols-2 gap-4 rounded-[2rem] border border-white/60 bg-white/40 p-6 sm:grid-cols-3">
            <div className="overflow-hidden">
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                {activePlatform === "spotify"
                  ? t("performance.totalStreams")
                  : t("performance.totalViews")}
              </p>
              <div className="flex items-center gap-3">
                <div className="truncate text-3xl font-black tracking-tighter text-slate-950">
                  {mounted ? (activePlatformData?.totalValue?.toLocaleString() ?? "0") : "..."}
                </div>
                <MetricBadge
                  value={activePlatformData?.dailyChange ?? null}
                  format={activePlatformData?.dailyChangeFormat}
                />
              </div>
            </div>

            <div
              className={cn(
                "overflow-hidden border-l pl-6",
                activePlatform === "spotify" ? "border-sky-100" : "border-pink-100"
              )}
            >
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                {activePlatform === "youtube" ? t("home.performance.dailyViews") : t("home.performance.dailyGlobal")}
              </p>
              <div
                className={cn(
                  "truncate text-3xl font-black tracking-tighter",
                  activePlatform === "spotify" ? "text-sky-500" : "text-pink-500"
                )}
              >
                {mounted
                  ? activePlatformData?.dailyValue
                    ? `+${activePlatformData.dailyValue.toLocaleString()}`
                    : "N/A"
                  : "..."}
              </div>
            </div>

            <div className="hidden overflow-hidden border-l border-slate-100 pl-6 sm:block">
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                {t("home.performance.topTrack")}
              </p>
              <div className="truncate text-[16px] font-black text-slate-900">
                {activePlatformData?.items?.[0]?.title ?? "—"}
              </div>
            </div>
          </div>

          {/* Track table header */}
          <div
            className="mb-2 grid items-center px-4 py-3"
            style={{ gridTemplateColumns: "48px 1fr 140px 120px 100px" }}
          >
            <div className="text-center text-[10px] font-black uppercase tracking-widest text-[#FFAAC0]">#</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#FFAAC0]">{t("charts.trackInfo").split(" ")[0]}</div>
            <div className="hidden text-right text-[10px] font-black uppercase tracking-widest text-[#FFAAC0] lg:block">
              {t("charts.total")}
            </div>
            <div className="hidden text-right text-[10px] font-black uppercase tracking-widest text-[#FFAAC0] md:block">
              {t("charts.daily")}
            </div>
            <div className="text-right text-[10px] font-black uppercase tracking-widest text-[#FFAAC0]">
              {t("charts.trend")}
            </div>
          </div>

          {/* Track rows */}
          <div className="overflow-hidden rounded-[2rem] border border-[#FFF0F5]">
            {activePlatformData?.items && activePlatformData.items.length > 0 ? (
              activePlatformData.items.slice(0, 5).map((track, i) => (
                <PerformanceItemRow key={track.id} item={track} index={i} />
              ))
            ) : (
              <div className="py-16 text-center text-sm italic text-slate-400">
                {t("performance.empty")}
              </div>
            )}
          </div>

          {/* View all link */}
          <div className="mt-8 text-center">
            <Link
              href={`/charts?platform=${activePlatform}`}
              className={cn(
                "inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all hover:scale-105",
                activePlatform === "spotify" ? "text-sky-500" : "text-pink-500"
              )}
            >
              {t("home.performance.viewAll")}
              <ExternalLink className="size-3.5" />
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}