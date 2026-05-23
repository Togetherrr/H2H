import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"
import { requireSupabaseEnv } from "@/lib/supabase/env"
import { safeFetch } from "@/lib/supabase/safe-fetch"

/**
 * Creates a Supabase client that does not use cookies.
 * This is useful for fetching public data in Server Components
 * while allowing the page to be statically cached (ISR).
 */
export function createStaticClient() {
  const { url, anonKey } = requireSupabaseEnv()
  
  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
    },
    global: {
      fetch: safeFetch,
    },
  })
}
