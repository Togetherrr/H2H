import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"

function requireEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env var: ${name}`)
  return value
}

function parseArgs(argv: string[]) {
  return {
    cleanup: argv.includes("--cleanup"),
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL")
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY")

  const supabase = createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false },
  })

  const now = new Date()
  const start = new Date(now.getTime() - 60 * 60 * 1000) // -1h
  const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // +7d

  const appName = `Mock Awards Active Vote (${now.toISOString().slice(0, 10)})`

  if (args.cleanup) {
    const { data: apps, error: findError } = await supabase
      .from("voting_apps")
      .select("id,name")
      .like("name", "Mock Awards Active Vote%")
    if (findError) throw new Error(findError.message)

    if (!apps || apps.length === 0) {
      console.log("Nothing to cleanup.")
      return
    }

    const ids = apps.map((a) => a.id)
    const { error: deleteError } = await supabase.from("voting_apps").delete().in("id", ids)
    if (deleteError) throw new Error(deleteError.message)
    console.log(`Deleted ${ids.length} mock app(s).`)
    return
  }

  const { data: app, error: appError } = await supabase
    .from("voting_apps")
    .insert({
      name: appName,
      category: "awards",
      program_name: "Mock Award Ceremony",
      logo_url: "https://placehold.co/256x256/png",
      currencies: ["Votes", "Hearts", "Tokens"],
      collection_methods: ["Daily check-in", "Watch ads", "Complete missions"],
      android_url: "https://play.google.com/store",
      ios_url: "https://apps.apple.com",
    })
    .select("id")
    .single()

  if (appError) throw new Error(appError.message)

  const { error: strategyError } = await supabase.from("app_strategies").insert([
    { app_id: app.id, order_num: 1, content: "Do daily missions to maximize currency." },
    { app_id: app.id, order_num: 2, content: "Save resources for the final push." },
    { app_id: app.id, order_num: 3, content: "Coordinate voting time with global fans." },
  ])
  if (strategyError) throw new Error(strategyError.message)

  const { error: stepsError } = await supabase.from("guide_steps").insert([
    { app_id: app.id, step_num: 1, title: "Install & sign in", description: "Create an account and log in.", image_url: null },
    { app_id: app.id, step_num: 2, title: "Collect currency", description: "Check in daily, watch ads, complete missions.", image_url: null },
    { app_id: app.id, step_num: 3, title: "Vote during active round", description: "Use your currency before the round ends.", image_url: null },
  ])
  if (stepsError) throw new Error(stepsError.message)

  const { error: roundsError } = await (supabase as any).from("voting_rounds").insert([
    {
      app_id: app.id,
      round_name: "Final Round (ACTIVE)",
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      display_timezone: "Asia/Seoul",
      is_active: true,
    },
  ])
  if (roundsError) throw new Error(roundsError.message)

  console.log("Seeded mock active vote app:")
  console.log(`- id: ${app.id}`)
  console.log(`- name: ${appName}`)
  console.log(`- active round: ${start.toISOString()} -> ${end.toISOString()}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

