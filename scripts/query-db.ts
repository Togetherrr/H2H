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
  const { data, error } = await supabase
    .from("voting_apps")
    .update({
      android_url: "https://play.google.com/store/search?q=upick&c=apps",
      ios_url: "https://apps.apple.com/us/app/upick-global-fandom-platform/id6443780271"
    })
    .eq("id", "ab41f2da-4ffd-43a3-bd87-f0e917ae8c84");

  if (error) console.error("Error updating:", error);
  else console.log("Successfully updated UPICK URLs!");
}

run();
