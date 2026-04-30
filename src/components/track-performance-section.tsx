"use client"

/* eslint-disable @next/next/no-img-element */
import { TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/useTranslation"
import type { PerformanceItem, PlatformPerformance, TrackPerformanceSnapshot } from "@/lib/track-performance"

const PLACEHOLDER_VALUE = "--"
const TABLE_GRID = "grid grid-cols-[40px_1fr_110px_100px_90px] gap-4 items-center"

// --- HELPERS (Giữ nguyên từ code gốc của bạn để xử lý null an toàn) ---

function formatValue(value: number | null) {
  if (value === null || Number.isNaN(value)) return PLACEHOLDER_VALUE
  return value.toLocaleString()
}

function formatSigned(value: number | null, format: "number" | "percent" = "number") {
  if (value === null || Number.isNaN(value)) return PLACEHOLDER_VALUE
  const sign = value > 0 ? "+" : ""
  const formatted = format === "percent" 
    ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) 
    : value.toLocaleString()
  return `${sign}${formatted}${format === "percent" ? "%" : ""}`
}

// --- COMPONENTS ---

export function PerformanceItemRow({ item, index }: { item: PerformanceItem; index: number }) {
  const displayRank = String(index + 1).padStart(2, "0")

  return (
    <Link
      href={item.href || "#"}
      target="_blank"
      className={cn(
        "group px-5 py-3 transition-colors hover:bg-slate-50 border-b border-slate-100 last:border-0",
        TABLE_GRID,
        "max-md:grid-cols-[40px_1fr_90px] max-md:px-4" // Responsive cho mobile
      )}
    >
      <span className="font-mono text-sm font-bold text-slate-300 italic">{displayRank}</span>
      
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-slate-100 border border-slate-200">
          <img src={item.imageUrl} className="h-full w-full object-cover" alt="" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-slate-900 truncate tracking-tight">{item.title}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{item.subtitle}</p>
        </div>
      </div>

      {/* Sử dụng formatValue thay vì gọi toLocaleString trực tiếp để tránh lỗi null */}
      <div className="text-right max-md:hidden">
        <p className="font-mono text-xs font-bold text-slate-700">{formatValue(item.total)}</p>
      </div>

      <div className="text-right max-md:hidden">
        <p className="font-mono text-xs font-bold text-slate-700">{formatSigned(item.daily)}</p>
      </div>

      <div className="flex justify-end">
        <div className={cn(
          "flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-black font-mono",
          item.delta && item.delta >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        )}>
          {item.delta && item.delta >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {formatSigned(item.delta, "percent")}
        </div>
      </div>
    </Link>
  )
}

function PlatformDashboard({ 
  platform, 
  theme = "emerald", 
  ...labels 
}: { 
  platform: PlatformPerformance, 
  theme?: "emerald" | "red",
  [key: string]: any 
}) {
  const isEmerald = theme === "emerald"
  
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 flex flex-col">
      <div className={cn("p-6 border-b", isEmerald ? "bg-emerald-50/30" : "bg-rose-50/30")}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
              <img src={labels.logoSrc} className="h-6 w-6 object-contain" alt="" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tighter text-slate-900">{platform.name}</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{labels.totalsLabel}</p>
            <p className="text-4xl font-mono font-black text-slate-900 tracking-tighter max-lg:text-3xl">
              {formatValue(platform.totalValue)}
            </p>
          </div>
          <div className="pl-6 border-l border-slate-200">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{labels.dailyLabel}</p>
            <div className="flex flex-wrap items-baseline gap-2">
              <p className="text-2xl font-mono font-black text-slate-900">
                {formatSigned(platform.dailyValue)}
              </p>
              <span className={cn("text-xs font-bold", isEmerald ? "text-emerald-600" : "text-rose-600")}>
                ({formatSigned(platform.dailyChange, "percent")})
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={cn("px-5 py-3 bg-slate-50/80 border-b border-slate-100 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400", TABLE_GRID, "max-md:hidden")}>
        <span>No.</span>
        <span>{labels.topListLabel}</span>
        <span className="text-right">Total Streams</span>
        <span className="text-right">Daily</span>
        <span className="text-right">Trend</span>
      </div>

      <div className="flex-1 bg-white">
        {platform.items.length > 0 ? (
          platform.items.slice(0, 5).map((item, i) => (
            <PerformanceItemRow key={item.id} item={item} index={i} />
          ))
        ) : (
          <div className="p-10 text-center text-xs font-bold uppercase text-slate-300 tracking-widest">{labels.emptyLabel}</div>
        )}
      </div>
    </div>
  )
}

export function TrackPerformanceSection({ snapshot }: { snapshot: TrackPerformanceSnapshot }) {
  const { t } = useTranslation()

  return (
    <section id="performance" className="py-12 px-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900">{t("performance.title")}</h2>
            <p className="mt-2 text-slate-500 font-medium">{t("performance.subtitle")}</p>
          </div>
          <div className="text-right max-md:text-left">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t("performance.updatedAt")}</p>
             <p className="font-mono text-sm font-bold text-slate-900">{snapshot.updatedAt.slice(0, 10)}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-stretch">
          <PlatformDashboard
            platform={snapshot.spotify}
            totalsLabel={t("performance.totalStreams")}
            dailyLabel={t("performance.dailyStreams")}
            topListLabel={t("performance.topTracks")}
            emptyLabel={t("performance.empty")}
            logoSrc="/spotify.png"
            theme="emerald"
          />

          <PlatformDashboard
            platform={{ ...snapshot.youtube, note: "YouTube Data API" }}
            totalsLabel={t("performance.totalStreams")}
            dailyLabel={t("performance.dailyStreams")}
            topListLabel={t("performance.topTracks")}
            emptyLabel={t("performance.empty")}
            logoSrc="/Youtube.png"
            theme="red"
          />
        </div>
      </div>
    </section>
  )
}