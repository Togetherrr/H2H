"use client"

import { useState } from "react"
import { 
  Save, 
  Info, 
  Users, 
  Heart, 
  Calendar, 
  Palette, 
  Star, 
  MessageSquare, 
  Quote,
  Layout
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { upsertSiteSettings } from "@/app/admin/actions"
import { DynamicListInput } from "./DynamicListInput"

export function SiteSettingsManager({ initialSettings }: { initialSettings: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    ...initialSettings,
    sns: initialSettings.sns || {},
    dorms: initialSettings.dorms || { dorm_1: [], dorm_2: [] }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const result = await upsertSiteSettings(formData)
      if (result?.error) {
        toast.error(`Lỗi: ${result.error}`)
      } else {
        toast.success("Đã lưu cấu hình trang web thành công!")
        window.location.reload()
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi không xác định")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-sky-600 rounded-xl shadow-lg shadow-sky-900/20">
              <Layout className="size-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Site Configuration</h2>
          </div>
          <p className="text-slate-500 font-medium">Quản lý các thiết lập chung cho toàn bộ cổng thông tin Hearts2Hearts.</p>
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting} 
          className="bg-sky-600 text-white hover:bg-sky-700 shadow-xl shadow-sky-900/20 min-w-[160px] h-12 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95"
        >
          {isSubmitting ? "Đang lưu..." : <><Save className="size-5 mr-2" /> Lưu Cấu Hình</>}
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Settings Column */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-slate-800 shadow-2xl bg-slate-900/40 backdrop-blur-md rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-slate-900/80 border-b border-slate-800 p-8">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-sky-950/50 rounded-2xl flex items-center justify-center text-sky-500 border border-sky-900/50">
                  <Info className="size-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-white">Thông Tin Cơ Bản</CardTitle>
                  <CardDescription className="text-slate-500">Định danh nhóm, ngày ra mắt và thông tin thương hiệu.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8 bg-slate-900/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <Star className="size-4 text-sky-500" /> Tên Nhóm
                  </Label>
                  <Input 
                    value={formData.group_name} 
                    onChange={e => setFormData({...formData, group_name: e.target.value})} 
                    className="h-12 rounded-xl bg-slate-950 border-slate-800 focus:bg-slate-900 focus:ring-sky-500 text-white transition-all font-medium"
                    placeholder="Hearts2Hearts"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <Quote className="size-4 text-sky-500" /> Tên Viết Tắt
                  </Label>
                  <Input 
                    value={formData.short_name} 
                    onChange={e => setFormData({...formData, short_name: e.target.value})} 
                    className="h-12 rounded-xl bg-slate-950 border-slate-800 focus:bg-slate-900 focus:ring-sky-500 text-white transition-all font-medium"
                    placeholder="H2H"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <Calendar className="size-4 text-sky-500" /> Ngày Ra Mắt
                  </Label>
                  <Input 
                    type="date" 
                    value={formData.debut_date} 
                    onChange={e => setFormData({...formData, debut_date: e.target.value})} 
                    className="h-12 rounded-xl bg-slate-950 border-slate-800 focus:bg-slate-900 focus:ring-sky-500 text-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <Palette className="size-4 text-sky-500" /> Màu Sắc Chính Thức
                  </Label>
                  <Input 
                    value={formData.official_color} 
                    onChange={e => setFormData({...formData, official_color: e.target.value})} 
                    className="h-12 rounded-xl bg-slate-950 border-slate-800 focus:bg-slate-900 focus:ring-sky-500 text-white transition-all"
                    placeholder="Sky Blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <Heart className="size-4 text-sky-500" /> Tên Fandom
                  </Label>
                  <Input 
                    value={formData.fandom_name} 
                    onChange={e => setFormData({...formData, fandom_name: e.target.value})} 
                    className="h-12 rounded-xl bg-slate-950 border-slate-800 focus:bg-slate-900 focus:ring-sky-500 text-white transition-all"
                    placeholder="S2U"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <Star className="size-4 text-sky-500" /> Mascot
                  </Label>
                  <Input 
                    value={formData.mascot} 
                    onChange={e => setFormData({...formData, mascot: e.target.value})} 
                    className="h-12 rounded-xl bg-slate-950 border-slate-800 focus:bg-slate-900 focus:ring-sky-500 text-white transition-all"
                    placeholder="Falabella"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <MessageSquare className="size-4 text-sky-500" /> Lời Chào Chính Thức
                </Label>
                <Input 
                  value={formData.official_greeting} 
                  onChange={e => setFormData({...formData, official_greeting: e.target.value})} 
                  className="h-12 rounded-xl bg-slate-950 border-slate-800 focus:bg-slate-900 focus:ring-sky-500 text-white transition-all"
                  placeholder="Hello, we are Hearts2Hearts!"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <Info className="size-4 text-sky-500" /> Mô Tả Trang Web
                </Label>
                <Textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className="rounded-2xl bg-slate-950 border-slate-800 focus:bg-slate-900 focus:ring-sky-500 text-white transition-all h-32 resize-none p-4"
                  placeholder="Nhập mô tả cho Landing Page..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Settings Column */}
        <div className="space-y-8">
          <Card className="border-slate-800 shadow-2xl bg-slate-900/40 backdrop-blur-md rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-slate-900/80 border-b border-slate-800 p-8">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-sky-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-900/20">
                  <Users className="size-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-white">Ký Túc Xá</CardTitle>
                  <CardDescription className="text-slate-500">Phân chia thành viên vào các phòng.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6 bg-slate-900/20">
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 relative overflow-hidden group hover:bg-slate-900/50 transition-colors">
                  <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform">
                    <Heart className="size-24 fill-sky-600" />
                  </div>
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                    <div className="size-6 bg-sky-600 rounded-full flex items-center justify-center text-white text-[10px]">1</div>
                    Phòng 1
                  </h4>
                  <div className="relative z-10">
                    <DynamicListInput 
                      items={formData.dorms.dorm_1 || []} 
                      onChange={newItems => setFormData({...formData, dorms: {...formData.dorms, dorm_1: newItems}})} 
                      placeholder="Nhập slug (ví dụ: jiwoo)"
                    />
                  </div>
                </div>
 
                <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 relative overflow-hidden group hover:bg-slate-900/50 transition-colors">
                  <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform">
                    <Heart className="size-24 fill-sky-600" />
                  </div>
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                    <div className="size-6 bg-sky-600 rounded-full flex items-center justify-center text-white text-[10px]">2</div>
                    Phòng 2
                  </h4>
                  <div className="relative z-10">
                    <DynamicListInput 
                      items={formData.dorms.dorm_2 || []} 
                      onChange={newItems => setFormData({...formData, dorms: {...formData.dorms, dorm_2: newItems}})} 
                      placeholder="Nhập slug (ví dụ: juun)"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
