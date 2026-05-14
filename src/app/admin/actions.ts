"use server"

import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function uploadImage(formData: FormData) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const file = formData.get("file") as File
    if (!file) throw new Error("No file provided")

    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = fileName

    const { error: uploadError } = await supabase.storage
      .from("guides")
      .upload(filePath, file)

    if (uploadError) throw new Error(uploadError.message)

    const { data: { publicUrl } } = supabase.storage
      .from("guides")
      .getPublicUrl(filePath)

    return { url: publicUrl }
  } catch (err: any) {
    return { error: err.message }
  }
}

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

  if (tab === "voting") {
    const { data, error } = await supabase
      .from("voting_apps")
      .select("*, voting_rounds(*), app_strategies(*), guide_steps(*)")
      .order("created_at", { ascending: false })
    if (error) return { error: error.message }
    return { votingApps: data || [] }
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

export async function createVotingApp(payload: {
  name: string
  category: string
  program_name?: string | null
  logo_url?: string | null
  android_url?: string | null
  ios_url?: string | null
  currencies: string[]
  collection_methods: string[]
  strategies: string[]
  guide_steps?: Array<{
    title?: string | null
    description?: string | null
    image_url?: string | null
  }>
  description?: string | null
  reflection_rate?: string[]
  ceremony_at?: string | null
  rounds: Array<{
    round_name: string
    start_at: string
    end_at: string
    display_timezone?: string | null
    is_active: boolean
  }>
  is_featured?: boolean
}) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data: app, error: appError } = await supabase
      .from("voting_apps")
      .insert({
        name: payload.name,
        category: payload.category,
        program_name: payload.program_name ?? null,
        logo_url: payload.logo_url ?? null,
        currencies: payload.currencies,
        collection_methods: payload.collection_methods,
        android_url: payload.android_url ?? null,
        ios_url: payload.ios_url ?? null,
        description: payload.description ?? null,
        reflection_rate: payload.reflection_rate ?? [],
        ceremony_at: payload.ceremony_at ?? null,
        is_featured: Boolean(payload.is_featured),
      })
      .select("id")
      .single()

    if (appError) return { error: appError.message }

    if (payload.strategies.length > 0) {
      const strategies = payload.strategies
        .filter((item) => item.trim().length > 0)
        .map((content, index) => ({
          app_id: app.id,
          order_num: index + 1,
          content,
        }))

      if (strategies.length > 0) {
        const { error: strategyError } = await supabase.from("app_strategies").insert(strategies)
        if (strategyError) return { error: strategyError.message }
      }
    }

    const guideStepsPayload = (payload.guide_steps ?? [])
      .map((step) => ({
        title: (step.title ?? "").trim(),
        description: (step.description ?? "").trim(),
        image_url: (step.image_url ?? "").trim(),
      }))
      .filter((step) => step.title.length > 0 || step.description.length > 0 || step.image_url.length > 0)

    if (guideStepsPayload.length > 0) {
      const guideSteps = guideStepsPayload.map((step, index) => ({
        app_id: app.id,
        step_num: index + 1,
        title: step.title || null,
        description: step.description || null,
        image_url: step.image_url || null,
      }))

      const { error: guideStepsError } = await supabase.from("guide_steps").insert(guideSteps)
      if (guideStepsError) return { error: guideStepsError.message }
    }

    if (payload.category === "awards" && payload.rounds.length > 0) {
      const rounds = payload.rounds
        .map((round) => ({
          round_name: round.round_name.trim(),
          start_at: round.start_at.trim(),
          end_at: round.end_at.trim(),
          display_timezone: (round.display_timezone ?? "Asia/Seoul").trim() || "Asia/Seoul",
          is_active: round.is_active,
        }))
        .filter((round) => round.round_name.length > 0 && round.start_at.length > 0 && round.end_at.length > 0)
        .map((round) => ({
          app_id: app.id,
          round_name: round.round_name,
          start_at: round.start_at,
          end_at: round.end_at,
          display_timezone: round.display_timezone,
          is_active: round.is_active,
        }))

      if (rounds.length > 0) {
        const { error: roundsError } = await supabase.from("voting_rounds").insert(rounds)
        if (roundsError) return { error: roundsError.message }
      }
    }

    revalidatePath("/admin")
    revalidatePath("/voting")
    revalidatePath("/home")
    revalidatePath("/")
    return { success: true }
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred" }
  }
}

