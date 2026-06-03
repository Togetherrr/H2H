
export const revalidate = 60
import { Music2, Youtube, ArrowLeft, TrendingUp, TrendingDown, Clock, Activity, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getRealtimeSnapshotFromDb } from "@/lib/realtime/db-snapshot"
import { Navbar } from "@/components/navbar"
import { cn } from "@/lib/utils"
import type { PerformanceItem } from "@/lib/track-performance"
import { t } from "@/i18n/translations"

export async function generateMetadata() {
  return {
    title: `${t("charts.title")} | Hearts2Hearts`,
    description: t("charts.subtitle"),
  }
}

interface ChartsPageProps {
  searchParams: Promise<{ platform?: string }>
}

const PLATFORM_COLORS = {
  spotify: {
    daily: "text-[#1DB954]",
    dailyBg: "bg-[#1DB954]/15",
  },
  youtube: {
    daily: "text-[#FF0000]",
    dailyBg: "bg-[#FF0000]/10",
  },
} as const

const TREND_COLORS = {
  pos: "bg-emerald-100 text-emerald-700",
  neg: "bg-rose-100 text-rose-600",
} as const

function FullChartsItemRow({ item, index, platform = "spotify" }: { item: PerformanceItem; index: number; platform?: "spotify" | "youtube" }) {
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
      className="group/row grid items-center border-b border-black/5 px-4 transition-colors hover:bg-black/[0.03] last:border-b-0 grid-cols-[48px_1fr_100px] lg:grid-cols-[48px_1fr_160px_180px_150px]"
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
      <div className="text-right font-mono text-[13px] font-bold tabular-nums text-black max-lg:hidden">
        {item.total?.toLocaleString("en-US") ?? "—"}
      </div>

      {/* Daily */}
      <div className="text-right font-mono text-[14px] font-black tabular-nums text-black max-lg:hidden">
        {item.daily !== null && item.daily !== undefined
          ? `+${item.daily.toLocaleString("en-US")}`
          : "—"}
      </div>

      {/* Change badge */}
      <div className="flex justify-end">
        {changeDisplay ? (
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black",
              isChangePositive ? TREND_COLORS.pos : TREND_COLORS.neg
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

function TableHeader({ col2Label, platform, t }: { col2Label: string; platform: "spotify" | "youtube"; t: any }) {
  return (
    <div
      className="mb-2 grid items-center px-4 py-3 grid-cols-[48px_1fr_100px] lg:grid-cols-[48px_1fr_160px_180px_150px]"
    >
      <div className={cn("text-center text-[10px] font-black uppercase tracking-widest", platform === "spotify" ? "text-[#1DB954]" : "text-[#FF4444]")}>#</div>
      <div className={cn("text-[10px] font-black uppercase tracking-widest", platform === "spotify" ? "text-[#1DB954]" : "text-[#FF4444]")}>
        {col2Label.split(" ")[0]}
      </div>
      <div className={cn("text-right text-[10px] font-black uppercase tracking-widest max-lg:hidden", platform === "spotify" ? "text-[#1DB954]" : "text-[#FF4444]")}>
        {t("charts.total")}
      </div>
      <div className={cn("text-right text-[10px] font-black uppercase tracking-widest max-lg:hidden", platform === "spotify" ? "text-[#1DB954]" : "text-[#FF4444]")}>
        {t("charts.daily")}
      </div>
      <div className={cn("text-right text-[10px] font-black uppercase tracking-widest", platform === "spotify" ? "text-[#1DB954]" : "text-[#FF4444]")}>
        {t("charts.trend")}
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  change,
  platform
}: {
  label: string;
  value: number | null;
  change?: number;
  platform: "spotify" | "youtube"
}) {
  return (
    <div className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white shadow-xl flex flex-col justify-between min-w-[320px] flex-1 lg:max-w-[420px] h-[200px] group transition-all hover:scale-[1.02] hover:bg-white/60">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl shadow-md border group-hover:scale-110 transition-transform overflow-hidden",
            platform === "spotify" ? "bg-black border-black" : "bg-white border-white/60"
          )}>
            {platform === "spotify" ? (
              <Image src="/spotify.png" alt="Spotify" width={48} height={48} className="h-full w-full object-cover" />
            ) : (
              <Image src="/Youtube.png" alt="YouTube" width={24} height={24} className="h-6 w-6 object-contain" />
            )}
          </div>
          <span className="text-[12px] font-black uppercase tracking-[0.2em] text-black/50">{label}</span>
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
      <div className="text-5xl font-black text-black tracking-tighter tabular-nums mt-6 drop-shadow-sm">
        {value?.toLocaleString("en-US") ?? "—"}
      </div>
    </div>
  )
}

export default async function ChartsPage({ searchParams }: ChartsPageProps) {
  const { platform } = await searchParams

  const snapshot = await getRealtimeSnapshotFromDb()

  const activePlatforms = platform
    ? [platform]
    : ["spotify", "youtube", "korea"]

  const platformConfigs: Record<string, {
    title: string;
    icon: any;
    color: string;
    shadow: string;
    totalLabel: string;
    analyzedLabel: string;
    items: PerformanceItem[];
    totalValue: number | null;
    followers?: number | null;
    monthlyListeners?: number | null;
    subscribers?: number | null;
    videoCount?: number | null;
    dailyChange?: number | null;
  }> = {
    spotify: {
      title: t("charts.spotify.title") as string,
      icon: <Image src="/spotify.png" alt="Spotify" width={36} height={36} className="h-9 w-9 object-contain" />,
      color: "bg-white",
      shadow: "shadow-xl border border-white/20",
      totalLabel: t("performance.totalStreams") as string,
      analyzedLabel: t("charts.analyzed") as string,
      items: snapshot.spotify.items,
      totalValue: snapshot.spotify.totalValue,
      followers: snapshot.spotify.followers,
      monthlyListeners: snapshot.spotify.monthlyListeners,
      dailyChange: snapshot.spotify.dailyChange,
    },
    youtube: {
      title: t("charts.youtube.title") as string,
      icon: <Image src="/Youtube.png" alt="YouTube" width={36} height={36} className="h-9 w-9 object-contain" />,
      color: "bg-white",
      shadow: "shadow-xl border border-white/20",
      totalLabel: t("performance.totalViews") as string,
      analyzedLabel: t("charts.analyzed.video") as string,
      items: snapshot.youtube.items,
      totalValue: snapshot.youtube.totalValue,
      subscribers: snapshot.youtube.subscribers,
      videoCount: snapshot.youtube.videoCount,
      dailyChange: snapshot.youtube.dailyChange,
    },
    korea: {
      title: t("performance.korea") as string,
      icon: <Activity className="h-8 w-8" />,
      color: "bg-emerald-400",
      shadow: "shadow-emerald-100",
      totalLabel: "External Links",
      analyzedLabel: "Official Platforms",
      items: [],
      totalValue: null,
    },
  }

  return (
    <main className="min-h-screen selection:bg-[#A2D2FF]/30">
      <Navbar />
      <div className="pointer-events-none absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/70 to-transparent z-0" />
      <div className="section-shell pt-40 md:pt-44">
        {/* ── Page header ── */}
        <div className="mb-24 flex flex-col gap-12 px-4">
          <Link
            href="/home#performance"
            className="group inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/40 backdrop-blur-md px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-500 shadow-sm transition hover:bg-[#FFC2D1] hover:text-white hover:border-transparent w-fit"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {t("charts.return")}
          </Link>

          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {platform && (
                <div className={cn(
                  "flex h-20 w-20 md:h-28 md:w-28 items-center justify-center rounded-3xl md:rounded-[2.5rem] shadow-xl border shrink-0 overflow-hidden",
                  platform === "spotify" ? "bg-black border-black" : "bg-white border-white/60"
                )}>
                  {platform === "spotify" ? (
                    <Image src="/spotify.png" alt="Spotify" width={112} height={112} className="h-full w-full object-cover" />
                  ) : (
                    <div className="scale-[2] md:scale-[2.5]">
                      {platform === "youtube" ? (
                        <Image src="/Youtube.png" alt="YouTube" width={36} height={36} className="h-9 w-9 object-contain" />
                      ) : (
                        <Activity className="h-10 w-10" />
                      )}
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <h1 className={cn(
                  "font-sans text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-[0.9] drop-shadow-md transition-colors duration-500",
                  platform === "spotify" ? "text-[#1DB954]" : platform === "youtube" ? "text-[#FF0000]" : platform === "korea" ? "text-emerald-500" : "text-slate-900"
                )}>
                  {platform ? (platform === "korea" ? "SOUTH KOREA" : platformConfigs[platform].title) : "HEARTS2HEARTS"}
                </h1>
                {platform && (
                  <p className="font-sans text-xs md:text-sm font-black uppercase tracking-[0.3em] text-slate-500/80">
                    Analytics & Performance
                  </p>
                )}
              </div>
            </div>
            {snapshot.sources.note ? (
              <div className="w-fit">
                <p className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-rose-500">
                  {snapshot.sources.note}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-20">
          {activePlatforms.map((pKey) => {
            const config = platformConfigs[pKey]
            if (!config) return null

            if (pKey === "korea") {
              const koreaChartGroups = [
                {
                  platform: "Melon",
                  icon: "M",
                  color: "bg-emerald-500 shadow-emerald-200",
                  links: [
                    { label: "Melon", url: "https://www.melon.com/index.htm" },
                    { label: "Melon, Hearts2Hearts", url: "https://www.melon.com/artist/timeline.htm?artistId=4096106" },
                    { label: "Melon Top100", url: "https://www.melon.com/chart/index.htm" },
                    { label: "Melon Hot100", url: "https://www.melon.com/chart/hot100/index.htm" },
                    { label: "Melon Daily", url: "https://www.melon.com/chart/day/index.htm" },
                    { label: "Melon Weekly", url: "https://www.melon.com/chart/week/index.htm" },
                  ]
                },
                {
                  platform: "Genie",
                  icon: "G",
                  color: "bg-blue-500 shadow-blue-200",
                  links: [
                    { label: "Genie", url: "https://www.genie.co.kr/" },
                    { label: "Genie Realtime", url: "https://www.genie.co.kr/chart/top200" },
                    { label: "Genie Daily", url: "https://www.genie.co.kr/chart/top200?ditc=D&rtm=N" },
                    { label: "Genie weekly", url: "https://www.genie.co.kr/chart/top200?ditc=W&rtm=N" },
                    { label: "Genie Hearts2Hearts", url: "https://www.genie.co.kr/search/searchMain?query=hearts2hearts" },
                  ]
                },
                {
                  platform: "Bugs",
                  icon: "B",
                  color: "bg-rose-500 shadow-rose-200",
                  links: [
                    { label: "Bugs", url: "https://music.bugs.co.kr/" },
                    { label: "Bugs Realtime", url: "https://music.bugs.co.kr/chart" },
                    { label: "Bugs Daily", url: "https://music.bugs.co.kr/chart/track/day/total" },
                    { label: "Bugs Weekly", url: "https://music.bugs.co.kr/chart/track/week/total" },
                    { label: "Bugs hearts2Hearts", url: "https://music.bugs.co.kr/search/integrated?q=hearts2hearts" },
                  ]
                },
                {
                  platform: "Vibe",
                  icon: "V",
                  color: "bg-slate-800 shadow-slate-200",
                  links: [
                    { label: "Vibe", url: "https://vibe.naver.com/today" },
                    { label: "Vibe Hearts2Hearts", url: "https://vibe.naver.com/search?query=Hearts2Hearts" },
                  ]
                },
                {
                  platform: "Flo",
                  icon: "F",
                  color: "bg-sky-400 shadow-sky-100",
                  links: [
                    { label: "Flo", url: "https://www.music-flo.com/" },
                    { label: "Flo hearts2Hearts", url: "https://www.music-flo.com/search/all?keyword=Hearts2hearts" },
                  ]
                },
                {
                  platform: "Circle",
                  icon: "C",
                  color: "bg-orange-500 shadow-orange-100",
                  links: [
                    { label: "Circle Chart", url: "https://circlechart.kr/" },
                    { label: "Circle Global K-POP Chart", url: "https://circlechart.kr/page_chart/global.circle?termGbn=day" },
                    { label: "Circle Digital Chart", url: "https://circlechart.kr/page_chart/onoff.circle?serviceGbn=ALL" },
                    { label: "Circle Album Chart", url: "https://circlechart.kr/page_chart/album.circle" },
                  ]
                },
                {
                  platform: "Hanteo",
                  icon: "H",
                  color: "bg-blue-600 shadow-blue-100",
                  links: [
                    { label: "Hanteo Chart", url: "https://www.hanteochart.com/" },
                    { label: "Hanteo Album Chart", url: "https://www.hanteochart.com/chart/album/real" },
                    { label: "Hanteo Hearts2Hearts", url: "https://www.hanteochart.com/artistdetail/73802/real" },
                  ]
                }
              ]

              return (
                <section key={pKey} className="space-y-8">
                  <div className="flex items-center gap-4 px-4">
                    <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-xl", config.color, config.shadow)}>
                      {config.icon}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">{config.title}</h2>
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-500">
                        {t("performance.korea.desc")}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {koreaChartGroups.map((group, gIdx) => (
                      <div key={gIdx} className="flex flex-col gap-4">
                        <div className={cn("flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/40 border border-white shadow-sm")}>
                          <div className={cn("flex size-10 items-center justify-center rounded-xl text-lg font-black text-white shadow-md", group.color)}>
                            {group.icon}
                          </div>
                          <span className="text-sm font-black uppercase tracking-widest text-slate-900">{group.platform}</span>
                        </div>
                        <div className="grid gap-2 pl-2">
                          {group.links.map((link, lIdx) => (
                            <a
                              key={lIdx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center justify-between rounded-2xl border border-white/50 bg-white/20 p-5 transition-all hover:translate-x-1 hover:bg-white hover:shadow-xl"
                            >
                              <span className="text-[14px] font-bold text-slate-700 group-hover:text-slate-950">
                                {link.label}
                              </span>
                              <ExternalLink className="size-4 text-slate-300 group-hover:text-slate-500" />
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )
            }

            return (
              <section key={pKey} className="space-y-12">
                <div className="flex flex-col gap-10 px-4">
                  {/* PLATFORM HEADER - Hidden because it's now in the main Hero */}
                  {!platform && (
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "flex h-16 w-16 items-center justify-center rounded-[1.2rem] shadow-xl border shrink-0 overflow-hidden",
                        pKey === "spotify" ? "bg-black border-black" : "bg-white border-white/60"
                      )}>
                        {pKey === "spotify" ? (
                          <Image src="/spotify.png" alt="Spotify" width={64} height={64} className="h-full w-full object-cover" />
                        ) : (
                          <div className="scale-125">{config.icon}</div>
                        )}
                      </div>
                      <div>
                        <h2 className={cn(
                          "text-4xl md:text-7xl font-black uppercase tracking-tighter",
                          pKey === "spotify" ? "text-[#1DB954]" : pKey === "youtube" ? "text-[#FF0000]" : "text-black"
                        )}>
                          {config.title}
                        </h2>
                        <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-black/30 mt-2">
                          {config.items.length} {config.analyzedLabel}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* METRIC CARDS ROW */}
                  <div className="flex flex-wrap gap-5">
                    <MetricCard
                      label={config.totalLabel}
                      value={config.totalValue}
                      change={config.dailyChange && typeof config.dailyChange === "number" ? config.dailyChange : undefined}
                      platform={pKey as "spotify" | "youtube"}
                    />

                    {pKey === "spotify" && (
                      <>
                        <MetricCard
                          label="Spotify Follower"
                          value={config.followers ?? null}
                          platform="spotify"
                        />
                        <MetricCard
                          label="Spotify Monthly Listener"
                          value={config.monthlyListeners ?? null}
                          platform="spotify"
                        />
                      </>
                    )}

                    {pKey === "youtube" && (
                      <>
                        <MetricCard
                          label="YouTube Subscriber"
                          value={config.subscribers ?? null}
                          platform="youtube"
                        />
                        <MetricCard
                          label="YouTube Videos"
                          value={config.videoCount ?? null}
                          platform="youtube"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="px-4 lg:px-6">
                  <TableHeader col2Label={t("charts.trackInfo") as string} platform={pKey as "spotify" | "youtube"} t={t} />
                  <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white/70 backdrop-blur-md">
                    {config.items.length > 0 ? (
                      config.items.map((item, index) => (
                        <FullChartsItemRow key={item.id} item={item} index={index} platform={pKey as "spotify" | "youtube"} />
                      ))
                    ) : (
                      <div className="p-20 text-center text-slate-500 italic font-medium">
                        {t("charts.empty")}
                      </div>
                    )}
                  </div>
                </div>
              </section>

            )
          })}
        </div>
      </div>
    </main>
  )
}
