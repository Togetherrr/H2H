"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { ArrowDown, ArrowUp, Film, Image as ImageIcon, Save, Upload } from "lucide-react"
import { MediaManager } from "@/components/admin/MediaManager"
import { uploadImage, upsertSiteSettings } from "@/app/admin/actions"
import { WinsManager } from "@/components/admin/WinsManager"

const FRAME_COUNT = 8

const DEFAULT_FRAMES = [
  { id: "bts-1", title: "Frame 1", src: "/bts/bts-1.png", alt: "Career records frame 1" },
  { id: "bts-2", title: "Frame 2", src: "/bts/bts-2.png", alt: "Career records frame 2" },
  { id: "bts-3", title: "Frame 3", src: "/bts/bts-3.png", alt: "Career records frame 3" },
  { id: "bts-4", title: "Frame 4", src: "/bts/bts-1.png", alt: "Career records frame 4" },
  { id: "bts-5", title: "Frame 5", src: "/bts/bts-2.png", alt: "Career records frame 5" },
  { id: "bts-6", title: "Frame 6", src: "/bts/bts-3.png", alt: "Career records frame 6" },
  { id: "bts-7", title: "Frame 7", src: "/bts/bts-1.png", alt: "Career records frame 7" },
  { id: "bts-8", title: "Frame 8", src: "/bts/bts-2.png", alt: "Career records frame 8" },
]

type CareerFrame = {
  id: string
  title: string
  src: string
  alt: string
}

function normalizeFrameEntries(rawFrames: any): CareerFrame[] {
  const list = Array.isArray(rawFrames) ? rawFrames : []

  return Array.from({ length: FRAME_COUNT }, (_, index) => {
    const fallback = DEFAULT_FRAMES[index]
    const frame = list[index]

    return {
      id: String(frame?.id ?? fallback.id),
      title: typeof frame?.title === "string" && frame.title.trim() ? frame.title.trim() : fallback.title,
      src: typeof frame?.src === "string"
        ? frame.src.trim()
        : typeof frame?.url === "string"
          ? frame.url.trim()
          : fallback.src,
      alt: typeof frame?.alt === "string" && frame.alt.trim()
        ? frame.alt.trim()
        : typeof frame?.title === "string" && frame.title.trim()
          ? frame.title.trim()
          : fallback.alt,
    }
  })
}

function normalizeFrames(initialSettings: any): CareerFrame[] {
  return normalizeFrameEntries(initialSettings?.metadata?.career_records_film_strip)
}

