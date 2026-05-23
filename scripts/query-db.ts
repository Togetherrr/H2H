import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"

const envLocalPath = path.join(process.cwd(), ".env.local")
const envContent = fs.readFileSync(envLocalPath, "utf-8")
const env: Record<string, string> = {}
envContent.split("\n").forEach((line) => {
  const parts = line.split("=")
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join("=").trim()
  }
})

const url = env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error("Missing supabase env")
  process.exit(1)
}

const supabase = createClient(url, serviceKey)

async function run() {
  console.log("Fetching music_show_wins...")
  const { data: musicWins, error: musicError } = await supabase
    .from("music_show_wins")
    .select("*")
  if (musicError) console.error("Music Error:", musicError)
  else console.log(`Found ${musicWins?.length} music show wins:`, JSON.stringify(musicWins, null, 2))

  console.log("\nFetching award_ceremony_wins...")
  const { data: awardWins, error: awardError } = await supabase
    .from("award_ceremony_wins")
    .select("*")
  if (awardError) console.error("Award Error:", awardError)
  else console.log(`Found ${awardWins?.length} award ceremony wins:`, JSON.stringify(awardWins, null, 2))
}

run()
