import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const requestedNext = searchParams.get("next")

  if (code) {
    const supabase = await createClient()
    const { data: authData } = await supabase.auth.exchangeCodeForSession(code)
    const user = authData?.user

    let next = requestedNext ?? "/"

    if (user) {
      // We can't parallelize this easily because we need the user first, 
      // but we can make it more efficient.
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()

      const role = profile?.role
      next = role === "admin" ? "/admin" : (requestedNext ?? "/")
    }

    return NextResponse.redirect(new URL(next, origin))
  }

  return NextResponse.redirect(new URL("/", origin))
}
