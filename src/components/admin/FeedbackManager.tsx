"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { updateFeedbackStatus } from "@/app/admin/actions"
import { cn } from "@/lib/utils"

type FeedbackMessage = {
  id: string
  name: string | null
  email: string | null
  category: string
  message: string
  status: string
  created_at: string
}

const STATUS_OPTIONS = ["new", "reviewed", "resolved"] as const

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function StatusPill({ status }: { status: string }) {
  const classes =
    status === "resolved"
      ? "border-emerald-900/60 bg-emerald-950/60 text-emerald-300"
      : status === "reviewed"
        ? "border-sky-900/60 bg-sky-950/60 text-sky-300"
        : "border-amber-900/60 bg-amber-950/60 text-amber-300"

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${classes}`}>
      {status}
    </span>
  )
}

export function FeedbackManager({ initialFeedbackMessages }: { initialFeedbackMessages: FeedbackMessage[] }) {
  const [items, setItems] = useState(initialFeedbackMessages)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "reviewed" | "resolved">("all")

  const counts = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
  }, [items])

  const filteredItems = useMemo(() => {
    if (statusFilter === "all") return items
    return items.filter((item) => item.status === statusFilter)
  }, [items, statusFilter])

  const handleStatusChange = async (feedbackId: string, status: string) => {
    setUpdatingId(feedbackId)
    try {
      await updateFeedbackStatus(feedbackId, status as "new" | "reviewed" | "resolved")
      setItems((current) => current.map((item) => (item.id === feedbackId ? { ...item, status } : item)))
    } catch {
      alert("Failed to update feedback status")
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h2 className="text-3xl font-light tracking-tight text-white sm:text-4xl">Feedback Inbox</h2>
        <p className="mt-2 text-sm text-slate-500">Review messages from fans and keep track of the latest requests.</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid flex-1 gap-4 sm:grid-cols-3">
        <Card className="border-slate-800 bg-slate-900 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{items.length}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">New</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{counts.new || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{counts.resolved || 0}</div>
          </CardContent>
        </Card>
        </div>

        <div className="w-full sm:w-64">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Filter status</p>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
            <SelectTrigger className="h-11 border-slate-800 bg-slate-950 text-sm text-white">
              <SelectValue placeholder="All feedback" />
            </SelectTrigger>
            <SelectContent className="border-slate-800 bg-slate-900 text-white">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="overflow-hidden border-slate-800 bg-slate-900 shadow-xl">
        <Table>
          <TableHeader className="bg-slate-950/50">
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400 font-medium">Status</TableHead>
              <TableHead className="text-slate-400 font-medium">Category</TableHead>
              <TableHead className="text-slate-400 font-medium">Sender</TableHead>
              <TableHead className="text-slate-400 font-medium">Message</TableHead>
              <TableHead className="text-slate-400 font-medium">Received</TableHead>
              <TableHead className="w-[180px] text-slate-400 font-medium">Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow className="border-slate-800">
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                  No feedback messages yet.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id} className={cn("border-slate-800 transition-colors hover:bg-slate-800/40", item.status === "new" && "bg-amber-950/10") }>
                  <TableCell>
                    <StatusPill status={item.status} />
                  </TableCell>
                  <TableCell className="capitalize text-slate-300">{item.category}</TableCell>
                  <TableCell className="text-slate-200">
                    <div className="space-y-1">
                      <p className="font-medium">{item.name || "Anonymous"}</p>
                      <p className="text-xs text-slate-500">{item.email || "No email provided"}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-2xl text-slate-300">
                    <p className="line-clamp-3 whitespace-pre-wrap leading-6">{item.message}</p>
                  </TableCell>
                  <TableCell className="text-slate-400">{formatDate(item.created_at)}</TableCell>
                  <TableCell>
                    <Select
                      value={item.status}
                      onValueChange={(value) => handleStatusChange(item.id, value)}
                      disabled={updatingId === item.id}
                    >
                      <SelectTrigger className="h-8 w-36 border-slate-800 bg-slate-950 text-xs text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-slate-800 bg-slate-900 text-white">
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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