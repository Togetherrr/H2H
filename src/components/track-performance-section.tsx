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
type PlatformTab = "spotify" | "youtube"

function PlatformTabButton({
  active,
  onClick,
  children,
  variant,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  variant: "spotify" | "youtube"
}) {
  const activeStyles =
    variant === "spotify"
      ? "bg-sky-50 border-sky-200 text-sky-700 shadow-sm"
      : "bg-pink-50 border-pink-200 text-pink-700 shadow-sm"

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

// ─── Main Section ─────────────────────────────────────────────────────────────
export function TrackPerformanceSection({ snapshot }: TrackPerformanceSectionProps) {
  const { t, lang } = useTranslation()
  const [mounted, setMounted] = useState(false)
  const [activePlatform, setActivePlatform] = useState<PlatformTab>("spotify")

  useEffect(() => {
    setMounted(true)
  }, [])

  const spotify = snapshot.spotify
  const youtube = snapshot.youtube

  const formattedUpdatedAt = mounted
    ? new Date(snapshot.updatedAt).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "..."

  const activePlatformData = activePlatform === "spotify" ? spotify : youtube

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

      {/* Platform controls */}
      <div className="mb-8 flex gap-3">
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
      </div>

      {/* Main card */}
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
                {activePlatform === "spotify" ? t("performance.spotify") : t("performance.youtube")}
              </p>
              <p className="text-2xl font-black uppercase tracking-tight text-slate-900">
                {activePlatform === "spotify" ? t("home.performance.rankings") : t("home.performance.officialMv")}
              </p>
            </div>
          </div>

          <Link
            href={activePlatform === "spotify" ? "/charts?platform=spotify" : "/charts?platform=youtube"}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105",
              activePlatform === "spotify"
                ? "border-sky-100 bg-sky-50 text-sky-600"
                : "border-pink-100 bg-pink-50 text-pink-600"
            )}
          >
            {activePlatform === "spotify" ? t("home.performance.fullCharts") : t("home.performance.insights")}
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
              {activePlatform === "spotify" ? t("home.performance.dailyGlobal") : t("home.performance.dailyViews")}
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
            href={activePlatform === "spotify" ? "/charts?platform=spotify" : "/charts?platform=youtube"}
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
    </section>
  )
}