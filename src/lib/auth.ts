import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function getCurrentSession() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session
}

export async function getCurrentProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, profile: null }
  }

  let { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, role")
    .eq("id", user.id)
    .maybeSingle()

  // Fallback by email to avoid stale/misaligned profile reads during early auth setup.
  if (!profile && user.email) {
    const { data: profileByEmail, error: profileByEmailError } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, role")
      .eq("email", user.email)
      .maybeSingle()

    profile = profileByEmail
    profileError = profileError ?? profileByEmailError
  }

  return { user, profile, profileError }
}

export async function requireAdmin() {
  const { user, profile } = await getCurrentProfile()

  if (!user) {
    redirect("/login?next=/admin")
  }

  if (profile?.role !== "admin") {
    redirect("/auth/error?reason=admin-only")
  }

  return { user, profile }
}

export async function requireUser(next = "/account") {
  const { user, profile, profileError } = await getCurrentProfile()

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(next)}`)
  }

  return { user, profile, profileError }
}
