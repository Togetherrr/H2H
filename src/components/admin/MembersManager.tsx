"use client"

import { useState } from "react"
import { Plus, Trash2, Edit } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { upsertMember, deleteMember } from "@/app/admin/actions"

type Member = {
  id: string
  slug: string
  stage_name: string
  full_name: string | null
  position: string | null
  intro: string | null
  profile_image_url: string | null
  sort_order: number
  is_active: boolean
}

export function MembersManager({ initialMembers }: { initialMembers: Member[] }) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<Partial<Member>>({
    slug: "",
    stage_name: "",
    full_name: "",
    position: "",
    intro: "",
    profile_image_url: "",
    sort_order: 0,
    is_active: true,
  })

  const handleOpen = (member?: Member) => {
    if (member) {
      setEditingId(member.id)
      setFormData(member)
    } else {
      setEditingId(null)
      setFormData({
        slug: "",
        stage_name: "",
        full_name: "",
        position: "",
        intro: "",
        profile_image_url: "",
        sort_order: members.length,
        is_active: true,
      })
    }
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const result = await upsertMember(editingId ? { ...formData, id: editingId } : formData)
      if (result?.error) {
        alert(`Error: ${result.error}`)
      } else {
        window.location.reload()
      }
    } catch (err) {
      alert("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this member?")) return
    try {
      const result = await deleteMember(id)
      if (result?.error) {
        alert(`Error: ${result.error}`)
      } else {
        setMembers(members.filter(m => m.id !== id))
      }
    } catch (err) {
      alert("Failed to delete")
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-light tracking-tight text-slate-950 sm:text-4xl">Group Members</h2>
          <p className="mt-2 text-sm text-slate-500">Manage member profiles, intros, and ordering.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpen()} className="bg-slate-900 text-white hover:bg-slate-800">
              <Plus className="mr-2 size-4" /> Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Member" : "Add Member"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="stage_name">Stage Name</Label>
                  <Input
                    id="stage_name"
                    value={formData.stage_name}
                    onChange={(e) => setFormData({ ...formData, stage_name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name || ""}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={formData.position || ""}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="intro">Introduction</Label>
                <Textarea
                  id="intro"
                  value={formData.intro || ""}
                  onChange={(e) => setFormData({ ...formData, intro: e.target.value })}
                  className="h-24"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="profile_image_url">Image URL</Label>
                <Input
                  id="profile_image_url"
                  value={formData.profile_image_url || ""}
                  onChange={(e) => setFormData({ ...formData, profile_image_url: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="mt-4 w-full">
                {isSubmitting ? "Saving..." : "Save Member"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Stage Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead className="w-24 text-center">Order</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  No members found.
                </TableCell>
              </TableRow>
            ) : (
              [...members].sort((a,b) => a.sort_order - b.sort_order).map((member) => (
                <TableRow key={member.id} className="group transition-colors hover:bg-slate-50/50">
                  <TableCell>
                    {member.profile_image_url ? (
                      <img src={member.profile_image_url} alt={member.stage_name} className="size-10 rounded-full object-cover border border-slate-200" />
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 text-xs">
                        {member.stage_name[0]}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-slate-900">{member.stage_name}</p>
                    <p className="text-xs text-slate-500">{member.full_name}</p>
                  </TableCell>
                  <TableCell className="text-slate-600">{member.position}</TableCell>
                  <TableCell className="text-center">{member.sort_order}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpen(member)}>
                        <Edit className="size-4 text-slate-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id)}>
                        <Trash2 className="size-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
