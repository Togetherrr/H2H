"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

type Platform = "spotify" | "youtube"

type SocialStatsState = {
  spotify: {
    followers?: number | null
    monthlyListeners?: number | null
  }
  youtube: {
    subscribers?: number | null
  }
}

function MetricCard({
  label,
  value,
  change,
  platform,
}: {
  label: string
  value: number | null | undefined
  change?: number | null
  platform: Platform
}) {
  const hasChange = typeof change === "number"

  return (
    <div className="group flex h-[200px] w-full flex-col justify-between rounded-[2.5rem] border border-white bg-white/50 p-8 shadow-xl backdrop-blur-xl transition-all hover:bg-white/60 hover:scale-[1.01]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border shadow-md transition-transform group-hover:scale-110",
              platform === "spotify" ? "border-black bg-black" : "border-white/60 bg-white",
            )}
          >
            {platform === "spotify" ? (
              <Image src="/spotify.png" alt="Spotify" width={48} height={48} className="h-full w-full object-cover" />
            ) : (
              <Image src="/Youtube.png" alt="YouTube" width={24} height={24} className="h-6 w-6 object-contain" />
            )}
          </div>
          <span className="text-[12px] font-black uppercase tracking-[0.2em] text-black/50">{label}</span>
        </div>

        {hasChange ? (
          <div
            className={cn(
              "rounded-full border px-3 py-1 text-[13px] font-black tabular-nums shadow-sm",
              platform === "spotify"
                ? "border-[#1DB954]/20 bg-[#1DB954]/10 text-[#1DB954]"
                : "border-[#FF4444]/20 bg-[#FF4444]/10 text-[#FF4444]",
            )}
          >
            +{change!.toLocaleString("en-US")}
          </div>
        ) : null}
      </div>

      <div className="text-5xl font-black tracking-tighter tabular-nums text-black drop-shadow-sm">
        {value?.toLocaleString("en-US") ?? "—"}
      </div>
    </div>
  )
}

export function SocialStatsCards({
  platform,
  totalLabel,
  totalValue,
  totalChange,
  spotify,
  youtube,
}: {
  platform: Platform
  totalLabel: string
  totalValue: number | null
  totalChange?: number | null
  spotify?: SocialStatsState["spotify"] | null
  youtube?: SocialStatsState["youtube"] | null
}) {
  const [liveStats, setLiveStats] = useState<SocialStatsState | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadLiveStats() {
      try {
        const response = await fetch("/api/realtime/social-stats", {
          cache: "no-store",
        })
        const data = (await response.json()) as { ok?: boolean; snapshot?: SocialStatsState }

        if (!cancelled && data?.snapshot) {
          setLiveStats(data.snapshot)
        }
      } catch {
        // keep server snapshot fallback
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadLiveStats()

    const interval = window.setInterval(() => {
      loadLiveStats()
    }, 60_000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [])

  const resolvedSpotify = liveStats?.spotify ?? spotify ?? null
  const resolvedYoutube = liveStats?.youtube ?? youtube ?? null

  const cards = useMemo(() => {
    if (platform === "spotify") {
      return [
        { label: totalLabel, value: totalValue, change: totalChange, platform: "spotify" as const },
        { label: "Spotify Follower", value: resolvedSpotify?.followers ?? null, platform: "spotify" as const },
        { label: "Spotify Monthly Listener", value: resolvedSpotify?.monthlyListeners ?? null, platform: "spotify" as const },
      ]
    }

    return [
      { label: totalLabel, value: totalValue, change: totalChange, platform: "youtube" as const },
      { label: "YouTube Subscriber", value: resolvedYoutube?.subscribers ?? null, platform: "youtube" as const },
    ]
  }, [platform, totalLabel, totalValue, totalChange, resolvedSpotify, resolvedYoutube])

  return (
    <div className={cn("grid gap-5", platform === "spotify" ? "sm:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2")}>
      {cards.map((card) => (
        <MetricCard
          key={card.label}
          label={card.label}
          value={card.value}
          change={card.change}
          platform={card.platform}
        />
      ))}
      {isLoading && platform === "youtube" ? null : null}
    </div>
  )
}
