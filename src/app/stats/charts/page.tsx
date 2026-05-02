"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, BarChart3, Youtube, TrendingUp, TrendingDown, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/useTranslation"
import { useEffect, useState } from "react"
import type { TrackPerformanceSnapshot } from "@/lib/track-performance"

export default function ChartsPage() {
  const { t } = useTranslation()
  const [snapshot, setSnapshot] = useState<TrackPerformanceSnapshot | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        // In this branch, we might need a real endpoint or a server action
        // For now, we fetch from a potential API route or mock it
        const res = await fetch("/api/stats/performance", { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          setSnapshot(data)
        }
      } catch (err) {
        console.error("Failed to load charts data", err)
      }
    }
    loadData()

    const interval = window.setInterval(loadData, 60_000)
    return () => window.clearInterval(interval)
  }, [])

  if (!snapshot) {
    return (
      <main className="min-h-screen sky-page flex items-center justify-center">
        <div className="text-center">
           <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mb-4" />
           <p className="text-slate-500 uppercase tracking-widest text-[10px]">Loading Charts...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen sky-page bg-[#f0f9ff] px-5 py-12 sm:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-sky-700 transition hover:bg-white hover:text-sky-900 shadow-sm"
        >
          <ArrowLeft className="size-3" />
          Back to home
        </Link>

        <header className="mt-12 mb-16">
           <div className="flex items-center gap-3 text-sky-700 mb-4">
              <BarChart3 className="size-5" />
              <p className="text-xs uppercase tracking-[0.45em] font-medium">Analytics Hub</p>
           </div>
           <h1 className="text-5xl font-light uppercase tracking-tighter text-slate-950 sm:text-7xl">
              Performance <span className="text-sky-500">Charts</span>
           </h1>
           <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600">
              Detailed breakdown of Hearts2Hearts music performance across digital platforms. 
              Real-time streams and view counts updated from official APIs.
           </p>
        </header>

        <div className="grid gap-12">
          {/* Spotify Section */}
          <section>
            <div className="flex items-center justify-between mb-8 px-2">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl border border-sky-100 shadow-sm">
                    <Image src="/spotify.png" width={24} height={24} className="h-6 w-6 object-contain" alt="Spotify" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-light uppercase tracking-tight text-slate-950">Spotify Regional</h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Track-by-track streams</p>
                  </div>
               </div>
               <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Total Streams</p>
                  <p className="text-2xl font-mono font-medium text-slate-950">{snapshot.spotify.totalValue?.toLocaleString() || "--"}</p>
               </div>
            </div>

            <div className="rounded-[2rem] border border-white/80 bg-white/75 p-2 shadow-[0_24px_70px_rgba(86,142,190,0.12)] backdrop-blur-xl">
               <div className="overflow-x-auto">
                 <table className="min-w-[920px] w-full text-left border-separate border-spacing-y-2">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 w-20 whitespace-nowrap">Rank</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Track Information</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 text-right w-36 whitespace-nowrap">Daily</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 text-right w-44 whitespace-nowrap">Total Streams</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 text-right w-40 whitespace-nowrap">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {snapshot.spotify.items.map((item, idx) => (
                        <tr key={item.id} className="group">
                          <td className="px-6 py-5 align-middle bg-white/60 rounded-l-2xl border border-white/70 border-r-0">
                            <span className="font-mono text-sm font-bold text-slate-300 italic group-hover:text-sky-500 transition-colors">
                              {(idx + 1).toString().padStart(2, "0")}
                            </span>
                          </td>
                          <td className="px-6 py-5 bg-white/60 border-y border-white/70">
                             <div className="flex min-w-0 items-center gap-4">
                                <Image
                                  src={item.imageUrl}
                                  width={48}
                                  height={48}
                                  className="h-12 w-12 shrink-0 rounded-lg object-cover shadow-sm border border-white/50"
                                  alt=""
                                />
                                <div className="min-w-0">
                                   <p className="truncate text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors">{item.title}</p>
                                   {item.subtitle ? (
                                     <p className="truncate text-[10px] font-medium text-slate-400 uppercase tracking-widest">{item.subtitle}</p>
                                   ) : null}
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-5 text-right align-middle bg-white/60 border-y border-white/70">
                             <p className="font-mono text-sm font-semibold text-sky-700/80 whitespace-nowrap">
                               {item.daily !== null ? `+${item.daily.toLocaleString()}` : "--"}
                             </p>
                          </td>
                          <td className="px-6 py-5 text-right align-middle bg-white/60 border-y border-white/70">
                             <p className="font-mono text-sm font-bold text-slate-700 whitespace-nowrap">{item.total?.toLocaleString() || "--"}</p>
                          </td>
                          <td className="px-6 py-5 text-right align-middle bg-white/60 rounded-r-2xl border border-white/70 border-l-0">
                             <div className={cn(
                                "inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold font-mono whitespace-nowrap",
                                (item.dailyChange ?? 0) >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                             )}>
                               {(item.dailyChange ?? 0) >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                               {(item.dailyChange ?? 0) > 0 ? "+" : ""}
                               {item.dailyChange !== null
                                 ? item.dailyChangeFormat === "percent"
                                   ? `${item.dailyChange.toFixed(2)}%`
                                   : item.dailyChange.toLocaleString()
                                 : "--"}
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
            </div>
          </section>

          {/* YouTube Section */}
          <section className="mb-20">
            <div className="flex items-center justify-between mb-8 px-2">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl border border-rose-100 shadow-sm">
                    <Youtube className="size-6 text-rose-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-light uppercase tracking-tight text-slate-950">Official Visuals</h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">YouTube Official Channels</p>
                  </div>
               </div>
               <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Total Views</p>
                  <p className="text-2xl font-mono font-medium text-slate-950">{snapshot.youtube.totalValue?.toLocaleString() || "--"}</p>
               </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
               {snapshot.youtube.items.map((video) => (
                 <a 
                   key={video.id} 
                   href={video.href} 
                   target="_blank" 
                   rel="noreferrer"
                   className="group block rounded-[2rem] border border-white/80 bg-white/75 p-5 shadow-[0_16px_40px_rgba(86,142,190,0.08)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-sky-200"
                 >
                    <div className="relative aspect-video overflow-hidden rounded-2xl mb-4 shadow-sm border border-white/50">
                       <Image src={video.imageUrl} width={480} height={270} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" alt="" />
                       <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-transparent" />
                       <div className="absolute bottom-3 right-3 p-1.5 bg-white/90 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="size-3 text-sky-700" />
                       </div>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-700/70 mb-2">Music Video</p>
                    <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-sky-700 transition-colors mb-4">{video.title}</h3>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                       <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Total Views</span>
                       <span className="font-mono text-sm font-bold text-slate-900">{video.total?.toLocaleString() || "--"}</span>
                    </div>
                 </a>
               ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
