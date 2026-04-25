import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { Database } from "@/lib/supabase/database.types"
import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/env"

const ADMIN_PATH_PREFIX = "/admin"

export async function updateSession(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })
  const { url, anonKey } = getSupabaseEnv()

  if (!url || !anonKey) {
    return response
  }

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))

        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (request.nextUrl.pathname.startsWith(ADMIN_PATH_PREFIX)) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = "/login"
      redirectUrl.searchParams.set("next", request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()

    if (profile?.role !== "admin") {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = "/auth/error"
      redirectUrl.searchParams.set("reason", "admin-only")
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}
