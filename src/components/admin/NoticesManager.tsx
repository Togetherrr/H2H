"use client"

import { useMemo, useState } from "react"
import { CalendarDays, Edit3, GripVertical, Pin, Plus, Save, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createNotice, deleteNotice, updateNotice, updateNoticesOrder, type NoticeInput } from "@/app/admin/actions"
import type { NoticeRow, NoticeType } from "@/lib/notices"
import { cn } from "@/lib/utils"

const NOTICE_TYPES: NoticeType[] = ["comeback", "company", "event", "general"]

function sortNotices(items: NoticeRow[]) {
  return [...items].sort((a, b) => {
    const aRank = a.is_active && a.is_pinned ? 0 : a.is_active ? 1 : 2
    const bRank = b.is_active && b.is_pinned ? 0 : b.is_active ? 1 : 2
    return aRank - bRank || a.sort_order - b.sort_order || b.published_at.localeCompare(a.published_at)
  })
}

function groupNotices(items: NoticeRow[]) {
  return [
    ...items.filter((notice) => notice.is_active && notice.is_pinned),
    ...items.filter((notice) => notice.is_active && !notice.is_pinned),
    ...items.filter((notice) => !notice.is_active),
  ]
}

function canReorderNotice(notice: NoticeRow) {
  return notice.is_active && !notice.is_pinned
}

function emptyForm(sortOrder: number): NoticeInput {
  return {
    type: "general",
    title_en: "",
    content_en: "",
    link: "",
    link_text_en: "",
    published_at: new Date().toISOString().slice(0, 10),
    is_pinned: false,
    is_active: false,
    sort_order: sortOrder,
  }
}

function formFromNotice(notice: NoticeRow): NoticeInput {
  return {
    type: notice.type as NoticeType,
    title_en: notice.title_en,
    content_en: notice.content_en,
    link: notice.link ?? "",
    link_text_en: notice.link_text_en ?? "",
    published_at: notice.published_at,
    is_pinned: notice.is_pinned,
    is_active: notice.is_active,
    sort_order: notice.sort_order,
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(`${date}T00:00:00`))
}

function parseIsoDate(date: string) {
  const [year, month, day] = date.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function SortableNoticeRow({
  notice,
  onEdit,
  onDelete,
}: {
  notice: NoticeRow
  onEdit: (notice: NoticeRow) => void
  onDelete: (notice: NoticeRow) => void
}) {
  const isSortable = canReorderNotice(notice)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: notice.id, disabled: !isSortable })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
    opacity: isDragging ? 0.65 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex gap-3 px-4 py-5 transition-colors hover:bg-slate-800/30 sm:gap-4 sm:px-6",
        isDragging && "bg-slate-800/80 shadow-xl"
      )}
    >
      <div className="flex shrink-0 items-start pt-1">
        <button
          type="button"
          {...attributes}
          {...listeners}
          disabled={!isSortable}
          aria-label={isSortable ? `Reorder ${notice.title_en}` : `${notice.title_en} position is locked`}
          title={notice.is_pinned ? "Featured notice is always first." : notice.is_active ? "Drag to reorder." : "Only active notices can be reordered."}
          className={cn(
            "rounded-md p-2 transition-colors",
            isSortable
              ? "cursor-grab text-slate-500 hover:bg-slate-800 hover:text-slate-200 active:cursor-grabbing"
              : "cursor-not-allowed text-slate-700"
          )}
        >
          <GripVertical className="size-4" />
        </button>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em]",
            notice.is_active ? "border-emerald-900 bg-emerald-950 text-emerald-300" : "border-slate-700 bg-slate-950 text-slate-400"
          )}>
            {notice.is_active ? "Active" : "Off"}
          </span>
          {notice.is_pinned && (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-900 bg-rose-950 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-rose-300">
              <Pin className="size-3 fill-current" />
              Featured
            </span>
          )}
          <span className="text-xs uppercase tracking-wider text-slate-500">{notice.type}</span>
          <span className="text-xs text-slate-500">{formatDate(notice.published_at)}</span>
        </div>
        <p className="text-sm font-medium text-slate-100">{notice.title_en}</p>
        <p className="mt-1 line-clamp-2 max-w-4xl text-sm leading-6 text-slate-500">{notice.content_en}</p>
      </div>
      <div className="flex shrink-0 items-start gap-1">
        <Button variant="ghost" size="icon" onClick={() => onEdit(notice)} className="size-9 text-slate-400 hover:text-sky-400">
          <Edit3 className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(notice)} className="size-9 text-slate-400 hover:text-rose-400">
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  )
}

