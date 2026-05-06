"use client"

import { useEffect } from "react"

type ThemeEffects = {
  film_grain?: boolean
  glow_orbs?: boolean
  floating_hearts?: boolean
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
}

export function AmbientLayer({ effects }: { effects?: ThemeEffects | null }) {
  useEffect(() => {
    if (prefersReducedMotion()) return

    let raf = 0
    let lastEvent: PointerEvent | null = null

    const update = () => {
      raf = 0
      if (!lastEvent) return

      const x = Math.min(1, Math.max(0, lastEvent.clientX / window.innerWidth))
      const y = Math.min(1, Math.max(0, lastEvent.clientY / window.innerHeight))

      // CSS vars are normalized [0..1] so CSS can map them to positions.
      document.documentElement.style.setProperty("--ambient-x", x.toFixed(4))
      document.documentElement.style.setProperty("--ambient-y", y.toFixed(4))
    }

    const onPointerMove = (event: PointerEvent) => {
      // Avoid work on touch/pen to reduce jank.
      if (event.pointerType && event.pointerType !== "mouse") return
      lastEvent = event
      if (!raf) raf = window.requestAnimationFrame(update)
    }

    // Sensible defaults before the first move.
    document.documentElement.style.setProperty("--ambient-x", "0.5")
    document.documentElement.style.setProperty("--ambient-y", "0.35")

    window.addEventListener("pointermove", onPointerMove, { passive: true })
    return () => {
      window.removeEventListener("pointermove", onPointerMove)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [])

  const filmGrain = effects?.film_grain ?? true
  const glowOrbs = effects?.glow_orbs ?? true

  return (
    <div
      id="ambient-layer"
      aria-hidden="true"
      className={[
        "ambient-layer",
        glowOrbs ? "ambient-layer--orbs" : "",
        filmGrain ? "ambient-layer--grain" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    />
  )
}

