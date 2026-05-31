const baseUrl = process.env.APP_URL || "http://localhost:3000"
const token = process.env.H2H_WINS_SYNC_TOKEN

if (!token) {
  console.error("Missing H2H_WINS_SYNC_TOKEN in environment.")
  process.exit(1)
}

const targetUrl = new URL("/api/wins/sync", baseUrl)

try {
  const response = await fetch(targetUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
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
  if (!response.ok) process.exit(1)
} catch (error) {
  console.error("Failed to call wins sync endpoint:", error)
  process.exit(1)
}

