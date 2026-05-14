import { createStaticClient } from "@/lib/supabase/static"

export type VotingAppRow = {
  id: string
  name: string
  category: string | null
  program_name: string | null
  logo_url: string | null
  currencies: string[] | null
  collection_methods: string[] | null
  android_url: string | null
  ios_url: string | null
  description: string | null
  reflection_rate: string[] | null
  ceremony_at: string | null
  is_featured: boolean | null
  created_at: string
}

export type VotingRoundRow = {
  id: string
  app_id: string
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

export type ActiveVoteApp = VotingAppRow & {
  active_round: VotingRoundRow | null
  rounds: VotingRoundRow[]
  strategies: AppStrategyRow[]
  guide_steps: GuideStepRow[]
}

function isRoundActiveNow(round: VotingRoundRow, now: Date) {
  if (!round.is_active) return false
  const start = new Date(round.start_at)
  const end = new Date(round.end_at)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false
  return now >= start && now <= end
}

/**
 * Active vote apps:
 * - category = awards
 * - has at least 1 round marked `is_active`
 * - and the active round's time window contains `now`
 */
export async function getActiveAwardsVoteApps(now: Date = new Date()): Promise<{
  apps: ActiveVoteApp[]
  error: string | null
}> {
  const supabase = createStaticClient()

  const { data: appsData, error: appsError } = await supabase
    .from("voting_apps")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  if (appsError) return { apps: [], error: appsError.message }

  const apps = (appsData ?? []) as VotingAppRow[]
  if (apps.length === 0) return { apps: [], error: null }

  const appIds = apps.map((app) => app.id)

  const [{ data: roundsData, error: roundsError }, { data: strategiesData, error: strategiesError }, { data: stepsData, error: stepsError }] =
    await Promise.all([
      (supabase as any)
        .from("voting_rounds")
        .select("*")
        .in("app_id", appIds)
        .order("start_at", { ascending: true })
        .limit(100),
      supabase.from("app_strategies").select("*").in("app_id", appIds).order("order_num", { ascending: true }).limit(100),
      supabase.from("guide_steps").select("*").in("app_id", appIds).order("step_num", { ascending: true }).limit(100),
    ])

  if (roundsError) return { apps: [], error: roundsError.message }
  if (strategiesError) return { apps: [], error: strategiesError.message }
  if (stepsError) return { apps: [], error: stepsError.message }

  const rounds = ((roundsData ?? []) as VotingRoundRow[]).filter((round) => round.is_active)
  const strategies = (strategiesData ?? []) as AppStrategyRow[]
  const guideSteps = (stepsData ?? []) as GuideStepRow[]

  const roundsByApp = new Map<string, VotingRoundRow[]>()
  for (const round of rounds) {
    const existing = roundsByApp.get(round.app_id) ?? []
    existing.push(round)
    roundsByApp.set(round.app_id, existing)
  }

  const strategiesByApp = new Map<string, AppStrategyRow[]>()
  for (const strategy of strategies) {
    const existing = strategiesByApp.get(strategy.app_id) ?? []
    existing.push(strategy)
    strategiesByApp.set(strategy.app_id, existing)
  }

  const stepsByApp = new Map<string, GuideStepRow[]>()
  for (const step of guideSteps) {
    const existing = stepsByApp.get(step.app_id) ?? []
    existing.push(step)
    stepsByApp.set(step.app_id, existing)
  }

  const activeApps: ActiveVoteApp[] = []

  for (const app of apps) {
    const appRounds = roundsByApp.get(app.id) ?? []
    const activeRound = appRounds.find((round) => isRoundActiveNow(round, now))

    if (!activeRound && !app.is_featured) continue

    activeApps.push({
      ...app,
      active_round: activeRound || null,
      rounds: appRounds,
      strategies: strategiesByApp.get(app.id) ?? [],
      guide_steps: stepsByApp.get(app.id) ?? [],
    })
  }

  return { apps: activeApps, error: null }
}