export function NoticesManager({ initialNotices }: { initialNotices: NoticeRow[] }) {
  const [notices, setNotices] = useState(() => sortNotices(initialNotices))
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<NoticeInput>(() => emptyForm(initialNotices.length))
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<NoticeRow | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [hasOrderChanges, setHasOrderChanges] = useState(false)
  const [savingOrder, setSavingOrder] = useState(false)

  const activeCount = useMemo(() => notices.filter((notice) => notice.is_active).length, [notices])
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const startNew = () => {
    setEditingId(null)
    setForm(emptyForm(notices.length))
    setIsCalendarOpen(false)
    setIsEditorOpen(true)
  }

  const startEdit = (notice: NoticeRow) => {
    setEditingId(notice.id)
    setForm(formFromNotice(notice))
    setIsCalendarOpen(false)
    setIsEditorOpen(true)
  }

  const setActive = (isActive: boolean) => {
    setForm((current) => ({
      ...current,
      is_active: isActive,
      is_pinned: isActive ? current.is_pinned : false,
    }))
  }

  const setPinned = (isPinned: boolean) => {
    setForm((current) => ({
      ...current,
      is_pinned: isPinned,
      is_active: isPinned ? true : current.is_active,
    }))
  }

  const save = async (event: React.FormEvent) => {
    event.preventDefault()

    setSaving(true)
    const result = editingId ? await updateNotice(editingId, form) : await createNotice(form)
    setSaving(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    const saved = result.data as NoticeRow
    setNotices((current) => {
      const updated = editingId
        ? current.map((notice) => {
            if (notice.id === saved.id) return saved
            return saved.is_pinned ? { ...notice, is_pinned: false } : notice
          })
        : [
            ...current.map((notice) => (saved.is_pinned ? { ...notice, is_pinned: false } : notice)),
            saved,
          ]
      return hasOrderChanges ? groupNotices(updated) : sortNotices(updated)
    })
    toast.success(editingId ? "Notice updated." : "Notice created.")
    setIsEditorOpen(false)
  }

  const remove = async () => {
    if (!deleteTarget) return

    setDeleting(true)
    const result = await deleteNotice(deleteTarget.id)
    setDeleting(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    const remaining = groupNotices(notices.filter((notice) => notice.id !== deleteTarget.id))
    setNotices(remaining)
    if (editingId === deleteTarget.id) {
      setEditingId(null)
      setForm(emptyForm(remaining.length))
    }
    setDeleteTarget(null)
    toast.success("Notice deleted.")
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const previousIndex = notices.findIndex((notice) => notice.id === active.id)
    const nextIndex = notices.findIndex((notice) => notice.id === over.id)
    if (previousIndex === -1 || nextIndex === -1) return
    if (!canReorderNotice(notices[previousIndex]) || !canReorderNotice(notices[nextIndex])) return

    setNotices(arrayMove(notices, previousIndex, nextIndex))
    setHasOrderChanges(true)
  }

  const saveOrder = async () => {
    setSavingOrder(true)
    const ordered = notices
      .filter(canReorderNotice)
      .map((notice) => ({ id: notice.id }))
    const result = await updateNoticesOrder(ordered)
    setSavingOrder(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    setNotices((current) => groupNotices(current).map((notice, index) => (
      canReorderNotice(notice) ? { ...notice, sort_order: index } : notice
    )))
    setHasOrderChanges(false)
    toast.success("Display order saved.")
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-light tracking-tight text-white sm:text-4xl">Notices</h2>
          <p className="mt-2 text-sm text-slate-500">Manage announcements displayed in the home page Pin Board.</p>
        </div>
        <div className="flex gap-2">
          {hasOrderChanges && (
            <Button onClick={saveOrder} disabled={savingOrder} className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
              <Save className="mr-2 size-4" />
              {savingOrder ? "Saving..." : "Save Order"}
            </Button>
          )}
          <Button onClick={startNew} className="rounded-xl bg-sky-600 text-white hover:bg-sky-700">
            <Plus className="mr-2 size-4" />
            New Notice
          </Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="border-slate-800 bg-slate-900 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Total</p>
          <p className="mt-3 text-3xl font-bold text-white">{notices.length}</p>
        </Card>
        <Card className="border-slate-800 bg-slate-900 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Active on Home</p>
          <p className="mt-3 text-3xl font-bold text-white">{activeCount}</p>
        </Card>
        <Card className="border-slate-800 bg-slate-900 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Featured</p>
          <p className="mt-3 truncate text-lg font-semibold text-white">
            {notices.find((notice) => notice.is_active && notice.is_pinned)?.title_en || "None selected"}
          </p>
        </Card>
      </div>

      <Card className="overflow-hidden border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 px-6 py-5">
          <h3 className="font-semibold text-white">All notices</h3>
          <p className="mt-1 text-xs text-slate-500">Featured is fixed first. Drag active notices to set their display priority; off notices stay below.</p>
        </div>
        {notices.length === 0 ? (
          <p className="px-5 py-14 text-center text-sm text-slate-500">No notices created yet.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
            <SortableContext items={notices.map((notice) => notice.id)} strategy={verticalListSortingStrategy}>
              <div className="divide-y divide-slate-800">
                {notices.map((notice) => (
                  <SortableNoticeRow
                    key={notice.id}
                    notice={notice}
                    onEdit={startEdit}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </Card>

      <Dialog open={isEditorOpen} onOpenChange={(open) => !saving && setIsEditorOpen(open)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl border-slate-800 bg-slate-900 p-0 text-white shadow-2xl sm:max-w-2xl">
          <DialogHeader className="border-b border-slate-800 px-7 pb-5 pt-7">
            <DialogTitle className="text-2xl font-semibold text-white">{editingId ? "Edit Notice" : "Create Notice"}</DialogTitle>
            <DialogDescription className="text-slate-400">Public copy is shown in English on the home page.</DialogDescription>
          </DialogHeader>
          <form onSubmit={save}>
            <div className="space-y-5 px-7 py-6">
              <div className="grid gap-2">
                <Label htmlFor="notice-title" className="text-slate-300">Title</Label>
                <Input id="notice-title" required maxLength={160} value={form.title_en} onChange={(event) => setForm({ ...form, title_en: event.target.value })} className="border-slate-800 bg-slate-950 text-white" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notice-summary" className="text-slate-300">Summary</Label>
                <Textarea id="notice-summary" required maxLength={1000} rows={4} value={form.content_en} onChange={(event) => setForm({ ...form, content_en: event.target.value })} className="resize-none border-slate-800 bg-slate-950 text-white" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label className="text-slate-300">Category</Label>
                  <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value as NoticeType })}>
                    <SelectTrigger className="h-10 border-slate-800 bg-slate-950 capitalize text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-slate-800 bg-slate-900 text-white">
                      {NOTICE_TYPES.map((type) => <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-slate-300">Publish date</Label>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 justify-start border-slate-800 bg-slate-950 px-3 font-normal text-white hover:bg-slate-800 hover:text-white"
                      >
                        <CalendarDays className="mr-2 size-4 text-slate-400" />
                        {format(parseIsoDate(form.published_at), "MMM d, yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-[18.5rem] rounded-2xl border-slate-800 bg-slate-950 p-3.5 text-white shadow-2xl">
                      <Calendar
                        mode="single"
                        selected={parseIsoDate(form.published_at)}
                        defaultMonth={parseIsoDate(form.published_at)}
                        startMonth={new Date(2000, 0)}
                        endMonth={new Date(new Date().getFullYear() + 10, 11)}
                        onSelect={(date) => {
                          if (!date) return
                          setForm({ ...form, published_at: toIsoDate(date) })
                          setIsCalendarOpen(false)
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="notice-link" className="text-slate-300">External link <span className="text-slate-500">(optional)</span></Label>
                  <Input id="notice-link" type="url" placeholder="https://..." value={form.link || ""} onChange={(event) => setForm({ ...form, link: event.target.value })} className="border-slate-800 bg-slate-950 text-white" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notice-link-text" className="text-slate-300">Link label <span className="text-slate-500">(optional)</span></Label>
                  <Input id="notice-link-text" placeholder="Read more" disabled={!form.link} value={form.link_text_en || ""} onChange={(event) => setForm({ ...form, link_text_en: event.target.value })} className="border-slate-800 bg-slate-950 text-white disabled:opacity-45" />
                </div>
              </div>
              <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-5 sm:grid-cols-2">
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" checked={form.is_active} onChange={(event) => setActive(event.target.checked)} className="mt-1 size-4 accent-sky-500" />
                  <span>
                    <span className="block text-sm font-medium text-white">Active on home page</span>
                    <span className="block text-xs leading-5 text-slate-500">Shown on the home page Pin Board.</span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" checked={form.is_pinned} onChange={(event) => setPinned(event.target.checked)} className="mt-1 size-4 accent-rose-500" />
                  <span>
                    <span className="block text-sm font-medium text-white">Pin as featured</span>
                    <span className="block text-xs leading-5 text-slate-500">Replaces the previous pin.</span>
                  </span>
                </label>
              </div>
            </div>
            <DialogFooter className="gap-3 border-t border-slate-800 px-7 py-5 sm:space-x-0">
              <Button type="button" variant="outline" disabled={saving} onClick={() => setIsEditorOpen(false)} className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white">
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-sky-600 text-white hover:bg-sky-700">
                {saving ? "Saving..." : editingId ? "Save Changes" : "Create Notice"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-3xl border-slate-800 bg-slate-900 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this notice?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action permanently deletes <span className="font-medium text-slate-200">{deleteTarget?.title_en}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault()
                void remove()
              }}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
