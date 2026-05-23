"use client"

import { createClient } from "@/lib/supabase/client"

export type VotingRound = {
  id: string
  app_id: string
  round_name: string
  start_at: string
  end_at: string
  display_timezone: string | null
  is_active: boolean
  created_at: string
}

export type VotingApp = {
  id: string
  name: string
  category: string
  program_name: string | null
  logo_url: string | null
  currencies: string[] | null
  collection_methods: string[] | null
  android_url: string | null
  ios_url: string | null
  description?: string | null
  reflection_rate?: string[] | null
  ceremony_at?: string | null
  created_at: string
  voting_rounds?: VotingRound[]
  guide_steps?: GuideStep[]
}

export type AppStrategy = {
  id: string
  app_id: string | null
  order_num: number
  content: string
}

export type GuideStep = {
  id: string
  app_id: string
  step_num: number
  title: string | null
  description: string | null
  image_url: string | null
  created_at: string
}

export async function getVotingAppsByCategory(category: string): Promise<{
  apps: VotingApp[]
  strategies: AppStrategy[]
  guideSteps: GuideStep[]
  error: string | null
}> {
  const supabase = createClient()

  const { data: appsData, error: appsError } = await supabase
    .from("voting_apps")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false })
    .limit(100)

  if (appsError) {
    return { apps: [], strategies: [], guideSteps: [], error: appsError.message }
  }

  const apps = (appsData ?? []) as VotingApp[]

  if (apps.length === 0) {
    return { apps: [], strategies: [], guideSteps: [], error: null }
  }

  const appIds = apps.map((app) => app.id)

  const { data: roundsDataRaw, error: roundsError } = await (supabase as any)
    .from("voting_rounds")
    .select("*")
    .in("app_id", appIds)
    .order("start_at", { ascending: true })
    .limit(100)

  const roundsData = roundsDataRaw as VotingRound[] | null

  const roundsByApp = new Map<string, VotingRound[]>()
  if (roundsData) {
    for (const round of roundsData) {
      const existing = roundsByApp.get(round.app_id) ?? []
      existing.push(round)
      roundsByApp.set(round.app_id, existing)
    }
  }

  const appsWithRounds: VotingApp[] = apps.map((app) => ({
    ...app,
    voting_rounds: roundsByApp.get(app.id) ?? [],
  }))

  const { data: strategies, error: strategiesError } = await supabase
    .from("app_strategies")
    .select("*")
    .in("app_id", appIds)
    .order("order_num", { ascending: true })
    .limit(100)

  const { data: guideSteps, error: guideStepsError } = await supabase
    .from("guide_steps")
    .select("*")
    .in("app_id", appIds)
    .order("step_num", { ascending: true })
    .limit(100)

  if (roundsError) {
    return { apps: appsWithRounds, strategies: [], guideSteps: [], error: roundsError.message }
  }

  if (strategiesError) {
    return { apps: appsWithRounds, strategies: [], guideSteps: [], error: strategiesError.message }
  }

  if (guideStepsError) {
    return { apps: appsWithRounds, strategies: [], guideSteps: [], error: guideStepsError.message }
  }

  const guideStepsByApp = new Map<string, GuideStep[]>()
  if (guideSteps) {
    for (const step of guideSteps as GuideStep[]) {
      const existing = guideStepsByApp.get(step.app_id) ?? []
      existing.push(step)
      guideStepsByApp.set(step.app_id, existing)
    }
  }

  return {
    apps: appsWithRounds.map((app) => ({
      ...app,
      guide_steps: guideStepsByApp.get(app.id) ?? [],
    })),
    strategies: strategies ?? [],
    guideSteps: (guideSteps ?? []) as GuideStep[],
    error: null,
  }
}
