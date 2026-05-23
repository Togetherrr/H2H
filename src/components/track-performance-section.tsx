"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown, Activity, ExternalLink, Globe } from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"
import { cn } from "@/lib/utils"
import type { TrackPerformanceSnapshot, PerformanceItem } from "@/lib/track-performance"

type TrackPerformanceSectionProps = {
  snapshot: TrackPerformanceSnapshot
}

const PLATFORM_COLORS = {
  spotify: {
    daily: "text-[#1DB954]",
    dailyBg: "bg-[#1DB954]/15",
    change: {
      pos: "bg-[#1DB954]/20 text-[#1DB954]",
      neg: "bg-rose-500/20 text-rose-400",
    },
  },
  youtube: {
    daily: "text-[#FF0000]",
    dailyBg: "bg-[#FF0000]/10",
    change: {
      pos: "bg-[#FF0000]/20 text-[#FF4444]",
      neg: "bg-rose-500/20 text-rose-400",
    },
  },
} as const

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
    <div className={cn(
      "flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tighter",
      isPositive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"
    )}>
      <Icon className="size-3" />
      {displayValue}
    </div>
  )
}

// ─── PerformanceItemRow ──────────────────────────────────────────────────────
export function PerformanceItemRow({
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
      className="group/row grid items-center border-b border-white/10 px-4 transition-colors hover:bg-black/[0.03] last:border-b-0 grid-cols-[48px_1fr_100px] lg:grid-cols-[48px_1fr_160px_180px_150px]"
      style={{ minHeight: "72px" }}
    >
      {/* Rank */}
      <div className="text-center">
        <span className="text-[12px] font-black text-black/40">
          #{String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Track info */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="h-[42px] w-[42px] shrink-0 overflow-hidden rounded-[10px] border border-white/20">
          <Image src={item.imageUrl} alt={item.title} width={42} height={42} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-black text-black">{item.title}</p>
          <p className="truncate text-[11px] font-medium uppercase tracking-widest text-black/50">{item.subtitle}</p>
        </div>
      </div>

      {/* Total */}
      <div className="text-right font-mono text-[13px] font-bold tabular-nums text-black max-lg:hidden" suppressHydrationWarning>
        {item.total?.toLocaleString("en-US") ?? "—"}
      </div>

      {/* Daily */}
      <div className="text-right font-mono text-[14px] font-black tabular-nums text-black max-lg:hidden" suppressHydrationWarning>
        {item.daily !== null ? `+${item.daily.toLocaleString("en-US")}` : "—"}
      </div>

      {/* Change badge */}
      <div className="flex justify-end">
        {changeDisplay ? (
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black",
              isChangePositive ? colors.change.pos : colors.change.neg
            )}
            suppressHydrationWarning
          >
            {isChangePositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {changeDisplay}
          </div>
        ) : (
          <span className="text-[13px] font-bold text-black/30">—</span>
        )}
      </div>
    </a>
  )
}

// ─── Platform tab button ─────────────────────────────────────────────────────
type PlatformTab = "spotify" | "youtube" | "korea" | "global" | "apple"

function PlatformTabButton({
  active, onClick, children, variant,
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
    global: "bg-cyan-50 border-cyan-200 text-cyan-700 shadow-sm",
    apple: "bg-rose-50 border-rose-200 text-rose-700 shadow-sm",
  }
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-2xl border px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-all",
        active ? variantStyles[variant] : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50"
      )}
    >
      {children}
    </button>
  )
}

function GlobalMark({ className = "" }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center rounded-lg bg-cyan-500 text-white shadow-md", className)}>
      <Globe className="size-3.5" />
    </div>
  )
}

