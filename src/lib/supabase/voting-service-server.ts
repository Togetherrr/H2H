import { createStaticClient } from "@/lib/supabase/static"

// ── Existing row types (updated) ───────────────────────────────────────────
export type VotingAppRow = {
  id: string
  name: string
  category: string | null
  program_name: string | null
  logo_url: string | null
  guide_url: string | null          // NEW: external guide link
  currencies: string[] | null
  collection_methods: string[] | null
  android_url: string | null
  ios_url: string | null
  website_url: string | null
  description: string | null
  reflection_rate: string[] | null
  ceremony_at: string | null
  is_featured: boolean | null
  created_at: string
}

export type VotingRoundRow = {
  id: string
  app_id: string
  event_id: string | null           // NEW: link to award_events
  round_name: string
  start_at: string
  end_at: string
  display_timezone: string | null
  is_active: boolean
  created_at: string
}

export type AppStrategyRow = {
  id: string
  app_id: string
  order_num: number
  content: string
  created_at: string
}

export type GuideStepRow = {
  id: string
  app_id: string
  step_num: number
  title: string | null
  description: string | null
  image_url: string | null
  created_at: string
}

// ── New types: Award Events ────────────────────────────────────────────────
export type AwardEventRow = {
  id: string
  name: string
  nominations: string[]
  ceremony_at: string | null
  reflection_rate: string[]
  is_active: boolean
  sort_order: number
  created_at: string
}

export type AwardEventAppRow = {
  id: string
  event_id: string
  app_id: string
  description: string | null
  guide_url: string | null
  award_name: string | null
  awards: string[]
  sort_order: number
  created_at: string
}

/** One app (UPICK) within one event (KM Chart 2026) — fully populated */
export type PopulatedEventApp = {
  eventAppId: string            // award_event_apps.id
  app: VotingAppRow
  rounds: VotingRoundRow[]      // rounds WHERE event_id=X AND app_id=Y
  activeRound: VotingRoundRow | null
  strategies: AppStrategyRow[]
  guideSteps: GuideStepRow[]
  description: string | null    // from award_event_apps.description (overrides app.description)
  guideUrl: string | null       // from award_event_apps.guide_url (overrides voting_apps.guide_url)
  awardName: string | null      // from award_event_apps.award_name
  awards: string[]              // from award_event_apps.awards
}

/** One award event (KM Chart 2026) with all apps populated */
export type PopulatedAwardEvent = AwardEventRow & {
  eventApps: PopulatedEventApp[]
  hasActiveVoting: boolean
}

// ── Legacy type (kept for music_shows, etc.) ──────────────────────────────
export type ActiveVoteApp = VotingAppRow & {
  active_round: VotingRoundRow | null
  rounds: VotingRoundRow[]
  strategies: AppStrategyRow[]
  guide_steps: GuideStepRow[]
  awards: string[]
}

// ── Helpers ───────────────────────────────────────────────────────────────
function normalizeStringList(value: unknown): string[] {
  if (!value) return []

  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeStringList(item)).filter((item) => item.length > 0)
  }

  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) return []

    if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
      try {
        const parsed = JSON.parse(trimmed)
        return normalizeStringList(parsed)
      } catch {
        return [trimmed]
      }
    }

    return [trimmed]
  }

  return [String(value).trim()].filter((item) => item.length > 0)
}

function isRoundActiveNow(round: VotingRoundRow, now: Date): boolean {
  if (!round.is_active) return false
  const start = new Date(round.start_at)
  const end = new Date(round.end_at)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false
  return now >= start && now <= end
}

// ── NEW: Award Events query ────────────────────────────────────────────────
/**
 * Fetch all active award events with their apps, rounds, strategies, and guide steps.
 * Used by:
 *  - Server: app/page.tsx (homepage widget)
 *  - API route: /api/voting/award-events (for client hook)
 */
