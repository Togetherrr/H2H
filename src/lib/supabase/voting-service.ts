"use client"

import { createClient } from "@/lib/supabase/client"

// ─── Types (Đã cập nhật để khớp với Migration và database.types.ts) ──────────

export type VotingApp = {
  id: string
  name: string
  category: string
  program_name: string | null         // Cột mới vừa thêm vào migration
  logo_url: string | null
  currencies: string[] | null         // postgres _text → string[]
  collection_methods: string[] | null
  android_url: string | null
  ios_url: string | null
  created_at: string
}

export type AppStrategy = {
  id: string
  app_id: string
  order_num: number
  content: string
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Lấy tất cả voting apps theo category (music_shows, awards...),
 * kèm strategies của từng app để hiển thị trên Card.
 */
export async function getVotingAppsByCategory(category: string): Promise<{
  apps: VotingApp[]
  strategies: AppStrategy[]
  error: string | null
}> {
  const supabase = createClient()

  // 1. Fetch apps - select("*") sẽ tự động lấy cả cột program_name mới
  const { data: apps, error: appsError } = await supabase
    .from("voting_apps")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: true })

  if (appsError) {
    return { apps: [], strategies: [], error: appsError.message }
  }

  if (!apps || apps.length === 0) {
    return { apps: [], strategies: [], error: null }
  }

  // 2. Fetch strategies cho các app vừa lấy (1 query duy nhất để tối ưu)
  const appIds = apps.map((a: VotingApp) => a.id)

  const { data: strategies, error: strategiesError } = await supabase
    .from("app_strategies")
    .select("*")
    .in("app_id", appIds)
    .order("order_num", { ascending: true })

  if (strategiesError) {
    // Nếu lỗi khi lấy strategy, vẫn trả về apps nhưng strategies rỗng
    return { apps, strategies: [], error: strategiesError.message }
  }

  return { apps, strategies: strategies ?? [], error: null }
}