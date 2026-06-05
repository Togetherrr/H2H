"use client"

import { useMemo, useState } from "react"
import { CalendarClock, Link as LinkIcon, Save, ShoppingCart, Trash2, Youtube } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { upsertSiteSettings } from "@/app/admin/actions"
import { formatDateTime, timeZoneToIana } from "@/lib/timezone"
import type { TimeZone } from "@/components/navbar"

type ComebackWatchSettings = {
  title: string
  releaseDate: string
  releaseTime: string
  timeZone: TimeZone
  shoppingLabel: string
  shoppingUrl: string
  streamLabel: string
  streamUrl: string
  sourceLabel: string
  sourceUrl: string
  themeImageUrl: string
  note: string
}

const TIME_ZONES: Array<{ value: TimeZone; label: string; hint: string }> = [
  { value: "KST", label: "KST", hint: "Default for comeback scheduling" },
  { value: "UTC", label: "UTC", hint: "Universal time" },
  { value: "EDT", label: "EDT", hint: "Eastern daylight time" },
  { value: "LOCAL", label: "LOCAL", hint: "Use browser locale" },
]

function pad2(value: string | number) {
  return String(value).padStart(2, "0")
}

function formatValueForInput(value: string, timeZone: TimeZone) {
  if (!value) return { date: "", time: "" }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return { date: "", time: "" }

  const iana = timeZoneToIana(timeZone)
  if (!iana) {
    return {
      date: `${parsed.getFullYear()}-${pad2(parsed.getMonth() + 1)}-${pad2(parsed.getDate())}`,
      time: `${pad2(parsed.getHours())}:${pad2(parsed.getMinutes())}`,
    }
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: iana,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  const parts = Object.fromEntries(formatter.formatToParts(parsed).map((part) => [part.type, part.value])) as Record<string, string>
  const hour = parts.hour === "24" ? "00" : parts.hour

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${hour}:${parts.minute}`,
  }
}

function getOffsetSuffix(timeZone: TimeZone, dateValue: string, timeValue: string) {
  switch (timeZone) {
    case "KST":
      return "+09:00"
    case "UTC":
      return "Z"
    case "EDT":
      return "-04:00"
    case "LOCAL": {
      const localDate = new Date(`${dateValue}T${timeValue}:00`)
      const offsetMinutes = -localDate.getTimezoneOffset()
      const sign = offsetMinutes >= 0 ? "+" : "-"
      const absoluteMinutes = Math.abs(offsetMinutes)
      const hours = pad2(Math.floor(absoluteMinutes / 60))
      const minutes = pad2(absoluteMinutes % 60)
      return `${sign}${hours}:${minutes}`
    }
  }
}

function buildReleaseAt(dateValue: string, timeValue: string, timeZone: TimeZone) {
  if (!dateValue || !timeValue) return ""
  return `${dateValue}T${timeValue}:00${getOffsetSuffix(timeZone, dateValue, timeValue)}`
}

function normalizeInitialSettings(initialSettings: any): ComebackWatchSettings {
  const comeback = initialSettings?.metadata?.comeback_watch ?? initialSettings?.metadata?.upcoming_comeback ?? {}
  const timeZone = (comeback.timeZone ?? comeback.time_zone ?? "KST") as TimeZone
  const formatted = formatValueForInput((comeback.releaseAt ?? comeback.release_at ?? "") as string, timeZone)

  return {
    title: typeof comeback.title === "string" && comeback.title.trim() ? comeback.title.trim() : "",
    releaseDate: formatted.date,
    releaseTime: formatted.time || "00:00",
    timeZone,
    shoppingLabel: typeof comeback.shoppingLabel === "string" && comeback.shoppingLabel.trim() ? comeback.shoppingLabel.trim() : "Pre-order",
    shoppingUrl: typeof comeback.shoppingUrl === "string" ? comeback.shoppingUrl.trim() : "",
    streamLabel: typeof comeback.streamLabel === "string" && comeback.streamLabel.trim() ? comeback.streamLabel.trim() : "Stream",
    streamUrl: typeof comeback.streamUrl === "string" ? comeback.streamUrl.trim() : "",
    sourceLabel: typeof comeback.source?.label === "string" && comeback.source.label.trim() ? comeback.source.label.trim() : "Official announcement",
    sourceUrl: typeof comeback.source?.href === "string" ? comeback.source.href.trim() : "https://www.youtube.com",
    themeImageUrl: typeof comeback.themeImageUrl === "string" ? comeback.themeImageUrl.trim() : "",
    note: typeof comeback.note === "string" ? comeback.note.trim() : "",
  }
}

function buildMetadataPayload(initialSettings: any, comebackWatch: Record<string, string | TimeZone>) {
  return {
    ...(initialSettings?.metadata || {}),
    comeback_watch: comebackWatch,
  }
}

function buildBackgroundImage(value: string) {
  const trimmed = value.trim()
  if (!/^https?:\/\//i.test(trimmed)) return null
  return `url("${trimmed.replace(/"/g, '\\"')}")`
}

