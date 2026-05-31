// app/api/voting/award-events/route.ts

import { NextResponse } from "next/server"
import { getActiveAwardsVoteApps } from "@/lib/supabase/voting-service-server"
import { hasSupabaseEnv } from "@/lib/supabase/env"

export const dynamic = "force-dynamic"

export async function GET() {
    if (!hasSupabaseEnv()) {
        return NextResponse.json({ events: [], error: null })
    }

    const result = await getActiveAwardsVoteApps()
    return NextResponse.json(result)
}