import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const requestedNext = searchParams.get("next")

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    let next = requestedNext ?? "/"

    if (user) {
      let { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()

      if (!profile && user.email) {
        const { data: profileByEmail } = await supabase
          .from("profiles")
          .select("role")
          .eq("email", user.email)
          .maybeSingle()

        profile = profileByEmail
      }

      next = profile?.role === "admin" ? "/admin" : "/"
    }

    return NextResponse.redirect(new URL(next, origin))
  }

  return NextResponse.redirect(new URL("/", origin))
}
