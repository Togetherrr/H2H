"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TrackPerformanceSnapshot, PerformanceItem } from "@/lib/track-performance"
import { t } from "@/i18n/translations"

const PLATFORM_COLORS = {
  spotify: {
    daily: "text-[#1DB954]",
    change: {
      pos: "bg-[#1DB954]/20 text-[#1DB954]",
      neg: "bg-rose-500/20 text-rose-400",
    },
  },
  youtube: {
    daily: "text-[#FF0000]",
    change: {
      pos: "bg-[#FF0000]/20 text-[#FF4444]",
      neg: "bg-rose-500/20 text-rose-400",
    },
  },
} as const

function ChartsPlatformTabs({
  activePlatform,
  onChange,
}: {
  activePlatform: "spotify" | "youtube"
  onChange: (platform: "spotify" | "youtube") => void
}) {
  const tabBase =
    "inline-flex items-center gap-2 rounded-full border px-5 py-3 text-[11px] font-black uppercase tracking-widest transition-all"

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => onChange("spotify")}
        className={cn(
          tabBase,
          activePlatform === "spotify"
            ? "border-[#1DB954]/25 bg-[#1DB954]/10 text-[#1DB954] shadow-sm"
            : "border-white/60 bg-white/40 text-slate-500 hover:bg-white/70"
        )}
      >
        <Image src="/spotify.png" alt="Spotify" width={16} height={16} className="h-4 w-4 object-cover" />
        Spotify
      </button>
      <button
        type="button"
        onClick={() => onChange("youtube")}
        className={cn(
          tabBase,
          activePlatform === "youtube"
            ? "border-[#FF4444]/25 bg-[#FF4444]/10 text-[#FF4444] shadow-sm"
            : "border-white/60 bg-white/40 text-slate-500 hover:bg-white/70"
        )}
      >
        <Image src="/Youtube.png" alt="YouTube" width={16} height={16} className="h-4 w-4 object-contain" />
        YouTube
      </button>
    </div>
  )
}

function MetricCard({
  label,
  value,
  change,
  platform,
}: {
  label: string
  value: number | null
  change?: number
  platform: "spotify" | "youtube"
}) {
  return (
    <div className="group flex min-h-[160px] w-full min-w-[240px] flex-1 flex-col justify-between overflow-hidden rounded-[2rem] border border-white/70 bg-white/60 p-5 shadow-lg backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white/75 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl shadow-md border group-hover:scale-110 transition-transform overflow-hidden",
            platform === "spotify" ? "bg-black border-black" : "bg-white border-white/60"
          )}>
            {platform === "spotify" ? (
              <Image src="/spotify.png" alt="Spotify" width={48} height={48} className="h-full w-full object-cover" />
            ) : (
              <Image src="/Youtube.png" alt="YouTube" width={24} height={24} className="h-6 w-6 object-contain" />
            )}
          </div>
          <span className="text-[12px] font-black uppercase tracking-[0.22em] text-black/50">{label}</span>
        </div>
        {change !== undefined && (
          <div className={cn(
            "rounded-full px-3 py-1 text-[13px] font-black tabular-nums shadow-sm border",
            platform === "spotify"
              ? "bg-[#1DB954]/10 text-[#1DB954] border-[#1DB954]/20"
              : "bg-[#FF4444]/10 text-[#FF4444] border-[#FF4444]/20"
          )}>
            +{change.toLocaleString("en-US")}
          </div>
        )}
      </div>
      <div className="mt-5 min-w-0 text-[clamp(2.1rem,3.8vw,3.6rem)] font-black leading-none tracking-tight tabular-nums text-black drop-shadow-sm">
        {value?.toLocaleString("en-US") ?? "—"}
      </div>
    </div>
  )
}

function TableHeader({ platform }: { platform: "spotify" | "youtube" }) {
  return (
    <div className="mb-2 grid items-center rounded-[1.6rem] border border-white/60 bg-white/45 px-5 py-3 shadow-sm md:px-6 grid-cols-[48px_1fr_100px] lg:grid-cols-[52px_1.4fr_170px_170px_170px]">
      <div className={cn("text-center text-[10px] font-black uppercase tracking-[0.28em]", platform === "spotify" ? "text-[#1DB954]" : "text-[#FF4444]")}>#</div>
      <div className={cn("flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.28em]", platform === "spotify" ? "text-[#1DB954]" : "text-[#FF4444]")}>
        <div aria-hidden="true" className="h-[42px] w-[42px] shrink-0 rounded-[10px] border border-transparent opacity-0" />
        <span>{t("charts.trackInfo").split(" ")[0]}</span>
      </div>
      <div className={cn("pl-1 text-left text-[10px] font-black uppercase tracking-[0.28em] max-lg:hidden", platform === "spotify" ? "text-[#1DB954]" : "text-[#FF4444]")}>
        {t("charts.total")}
      </div>
      <div className={cn("pl-1 text-left text-[10px] font-black uppercase tracking-[0.28em] max-lg:hidden", platform === "spotify" ? "text-[#1DB954]" : "text-[#FF4444]")}>
        {t("charts.daily")}
      </div>
      <div className={cn("pl-1 text-left text-[10px] font-black uppercase tracking-[0.28em]", platform === "spotify" ? "text-[#1DB954]" : "text-[#FF4444]")}>
        {t("charts.trend")}
      </div>
    </div>
  )
}

