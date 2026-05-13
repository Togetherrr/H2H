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
  created_at: string
  voting_rounds?: VotingRound[]
}

export type AppStrategy = {
  id: string
  app_id: string
  order_num: number
  content: string
}

export async function getVotingAppsByCategory(category: string): Promise<{
  apps: VotingApp[]
  strategies: AppStrategy[]
  error: string | null
}> {
  const supabase = createClient()

  const { data: appsData, error: appsError } = await supabase
    .from("voting_apps")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: true })

  if (appsError) {
    return { apps: [], strategies: [], error: appsError.message }
  }

  const apps = (appsData ?? []) as VotingApp[]

  if (apps.length === 0) {
    return { apps: [], strategies: [], error: null }
  }

  const appIds = apps.map((app) => app.id)

  const { data: roundsDataRaw, error: roundsError } = await (supabase as any)
    .from("voting_rounds")
    .select("*")
    .in("app_id", appIds)
    .order("start_at", { ascending: true })

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

  if (roundsError) {
    return { apps: appsWithRounds, strategies: [], error: roundsError.message }
  }

  if (strategiesError) {
    return { apps: appsWithRounds, strategies: [], error: strategiesError.message }
  }

  return {
    apps: appsWithRounds,
    strategies: strategies ?? [],
    error: null,
  }
}