"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export default function LandingPage() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [readyToGo, setReadyToGo] = useState(false)

  useEffect(() => {
    router.prefetch("/home")
  }, [router])

  useEffect(() => {
    let raf = 0
    const startAt = performance.now()

    const tick = (now: number) => {
      const t = Math.min(1, (now - startAt) / 1100)
      const eased = 1 - Math.pow(1 - t, 3)
      setProgress(Math.min(100, Math.floor(eased * 100)))
      if (t < 1) raf = window.requestAnimationFrame(tick)
    }

    raf = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    // Keep the landing short and consistent: auto-enter once home is likely warm.
    const minDelay = window.setTimeout(() => setReadyToGo(true), 1100)
    const maxDelay = window.setTimeout(() => setReadyToGo(true), 2600)

    return () => {
      window.clearTimeout(minDelay)
      window.clearTimeout(maxDelay)
    }
  }, [])

  useEffect(() => {
    if (!readyToGo) return
    router.replace("/home")
  }, [readyToGo, router])

  return (
    <main className="min-h-[100dvh] relative grid place-items-center overflow-hidden px-6">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-200/55 via-white/20 to-pink-200/55" />
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sky-300/35 blur-3xl" />
      <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-pink-300/35 blur-3xl" />

      <div className="relative w-full max-w-[520px] rounded-[2.5rem] border border-white/50 bg-white/55 p-9 shadow-2xl shadow-black/10 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-sky-200 to-pink-100 shadow-sm">
            <Image src="/logo-official-removebg-.png" alt="Logo" fill className="object-cover" priority />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.35em] text-slate-700">Loading</p>
            <p className="mt-1 text-[13px] font-bold text-slate-600">Please wait a moment…</p>
          </div>
        </div>

        <div className="mt-7">
          <div className="mb-2 flex items-end justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">
              {readyToGo ? "Entering" : "Preparing"}
            </p>
            <p className="text-[12px] font-black tabular-nums text-slate-700">{progress}%</p>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/70">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 via-pink-500 to-rose-500 transition-[width] duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-7 flex items-center gap-3">
          <span className="relative inline-flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400/60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500" />
          </span>
          <p className="text-[11px] font-bold text-slate-600">Auto redirecting to home…</p>
        </div>
      </div>

      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 opacity-70",
          "bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.75),rgba(255,255,255,0))]"
        )}
      />

      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>
    </main>
  )
}
