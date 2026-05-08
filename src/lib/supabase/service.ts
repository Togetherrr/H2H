import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"
import { requireSupabaseEnv } from "@/lib/supabase/env"

export function createServiceClient() {
  const { url } = requireSupabaseEnv()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.")
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