// ─── Korea Chart Group ──────────────────────────────────────────────────────
function KoreaChartGroup({ platform, icon, color, links, centerLinks = false }: {
  platform: string
  icon: string
  color: string
  links: { label: string; url: string }[]
  centerLinks?: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100">
        <div className={cn("flex size-8 items-center justify-center rounded-lg text-sm font-black text-white shadow-md", color)}>
          {icon}
        </div>
        <span className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-800">{platform}</span>
      </div>
      <div className={cn("grid gap-2", centerLinks ? "pl-0" : "pl-2")}>
        {links.map((link) => (
          <a
            key={`${link.url}-${link.label}`}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group relative flex items-center rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:translate-x-1 hover:bg-slate-50 hover:shadow-md",
              centerLinks ? "justify-center px-6 pr-12 text-center" : "justify-between"
            )}
          >
            <div className={cn("flex items-center gap-3", centerLinks && "justify-center")}>
              <div className={cn("size-1.5 rounded-full", color)} />
              <span className="text-[13px] font-bold text-slate-700 transition-colors group-hover:text-slate-900">
                {link.label}
              </span>
            </div>
            <ExternalLink className={cn(
              "size-3.5 text-slate-300 transition-colors group-hover:text-slate-500",
              centerLinks ? "absolute right-4 top-1/2 -translate-y-1/2" : ""
            )} />
          </a>
        ))}
      </div>
    </div>
  )
}

