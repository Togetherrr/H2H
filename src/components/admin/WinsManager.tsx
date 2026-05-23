"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Plus, Trash2, Music, Calendar, Award, RefreshCw } from "lucide-react"
import { upsertMusicShowWin, deleteMusicShowWin, upsertAwardWin, deleteAwardWin, syncWins } from "@/app/admin/actions"

type MusicShowWin = {
  id: string
  date: string
  song: string
  program: string
  headline: string
  href: string | null
}

type AwardWin = {
  id: string
  ceremony: string
  year: string
  category: string
  href: string | null
}

export function WinsManager({
  musicWins: initialMusicWins,
  awardWins: initialAwardWins,
  winsSync,
}: {
  musicWins: MusicShowWin[]
  awardWins: AwardWin[]
  winsSync?: { syncedAt?: string; musicShowWins?: number; awardCeremonyWins?: number } | null
}) {
  const [musicWins] = useState<MusicShowWin[]>(initialMusicWins)
  const [awardWins] = useState<AwardWin[]>(initialAwardWins)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const [newMusicWin, setNewMusicWin] = useState<Partial<MusicShowWin>>({
    date: new Date().toISOString().split("T")[0],
    song: "",
    program: "",
    headline: "",
    href: "",
  })

  const [newAwardWin, setNewAwardWin] = useState<Partial<AwardWin>>({
    ceremony: "",
    year: new Date().getFullYear().toString(),
    category: "",
    href: "",
  })

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const result = await syncWins()
      if ((result as any)?.error) {
        toast.error((result as any).error)
        return
      }
      toast.success("Synced wins from sources")
      window.location.reload()
    } finally {
      setIsSyncing(false)
    }
  }

  const handleAddMusicWin = async () => {
    if (!newMusicWin.date || !newMusicWin.song || !newMusicWin.program || !newMusicWin.headline) {
      toast.error("Please fill in all required fields for Music Show Win")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await upsertMusicShowWin(newMusicWin)
      if ((result as any)?.error) {
        toast.error((result as any).error)
      } else {
        toast.success("Added music show win")
        window.location.reload()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteMusicWin = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return
    const result = await deleteMusicShowWin(id)
    if ((result as any)?.error) toast.error((result as any).error)
    else {
      toast.success("Deleted record")
      window.location.reload()
    }
  }

  const handleAddAwardWin = async () => {
    if (!newAwardWin.ceremony || !newAwardWin.year || !newAwardWin.category) {
      toast.error("Please fill in all required fields for Award Win")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await upsertAwardWin(newAwardWin)
      if ((result as any)?.error) {
        toast.error((result as any).error)
      } else {
        toast.success("Added award ceremony win")
        window.location.reload()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAwardWin = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return
    const result = await deleteAwardWin(id)
    if ((result as any)?.error) toast.error((result as any).error)
    else {
      toast.success("Deleted record")
      window.location.reload()
    }
  }

  return (
    <div className="space-y-12 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl border border-slate-800 bg-slate-950/40">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">External sync</p>
          <p className="text-sm text-slate-300">
            {winsSync?.syncedAt ? `Last synced: ${new Date(winsSync.syncedAt).toLocaleString()}` : "No sync recorded yet."}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleSync}
          disabled={isSyncing}
          className="h-10 border-slate-800 bg-slate-950 text-white hover:bg-slate-900"
        >
          <RefreshCw className="size-4" />
          {isSyncing ? "Syncing..." : "Sync from sources"}
        </Button>
      </div>

      <section>
        <div className="flex items-center gap-3 mb-6 text-sky-400">
          <Music className="size-6" />
          <h2 className="text-2xl font-light tracking-wide text-white">Music Show Wins</h2>
        </div>

        <Card className="border-slate-800 bg-slate-900/60 shadow-sm backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-widest">Add New Music Show Win</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 ml-1">Date</label>
                <Input
                  type="date"
                  value={newMusicWin.date}
                  onChange={(e) => setNewMusicWin({ ...newMusicWin, date: e.target.value })}
                  className="h-10 border-slate-800 bg-slate-950 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 ml-1">Song</label>
                <Input
                  placeholder="e.g. The Chase"
                  value={newMusicWin.song}
                  onChange={(e) => setNewMusicWin({ ...newMusicWin, song: e.target.value })}
                  className="h-10 border-slate-800 bg-slate-950 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 ml-1">Program</label>
                <Input
                  placeholder="e.g. The Show"
                  value={newMusicWin.program}
                  onChange={(e) => setNewMusicWin({ ...newMusicWin, program: e.target.value })}
                  className="h-10 border-slate-800 bg-slate-950 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 ml-1">Headline</label>
                <Input
                  placeholder="e.g. 1st-ever win"
                  value={newMusicWin.headline}
                  onChange={(e) => setNewMusicWin({ ...newMusicWin, headline: e.target.value })}
                  className="h-10 border-slate-800 bg-slate-950 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 ml-1">Link (Optional)</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://..."
                    value={newMusicWin.href || ""}
                    onChange={(e) => setNewMusicWin({ ...newMusicWin, href: e.target.value })}
                    className="h-10 border-slate-800 bg-slate-950 text-white"
                  />
                  <Button onClick={handleAddMusicWin} disabled={isSubmitting} className="h-10 px-3 bg-sky-600 hover:bg-sky-700 text-white">
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {musicWins.length === 0 ? (
            <p className="text-center py-8 text-slate-500 italic border border-dashed border-slate-800 rounded-xl">
              No music show wins records found in database.
            </p>
          ) : (
            musicWins.map((win) => (
              <div key={win.id} className="group flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/40 transition-colors">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="size-3.5" />
                    <span className="text-sm font-mono">{win.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sky-400 font-medium">{win.song}</span>
                    <span className="text-slate-600">—</span>
                    <span className="text-white">{win.program}</span>
                  </div>
                  <span className="text-slate-400 text-sm">{win.headline}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-500 hover:text-rose-400 hover:bg-rose-400/5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteMusicWin(win.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6 text-amber-400">
          <Award className="size-6" />
          <h2 className="text-2xl font-light tracking-wide text-white">Award Ceremony Wins</h2>
        </div>

        <Card className="border-slate-800 bg-slate-900/60 shadow-sm backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-widest">Add New Award Win</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 ml-1">Ceremony</label>
                <Input
                  placeholder="e.g. Golden Disc Awards"
                  value={newAwardWin.ceremony}
                  onChange={(e) => setNewAwardWin({ ...newAwardWin, ceremony: e.target.value })}
                  className="h-10 border-slate-800 bg-slate-950 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 ml-1">Year</label>
                <Input
                  placeholder="e.g. 2026"
                  value={newAwardWin.year}
                  onChange={(e) => setNewAwardWin({ ...newAwardWin, year: e.target.value })}
                  className="h-10 border-slate-800 bg-slate-950 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 ml-1">Category</label>
                <Input
                  placeholder="e.g. Rookie of the Year"
                  value={newAwardWin.category}
                  onChange={(e) => setNewAwardWin({ ...newAwardWin, category: e.target.value })}
                  className="h-10 border-slate-800 bg-slate-950 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 ml-1">Link (Optional)</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://..."
                    value={newAwardWin.href || ""}
                    onChange={(e) => setNewAwardWin({ ...newAwardWin, href: e.target.value })}
                    className="h-10 border-slate-800 bg-slate-950 text-white"
                  />
                  <Button onClick={handleAddAwardWin} disabled={isSubmitting} className="h-10 px-3 bg-amber-600 hover:bg-amber-700 text-white">
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {awardWins.length === 0 ? (
            <p className="text-center py-8 text-slate-500 italic border border-dashed border-slate-800 rounded-xl">
              No award wins records found in database.
            </p>
          ) : (
            awardWins.map((win) => (
              <div key={win.id} className="group flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/40 transition-colors">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="size-3.5" />
                    <span className="text-sm font-mono">{win.year}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-medium">{win.ceremony}</span>
                    <span className="text-slate-600">—</span>
                    <span className="text-white">{win.category}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-500 hover:text-rose-400 hover:bg-rose-400/5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteAwardWin(win.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

