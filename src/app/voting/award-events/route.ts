// app/api/voting/award-events/route.ts

import { NextResponse } from "next/server"
import { getActiveAwardsVoteApps } from "@/lib/supabase/voting-service-server"

export const revalidate = 60

export async function GET() {
    const result = await getActiveAwardsVoteApps()
    return NextResponse.json(result)
}