"use client"

import Image from "next/image"
import { type Dispatch, type SetStateAction, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DynamicListInput } from "@/components/admin/DynamicListInput"
import { TagInput } from "@/components/admin/TagInput"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createVotingApp, deleteVotingApp, updateVotingApp, uploadImage } from "@/app/admin/actions"
import { toast } from "sonner"
import { BadgeCheck, Plus, Trash2, Edit2, XCircle, X, Upload, Loader2 } from "lucide-react"

const TEMPLATE = {
  currencies: ["Points", "Tokens", "Coupons"],
  collection: ["Daily check-in", "Watch ads", "Complete missions"],
  strategies: ["Vote daily", "Save points for finals", "Coordinate with global fans"],
  round: {
    round_name: "Final Round",
    start_at: "",
    end_at: "",
    display_timezone: "Asia/Seoul",
    is_active: true,
  },
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

type VotingAppBaseForm = {
  name: string
  program_name: string
  logo_url: string
  android_url: string
  ios_url: string
  website_url: string
  currencies: string[]
  collection_methods: string[]
  strategies: string[]
  guide_steps: GuideStepForm[]
  description: string
  reflection_rate: string[]
  ceremony_at: string
  is_featured: boolean
}

type VotingRoundForm = {
  round_name: string
  start_at: string
  end_at: string
  display_timezone: string
  is_active: boolean
}

type VotingAppAwardsForm = VotingAppBaseForm & {
  rounds: VotingRoundForm[]
}

type HasGuideSteps = {
  guide_steps: GuideStepForm[]
}

function createEmptyBaseForm(): VotingAppBaseForm {
  return {
    name: "",
    program_name: "",
    logo_url: "",
    android_url: "",
    ios_url: "",
    website_url: "",
    currencies: [""],
    collection_methods: [""],
    strategies: [""],
    guide_steps: [],
    description: "",
    reflection_rate: [""],
    ceremony_at: "",
    is_featured: false,
  }
}

function createEmptyMusicShowForm(): VotingAppBaseForm {
  return createEmptyBaseForm()
}

function createEmptyAwardsForm(): VotingAppAwardsForm {
  return {
    ...createEmptyBaseForm(),
    rounds: [],
  }
}

function normalizeText(value: any) {
  if (typeof value !== "string") return ""
  return value.trim()
}

function kstLocalInputToUtcIso(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ""
  const hasSeconds = trimmed.split(":").length === 3
  const dateStr = hasSeconds ? `${trimmed}+09:00` : `${trimmed}:00+09:00`
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString()
}

function utcToKstLocalInput(utcString: string | null | undefined) {
  if (!utcString) return ""
  const date = new Date(utcString)
  if (Number.isNaN(date.getTime())) return ""
  const kstOffset = 9 * 60 * 60000
  const kstDate = new Date(date.getTime() + kstOffset)
  return kstDate.toISOString().slice(0, 19)
}

const STORAGE_KEY_MUSIC = "h2h_voting_music_draft"
const STORAGE_KEY_AWARDS = "h2h_voting_awards_draft"

export function VotingAppsManager({ initialApps }: { initialApps: any[] }) {
  const [activeTab, setActiveTab] = useState<"music_shows" | "awards">("music_shows")
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [musicShowForm, setMusicShowForm] = useState<VotingAppBaseForm>(createEmptyMusicShowForm())
  const [awardsForm, setAwardsForm] = useState<VotingAppAwardsForm>(createEmptyAwardsForm())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null) // tracks which step is uploading: "music-0", "awards-1", etc.

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setForm: Dispatch<SetStateAction<any>>,
    index: number,
    idPrefix: string
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const id = `${idPrefix}-${index}`
    setUploading(id)
    
    try {
      console.log("Starting upload for:", file.name)
      const formData = new FormData()
      formData.append("file", file)
      const result = await uploadImage(formData)
      
      console.log("Upload result:", result)

      if (result.error) {
        toast.error(`Upload error: ${result.error}`)
      } else if (result.url) {
        handleGuideStepChange(setForm, index, "image_url", result.url)
        toast.success("Image uploaded!")
      }
    } catch (err: any) {
      console.error("Upload exception:", err)
      toast.error(`Upload failed: ${err.message || "Unknown error"}`)
    } finally {
      setUploading(null)
      // Reset input value so same file can be selected again
      e.target.value = ""
    }
  }

  useEffect(() => {
    if (editingId) return 
    const savedMusic = localStorage.getItem(STORAGE_KEY_MUSIC)
    if (savedMusic) {
      try {
        setMusicShowForm(JSON.parse(savedMusic))
      } catch (e) { console.error("Failed to parse music draft", e) }
    }
    const savedAwards = localStorage.getItem(STORAGE_KEY_AWARDS)
    if (savedAwards) {
      try {
        setAwardsForm(JSON.parse(savedAwards))
      } catch (e) { console.error("Failed to parse awards draft", e) }
    }
  }, [editingId])

  useEffect(() => {
    if (editingId) return
    localStorage.setItem(STORAGE_KEY_MUSIC, JSON.stringify(musicShowForm))
  }, [musicShowForm, editingId])

  useEffect(() => {
    if (editingId) return 
    localStorage.setItem(STORAGE_KEY_AWARDS, JSON.stringify(awardsForm))
  }, [awardsForm, editingId])

  const addRound = () => {
    setAwardsForm((prev) => ({
      ...prev,
      rounds: [
        ...prev.rounds,
        { ...TEMPLATE.round },
      ],
    }))
  }

  const removeRound = (index: number) => {
    setAwardsForm((prev) => ({
      ...prev,
      rounds: prev.rounds.filter((_, i) => i !== index),
    }))
  }

  const updateRound = (index: number, data: Partial<VotingRoundForm>) => {
    setAwardsForm((prev) => {
      const newRounds = [...prev.rounds]
      newRounds[index] = { ...newRounds[index], ...data }
      return { ...prev, rounds: newRounds }
    })
  }

  const addGuideStep = <T extends HasGuideSteps>(setForm: Dispatch<SetStateAction<T>>) => {
    setForm((current) => ({
      ...current,
      guide_steps: [...current.guide_steps, { title: "", description: "", image_url: "" }],
    }))
  }

  const removeGuideStep = <T extends HasGuideSteps>(setForm: Dispatch<SetStateAction<T>>, index: number) => {
    setForm((current) => ({
      ...current,
      guide_steps: current.guide_steps.filter((_, idx) => idx !== index),
    }))
  }

  const handleGuideStepChange = <T extends HasGuideSteps>(
    setForm: Dispatch<SetStateAction<T>>,
    index: number,
    field: keyof GuideStepForm,
    value: string,
  ) => {
    setForm((current) => {
      const guide_steps = [...current.guide_steps]
      guide_steps[index] = { ...guide_steps[index], [field]: value }
      return { ...current, guide_steps }
    })
  }

  const applyTemplateToMusicShows = () => {
    setMusicShowForm((current) => ({
      ...current,
      currencies: TEMPLATE.currencies,
      collection_methods: TEMPLATE.collection,
      strategies: TEMPLATE.strategies,
      guide_steps: current.guide_steps.length === 0 ? [{ ...TEMPLATE.guide_step }] : current.guide_steps,
    }))
  }

  const applyTemplateToAwards = () => {
    setAwardsForm((current) => ({
      ...current,
      currencies: TEMPLATE.currencies,
      collection_methods: TEMPLATE.collection,
      strategies: TEMPLATE.strategies,
      rounds: current.rounds.length === 0 ? [{ ...TEMPLATE.round }] : current.rounds,
      guide_steps: current.guide_steps.length === 0 ? [{ ...TEMPLATE.guide_step }] : current.guide_steps,
    }))
  }

  const resetMusicShowsForm = () => {
    setMusicShowForm(createEmptyBaseForm())
    if (!editingId) localStorage.removeItem(STORAGE_KEY_MUSIC)
    setEditingId(null)
  }
  const resetAwardsForm = () => {
    setAwardsForm(createEmptyAwardsForm())
    if (!editingId) localStorage.removeItem(STORAGE_KEY_AWARDS)
    setEditingId(null)
  }

  const handleEdit = (app: any) => {
    setEditingId(app.id)
    const category = app.category === "awards" ? "awards" : "music_shows"
    setActiveTab(category)

    const baseData = {
      name: app.name || "",
      program_name: app.program_name || "",
      logo_url: app.logo_url || "",
      android_url: app.android_url || "",
      ios_url: app.ios_url || "",
      website_url: (app as any).website_url || "",
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
      ceremony_at: utcToKstLocalInput(app.ceremony_at).split('T')[0],
      is_featured: !!app.is_featured,
    }

    if (category === "awards") {
      setAwardsForm({
        ...baseData,
        rounds: (app.voting_rounds || []).map((r: any) => ({
          round_name: r.round_name,
          start_at: utcToKstLocalInput(r.start_at),
          end_at: utcToKstLocalInput(r.end_at),
          display_timezone: r.display_timezone || "Asia/Seoul",
          is_active: r.is_active,
        })),
      })
    } else {
      setMusicShowForm(baseData)
    }
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleClone = (app: any) => {
    handleEdit(app)
    setEditingId(null) // Reset editingId so it creates a new record on save
    toast.info(`Cloned ${app.name}. You can now modify and save as a new app.`)
  }

  // Get unique program names for suggestions
  const existingProgramNames = Array.from(new Set(initialApps.map(a => a.program_name).filter(Boolean))) as string[]

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this voting app?")) return
    const result = await deleteVotingApp(id)
    if (result.error) toast.error(result.error)
    else toast.success("Deleted!")
  }

  const submitForm = async (category: "music_shows" | "awards", form: VotingAppBaseForm | VotingAppAwardsForm) => {
    if (!normalizeText(form.name)) {
      toast.error("Please enter the app name")
      return
    }

    setIsSubmitting(true)
    const payload = {
      name: normalizeText(form.name),
      category,
      program_name: normalizeText(form.program_name) || null,
      logo_url: normalizeText(form.logo_url) || null,
      android_url: normalizeText(form.android_url) || null,
      ios_url: normalizeText(form.ios_url) || null,
      website_url: normalizeText(form.website_url) || null,
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
      ceremony_at: kstLocalInputToUtcIso(form.ceremony_at) || null,
      is_featured: !!form.is_featured,
      rounds: category === "awards"
          ? ((form as VotingAppAwardsForm).rounds ?? []).map((round) => ({
              round_name: round.round_name,
              start_at: kstLocalInputToUtcIso(round.start_at),
              end_at: kstLocalInputToUtcIso(round.end_at),
              display_timezone: round.display_timezone,
              is_active: round.is_active,
            }))
          : [],
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
    if (category === "awards") resetAwardsForm()
    else resetMusicShowsForm()
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <div className="flex items-center gap-3 text-amber-300">
          <BadgeCheck className="size-6" />
          <p className="text-sm font-semibold uppercase tracking-[0.45em]">Voting Apps</p>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-3xl font-light tracking-tight text-white sm:text-4xl">
            {editingId ? "Edit voting app" : "Add new voting apps"}
          </h2>
          {editingId && (
            <Button 
              variant="outline" 
              onClick={() => activeTab === "music_shows" ? resetMusicShowsForm() : resetAwardsForm()} 
              className="border-red-900/50 bg-red-950/20 text-red-400 hover:text-red-300 hover:bg-red-900/30"
            >
              <XCircle className="size-4 mr-2" /> Cancel editing
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
            <TabsList className="bg-slate-950/40 border border-slate-800 p-1 h-auto gap-1">
              <TabsTrigger value="music_shows" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white px-6 py-2.5 rounded-lg transition-all">
                Music Shows
              </TabsTrigger>
              <TabsTrigger value="awards" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white px-6 py-2.5 rounded-lg transition-all">
                Awards
              </TabsTrigger>
            </TabsList>

            <TabsContent value="music_shows" className="mt-6">
              <Card className="border-slate-800 bg-slate-900/70 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-800/50 bg-slate-800/20">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    {editingId ? <Edit2 className="size-4 text-amber-400" /> : <Plus className="size-4 text-amber-400" />}
                    {editingId ? "Edit" : "Create"}: Music Show vote app
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label className="text-slate-300">App name</Label>
                      <Input
                        value={musicShowForm.name}
                        onChange={(e) => setMusicShowForm((c) => ({ ...c, name: e.target.value }))}
                        placeholder="Mubeat"
                        className="bg-slate-950 border-slate-800 text-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-300">Music show / Program name</Label>
                      <div className="space-y-2">
                        <Input
                          value={musicShowForm.program_name}
                          onChange={(e) => setMusicShowForm((c) => ({ ...c, program_name: e.target.value }))}
                          placeholder="M Countdown"
                          className="bg-slate-950 border-slate-800 text-white"
                        />
                        {existingProgramNames.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {existingProgramNames.slice(0, 5).map(name => (
                              <button
                                key={name}
                                type="button"
                                onClick={() => setMusicShowForm(c => ({ ...c, program_name: name }))}
                                className="text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                              >
                                {name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label className="text-slate-300">Logo URL</Label>
                      <Input
                        value={musicShowForm.logo_url}
                        onChange={(e) => setMusicShowForm((c) => ({ ...c, logo_url: e.target.value }))}
                        placeholder="https://.../logo.png"
                        className="bg-slate-950 border-slate-800 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="grid gap-2">
                      <Label className="text-slate-300">Android URL</Label>
                      <Input
                        value={musicShowForm.android_url}
                        onChange={(e) => setMusicShowForm((c) => ({ ...c, android_url: e.target.value }))}
                        placeholder="Play Store link"
                        className="bg-slate-950 border-slate-800 text-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-300">iOS URL</Label>
                      <Input
                        value={musicShowForm.ios_url}
                        onChange={(e) => setMusicShowForm((c) => ({ ...c, ios_url: e.target.value }))}
                        placeholder="App Store link"
                        className="bg-slate-950 border-slate-800 text-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-300">Website URL</Label>
                      <Input
                        value={musicShowForm.website_url}
                        onChange={(e) => setMusicShowForm((c) => ({ ...c, website_url: e.target.value }))}
                        placeholder="Web voting link"
                        className="bg-slate-950 border-slate-800 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-slate-300">Show Description</Label>
                    <Input
                      value={musicShowForm.description}
                      onChange={(e) => setMusicShowForm((c) => ({ ...c, description: e.target.value }))}
                      placeholder="Weekly music show voting guide..."
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>

                  <DynamicListInput
                    label="Reflection Rate Criteria"
                    items={musicShowForm.reflection_rate}
                    onChange={(value) => setMusicShowForm((c) => ({ ...c, reflection_rate: value }))}
                    placeholder="50% Digital (Melon, Genie, etc.)"
                  />

                  <div className="flex items-center space-x-2 py-2">
                    <input
                      type="checkbox"
                      id="music-is-featured"
                      checked={musicShowForm.is_featured}
                      onChange={(e) => setMusicShowForm((c) => ({ ...c, is_featured: e.target.checked }))}
                      className="size-4 rounded border-slate-700 bg-slate-800 text-sky-600 focus:ring-sky-500"
                    />
                    <Label htmlFor="music-is-featured" className="text-sm font-medium text-slate-300 cursor-pointer">
                      Featured on Home Page (Highlight this app on the home dashboard)
                    </Label>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                    <div>
                      <p className="text-sm font-semibold text-white">Quick template</p>
                      <p className="text-xs text-slate-500">Auto-fill base fields and sample guide step.</p>
                    </div>
                    <Button type="button" variant="outline" onClick={applyTemplateToMusicShows} className="border-slate-800 text-slate-300">
                      Apply template
                    </Button>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <DynamicListInput
                      label="Currencies"
                      items={musicShowForm.currencies}
                      onChange={(value) => setMusicShowForm((c) => ({ ...c, currencies: value }))}
                      placeholder="Points"
                    />
                    <DynamicListInput
                      label="Collection methods"
                      items={musicShowForm.collection_methods}
                      onChange={(value) => setMusicShowForm((c) => ({ ...c, collection_methods: value }))}
                      placeholder="Watch ads"
                    />
                  </div>

                  <DynamicListInput
                    label="Strategies"
                    items={musicShowForm.strategies}
                    onChange={(value) => setMusicShowForm((c) => ({ ...c, strategies: value }))}
                    placeholder="Vote daily"
                  />

                  <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sky-400 font-bold uppercase tracking-wider text-xs">Guide Steps (How to vote)</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addGuideStep(setMusicShowForm)} className="h-7 border-slate-800 text-xs text-slate-300">
                        Add step
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {musicShowForm.guide_steps.map((step, idx) => (
                        <div key={idx} className="grid gap-3 rounded-lg border border-slate-800 p-3 bg-slate-900/50">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Step {idx + 1}</span>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeGuideStep(setMusicShowForm, idx)} className="h-6 w-6 p-0 text-slate-500 hover:text-red-400">
                              <X className="size-3" />
                            </Button>
                          </div>
                          
                          <div className="grid gap-2">
                            <Input
                              value={step.title}
                              onChange={(e) => handleGuideStepChange(setMusicShowForm, idx, "title", e.target.value)}
                              placeholder="Step title (e.g. Login)"
                              className="h-8 bg-slate-950 border-slate-800 text-white text-xs"
                            />
                            <Input
                              value={step.description}
                              onChange={(e) => handleGuideStepChange(setMusicShowForm, idx, "description", e.target.value)}
                              placeholder="Description (e.g. Use Kakao or Google to login)"
                              className="h-8 bg-slate-950 border-slate-800 text-white text-xs"
                            />
                            <div className="flex gap-2">
                              <Input
                                value={step.image_url}
                                onChange={(e) => handleGuideStepChange(setMusicShowForm, idx, "image_url", e.target.value)}
                                placeholder="Image URL (or upload →)"
                                className="h-8 bg-slate-950 border-slate-800 text-white text-xs flex-1"
                              />
                              <div className="relative">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full"
                                  onChange={(e) => handleFileUpload(e, setMusicShowForm, idx, "music")}
                                  disabled={uploading === `music-${idx}`}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-8 border-slate-800 bg-slate-900 text-slate-400"
                                  disabled={uploading === `music-${idx}`}
                                >
                                  {uploading === `music-${idx}` ? (
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
                      {musicShowForm.guide_steps.length === 0 && (
                        <p className="text-center py-2 text-[10px] text-slate-600 italic">No guide steps added yet.</p>
                      )}
                    </div>
                  </div>

                    <div className="flex flex-wrap gap-3 pt-4">
                      <Button
                        type="button"
                        onClick={() => void submitForm("music_shows", musicShowForm)}
                        disabled={isSubmitting}
                        className="bg-amber-400 text-black hover:bg-amber-300 font-bold px-8"
                      >
                        {isSubmitting ? "Saving..." : editingId ? "Update music show app" : "Create music show app"}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetMusicShowsForm} className="border-slate-800 text-slate-300">
                        {editingId ? "Cancel" : "Reset form"}
                      </Button>
                    </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="awards" className="mt-6">
              <Card className="border-slate-800 bg-slate-900/70 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-800/50 bg-slate-800/20">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    {editingId ? <Edit2 className="size-4 text-amber-400" /> : <Plus className="size-4 text-amber-400" />}
                    {editingId ? "Edit" : "Create"}: Awards vote app
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label className="text-slate-300">App name</Label>
                      <Input
                        value={awardsForm.name}
                        onChange={(e) => setAwardsForm((c) => ({ ...c, name: e.target.value }))}
                        placeholder="Mnet Plus"
                        className="bg-slate-950 border-slate-800 text-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-300">Awards / Ceremony name</Label>
                      <div className="space-y-2">
                        <Input
                          value={awardsForm.program_name}
                          onChange={(e) => setAwardsForm((c) => ({ ...c, program_name: e.target.value }))}
                          placeholder="MAMA"
                          className="bg-slate-950 border-slate-800 text-white"
                        />
                        {existingProgramNames.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {existingProgramNames.slice(0, 5).map(name => (
                              <button
                                key={name}
                                type="button"
                                onClick={() => setAwardsForm(c => ({ ...c, program_name: name }))}
                                className="text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                              >
                                {name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label className="text-slate-300">Logo URL</Label>
                      <Input
                        value={awardsForm.logo_url}
                        onChange={(e) => setAwardsForm((c) => ({ ...c, logo_url: e.target.value }))}
                        placeholder="https://.../logo.png"
                        className="bg-slate-950 border-slate-800 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="grid gap-2">
                      <Label className="text-slate-300">Android URL</Label>
                      <Input
                        value={awardsForm.android_url}
                        onChange={(e) => setAwardsForm((c) => ({ ...c, android_url: e.target.value }))}
                        placeholder="Play Store link"
                        className="bg-slate-950 border-slate-800 text-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-300">iOS URL</Label>
                      <Input
                        value={awardsForm.ios_url}
                        onChange={(e) => setAwardsForm((c) => ({ ...c, ios_url: e.target.value }))}
                        placeholder="App Store link"
                        className="bg-slate-950 border-slate-800 text-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-300">Website URL</Label>
                      <Input
                        value={awardsForm.website_url}
                        onChange={(e) => setAwardsForm((c) => ({ ...c, website_url: e.target.value }))}
                        placeholder="Web voting link"
                        className="bg-slate-950 border-slate-800 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-slate-300">Awards Description</Label>
                    <Input
                      value={awardsForm.description}
                      onChange={(e) => setAwardsForm((c) => ({ ...c, description: e.target.value }))}
                      placeholder="Grand prize for the artist of the year..."
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>

                  <DynamicListInput
                    label="Reflection Rate Criteria"
                    items={awardsForm.reflection_rate}
                    onChange={(value) => setAwardsForm((c) => ({ ...c, reflection_rate: value }))}
                    placeholder="50% Digital (Melon, Genie, etc.)"
                  />

                  <div className="flex items-center space-x-2 py-2">
                    <input
                      type="checkbox"
                      id="awards-is-featured"
                      checked={awardsForm.is_featured}
                      onChange={(e) => setAwardsForm((c) => ({ ...c, is_featured: e.target.checked }))}
                      className="size-4 rounded border-slate-700 bg-slate-800 text-sky-600 focus:ring-sky-500"
                    />
                    <Label htmlFor="awards-is-featured" className="text-sm font-medium text-slate-300 cursor-pointer">
                      Featured on Home Page (Highlight this app on the home dashboard)
                    </Label>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-slate-300">Ceremony Time (KST) (Optional)</Label>
                    <Input
                      type="date"
                      value={awardsForm.ceremony_at}
                      onChange={(e) => setAwardsForm((c) => ({ ...c, ceremony_at: e.target.value }))}
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>

                  <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-amber-400 font-bold uppercase tracking-wider text-xs">Voting Rounds (Awards)</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addRound} className="h-7 border-slate-800 text-xs text-slate-300">
                        Add round
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {awardsForm.rounds.map((round, idx) => (
                        <div key={idx} className="grid gap-3 rounded-lg border border-slate-800 p-3 bg-slate-900/50">
                          <div className="flex items-center justify-between gap-2">
                            <Input
                              value={round.round_name}
                              onChange={(e) => updateRound(idx, { round_name: e.target.value })}
                              placeholder="e.g. Main Round"
                              className="h-8 bg-slate-950 border-slate-800 text-white text-xs"
                            />
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeRound(idx)} className="h-8 w-8 p-0 text-slate-500 hover:text-red-400">
                              <X className="size-4" />
                            </Button>
                          </div>
                          
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="grid gap-1.5">
                              <Label className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Start (KST)</Label>
                              <Input
                                type="datetime-local"
                                step="1"
                                value={round.start_at}
                                onChange={(e) => updateRound(idx, { start_at: e.target.value })}
                                className="h-8 bg-slate-950 border-slate-800 text-white text-[11px]"
                              />
                            </div>
                            <div className="grid gap-1.5">
                              <Label className="text-[10px] text-slate-500 uppercase tracking-widest font-black">End (KST)</Label>
                              <Input
                                type="datetime-local"
                                step="1"
                                value={round.end_at}
                                onChange={(e) => updateRound(idx, { end_at: e.target.value })}
                                className="h-8 bg-slate-950 border-slate-800 text-white text-[11px]"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`active-${idx}`}
                              checked={round.is_active}
                              onChange={(e) => updateRound(idx, { is_active: e.target.checked })}
                              className="size-4 rounded border-slate-800 bg-slate-950 text-amber-500"
                            />
                            <Label htmlFor={`active-${idx}`} className="text-xs text-slate-400 cursor-pointer">
                              Mark as active round
                            </Label>
                          </div>
                        </div>
                      ))}
                      {awardsForm.rounds.length === 0 && (
                        <p className="text-center py-4 text-xs text-slate-600 italic">No rounds added. Add at least one for home page visibility.</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <DynamicListInput
                      label="Currencies"
                      items={awardsForm.currencies}
                      onChange={(value) => setAwardsForm((c) => ({ ...c, currencies: value }))}
                      placeholder="Points"
                    />
                    <DynamicListInput
                      label="Collection methods"
                      items={awardsForm.collection_methods}
                      onChange={(value) => setAwardsForm((c) => ({ ...c, collection_methods: value }))}
                      placeholder="Watch ads"
                    />
                  </div>

                  <DynamicListInput
                    label="Strategies"
                    items={awardsForm.strategies}
                    onChange={(value) => setAwardsForm((c) => ({ ...c, strategies: value }))}
                    placeholder="Vote daily"
                  />

                  <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sky-400 font-bold uppercase tracking-wider text-xs">Guide Steps (How to vote)</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addGuideStep(setAwardsForm)} className="h-7 border-slate-800 text-xs text-slate-300">
                        Add step
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {awardsForm.guide_steps.map((step, idx) => (
                        <div key={idx} className="grid gap-3 rounded-lg border border-slate-800 p-3 bg-slate-900/50">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Step {idx + 1}</span>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeGuideStep(setAwardsForm, idx)} className="h-6 w-6 p-0 text-slate-500 hover:text-red-400">
                              <X className="size-3" />
                            </Button>
                          </div>
                          
                          <div className="grid gap-2">
                            <Input
                              value={step.title}
                              onChange={(e) => handleGuideStepChange(setAwardsForm, idx, "title", e.target.value)}
                              placeholder="Step title (e.g. Login)"
                              className="h-8 bg-slate-950 border-slate-800 text-white text-xs"
                            />
                            <Input
                              value={step.description}
                              onChange={(e) => handleGuideStepChange(setAwardsForm, idx, "description", e.target.value)}
                              placeholder="Description (e.g. Use Kakao or Google to login)"
                              className="h-8 bg-slate-950 border-slate-800 text-white text-xs"
                            />
                            <div className="flex gap-2">
                              <Input
                                value={step.image_url}
                                onChange={(e) => handleGuideStepChange(setAwardsForm, idx, "image_url", e.target.value)}
                                placeholder="Image URL (or upload →)"
                                className="h-8 bg-slate-950 border-slate-800 text-white text-xs flex-1"
                              />
                              <div className="relative">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full"
                                  onChange={(e) => handleFileUpload(e, setAwardsForm, idx, "awards")}
                                  disabled={uploading === `awards-${idx}`}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-8 border-slate-800 bg-slate-900 text-slate-400"
                                  disabled={uploading === `awards-${idx}`}
                                >
                                  {uploading === `awards-${idx}` ? (
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
                      {awardsForm.guide_steps.length === 0 && (
                        <p className="text-center py-2 text-[10px] text-slate-600 italic">No guide steps added yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-4">
                    <Button
                      type="button"
                      onClick={() => void submitForm("awards", awardsForm)}
                      disabled={isSubmitting}
                      className="bg-amber-400 text-black hover:bg-amber-300 font-bold px-8"
                    >
                      {isSubmitting ? "Saving..." : editingId ? "Update awards app" : "Create awards app"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetAwardsForm} className="border-slate-800 text-slate-300">
                      {editingId ? "Cancel" : "Reset form"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Card className="border-slate-800 bg-slate-900/70 shadow-sm h-fit overflow-hidden sticky top-24">
          <CardHeader className="border-b border-slate-800/50 bg-slate-800/20">
            <CardTitle className="text-lg text-white">Existing apps</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid gap-3 overflow-y-auto max-h-[80vh] custom-scrollbar">
            {initialApps.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center">
                <p className="text-sm text-slate-500 italic">No voting apps found.</p>
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
                      <p className="truncate text-[10px] uppercase tracking-widest text-slate-500">
                        {app.category === "awards" ? "Awards" : "Music Show"}
                      </p>
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
