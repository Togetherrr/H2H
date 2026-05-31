"use client"

import Image from "next/image"
import { type Dispatch, type SetStateAction, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DynamicListInput } from "@/components/admin/DynamicListInput"
import { createVotingApp, deleteVotingApp, updateVotingApp, uploadImage } from "@/app/admin/actions"
import { toast } from "sonner"
import { BadgeCheck, Plus, Trash2, Edit2, XCircle, X, Upload, Loader2, AppWindow } from "lucide-react"

const TEMPLATE = {
  currencies: ["Points", "Tokens", "Coupons"],
  collection: ["Daily check-in", "Watch ads", "Complete missions"],
  strategies: ["Vote daily", "Coordinate with global fans"],
  guide_step: {
    title: "Open the app and log in",
    description: "Complete daily missions to earn voting currency.",
    image_url: "",
  },
}

type GuideStepForm = {
  title: string
  description: string
  image_url: string
}

type AppForm = {
  name: string
  category: "music_shows" | "awards"
  program_name: string
  logo_url: string
  android_url: string
  ios_url: string
  website_url: string
  guide_url: string
  currencies: string[]
  collection_methods: string[]
  strategies: string[]
  guide_steps: GuideStepForm[]
  description: string
  reflection_rate: string[]
  is_featured: boolean
}

function createEmptyForm(): AppForm {
  return {
    name: "",
    category: "music_shows", // Default to music shows
    program_name: "",
    logo_url: "",
    android_url: "",
    ios_url: "",
    website_url: "",
    guide_url: "",
    currencies: [""],
    collection_methods: [""],
    strategies: [""],
    guide_steps: [],
    description: "",
    reflection_rate: [""],
    is_featured: false,
  }
}

function normalizeText(value: any) {
  if (typeof value !== "string") return ""
  return value.trim()
}

const STORAGE_KEY = "h2h_app_directory_draft"

