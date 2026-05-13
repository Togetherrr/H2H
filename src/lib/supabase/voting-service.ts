"use client"

import { createClient } from "@/lib/supabase/client"

// ─── types ──────────────────────────────────────────────────────────────────

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
  // thêm trường này để nhận dữ liệu từ bảng voting_rounds
  voting_rounds?: VotingRound[] 
}

export type AppStrategy = {
  id: string
  app_id: string
  order_num: number
  content: string
}

// ─── queries ─────────────────────────────────────────────────────────────────

/**
 * lấy tất cả voting apps theo category, kèm strategies và các rounds.
 */
export async function getVotingAppsByCategory(category: string): Promise<{
  apps: VotingApp[]
  strategies: AppStrategy[]
  error: string | null
}> {
  const supabase = createClient()

  // 1. fetch apps kèm theo voting_rounds (nested select)
  const { data: apps, error: appsError } = await supabase
    .from("voting_apps")
    .select(`
      *,
      voting_rounds (*)
    `)
    .eq("category", category)
    .order("created_at", { ascending: true })

  if (appsError) {
    return { apps: [], strategies: [], error: appsError.message }
  }

  if (!apps || apps.length === 0) {
    return { apps: [], strategies: [], error: null }
  }

  // 2. fetch strategies cho các app vừa lấy
  const appIds = apps.map((a: VotingApp) => a.id)

  const { data: strategies, error: strategiesError } = await supabase
    .from("app_strategies")
    .select("*")
    .in("app_id", appIds)
    .order("order_num", { ascending: true })

  if (strategiesError) {
    return { apps: apps as VotingApp[], strategies: [], error: strategiesError.message }
  }

  return { 
    apps: apps as VotingApp[], 
    strategies: strategies ?? [], 
    error: null 
  }
}