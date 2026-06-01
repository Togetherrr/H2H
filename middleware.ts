import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /account and /admin with Supabase session checks (avoid calling Supabase for every route).
  if (pathname.startsWith("/account") || pathname.startsWith("/admin")) {
    return updateSession(request)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
}
