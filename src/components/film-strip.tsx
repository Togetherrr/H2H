/* eslint-disable @next/next/no-img-element */

import type { FilmFrame } from "../lib/release-catalog"

type FilmStripProps = {
  frames: FilmFrame[]
  showHeader?: boolean
  className?: string
}

export function FilmStrip({ frames, showHeader = true, className }: FilmStripProps) {
  return (
    <div className={["full-bleed-strip reveal-soft delay-3 relative", className].filter(Boolean).join(" ")}>
      <div className="absolute inset-y-0 left-0 w-32 z-10 bg-gradient-to-r from-[#f0f9ff] to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 z-10 bg-gradient-to-l from-[#f0f9ff] to-transparent pointer-events-none" />

      {showHeader ? (
        <div className="film-strip-header">
          <span>S2U Archive</span>
          <span>Hearts2Hearts Moments</span>
          <span>From S2U, With Love</span>
        </div>
      ) : null}

      <div className="film-strip-wrap">
        <div className="film-strip-track">
          {[0, 1].map((segment) => (
            <div key={segment} className="film-strip-segment" aria-hidden={segment === 1}>
              {frames.map((frame) => (
                <article key={`${frame.label}-${segment}`} className="film-frame group">
                  <div className="film-hole-row film-hole-row-top" aria-hidden="true" />
                  <div className="film-image-shell overflow-hidden">
                    <img
                      src={frame.src}
                      alt={frame.alt}
                      className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="film-info">
                    <span className="font-medium">{frame.label}</span>
                    <span className="opacity-60">H2H 2026</span>
                  </div>
                  <div className="film-hole-row film-hole-row-bottom" aria-hidden="true" />
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
