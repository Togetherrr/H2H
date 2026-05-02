import { Music2, Youtube, ArrowLeft, TrendingUp, TrendingDown, Clock, Activity } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getTrackPerformanceSnapshot } from "@/lib/track-performance"
import { Navbar } from "@/components/navbar"
import { cn } from "@/lib/utils"
import type { PerformanceItem } from "@/lib/track-performance"

export const metadata = {
  title: "Track Performance Charts | Hearts2Hearts",
  description: "Real-time track performance charts for Hearts2Hearts on Spotify and YouTube.",
}

interface ChartsPageProps {
  searchParams: Promise<{ platform?: string }>
}

// ─── Row dùng riêng cho trang Full Charts ────────────────────────────────────
// grid phải khớp với header bên dưới: 64px | 1fr | 160px | 140px | 110px
function FullChartsItemRow({ item, index }: { item: PerformanceItem; index: number }) {
  const isPositive = (item.dailyChange || 0) >= 0
  const Icon = isPositive ? TrendingUp : TrendingDown

  return (
    <a
      href={item.href || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="group/row grid items-center border-b border-slate-50 px-8 transition-colors hover:bg-slate-50/70 last:border-b-0"
      style={{ gridTemplateColumns: "64px 1fr 160px 140px 110px", minHeight: "72px" }}
    >
      {/* Rank */}
      <div className="text-center">
        <span className="text-[12px] font-black text-[#FFAAC0]">
          #{String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Track info */}
      <div className="flex min-w-0 items-center gap-4 px-4">
        <div className="h-[44px] w-[44px] shrink-0 overflow-hidden rounded-[10px] border border-slate-100">
          <Image src={item.imageUrl} alt={item.title} width={44} height={44} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-black text-slate-950">{item.title}</p>
          <p className="truncate text-[11px] font-medium uppercase tracking-widest text-slate-600">{item.subtitle}</p>
        </div>
      </div>

      {/* Total */}
      <div className="text-right font-mono text-[13px] font-bold tabular-nums text-slate-950 max-lg:hidden">
        {item.total?.toLocaleString() ?? "0"}
      </div>

      {/* Daily */}
      <div className="text-right font-mono text-[13px] font-bold tabular-nums text-emerald-500 max-lg:hidden">
        {item.daily !== null && item.daily !== undefined ? `+${item.daily.toLocaleString()}` : "—"}
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
          {item.dailyChangeFormat === "percent"
            ? `${(item.dailyChange ?? 0).toFixed(2)}%`
            : (item.dailyChange ?? 0).toLocaleString()}
        </div>
      </div>
    </a>
  )
}

// ─── Reusable table header — columns phải khớp với FullChartsItemRow ────────
function TableHeader({ col2Label }: { col2Label: string }) {
  return (
    <div
      className="grid items-center bg-slate-50/50 py-4 px-8 text-[10px] font-black uppercase tracking-widest text-slate-600 border-b border-slate-100"
      style={{ gridTemplateColumns: "64px 1fr 160px 140px 110px" }}
    >
      <div className="text-center">Rank</div>
      <div className="px-4">{col2Label}</div>
      <div className="text-right max-lg:hidden">Total</div>
      <div className="text-right max-lg:hidden">Daily</div>
      <div className="text-right">Trend</div>
    </div>
  )
}

export default async function ChartsPage({ searchParams }: ChartsPageProps) {
  const { platform } = await searchParams
  const snapshot = await getTrackPerformanceSnapshot()

  const showSpotify = !platform || platform === "spotify"
  const showYoutube = !platform || platform === "youtube"

  const formattedUpdatedAt = new Date(snapshot.updatedAt).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <main className="min-h-screen bg-[#F8FAFC] selection:bg-[#A2D2FF]/30">
      <Navbar />

      <div className="mx-auto max-w-6xl py-32 px-4">

        {/* ── Page header ──────────────────────────────────────────────── */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="space-y-6">
            <Link
              href={`/${platform ? `?platform=${platform}` : ""}`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-white px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-500 shadow-sm transition hover:bg-[#FFC2D1] hover:text-white hover:border-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Hub
            </Link>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-[#FF99AC]">
                <Activity className="size-6" />
                <p className="text-[12px] font-black uppercase tracking-[0.5em]">Real-time Data</p>
              </div>
              <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900 sm:text-7xl">
                Track <span className="text-gradient">Performance</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-3xl shadow-sm border border-slate-100">
            <Clock className="size-4 text-slate-400" />
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Last Synced: <span className="text-slate-900">{formattedUpdatedAt}</span>
            </p>
          </div>
        </div>

        {/* ── Sections ─────────────────────────────────────────────────── */}
        <div className="grid gap-20">

          {/* Spotify */}
          {showSpotify && (
            <section className="space-y-8">
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A2D2FF] text-white shadow-xl shadow-sky-100">
                    <Music2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">Spotify Charts</h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-sky-500">
                      {snapshot.spotify.items.length} Tracks Analyzed
                    </p>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Streams</p>
                  <p className="text-2xl font-black text-slate-900">
                    {snapshot.spotify.totalValue?.toLocaleString() ?? "0"}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/20">
                <TableHeader col2Label="Track Info" />
                <div>
                  {snapshot.spotify.items.length > 0 ? (
                    snapshot.spotify.items.map((item, index) => (
                      <FullChartsItemRow key={item.id} item={item} index={index} />
                    ))
                  ) : (
                    <div className="p-20 text-center text-slate-400 italic font-medium">
                      No Spotify data available.
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* YouTube */}
          {showYoutube && (
            <section className="space-y-8">
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFC2D1] text-white shadow-xl shadow-pink-100">
                    <Youtube className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">YouTube Views</h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-pink-500">
                      {snapshot.youtube.items.length} Videos Analyzed
                    </p>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Views</p>
                  <p className="text-2xl font-black text-slate-900">
                    {snapshot.youtube.totalValue?.toLocaleString() ?? "0"}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/20">
                <TableHeader col2Label="Video Info" />
                <div>
                  {snapshot.youtube.items.length > 0 ? (
                    snapshot.youtube.items.map((item, index) => (
                      <FullChartsItemRow key={item.id} item={item} index={index} />
                    ))
                  ) : (
                    <div className="p-20 text-center text-slate-400 italic font-medium">
                      No YouTube data available.
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

        </div>
      </div>
    </main>
  )
}