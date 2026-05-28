"use client"

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function ChartsPlatformTabs({ activePlatform }: { activePlatform: "spotify" | "youtube" }) {
  const tabBase =
    "inline-flex items-center gap-2 rounded-full border px-5 py-3 text-[11px] font-black uppercase tracking-widest transition-all"

  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href="/charts?platform=spotify"
        className={cn(
          tabBase,
          activePlatform === "spotify"
            ? "border-[#1DB954]/25 bg-[#1DB954]/10 text-[#1DB954] shadow-sm"
            : "border-white/60 bg-white/40 text-slate-500 hover:bg-white/70"
        )}
      >
        <Image src="/spotify.png" alt="Spotify" width={16} height={16} className="h-4 w-4 object-cover" />
        Spotify
      </Link>
      <Link
        href="/charts?platform=youtube"
        className={cn(
          tabBase,
          activePlatform === "youtube"
            ? "border-[#FF4444]/25 bg-[#FF4444]/10 text-[#FF4444] shadow-sm"
            : "border-white/60 bg-white/40 text-slate-500 hover:bg-white/70"
        )}
      >
        <Image src="/Youtube.png" alt="YouTube" width={16} height={16} className="h-4 w-4 object-contain" />
        YouTube
      </Link>
    </div>
  )
}
