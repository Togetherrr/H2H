"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, User, Save, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { uploadImage, upsertSiteSettings } from "@/app/admin/actions"
import { MediaManager } from "@/components/admin/MediaManager"

const MEMBERS = [
  { tag: 'JIWOO', name: 'Jiwoo' },
  { tag: 'CARMEN', name: 'Carmen' },
  { tag: 'STELLA', name: 'Stella' },
  { tag: 'YUHA', name: 'Yuha' },
  { tag: 'JUUN', name: 'Juun' },
  { tag: 'A-NA', name: 'A-na' },
  { tag: 'IAN', name: 'Ian' },
  { tag: 'YEON', name: 'Yeon' },
]

type LineupRevealImages = Record<string, string>

function getInitialImages(initialSettings: any): LineupRevealImages {
  const rawImages = initialSettings?.metadata?.lineup_reveal_images
  const normalized: LineupRevealImages = {}

  for (const member of MEMBERS) {
    const value = rawImages?.[member.tag]
    normalized[member.tag] = typeof value === "string" ? value : ""
  }

  return normalized
}

function MemberImageUploadCard({
  member,
  value,
  onChange,
  onUpload,
  isUploading,
}: {
  member: { tag: string, name: string }
  value: string
  onChange: (value: string) => void
  onUpload: (file: File) => void
  isUploading: boolean
}) {
  return (
    <Card className="border-slate-800 bg-slate-900/60 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">{member.name}</CardTitle>
        <User className="size-4 text-sky-400" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80">
          {value ? (
            <Image
              src={value}
              alt={member.name}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="text-center">
              <ImageIcon className="mx-auto h-10 w-10 text-slate-600" />
              <p className="mt-3 text-xs uppercase tracking-[0.25em] text-slate-500">No image</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Paste image URL or use upload"
            className="h-11 rounded-xl border-slate-800 bg-slate-950 text-white placeholder:text-slate-600"
          />
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
              onSelect={onChange}
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
        </div>
      </CardContent>
    </Card>
  )
}

export function LineupRevealManager({ initialSettings }: { initialSettings: any }) {
  const [imagesByTag, setImagesByTag] = useState<LineupRevealImages>(() => getInitialImages(initialSettings))
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingTag, setUploadingTag] = useState<string | null>(null)

  const handleFileUpload = async (tag: string, file: File) => {
    setUploadingTag(tag)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const result = await uploadImage(formData)
      if (result?.error) {
        toast.error(result.error)
        return
      }

      setImagesByTag((current) => ({ ...current, [tag]: result.url || "" }))
      toast.success(`Uploaded ${tag}`)
    } finally {
      setUploadingTag(null)
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
          lineup_reveal_images: imagesByTag,
        },
      }

      const result = await upsertSiteSettings(payload)
      if (result?.error) {
        toast.error(result.error)
        return
      }

      toast.success("Saved lineup reveal template")
      window.location.reload()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-white sm:text-5xl">Lineup Reveal</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
            Upload an image or paste a URL for each member. Landing will use these values for the reveal animation.
          </p>
        </div>
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

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {MEMBERS.map((member) => (
          <MemberImageUploadCard
            key={member.tag}
            member={member}
            value={imagesByTag[member.tag] || ""}
            onChange={(value) => setImagesByTag((current) => ({ ...current, [member.tag]: value }))}
            onUpload={(file) => handleFileUpload(member.tag, file)}
            isUploading={uploadingTag === member.tag}
          />
        ))}
      </div>
    </div>
  )
}