export async function deleteVotingApp(id: string) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await supabase.from("voting_apps").delete().eq("id", id)
    if (error) return { error: error.message }

    revalidatePath("/admin")
    revalidatePath("/voting")
    revalidatePath("/")
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function updateVotingApp(id: string, payload: any) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    // 1. First, verify we have the app
    const { data: existing, error: findError } = await supabase.from("voting_apps").select("id").eq("id", id).single()
    if (findError || !existing) return { error: "App not found" }

    // 2. Update basic info
    const { error: appError } = await supabase
      .from("voting_apps")
      .update({
        name: payload.name,
        category: payload.category,
        program_name: payload.program_name ?? null,
        logo_url: payload.logo_url ?? null,
        currencies: payload.currencies,
        collection_methods: payload.collection_methods,
        android_url: payload.android_url ?? null,
        ios_url: payload.ios_url ?? null,
        description: payload.description ?? null,
        reflection_rate: payload.reflection_rate ?? [],
        ceremony_at: payload.ceremony_at ?? null,
        is_featured: Boolean(payload.is_featured),
      })
      .eq("id", id)

    if (appError) return { error: appError.message }

    // 3. Update Strategies
    await supabase.from("app_strategies").delete().eq("app_id", id)
    const strategies = (payload.strategies || [])
      .filter((item: string) => item.trim().length > 0)
      .map((content: string, index: number) => ({
        app_id: id,
        order_num: index + 1,
        content,
      }))
    if (strategies.length > 0) {
      await supabase.from("app_strategies").insert(strategies)
    }

    // 4. Update Guide Steps
    await supabase.from("guide_steps").delete().eq("app_id", id)
    const guideStepsPayload = (payload.guide_steps ?? [])
      .map((step: any) => ({
        title: (step.title ?? "").trim(),
        description: (step.description ?? "").trim(),
        image_url: (step.image_url ?? "").trim(),
      }))
      .filter((step: any) => step.title.length > 0 || step.description.length > 0 || step.image_url.length > 0)

    if (guideStepsPayload.length > 0) {
      const guideSteps = guideStepsPayload.map((step: any, index: number) => ({
        app_id: id,
        step_num: index + 1,
        title: step.title || null,
        description: step.description || null,
        image_url: step.image_url || null,
      }))
      await supabase.from("guide_steps").insert(guideSteps)
    }

    // 5. Update Rounds
    await supabase.from("voting_rounds").delete().eq("app_id", id)
    if (payload.category === "awards" && payload.rounds && payload.rounds.length > 0) {
      const rounds = payload.rounds
        .map((round: any) => ({
          round_name: round.round_name.trim(),
          start_at: round.start_at.trim(),
          end_at: round.end_at.trim(),
          display_timezone: (round.display_timezone ?? "Asia/Seoul").trim() || "Asia/Seoul",
          is_active: round.is_active,
        }))
        .filter((round: any) => round.round_name.length > 0 && round.start_at.length > 0 && round.end_at.length > 0)
        .map((round: any) => ({
          app_id: id,
          round_name: round.round_name,
          start_at: round.start_at,
          end_at: round.end_at,
          display_timezone: round.display_timezone,
          is_active: round.is_active,
        }))
      if (rounds.length > 0) {
        await supabase.from("voting_rounds").insert(rounds)
      }
    }

    revalidatePath("/admin")
    revalidatePath("/voting")
    revalidatePath("/home")
    revalidatePath("/")
    return { success: true }
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred during update" }
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

    await (supabase as any).from("themes").update({ is_active: false }).neq("id", id)
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
