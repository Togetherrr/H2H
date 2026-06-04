"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { motion } from "framer-motion"

export function PlatformTabs({ platform }: { platform?: string }) {
  // Nếu không có platform trên URL, có thể mặc định coi là spotify
  const isSpotify = platform !== "youtube"
  const isYoutube = platform === "youtube"

  return (
    <div className="flex items-center gap-1.5 bg-white/40 p-1.5 rounded-full w-fit backdrop-blur-md border border-white/60 shadow-sm">
      <Link 
        href="/charts?platform=spotify"
        scroll={false}
        prefetch={true}
        className={cn(
          "relative px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-colors z-10",
          isSpotify ? "text-white" : "text-slate-500 hover:text-black"
        )}
      >
        Spotify
        {isSpotify && (
          <motion.div
            layoutId="activePlatformTab"
            className="absolute inset-0 bg-[#1DB954] rounded-full shadow-md -z-10"
            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
          />
        )}
      </Link>
      
      <Link 
        href="/charts?platform=youtube"
        scroll={false}
        prefetch={true}
        className={cn(
          "relative px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-colors z-10",
          isYoutube ? "text-white" : "text-slate-500 hover:text-black"
        )}
      >
        YouTube
        {isYoutube && (
          <motion.div
            layoutId="activePlatformTab"
            className="absolute inset-0 bg-[#FF0000] rounded-full shadow-md -z-10"
            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
          />
        )}
      </Link>
    </div>
  )
}
