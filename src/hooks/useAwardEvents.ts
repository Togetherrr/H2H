"use client"

import { useEffect, useState } from "react"
import type {
    PopulatedAwardEvent,
    PopulatedEventApp,
    VotingRoundRow,
    GuideStepRow,
} from "@/lib/supabase/voting-service-server"

// ── Mapped types for UI consumption ───────────────────────────────────────
/** One app (UPICK) within an award event — ready for rendering */
export type MappedEventApp = {
    id: string              // voting_apps.id
    eventAppId: string      // award_event_apps.id
    name: string            // "UPICK"
    iconImageSrc?: string
    androidHref?: string
    iosHref?: string
    websiteHref?: string
    guideUrl?: string       // External guide link (if set, skips modal)
    awardName?: string      // Optional: name of this event inside the app
    awards?: string[]       // Optional: per-app list of awards/categories
    description: string | null  // from award_event_apps (overrides app.description)
    currencies: string[]
    collection: string[]
    strategies: string[]
    guideSteps: GuideStepRow[]
    rounds: VotingRoundRow[]
    activeRound: VotingRoundRow | null
    isActiveNow: boolean
}

/** One award event (KM Chart 2026) — ready for rendering */
export type MappedAwardEvent = {
    id: string
    name: string                  // "KM CHART AWARDS 2026"
    nominations: string[]         // ["Best Female Popular", "Best Song", "Rising Global"]
    ceremony_at: string | null
    reflection_rate: string[]
    hasActiveVoting: boolean
    apps: MappedEventApp[]
}

// ── Mapping helpers ────────────────────────────────────────────────────────
function mapEventApp(ea: PopulatedEventApp): MappedEventApp {
    return {
        id: ea.app.id,
        eventAppId: ea.eventAppId,
        name: ea.app.name,
        iconImageSrc: ea.app.logo_url ?? undefined,
        androidHref: ea.app.android_url ?? undefined,
        iosHref: ea.app.ios_url ?? undefined,
        websiteHref: (ea.app as any).website_url ?? undefined,
        guideUrl: (ea.guideUrl ?? (ea.app as any).guide_url) ?? undefined,
        awardName: ea.awardName ?? undefined,
        awards: ea.awards ?? [],
        description: ea.description ?? ea.app.description,
        currencies: ea.app.currencies ?? [],
        collection: ea.app.collection_methods ?? [],
        strategies: ea.strategies.map((s) => s.content),
        guideSteps: ea.guideSteps,
        rounds: ea.rounds,
        activeRound: ea.activeRound,
        isActiveNow: ea.activeRound !== null,
    }
}

function mapAwardEvent(event: PopulatedAwardEvent): MappedAwardEvent {
    return {
        id: event.id,
        name: event.name,
        nominations: (event.nominations as string[]) ?? [],
        ceremony_at: event.ceremony_at,
        reflection_rate: (event.reflection_rate as string[]) ?? [],
        hasActiveVoting: event.hasActiveVoting,
        apps: event.eventApps.map(mapEventApp),
    }
}

// ── Hook ──────────────────────────────────────────────────────────────────
export function useAwardEvents() {
    const [events, setEvents] = useState<MappedAwardEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        setError(null)

        fetch("/voting/award-events")
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                return res.json()
            })
            .then(({ events: rawEvents, error: err }: { events: PopulatedAwardEvent[]; error: string | null }) => {
                if (cancelled) return
                if (err) {
                    setError(err)
                } else {
                    setEvents((rawEvents ?? []).map(mapAwardEvent))
                }
                setLoading(false)
            })
            .catch((err) => {
                if (cancelled) return
                setError(err.message)
                setLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [])

    return { events, loading, error }
}
