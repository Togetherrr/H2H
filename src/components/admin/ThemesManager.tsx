"use client"

import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Palette, Plus, Trash2, Save, Loader2, X, MonitorPlay, Check, Image as ImageIcon, Upload } from "lucide-react"
import { upsertTheme, activateTheme, deleteTheme } from "@/app/admin/actions"
import { Theme, ThemeConfig } from "@/lib/theme-service"
import { MediaManager } from "./MediaManager"
import { cn, hslToHex, hexToHsl } from "@/lib/utils"

interface ThemesManagerProps {
  initialThemes: Theme[]
}

const PRESETS = [
  {
    id: "sky-blue", name: "Sky Blue Official",
    primary: "202 88% 60%", accent: "340 100% 71%", foreground: "222 47% 11%", surface: "0 0% 100%", background_fallback: "201 94% 94%",
    bg: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "the-chase", name: "The Chase Concept",
    primary: "199 89% 74%", accent: "350 89% 60%", foreground: "192 78% 25%", surface: "204 80% 16%", background_fallback: "201 94% 94%",
    bg: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop"
  }
]

import React from "react"; 

function formatImageUrl(url: string): string {
  if (!url) return url;
  
  // Google Drive auto-convert from /view or /open to direct link
  // Update: use lh3.googleusercontent.com to bypass virus scan blocking
  const gdriveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
  if (gdriveMatch) {
    return `https://lh3.googleusercontent.com/d/${gdriveMatch[1]}`;
  }
  
  // Dropbox auto-convert from dl=0 to raw=1
  if (url.includes('dropbox.com') && url.includes('dl=0')) {
    return url.replace('dl=0', 'raw=1');
  }

  // Imgur auto-convert to direct image
  if (url.includes('imgur.com') && !url.includes('i.imgur.com') && !url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      const imgurMatch = url.match(/imgur\.com\/([a-zA-Z0-9]+)$/);
      if (imgurMatch) {
         return `https://i.imgur.com/${imgurMatch[1]}.jpg`;
      }
  }

  return url;
}

