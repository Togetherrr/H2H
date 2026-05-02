"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Palette, Plus, Trash2, Save, Loader2, X, MonitorPlay, Check } from "lucide-react"
import { upsertTheme, activateTheme, deleteTheme } from "@/app/admin/actions"
import { Theme, ThemeConfig } from "@/lib/theme-service"
import { cn, hslToHex, hexToHsl } from "@/lib/utils"

interface ThemesManagerProps {
  initialThemes: Theme[]
}

const PRESETS = [
  {
    id: "sky-blue", name: "Sky Blue Premium",
    primary: "206 78% 60%", accent: "341 100% 71%", background: "206 100% 99%", foreground: "222 47% 11%"
  },
  {
    id: "midnight", name: "Midnight Neon",
    primary: "267 100% 64%", accent: "326 100% 64%", background: "240 100% 4%", foreground: "0 0% 100%"
  },
  {
    id: "rose-gold", name: "Rose Gold Elegance",
    primary: "354 70% 54%", accent: "25 95% 53%", background: "20 20% 98%", foreground: "20 60% 15%"
  },
  {
    id: "ocean", name: "Ocean Deep",
    primary: "199 89% 48%", accent: "160 84% 39%", background: "222 47% 11%", foreground: "199 89% 86%"
  },
  {
    id: "emerald", name: "Forest Emerald",
    primary: "142 71% 45%", accent: "146 79% 44%", background: "142 50% 5%", foreground: "142 60% 90%"
  }
]