export function ComebackWatchManager({ initialSettings }: { initialSettings: any }) {
  const [formData, setFormData] = useState<ComebackWatchSettings>(() => normalizeInitialSettings(initialSettings))
  const [isSaving, setIsSaving] = useState(false)

  const releaseAtPreview = useMemo(() => {
    if (!formData.releaseDate || !formData.releaseTime) return ""
    return buildReleaseAt(formData.releaseDate, formData.releaseTime, formData.timeZone)
  }, [formData.releaseDate, formData.releaseTime, formData.timeZone])

  const previewLabel = useMemo(() => {
    if (!releaseAtPreview) return "No release date yet"

    const parsed = new Date(releaseAtPreview)
    if (Number.isNaN(parsed.getTime())) return releaseAtPreview

    return `${formatDateTime(parsed, formData.timeZone, "en-GB", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })} ${formData.timeZone}`
  }, [formData.timeZone, releaseAtPreview])

  const themeBackgroundImage = useMemo(() => buildBackgroundImage(formData.themeImageUrl), [formData.themeImageUrl])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      const payload = {
        id: initialSettings?.id ?? 1,
        group_name: initialSettings?.group_name ?? "H2H",
        metadata: buildMetadataPayload(initialSettings, {
          title: formData.title.trim(),
          releaseAt: buildReleaseAt(formData.releaseDate, formData.releaseTime, formData.timeZone),
          timeZone: formData.timeZone,
          note: formData.note.trim(),
          shoppingLabel: formData.shoppingLabel.trim(),
          shoppingUrl: formData.shoppingUrl.trim(),
          streamLabel: formData.streamLabel.trim(),
          streamUrl: formData.streamUrl.trim(),
          sourceLabel: formData.sourceLabel.trim(),
          sourceUrl: formData.sourceUrl.trim(),
          themeImageUrl: formData.themeImageUrl.trim(),
        }),
      }

      const result = await upsertSiteSettings(payload)
      if (result?.error) {
        toast.error(result.error)
        return
      }

      toast.success("Saved comeback countdown settings")
      window.location.reload()
    } catch (error) {
      toast.error("Could not save comeback settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete the comeback countdown settings? This removes the live public countdown.")
    if (!confirmed) return

    setIsSaving(true)

    try {
      const payload = {
        id: initialSettings?.id ?? 1,
        group_name: initialSettings?.group_name ?? "H2H",
        metadata: {
          ...(initialSettings?.metadata || {}),
        },
      }

      delete (payload.metadata as Record<string, unknown>).comeback_watch
      delete (payload.metadata as Record<string, unknown>).upcoming_comeback

      const result = await upsertSiteSettings(payload)
      if (result?.error) {
        toast.error(result.error)
        return
      }

      toast.success("Deleted comeback countdown settings")
      window.location.reload()
    } catch {
      toast.error("Could not delete comeback settings")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="animate-in fade-in duration-300">
      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-white sm:text-5xl">Comeback Watch</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
              Set the album title, official release time in KST, shopping link, and the post-release YouTube stream link.
            </p>
          </div>

          <Card className="border-slate-800 bg-slate-900/60 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-white">Countdown Details</CardTitle>
              <CardDescription className="text-slate-400">The countdown switches to Stream when the release time passes.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium text-slate-300">Album / MV title</Label>
                <Input
                  value={formData.title}
                  onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
                  className="h-11 rounded-xl border-slate-700 bg-slate-950 text-white placeholder:text-slate-600"
                  placeholder="Album title"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Release date</Label>
                <Input
                  type="date"
                  value={formData.releaseDate}
                  onChange={(event) => setFormData((current) => ({ ...current, releaseDate: event.target.value }))}
                  className="h-11 rounded-xl border-slate-700 bg-slate-950 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Release time</Label>
                <Input
                  type="time"
                  value={formData.releaseTime}
                  onChange={(event) => setFormData((current) => ({ ...current, releaseTime: event.target.value }))}
                  className="h-11 rounded-xl border-slate-700 bg-slate-950 text-white"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium text-slate-300">Timezone</Label>
                <Select
                  value={formData.timeZone}
                  onValueChange={(value) => setFormData((current) => ({ ...current, timeZone: value as TimeZone }))}
                >
                  <SelectTrigger className="h-11 rounded-xl border-slate-700 bg-slate-950 text-white">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_ZONES.map((zone) => (
                      <SelectItem key={zone.value} value={zone.value}>
                        <span className="flex items-center gap-2">
                          <span className="font-semibold">{zone.label}</span>
                          <span className="text-xs text-slate-500">{zone.hint}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Shopping link label</Label>
                <Input
                  value={formData.shoppingLabel}
                  onChange={(event) => setFormData((current) => ({ ...current, shoppingLabel: event.target.value }))}
                  className="h-11 rounded-xl border-slate-700 bg-slate-950 text-white placeholder:text-slate-600"
                  placeholder="Pre-order"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Shopping URL</Label>
                <Input
                  value={formData.shoppingUrl}
                  onChange={(event) => setFormData((current) => ({ ...current, shoppingUrl: event.target.value }))}
                  className="h-11 rounded-xl border-slate-700 bg-slate-950 text-white placeholder:text-slate-600"
                  placeholder="https://store..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Stream link label</Label>
                <Input
                  value={formData.streamLabel}
                  onChange={(event) => setFormData((current) => ({ ...current, streamLabel: event.target.value }))}
                  className="h-11 rounded-xl border-slate-700 bg-slate-950 text-white placeholder:text-slate-600"
                  placeholder="Stream"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Stream URL</Label>
                <Input
                  value={formData.streamUrl}
                  onChange={(event) => setFormData((current) => ({ ...current, streamUrl: event.target.value }))}
                  className="h-11 rounded-xl border-slate-700 bg-slate-950 text-white placeholder:text-slate-600"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium text-slate-300">Theme Background Image URL (Optional)</Label>
                <Input
                  value={formData.themeImageUrl}
                  onChange={(event) => setFormData((current) => ({ ...current, themeImageUrl: event.target.value }))}
                  className="h-11 rounded-xl border-slate-700 bg-slate-950 text-white placeholder:text-slate-600"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium text-slate-300">Note</Label>
                <Textarea
                  value={formData.note}
                  onChange={(event) => setFormData((current) => ({ ...current, note: event.target.value }))}
                  className="min-h-28 rounded-2xl border-slate-700 bg-slate-950 text-white placeholder:text-slate-600"
                  placeholder="Short explanation shown to the team"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-slate-800 bg-slate-900/60 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-white">
                <CalendarClock className="size-5 text-sky-400" />
                Live Preview
              </CardTitle>
              <CardDescription className="text-slate-400">This is the release text shown on the homepage countdown.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-[10px] uppercase tracking-[0.35em] text-sky-400">Release window</p>
                <p className="mt-2 text-sm font-semibold text-white">{previewLabel}</p>
                <p className="mt-1 text-xs text-slate-500">Saved as ISO with timezone attached</p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                <div className="relative aspect-[16/10]">
                  {themeBackgroundImage ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: themeBackgroundImage }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-800" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
                  <div className="absolute inset-0 flex items-end p-4">
                    <div className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                      <p className="text-[10px] uppercase tracking-[0.35em] text-sky-300">Theme background</p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {formData.themeImageUrl || "No background image yet"}
                      </p>
                      <p className="mt-1 text-xs text-slate-200/70">
                        When set, the comeback card on the homepage uses this image as an extra background layer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <ShoppingCart className="size-4 text-sky-400" />
                  <span>{formData.shoppingLabel || "Pre-order"}</span>
                </div>
                <div className="max-h-20 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs leading-relaxed text-slate-500 [overflow-wrap:anywhere] break-words">
                  {formData.shoppingUrl || "No shopping URL yet"}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Youtube className="size-4 text-rose-400" />
                  <span>{formData.streamLabel || "Stream"}</span>
                </div>
                <div className="max-h-20 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs leading-relaxed text-slate-500 [overflow-wrap:anywhere] break-words">
                  {formData.streamUrl || "No stream URL yet"}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <LinkIcon className="size-4 text-emerald-400" />
                  <span>{formData.sourceLabel || "Official announcement"}</span>
                </div>
                <div className="max-h-20 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs leading-relaxed text-slate-500 [overflow-wrap:anywhere] break-words">
                  {formData.sourceUrl || "No source URL yet"}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="h-11 w-full rounded-xl bg-sky-600 font-semibold text-white hover:bg-sky-700"
                >
                  <Save className="size-4" />
                  {isSaving ? "Saving..." : "Save comeback settings"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isSaving}
                  className="h-11 w-full rounded-xl border-rose-900/60 bg-rose-950/40 font-semibold text-rose-200 hover:bg-rose-950 hover:text-rose-100"
                >
                  <Trash2 className="size-4" />
                  Delete comeback settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
