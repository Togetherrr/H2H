const baseUrl = process.env.REALTIME_POLL_BASE_URL || process.env.APP_URL || "http://localhost:3000"
const cronSecret = process.env.H2H_CRON_SECRET
const dryRun = process.env.REALTIME_POLL_DRY_RUN !== "0"

if (!cronSecret) {
  console.error("Missing H2H_CRON_SECRET in environment.")
  process.exit(1)
}

const targetUrl = new URL("/api/realtime/poll", baseUrl)
if (dryRun) {
  targetUrl.searchParams.set("dryRun", "1")
}

try {
  const response = await fetch(targetUrl, {
    headers: {
      "x-cron-secret": cronSecret,
    },
  })

  const bodyText = await response.text()
  let body

  try {
    body = JSON.parse(bodyText)
  } catch {
    body = bodyText
  }

  console.log(JSON.stringify({ ok: response.ok, status: response.status, body }, null, 2))

  if (!response.ok) {
    process.exit(1)
  }
} catch (error) {
  console.error("Failed to call realtime poll endpoint:", error)
  process.exit(1)
}