"use client"

import { useState } from "react"
import Image from "next/image"
import { 
  Plus, Trash2, Edit, Youtube, Instagram, Twitter, Facebook, 
  Link as LinkIcon, GripVertical, Save 
} from "lucide-react"
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import { Card } from "@/components/ui/card"
import { upsertSocialLink, deleteSocialLink, updateSocialLinksOrder } from "@/app/admin/actions"

// Reusable Sortable Row component
function SortableRow({ link, onEdit, onDelete, renderIcon }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: link.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 0,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <TableRow ref={setNodeRef} style={style} className={`group transition-colors hover:bg-slate-800/50 ${isDragging ? "bg-slate-900 shadow-xl border-slate-700" : ""}`}>
      <TableCell className="w-10">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-slate-600 hover:text-slate-400">
          <GripVertical className="size-4" />
        </button>
      </TableCell>
      <TableCell className="text-center w-16">
        <div className="mx-auto flex size-8 items-center justify-center rounded-full bg-white p-1.5 border border-slate-700">
          {renderIcon(link.note, "size-full object-contain")}
        </div>
      </TableCell>
      <TableCell className="font-medium text-slate-100">{link.label}</TableCell>
      <TableCell className="text-slate-500 truncate max-w-[300px]">
        <a href={link.url} target="_blank" rel="noreferrer" className="hover:underline text-xs text-sky-500">
          {link.url}
        </a>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(link)} className="size-8">
            <Edit className="size-4 text-slate-400 hover:text-sky-600" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(link.id)} className="size-8">
            <Trash2 className="size-4 text-slate-400 hover:text-red-600" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

const AVAILABLE_ICONS = [
  { id: "Youtube", slug: "youtube" },
  { id: "Instagram", slug: "instagram" },
  { id: "X", slug: "x" },
  { id: "Facebook", slug: "facebook" },
  { id: "Tiktok", slug: "tiktok" },
  { id: "Weverse", slug: "weverse" },
  { id: "Weibo", slug: "sinaweibo" },
  { id: "Bilibili", slug: "bilibili" },
  { id: "Spotify", slug: "spotify" },
  { id: "Music", slug: "applemusic" },
  { id: "Link", slug: "linktree" },
]