export function ThemesManager({ initialThemes }: ThemesManagerProps) {
  const [themes, setThemes] = useState<Theme[]>(initialThemes)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<Theme>>({})
  const [isSaving, setIsSaving] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const applyIframeStyles = () => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return
    const root = doc.documentElement
    const colors = editFormData.config?.colors
    if (colors) {
      if (colors.primary) root.style.setProperty('--primary', colors.primary)
      if (colors.accent) root.style.setProperty('--accent', colors.accent)
      if (colors.background) root.style.setProperty('--background', colors.background)
      if (colors.foreground) root.style.setProperty('--foreground', colors.foreground)
    }
    const bgImage = editFormData.config?.assets?.background_image
    root.style.setProperty('--background-image', bgImage ? `url('${bgImage}')` : 'none')
  }

  useEffect(() => {
    if (isEditing) {
      applyIframeStyles()
    }
  }, [editFormData, isEditing])

  const handleEdit = (theme: Theme) => {
    setIsEditing(theme.id)
    setEditFormData(theme)
  }

  const handleCancel = () => {
    setIsEditing(null)
    setEditFormData({})
  }

  const handleSave = async () => {
    if (!editFormData.name) {
      toast.error("Theme name is required")
      return
    }
    setIsSaving(true)
    const result = await upsertTheme(editFormData)
    setIsSaving(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Theme saved successfully")
      window.location.reload()
    }
  }

  const handleActivate = async (id: string, currentlyActive: boolean) => {
    if (currentlyActive) return
    const result = await activateTheme(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Theme activated")
      window.location.reload()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this theme?")) return
    const result = await deleteTheme(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Theme deleted")
      setThemes(themes.filter((t) => t.id !== id))
    }
  }

  const handleCreateNew = () => {
    const defaultPreset = PRESETS[0]
    const newTheme: Partial<Theme> = {
      name: "My Custom Theme",
      is_active: false,
      config: {
        colors: {
          primary: defaultPreset.primary,
          secondary: "206 100% 97%",
          background: defaultPreset.background,
          accent: defaultPreset.accent,
          foreground: defaultPreset.foreground
        },
        assets: {
          logo: "/logo-official-removebg-.png",
          background_image: ""
        },
        effects: {
          film_grain: true,
          glow_orbs: true,
          floating_hearts: false
        }
      }
    }
    setEditFormData(newTheme)
    setIsEditing("new")
  }

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setEditFormData((prev) => ({
      ...prev,
      config: {
        ...prev.config!,
        colors: { 
          ...prev.config!.colors, 
          primary: preset.primary,
          accent: preset.accent,
          background: preset.background,
          foreground: preset.foreground
        }
      }
    }))
  }

  const updateColor = (key: "primary" | "accent" | "background" | "foreground", hex: string) => {
    const hsl = hexToHsl(hex)
    setEditFormData((prev) => ({
      ...prev,
      config: {
        ...prev.config!,
        colors: { ...prev.config!.colors, [key]: hsl }
      }
    }))
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-light tracking-tight text-white">Theme Management</h2>
          <p className="text-slate-400 mt-1">Control the visual identity of Hearts2Hearts with just a few clicks.</p>
        </div>
        <Button onClick={handleCreateNew} className="rounded-full bg-sky-500 hover:bg-sky-600 text-white border-0">
          <Plus className="mr-2 size-4" /> Create New Theme
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {themes.map((theme) => {
          const isActive = theme.is_active
          return (
            <Card key={theme.id} className={cn(
              "overflow-hidden border-slate-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative group",
              isActive ? 'bg-slate-900 border-sky-500/50 shadow-[0_0_30px_-5px_rgba(14,165,233,0.3)]' : 'bg-slate-900/50'
            )}>
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 bg-slate-950/40 px-6 py-5">
                <div className="flex items-center gap-4">
                  <div 
                    className="size-10 rounded-full shadow-inner border-2 border-slate-800" 
                    style={{ backgroundColor: `hsl(${theme.config.colors.primary})` }}
                  />
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-100">{theme.name}</CardTitle>
                    {isActive 
                      ? <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-sky-400 mt-0.5">Currently Active</p>
                      : <p className="text-[10px] uppercase tracking-[0.1em] text-slate-500 mt-0.5">Inactive</p>
                    }
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleActivate(theme.id, isActive)}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all",
                      isActive 
                        ? "bg-sky-500/20 text-sky-400 border border-sky-500/30 cursor-default" 
                        : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white"
                    )}
                  >
                    <div className={cn("size-2 rounded-full", isActive ? "bg-sky-400 animate-pulse" : "bg-slate-500")} />
                    {isActive ? "ON" : "OFF"}
                  </button>
                  <div className="h-6 w-px bg-slate-800 mx-1"></div>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(theme)} className="h-8 w-8 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white">
                    <Palette className="size-4" />
                  </Button>
                  {!isActive && (
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(theme.id)} className="h-8 w-8 rounded-full text-slate-400 hover:bg-rose-500/20 hover:text-rose-400">
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {theme.config.effects.film_grain && <span className="rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-[10px] font-medium text-slate-300">Film Grain</span>}
                    {theme.config.effects.glow_orbs && <span className="rounded-full bg-sky-950/50 border border-sky-900/50 px-3 py-1 text-[10px] font-medium text-sky-300">Glow Orbs</span>}
                    {theme.config.effects.floating_hearts && <span className="rounded-full bg-rose-950/50 border border-rose-900/50 px-3 py-1 text-[10px] font-medium text-rose-300">Interactive Hearts</span>}
                    {!theme.config.effects.film_grain && !theme.config.effects.glow_orbs && !theme.config.effects.floating_hearts && (
                      <span className="text-xs text-slate-500 italic">No special effects enabled.</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="absolute inset-0" onClick={handleCancel} />
          <Card className="relative w-full max-w-[1400px] shadow-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col md:flex-row h-[90vh]">
            <button 
              onClick={handleCancel}
              className="absolute right-4 top-4 z-10 rounded-full bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="size-4" />
            </button>

            {/* Left Side: Real Homepage Web Preview */}
            <div className="flex-1 bg-black relative flex flex-col items-center justify-center border-r border-slate-800 overflow-hidden">
               <div className="absolute top-4 left-6 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-sky-400">
                  <MonitorPlay className="size-4 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] pt-px">Live Homepage Preview</span>
               </div>
               
               <div className="w-full h-full p-4 md:p-12 lg:px-20 lg:py-16">
                 {/* Scale down iframe visually if needed or just let it be responsive */}
                 <div className="w-full h-full rounded-[2rem] border-8 border-slate-800 bg-white shadow-2xl overflow-hidden relative">
                   <iframe 
                      ref={iframeRef}
                      src="/"
                      onLoad={applyIframeStyles}
                      className="absolute inset-0 w-full h-full"
                   />
                 </div>
               </div>
            </div>

            {/* Right Side: Editors */}
            <div className="w-full md:w-[450px] p-8 space-y-8 overflow-y-auto bg-slate-950">
              <div>
                <h3 className="text-2xl font-light text-white">Edit Theme</h3>
                <p className="text-sm text-slate-400 mt-1">Easily configure the look and feel.</p>
              </div>

              <div className="space-y-6">
                {/* Theme Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs uppercase tracking-wider font-bold text-slate-300">Theme Name</Label>
                  <Input 
                    id="name" 
                    className="rounded-xl border-slate-700 bg-slate-900 text-white focus:ring-sky-500 focus:border-sky-500"
                    value={editFormData.name || ""} 
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>

                {/* Color Configuration */}
                <div className="space-y-4 pt-6 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs uppercase tracking-wider font-bold text-slate-300">Colors</Label>
                  </div>
                  
                  {/* Color Pickers List */}
                  <div className="grid gap-3">
                    {[
                      { key: "primary" as const, label: "Primary (Brand)" },
                      { key: "accent" as const, label: "Accent (Highlights)" },
                      { key: "background" as const, label: "Background" },
                      { key: "foreground" as const, label: "Foreground (Text)" },
                    ].map(cp => (
                       <div key={cp.key} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                         <div className="space-y-0.5">
                           <Label className="text-[10px] text-slate-400 uppercase">{cp.label}</Label>
                           <div className="text-sm font-mono text-slate-200">
                             {hslToHex((editFormData.config?.colors as any)[cp.key] || "0 0% 0%")}
                           </div>
                         </div>
                         <input 
                           type="color" 
                           className="size-10 rounded-lg cursor-pointer border-0 bg-transparent"
                           value={hslToHex((editFormData.config?.colors as any)[cp.key] || "0 0% 0%")}
                           onChange={(e) => updateColor(cp.key, e.target.value)}
                         />
                       </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-800">
                  <Label className="text-xs uppercase tracking-wider font-bold text-slate-300">Background Image</Label>
                  <Input 
                    placeholder="https://.../bg.jpg (Optional)"
                    className="rounded-xl border-slate-700 bg-slate-900 text-white text-sm"
                    value={editFormData.config?.assets.background_image || ""}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      config: {
                        ...editFormData.config!,
                        assets: { ...editFormData.config!.assets, background_image: e.target.value }
                      }
                    })}
                  />
                </div>

                {/* Curated Presets */}
                <div className="space-y-3 pt-6 border-t border-slate-800">
                  <Label className="text-xs uppercase tracking-wider font-bold text-slate-300">Or use a Preset</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {PRESETS.map(preset => {
                      const isSelected = editFormData.config?.colors.primary === preset.primary && editFormData.config?.colors.background === preset.background;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => applyPreset(preset)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border transition-all text-left group",
                            isSelected 
                              ? "border-sky-500 bg-sky-950/30" 
                              : "border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-800"
                          )}
                        >
                          <div className="size-5 rounded-full shadow-inner border border-white/10" style={{ backgroundColor: `hsl(${preset.primary})` }} />
                          <div className="flex-1">
                            <p className={cn("text-[10px] font-semibold leading-tight", isSelected ? "text-sky-400" : "text-slate-300")}>{preset.name}</p>
                          </div>
                          {isSelected && <Check className="size-3 text-sky-400" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Visual Effects */}
                <div className="space-y-4 pt-6 border-t border-slate-800">
                  <Label className="text-xs uppercase tracking-wider font-bold text-slate-300">Visual Effects</Label>
                  <div className="grid gap-3">
                    {[
                      { id: "film_grain", label: "Film Grain Texture", desc: "Adds a subtle cinematic noise overlay.", key: "film_grain" },
                      { id: "glow_orbs", label: "Floating Glow Orbs", desc: "Soft, dynamic lighting orbs in the background.", key: "glow_orbs" },
                      { id: "floating_hearts", label: "Interactive Hearts", desc: "Small hearts that float when users tap.", key: "floating_hearts" }
                    ].map((effect) => (
                      <label 
                        key={effect.id} 
                        className="flex items-start gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900 transition-all hover:border-slate-700 cursor-pointer"
                      >
                        <div className="flex items-center h-5">
                          <input 
                            type="checkbox"
                            id={effect.id} 
                            className="size-4 rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900"
                            checked={(editFormData.config?.effects as any)[effect.key]}
                            onChange={(e) => setEditFormData({
                              ...editFormData,
                              config: {
                                ...editFormData.config!,
                                effects: { ...editFormData.config!.effects, [effect.key]: e.target.checked }
                              }
                            })}
                          />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-slate-200 block">{effect.label}</span>
                          <span className="text-xs text-slate-500 block mt-0.5">{effect.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-8 mt-8 border-t border-slate-800 pb-8">
                <Button variant="ghost" onClick={handleCancel} className="rounded-full text-slate-400 hover:text-white hover:bg-slate-800">Cancel</Button>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="rounded-full bg-white text-slate-950 px-8 hover:bg-slate-200 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all"
                >
                  {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
                  Save Theme
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
