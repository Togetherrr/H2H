"use server"

import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function uploadMediaAction(formData: FormData) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const file = formData.get("image") as File
    const category = (formData.get("category") as string) || "Uncategorized"
    const name = (formData.get("name") as string) || file.name

    if (!file) {
      return { error: "No file provided" }
    }

    const API_KEY = process.env.IMGBB_API_KEY
    if (!API_KEY) {
      return { error: "ImgBB API Key not configured on server" }
    }

    // 1. Upload to ImgBB from server
    const imgbbFormData = new FormData()
    imgbbFormData.append("image", file)

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
      method: "POST",
      body: imgbbFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("ImgBB Error:", errorText)
      return { error: "Failed to upload to ImgBB" }
    }

    const imgbbData = await response.json()
    const imageUrl = imgbbData.data.url
    const deleteUrl = imgbbData.data.delete_url

    // 2. Save metadata to Supabase
    const { data, error: dbError } = await (supabase as any).from("media_assets").insert({
      url: imageUrl,
      name: name,
      category: category,
      size: file.size,
      type: file.type,
      delete_url: deleteUrl,
    }).select().single()

    if (dbError) {
      console.error("Database Error:", dbError)
      return { error: `Saved to ImgBB but failed to save to Database: ${dbError.message}` }
    }

    revalidatePath("/admin")
    return { success: true, data }
  } catch (err: any) {
    console.error("Upload Action Error:", err)
    return { error: err.message || "An unexpected error occurred" }
  }
}

export async function getMediaAssetsAction(category?: string) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    let query = (supabase as any).from("media_assets").select("*").order("created_at", { ascending: false })
    
    if (category && category !== "All") {
      query = query.eq("category", category)
    }

    const { data, error } = await query
    if (error) return { error: error.message }
    
    return { data: data || [] }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function deleteMediaAssetAction(id: string) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await (supabase as any).from("media_assets").delete().eq("id", id)
    if (error) return { error: error.message }

    revalidatePath("/admin")
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function updateMediaAssetAction(id: string, updates: { name?: string, category?: string }) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await (supabase as any)
      .from("media_assets")
      .update(updates)
      .eq("id", id)

    if (error) return { error: error.message }

    revalidatePath("/admin")
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function getMediaCategoriesAction() {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from("media_assets")
      .select("category")

    if (error) return { error: error.message }

    const uniqueCategories = Array.from(new Set((data || []).map((item: any) => item.category)))
    return { data: uniqueCategories }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function renameMediaCategoryAction(oldName: string, newName: string) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await (supabase as any)
      .from("media_assets")
      .update({ category: newName })
      .eq("category", oldName)

    if (error) return { error: error.message }

    revalidatePath("/admin")
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function deleteMediaCategoryAction(name: string, mode: "delete_files" | "move_to_uncategorized" = "move_to_uncategorized") {
  try {
    await requireAdmin()
    const supabase = await createClient()

    if (mode === "delete_files") {
      const { error } = await (supabase as any)
        .from("media_assets")
        .delete()
        .eq("category", name)
      if (error) return { error: error.message }
    } else {
      const { error } = await (supabase as any)
        .from("media_assets")
        .update({ category: "Uncategorized" })
        .eq("category", name)
      if (error) return { error: error.message }
    }

    revalidatePath("/admin")
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
