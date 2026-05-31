import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"

const ALLOWED_CATEGORIES = new Set(["general", "idea", "bug", "content", "other"])

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)

    const message = typeof body?.message === "string" ? body.message.trim() : ""
    if (message.length < 5) {
      return NextResponse.json({ error: "Feedback message is too short." }, { status: 400 })
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: "Feedback message is too long." }, { status: 400 })
    }

    const category = typeof body?.category === "string" && ALLOWED_CATEGORIES.has(body.category) ? body.category : "general"
    const name = typeof body?.name === "string" ? body.name.trim() : ""

    const supabase = createServiceClient()
    const { error } = await supabase.from("feedback_messages").insert({
      name: name || null,
      category,
      message,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Could not submit feedback." }, { status: 500 })
  }
}