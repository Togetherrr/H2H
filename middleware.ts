import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /account with Supabase session checks (avoid calling Supabase for every route).
  if (pathname.startsWith("/account")) {
    return updateSession(request)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/account/:path*"],
}