function FullChartsItemRow({
  item,
  index,
  platform = "spotify",
}: {
  item: PerformanceItem
  index: number
  platform?: "spotify" | "youtube"
}) {
  const colors = PLATFORM_COLORS[platform]
  const hasDailyChange = item.dailyChange !== null
  const isChangePositive = (item.dailyChange ?? 0) >= 0
  const Icon = isChangePositive ? TrendingUp : TrendingDown
  const changeDisplay = !hasDailyChange
    ? null
    : item.dailyChangeFormat === "percent"
      ? `${isChangePositive ? "+" : ""}${(item.dailyChange ?? 0).toFixed(2)}%`
      : `${isChangePositive ? "+" : ""}${(item.dailyChange ?? 0).toLocaleString("en-US")}`

  return (
    <a
      href={item.href || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="group/row grid min-h-[74px] items-center gap-4 border-b border-black/5 px-5 py-4 transition-colors hover:bg-black/[0.03] even:bg-white/20 last:border-b-0 md:px-6 grid-cols-[48px_1fr_100px] lg:grid-cols-[52px_1.4fr_170px_170px_170px]"
    >
      <div className="justify-self-center text-center">
        <span className="font-mono text-[12px] font-black tracking-wider text-black/35">
          #{String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="flex min-w-0 items-center gap-3">
        <div className="h-[42px] w-[42px] shrink-0 overflow-hidden rounded-[10px] border border-white/20">
          <Image src={item.imageUrl} alt={item.title} width={42} height={42} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-black text-black">{item.title}</p>
          <p className="truncate text-[11px] font-medium uppercase tracking-widest text-black/50">{item.subtitle}</p>
        </div>
      </div>
      <div className="pl-1 text-left font-mono text-[13px] font-bold tabular-nums text-black max-lg:hidden">
        {item.total?.toLocaleString("en-US") ?? "—"}
      </div>
      <div className="pl-1 text-left font-mono text-[14px] font-black tabular-nums text-black max-lg:hidden">
        {item.daily !== null && item.daily !== undefined ? `+${item.daily.toLocaleString("en-US")}` : "—"}
      </div>
      <div className="justify-self-center">
        {changeDisplay ? (
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black",
              isChangePositive ? colors.change.pos : colors.change.neg
            )}
          >
            <Icon className="size-3" />
            {changeDisplay}
          </div>
        ) : (
          <span className="text-[13px] font-bold text-black/30">—</span>
        )}
      </div>
    </a>
  )
}

export function ChartsPlatformSwitcher({ snapshot, initialPlatform }: { snapshot: TrackPerformanceSnapshot; initialPlatform: "spotify" | "youtube" }) {
  const router = useRouter()
  const [activePlatform, setActivePlatform] = useState<"spotify" | "youtube">(initialPlatform)

  const platformData = useMemo(
    () => ({
      spotify: snapshot.spotify,
      youtube: snapshot.youtube,
    }),
    [snapshot]
  )

  const activeData = platformData[activePlatform]

  const handleChange = (nextPlatform: "spotify" | "youtube") => {
    setActivePlatform(nextPlatform)
    router.replace(`/charts?platform=${nextPlatform}`)
    window.scrollTo(0, 0)
  }

  const sourceNote =
    activePlatform === "spotify"
      ? snapshot.sources.spotify
      : "Channel stats: Hearts2Hearts official channel"

  return (
    <div className="space-y-8">
      <ChartsPlatformTabs activePlatform={activePlatform} onChange={handleChange} />

      <div className="flex flex-wrap gap-2">
        <div className="w-fit">
          <p className={cn(
            "rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em]",
            activePlatform === "spotify"
              ? "border-emerald-200 bg-emerald-50 text-emerald-600"
              : "border-red-200 bg-red-50 text-red-500"
          )}>
            {sourceNote}
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <MetricCard
          label={activePlatform === "spotify" ? t("performance.totalStreams") : t("performance.totalViews")}
          value={activeData.totalValue}
          change={activeData.dailyChange ?? undefined}
          platform={activePlatform}
        />
        {activePlatform === "spotify" ? (
          <>
            <MetricCard label="Spotify Follower" value={snapshot.spotify.followers ?? null} platform="spotify" />
            <MetricCard label="Spotify Monthly Listener" value={snapshot.spotify.monthlyListeners ?? null} platform="spotify" />
          </>
        ) : (
          <>
            <MetricCard label="YouTube Subscriber" value={snapshot.youtube.subscribers ?? null} platform="youtube" />
            <MetricCard label="YouTube Videos" value={snapshot.youtube.videoCount ?? null} platform="youtube" />
          </>
        )}
      </div>

      <div className="px-0">
        <TableHeader platform={activePlatform} />
        <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white/70 backdrop-blur-md">
          {activeData.items.length > 0 ? (
            activeData.items.map((item, index) => (
              <FullChartsItemRow key={item.id} item={item} index={index} platform={activePlatform} />
            ))
          ) : (
            <div className="p-20 text-center text-slate-500 italic font-medium">{t("charts.empty")}</div>
          )}
        </div>
      </div>

      <div className="text-center">
        <a
          href={`/charts?platform=${activePlatform}`}
          className={cn(
            "inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all hover:scale-105",
            activePlatform === "spotify" ? "text-sky-600" : "text-pink-600"
          )}
        >
          {t("home.performance.viewAll")}
          <ExternalLink className="size-3.5" />
        </a>
      </div>
    </div>
  )
}
