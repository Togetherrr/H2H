import { Music2, Youtube, ArrowLeft, TrendingUp, TrendingDown, Clock, Activity } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getTrackPerformanceSnapshot } from "@/lib/track-performance"
import { Navbar } from "@/components/navbar"
import { cn } from "@/lib/utils"
import type { PerformanceItem } from "@/lib/track-performance"
import { getTranslation, normalizeLanguage } from "@/i18n/translations"
import { headers } from "next/headers"

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang: queryLang } = await searchParams
  const lang = normalizeLanguage(queryLang)
  const t = (key: any) => getTranslation(lang, key)
  
  return {
    title: `${t("charts.title")} | Hearts2Hearts`,
    description: t("charts.subtitle"),
  }
}

interface ChartsPageProps {
  searchParams: Promise<{ platform?: string; lang?: string }>
}

function FullChartsItemRow({ item, index, lang }: { item: PerformanceItem; index: number; lang: string }) {
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
      <div className="text-center">
        <span className="text-[12px] font-black text-[#FFAAC0]">
          #{String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="flex min-w-0 items-center gap-4 px-4">
        <div className="h-[44px] w-[44px] shrink-0 overflow-hidden rounded-[10px] border border-slate-100">
          <Image src={item.imageUrl} alt={item.title} width={44} height={44} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-black text-slate-950">{item.title}</p>
          <p className="truncate text-[11px] font-medium uppercase tracking-widest text-slate-500">{item.subtitle}</p>
        </div>
      </div>

      <div className="text-right font-mono text-[13px] font-bold tabular-nums text-slate-950 max-lg:hidden">
        {item.total?.toLocaleString() ?? "0"}
      </div>

      <div className="text-right font-mono text-[13px] font-bold tabular-nums text-emerald-500 max-lg:hidden">
        {item.daily !== null && item.daily !== undefined ? `+${item.daily.toLocaleString()}` : "—"}
      </div>

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

function TableHeader({ col2Label, t }: { col2Label: string; t: any }) {
  return (
    <div
      className="grid items-center bg-slate-50/50 py-4 px-8 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100"
      style={{ gridTemplateColumns: "64px 1fr 160px 140px 110px" }}
    >
      <div className="text-center">{t("charts.rank")}</div>
      <div className="px-4">{col2Label}</div>
      <div className="text-right max-lg:hidden">{t("charts.total")}</div>
      <div className="text-right max-lg:hidden">{t("charts.daily")}</div>
      <div className="text-right">{t("charts.trend")}</div>
    </div>
  )
}

export default async function ChartsPage({ searchParams }: ChartsPageProps) {
  const { platform, lang: queryLang } = await searchParams
  
  // Get language from cookies or query
  const cookieLang = (await headers()).get("cookie")?.match(/lang=([^;]+)/)?.[1]
  const lang = normalizeLanguage(queryLang || cookieLang)
  const t = (key: any) => getTranslation(lang, key)

  const snapshot = await getTrackPerformanceSnapshot()

  const showSpotify = !platform || platform === "spotify"
  const showYoutube = !platform || platform === "youtube"

  const formattedUpdatedAt = new Date(snapshot.updatedAt).toLocaleString(lang === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <main className="min-h-screen selection:bg-[#A2D2FF]/30">
      <Navbar />

      <div className="section-shell pt-32">
        {/* ── Page header ── */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="space-y-6">
            <Link
              href={`/${platform ? `?platform=${platform}` : ""}`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-white px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-500 shadow-sm transition hover:bg-[#FFC2D1] hover:text-white hover:border-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("charts.return")}
            </Link>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-[#FF99AC]">
                <Activity className="size-6" />
                <p className="text-[12px] font-black uppercase tracking-[0.5em]">{t("charts.realtime")}</p>
              </div>
              <h1 className="text-title text-5xl sm:text-7xl">
                {(t("charts.title") as string).split(" ")[0]} <span className="text-gradient">{(t("charts.title") as string).split(" ").slice(1).join(" ")}</span>
              </h1>
              <p className="text-body max-w-xl">
                {t("charts.subtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md px-6 py-4 rounded-3xl shadow-sm border border-white/80">
            <Clock className="size-4 text-[#FF708A]" />
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              {t("charts.lastSynced")}: <span className="text-slate-950">{formattedUpdatedAt}</span>
            </p>
          </div>
        </div>

        {/* ── Sections ── */}
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
                    <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">{t("charts.spotify.title")}</h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-sky-500">
                      {snapshot.spotify.items.length} {t("charts.analyzed")}
                    </p>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t("performance.totalStreams")}</p>
                  <p className="text-2xl font-black text-slate-900">
                    {snapshot.spotify.totalValue?.toLocaleString() ?? "0"}
                  </p>
                </div>
              </div>

              <div className="card-premium overflow-hidden !rounded-[2.5rem]">
                <TableHeader col2Label={t("charts.trackInfo") as string} t={t} />
                <div>
                  {snapshot.spotify.items.length > 0 ? (
                    snapshot.spotify.items.map((item, index) => (
                      <FullChartsItemRow key={item.id} item={item} index={index} lang={lang} />
                    ))
                  ) : (
                    <div className="p-20 text-center text-slate-500 italic font-medium">
                      {t("charts.empty")}
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
                    <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">{t("charts.youtube.title")}</h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-pink-500">
                      {snapshot.youtube.items.length} {t("charts.analyzed.video")}
                    </p>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t("performance.totalViews")}</p>
                  <p className="text-2xl font-black text-slate-900">
                    {snapshot.youtube.totalValue?.toLocaleString() ?? "0"}
                  </p>
                </div>
              </div>

              <div className="card-premium overflow-hidden !rounded-[2.5rem]">
                <TableHeader col2Label={t("charts.videoInfo") as string} t={t} />
                <div>
                  {snapshot.youtube.items.length > 0 ? (
                    snapshot.youtube.items.map((item, index) => (
                      <FullChartsItemRow key={item.id} item={item} index={index} lang={lang} />
                    ))
                  ) : (
                    <div className="p-20 text-center text-slate-500 italic font-medium">
                      {t("charts.empty")}
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