export async function getActiveAwardsVoteApps(now: Date = new Date()): Promise<{
  events: PopulatedAwardEvent[]
  error: string | null
}> {
  try {
    const supabase = createStaticClient()

    // 1. Fetch active events
    const { data: eventsData, error: eventsError } = await supabase
      .from("award_events")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(20)

    if (eventsError) return { events: [], error: eventsError.message }
    const events = ((eventsData ?? []) as AwardEventRow[]).map((event) => ({
      ...event,
      nominations: normalizeStringList(event.nominations),
      reflection_rate: normalizeStringList(event.reflection_rate),
    }))
    if (events.length === 0) return { events: [], error: null }

    const eventIds = events.map((e) => e.id)

    // 2. Fetch junction: which apps are in each event
    const { data: eventAppsData, error: eventAppsError } = await supabase
      .from("award_event_apps")
      .select("*")
      .in("event_id", eventIds)
      .order("sort_order", { ascending: true })
      .limit(100)

    if (eventAppsError) return { events: [], error: eventAppsError.message }
    const eventApps = (eventAppsData ?? []) as AwardEventAppRow[]

    if (eventApps.length === 0) {
      return {
        events: events.map((e) => ({ ...e, eventApps: [], hasActiveVoting: false })),
        error: null,
      }
    }

    const appIds = [...new Set(eventApps.map((ea) => ea.app_id))]

    // 3. Parallel fetch: apps + rounds (event-scoped) + strategies + guide steps
    const [
      { data: appsData, error: appsError },
      { data: roundsData, error: roundsError },
      { data: strategiesData, error: strategiesError },
      { data: stepsData, error: stepsError },
    ] = await Promise.all([
      supabase.from("voting_apps").select("*").in("id", appIds).limit(50),
      supabase
        .from("voting_rounds")
        .select("*")
        .in("event_id", eventIds)
        .in("app_id", appIds)
        .order("start_at", { ascending: true })
        .limit(200),
      supabase
        .from("app_strategies")
        .select("*")
        .in("app_id", appIds)
        .order("order_num", { ascending: true })
        .limit(200),
      supabase
        .from("guide_steps")
        .select("*")
        .in("app_id", appIds)
        .order("step_num", { ascending: true })
        .limit(200),
    ])

    if (appsError) return { events: [], error: appsError.message }
    if (roundsError) return { events: [], error: roundsError.message }
    if (strategiesError) return { events: [], error: strategiesError.message }
    if (stepsError) return { events: [], error: stepsError.message }

    // 4. Build lookup maps
    const appsMap = new Map<string, VotingAppRow>(((appsData ?? []) as VotingAppRow[]).map((a) => [a.id, a]))

    // Rounds keyed by "event_id:app_id"
    const roundsByEventApp = new Map<string, VotingRoundRow[]>()
    for (const round of (roundsData ?? []) as VotingRoundRow[]) {
      if (!round.event_id) continue
      const key = `${round.event_id}:${round.app_id}`
      const arr = roundsByEventApp.get(key) ?? []
      arr.push(round)
      roundsByEventApp.set(key, arr)
    }

    const strategiesByApp = new Map<string, AppStrategyRow[]>()
    for (const s of (strategiesData ?? []) as AppStrategyRow[]) {
      const arr = strategiesByApp.get(s.app_id) ?? []
      arr.push(s)
      strategiesByApp.set(s.app_id, arr)
    }

    const stepsByApp = new Map<string, GuideStepRow[]>()
    for (const step of (stepsData ?? []) as GuideStepRow[]) {
      const arr = stepsByApp.get(step.app_id) ?? []
      arr.push(step)
      stepsByApp.set(step.app_id, arr)
    }

    // 5. Assemble final structure
    const populated: PopulatedAwardEvent[] = events.map((event) => {
      const linkedApps = eventApps.filter((ea) => ea.event_id === event.id)

      const populatedApps: PopulatedEventApp[] = linkedApps
        .map((ea) => {
          const app = appsMap.get(ea.app_id)
          if (!app) return null

          const key = `${event.id}:${ea.app_id}`
          const rounds = roundsByEventApp.get(key) ?? []
          const activeRound = rounds.find((r) => isRoundActiveNow(r, now)) ?? null

          return {
            eventAppId: ea.id,
            app,
            rounds,
            activeRound,
            strategies: strategiesByApp.get(ea.app_id) ?? [],
            guideSteps: stepsByApp.get(ea.app_id) ?? [],
            description: ea.description,
            guideUrl: ea.guide_url ?? null,
            awardName: ea.award_name ?? null,
            awards: (ea.awards as any) ?? [],
          } satisfies PopulatedEventApp
        })
        .filter(Boolean) as PopulatedEventApp[]

      const hasActiveVoting = populatedApps.some((ea) => ea.activeRound !== null)

      return { ...event, eventApps: populatedApps, hasActiveVoting }
    })

    return { events: populated, error: null }
  } catch (err) {
    return { events: [], error: (err as Error)?.message ?? "Failed to load award events" }
  }
}

