import { Music2, Youtube, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getTrackPerformanceSnapshot } from "@/lib/track-performance"
import { PerformanceItemRow } from "@/components/track-performance-section"

export const metadata = {
  title: "Track Performance Charts | Hearts2Hearts",
  description: "Real-time track performance charts for Hearts2Hearts on Spotify and YouTube.",
}

export default async function ChartsPage() {
  const snapshot = await getTrackPerformanceSnapshot()

  return (
    <main className="min-h-screen bg-slate-50 py-20 selection:bg-emerald-500/30">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Link href="/" className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900 sm:text-5xl">Track Performance</h1>
            <p className="mt-3 text-sm text-slate-600 sm:text-base">Full real-time charts data for Spotify and YouTube</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Last updated</p>
            <p className="mt-1 font-mono text-sm font-semibold text-slate-700">{new Date(snapshot.updatedAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="grid gap-10">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 bg-slate-50/50 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <Music2 className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black uppercase text-slate-900">Spotify Charts</h2>
              <span className="ml-auto rounded-full bg-slate-200/60 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-slate-600">
                {snapshot.spotify.items.length} Tracks
              </span>
            </div>

            <div className="bg-white">
              <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(112px,0.75fr)_minmax(112px,0.75fr)_minmax(88px,0.55fr)] bg-slate-50/80 text-xs font-black uppercase tracking-[0.2em] text-slate-500 max-md:grid-cols-1">
                <div className="px-5 py-4">Track</div>
                <div className="px-5 py-4 text-right max-md:hidden">Total Streams</div>
                <div className="px-5 py-4 text-right max-md:hidden">Daily Streams</div>
                <div className="px-5 py-4 text-right max-md:hidden">Change</div>
              </div>
              {snapshot.spotify.items.length > 0 ? (
                snapshot.spotify.items.map((item, index) => (
                  <PerformanceItemRow key={item.id} item={item} index={index} />
                ))
              ) : (
                <div className="p-10 text-center text-sm font-semibold text-slate-500">No Spotify data available.</div>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 bg-slate-50/50 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Youtube className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-black uppercase text-slate-900">YouTube Views</h2>
              <span className="ml-auto rounded-full bg-slate-200/60 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-slate-600">
                {snapshot.youtube.items.length} Videos
              </span>
            </div>

            <div className="bg-white">
              <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(112px,0.75fr)_minmax(112px,0.75fr)_minmax(88px,0.55fr)] bg-slate-50/80 text-xs font-black uppercase tracking-[0.2em] text-slate-500 max-md:grid-cols-1">
                <div className="px-5 py-4">Video</div>
                <div className="px-5 py-4 text-right max-md:hidden">Total Views</div>
                <div className="px-5 py-4 text-right max-md:hidden">Daily Views</div>
                <div className="px-5 py-4 text-right max-md:hidden">Change</div>
              </div>
              {snapshot.youtube.items.length > 0 ? (
                snapshot.youtube.items.map((item, index) => (
                  <PerformanceItemRow key={item.id} item={item} index={index} />
                ))
              ) : (
                <div className="p-10 text-center text-sm font-semibold text-slate-500">No YouTube data available.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