function ColorInput({ label, desc, initialColorRawHsl, onChange }: {label:string, desc?: string, initialColorRawHsl:string, onChange:(hex:string)=>void}) {
    const defaultHex = React.useMemo(() => {
        try { return hslToHex(initialColorRawHsl); } catch(e) { return "#000000"; }
    }, [initialColorRawHsl]);
    
    const [hex, setHex] = useState(defaultHex);
    
    useEffect(() => {
       setHex(defaultHex);
    }, [defaultHex]);

    const handleHexChange = (val: string) => {
        setHex(val);
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
            onChange(val);
        }
    };

    return (
        <div className="flex gap-4 p-5 rounded-xl bg-slate-950 border border-slate-800 shadow-sm focus-within:border-sky-500/50 transition-colors">
          <input 
            type="color" className="size-16 rounded-lg cursor-pointer border-2 border-slate-800 bg-transparent shrink-0"
            value={/^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : "#000000"} onChange={(e) => handleHexChange(e.target.value)}
          />
          <div className="flex-1">
            <Label className="text-[15px] font-bold text-slate-200">{label}</Label>
            {desc && <p className="text-[12px] text-slate-500 mb-2 leading-tight mt-0.5">{desc}</p>}
            
            <div className="flex mt-1.5 bg-slate-900 rounded-md border border-slate-800 overflow-hidden w-2/3">
              <span className="px-3 py-1.5 text-xs text-slate-500 bg-slate-950 border-r border-slate-800 select-none">HEX</span>
              <input type="text" className="w-full bg-transparent border-0 px-3 py-1.5 text-sm text-slate-200 font-mono focus:ring-0 uppercase placeholder-slate-600 outline-none"
                value={hex} onChange={(e) => handleHexChange(e.target.value)} onBlur={() => handleHexChange(defaultHex)} placeholder="#000000"
              />
            </div>
          </div>
        </div>
    )
}

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
      if (colors.foreground) root.style.setProperty('--foreground', colors.foreground)
      if (colors.surface) root.style.setProperty('--surface', colors.surface)
      if (colors.background_fallback) root.style.setProperty('--background-fallback', colors.background_fallback)
    }
    const assets = editFormData.config?.assets
    if (assets && assets.background_image) {
      root.style.setProperty('--background-image', `url('${assets.background_image}')`)
    } else {
      root.style.removeProperty('--background-image')
    }
  }

  useEffect(() => {
    if (isEditing) {
      applyIframeStyles()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      toast.error("Vui lòng nhập tên theme")
      return
    }
    setIsSaving(true)
    const result = await upsertTheme(editFormData)
    setIsSaving(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Đã ghi nhận thay đổi Theme!")
      window.location.reload()
    }
  }

  const handleActivate = async (id: string, currentlyActive: boolean) => {
    if (currentlyActive) return
    const result = await activateTheme(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Theme đã được hiển thị ngoài Trang Chủ!")
      window.location.reload()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn XÓA VĨNH VIỄN theme này không?")) return
    const result = await deleteTheme(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Đã xóa theme")
      setThemes(themes.filter((t) => t.id !== id))
    }
  }

  const handleCreateNew = () => {
    const defaultPreset = PRESETS[0]
    const newTheme: Partial<Theme> = {
      name: "Tên Theme Mới",
      is_active: false,
      config: {
        colors: {
          primary: defaultPreset.primary,
          accent: defaultPreset.accent,
          foreground: defaultPreset.foreground,
          surface: defaultPreset.surface,
          background_fallback: defaultPreset.background_fallback
        },
        assets: {
          logo: "/logo-official-removebg-.png",
          background_image: defaultPreset.bg
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

  const updateColor = (key: "primary" | "accent" | "foreground" | "surface" | "background_fallback", hex: string) => {
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
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Quản lý Theme</h2>
          <p className="text-slate-400">Điều khiển nhận diện hình ảnh của Homepage. Bật ON để xuất hiện ngay trang chủ.</p>
        </div>
        <Button onClick={handleCreateNew} className="rounded-full h-12 bg-sky-500 hover:bg-sky-600 text-white font-bold border-0 shadow-lg shadow-sky-500/20 px-8 text-[15px]">
          <Plus className="mr-2 size-5" /> Thêm Theme Mới
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {themes.map((theme) => {
          const isActive = theme.is_active
          return (
            <Card key={theme.id} className={cn(
              "overflow-hidden transition-all duration-300 relative group",
              isActive 
                ? 'bg-slate-900 border-2 border-sky-500 shadow-[0_0_40px_-10px_rgba(14,165,233,0.4)]' 
                : 'bg-slate-900/50 border border-slate-800 hover:border-slate-700 hover:shadow-xl'
            )}>
              <div 
                className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"
                style={{
                  backgroundImage: `url('${theme.config?.assets?.background_image || '/background.jpg'}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              
              <CardHeader className="relative flex flex-row items-center justify-between border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-6">
                <div className="flex items-center gap-5">
                  <div className="size-14 rounded-full shadow-inner border-2 border-slate-800 flex items-center justify-center overflow-hidden shrink-0 bg-slate-900">
                     <Image src={theme.config?.assets?.background_image || '/background.jpg'} alt="bg" width={56} height={56} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-100">{theme.name}</CardTitle>
                    {isActive 
                      ? <div className="mt-1.5 inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-2.5 py-0.5 border border-sky-500/20 text-sky-400">
                          <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span></span>
                          <span className="text-[10px] font-bold uppercase tracking-wider">ĐANG PHÁT TOÀN CẦU</span>
                        </div>
                      : <div className="mt-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-500">Theme đang ẩn</div>
                    }
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleActivate(theme.id, isActive)}
                    className={cn(
                      "flex items-center justify-center rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all",
                      isActive 
                        ? "bg-sky-500 text-white cursor-default shadow-lg shadow-sky-500/30 ring-2 ring-sky-500/50 ring-offset-2 ring-offset-slate-900" 
                        : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white hover:border-slate-600"
                    )}
                  >
                    {isActive ? "ON" : "OFF"}
                  </button>
                  <div className="h-8 w-px bg-slate-800 mx-2"></div>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(theme)} className="h-10 w-10 rounded-full text-slate-300 bg-slate-800/50 hover:bg-sky-500 hover:text-white">
                    <Palette className="size-4" />
                  </Button>
                  {!isActive && (
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(theme.id)} className="h-10 w-10 rounded-full text-slate-400 bg-slate-800/50 hover:bg-rose-500 hover:text-white">
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="relative p-6 bg-slate-950/60 backdrop-blur-sm">
                <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2">
                    {[
                      { key: "primary", name: "Thương Hiệu" },
                      { key: "accent", name: "Nhấn" },
                      { key: "foreground", name: "Chữ Chính" },
                      { key: "surface", name: "Màu Khối" },
                    ].map(c => (
                      <div key={c.key} className="space-y-1.5 flex flex-col items-center shrink-0 w-20">
                        <div className="h-8 w-full rounded-lg shadow-inner ring-1 ring-white/10" style={{ backgroundColor: `hsl(${(theme.config?.colors as any)?.[c.key]})` }} />
                        <p className="text-[10px] uppercase font-bold text-slate-400 truncate w-full text-center">{c.name}</p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={handleCancel} />
          <Card className="relative w-full max-w-[1500px] shadow-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col md:flex-row h-[90vh]">
            <button 
              onClick={handleCancel}
              className="absolute right-4 top-4 z-10 rounded-full bg-slate-900 border border-slate-700 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="size-5" />
            </button>

            {/* Left Side: Real Homepage Web Preview */}
            <div className="flex-1 bg-black relative flex flex-col items-center justify-center border-r border-slate-800/50 overflow-hidden">
               <div className="absolute top-6 left-8 z-10 flex items-center gap-3 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                  <MonitorPlay className="size-4 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] pt-px">Xem Trước Trực Tiếp Homepage</span>
               </div>
               
               <div className="w-full h-full p-4 md:p-10 lg:px-16 lg:py-20">
                 <div className="w-full h-full rounded-2xl border-4 border-slate-800/80 bg-slate-950 shadow-2xl overflow-hidden relative">
                   <iframe 
                      ref={iframeRef}
                      src="/"
                      onLoad={applyIframeStyles}
                      className="absolute inset-0 w-full h-full bg-transparent"
                   />
                 </div>
               </div>
            </div>

            {/* Right Side: Editors */}
            <div className="w-full md:w-[540px] flex flex-col bg-slate-900/50 relative border-l border-slate-800/50">
              <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar">
              <div>
                <h3 className="text-3xl font-bold text-white tracking-tight">Trình Sửa Theme</h3>
                <p className="text-sm text-slate-400 mt-2">Toàn quyền thay áo mới cho Website. Di chuột hoặc gõ mã màu dưới đây.</p>
              </div>

              <div className="space-y-8">
                {/* Theme Name */}
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-[13px] uppercase tracking-widest font-bold text-sky-400">Tên Của Theme</Label>
                  <Input 
                    id="name" 
                    className="h-14 text-xl font-bold rounded-xl border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all px-4"
                    value={editFormData.name || ""} 
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>

                {/* Images Configuration */}
                <div className="space-y-5 pt-6 border-t border-slate-800">
                  <Label className="text-[13px] uppercase tracking-widest font-bold text-sky-400 flex items-center gap-2">
                    <ImageIcon className="size-5" /> 1. Hình Ảnh Phủ Nền
                  </Label>
                  
                  <div className="space-y-4">
                      <Label className="text-[12px] font-bold text-slate-200">Đường Dẫn Cover Ảnh Nền</Label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Dán link hoặc nhấn nút để upload..."
                          className="rounded-lg h-11 border-slate-700 bg-slate-950 text-slate-300 text-sm focus:ring-sky-500 flex-1"
                          value={editFormData.config?.assets?.background_image || ""}
                          onChange={(e) => {
                            const formatted = formatImageUrl(e.target.value);
                            setEditFormData({
                              ...editFormData,
                              config: {
                                ...editFormData.config!,
                                assets: { ...editFormData.config!.assets, background_image: formatted }
                              }
                            });
                          }}
                        />
                        <MediaManager 
                          defaultCategory="Backgrounds"
                          onSelect={(url) => setEditFormData({
                            ...editFormData,
                            config: {
                              ...editFormData.config!,
                              assets: { ...editFormData.config!.assets, background_image: url }
                            }
                          })}
                          trigger={
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="h-11 w-11 rounded-lg text-slate-400 bg-slate-950 border border-slate-800 hover:text-sky-400 hover:bg-slate-900"
                            >
                              <Upload className="size-4" />
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  </div>

                {/* Color Configuration */}
                <div className="space-y-5 pt-6 border-t border-slate-800">
                  <Label className="text-[13px] uppercase tracking-widest font-bold text-sky-400">2. Cấu Trúc Bảng Màu (Kéo Hoặc Gõ Mã)</Label>
                  
                  <div className="grid gap-4">
                    <ColorInput 
                       label="Màu Thương Hiệu (Primary)"
                       desc="Áp dụng cho nút bấm chính, khối kêu gọi hành động."
                       initialColorRawHsl={(editFormData.config?.colors as any)?.primary || "0 0% 0%"} 
                       onChange={(hex) => updateColor("primary", hex)} 
                    />
                    <ColorInput 
                       label="Màu Khối Nền (Surface / Card)"
                       desc="Làm nền khung chứa cho các Popup, Bảng Tùy chỉnh."
                       initialColorRawHsl={(editFormData.config?.colors as any)?.surface || "0 0% 0%"} 
                       onChange={(hex) => updateColor("surface", hex)} 
                    />
                    <ColorInput 
                       label="Màu Nhấn (Accent)"
                       desc="Dùng để thu hút ánh nhìn: Cảnh báo đỏ, Trái tim, Chú ý nhỏ."
                       initialColorRawHsl={(editFormData.config?.colors as any)?.accent || "0 0% 0%"} 
                       onChange={(hex) => updateColor("accent", hex)} 
                    />
                    <ColorInput 
                       label="Màu Chữ Chính (Foreground)"
                       desc="Đóng vai trò quan trọng: Chữ Trắng hoặc Đen hiển thị trên Bìa Nền."
                       initialColorRawHsl={(editFormData.config?.colors as any)?.foreground || "0 0% 0%"} 
                       onChange={(hex) => updateColor("foreground", hex)} 
                    />
                    <ColorInput 
                       label="Màu Nền Chờ (Chỉ Khi Load Chậm)"
                       desc="Màu nền màu trơn hiện ra trong 1-2 giây chờ máy tải Ảnh Nền xuống."
                       initialColorRawHsl={(editFormData.config?.colors as any)?.background_fallback || "0 0% 0%"} 
                       onChange={(hex) => updateColor("background_fallback", hex)} 
                    />
                  </div>
                </div>

                {/* Visual Effects */}
                <div className="space-y-5 pt-6 border-t border-slate-800">
                  <Label className="text-[13px] uppercase tracking-widest font-bold text-sky-400">3. Hiệu Ứng Phụ Trợ (Công Tắc On/Off)</Label>
                  <div className="grid gap-3">
                    {[
                      { id: "film_grain", label: "Hạt Mù Nhiễu (Film Grain)", desc: "Trải một lớp nhiễu kiểu phim cũ cực đẹp mắt lên ảnh nền", key: "film_grain" },
                      { id: "glow_orbs", label: "Đèn Bay (Glow Orbs)", desc: "Điểm xuyết các khối sương mù đổi màu trôi nổi tự nhiên", key: "glow_orbs" },
                      { id: "floating_hearts", label: "Thả Hình Nổi (Tương Tác)", desc: "Cho phép fan chạm vào web để thả icon bay lên", key: "floating_hearts" }
                    ].map((effect) => (
                      <label 
                        key={effect.id} 
                        className="flex items-start gap-4 p-5 rounded-xl border border-slate-800 bg-slate-950 transition-all hover:border-slate-700 cursor-pointer"
                      >
                        <div className="flex items-center h-5 mt-0.5">
                          <input 
                            type="checkbox"
                            id={effect.id} 
                            className="size-5 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-950"
                            checked={(editFormData.config?.effects as any)?.[effect.key] || false}
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
                          <span className="text-sm font-bold text-slate-100 block">{effect.label}</span>
                          <span className="text-[11px] text-slate-400 block mt-1">{effect.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              </div>

              {/* Action Buttons Sticky Bottom */}
              <div className="p-6 bg-slate-950 border-t border-slate-800 flex justify-end gap-3 shrink-0 rounded-br-xl">
                    <Button variant="ghost" onClick={handleCancel} className="flex-1 h-12 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-bold border border-slate-800">Hủy</Button>
                    <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="flex-[2] h-12 rounded-xl bg-sky-500 text-white hover:bg-sky-400 shadow-[0_0_20px_-5px_rgba(14,165,233,0.5)] transition-all font-bold text-[16px]"
                    >
                    {isSaving ? <Loader2 className="mr-2 size-5 animate-spin" /> : <Save className="mr-2 size-4" />}
                    Save
                    </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
