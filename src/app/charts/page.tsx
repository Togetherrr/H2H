export const revalidate = 60

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ChartsPlatformSwitcher } from "@/components/charts-platform-switcher"
import { getRealtimeSnapshotFromDb } from "@/lib/realtime/db-snapshot"
import { mergeSocialStats, refreshSocialStatsSnapshot } from "@/lib/realtime/social-stats"

export const metadata = {
  title: "Track Performance Charts | Hearts2Hearts",
  description: "Real-time track performance charts for Hearts2Hearts on Spotify and YouTube.",
}

type ChartsPageProps = {
  searchParams?: Promise<{ platform?: string | string[] }>
}

type ChartsSearchParams = {
  platform?: string | string[]
}

export default async function ChartsPage({ searchParams }: ChartsPageProps) {
  const resolvedSearchParams: ChartsSearchParams = await (searchParams ?? Promise.resolve({} as ChartsSearchParams))
  const rawPlatform = Array.isArray(resolvedSearchParams.platform)
    ? resolvedSearchParams.platform[0]
    : resolvedSearchParams.platform
  const initialPlatform = rawPlatform === "youtube" ? "youtube" : "spotify"
  const [realtimeSnapshot, socialStatsSnapshot] = await Promise.all([
    getRealtimeSnapshotFromDb({ allowLiveFallback: false }),
    refreshSocialStatsSnapshot(),
  ])

  const snapshot = socialStatsSnapshot
    ? {
        ...realtimeSnapshot,
        spotify: mergeSocialStats(realtimeSnapshot.spotify, socialStatsSnapshot.spotify),
        youtube: mergeSocialStats(realtimeSnapshot.youtube, socialStatsSnapshot.youtube),
        sources: {
          ...realtimeSnapshot.sources,
          spotify: socialStatsSnapshot.sources.spotify ?? realtimeSnapshot.sources.spotify,
          youtube: socialStatsSnapshot.sources.youtube ?? realtimeSnapshot.sources.youtube,
        },
        updatedAt:
          [realtimeSnapshot.updatedAt, socialStatsSnapshot.updatedAt]
            .filter(Boolean)
            .sort()
            .at(-1) ?? realtimeSnapshot.updatedAt,
      }
    : realtimeSnapshot

  const kworbUpdatedLabel = snapshot.sources.note ?? "Kworb update unavailable"

  return (
    <main className="relative min-h-screen bg-transparent py-20 selection:bg-white/30">
      <div className="relative z-10 container mx-auto max-w-6xl px-4">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <Link href="/" className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-600 shadow-sm backdrop-blur-md transition hover:bg-white hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900 sm:text-5xl">Track Performance</h1>
            <p className="mt-3 max-w-xl text-sm text-slate-700 sm:text-base">Live charts synced from Kworb and YouTube, with a 24h rolling trend computed from snapshot history.</p>
          </div>
          <div className="min-w-[260px] rounded-[1.5rem] border border-white/70 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Kworb updated</p>
                <p className="mt-1 text-[12px] font-bold uppercase tracking-[0.18em] text-slate-700">{kworbUpdatedLabel}</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            </div>
          </div>
        </div>

        <ChartsPlatformSwitcher snapshot={snapshot} initialPlatform={initialPlatform} />
      </div>
    </main>
  )
}