export function SocialsManager({ initialLinks }: { initialLinks: any[] }) {
  const [links, setLinks] = useState<any[]>(initialLinks.sort((a,b) => a.sort_order - b.sort_order))
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  
  const [formData, setFormData] = useState<any>({
    label: "",
    url: "",
    note: "Link",
    is_active: true,
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleOpen = (link?: any) => {
    if (link) {
      setEditingId(link.id)
      setFormData(link)
    } else {
      setEditingId(null)
      setFormData({
        label: "",
        url: "",
        note: "Link",
        is_active: true,
      })
    }
    setIsOpen(true)
  }

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // Auto-platform from label if not set
      const payload = {
        ...formData,
        platform: formData.label,
        sort_order: editingId ? formData.sort_order : links.length,
        ...(editingId ? { id: editingId } : {})
      }
      const result = await upsertSocialLink(payload)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Đã lưu liên kết thành công!")
        window.location.reload()
      }
    } catch (err) {
      toast.error("Lỗi khi lưu liên kết")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setLinks((items) => {
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
      const orders = links.map((link, index) => ({
        id: link.id,
        sort_order: index
      }))
      const result = await updateSocialLinksOrder(orders)
      if (result?.error) {
        toast.error(result.error)
      } else {
        setHasChanges(false)
        toast.success("Đã lưu thứ tự sắp xếp mới!")
      }
    } catch (err) {
      toast.error("Không thể lưu thứ tự")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteSocialLink(id)
      setLinks(links.filter(l => l.id !== id))
      toast.success("Đã xóa liên kết")
    } catch (err) {
      toast.error("Lỗi khi xóa liên kết")
    } finally {
      setDeleteId(null)
    }
  }

  const renderIcon = (iconId: string | null | undefined, className: string = "size-4") => {
    if (!iconId) return <LinkIcon className={className} />
    
    const isWeverse = iconId.toLowerCase() === "weverse"

    // Official Weverse Inline SVG (Brandfetch version)
    if (isWeverse) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 512 512">
          <defs>
            <linearGradient id="a" gradientUnits="userSpaceOnUse"/>
            <linearGradient id="b" x2="1" gradientTransform="scale(461.56)rotate(42.582 -.07 .17)" href="#a">
              <stop stopColor="#000120"/>
              <stop offset="1" stopColor="#000120"/>
            </linearGradient>
          </defs>
          <path fillRule="evenodd" d="M89.8 0h332.4C471.8 0 512 40.2 512 89.8v332.4c0 49.6-40.2 89.8-89.8 89.8H89.8C40.2 512 0 471.8 0 422.2V89.8C0 40.2 40.2 0 89.8 0" style={{fill: "url(#b)"}}/>
          <path fillRule="evenodd" d="M75.3 172.1s12-7.2 17.8-9.9 11.5-4.9 16.9-6.6l3.8-1.2q1.9-.5 3.9-1 1.9-.5 3.9-.9 1.9-.4 3.9-.8c5-.8 9.6-1.3 14-1.5 4.3-.1 8.3 0 12 .4s7 1.1 9.9 1.9c2.8.8 5.3 1.8 7.3 2.8.6.3 1.4.7 2.3 1.4q1.5.9 3.3 2.4l1 .8q.5.4.9.9.5.4 1 .9l.9.9 1 1.2 1 1.2q.4.6.9 1.2.4.7.9 1.3.4.8.9 1.5.4.8.9 1.5.4.8.9 1.6l.8 1.6q.3.8.7 1.6.4 1 .7 2 .4.9.7 1.9t.5 2q.3 1 .5 2c.6 2.9.9 6.1 1 9.6q0 5.25-.9 11.4l-1.3 8-1.2 7.9-1.2 7.9-1.3 7.9-1.2 8-1.3 7.9-1.2 7.9-1.3 7.9q-.1 1.2-.3 2.4-.1 1.2-.3 2.4l-.2 2.4-.2 2.4q-.4 4.5-.5 8.3 0 3.9.3 7.2.4 3.2 1.1 5.9.7 2.6 1.8 4.6 1.2 2 2.8 3.3.3.3.8.6.4.3.9.6.4.2.9.4.5.3 1 .4 2 .7 4.5.7 2.2 0 4.8-.7c1.8-.5 3.6-1.3 5.5-2.3 1.9-1.1 3.9-2.5 5.9-4.2s4-3.7 5.9-6.1c2-2.4 3.9-5.2 5.7-8.5q2.7-4.8 5.1-10.9 2.3-6.1 4.2-13.7c1.2-5 2.3-10.5 3-16.6l1.4-10.5 1.4-10.5 1.3-10.5 1.4-10.5 1.3-10.5 1.4-10.5 1.4-10.5 1.3-10.5H302l-1.8 13.5-1.7 13.5-1.7 13.5-1.7 13.4-1.8 13.5-1.7 13.5-1.7 13.5-1.7 13.4q-.7 5.4-1.1 10-.3 4.5-.3 8.3 0 3.7.3 6.7.4 3.1 1.1 5.4t1.8 4q1.1 1.6 2.6 2.7.3.3.7.5.4.3.8.5.5.2.9.3.4.2.9.3 1.8.5 4 .5c1.6 0 3.5-.3 5.4-.8 1.9-.6 3.9-1.5 5.9-2.8s4.1-2.9 6.2-5 4.2-4.5 6.3-7.5 4.1-6.4 6.1-10.4 3.8-8.5 5.6-13.5c1.8-5.1 3.4-10.8 4.9-17.1s2.8-13.2 3.9-20.8q.2-1.1.3-2.3.2-1.1.3-2.2.2-1.2.3-2.3.2-1.1.3-2.3.5-4.4.8-8.6t.5-8.3q.1-4.1.1-8.2v-4.1q-.1-1-.1-2.1 0-1-.1-2 0-1.1-.1-2.1 0-1.1-.1-2.1 0-1.1-.1-2.2-.1-1-.2-2.1-.3-4.3-.8-8.8-.1-1.2-.2-2.3-.2-1.2-.3-2.4-.2-1.1-.3-2.3t-.3-2.4h63.2c.2 1.2.3 2.8.4 5 .2 2.1.3 4.7.5 7.6.3 2.9.6 6.2 1 9.7q.2 1.3.4 2.7l.4 2.8q.3 1.4.5 2.7l.6 2.8c.8 3.8 1.9 7.7 3.2 11.6 1.4 4 3 7.9 5.1 11.7 2 3.8 4.4 7.5 7.3 10.9l2.2 2.6q1.2 1.3 2.5 2.5 1.2 1.2 2.5 2.3t2.7 2.1l-1.5 11.7-1.6 11.6-1.5 11.6-1.6 11.6q-2.9-1.1-5.8-2.5-2.8-1.4-5.5-3.1-2.8-1.6-5.3-3.5-2.6-1.8-5-3.9l-1.6-1.4-1.6-1.4q-.7-.8-1.5-1.5-.7-.8-1.5-1.5c-2.2 8.9-4.9 17.1-8 24.6-3.1 7.6-6.6 14.4-10.5 20.6s-8 11.7-12.5 16.7q-1.7 1.8-3.4 3.5t-3.5 3.4l-3.6 3.2-3.8 3q-1.9 1.4-3.8 2.7t-3.8 2.5q-2 1.3-4 2.4t-4.1 2.1q-2 1.1-4.1 2t-4.2 1.7q-2.1.9-4.2 1.6t-4.3 1.4c-5.7 1.7-11.6 3-17.5 3.8q-2.2.3-4.5.5-2.2.3-4.5.4-2.2.2-4.5.2-2.2.1-4.5.1-6.1 0-11.5-.7-5.5-.7-10.2-2-1.2-.3-2.3-.6l-2.2-.8q-1.2-.4-2.3-.8-1-.4-2.1-.9l-2-1q-1-.5-1.9-1-1-.5-1.9-1.1l-1.8-1.2q-.9-.6-1.7-1.2t-1.6-1.3q-.8-.6-1.6-1.3t-1.5-1.4-1.4-1.5q-.7-.7-1.3-1.5-.6-.7-1.3-1.5-.6-.8-1.1-1.6-.6-.9-1.1-1.7-.6-.8-1.1-1.7-.4-.9-.9-1.8-.5-.8-.9-1.7-.4-1-.8-1.9t-.7-1.9q-.4-.9-.7-1.9-.3-.9-.5-1.9c-3.2 4.7-6.5 8.8-10 12.3q-1.3 1.3-2.6 2.5t-2.6 2.3q-1.3 1.2-2.7 2.2-1.4 1.1-2.9 2.1-1.3 1-2.6 1.8-1.3.9-2.7 1.7t-2.8 1.5q-1.4.8-2.8 1.5-1.2.6-2.5 1.1-1.3.6-2.6 1.1l-2.6 1q-1.3.5-2.6.9-1.2.4-2.3.7-1.2.4-2.3.7-1.2.3-2.3.5-1.2.3-2.3.5-.9.2-1.9.4-.9.2-1.8.3t-1.9.3l-1.8.2c-2.1.2-3.8.3-4.9.3h-1.8q-8.1 0-15.1-1.5-6.9-1.5-12.7-4.5-1.4-.7-2.7-1.5-1.4-.8-2.7-1.7t-2.5-1.9l-2.4-2q-4.5-4.2-7.9-9.7-3.4-5.4-5.6-11.8-2.2-6.5-3.2-13.9-1-7.5-.9-15.7.1-8.3 1.3-17.3l1.3-8.2 1.4-8.2 1.3-8.2 1.3-8.2 1.3-8.2 1.3-8.2 1.3-8.2 1.3-8.2q.1-2.2-.3-3.9-.3-1.6-1-2.8-.2-.3-.4-.5-.2-.3-.4-.5-.2-.3-.4-.5t-.5-.4q-.2-.2-.5-.4-.2-.1-.5-.3-.3-.1-.6-.3-.2-.1-.5-.2l-.6-.2q-.3-.1-.6-.1l-.6-.2q-.2 0-.5-.1h-.6q-.3 0-.6-.1H114l-2.2.2q-1 .2-1.7.4-1.6.5-3.1.9-.8.3-1.5.5-.7.3-1.4.5l-1.4.6q-.7.2-1.4.5l-2.8 1.2q-1.3.7-2.7 1.4c-1 .5-20.5-38.3-20.5-38.3" fill="#00C7BB"/>
        </svg>
      )
    }

    const curated = AVAILABLE_ICONS.find(i => i.id === iconId)
    const slug = curated ? curated.slug : iconId.toLowerCase().trim().replace(/\s+/g, "-")
    
    const src = `https://cdn.simpleicons.org/${slug}`

    return (
      <Image 
        key={src}
        src={src} 
        alt={iconId}
        width={32}
        height={32}
        unoptimized
        className={className}
      />
    )
  }

  return (
    <div className="animate-in fade-in duration-300 relative">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-light tracking-tight text-white sm:text-4xl">Social Links</h2>
          <p className="mt-2 text-sm text-slate-500">Kéo thả để sắp xếp. Biểu tượng tự động lấy theo tên thương hiệu.</p>
        </div>
        
        <div className="flex gap-2">
          {hasChanges && (
            <Button onClick={saveSorting} disabled={isSubmitting} className="bg-emerald-600 text-white hover:bg-emerald-700">
              <Save className="mr-2 size-4" /> Lưu Thứ Tự
            </Button>
          )}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpen()} className="bg-sky-600 text-white hover:bg-sky-700 rounded-xl shadow-lg shadow-sky-900/20">
                <Plus className="mr-2 size-4" /> Thêm Liên Kết
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl bg-slate-900 border-slate-800 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">{editingId ? "Chỉnh Sửa" : "Thêm Liên Kết Mới"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveItem} className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="label" className="text-slate-300">Tên Kênh (Ví dụ: Official Facebook)</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="e.g. Official X (Twitter)"
                    required
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label className="text-slate-300">Chọn Biểu Tượng</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {AVAILABLE_ICONS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, note: item.id })}
                        className={`flex flex-col items-center justify-center rounded-xl border p-2 transition-all hover:bg-slate-800 ${
                          formData.note === item.id ? "border-sky-500 bg-sky-950/20 ring-1 ring-sky-500 shadow-sm" : "border-slate-800 bg-white"
                        }`}
                      >
                        <div className="flex size-6 items-center justify-center">
                          {renderIcon(item.id, "size-5")}
                        </div>
                        <span className="mt-1 text-[9px] text-slate-500 font-medium">{item.id}</span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-2 flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex-1">
                      <Label htmlFor="custom-icon" className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Tìm Kiếm Icon Khác</Label>
                      <Input
                        id="custom-icon"
                        placeholder="Ví dụ: Threads, Discord..."
                        value={!AVAILABLE_ICONS.find(i => i.id === formData.note) ? formData.note || "" : ""}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        className="h-8 text-xs border-none bg-transparent p-0 focus-visible:ring-0 shadow-none text-white"
                      />
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-lg border border-slate-800 bg-white shadow-sm">
                      {renderIcon(formData.note, "size-6")}
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="url" className="text-slate-300">Địa chỉ URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                    required
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <Button type="submit" disabled={isSubmitting} className="mt-2 w-full bg-sky-600 hover:bg-sky-700 text-white rounded-xl h-12">
                  {isSubmitting ? "Đang xử lý..." : "Lưu Liên Kết"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="overflow-hidden border-slate-800 shadow-xl bg-slate-950/40 backdrop-blur-sm">
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
                <TableHead className="w-16 text-center text-slate-400">Icon</TableHead>
                <TableHead className="text-slate-400">Tên Kênh</TableHead>
                <TableHead className="text-slate-400">Địa chỉ URL</TableHead>
                <TableHead className="w-24 text-right text-slate-400">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext 
                items={links.map(l => l.id)}
                strategy={verticalListSortingStrategy}
              >
                {links.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                      Chưa có liên kết nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  links.map((link) => (
                    <SortableRow 
                      key={link.id} 
                      link={link} 
                      onEdit={handleOpen} 
                      onDelete={setDeleteId}
                      renderIcon={renderIcon}
                    />
                  ))
                )}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl border border-slate-800 bg-slate-900 p-8 max-w-[400px]">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="size-20 bg-red-950/30 text-red-500 rounded-full flex items-center justify-center border border-red-900/50">
              <Trash2 className="size-10" />
            </div>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold text-white">Xác nhận xóa?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400 leading-relaxed">
                Hành động này không thể hoàn tác. Liên kết này sẽ bị gỡ bỏ vĩnh viễn khỏi hệ thống.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="w-full flex flex-row gap-3 mt-6">
              <AlertDialogCancel className="flex-1 h-12 rounded-2xl border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white font-semibold m-0 transition-colors">
                Hủy bỏ
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => deleteId && handleDelete(deleteId)}
                className="flex-1 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg shadow-red-900/20 m-0"
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
