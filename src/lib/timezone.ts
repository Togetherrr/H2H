import type { TimeZone } from "@/components/navbar"

export function timeZoneToIana(timeZone: TimeZone): string | undefined {
  switch (timeZone) {
    case "KST":
      return "Asia/Seoul"
    case "EDT":
      return "America/New_York"
    case "UTC":
      return "UTC"
    case "LOCAL":
      return undefined
    default:
      return "Asia/Seoul"
  }
}

export function formatDateTime(
  value: string | Date,
  timeZone: TimeZone,
  locale: string = "en-GB",
  options: Intl.DateTimeFormatOptions = {},
) {
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return typeof value === "string" ? value : ""

  const tz = timeZoneToIana(timeZone)
  const formatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: tz,
    ...options,
  })

  return formatter.format(date)
}

export function formatDateOnly(value: string | Date, timeZone: TimeZone, locale: string = "en-GB") {
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return typeof value === "string" ? value : ""

  const tz = timeZoneToIana(timeZone)
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: tz,
  }).format(date)
}