export function VotingAppsManager({ initialApps }: { initialApps: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AppForm>(createEmptyForm())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)

  useEffect(() => {
    if (editingId) return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try { setForm(JSON.parse(saved)) } catch (e) { }
    }
  }, [editingId])

  useEffect(() => {
    if (editingId) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
  }, [form, editingId])

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(`step-${index}`)

    try {
      const formData = new FormData()
      formData.append("file", file)
      const result = await uploadImage(formData)

      if (result.error) {
        toast.error(`Upload error: ${result.error}`)
      } else if (result.url) {
        handleGuideStepChange(index, "image_url", result.url)
        toast.success("Image uploaded!")
      }
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message || "Unknown error"}`)
    } finally {
      setUploading(null)
      e.target.value = ""
    }
  }

  const addGuideStep = () => {
    setForm((current) => ({
      ...current,
      guide_steps: [...current.guide_steps, { title: "", description: "", image_url: "" }],
    }))
  }

  const removeGuideStep = (index: number) => {
    setForm((current) => ({
      ...current,
      guide_steps: current.guide_steps.filter((_, idx) => idx !== index),
    }))
  }

  const handleGuideStepChange = (index: number, field: keyof GuideStepForm, value: string) => {
    setForm((current) => {
      const guide_steps = [...current.guide_steps]
      guide_steps[index] = { ...guide_steps[index], [field]: value }
      return { ...current, guide_steps }
    })
  }

  const applyTemplate = () => {
    setForm((current) => ({
      ...current,
      currencies: TEMPLATE.currencies,
      collection_methods: TEMPLATE.collection,
      strategies: TEMPLATE.strategies,
      guide_steps: current.guide_steps.length === 0 ? [{ ...TEMPLATE.guide_step }] : current.guide_steps,
    }))
  }

  const resetForm = () => {
    setForm(createEmptyForm())
    if (!editingId) localStorage.removeItem(STORAGE_KEY)
    setEditingId(null)
  }

  const handleEdit = (app: any) => {
    setEditingId(app.id)
    setForm({
      name: app.name || "",
      category: app.category === "awards" ? "awards" : "music_shows",
      program_name: app.program_name || "",
      logo_url: app.logo_url || "",
      android_url: app.android_url || "",
      ios_url: app.ios_url || "",
      website_url: (app as any).website_url || "",
      guide_url: (app as any).guide_url || "",
      currencies: app.currencies || [""],
      collection_methods: app.collection_methods || [""],
      strategies: (app.app_strategies || []).map((s: any) => s.content) || [""],
      guide_steps: app.guide_steps || [],
      description: app.description || "",
      reflection_rate: (() => {
        const raw = app.reflection_rate;
        if (Array.isArray(raw)) return raw;
        if (typeof raw === 'string') {
          const trimmed = raw.trim();
          if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            try {
              const parsed = JSON.parse(trimmed);
              return Array.isArray(parsed) ? parsed : [trimmed];
            } catch (e) {
              return [trimmed];
            }
          }
          return [trimmed];
        }
        return [""];
      })(),
      is_featured: !!app.is_featured,
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleClone = (app: any) => {
    handleEdit(app)
    setEditingId(null)
    toast.info(`Cloned ${app.name}. You can now modify and save as a new app.`)
  }

  const existingProgramNames = Array.from(new Set(initialApps.map(a => a.program_name).filter(Boolean))) as string[]

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this voting app?")) return
    const result = await deleteVotingApp(id)
    if (result.error) toast.error(result.error)
    else toast.success("Deleted!")
  }

  const submitForm = async () => {
    if (!normalizeText(form.name)) {
      toast.error("Please enter the app name")
      return
    }

    setIsSubmitting(true)
    const payload = {
      name: normalizeText(form.name),
      category: form.category,
      program_name: normalizeText(form.program_name) || null,
      logo_url: normalizeText(form.logo_url) || null,
      android_url: normalizeText(form.android_url) || null,
      ios_url: normalizeText(form.ios_url) || null,
      website_url: normalizeText(form.website_url) || null,
      guide_url: normalizeText(form.guide_url) || null,
      currencies: form.currencies.map(normalizeText).filter(Boolean),
      collection_methods: form.collection_methods.map(normalizeText).filter(Boolean),
      strategies: form.strategies.map(normalizeText).filter(Boolean),
      guide_steps: form.guide_steps.map((step) => ({
        title: normalizeText(step.title) || null,
        description: normalizeText(step.description) || null,
        image_url: normalizeText(step.image_url) || null,
      })),
      description: normalizeText(form.description) || null,
      reflection_rate: form.reflection_rate.map(normalizeText).filter(Boolean),
      is_featured: !!form.is_featured,
      rounds: [], // App Directory does NOT manage rounds!
    }

    const result = editingId
      ? await updateVotingApp(editingId, payload)
      : await createVotingApp(payload)

    setIsSubmitting(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }

    toast.success(editingId ? "Updated!" : "Created!")
    resetForm()
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <div className="flex items-center gap-3 text-amber-300">
          <AppWindow className="size-6" />
          <p className="text-sm font-semibold uppercase tracking-[0.45em]">App Directory</p>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-light tracking-tight text-white sm:text-4xl">
              {editingId ? "Edit App" : "App Directory"}
            </h2>
            <p className="mt-2 text-slate-400">
              Quản lý danh sách các ứng dụng (UPICK, IdolChamp...). Không tạo vòng vote ở đây.
            </p>
          </div>
          {editingId && (
            <Button
              variant="outline"
              onClick={resetForm}
              className="border-red-900/50 bg-red-950/20 text-red-400 hover:text-red-300 hover:bg-red-900/30"
            >
              <XCircle className="size-4 mr-2" /> Cancel editing
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-900/70 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-800/50 bg-slate-800/20">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                {editingId ? <Edit2 className="size-4 text-amber-400" /> : <Plus className="size-4 text-amber-400" />}
                {editingId ? "Edit" : "Create"}: Base Application
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label className="text-slate-300">App name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
                    placeholder="Mubeat, UPICK..."
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-slate-300">Category</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                    value={form.category}
                    onChange={(e) => setForm((c) => ({ ...c, category: e.target.value as any }))}
                  >
                    <option value="music_shows">Music Show</option>
                    <option value="awards">Award App</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label className="text-slate-300">Logo URL</Label>
                  <Input
                    value={form.logo_url}
                    onChange={(e) => setForm((c) => ({ ...c, logo_url: e.target.value }))}
                    placeholder="https://.../logo.png"
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-slate-300">Program name (Optional)</Label>
                  <Input
                    value={form.program_name}
                    onChange={(e) => setForm((c) => ({ ...c, program_name: e.target.value }))}
                    placeholder="e.g. Show Champion"
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label className="text-slate-300">Android URL</Label>
                  <Input
                    value={form.android_url}
                    onChange={(e) => setForm((c) => ({ ...c, android_url: e.target.value }))}
                    placeholder="Play Store link"
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-slate-300">iOS URL</Label>
                  <Input
                    value={form.ios_url}
                    onChange={(e) => setForm((c) => ({ ...c, ios_url: e.target.value }))}
                    placeholder="App Store link"
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-slate-300">Website URL</Label>
                  <Input
                    value={form.website_url}
                    onChange={(e) => setForm((c) => ({ ...c, website_url: e.target.value }))}
                    placeholder="Web voting link"
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-slate-300">
                  External Guide URL{" "}
                  <span className="text-slate-500 font-normal text-xs">
                    (tuỳ chọn — nếu có sẽ mở link ngoài thay vì hiện modal steps)
                  </span>
                </Label>
                <Input
                  value={form.guide_url}
                  onChange={(e) => setForm((c) => ({ ...c, guide_url: e.target.value }))}
                  placeholder="https://twitter.com/h2h_official/guide-post"
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-slate-300">Short Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
                  placeholder="App description..."
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <DynamicListInput
                label="Reflection Rate Criteria (For Music Shows)"
                items={form.reflection_rate}
                onChange={(value) => setForm((c) => ({ ...c, reflection_rate: value }))}
                placeholder="50% Digital"
              />

              <div className="flex items-center space-x-2 py-2">
                <input
                  type="checkbox"
                  id="is-featured"
                  checked={form.is_featured}
                  onChange={(e) => setForm((c) => ({ ...c, is_featured: e.target.checked }))}
                  className="size-4 rounded border-slate-700 bg-slate-800 text-sky-600 focus:ring-sky-500"
                />
                <Label htmlFor="is-featured" className="text-sm font-medium text-slate-300 cursor-pointer">
                  Featured on Home Page (Highlight this app on the home dashboard)
                </Label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <div>
                  <p className="text-sm font-semibold text-white">Quick template</p>
                  <p className="text-xs text-slate-500">Auto-fill base fields and sample guide step.</p>
                </div>
                <Button type="button" variant="outline" onClick={applyTemplate} className="border-slate-800 text-slate-300">
                  Apply template
                </Button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <DynamicListInput
                  label="Currencies"
                  items={form.currencies}
                  onChange={(value) => setForm((c) => ({ ...c, currencies: value }))}
                  placeholder="Points"
                />
                <DynamicListInput
                  label="Collection methods"
                  items={form.collection_methods}
                  onChange={(value) => setForm((c) => ({ ...c, collection_methods: value }))}
                  placeholder="Watch ads"
                />
              </div>

              <DynamicListInput
                label="Strategies"
                items={form.strategies}
                onChange={(value) => setForm((c) => ({ ...c, strategies: value }))}
                placeholder="Vote daily"
              />

              <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sky-400 font-bold uppercase tracking-wider text-xs">Guide Steps (How to vote)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addGuideStep} className="h-7 border-slate-800 text-xs text-slate-300">
                    Add step
                  </Button>
                </div>

                <div className="space-y-4">
                  {form.guide_steps.map((step, idx) => (
                    <div key={idx} className="grid gap-3 rounded-lg border border-slate-800 p-3 bg-slate-900/50">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Step {idx + 1}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeGuideStep(idx)} className="h-6 w-6 p-0 text-slate-500 hover:text-red-400">
                          <X className="size-3" />
                        </Button>
                      </div>

                      <div className="grid gap-2">
                        <Input
                          value={step.title}
                          onChange={(e) => handleGuideStepChange(idx, "title", e.target.value)}
                          placeholder="Step title (e.g. Login)"
                          className="h-8 bg-slate-950 border-slate-800 text-white text-xs"
                        />
                        <Input
                          value={step.description}
                          onChange={(e) => handleGuideStepChange(idx, "description", e.target.value)}
                          placeholder="Description (e.g. Use Kakao or Google to login)"
                          className="h-8 bg-slate-950 border-slate-800 text-white text-xs"
                        />
                        <div className="flex gap-2">
                          <Input
                            value={step.image_url}
                            onChange={(e) => handleGuideStepChange(idx, "image_url", e.target.value)}
                            placeholder="Image URL (or upload →)"
                            className="h-8 bg-slate-950 border-slate-800 text-white text-xs flex-1"
                          />
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 opacity-0 cursor-pointer w-full"
                              onChange={(e) => handleFileUpload(e, idx)}
                              disabled={uploading === `step-${idx}`}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 border-slate-800 bg-slate-900 text-slate-400"
                              disabled={uploading === `step-${idx}`}
                            >
                              {uploading === `step-${idx}` ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <Upload className="size-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {form.guide_steps.length === 0 && (
                    <p className="text-center py-2 text-[10px] text-slate-600 italic">No guide steps added yet.</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                <Button
                  type="button"
                  onClick={submitForm}
                  disabled={isSubmitting}
                  className="bg-amber-400 text-black hover:bg-amber-300 font-bold px-8"
                >
                  {isSubmitting ? "Saving..." : editingId ? "Update App" : "Create App"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="border-slate-800 text-slate-300">
                  {editingId ? "Cancel" : "Reset form"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-800 bg-slate-900/70 shadow-sm h-fit overflow-hidden sticky top-24">
          <CardHeader className="border-b border-slate-800/50 bg-slate-800/20">
            <CardTitle className="text-lg text-white">Existing Apps Directory</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid gap-3 overflow-y-auto max-h-[80vh] custom-scrollbar">
            {initialApps.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center">
                <p className="text-sm text-slate-500 italic">No apps found.</p>
              </div>
            ) : (
              initialApps.map((app) => (
                <div
                  key={app.id}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4 transition hover:bg-slate-900 hover:border-slate-700"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-800 overflow-hidden border border-slate-700">
                      {app.logo_url ? (
                        <Image src={app.logo_url} alt={app.name} width={40} height={40} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[10px] font-black text-slate-500">APP</div>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="truncate text-sm font-bold text-white">{app.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[10px] uppercase tracking-widest text-slate-500">
                          {app.category === "awards" ? "Awards" : "Music Show"}
                        </p>
                        {(app as any).guide_url && (
                          <span className="text-[9px] bg-sky-900/40 text-sky-400 border border-sky-800/40 px-1.5 py-0.5 rounded uppercase tracking-widest">
                            ext guide
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Clone this app"
                      onClick={() => handleClone(app)}
                      className="h-8 w-8 text-slate-400 hover:text-sky-400 hover:bg-sky-950/20"
                    >
                      <Plus className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Edit"
                      onClick={() => handleEdit(app)}
                      className="h-8 w-8 text-slate-400 hover:text-amber-400 hover:bg-amber-950/20"
                    >
                      <Edit2 className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Delete"
                      onClick={() => handleDelete(app.id)}
                      className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-950/40"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}