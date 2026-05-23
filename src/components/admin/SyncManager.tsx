"use client"

import { useState } from "react"
import { toast } from "sonner"
import { RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { syncTimeline, syncWins } from "@/app/admin/actions"
import { updateAutoSyncSettings } from "@/app/admin/actions"

type SyncManagerProps = {
  siteSettings?: any
  timelineCount?: number
}

export function SyncManager({ siteSettings, timelineCount }: SyncManagerProps) {
  const [isSyncingWins, setIsSyncingWins] = useState(false)
  const [isSyncingTimeline, setIsSyncingTimeline] = useState(false)
  const [isSavingAutoSync, setIsSavingAutoSync] = useState(false)

  const metadata = (siteSettings?.metadata ?? {}) as any
  const winsSync = metadata?.wins_sync ?? null
  const timelineSync = metadata?.timeline_sync ?? null
  const autoSync = (metadata?.auto_sync ?? {}) as any

  const [winsEnabled, setWinsEnabled] = useState<boolean>(Boolean(autoSync?.wins?.enabled))
  const [winsTimes, setWinsTimes] = useState<string>((autoSync?.wins?.times ?? ["06:10", "18:10"]).join(", "))
  const [timelineEnabled, setTimelineEnabled] = useState<boolean>(Boolean(autoSync?.timeline?.enabled))
  const [timelineTime, setTimelineTime] = useState<string>(String(autoSync?.timeline?.time ?? "05:50"))
  const [realtimeEnabled, setRealtimeEnabled] = useState<boolean>(Boolean(autoSync?.realtime?.enabled))
  const [realtimeInterval, setRealtimeInterval] = useState<string>(String(autoSync?.realtime?.intervalMinutes ?? 60))

  const handleSyncWins = async () => {
    setIsSyncingWins(true)
    try {
      const result = await syncWins()
      if ((result as any)?.error) return toast.error((result as any).error)
      toast.success("Synced wins")
      window.location.reload()
    } finally {
      setIsSyncingWins(false)
    }
  }

  const handleSyncTimeline = async () => {
    setIsSyncingTimeline(true)
    try {
      const result = await syncTimeline()
      if ((result as any)?.error) return toast.error((result as any).error)
      toast.success("Synced timeline")
      window.location.reload()
    } finally {
      setIsSyncingTimeline(false)
    }
  }

  const fmt = (value?: string) => (value ? new Date(value).toLocaleString() : "Never")

  const parseTimesCsv = (input: string) =>
    input
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => /^\d{2}:\d{2}$/.test(s))

  const handleSaveAutoSync = async () => {
    setIsSavingAutoSync(true)
    try {
      const times = parseTimesCsv(winsTimes)
      const intervalMinutes = Number(realtimeInterval)

      if (winsEnabled && times.length === 0) {
        toast.error("Wins times must be HH:MM, comma-separated (e.g. 06:10, 18:10)")
        return
      }
      if (timelineEnabled && !/^\d{2}:\d{2}$/.test(timelineTime.trim())) {
        toast.error("Timeline time must be HH:MM (e.g. 05:50)")
        return
      }
      if (realtimeEnabled && (!Number.isFinite(intervalMinutes) || intervalMinutes < 5)) {
        toast.error("Realtime interval must be >= 5 minutes")
        return
      }

      const result = await updateAutoSyncSettings({
        wins: { enabled: winsEnabled, times },
        timeline: { enabled: timelineEnabled, time: timelineTime.trim() },
        realtime: { enabled: realtimeEnabled, intervalMinutes: intervalMinutes || 60 },
      } as any)

      if ((result as any)?.error) return toast.error((result as any).error)
      toast.success("Saved auto-sync settings")
      window.location.reload()
    } finally {
      setIsSavingAutoSync(false)
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <div className="flex items-center gap-3 text-sky-400">
          <RefreshCw className="size-6" />
          <p className="text-sm font-semibold uppercase tracking-[0.45em]">Sync</p>
        </div>
        <h2 className="mt-4 text-3xl font-light tracking-tight text-white sm:text-4xl">Background sync</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          Use these buttons to sync external data into Supabase without running commands locally.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-800 bg-slate-900/60 shadow-sm backdrop-blur-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base text-white">Auto-sync</CardTitle>
              <p className="mt-1 text-xs text-slate-400">
                These settings control the background worker (run once) that performs scheduled sync.
              </p>
            </div>
            <Button type="button" onClick={handleSaveAutoSync} disabled={isSavingAutoSync} className="rounded-full">
              <RefreshCw className={`mr-2 size-4 ${isSavingAutoSync ? "animate-spin" : ""}`} />
              Save
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Wins</p>
                <button
                  type="button"
                  onClick={() => setWinsEnabled((v) => !v)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    winsEnabled ? "bg-emerald-600/20 text-emerald-300" : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {winsEnabled ? "Enabled" : "Disabled"}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-400">Times (HH:MM, comma-separated)</p>
              <Input value={winsTimes} onChange={(e) => setWinsTimes(e.target.value)} className="mt-2" />
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Timeline</p>
                <button
                  type="button"
                  onClick={() => setTimelineEnabled((v) => !v)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    timelineEnabled ? "bg-emerald-600/20 text-emerald-300" : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {timelineEnabled ? "Enabled" : "Disabled"}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-400">Time (HH:MM)</p>
              <Input value={timelineTime} onChange={(e) => setTimelineTime(e.target.value)} className="mt-2" />
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Realtime poll</p>
                <button
                  type="button"
                  onClick={() => setRealtimeEnabled((v) => !v)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    realtimeEnabled ? "bg-emerald-600/20 text-emerald-300" : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {realtimeEnabled ? "Enabled" : "Disabled"}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-400">Interval (minutes)</p>
              <Input value={realtimeInterval} onChange={(e) => setRealtimeInterval(e.target.value)} className="mt-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 shadow-sm backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base text-white">Wins</CardTitle>
              <p className="mt-1 text-xs text-slate-400">Wikipedia → Supabase</p>
            </div>
            <Button
              type="button"
              onClick={handleSyncWins}
              disabled={isSyncingWins}
              className="rounded-full"
            >
              <RefreshCw className={`mr-2 size-4 ${isSyncingWins ? "animate-spin" : ""}`} />
              Sync now
            </Button>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">Last sync</span>
              <span className="font-medium">{fmt(winsSync?.syncedAt)}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-400">
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <div className="uppercase tracking-widest">Music wins</div>
                <div className="mt-1 text-sm font-semibold text-slate-200">{winsSync?.musicShowWins ?? "-"}</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <div className="uppercase tracking-widest">Award wins</div>
                <div className="mt-1 text-sm font-semibold text-slate-200">{winsSync?.awardCeremonyWins ?? "-"}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 shadow-sm backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base text-white">Timeline</CardTitle>
              <p className="mt-1 text-xs text-slate-400">Release catalog → Supabase timeline_events</p>
            </div>
            <Button
              type="button"
              onClick={handleSyncTimeline}
              disabled={isSyncingTimeline}
              className="rounded-full"
            >
              <RefreshCw className={`mr-2 size-4 ${isSyncingTimeline ? "animate-spin" : ""}`} />
              Sync now
            </Button>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">Last sync</span>
              <span className="font-medium">{fmt(timelineSync?.syncedAt)}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-400">
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <div className="uppercase tracking-widest">Events synced</div>
                <div className="mt-1 text-sm font-semibold text-slate-200">{timelineSync?.timelineEvents ?? "-"}</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <div className="uppercase tracking-widest">DB events</div>
                <div className="mt-1 text-sm font-semibold text-slate-200">{timelineCount ?? "-"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
