import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { getAdminTabData } from "@/app/admin/actions"
import { requireSupabaseEnv } from "@/lib/supabase/env"

const VALID_TABS = new Set([
  "overview",
  "sync",
  "users",
  "members",
  "themes",
  "socials",
  "settings",
  "media",
  "voting",
  "award-events",
  "lineup-reveal",
  "career-records",
  "youtube-items",
  "comeback",
  "notices",
  "feedback",
])

export async function GET(request: NextRequest) {
  const tab = request.nextUrl.searchParams.get("tab") || "overview"

  if (!VALID_TABS.has(tab)) {
    return NextResponse.json({ error: "Invalid tab" }, { status: 400 })
  }

  const bearerToken = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1]
  let authenticatedUser: { id: string; email?: string | null } | null = null

  if (bearerToken) {
    const { url, anonKey } = requireSupabaseEnv()
    const supabase = createSupabaseClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data } = await supabase.auth.getUser(bearerToken)
    authenticatedUser = data.user ? { id: data.user.id, email: data.user.email } : null
  }

  if (!authenticatedUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await getAdminTabData(tab, authenticatedUser)

  if (result?.error === "Unauthorized") {
    return NextResponse.json(result, { status: 401 })
  }

  if (result?.error === "Admin only") {
    return NextResponse.json(result, { status: 403 })
  }

  return NextResponse.json(result)
}
