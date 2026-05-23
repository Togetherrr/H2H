export async function safeFetch(input: RequestInfo | URL, init?: RequestInit) {
  try {
    return await fetch(input, init)
  } catch (err) {
    const message = (err as Error)?.message ?? "fetch failed"
    return new Response(JSON.stringify({ message }), {
      status: 503,
      headers: { "content-type": "application/json" },
    })
  }
}

