"use server"

import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getAdminTabData(tab: string) {
  const { profile } = await requireAdmin()
  const supabase = await createClient()

  if (tab === "users") {
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })
    if (error) return { error: error.message }
    return { profiles: data || [] }
  }

  if (tab === "members") {
    const { data, error } = await supabase.from("members").select("*").order("sort_order", { ascending: true })
    if (error) return { error: error.message }
    return { members: data || [] }
  }

  if (tab === "socials") {
    const { data, error } = await supabase.from("social_links").select("*").order("sort_order", { ascending: true })
    if (error) return { error: error.message }
    return { socials: data || [] }
  }

  if (tab === "themes") {
    const { data, error } = await (supabase as any).from("themes").select("*").order("created_at", { ascending: false })
    if (error) return { error: error.message }
    return { themes: data || [] }
  }

  if (tab === "settings") {
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle()
    if (error) return { error: error.message }
    return { siteSettings: data }
  }

  const [
    { count: usersCount, error: usersError },
    { count: membersCount, error: membersError },
    { count: socialsCount, error: socialsError },
    { count: timelineCount, error: timelineError },
    { data: settings, error: settingsError },
    { count: themesCount, error: themesError },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("members").select("*", { count: "exact", head: true }),
    supabase.from("social_links").select("*", { count: "exact", head: true }),
    supabase.from("timeline_events").select("*", { count: "exact", head: true }),
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    (supabase as any).from("themes").select("*", { count: "exact", head: true }),
  ])

  const error = usersError || membersError || socialsError || timelineError || settingsError || themesError
  if (error) return { error: error.message }

  return {
    profile,
    siteSettings: settings,
    stats: {
      users: usersCount || 0,
      members: membersCount || 0,
      socials: socialsCount || 0,
      timeline: timelineCount || 0,
    },
  }
}

export async function upsertMember(data: any) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await supabase.from("members").upsert(data)
    if (error) return { error: error.message }

    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true }
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred" }
  }
}

export async function updateMembersOrder(orders: { id: string, sort_order: number }[]) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    // Cast to any to bypass strict Insert type requirements for partial updates
    const { error } = await supabase.from("members").upsert(orders as any)
    if (error) return { error: error.message }

    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function deleteMember(id: string) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await supabase.from("members").delete().eq("id", id)
    if (error) return { error: error.message }

    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function upsertSocialLink(data: any) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await supabase.from("social_links").upsert(data)
    if (error) return { error: error.message }

    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function updateSocialLinksOrder(orders: { id: string, sort_order: number }[]) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    // Cast to any to bypass strict Insert type requirements for partial updates
    const { error } = await supabase.from("social_links").upsert(orders as any)
    if (error) return { error: error.message }

    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function deleteSocialLink(id: string) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await supabase.from("social_links").delete().eq("id", id)
    if (error) return { error: error.message }

    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function upsertSiteSettings(data: any) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await supabase.from("site_settings").upsert(data)
    if (error) return { error: error.message }

    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true }
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred" }
  }
}

export async function updateUserRole(userId: string, role: "user" | "admin") {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId)
  if (error) throw new Error(error.message)

  revalidatePath("/admin")
}

export async function upsertTheme(data: any) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await (supabase as any).from("themes").upsert(data)
    if (error) return { error: error.message }

    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true }
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred" }
  }
}

export async function activateTheme(id: string) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    // 1. Deactivate all themes
    await (supabase as any).from("themes").update({ is_active: false }).neq("id", id)
    
    // 2. Activate the selected theme
    const { error } = await (supabase as any).from("themes").update({ is_active: true }).eq("id", id)
    
    if (error) return { error: error.message }

    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function deleteTheme(id: string) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await (supabase as any).from("themes").delete().eq("id", id)
    if (error) return { error: error.message }

    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
