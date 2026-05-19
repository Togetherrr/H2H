"use server"

import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { createStaticClient } from "@/lib/supabase/static"
import { createServiceClient } from "@/lib/supabase/service"
export async function uploadImage(formData: FormData) {
  try {
    await requireAdmin()
  const supabase = createServiceClient()
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
  const supabase = createServiceClient()

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

  if (tab === "lineup-reveal") {
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle()
    if (error) return { error: error.message }
    return { siteSettings: data }
  }

  if (tab === "career-records") {
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle()
    if (error) return { error: error.message }
    return { siteSettings: data }
  }

  if (tab === "comeback") {
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

  if (tab === "award-events") {
    const [{ data: eventsData, error: eventsError }, { data: appsData, error: appsError }] = await Promise.all([
      (supabase as any)
        .from("award_events")
        .select("*, event_apps:award_event_apps(*, voting_apps(*))")
        .order("sort_order", { ascending: true })
        .limit(50),
      supabase
        .from("voting_apps")
        .select("id, name, logo_url, category, guide_url")
        .order("created_at", { ascending: false })
        .limit(200),
    ])

    if (eventsError) return { error: eventsError.message }
    if (appsError) return { error: appsError.message }

    const events = (eventsData || []) as any[]
    const eventIds = events.map((e) => e.id).filter(Boolean)

    if (eventIds.length === 0) {
      return { awardEvents: [], availableApps: appsData || [] }
    }

    const { data: roundsData, error: roundsError } = await (supabase as any)
      .from("voting_rounds")
      .select("*")
      .in("event_id", eventIds)
      .order("start_at", { ascending: true })
      .limit(500)

    if (roundsError) return { error: roundsError.message }

    const rounds = (roundsData || []) as any[]
    const roundsByEventApp = new Map<string, any[]>()
    for (const round of rounds) {
      if (!round.event_id || !round.app_id) continue
      const key = `${round.event_id}:${round.app_id}`
      const arr = roundsByEventApp.get(key) ?? []
      arr.push(round)
      roundsByEventApp.set(key, arr)
    }

    const hydrated = events.map((event) => {
      const eventApps = (event.event_apps || []).map((ea: any) => {
        const key = `${event.id}:${ea.app_id}`
        return { ...ea, rounds: roundsByEventApp.get(key) ?? [] }
      })
      return { ...event, event_apps: eventApps }
    })

    return { awardEvents: hydrated, availableApps: appsData || [] }
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
  const supabase = createServiceClient()

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
  const supabase = createServiceClient()

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
  const supabase = createServiceClient()

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
  const supabase = createServiceClient()

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
  const supabase = createServiceClient()
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
  const supabase = createServiceClient()

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
  const supabase = createServiceClient()

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
  const supabase = createServiceClient()
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
  const supabase = createServiceClient()

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
  const supabase = createServiceClient()

    // Avoid sending unexpected/unstable fields from the client; keep this upsert narrow and serializable.
    const payload = {
      id: typeof data?.id === "number" ? data.id : 1,
      group_name: typeof data?.group_name === "string" && data.group_name.trim() ? data.group_name.trim() : "H2H",
      metadata: (data?.metadata ?? null) as any,
    }

    const { error } = await supabase.from("site_settings").upsert(payload)
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
  const supabase = createServiceClient()

  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId)
  if (error) throw new Error(error.message)

  revalidatePath("/admin")
}

export async function upsertTheme(data: any) {
  try {
    await requireAdmin()
  const supabase = createServiceClient()

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
  const supabase = createServiceClient()

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
  const supabase = createServiceClient()

    const { error } = await (supabase as any).from("themes").delete().eq("id", id)
    if (error) return { error: error.message }

    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
export async function createAwardEvent(data: {
  name: string
  nominations: string[]
  ceremony_at: string | null
  reflection_rate: string[]
  is_active: boolean
  sort_order: number
}) {
  await requireAdmin()
  const supabase = createServiceClient()
  const { error } = await supabase.from("award_events").insert({
    name: data.name,
    nominations: data.nominations.filter(Boolean),
    ceremony_at: data.ceremony_at || null,
    reflection_rate: data.reflection_rate.filter(Boolean),
    is_active: data.is_active,
    sort_order: data.sort_order,
  })

  if (error) return { error: error.message }
  revalidatePath("/home")
  revalidatePath("/voting")
  return { error: null }
}

export async function updateAwardEvent(
  id: string,
  data: {
    name: string
    nominations: string[]
    ceremony_at: string | null
    reflection_rate: string[]
    is_active: boolean
    sort_order: number
  }
) {
  await requireAdmin()
  const supabase = createServiceClient()
  const { error } = await supabase
    .from("award_events")
    .update({
      name: data.name,
      nominations: data.nominations.filter(Boolean),
      ceremony_at: data.ceremony_at || null,
      reflection_rate: data.reflection_rate.filter(Boolean),
      is_active: data.is_active,
      sort_order: data.sort_order,
    })
    .eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/home")
  revalidatePath("/voting")
  return { error: null }
}

export async function deleteAwardEvent(id: string) {
  await requireAdmin()
  const supabase = createServiceClient()
  const { error } = await supabase.from("award_events").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/home")
  revalidatePath("/voting")
  return { error: null }
}

// ── Award Event Apps (junction) ───────────────────────────────────────────

export async function addAppToEvent(data: {
  event_id: string
  app_id: string
  description: string | null
  guide_url?: string | null
  award_name?: string | null
  awards?: string[]
  sort_order: number
}) {
  await requireAdmin()
  const supabase = createServiceClient()
  const { error } = await (supabase as any).from("award_event_apps").insert({
    event_id: data.event_id,
    app_id: data.app_id,
    description: data.description,
    guide_url: data.guide_url || null,
    award_name: data.award_name || null,
    awards: (data.awards ?? []).filter(Boolean),
    sort_order: data.sort_order,
  })
  if (error) return { error: error.message }
  revalidatePath("/home")
  revalidatePath("/voting")
  return { error: null }
}

export async function updateEventApp(
  id: string,
  data: {
    description: string | null
    guide_url?: string | null
    award_name?: string | null
    awards?: string[]
    sort_order: number
  }
) {
  await requireAdmin()
  const supabase = createServiceClient()
  const { error } = await (supabase as any)
    // Cast to any until Supabase generated types are updated for new columns
    .from("award_event_apps")
    .update({
      description: data.description,
      guide_url: data.guide_url || null,
      award_name: data.award_name || null,
      awards: (data.awards ?? []).filter(Boolean),
      sort_order: data.sort_order,
    })
    .eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/home")
  revalidatePath("/voting")
  return { error: null }
}

export async function removeAppFromEvent(id: string) {
  await requireAdmin()
  const supabase = createServiceClient()
  const { error } = await supabase.from("award_event_apps").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/home")
  revalidatePath("/voting")
  return { error: null }
}

// ── Event Rounds (voting_rounds với event_id) ─────────────────────────────

export async function createEventRound(data: {
  event_id: string
  app_id: string
  round_name: string
  start_at: string   // UTC ISO string
  end_at: string     // UTC ISO string
  display_timezone: string
  is_active: boolean
}) {
  await requireAdmin()
  const supabase = createServiceClient()
  const { error } = await supabase.from("voting_rounds").insert(data)
  if (error) return { error: error.message }
  revalidatePath("/home")
  revalidatePath("/voting")
  return { error: null }
}

export async function updateEventRound(
  id: string,
  data: {
    round_name: string
    start_at: string
    end_at: string
    display_timezone: string
    is_active: boolean
  }
) {
  await requireAdmin()
  const supabase = createServiceClient()
  const { error } = await supabase.from("voting_rounds").update(data).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/home")
  revalidatePath("/voting")
  return { error: null }
}

export async function deleteEventRound(id: string) {
  await requireAdmin()
  const supabase = createServiceClient()
  const { error } = await supabase.from("voting_rounds").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/home")
  revalidatePath("/voting")
  return { error: null }
}

// ── Update guide_url on existing voting_apps ──────────────────────────────

export async function updateVotingAppGuideUrl(appId: string, guideUrl: string | null) {
  await requireAdmin()
  const supabase = createServiceClient()
  const { error } = await supabase
    .from("voting_apps")
    .update({ guide_url: guideUrl || null })
    .eq("id", appId)

  if (error) return { error: error.message }
  revalidatePath("/voting")
  return { error: null }
}
