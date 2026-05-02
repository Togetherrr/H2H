"use client"

import { useState } from "react"
import { 
  Plus, 
  Trash2, 
  Edit, 
  X, 
  Save, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Info,
  GripVertical,
  Upload,
  Loader2
} from "lucide-react"
import Image from "next/image"
import { MediaManager } from "./MediaManager"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { upsertMember, deleteMember, updateMembersOrder } from "@/app/admin/actions"
import { DynamicListInput } from "./DynamicListInput"
import { DynamicKeyValueInput } from "./DynamicKeyValueInput"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

// Sortable Row component
function SortableRow({ member, onEdit, onDelete }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: member.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 0,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <TableRow ref={setNodeRef} style={style} className={`group transition-colors hover:bg-slate-900/50 ${isDragging ? "bg-slate-900 shadow-xl border-sky-500/50" : ""}`}>
      <TableCell className="w-10">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-slate-600 hover:text-sky-500 transition-colors">
          <GripVertical className="size-4" />
        </button>
      </TableCell>
      <TableCell className="w-16">
        {member.profile_image_url ? (
          <Image src={member.profile_image_url} alt={member.stage_name} width={40} height={40} className="size-10 rounded-full object-cover border border-slate-800 shadow-sm" />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-full bg-slate-800 text-slate-400 font-medium text-xs border border-slate-700">
            {member.stage_name?.[0]}
          </div>
        )}
      </TableCell>
      <TableCell>
        <p className="font-medium text-slate-100">{member.stage_name}</p>
        <p className="text-xs text-slate-500">{member.full_name}</p>
      </TableCell>
      <TableCell className="text-slate-400">
        <div className="flex flex-wrap gap-1">
          {(member.positions || []).slice(0, 3).map((pos: string) => (
            <span key={pos} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
              {pos}
            </span>
          ))}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(member)} className="text-sky-600 hover:text-sky-700 hover:bg-sky-50">
            <Edit className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(member.id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50">
            <Trash2 className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export function MembersManager({ initialMembers }: { initialMembers: any[] }) {
  const [members, setMembers] = useState<any[]>(initialMembers.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [formData, setFormData] = useState<any>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleOpen = (member?: any) => {
    if (member) {
      setEditingId(member.id)
      
      const favsObj = member.favorites || {}
      const favsArr = Object.keys(favsObj).map(k => {
        const val = favsObj[k]
        return { key: k, value: Array.isArray(val) ? val.join(", ") : val }
      })

      setFormData({
        id: member.id,
        slug: member.slug || "",
        stage_name: member.stage_name || "",
        stage_name_kr: member.stage_name_kr || "",
        full_name: member.full_name || "",
        full_name_kr: member.full_name_kr || "",
        english_name: member.english_name || "",
        positions: member.positions || [],
        intro: member.intro || "",
        profile_image_url: member.profile_image_url || "",
        cover_image_url: member.cover_image_url || "",
        sort_order: member.sort_order || 0,
        is_active: member.is_active ?? true,
        birth_date: member.birth_date || "",
        zodiac: member.zodiac || "",
        birthplace: member.birthplace || "",
        nationality: member.nationality || "",
        height_cm: member.height_cm || "",
        blood_type: member.blood_type || "",
        mbti: member.mbti || "",
        emoji: member.emoji || "",
        training_years: member.training_years || "",
        hakyuha_character: member.hakyuha_character || "",
        role_model: member.role_model || "",
        bio_short: member.bio_short || "",
        bio_short_en: member.bio_short_en || "",
        nicknames: member.nicknames || [],
        fun_facts_vi: member.fun_facts_vi || [],
        fun_facts_en: member.fun_facts_en || [],
        source_url: member.source_url || "",
        card: member.card || { avatar: "", name: "", role_label: "" },
        detail: member.detail || { 
          group_label: "", name: "", role_label: "", image: "", 
          bio: "", bio_en: "", highlights: [], 
          source_label: "", source_note: "", source_name: "", source_url: "" 
        },
        favoritesArray: favsArr
      })
    } else {
      setEditingId(null)
      setFormData({
        slug: "",
        stage_name: "",
        stage_name_kr: "",
        full_name: "",
        full_name_kr: "",
        english_name: "",
        positions: [],
        intro: "",
        profile_image_url: "",
        cover_image_url: "",
        sort_order: members.length,
        is_active: true,
        birth_date: "",
        zodiac: "",
        birthplace: "",
        nationality: "",
        height_cm: "",
        blood_type: "",
        mbti: "",
        emoji: "",
        training_years: "",
        hakyuha_character: "",
        role_model: "",
        bio_short: "",
        bio_short_en: "",
        nicknames: [],
        fun_facts_vi: [],
        fun_facts_en: [],
        source_url: "",
        card: { avatar: "", name: "", role_label: "" },
        detail: { 
          group_label: "HEARTS2HEARTS MEMBER", name: "", role_label: "", image: "", 
          bio: "", bio_en: "", highlights: [], 
          source_label: "SOURCE & ATTRIBUTION", source_note: "", source_name: "", source_url: "" 
        },
        favoritesArray: []
      })
    }
    setIsPanelOpen(true)
  }

  const handleClose = () => {
    setIsPanelOpen(false)
    setFormData(null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setMembers((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        const newArr = arrayMove(items, oldIndex, newIndex)
        setHasChanges(true)
        return newArr
      })
    }
  }

  const saveSorting = async () => {
    setIsSubmitting(true)
    try {
      const orders = members.map((member, index) => ({
        id: member.id,
        sort_order: index
      }))
      const result = await updateMembersOrder(orders)
      if (result?.error) {
        toast.error(result.error)
      } else {
        setHasChanges(false)
        toast.success("Đã lưu thứ tự thành viên mới!")
      }
    } catch (err) {
      toast.error("Lỗi khi lưu thứ tự")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const favsObj: Record<string, string | string[]> = {}
      formData.favoritesArray.forEach((f: any) => {
        if (f.key && f.value) {
          if (f.value.includes(",")) {
            favsObj[f.key] = f.value.split(",").map((v: string) => v.trim())
          } else {
            favsObj[f.key] = f.value
          }
        }
      })

      const payload = {
        ...formData,
        height_cm: formData.height_cm ? Number(formData.height_cm) : null,
        training_years: formData.training_years ? Number(formData.training_years) : null,
        favorites: favsObj,
        favoritesArray: undefined,
        ...(editingId ? { id: editingId } : {}),
      }

      const result = await upsertMember(payload)
      if (result?.error) {
        toast.error(`Lỗi: ${result.error}`)
      } else {
        toast.success(editingId ? "Cập nhật thành công!" : "Thêm thành viên thành công!")
        window.location.reload()
      }
    } catch (err) {
      toast.error("Đã có lỗi xảy ra")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteMember(id)
      if (result?.error) {
        toast.error(`Lỗi: ${result.error}`)
      } else {
        setMembers(members.filter(m => m.id !== id))
        toast.success("Đã xóa thành viên")
      }
    } catch (err) {
      toast.error("Không thể xóa")
    } finally {
      setDeleteId(null)
    }
  }

  const normalizeImageUrl = (url: string) => {
    const trimmed = url.trim()
    if (!trimmed) {
      return ""
    }
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("/") ||
      trimmed.startsWith("data:")
    ) {
      return trimmed
    }
    return `/${trimmed}`
  }

  const convertGDriveLink = (url: string) => {
    if (url.includes("drive.google.com")) {
      const fileIdMatch = url.match(/\/d\/([^/]+)/) || url.match(/id=([^&]+)/)
      if (fileIdMatch && fileIdMatch[1]) {
        return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`
      }
    }
    return normalizeImageUrl(url)
  }

  return (
    <div className="animate-in fade-in duration-300 relative">
      <div className="mb-12">
        <h2 className="text-4xl font-extralight tracking-tight text-white mb-2">Member Management</h2>
        <p className="text-slate-500 text-sm">Add, remove and manage the profiles of your group members.</p>
      </div>

      <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button onClick={() => handleOpen()} className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-lg shadow-sky-900/20">
              <Plus className="mr-2 h-4 w-4" /> Add New Member
            </Button>
            {hasChanges && (
              <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl border-slate-800 text-slate-400 hover:bg-slate-900">
                <X className="mr-2 h-4 w-4" /> Reset Order
              </Button>
            )}
          </div>
          {hasChanges && (
            <Button onClick={saveSorting} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-900/20">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save New Order
            </Button>
          )}
        </div>

      <Card className="overflow-hidden border-slate-800 bg-slate-950/40 backdrop-blur-sm shadow-xl">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <Table>
            <TableHeader className="bg-slate-900/50">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="w-10"></TableHead>
                <TableHead className="w-16">Profile</TableHead>
                <TableHead className="text-slate-400 font-medium">Stage Name</TableHead>
                <TableHead className="text-slate-400 font-medium">Positions</TableHead>
                <TableHead className="text-right text-slate-400 font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext items={members.map(m => m.id)} strategy={verticalListSortingStrategy}>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                      No members found.
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => (
                    <SortableRow 
                      key={member.id} 
                      member={member} 
                      onEdit={handleOpen} 
                      onDelete={setDeleteId} 
                    />
                  ))
                )}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
      </Card>

      {/* Slide-out Panel overlay */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={handleClose} />
      )}

      {/* Slide-out Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-3xl bg-slate-950 shadow-2xl transition-transform duration-500 ease-in-out border-l border-slate-800 overflow-hidden flex flex-col ${
          isPanelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {formData && (
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950 z-10">
              <div>
                <h3 className="text-xl font-medium text-white">{editingId ? "Edit Member" : "Add Member"}</h3>
                <p className="text-sm text-slate-500">Quản lý chi tiết hồ sơ thành viên.</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={handleClose} className="rounded-full text-slate-400 hover:bg-slate-900">
                <X className="size-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-950/50 p-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-6 bg-slate-900 p-1 rounded-xl">
                  <TabsTrigger value="basic" className="rounded-lg data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-sm">Basic</TabsTrigger>
                  <TabsTrigger value="physical" className="rounded-lg data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-sm">Physical</TabsTrigger>
                  <TabsTrigger value="bio" className="rounded-lg data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-sm">Bio</TabsTrigger>
                  <TabsTrigger value="card" className="rounded-lg data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-sm">Card</TabsTrigger>
                  <TabsTrigger value="detail" className="rounded-lg data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-sm">Detail</TabsTrigger>
                </TabsList>

                {/* BASIC INFO */}
                <TabsContent value="basic" className="space-y-6 focus-visible:outline-none focus-visible:ring-0 mt-0">
                  <div className="grid gap-6 p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label className="text-slate-300">Stage Name <span className="text-red-500">*</span></Label>
                        <Input value={formData.stage_name} onChange={e => setFormData({...formData, stage_name: e.target.value})} required className="bg-slate-950 border-slate-800 text-white" />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-300">Stage Name (KR)</Label>
                        <Input value={formData.stage_name_kr} onChange={e => setFormData({...formData, stage_name_kr: e.target.value})} className="bg-slate-950 border-slate-800 text-white" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label className="text-slate-300">Full Name</Label>
                        <Input value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="bg-slate-950 border-slate-800 text-white" />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-300">Full Name (KR)</Label>
                        <Input value={formData.full_name_kr} onChange={e => setFormData({...formData, full_name_kr: e.target.value})} className="bg-slate-950 border-slate-800 text-white" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label className="text-slate-300">Slug <span className="text-red-500">*</span></Label>
                        <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-")})} required className="bg-slate-950 border-slate-800 text-white" />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-300">English Name</Label>
                        <Input value={formData.english_name} onChange={e => setFormData({...formData, english_name: e.target.value})} className="bg-slate-950 border-slate-800 text-white" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label className="text-slate-300">Birthday (Birth Date)</Label>
                        <Input type="date" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} className="bg-slate-950 border-slate-800 text-white" />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-300">Nationality</Label>
                        <Input value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} className="bg-slate-950 border-slate-800 text-white" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-300">Profile Image URL</Label>
                      <div className="flex gap-2">
                        <div className="flex items-center justify-center size-10 rounded border border-slate-800 bg-slate-950 text-slate-600 shrink-0 overflow-hidden relative">
                          {formData.profile_image_url ? <Image src={formData.profile_image_url} alt="" fill className="object-cover" /> : <ImageIcon className="size-4" />}
                        </div>
                        <Input value={formData.profile_image_url} onChange={e => setFormData({...formData, profile_image_url: convertGDriveLink(e.target.value)})} placeholder="Main avatar URL" className="bg-slate-950 border-slate-800 text-white flex-1" />
                        <MediaManager 
                          defaultCategory="Members"
                          onSelect={(url) => setFormData({...formData, profile_image_url: url})}
                          trigger={
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon" 
                              className="shrink-0 border-slate-800 hover:bg-slate-800 hover:text-sky-400"
                            >
                              <Upload className="size-4" />
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* PHYSICAL */}
                <TabsContent value="physical" className="space-y-6 focus-visible:outline-none focus-visible:ring-0 mt-0">
                  <div className="grid grid-cols-2 gap-6 p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm">
                    <div className="grid gap-2">
                      <Label className="text-slate-300">Height (cm)</Label>
                      <Input type="number" value={formData.height_cm} onChange={e => setFormData({...formData, height_cm: e.target.value})} className="bg-slate-950 border-slate-800 text-white" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-300">Blood Type</Label>
                      <Input value={formData.blood_type} onChange={e => setFormData({...formData, blood_type: e.target.value})} className="bg-slate-950 border-slate-800 text-white" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-300">MBTI</Label>
                      <Input value={formData.mbti} onChange={e => setFormData({...formData, mbti: e.target.value})} className="bg-slate-950 border-slate-800 text-white" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-300">Zodiac</Label>
                      <Input value={formData.zodiac} onChange={e => setFormData({...formData, zodiac: e.target.value})} className="bg-slate-950 border-slate-800 text-white" />
                    </div>
                    <div className="grid gap-2 col-span-2">
                      <Label className="text-slate-300">Emoji</Label>
                      <Input value={formData.emoji} onChange={e => setFormData({...formData, emoji: e.target.value})} className="bg-slate-950 border-slate-800 text-white text-lg" />
                    </div>
                    <div className="grid gap-2 col-span-2">
                      <Label className="text-slate-300">Birthplace</Label>
                      <Input value={formData.birthplace} onChange={e => setFormData({...formData, birthplace: e.target.value})} className="bg-slate-950 border-slate-800 text-white" />
                    </div>
                  </div>
                </TabsContent>

                {/* BIO & TRIVIA */}
                <TabsContent value="bio" className="space-y-6 focus-visible:outline-none focus-visible:ring-0 mt-0">
                  <div className="grid gap-6 p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm">
                    <DynamicListInput label="Positions" items={formData.positions} onChange={items => setFormData({...formData, positions: items})} />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label className="text-slate-300">Training Years</Label>
                        <Input type="number" step="0.1" value={formData.training_years} onChange={e => setFormData({...formData, training_years: e.target.value})} className="bg-slate-950 border-slate-800 text-white" />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-300">Hakyuha Character</Label>
                        <Input value={formData.hakyuha_character} onChange={e => setFormData({...formData, hakyuha_character: e.target.value})} className="bg-slate-950 border-slate-800 text-white" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-300">Short Bio</Label>
                      <Textarea value={formData.bio_short} onChange={e => setFormData({...formData, bio_short: e.target.value})} className="bg-slate-950 border-slate-800 text-white h-20 resize-none" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-300">Short Bio (EN)</Label>
                      <Textarea value={formData.bio_short_en} onChange={e => setFormData({...formData, bio_short_en: e.target.value})} className="bg-slate-950 border-slate-800 text-white h-20 resize-none" />
                    </div>
                  </div>
                  <div className="grid gap-6 p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm">
                    <DynamicListInput label="Nicknames" items={formData.nicknames} onChange={items => setFormData({...formData, nicknames: items})} />
                    <DynamicListInput label="Fun Facts (VI)" items={formData.fun_facts_vi} onChange={items => setFormData({...formData, fun_facts_vi: items})} />
                    <DynamicListInput label="Fun Facts (EN)" items={formData.fun_facts_en} onChange={items => setFormData({...formData, fun_facts_en: items})} />
                    <DynamicKeyValueInput label="Favorites" items={formData.favoritesArray} onChange={items => setFormData({...formData, favoritesArray: items})} />
                  </div>
                </TabsContent>

                {/* CARD CONFIG */}
                <TabsContent value="card" className="space-y-6 focus-visible:outline-none focus-visible:ring-0 mt-0">
                  <div className="grid gap-6 p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="size-16 rounded-xl bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800 relative">
                        {formData.card.avatar ? (
                          <Image src={normalizeImageUrl(formData.card.avatar)} alt="" fill className="object-cover" />
                        ) : (
                          <ImageIcon className="text-slate-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Card Preview</h4>
                        <p className="text-xs text-slate-500">How the member appears in lists.</p>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-300">Card Avatar URL</Label>
                      <div className="flex gap-2">
                        <Input value={formData.card.avatar} onChange={e => setFormData({...formData, card: {...formData.card, avatar: convertGDriveLink(e.target.value)}})} className="bg-slate-950 border-slate-800 text-white flex-1" />
                        <MediaManager 
                          defaultCategory="Members"
                          onSelect={(url) => setFormData({...formData, card: {...formData.card, avatar: url}})}
                          trigger={
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon" 
                              className="shrink-0 border-slate-800 hover:bg-slate-800 hover:text-sky-400"
                            >
                              <Upload className="size-4" />
                            </Button>
                          }
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-300">Card Name (Uppercase)</Label>
                      <Input value={formData.card.name} onChange={e => setFormData({...formData, card: {...formData.card, name: e.target.value.toUpperCase()}})} className="bg-slate-950 border-slate-800 text-white" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-300">Role Label</Label>
                      <Input value={formData.card.role_label} onChange={e => setFormData({...formData, card: {...formData.card, role_label: e.target.value}})} placeholder="e.g. LEADER" className="bg-slate-950 border-slate-800 text-white" />
                    </div>
                  </div>
                </TabsContent>

                {/* DETAIL CONFIG */}
                <TabsContent value="detail" className="space-y-6 focus-visible:outline-none focus-visible:ring-0 mt-0">
                  <div className="grid gap-6 p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label className="text-slate-300">Group Label</Label>
                        <Input value={formData.detail.group_label} onChange={e => setFormData({...formData, detail: {...formData.detail, group_label: e.target.value}})} className="bg-slate-950 border-slate-800 text-white" />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-300">Detail Name</Label>
                        <Input value={formData.detail.name} onChange={e => setFormData({...formData, detail: {...formData.detail, name: e.target.value}})} className="bg-slate-950 border-slate-800 text-white" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-300">Detail Large Image URL</Label>
                      <div className="flex gap-2">
                        <Input value={formData.detail.image} onChange={e => setFormData({...formData, detail: {...formData.detail, image: convertGDriveLink(e.target.value)}})} className="bg-slate-950 border-slate-800 text-white flex-1" />
                        <MediaManager 
                          defaultCategory="Members"
                          onSelect={(url) => setFormData({...formData, detail: {...formData.detail, image: url}})}
                          trigger={
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon" 
                              className="shrink-0 border-slate-800 hover:bg-slate-800 hover:text-sky-400"
                            >
                              <Upload className="size-4" />
                            </Button>
                          }
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-300">Detail Biography</Label>
                      <Textarea value={formData.detail.bio} onChange={e => setFormData({...formData, detail: {...formData.detail, bio: e.target.value}})} className="bg-slate-950 border-slate-800 text-white h-24" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-300">Detail Biography (EN)</Label>
                      <Textarea value={formData.detail.bio_en} onChange={e => setFormData({...formData, detail: {...formData.detail, bio_en: e.target.value}})} className="bg-slate-950 border-slate-800 text-white h-24" />
                    </div>
                    <DynamicListInput label="Highlights" items={formData.detail.highlights} onChange={items => setFormData({...formData, detail: {...formData.detail, highlights: items}})} />
                  </div>

                  <div className="grid gap-4 p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm">
                    <h4 className="font-medium text-white flex items-center gap-2"><LinkIcon className="size-4" /> Source & Attribution</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label className="text-slate-300">Source Label</Label>
                        <Input value={formData.detail.source_label} onChange={e => setFormData({...formData, detail: {...formData.detail, source_label: e.target.value}})} className="bg-slate-950 border-slate-800 text-white" />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-300">Source Name</Label>
                        <Input value={formData.detail.source_name} onChange={e => setFormData({...formData, detail: {...formData.detail, source_name: e.target.value}})} className="bg-slate-950 border-slate-800 text-white" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-300">Source URL</Label>
                      <Input value={formData.detail.source_url} onChange={e => setFormData({...formData, detail: {...formData.detail, source_url: e.target.value}})} className="bg-slate-950 border-slate-800 text-white" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-300">Source Note</Label>
                      <Textarea value={formData.detail.source_note} onChange={e => setFormData({...formData, detail: {...formData.detail, source_note: e.target.value}})} className="bg-slate-950 border-slate-800 text-white h-20 text-xs" />
                    </div>
                  </div>
                </TabsContent>

              </Tabs>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3 z-10 shadow-lg">
              <Button type="button" variant="outline" onClick={handleClose} className="border-slate-800 text-slate-300 hover:bg-slate-900">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-sky-600 text-white hover:bg-sky-700 min-w-[120px]">
                {isSubmitting ? "Saving..." : <><Save className="size-4 mr-2" /> Save 2.0</>}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl border-none p-8 max-w-[400px]">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="size-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
              <Trash2 className="size-10" />
            </div>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold text-slate-800">Xác nhận xóa?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-500 leading-relaxed">
                Hành động này không thể hoàn tác. Hồ sơ thành viên này sẽ bị gỡ bỏ vĩnh viễn khỏi hệ thống.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="w-full flex flex-row gap-3 mt-6">
              <AlertDialogCancel className="flex-1 h-12 rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold m-0">
                Hủy bỏ
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => deleteId && handleDelete(deleteId)}
                className="flex-1 h-12 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg shadow-red-100 m-0"
              >
                Xác nhận xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
