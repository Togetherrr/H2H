"use server"

import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"

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
