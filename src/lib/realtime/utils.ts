export function floorToMinutes(date: Date, minutes: number) {
  const ms = date.getTime()
  const step = minutes * 60_000
  return new Date(Math.floor(ms / step) * step)
}

export function parseSpotifyTrackId(value: string | undefined | null) {
  if (!value) return null

  const urlMatch = value.match(/open\.spotify\.com\/track\/([A-Za-z0-9]+)/)
  if (urlMatch?.[1]) return urlMatch[1]

  const uriMatch = value.match(/spotify:track:([A-Za-z0-9]+)/)
  if (uriMatch?.[1]) return uriMatch[1]

  // As a last resort, accept the raw string if it looks like a Spotify ID.
  if (/^[A-Za-z0-9]{22}$/.test(value)) return value

  return null
}

