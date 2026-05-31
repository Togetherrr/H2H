"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

type NavLoadingApi = {
  start: () => void
  stop: () => void
  isActive: boolean
}

const NavLoadingContext = createContext<NavLoadingApi | null>(null)

export function useNavLoading() {
  const ctx = useContext(NavLoadingContext)
  if (!ctx) {
    throw new Error("useNavLoading must be used within NavLoadingProvider")
  }
  return ctx
}

export function NavLoadingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isActive, setIsActive] = useState(false)
  const [progress, setProgress] = useState(0)

  const pathnameRef = useRef(pathname)
  const safetyTimerRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  const clearTimers = useCallback(() => {
    if (safetyTimerRef.current) {
      window.clearTimeout(safetyTimerRef.current)
      safetyTimerRef.current = null
    }
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    clearTimers()
    setProgress(100)
    window.setTimeout(() => {
      setIsActive(false)
      setProgress(0)
    }, 180)
  }, [clearTimers])

  const start = useCallback(() => {
    clearTimers()
    setIsActive(true)
    setProgress(0)

    const startAt = performance.now()
    const tick = (now: number) => {
      const elapsed = now - startAt
      // Progress is intentionally "optimistic" early, then slows down so it doesn't look "done"
      // while navigation is still pending.
      const fastPhase = Math.min(1, elapsed / 450)
      const fastValue = Math.floor((1 - Math.pow(1 - fastPhase, 3)) * 70)

      const slowPhase = Math.max(0, elapsed - 450)
      const slowValue = Math.min(20, Math.floor((slowPhase / 1800) * 20))

      const next = Math.min(90, fastValue + slowValue)
      setProgress((prev) => (prev < next ? next : prev))
      rafRef.current = window.requestAnimationFrame(tick)
    }
    rafRef.current = window.requestAnimationFrame(tick)

    safetyTimerRef.current = window.setTimeout(() => {
      setIsActive(false)
      setProgress(0)
    }, 4500)
  }, [clearTimers])

  useEffect(() => {
    if (pathnameRef.current !== pathname) {
      pathnameRef.current = pathname
      if (isActive) stop()
    }
  }, [pathname, isActive, stop])

  const value = useMemo<NavLoadingApi>(() => ({ start, stop, isActive }), [start, stop, isActive])

  return (
    <NavLoadingContext.Provider value={value}>
      {children}
      <NavLoadingOverlay isActive={isActive} progress={progress} />
    </NavLoadingContext.Provider>
  )
}

function NavLoadingOverlay({ isActive, progress }: { isActive: boolean; progress: number }) {
  return (
    <div
      aria-hidden={!isActive}
      className={cn(
        "fixed inset-0 z-[9999] grid place-items-center transition-opacity duration-200",
        isActive ? "opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <div className="absolute inset-0 bg-[#A2D2FF]" />
      <div className="absolute inset-0 bg-white/40 backdrop-blur-md" />
      <div className="absolute size-96 rounded-full bg-white/40 blur-[120px] animate-pulse" />

      <div className="relative flex flex-col items-center gap-5 text-center">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/logo-official-removebg-.png"
            alt="Loading Logo"
            width={112}
            height={112}
            className="size-24 md:size-28 object-contain drop-shadow-sm animate-pulse"
            priority
          />
          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-800/80">HEARTS2HEARTS</p>
        </div>
        <div className="h-2 w-40 overflow-hidden rounded-full bg-white/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 via-pink-400 to-rose-400 transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