// ── LEGACY: Non-award categories (music_shows, etc.) ─────────────────────
/**
 * Fetch apps for non-award categories (music shows etc.).
 * Rounds fetched here are those WITHOUT an event_id (standalone).
 * Also used as fallback on the voting guide page.
 */
export async function getLegacyActiveVoteApps(now: Date = new Date()): Promise<{
  apps: ActiveVoteApp[]
  error: string | null
}> {
  try {
    const supabase = createStaticClient()

    const { data: appsData, error: appsError } = await supabase
      .from("voting_apps")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (appsError) return { apps: [], error: appsError.message }
    const apps = ((appsData ?? []) as VotingAppRow[]).map((app) => ({
      ...app,
      reflection_rate: normalizeStringList(app.reflection_rate),
    }))
    if (apps.length === 0) return { apps: [], error: null }

    const appIds = apps.map((a) => a.id)

  const [
    { data: roundsData, error: roundsError },
    { data: strategiesData, error: strategiesError },
    { data: stepsData, error: stepsError },
    { data: awardEventsData, error: awardEventsError },
  ] = await Promise.all([
    (supabase as any)
      .from("voting_rounds")
      .select("*")
      .in("app_id", appIds)
      .is("event_id", null)   // Only standalone rounds (not tied to an award event)
      .order("start_at", { ascending: true })
      .limit(100),
    supabase.from("app_strategies").select("*").in("app_id", appIds).order("order_num", { ascending: true }).limit(100),
    supabase.from("guide_steps").select("*").in("app_id", appIds).order("step_num", { ascending: true }).limit(100),
    supabase
      .from("award_event_apps")
      .select("app_id, awards, award_events!inner(is_active)")
      .in("app_id", appIds)
      .eq("award_events.is_active", true)
      .limit(100),
  ])

  if (roundsError) return { apps: [], error: roundsError.message }
  if (strategiesError) return { apps: [], error: strategiesError.message }
  if (stepsError) return { apps: [], error: stepsError.message }
  if (awardEventsError) return { apps: [], error: awardEventsError.message }

  const rounds = ((roundsData ?? []) as VotingRoundRow[]).filter((r) => r.is_active)
  const strategies = (strategiesData ?? []) as AppStrategyRow[]
  const guideSteps = (stepsData ?? []) as GuideStepRow[]
  const awardEventApps = (awardEventsData ?? []) as unknown as Array<{ app_id: string; awards: unknown }>

  const awardsByApp = new Map<string, string[]>()
  for (const eventApp of awardEventApps) {
    const awards = normalizeStringList(eventApp.awards)
    if (awards.length === 0) continue
    if (!awardsByApp.has(eventApp.app_id)) {
      awardsByApp.set(eventApp.app_id, awards)
    }
  }

  const roundsByApp = new Map<string, VotingRoundRow[]>()
  for (const round of rounds) {
    const arr = roundsByApp.get(round.app_id) ?? []
    arr.push(round)
    roundsByApp.set(round.app_id, arr)
  }

  const strategiesByApp = new Map<string, AppStrategyRow[]>()
  for (const s of strategies) {
    const arr = strategiesByApp.get(s.app_id) ?? []
    arr.push(s)
    strategiesByApp.set(s.app_id, arr)
  }

  const stepsByApp = new Map<string, GuideStepRow[]>()
  for (const step of guideSteps) {
    const arr = stepsByApp.get(step.app_id) ?? []
    arr.push(step)
    stepsByApp.set(step.app_id, arr)
  }

  const activeApps: ActiveVoteApp[] = []
  for (const app of apps) {
    const appRounds = roundsByApp.get(app.id) ?? []
    const activeRound = appRounds.find((r) => isRoundActiveNow(r, now)) ?? null
    if (!activeRound && !app.is_featured) continue

    activeApps.push({
      ...app,
      active_round: activeRound,
      rounds: appRounds,
      strategies: strategiesByApp.get(app.id) ?? [],
      guide_steps: stepsByApp.get(app.id) ?? [],
      awards: awardsByApp.get(app.id) ?? [],
    })
  }

    return { apps: activeApps, error: null }
  } catch (err) {
    return { apps: [], error: (err as Error)?.message ?? "Failed to load legacy vote apps" }
  }
}