// ─── Platform Stats Bar ──────────────────────────────────────────────────────
function PlatformStatsBar({
  platform, totalValue, dailyValue, dailyChange, dailyChangeFormat, t,
}: {
  platform: "spotify" | "youtube"
  totalValue: number | null
  dailyValue: number | null
  dailyChange: number | null
  dailyChangeFormat?: "number" | "percent"
  // ✅ Xóa mounted prop
  t: (key: string) => string
}) {
  const colors = PLATFORM_COLORS[platform]
  const isChangePositive = (dailyChange ?? 0) >= 0
  const ChangeIcon = isChangePositive ? TrendingUp : TrendingDown
  const changeDisplay =
    dailyChange === null
      ? "—"
      : dailyChangeFormat === "percent"
        ? `${isChangePositive ? "+" : ""}${dailyChange.toFixed(2)}%`
        : `${isChangePositive ? "+" : ""}${dailyChange.toLocaleString("en-US")}`

  return (
    <div className="mb-10 grid grid-cols-2 gap-0 rounded-[2rem] border border-white bg-white overflow-hidden sm:grid-cols-3">
      {/* TOTAL */}
      <div className="p-6">
        <p className="mb-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-black/50">
          {platform === "spotify" ? t("performance.totalStreams") : t("performance.totalViews")}
        </p>
        <div className="truncate text-2xl font-black tracking-tighter text-black" suppressHydrationWarning>
          {totalValue?.toLocaleString("en-US") ?? "—"}
        </div>
      </div>

      {/* DAILY */}
      <div className="border-l border-black/10 p-6">
        <p className={cn("mb-1.5 text-[9px] font-black uppercase tracking-[0.2em]", colors.daily)}>
          {platform === "youtube" ? t("home.performance.dailyViews") : t("home.performance.dailyGlobal")}
        </p>
        <div className="truncate text-2xl font-black tracking-tighter text-black" suppressHydrationWarning>
          {dailyValue !== null ? `+${dailyValue.toLocaleString("en-US")}` : "—"}
        </div>
      </div>

      {/* CHANGE */}
      <div className="border-l border-black/10 p-6 col-span-2 sm:col-span-1">
        <p className={cn("mb-1.5 text-[9px] font-black uppercase tracking-[0.2em]", colors.daily)}>
          {t("performance.dailyChange")}
        </p>
        <div className="flex items-center gap-2 text-2xl font-black tracking-tighter text-black" suppressHydrationWarning>
          <ChangeIcon className={cn("size-5", isChangePositive ? colors.daily : "text-rose-400")} />
          {changeDisplay}
        </div>
      </div>
    </div>
  )
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export function TrackPerformanceSection({ snapshot }: TrackPerformanceSectionProps) {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)
  const [liveSnapshot, setLiveSnapshot] = useState(snapshot)
  const [activePlatform, setActivePlatform] = useState<PlatformTab>("spotify")
  const [koreaPage, setKoreaPage] = useState(1)

  useEffect(() => {
    setLiveSnapshot(snapshot)
  }, [snapshot])

  // Fetching data on client is redundant since we have snapshot from SSR/ISR
  useEffect(() => {
    setMounted(true)
  }, [])

  // ✅ Bỏ check mounted — hiện ngay từ SSR data
  const updatedAtDate = liveSnapshot.updatedAt ? new Date(liveSnapshot.updatedAt) : null
  const formattedUpdatedAt = updatedAtDate && !Number.isNaN(updatedAtDate.getTime())
    ? updatedAtDate.toLocaleDateString("en-US", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : null

  const activePlatformData =
    activePlatform === "korea" || activePlatform === "global" || activePlatform === "apple" ? null : liveSnapshot[activePlatform as "spotify" | "youtube"]

  const activePlatformAccent =
    activePlatform === "spotify"
      ? "text-[#1DB954]"
      : activePlatform === "youtube"
        ? "text-[#FF4444]"
        : activePlatform === "global"
          ? "text-cyan-600"
          : activePlatform === "apple"
            ? "text-rose-600"
            : "text-[#FF708A]"

  const activePlatformCard =
    activePlatform === "spotify"
      ? {
          icon: <Image src="/spotify.png" alt="Spotify" width={56} height={56} className="h-full w-full object-cover" />,
          iconWrap: "bg-black border-black",
        }
      : activePlatform === "youtube"
        ? {
            icon: <Image src="/Youtube.png" alt="YouTube" width={36} height={36} className="h-9 w-9 object-contain" />,
            iconWrap: "bg-white border-white/20",
          }
        : activePlatform === "global"
          ? {
              icon: <GlobalMark className="size-14" />,
              iconWrap: "border-transparent bg-transparent shadow-none",
            }
          : activePlatform === "apple"
            ? {
                icon: <Image src="/AM.png" alt="Apple Music" width={56} height={56} className="h-full w-full object-cover" />,
                iconWrap: "bg-white border-rose-100",
              }
          : {
              icon: <Activity className="size-8" />,
              iconWrap: "bg-white border-white/20",
            }

  const koreaChartGroups = [
    {
      platform: "Melon", icon: "M", color: "bg-emerald-500 shadow-emerald-200",
      links: [
        { label: "Melon", url: "https://www.melon.com/index.htm" },
        { label: "Melon, Hearts2Hearts", url: "https://www.melon.com/artist/timeline.htm?artistId=4096106" },
        { label: "Melon Top100", url: "https://www.melon.com/chart/index.htm" },
        { label: "Melon Hot100", url: "https://www.melon.com/chart/hot100/index.htm" },
        { label: "Melon Daily", url: "https://www.melon.com/chart/day/index.htm" },
        { label: "Melon Weekly", url: "https://www.melon.com/chart/week/index.htm" },
      ], page: 1,
    },
    {
      platform: "Genie", icon: "G", color: "bg-blue-500 shadow-blue-200",
      links: [
        { label: "Genie", url: "https://www.genie.co.kr/" },
        { label: "Genie Realtime", url: "https://www.genie.co.kr/chart/top200" },
        { label: "Genie Daily", url: "https://www.genie.co.kr/chart/top200?ditc=D&rtm=N" },
        { label: "Genie weekly", url: "https://www.genie.co.kr/chart/top200?ditc=W&rtm=N" },
        { label: "Genie Hearts2Hearts", url: "https://www.genie.co.kr/search/searchMain?query=hearts2hearts" },
      ], page: 1,
    },
    {
      platform: "Bugs", icon: "B", color: "bg-rose-500 shadow-rose-200",
      links: [
        { label: "Bugs", url: "https://music.bugs.co.kr/" },
        { label: "Bugs Realtime", url: "https://music.bugs.co.kr/chart" },
        { label: "Bugs Daily", url: "https://music.bugs.co.kr/chart/track/day/total" },
        { label: "Bugs Weekly", url: "https://music.bugs.co.kr/chart/track/week/total" },
        { label: "Bugs hearts2Hearts", url: "https://music.bugs.co.kr/search/integrated?q=hearts2hearts" },
      ], page: 1,
    },
    {
      platform: "Vibe", icon: "V", color: "bg-slate-800 shadow-slate-200",
      links: [
        { label: "Vibe", url: "https://vibe.naver.com/today" },
        { label: "Vibe Hearts2Hearts", url: "https://vibe.naver.com/search?query=Hearts2Hearts" },
      ], page: 1,
    },
    {
      platform: "Flo", icon: "F", color: "bg-sky-400 shadow-sky-100",
      links: [
        { label: "Flo", url: "https://www.music-flo.com/" },
        { label: "Flo hearts2Hearts", url: "https://www.music-flo.com/search/all?keyword=Hearts2hearts" },
      ], page: 2,
    },
    {
      platform: "Circle", icon: "C", color: "bg-orange-500 shadow-orange-100",
      links: [
        { label: "Circle Chart", url: "https://circlechart.kr/" },
        { label: "Circle Global K-POP Chart", url: "https://circlechart.kr/page_chart/global.circle?termGbn=day" },
        { label: "Circle Digital Chart", url: "https://circlechart.kr/page_chart/onoff.circle?serviceGbn=ALL" },
        { label: "Circle Album Chart", url: "https://circlechart.kr/page_chart/album.circle" },
      ], page: 2,
    },
    {
      platform: "Hanteo", icon: "H", color: "bg-blue-600 shadow-blue-100",
      links: [
        { label: "Hanteo Chart", url: "https://www.hanteochart.com/" },
        { label: "Hanteo Album Chart", url: "https://www.hanteochart.com/chart/album/real" },
        { label: "Hanteo Hearts2Hearts", url: "https://www.hanteochart.com/artistdetail/73802/real" },
      ], page: 2,
    },
  ]

  const globalChartGroups = [
    {
      platform: "Major Charts",
      icon: "G",
      color: "bg-cyan-500 shadow-cyan-200",
      links: [
        { label: "TME Chart", url: "https://yobang.tencentmusic.com/chart/korean-chart/rankList/" },
        { label: "Billboard", url: "https://www.billboard.com/" },
      ],
    },
    {
      platform: "Billboard Charts",
      icon: "B",
      color: "bg-cyan-500 shadow-cyan-200",
      links: [
        { label: "Billboard Hot 100", url: "https://www.billboard.com/charts/hot-100/" },
        { label: "Billboard 200", url: "https://www.billboard.com/charts/billboard-200/" },
        { label: "Billboard Global Excl. US", url: "https://www.billboard.com/charts/billboard-global-excl-us/" },
      ],
    },
    {
      platform: "Sales & Regional",
      icon: "R",
      color: "bg-cyan-500 shadow-cyan-200",
      links: [
        { label: "Billboard Top Album Sales", url: "https://www.billboard.com/charts/top-album-sales/" },
        { label: "Oricon Chart", url: "https://www.oricon.co.jp/rank/" },
      ],
    },
  ]

  const appleMusicGroups = [
    {
      platform: "Apple Music",
      icon: "AM",
      color: "bg-rose-500 shadow-rose-200",
      links: [
        { label: "Apple Music Korea Top Songs", url: "https://music.apple.com/kr/new/top-charts/songs" },
        { label: "Apple Music Charts", url: "https://music.apple.com/ca/new/top-charts" },
        { label: "Apple Music Global Top Song", url: "https://music.apple.com/us/playlist/top-100-global/pl.d25f5d1181894928af76c85c967f8f31" },
      ],
    },
  ]

  const displayedKoreaGroups = koreaChartGroups.filter(g => g.page === koreaPage)

  return (
    <section id="performance" className="reveal-up py-16 select-none relative overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="card-premium shimmer-border p-6 md:p-10 relative overflow-hidden">
          {/* Background blobs - Standardized */}
          <div className="absolute top-0 right-0 size-96 bg-pink-200/20 blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 size-96 bg-sky-200/20 blur-[100px] rounded-full -ml-20 -mb-20 pointer-events-none" />

          <div className="relative z-10">
            {/* Section header */}
            <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="pill-base border border-pink-200 bg-white/70 backdrop-blur-sm shadow-sm">
                    <Activity className="size-3.5 text-pink-500 fill-pink-500" />
                    <p className="text-pink-600 font-black uppercase tracking-widest text-[10px]">
                      {t("performance.label")}
                    </p>
                  </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-slate-900">
                  {t("home.performance.liveTracking").trim()}
                </h2>
                {formattedUpdatedAt ? (
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400" suppressHydrationWarning>
                    {t("performance.updatedAt")} {formattedUpdatedAt}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Platform Tabs */}
            <div className="mb-8 flex flex-wrap gap-3">
              <PlatformTabButton variant="spotify" active={activePlatform === "spotify"} onClick={() => setActivePlatform("spotify")}>
                <div className="flex size-4 items-center justify-center rounded-sm bg-black overflow-hidden shrink-0">
                  <Image src="/spotify.png" alt="Spotify" width={16} height={16} className="h-full w-full object-cover" />
                </div>
                {t("performance.spotify")}
              </PlatformTabButton>
              <PlatformTabButton variant="youtube" active={activePlatform === "youtube"} onClick={() => setActivePlatform("youtube")}>
                <Image src="/Youtube.png" alt="YouTube" width={16} height={16} className="h-4 w-4 object-contain" />
                {t("performance.youtube")}
              </PlatformTabButton>
              <PlatformTabButton variant="korea" active={activePlatform === "korea"} onClick={() => setActivePlatform("korea")}>
                <div className="flex size-4 items-center justify-center rounded-sm bg-emerald-500 text-[8px] font-bold text-white">KR</div>
                {t("performance.korea")}
              </PlatformTabButton>
              <PlatformTabButton variant="global" active={activePlatform === "global"} onClick={() => setActivePlatform("global") }>
                <GlobalMark className="size-4 shrink-0" />
                {t("performance.global")}
              </PlatformTabButton>
              <PlatformTabButton variant="apple" active={activePlatform === "apple"} onClick={() => setActivePlatform("apple") }>
                <div className="flex size-4 items-center justify-center overflow-hidden rounded-sm bg-white shrink-0">
                  <Image src="/AM.png" alt="Apple Music" width={16} height={16} className="h-full w-full object-cover" />
                </div>
                {t("performance.apple")}
              </PlatformTabButton>
            </div>

            {/* Main Content */}
            {activePlatform === "korea" ? (
              <div className="rounded-[2.5rem] bg-white/40 backdrop-blur-xl p-6 lg:p-10 border border-white/70 shadow-lg">
                <div className="mb-10 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#FF708A] shadow-xl border border-white/20">
                      <Activity className="size-8" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-black">{t("performance.korea")}</p>
                      <p className="text-2xl font-black uppercase tracking-tight text-black">Domestic Charts</p>
                    </div>
                  </div>
                </div>
                <p className="mb-10 max-w-2xl text-[14px] font-medium leading-relaxed text-black/70">
                  {t("performance.korea.desc")}
                </p>
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                  {displayedKoreaGroups.map((group, idx) => (
                    <KoreaChartGroup key={idx} {...group} />
                  ))}
                </div>
                <div className="mt-12 flex items-center justify-center gap-4">
                  {[1, 2].map((page) => (
                    <button
                      key={page}
                      onClick={() => setKoreaPage(page)}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full text-xs font-black transition-all shadow-sm",
                        koreaPage === page
                          ? "bg-emerald-500 text-white scale-110 shadow-emerald-200"
                          : "bg-white text-slate-400 hover:bg-slate-50 border border-slate-100"
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            ) : activePlatform === "global" ? (
              <div className="mx-auto w-full max-w-4xl rounded-[2.5rem] border border-white/70 bg-white/40 p-6 shadow-lg backdrop-blur-xl lg:p-10">
                <div className="mb-10 flex flex-col items-center gap-5 text-center">
                  <div className="flex items-center gap-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500 text-white shadow-xl border border-cyan-100">
                      <Globe className="size-8" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-black">{t("performance.global")}</p>
                      <p className="text-2xl font-black uppercase tracking-tight text-black">Global Charts</p>
                    </div>
                  </div>
                </div>
                <p className="mx-auto mb-10 max-w-2xl text-center text-[14px] font-medium leading-relaxed text-black/70">
                  {t("performance.global.desc")}
                </p>
                <div className="flex flex-wrap justify-center gap-10">
                  {globalChartGroups.map((group, idx) => (
                    <div key={idx} className="w-full max-w-[260px] flex-none">
                      <KoreaChartGroup {...group} />
                    </div>
                  ))}
                </div>
              </div>
            ) : activePlatform === "apple" ? (
              <div className="mx-auto w-full max-w-4xl rounded-[2.5rem] border border-white/70 bg-white/40 p-6 shadow-lg backdrop-blur-xl lg:p-10">
                <div className="mb-10 flex flex-col items-center gap-5 text-center">
                  <div className="flex items-center gap-5">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-xl">
                      <Image src="/AM.png" alt="Apple Music" width={56} height={56} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-black">{t("performance.apple")}</p>
                      <p className="text-2xl font-black uppercase tracking-tight text-black">Apple Music Charts</p>
                    </div>
                  </div>
                </div>
                <p className="mx-auto mb-10 max-w-2xl text-center text-[14px] font-medium leading-relaxed text-black/70">
                  {t("performance.apple.desc")}
                </p>
                <div className="flex flex-wrap justify-center gap-10">
                  {appleMusicGroups.map((group, idx) => (
                    <div key={idx} className="w-full max-w-[260px] flex-none">
                      <KoreaChartGroup {...group} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                {/* Platform Header inside Content area */}
                <div className="flex items-center gap-5 px-2">
                  <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl shadow-xl border overflow-hidden shrink-0", activePlatformCard.iconWrap)}>
                    {activePlatformCard.icon}
                  </div>
                  <div>
                    <p className={cn("text-xl font-black uppercase tracking-[0.3em]", activePlatformAccent)}>
                      {t(`performance.${activePlatform}` as any)}
                    </p>
                    <p className={cn("text-4xl font-black uppercase tracking-tight", activePlatformAccent)}>
                      {activePlatform === "youtube" ? t("home.performance.officialMv") : t("home.performance.rankings")}
                    </p>
                  </div>
                </div>

                {/* Stats bar */}
                {activePlatformData && (
                  <div className="px-2">
                    <PlatformStatsBar
                      platform={activePlatform as "spotify" | "youtube"}
                      totalValue={activePlatformData.totalValue}
                      dailyValue={activePlatformData.dailyValue}
                      dailyChange={activePlatformData.dailyChange}
                      dailyChangeFormat={activePlatformData.dailyChangeFormat}
                      t={t}
                    />
                    {activePlatformData.note && (
                      <p className="mb-6 -mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 text-right px-1">
                        {activePlatformData.note}
                      </p>
                    )}
                  </div>
                )}

                {/* Track table */}
                <div>
                  <div className="mb-2 grid items-center px-6 py-3 grid-cols-[48px_1fr_100px] lg:grid-cols-[48px_1fr_160px_180px_150px]">
                    <div className={cn("text-center text-[13px] font-black uppercase tracking-widest", activePlatformAccent)}>#</div>
                    <div className={cn("text-[13px] font-black uppercase tracking-widest", activePlatformAccent)}>
                      {t("charts.trackInfo").split(" ")[0]}
                    </div>
                    <div className={cn("text-right text-[13px] font-black uppercase tracking-widest max-lg:hidden", activePlatformAccent)}>
                      {t("charts.total")}
                    </div>
                    <div className={cn("text-right text-[13px] font-black uppercase tracking-widest max-lg:hidden", activePlatformAccent)}>
                      {t("charts.daily")}
                    </div>
                    <div className={cn("text-right text-[13px] font-black uppercase tracking-widest", activePlatformAccent)}>
                      {t("charts.trend")}
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/50 backdrop-blur-xl shadow-lg">
                    {activePlatformData?.items && activePlatformData.items.length > 0 ? (
                      activePlatformData.items.slice(0, 5).map((item, index) => (
                        <PerformanceItemRow
                          key={`${item.id}-${item.href ?? ""}-${index}`}
                          item={item}
                          index={index}
                          platform={activePlatform as "spotify" | "youtube"}
                        />
                      ))
                    ) : (
                      <div className="py-16 text-center text-sm italic text-slate-400">
                        {t("performance.empty")}
                      </div>
                    )}
                  </div>
                </div>

                {/* View all */}
                <div className="mt-8 text-center">
                  <Link
                    href={`/charts?platform=${activePlatform}`}
                    className={cn(
                      "inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all hover:scale-105",
                      activePlatform === "spotify" ? "text-sky-600" : "text-pink-600"
                    )}
                  >
                    {t("home.performance.viewAll")}
                    <ExternalLink className="size-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}