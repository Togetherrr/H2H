import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (request.method !== "GET") {
    return NextResponse.next()
  }

  if (
    pathname.startsWith("/account") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin/")
  ) {
    return updateSession(request)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/api/admin/:path*"],
}