function FrameCard({
  frame,
  index,
  onChange,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  onUpload,
  isUploading,
}: {
  frame: CareerFrame
  index: number
  onChange: (next: CareerFrame) => void
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
  onUpload: (file: File) => void
  isUploading: boolean
}) {
  return (
    <Card className="border-slate-800 bg-slate-900/60 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">{frame.title || `Frame ${index + 1}`}</CardTitle>
        <Film className="size-4 text-sky-400" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80">
          {frame.src ? (
            <Image
              src={frame.src}
              alt={frame.alt || frame.title}
              fill
              unoptimized
              className="object-contain bg-slate-950 p-2"
            />
          ) : (
            <div className="text-center">
              <ImageIcon className="mx-auto h-10 w-10 text-slate-600" />
              <p className="mt-3 text-xs uppercase tracking-[0.25em] text-slate-500">No image</p>
            </div>
          )}
        </div>

        <div className="grid gap-2">
          <Input
            value={frame.title}
            onChange={(event) => onChange({ ...frame, title: event.target.value })}
            placeholder="Title"
            className="h-11 rounded-xl border-slate-800 bg-slate-950 text-white placeholder:text-slate-600"
          />
          <Input
            value={frame.src}
            onChange={(event) => onChange({ ...frame, src: event.target.value })}
            placeholder="Paste image URL or use upload"
            className="h-11 rounded-xl border-slate-800 bg-slate-950 text-white placeholder:text-slate-600"
          />
          <Input
            value={frame.alt}
            onChange={(event) => onChange({ ...frame, alt: event.target.value })}
            placeholder="Alt text"
            className="h-11 rounded-xl border-slate-800 bg-slate-950 text-white placeholder:text-slate-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-300">
            <Upload className="size-4" />
            {isUploading ? "Uploading..." : "Upload file"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) {
                  onUpload(file)
                  event.target.value = ""
                }
              }}
              disabled={isUploading}
            />
          </label>
          <MediaManager
            defaultCategory="Members"
            onSelect={(url) => onChange({ ...frame, src: url })}
            trigger={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 rounded-xl border-slate-800 bg-slate-950 px-4 text-sm font-medium text-slate-200 hover:border-sky-500 hover:bg-slate-900 hover:text-sky-300"
              >
                <ImageIcon className="size-4" />
                Select from media
              </Button>
            }
          />
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" className="size-9 border-slate-800 bg-slate-950" onClick={onMoveUp} disabled={!canMoveUp}>
              <ArrowUp className="size-4" />
            </Button>
            <Button type="button" variant="outline" size="icon" className="size-9 border-slate-800 bg-slate-950" onClick={onMoveDown} disabled={!canMoveDown}>
              <ArrowDown className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function CareerRecordsManager({
  initialSettings,
  musicWins = [],
  awardWins = [],
}: {
  initialSettings: any
  musicWins?: any[]
  awardWins?: any[]
}) {
  const [frames, setFrames] = useState<CareerFrame[]>(() => normalizeFrames(initialSettings))
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)

  useEffect(() => {
    setFrames((current) => normalizeFrameEntries(current))
  }, [])

  const updateFrame = (id: string, next: CareerFrame) => {
    setFrames((current) => current.map((frame) => (frame.id === id ? next : frame)))
  }

  const moveFrame = (index: number, direction: -1 | 1) => {
    setFrames((current) => {
      const next = [...current]
      const targetIndex = index + direction
      if (targetIndex < 0 || targetIndex >= next.length) return current
        ;[next[index], next[targetIndex]] = [next[targetIndex], next[index]]
      return next
    })
  }

  const handleUpload = async (id: string, file: File) => {
    setUploadingId(id)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const result = await uploadImage(formData)
      if (result?.error) {
        toast.error(result.error)
        return
      }

      setFrames((current) => current.map((frame) => (frame.id === id ? { ...frame, src: result.url || "" } : frame)))
      toast.success("Uploaded image")
    } finally {
      setUploadingId(null)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const payload = {
        ...initialSettings,
        id: initialSettings?.id ?? 1,
        group_name: initialSettings?.group_name ?? "H2H",
        metadata: {
          ...(initialSettings?.metadata || {}),
          career_records_film_strip: frames,
        },
      }

      const result = await upsertSiteSettings(payload)
      if (result?.error) {
        toast.error(result.error)
        return
      }

      toast.success("Saved career records film strip")
      window.location.reload()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="animate-in fade-in duration-300 space-y-16">
      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-white sm:text-5xl">Career Records</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
              Manage the 8 fixed film strip slots used in the Career Records section. Use URL, upload, or the media library, then save to sync the landing page.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="h-11 rounded-xl bg-sky-600 px-5 font-semibold text-white hover:bg-sky-700"
            >
              <Save className="size-4" />
              {isSaving ? "Saving..." : "Save template"}
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {frames.map((frame, index) => (
            <FrameCard
              key={frame.id}
              frame={frame}
              index={index}
              onChange={(next) => updateFrame(frame.id, next)}
              onMoveUp={() => moveFrame(index, -1)}
              onMoveDown={() => moveFrame(index, 1)}
              canMoveUp={index > 0}
              canMoveDown={index < frames.length - 1}
              onUpload={(file) => handleUpload(frame.id, file)}
              isUploading={uploadingId === frame.id}
            />
          ))}
        </div>
      </section>

      <section className="border-t border-slate-800 pt-16">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-light tracking-tight text-white">Wins History</h2>
          <p className="max-w-2xl text-base leading-7 text-slate-400">
            Add or remove music show and award ceremony wins. These will automatically update the stats and detail pages on the site.
          </p>
        </div>
        <WinsManager musicWins={musicWins} awardWins={awardWins} winsSync={(initialSettings?.metadata as any)?.wins_sync} />
      </section>
    </div>
  )
}
