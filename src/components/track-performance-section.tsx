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

      {/* Total — ẩn dưới lg */}
      <div className="hidden text-right font-mono text-[13px] font-bold tabular-nums text-slate-950 lg:block">
        {mounted ? (item.total?.toLocaleString("en-US") ?? "0") : "—"}
      </div>

      {/* Daily — ẩn dưới md */}
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
      ? "bg-[#EFF7FF] border-[#A2D2FF] text-[#1a6ea8]"
      : "bg-[#FFF0F5] border-[#FFC2D1] text-[#cc4d72]"

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-bold uppercase tracking-widest transition-all",
        active
          ? activeStyles
          : "border-slate-100 bg-white text-slate-400 hover:border-[#FFC2D1] hover:bg-[#FFF8FB] hover:text-slate-600"
      )}
    >
      {children}
    </button>
  )
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export function TrackPerformanceSection({ snapshot }: TrackPerformanceSectionProps) {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)
  const [activePlatform, setActivePlatform] = useState<PlatformTab>("spotify")

  useEffect(() => {
    setMounted(true)
  }, [])

  const spotify = snapshot.spotify
  const youtube = snapshot.youtube

  const formattedUpdatedAt = mounted
    ? new Date(snapshot.updatedAt).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "..."

  const activePlatformData = activePlatform === "spotify" ? spotify : youtube

  return (
    <section id="performance" className="reveal-up py-10">
      <div className="mx-auto max-w-7xl px-4">

        {/* Section header */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-full border border-[#FFC2D1] bg-[#FFF0F5] px-3 py-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF99AC]" />
                <Activity className="size-3.5 text-[#FF99AC]" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#FF99AC]">
                  {t("performance.label")}
                </p>
              </div>
            </div>
            <h2 className="text-4xl font-black uppercase text-slate-900 sm:text-5xl lg:text-6xl">
              Live <span className="text-gradient">Analytics</span>
            </h2>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-white px-4 py-2 text-slate-400 self-start md:self-auto">
            <Clock className="size-3.5" />
            <p className="text-[10px] font-black uppercase tracking-widest">
              Updated: <span className="text-slate-700">{formattedUpdatedAt}</span>
            </p>
          </div>
        </div>

        {/* Platform controls */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <PlatformTabButton
              variant="spotify"
              active={activePlatform === "spotify"}
              onClick={() => setActivePlatform("spotify")}
            >
              <img src="/spotify.png" alt="Spotify" className="h-4 w-4 object-contain" />
              Spotify
            </PlatformTabButton>
            <PlatformTabButton
              variant="youtube"
              active={activePlatform === "youtube"}
              onClick={() => setActivePlatform("youtube")}
            >
              <img src="/Youtube.png" alt="YouTube" className="h-4 w-4 object-contain" />
              YouTube
            </PlatformTabButton>
          </div>
        </div>

        {/* Main card */}
        <div
          className={cn(
            "rounded-[2.5rem] border bg-white p-6 lg:p-10",
            activePlatform === "spotify" ? "border-[#A2D2FF]/60" : "border-[#FFC2D1]/60"
          )}
        >
          {/* Card header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-50",
                  activePlatform === "spotify" ? "text-[#1ed760]" : "text-[#ff0000]"
                )}
              >
                {activePlatform === "spotify" ? (
                  <img src="/spotify.png" alt="Spotify" className="h-8 w-8 object-contain" />
                ) : (
                  <img src="/Youtube.png" alt="YouTube" className="h-8 w-8 object-contain" />
                )}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                  {activePlatform === "spotify" ? "Spotify" : "YouTube"}
                </p>
                <p className="text-[15px] font-black uppercase tracking-tight text-slate-800">
                  {activePlatform === "spotify" ? "Spotify Rankings" : "Official MV Rankings"}
                </p>
              </div>
            </div>

            <Link
              href={activePlatform === "spotify" ? "/charts?platform=spotify" : "/charts?platform=youtube"}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all hover:opacity-80",
                activePlatform === "spotify"
                  ? "border-[#A2D2FF] text-[#4A90E2]"
                  : "border-[#FFC2D1] text-[#FF708A]"
              )}
            >
              {activePlatform === "spotify" ? "Full Charts" : "Video Insights"}
              <ExternalLink className="size-3" />
            </Link>
          </div>

          {/* Stats row */}
          <div className="mb-8 grid grid-cols-2 gap-4 rounded-2xl border border-slate-50 bg-slate-50/50 p-5 sm:grid-cols-3">
            <div className="overflow-hidden">
              <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                {activePlatform === "spotify"
                  ? t("performance.totalStreams")
                  : t("performance.totalViews")}
              </p>
              <div className="flex items-center gap-2">
                <div className="truncate text-2xl font-black tracking-tighter text-slate-900">
                  {mounted ? (activePlatformData?.totalValue?.toLocaleString("en-US") ?? "0") : "..."}
                </div>
                <MetricBadge
                  value={activePlatformData?.dailyChange ?? null}
                  format={activePlatformData?.dailyChangeFormat}
                />
              </div>
            </div>

            <div
              className={cn(
                "overflow-hidden border-l pl-4",
                activePlatform === "spotify" ? "border-[#A2D2FF]/40" : "border-[#FFC2D1]/40"
              )}
            >
              <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                {activePlatform === "spotify" ? "Daily Global" : "Daily Views"}
              </p>
              <div
                className={cn(
                  "truncate text-2xl font-black tracking-tighter",
                  activePlatform === "spotify" ? "text-sky-500" : "text-pink-500"
                )}
              >
                {mounted
                  ? activePlatformData?.dailyValue
                    ? `+${activePlatformData.dailyValue.toLocaleString("en-US")}`
                    : "N/A"
                  : "..."}
              </div>
            </div>

            <div className="hidden overflow-hidden border-l border-slate-100 pl-4 sm:block">
              <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Top track
              </p>
              <div className="truncate text-[15px] font-black text-slate-800">
                {activePlatformData?.items?.[0]?.title ?? "—"}
              </div>
            </div>
          </div>

          {/* Track table header */}
          <div
            className="mb-1 grid items-center px-4 py-2"
            style={{ gridTemplateColumns: "48px 1fr 140px 120px 100px" }}
          >
            <div className="text-center text-[10px] font-black uppercase tracking-widest text-[#FFAAC0]">#</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#FFAAC0]">Track</div>
            <div className="hidden text-right text-[10px] font-black uppercase tracking-widest text-[#FFAAC0] lg:block">
              Total
            </div>
            <div className="hidden text-right text-[10px] font-black uppercase tracking-widest text-[#FFAAC0] md:block">
              Daily
            </div>
            <div className="text-right text-[10px] font-black uppercase tracking-widest text-[#FFAAC0]">
              Change
            </div>
          </div>

          {/* Track rows */}
          <div
            className={cn(
              "overflow-hidden rounded-2xl border",
              activePlatform === "spotify" ? "border-[#A2D2FF]/40" : "border-[#FFC2D1]/40"
            )}
          >
            {activePlatformData?.items && activePlatformData.items.length > 0 ? (
              activePlatformData.items.slice(0, 5).map((track, i) => (
                <PerformanceItemRow key={track.id} item={track} index={i} />
              ))
            ) : (
              <div className="py-12 text-center text-sm italic text-slate-400">
                {t("performance.empty")}
              </div>
            )}
          </div>

          {/* View all link */}
          <div className="mt-4 text-center">
            <Link
              href={activePlatform === "spotify" ? "/charts?platform=spotify" : "/charts?platform=youtube"}
              className={cn(
                "inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest transition-colors hover:opacity-80",
                activePlatform === "spotify" ? "text-[#4A90E2]" : "text-[#FF708A]"
              )}
            >
              View all tracks
              <ExternalLink className="size-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}