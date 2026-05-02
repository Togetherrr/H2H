"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  Search, 
  Filter, 
  Grid2X2, 
  List, 
  Trash2, 
  Check, 
  Upload, 
  Loader2, 
  Image as ImageIcon,
  FolderOpen,
  FolderPlus,
  Pencil,
  X,
  Copy,
  ChevronRight
} from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { 
  uploadMediaAction, 
  getMediaAssetsAction, 
  deleteMediaAssetAction,
  updateMediaAssetAction,
  getMediaCategoriesAction,
  renameMediaCategoryAction,
  deleteMediaCategoryAction
} from "@/app/admin/media-actions"
import { cn } from "@/lib/utils"

interface MediaManagerProps {
  onSelect?: (url: string) => void
  defaultCategory?: string
  trigger?: React.ReactNode
}

const DEFAULT_CATEGORIES = ["Members", "Uncategorized"]

export function MediaManager({ onSelect, defaultCategory = "All", trigger }: MediaManagerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <ImageIcon className="size-4" /> Thư viện Media
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 overflow-hidden rounded-3xl border-slate-800 bg-slate-900 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Thư viện Media</DialogTitle>
        </DialogHeader>
        <MediaLibrary 
          onSelect={(url) => {
            if (onSelect) onSelect(url)
            setIsOpen(false)
          }} 
          defaultCategory={defaultCategory} 
          isDialog 
          onClose={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

interface MediaLibraryProps {
  onSelect?: (url: string) => void
  defaultCategory?: string
  isDialog?: boolean
  onClose?: () => void
}

export function MediaLibrary({ onSelect, defaultCategory = "Members", isDialog, onClose }: MediaLibraryProps) {
  const [assets, setAssets] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory)
  const [uploadCategory, setUploadCategory] = useState(defaultCategory)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  
  const [editAsset, setEditAsset] = useState<any | null>(null)
  const [editData, setEditData] = useState({ name: "", category: "" })
  const [isUpdating, setIsUpdating] = useState(false)

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Session-based folder tracking (for empty folders)
  const [sessionFolders, setSessionFolders] = useState<string[]>([])

  // Folder Dialogs
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [showRenameFolderDialog, setShowRenameFolderDialog] = useState(false)
  const [renameFolderName, setRenameFolderName] = useState("")
  const [showDeleteFolderDialog, setShowDeleteFolderDialog] = useState(false)

  const fetchAssets = useCallback(async () => {
    setLoading(true)
    const result = await getMediaAssetsAction(selectedCategory)
    if (result.error) {
      toast.error(result.error)
    } else {
      setAssets(result.data || [])
    }
    setLoading(false)
  }, [selectedCategory])

  const fetchCategories = useCallback(async () => {
    const result = await getMediaCategoriesAction()
    if (!result.error && result.data) {
      const dbCats = result.data as string[]
      const combined = Array.from(new Set([...DEFAULT_CATEGORIES, ...dbCats, ...sessionFolders]))
      setCategories(combined)
    }
  }, [sessionFolders])

  useEffect(() => {
    fetchAssets()
    fetchCategories()
  }, [fetchAssets, fetchCategories])

  // Sync upload category with active tab
  useEffect(() => {
    if (selectedCategory !== "All") {
      setUploadCategory(selectedCategory)
    }
  }, [selectedCategory])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("image", file)
    formData.append("category", uploadCategory)
    formData.append("name", file.name)

    const result = await uploadMediaAction(formData)
    setUploading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Upload thành công!")
      fetchAssets()
      fetchCategories()
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    const result = await deleteMediaAssetAction(deleteId)
    setIsDeleting(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      setAssets(assets.filter(a => a.id !== deleteId))
      setDeleteId(null)
      toast.success("Đã xóa khỏi thư viện")
    }
  }

  const handleEditClick = (asset: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditAsset(asset)
    setEditData({ name: asset.name, category: asset.category })
  }

  const handleUpdateAsset = async () => {
    if (!editAsset) return
    setIsUpdating(true)
    const result = await updateMediaAssetAction(editAsset.id, editData)
    setIsUpdating(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Đã cập nhật thông tin!")
      setEditAsset(null)
      fetchAssets()
      fetchCategories()
    }
  }

  const handleAddFolder = () => {
    if (newFolderName && newFolderName.trim()) {
      const folderName = newFolderName.trim()
      if (!sessionFolders.includes(folderName)) {
        setSessionFolders([...sessionFolders, folderName])
      }
      setSelectedCategory(folderName)
      setNewFolderName("")
      setShowNewFolderDialog(false)
      toast.success(`Đã tạo thư mục ${folderName}`)
    }
  }

  const handleRenameFolder = async () => {
    if (renameFolderName && renameFolderName.trim() && renameFolderName !== selectedCategory) {
      const result = await renameMediaCategoryAction(selectedCategory, renameFolderName.trim())
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Đã đổi tên thư mục!")
        // Update session folders: remove old, add new
        setSessionFolders(prev => [...prev.filter(f => f !== selectedCategory), renameFolderName.trim()])
        setSelectedCategory(renameFolderName.trim())
        setShowRenameFolderDialog(false)
        fetchCategories()
      }
    }
  }

  const handleDeleteFolder = async () => {
    setIsDeleting(true)
    const result = await deleteMediaCategoryAction(selectedCategory, "move_to_uncategorized")
    setIsDeleting(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Đã xóa thư mục!")
      // Remove from session folders if it was there
      setSessionFolders(prev => prev.filter(f => f !== selectedCategory))
      setSelectedCategory("Members")
      setShowDeleteFolderDialog(false)
      fetchCategories()
    }
  }

  const filteredAssets = assets.filter((asset: any) => 
    asset.name.toLowerCase().includes(search.toLowerCase()) ||
    asset.url.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={cn("flex flex-col h-full", !isDialog ? "bg-slate-950/20 backdrop-blur-md rounded-[2rem] border border-slate-800 overflow-hidden" : "bg-slate-900")}>
      <div className="px-8 py-6 border-b border-slate-800 bg-slate-900/50 z-10 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-white">
              <div className="p-2 bg-sky-600 rounded-xl shadow-lg shadow-sky-900/20">
                <FolderOpen className="size-6 text-white" />
              </div>
              Thư viện Media
            </h2>
            <div className="flex items-center gap-2 mt-2 text-slate-500 text-sm font-medium">
              <span>Root</span>
              <ChevronRight className="size-4" />
              <span className="text-sky-500">{selectedCategory}</span>
              {selectedCategory !== "Uncategorized" && selectedCategory !== "Members" && (
                <div className="flex items-center gap-1 ml-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="size-6 rounded-md hover:bg-slate-800 text-slate-500 hover:text-sky-500"
                    onClick={() => {
                      setRenameFolderName(selectedCategory)
                      setShowRenameFolderDialog(true)
                    }}
                  >
                    <Pencil className="size-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="size-6 rounded-md hover:bg-slate-800 text-slate-500 hover:text-red-500"
                    onClick={() => setShowDeleteFolderDialog(true)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowNewFolderDialog(true)} 
              className="rounded-xl border-slate-700 bg-slate-800 h-11 px-4 hover:bg-slate-700 text-slate-200"
            >
              <FolderPlus className="size-4 mr-2 text-sky-500" /> Thư mục mới
            </Button>
            <Input
              type="file"
              accept="image/*"
              className="hidden"
              id="media-upload-library"
              onChange={handleUpload}
            />
            <Button 
              onClick={() => document.getElementById('media-upload-library')?.click()} 
              disabled={uploading}
              className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl h-11 px-6 shadow-xl shadow-sky-900/20 font-bold"
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4 mr-2" />}
              Tải ảnh
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-slate-950/20 backdrop-blur-sm">
        <div className="px-8 py-4 border-b border-slate-800/50 bg-slate-900/40 flex items-center gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500 group-focus-within:text-sky-500 transition-colors" />
            <Input 
              placeholder="Tìm kiếm file..." 
              className="pl-12 h-12 border-slate-800 focus:border-sky-500 focus:ring-0 rounded-2xl bg-slate-900/80 text-white placeholder:text-slate-600 transition-all shadow-inner"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex p-1 rounded-2xl shrink-0 bg-slate-900/80 border border-slate-800/50 shadow-inner">
            <Button 
              variant={viewMode === "grid" ? "secondary" : "ghost"} 
              size="icon" 
              className={cn("size-10 rounded-xl transition-all", viewMode === "grid" ? "bg-slate-800 text-white shadow-md" : "text-slate-500 hover:text-slate-200")} 
              onClick={() => setViewMode("grid")}
            >
              <Grid2X2 className="size-5" />
            </Button>
            <Button 
              variant={viewMode === "list" ? "secondary" : "ghost"} 
              size="icon" 
              className={cn("size-10 rounded-xl transition-all", viewMode === "list" ? "bg-slate-800 text-white shadow-md" : "text-slate-500 hover:text-slate-200")} 
              onClick={() => setViewMode("list")}
            >
              <List className="size-5" />
            </Button>
          </div>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col min-h-0">
          <div className="px-8 py-3 border-b border-slate-800/30 bg-slate-900/60 overflow-x-auto no-scrollbar">
            <TabsList className="bg-transparent h-auto p-0 gap-3">
              {categories.map((category: string) => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className={cn(
                    "px-6 py-2.5 rounded-2xl text-sm font-bold transition-all border border-slate-800/50",
                    selectedCategory === category 
                      ? "bg-sky-600 text-white border-transparent shadow-lg shadow-sky-900/20 scale-105"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  )}
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {loading ? (
              <div className="h-full flex items-center justify-center flex-col gap-4 text-slate-400">
                <div className="relative size-16">
                  <Loader2 className="size-full animate-spin text-sky-500" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="size-6 text-sky-500/50" />
                  </div>
                </div>
                <p className="text-sm font-bold tracking-wide uppercase opacity-50">Đang đồng bộ thư viện...</p>
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="h-full flex items-center justify-center flex-col gap-6 text-slate-400 text-center max-w-sm mx-auto">
                <div className="size-24 rounded-3xl flex items-center justify-center bg-slate-900 border border-slate-800 shadow-2xl relative">
                  <ImageIcon className="size-10 text-slate-700" />
                  <div className="absolute -right-2 -bottom-2 bg-slate-800 p-2 rounded-xl border border-slate-700 text-slate-600">
                    <Search className="size-4" />
                  </div>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-200">Không tìm thấy gì</p>
                  <p className="text-sm text-slate-500 mt-2">Thư mục <span className="text-sky-500">&quot;{selectedCategory}&quot;</span> hiện không có file nào hoặc không phù hợp với tìm kiếm của bạn.</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('media-upload-library')?.click()} 
                  className="rounded-xl border-slate-800 hover:bg-slate-800 gap-2"
                >
                   <Upload className="size-4" /> Tải ảnh ngay
                </Button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredAssets.map((asset: any) => (
                  <div 
                    key={asset.id} 
                    className="group relative aspect-square rounded-[1.5rem] shadow-xl border border-slate-800 bg-slate-900 overflow-hidden cursor-pointer hover:border-sky-500/50 hover:shadow-sky-900/10 transition-all duration-300"
                    onClick={() => {
                      if (onSelect) {
                        onSelect(asset.url)
                      }
                    }}
                  >
                    <Image 
                      src={asset.url} 
                      alt={asset.name} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                      <p className="text-white text-[10px] font-bold truncate mb-3 mt-auto opacity-80">{asset.name}</p>
                      <div className="flex gap-2">
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="size-9 rounded-xl bg-slate-800/80 backdrop-blur-md hover:bg-sky-600 text-sky-400 hover:text-white border border-slate-700/50 shadow-lg transition-all"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(asset.url)
                            toast.success("Đã copy link!")
                          }}
                        >
                          <Copy className="size-4" />
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="size-9 rounded-xl bg-slate-800/80 backdrop-blur-md hover:bg-sky-600 text-sky-400 hover:text-white border border-slate-700/50 shadow-lg transition-all"
                          onClick={(e) => handleEditClick(asset, e)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="size-9 rounded-xl bg-red-500/10 backdrop-blur-md hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 shadow-lg transition-all"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteId(asset.id)
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAssets.map((asset: any) => (
                  <div 
                    key={asset.id} 
                    className="flex items-center gap-5 p-4 rounded-3xl border border-slate-800 bg-slate-900/40 hover:border-sky-500/30 hover:bg-sky-950/10 transition-all cursor-pointer group"
                    onClick={() => {
                      if (onSelect) {
                        onSelect(asset.url)
                      }
                    }}
                  >
                    <div className="size-16 rounded-[1.25rem] border border-slate-800 overflow-hidden shrink-0 relative shadow-2xl">
                      <Image src={asset.url} alt="" fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-base font-bold truncate text-slate-200">{asset.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{asset.category}</span>
                        <span className="text-[10px] text-slate-500 font-medium tracking-wide">{(asset.size / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pr-2">
                       <Button 
                        variant="ghost" 
                        size="icon" 
                        className="size-10 rounded-xl hover:bg-slate-800 text-sky-500/70 hover:text-sky-500 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigator.clipboard.writeText(asset.url)
                          toast.success("Đã copy link!")
                        }}
                      >
                        <Copy className="size-5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="size-10 rounded-xl hover:bg-slate-800 text-sky-500/70 hover:text-sky-500 transition-colors"
                        onClick={(e) => handleEditClick(asset, e)}
                      >
                        <Pencil className="size-5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="size-10 rounded-xl hover:bg-slate-800 text-red-500/50 hover:text-red-500 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteId(asset.id)
                        }}
                      >
                        <Trash2 className="size-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Tabs>
      </div>
      
      <div className="px-8 py-5 border-t border-slate-800 bg-slate-900 flex justify-between items-center shrink-0">
        <p className="text-xs font-bold text-slate-500 flex items-center gap-3 uppercase tracking-widest opacity-60">
          <ImageIcon className="size-4 text-sky-500" /> {assets.length} file đính kèm
        </p>
        <div className="flex gap-3">
          {isDialog && (
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="rounded-xl border-slate-700 bg-slate-800 h-10 px-8 hover:bg-slate-700 text-slate-200 font-bold"
            >
              Đóng
            </Button>
          )}
        </div>
      </div>

      {/* Edit Asset Dialog */}
      <Dialog open={!!editAsset} onOpenChange={val => !val && setEditAsset(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Chỉnh sửa Media</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="aspect-video relative rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
               {editAsset && <Image src={editAsset.url} alt="" fill className="object-contain bg-slate-950" />}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-slate-400 font-bold px-1">Tên file</Label>
              <Input
                id="name"
                value={editData.name}
                onChange={e => setEditData({ ...editData, name: e.target.value })}
                className="bg-slate-950 border-slate-800 text-white h-12 rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category" className="text-slate-400 font-bold px-1">Thư mục (Category)</Label>
              <Select 
                value={editData.category} 
                onValueChange={val => setEditData({ ...editData, category: val })}
              >
                <SelectTrigger className="h-12 bg-slate-950 border-slate-800 text-white rounded-xl">
                  <SelectValue placeholder="Chọn thư mục" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {categories.map((c: string) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setEditAsset(null)} 
              variant="ghost" 
              className="rounded-xl text-slate-400 hover:text-white"
            >
              Hủy
            </Button>
            <Button 
              onClick={handleUpdateAsset} 
              disabled={isUpdating}
              className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl px-8 font-bold"
            >
              {isUpdating ? <Loader2 className="animate-spin size-4" /> : "Cập nhật"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={val => !val && setDeleteId(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl bg-slate-900 border-slate-800 text-white">
          <DialogHeader className="items-center text-center">
            <div className="size-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
              <Trash2 className="size-8 text-red-500" />
            </div>
            <DialogTitle className="text-xl text-white">Xóa vĩnh viễn?</DialogTitle>
            <p className="text-slate-400 mt-2">
              Bạn có chắc chắn muốn xóa file này khỏi thư viện? <br/>
              <span className="text-xs opacity-50">(Ảnh trên server ImgBB vẫn sẽ được giữ lại)</span>
            </p>
          </DialogHeader>
          <DialogFooter className="mt-6 flex-row gap-3">
            <Button 
              onClick={() => setDeleteId(null)} 
              variant="outline" 
              className="flex-1 rounded-xl border-slate-800 hover:bg-slate-800 text-slate-400"
            >
              Hủy
            </Button>
            <Button 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
            >
              {isDeleting ? <Loader2 className="animate-spin size-4" /> : "Xác nhận xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <div className="size-12 rounded-xl bg-sky-500/10 flex items-center justify-center mb-2">
              <FolderPlus className="size-6 text-sky-500" />
            </div>
            <DialogTitle className="text-xl text-white">Thư mục mới</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-folder-name" className="text-slate-400 font-bold px-1 mb-2 block">Tên thư mục</Label>
            <Input
              id="new-folder-name"
              placeholder="Ví dụ: Sự kiện 2024"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddFolder()}
              className="bg-slate-950 border-slate-800 text-white h-12 rounded-xl focus:ring-sky-500"
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2">
            <Button 
              onClick={() => setShowNewFolderDialog(false)} 
              variant="ghost" 
              className="rounded-xl text-slate-400 hover:text-white"
            >
              Hủy
            </Button>
            <Button 
              onClick={handleAddFolder} 
              disabled={!newFolderName.trim()}
              className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl px-6 font-bold"
            >
              Tạo thư mục
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Folder Dialog */}
      <Dialog open={showRenameFolderDialog} onOpenChange={setShowRenameFolderDialog}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <div className="size-12 rounded-xl bg-sky-500/10 flex items-center justify-center mb-2">
              <Pencil className="size-6 text-sky-500" />
            </div>
            <DialogTitle className="text-xl text-white">Đổi tên thư mục</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rename-folder-name" className="text-slate-400 font-bold px-1 mb-2 block">Tên mới</Label>
            <Input
              id="rename-folder-name"
              value={renameFolderName}
              onChange={e => setRenameFolderName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRenameFolder()}
              className="bg-slate-950 border-slate-800 text-white h-12 rounded-xl focus:ring-sky-500"
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2">
            <Button 
              onClick={() => setShowRenameFolderDialog(false)} 
              variant="ghost" 
              className="rounded-xl text-slate-400 hover:text-white"
            >
              Hủy
            </Button>
            <Button 
              onClick={handleRenameFolder} 
              disabled={!renameFolderName.trim() || renameFolderName === selectedCategory}
              className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl px-6 font-bold"
            >
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Dialog */}
      <Dialog open={showDeleteFolderDialog} onOpenChange={setShowDeleteFolderDialog}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl bg-slate-900 border-slate-800 text-white">
          <DialogHeader className="items-center text-center">
            <div className="size-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
              <Trash2 className="size-8 text-red-500" />
            </div>
            <DialogTitle className="text-xl text-white">Xóa thư mục?</DialogTitle>
            <p className="text-slate-400 mt-2 text-sm leading-relaxed">
              Bạn có chắc chắn muốn xóa thư mục <span className="text-white font-bold">&quot;{selectedCategory}&quot;</span>? <br/>
              Toàn bộ file bên trong sẽ được chuyển vào mục <span className="text-sky-500 font-bold">&quot;Uncategorized&quot;</span>.
            </p>
          </DialogHeader>
          <DialogFooter className="mt-6 flex-row gap-3">
            <Button 
              onClick={() => setShowDeleteFolderDialog(false)} 
              variant="outline" 
              className="flex-1 rounded-xl border-slate-800 hover:bg-slate-800 text-slate-400"
            >
              Hủy
            </Button>
            <Button 
              onClick={handleDeleteFolder} 
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
            >
              {isDeleting ? <Loader2 className="animate-spin size-4" /> : "Xác nhận xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
