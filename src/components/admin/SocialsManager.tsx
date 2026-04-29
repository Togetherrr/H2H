"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Plus, Trash2, Edit, Youtube, Instagram, Twitter, Facebook, Disc, Music, Link as LinkIcon } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { upsertSocialLink, deleteSocialLink } from "@/app/admin/actions"

type SocialLink = {
  id: string
  platform: string
  label: string
  url: string
  note?: string
  sort_order: number
  is_active: boolean
}

const TikTokIcon = (props: any) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
)

const AVAILABLE_ICONS = [
  { id: "Youtube", slug: "youtube" },
  { id: "Instagram", slug: "instagram" },
  { id: "Twitter", slug: "x" },
  { id: "Facebook", slug: "facebook" },
  { id: "Tiktok", slug: "tiktok" },
  { id: "Spotify", slug: "spotify" },
  { id: "Music", slug: "applemusic" },
  { id: "Link", slug: "linktree" },
]

export function SocialsManager({ initialLinks }: { initialLinks: SocialLink[] }) {
  const router = useRouter()
  const [links, setLinks] = useState<SocialLink[]>(initialLinks)
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<Partial<SocialLink>>({
    platform: "",
    label: "",
    url: "",
    note: "Link",
    sort_order: 0,
    is_active: true,
  })

  // We'll treat 'note' as the icon identifier. 
  // If it's one of our AVAILABLE_ICONS, we use the component.
  // Otherwise, we'll try to fetch it as a Simple Icon slug.

  const handleOpen = (link?: SocialLink) => {
    if (link) {
      setEditingId(link.id)
      setFormData(link)
    } else {
      setEditingId(null)
      setFormData({
        platform: "",
        label: "",
        url: "",
        note: "Link",
        sort_order: links.length,
        is_active: true,
      })
    }
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const result = await upsertSocialLink(editingId ? { ...formData, id: editingId } : formData)
      if (result?.error) {
        alert(`Error: ${result.error}`)
      } else {
        router.refresh()
        setIsOpen(false)
      }
    } catch (err) {
      alert("Failed to save social link")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return
    try {
      const result = await deleteSocialLink(id)
      if (result?.error) {
        alert(`Error: ${result.error}`)
      } else {
        setLinks(links.filter(l => l.id !== id))
      }
    } catch (err) {
      alert("Failed to delete")
    }
  }

  const renderIcon = (iconId: string | null | undefined, className: string = "size-4") => {
    if (!iconId) return <LinkIcon className={className} />
    
    // Check if it's one of our curated IDs, get its slug
    const curated = AVAILABLE_ICONS.find(i => i.id === iconId)
    const slug = curated ? curated.slug : iconId.toLowerCase().replace(/\s+/g, "-")
    
    // We use the Simple Icons CDN without 'currentColor' to get the original brand color
    return (
      <div className={`relative ${className}`}>
        <Image 
          src={`https://cdn.simpleicons.org/${slug}`} 
          alt={iconId}
          fill
          className="object-contain"
          unoptimized // Simple Icons CDN handles optimization or we don't want Next.js to process these small SVG icons too much if it fails
          onError={(e) => {
            // If brand not found, show a generic link icon
            (e.target as HTMLImageElement).style.display = "none"
          }}
        />
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-light tracking-tight text-slate-950 sm:text-4xl">Social Links</h2>
          <p className="mt-2 text-sm text-slate-500">Manage official channels and external links.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpen()} className="bg-slate-900 text-white hover:bg-slate-800">
              <Plus className="mr-2 size-4" /> Add Link
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Social Link" : "Add Social Link"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="platform">Platform Name</Label>
                <Input
                  id="platform"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  placeholder="e.g. YouTube, Weverse, FanCafe..."
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Choose Icon</Label>
                <div className="grid grid-cols-4 gap-2">
                  {AVAILABLE_ICONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, note: item.id })}
                      className={`flex flex-col items-center justify-center rounded-lg border p-2 transition-all hover:bg-slate-50 ${
                        formData.note === item.id ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900" : "border-slate-200"
                      }`}
                    >
                      <div className="flex size-6 items-center justify-center">
                        {renderIcon(item.id, "size-5")}
                      </div>
                      <span className="mt-1 text-[9px] text-slate-500">{item.id}</span>
                    </button>
                  ))}
                </div>
                
                <div className="mt-2">
                  <Label htmlFor="custom-icon" className="text-[11px] text-slate-500">Or search brand (e.g. Threads, Discord...)</Label>
                  <div className="mt-1 flex gap-2">
                    <Input
                      id="custom-icon"
                      placeholder="Enter brand name..."
                      value={!AVAILABLE_ICONS.find(i => i.id === formData.note) ? formData.note || "" : ""}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      className="h-8 text-xs"
                    />
                    <div className="flex size-8 items-center justify-center rounded border border-slate-200 bg-slate-50">
                      {renderIcon(formData.note, "size-5")}
                    </div>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400 italic">Powered by Simple Icons (Brand Colors)</p>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="label">Display Label</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g. Official YouTube"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="order">Sort Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="mt-4 w-full">
                {isSubmitting ? "Saving..." : "Save Link"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-16 text-center">Icon</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="w-24 text-center">Order</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                  No social links configured.
                </TableCell>
              </TableRow>
            ) : (
              [...links].sort((a,b) => a.sort_order - b.sort_order).map((link) => {
                return (
                  <TableRow key={link.id} className="group transition-colors hover:bg-slate-50/50">
                    <TableCell className="text-center">
                      <div className="mx-auto flex size-8 items-center justify-center rounded-full bg-slate-100/50 p-1.5">
                        {renderIcon(link.note, "size-full object-contain")}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">{link.label}</TableCell>
                    <TableCell className="text-slate-500 truncate max-w-[200px]">
                      <a href={link.url} target="_blank" rel="noreferrer" className="hover:underline">
                        {link.url}
                      </a>
                    </TableCell>
                    <TableCell className="text-center">{link.sort_order}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpen(link)}>
                          <Edit className="size-4 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(link.id)}>
                          <Trash2 className="size-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
