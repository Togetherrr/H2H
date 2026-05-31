"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TagInput } from "@/components/admin/TagInput"
import { DynamicListInput } from "@/components/admin/DynamicListInput"
import { toast } from "sonner"
import {
    Plus,
    Trash2,
    Edit2,
    ChevronDown,
    ChevronRight,
    Trophy,
    Loader2,
    Link as LinkIcon,
    X,
    Calendar,
} from "lucide-react"
import {
    createAwardEvent,
    updateAwardEvent,
    deleteAwardEvent,
    addAppToEvent,
    updateEventApp,
    removeAppFromEvent,
    createEventRound,
    updateEventRound,
    deleteEventRound,
} from "../../app/admin/actions"

// ── Types ──────────────────────────────────────────────────────────────────
type AwardEventForm = {
    name: string
    nominations: string[]
    ceremony_at: string
    reflection_rate: string[]
    is_active: boolean
    sort_order: number
}

type EventRoundForm = {
    round_name: string
    start_at: string   // KST local input
    end_at: string
    display_timezone: string
    is_active: boolean
}

type EventAppForm = {
    app_id: string
    description: string
    guide_url: string
    award_name: string
    awards: string[]
    sort_order: number
}

// ── Helpers ────────────────────────────────────────────────────────────────
function kstToUtc(value: string): string {
    const trimmed = value.trim()
    if (!trimmed) return ""
    const hasSeconds = trimmed.split(":").length === 3
    const dateStr = hasSeconds ? `${trimmed}+09:00` : `${trimmed}:00+09:00`
    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) return ""
    return date.toISOString()
}

function utcToKst(utcString: string | null | undefined): string {
    if (!utcString) return ""
    const date = new Date(utcString)
    if (Number.isNaN(date.getTime())) return ""
    const kstDate = new Date(date.getTime() + 9 * 60 * 60000)
    return kstDate.toISOString().slice(0, 16)
}

function emptyEventForm(): AwardEventForm {
    return {
        name: "",
        nominations: [""],
        ceremony_at: "",
        reflection_rate: [""],
        is_active: true,
        sort_order: 0,
    }
}

function emptyRoundForm(): EventRoundForm {
    return {
        round_name: "",
        start_at: "",
        end_at: "",
        display_timezone: "Asia/Seoul",
        is_active: true,
    }
}

// ── Main component ─────────────────────────────────────────────────────────
export function AwardEventsManager({
    initialEvents,
    availableApps,
}: {
    initialEvents: any[]
    availableApps: any[]   // voting_apps list (passed from admin page)
}) {
    const [events, setEvents] = useState<any[]>(initialEvents)
    const [editingEventId, setEditingEventId] = useState<string | null>(null)
    const [form, setForm] = useState<AwardEventForm>(emptyEventForm())
    const [expandedEventId, setExpandedEventId] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Per-event: expanded app panel state
    const [expandedAppId, setExpandedAppId] = useState<string | null>(null)

    // Add-app form per event
    const [addAppForm, setAddAppForm] = useState<Record<string, EventAppForm>>({})

    // Edit form per event-app
    const [editAppForm, setEditAppForm] = useState<Record<string, EventAppForm>>({})

    // Round forms per event-app
    const [roundForms, setRoundForms] = useState<Record<string, EventRoundForm>>({})
    const [editingRoundId, setEditingRoundId] = useState<string | null>(null)

    // ── Event CRUD ──────────────────────────────────────────────────────────
    function startEditEvent(event: any) {
        setEditingEventId(event.id)
        setForm({
            name: event.name ?? "",
            nominations: event.nominations?.length ? event.nominations : [""],
            ceremony_at: utcToKst(event.ceremony_at),
            reflection_rate: event.reflection_rate?.length ? event.reflection_rate : [""],
            is_active: event.is_active ?? true,
            sort_order: event.sort_order ?? 0,
        })
        setExpandedEventId(event.id)
    }

    function cancelEdit() {
        setEditingEventId(null)
        setForm(emptyEventForm())
    }

    async function handleSubmitEvent() {
        if (!form.name.trim()) {
            toast.error("Event name is required")
            return
        }
        setIsSubmitting(true)

        const payload = {
            name: form.name.trim(),
            nominations: form.nominations.filter(Boolean),
            ceremony_at: kstToUtc(form.ceremony_at) || null,
            reflection_rate: form.reflection_rate.filter(Boolean),
            is_active: form.is_active,
            sort_order: form.sort_order,
        }

        const result = editingEventId
            ? await updateAwardEvent(editingEventId, payload)
            : await createAwardEvent(payload)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(editingEventId ? "Event updated!" : "Event created!")
            cancelEdit()
            // Refresh — simplest approach: reload events from server
            window.location.reload()
        }
        setIsSubmitting(false)
    }

    async function handleDeleteEvent(id: string) {
        if (!confirm("Delete this award event? All linked apps and rounds will be removed.")) return
        setIsSubmitting(true)
        const result = await deleteAwardEvent(id)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Event deleted")
            setEvents((prev) => prev.filter((e) => e.id !== id))
        }
        setIsSubmitting(false)
    }

    // ── App in event ────────────────────────────────────────────────────────
    function getAddAppForm(eventId: string): EventAppForm {
        return addAppForm[eventId] ?? { app_id: "", description: "", guide_url: "", award_name: "", awards: [], sort_order: 0 }
    }

    function setAddAppFormField(eventId: string, field: keyof EventAppForm, value: any) {
        setAddAppForm((prev) => ({
            ...prev,
            [eventId]: { ...getAddAppForm(eventId), [field]: value },
        }))
    }

    async function handleAddApp(eventId: string) {
        const f = getAddAppForm(eventId)
        if (!f.app_id) {
            toast.error("Select an app first")
            return
        }
        setIsSubmitting(true)
        const result = await addAppToEvent({
            event_id: eventId,
            app_id: f.app_id,
            description: f.description || null,
            guide_url: f.guide_url || null,
            award_name: f.award_name || null,
            awards: (f.awards ?? []).filter(Boolean),
            sort_order: f.sort_order,
        })
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("App added to event!")
            window.location.reload()
        }
        setIsSubmitting(false)
    }

    function getEditAppForm(ea: any): EventAppForm {
        return editAppForm[ea.id] ?? {
            app_id: ea.app_id ?? "",
            description: ea.description ?? "",
            guide_url: ea.guide_url ?? "",
            award_name: ea.award_name ?? "",
            awards: Array.isArray(ea.awards) ? ea.awards : [],
            sort_order: typeof ea.sort_order === "number" ? ea.sort_order : 0,
        }
    }

    function setEditAppFormField(eventAppId: string, field: keyof EventAppForm, value: any) {
        setEditAppForm((prev) => ({
            ...prev,
            [eventAppId]: {
                ...(prev[eventAppId] ?? { app_id: "", description: "", guide_url: "", award_name: "", awards: [], sort_order: 0 }),
                [field]: value,
            },
        }))
    }

    async function handleSaveEventApp(eventAppId: string) {
        const f = editAppForm[eventAppId]
        if (!f) return
        setIsSubmitting(true)
        const result = await updateEventApp(eventAppId, {
            description: f.description || null,
            guide_url: f.guide_url || null,
            award_name: f.award_name || null,
            awards: (f.awards ?? []).filter(Boolean),
            sort_order: f.sort_order,
        })
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Event app updated!")
            window.location.reload()
        }
        setIsSubmitting(false)
    }

    async function handleRemoveApp(eventAppId: string) {
        if (!confirm("Remove this app from the event?")) return
        const result = await removeAppFromEvent(eventAppId)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("App removed")
            window.location.reload()
        }
    }

    // ── Rounds ──────────────────────────────────────────────────────────────
    const roundFormKey = (eventId: string, appId: string) => `${eventId}:${appId}`

    function getRoundForm(key: string): EventRoundForm {
        return roundForms[key] ?? emptyRoundForm()
    }

    function setRoundFormField(key: string, field: keyof EventRoundForm, value: any) {
        setRoundForms((prev) => ({
            ...prev,
            [key]: { ...getRoundForm(key), [field]: value },
        }))
    }

    async function handleCreateRound(eventId: string, appId: string) {
        const key = roundFormKey(eventId, appId)
        const f = getRoundForm(key)

        if (!f.round_name.trim()) {
            toast.error("Round name is required")
            return
        }

        const startUtc = kstToUtc(f.start_at)
        const endUtc = kstToUtc(f.end_at)
        if (!startUtc || !endUtc) {
            toast.error("Invalid date format (use YYYY-MM-DDTHH:MM)")
            return
        }

        setIsSubmitting(true)
        const result = await createEventRound({
            event_id: eventId,
            app_id: appId,
            round_name: f.round_name.trim(),
            start_at: startUtc,
            end_at: endUtc,
            display_timezone: f.display_timezone,
            is_active: f.is_active,
        })

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Round created!")
            setRoundForms((prev) => ({ ...prev, [key]: emptyRoundForm() }))
            window.location.reload()
        }
        setIsSubmitting(false)
    }

    async function handleDeleteRound(id: string) {
        if (!confirm("Delete this round?")) return
        const result = await deleteEventRound(id)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Round deleted")
            window.location.reload()
        }
    }

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="space-y-8">
            {/* ── Create new event form ──────────────────────────────────── */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Trophy className="size-5 text-amber-500" />
                        {editingEventId ? "Edit Award Event" : "Create Award Event"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Event Name *</Label>
                            <Input
                                placeholder="KM Chart Awards 2026"
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Sort Order</Label>
                            <Input
                                type="number"
                                value={form.sort_order}
                                onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Ceremony Date (KST)</Label>
                        <Input
                            type="datetime-local"
                            value={form.ceremony_at}
                            onChange={(e) => setForm((f) => ({ ...f, ceremony_at: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Nominations</Label>
                        <p className="text-[11px] text-slate-500">
                            Các giải được đề cử (ví dụ: Best Female Popular, Best Song, Rising Global)
                        </p>
                        <DynamicListInput
                            items={form.nominations}
                            onChange={(items) => setForm((f) => ({ ...f, nominations: items }))}
                            placeholder="Best Female Popular Award"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Reflection Rate</Label>
                        <p className="text-[11px] text-slate-500">
                            Cách tính điểm (ví dụ: Fan vote 100%, Combining total votes...)
                        </p>
                        <DynamicListInput
                            items={form.reflection_rate}
                            onChange={(items) => setForm((f) => ({ ...f, reflection_rate: items }))}
                            placeholder="Fan vote 100%"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="event-active"
                            checked={form.is_active}
                            onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                            className="rounded"
                        />
                        <Label htmlFor="event-active">Active (hiển thị trên site)</Label>
                    </div>

                    <div className="flex gap-3">
                        <Button onClick={handleSubmitEvent} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="size-4 animate-spin mr-2" />}
                            {editingEventId ? "Save Changes" : "Create Event"}
                        </Button>
                        {editingEventId && (
                            <Button variant="outline" onClick={cancelEdit}>
                                Cancel
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* ── Events list ──────────────────────────────────────────────── */}
            <div className="space-y-4">
                <h3 className="font-bold text-slate-700">
                    Existing Events ({events.length})
                </h3>

                {events.length === 0 && (
                    <p className="text-slate-400 italic text-sm">No award events yet. Create one above.</p>
                )}

                {events.map((event) => (
                    <Card key={event.id} className="border border-slate-200">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className={`h-2.5 w-2.5 rounded-full ${event.is_active ? "bg-green-500" : "bg-slate-300"}`} />
                                    <CardTitle className="text-base text-slate-100">{event.name}</CardTitle>
                                    {event.nominations?.length > 0 && (
                                        <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                                            {event.nominations.length} nominations
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => startEditEvent(event)}
                                        className="text-slate-700"
                                    >
                                        <Edit2 className="size-3.5" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setExpandedEventId(
                                            expandedEventId === event.id ? null : event.id
                                        )}
                                        className="text-slate-700"
                                    >
                                        {expandedEventId === event.id
                                            ? <ChevronDown className="size-3.5" />
                                            : <ChevronRight className="size-3.5" />
                                        }
                                        Manage Apps & Rounds
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDeleteEvent(event.id)}
                                    >
                                        <Trash2 className="size-3.5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Nominations preview */}
                            {event.nominations?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {event.nominations.map((nom: string) => (
                                        <span key={nom} className="flex items-center gap-1 text-[10px] bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-lg">
                                            <Trophy className="size-2.5" /> {nom}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </CardHeader>

                        {/* Expanded: Apps + Rounds management */}
                        {expandedEventId === event.id && (
                            <CardContent className="border-t pt-6 space-y-8">

                                {/* Existing linked apps */}
                                {event.event_apps?.length > 0 && (
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-sm text-slate-700">Linked Apps</h4>
                                        {event.event_apps.map((ea: any) => {
                                            const appName = ea.voting_apps?.name ?? ea.app_id
                                            const isAppExpanded = expandedAppId === ea.id
                                            const roundKey = roundFormKey(event.id, ea.app_id)
                                            const rForm = getRoundForm(roundKey)
                                            const aForm = getEditAppForm(ea)

                                            return (
                                                <div key={ea.id} className="rounded-xl border border-slate-200 overflow-hidden">
                                                    <div className="flex items-center justify-between p-4 bg-slate-50">
                                                        <div className="flex items-center gap-3">
                                                            {ea.voting_apps?.logo_url && (
                                                                <Image
                                                                    src={ea.voting_apps.logo_url}
                                                                    alt={appName}
                                                                    width={32}
                                                                    height={32}
                                                                    className="h-8 w-8 rounded-lg object-cover"
                                                                />
                                                            )}
                                                            <div>
                                                                <p className="font-bold text-sm text-slate-900">{appName}</p>
                                                                {ea.description && (
                                                                    <p className="text-[11px] text-slate-500 italic">{ea.description}</p>
                                                                )}
                                                            </div>
                                                            {ea.rounds?.length > 0 && (
                                                                <span className="text-[10px] bg-sky-50 border border-sky-200 text-sky-600 px-2 py-0.5 rounded-full">
                                                                    {ea.rounds.length} round(s)
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-slate-700 hover:text-slate-900"
                                                                onClick={() => {
                                                                    if (isAppExpanded) {
                                                                        setExpandedAppId(null)
                                                                        return
                                                                    }
                                                                    // Seed edit form from current row on first open
                                                                    setEditAppForm((prev) => ({
                                                                        ...prev,
                                                                        [ea.id]: getEditAppForm(ea),
                                                                    }))
                                                                    setExpandedAppId(ea.id)
                                                                }}
                                                            >
                                                                {isAppExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                                                                Rounds
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="text-red-500 hover:text-red-700"
                                                                onClick={() => handleRemoveApp(ea.id)}
                                                            >
                                                                <X className="size-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Rounds panel */}
                                                    {isAppExpanded && (
                                                        <div className="p-4 space-y-4 bg-slate-900/40 border-t border-slate-800">
                                                            {/* Event-app settings */}
                                                            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-4">
                                                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                                                    App Settings (for this event)
                                                                </p>
                                                                <div className="grid gap-3 sm:grid-cols-2">
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[11px]">Award Name (in-app)</Label>
                                                                        <Input
                                                                            placeholder="KM Chart Awards 2026"
                                                                            value={aForm.award_name}
                                                                            onChange={(e) => setEditAppFormField(ea.id, "award_name", e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[11px]">Guide URL (optional)</Label>
                                                                        <Input
                                                                            placeholder="https://..."
                                                                            value={aForm.guide_url}
                                                                            onChange={(e) => setEditAppFormField(ea.id, "guide_url", e.target.value)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="grid gap-3 sm:grid-cols-2">
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[11px]">Sort Order</Label>
                                                                        <Input
                                                                            type="number"
                                                                            value={aForm.sort_order}
                                                                            onChange={(e) => setEditAppFormField(ea.id, "sort_order", Number(e.target.value))}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[11px]">Description (optional)</Label>
                                                                        <Input
                                                                            placeholder="App-specific note for this event..."
                                                                            value={aForm.description}
                                                                            onChange={(e) => setEditAppFormField(ea.id, "description", e.target.value)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <Label className="text-[11px]">Awards in this app (optional)</Label>
                                                                    <TagInput
                                                                        items={aForm.awards ?? []}
                                                                        onChange={(items) => setEditAppFormField(ea.id, "awards", items)}
                                                                        placeholder="Best Female Popular, Best Song, Rising Global..."
                                                                    />
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleSaveEventApp(ea.id)}
                                                                        disabled={isSubmitting}
                                                                        className="text-white"
                                                                    >
                                                                        {isSubmitting && <Loader2 className="size-3.5 animate-spin mr-1" />}
                                                                        Save
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            {/* Existing rounds */}
                                                            {ea.rounds?.length > 0 && (
                                                                <div className="space-y-2">
                                                                    {ea.rounds.map((round: any) => (
                                                                        <div
                                                                            key={round.id}
                                                                            className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                                                                        >
                                                                            <div>
                                                                                <span className="font-bold text-slate-900">{round.round_name}</span>
                                                                                <span className="ml-3 text-[11px] text-slate-500">
                                                                                    {utcToKst(round.start_at)} → {utcToKst(round.end_at)} KST
                                                                                </span>
                                                                                {round.is_active && (
                                                                                    <span className="ml-2 text-[9px] bg-sky-50 border border-sky-200 text-sky-600 px-1.5 py-0.5 rounded uppercase font-bold">
                                                                                        Active
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="ghost"
                                                                                className="text-red-500 hover:text-red-700"
                                                                                onClick={() => handleDeleteRound(round.id)}
                                                                            >
                                                                                <Trash2 className="size-3.5" />
                                                                            </Button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* Add round form */}
                                                            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-4 space-y-3">
                                                                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                                                                    Add Round
                                                                </p>
                                                                <div className="grid gap-3 sm:grid-cols-2">
                                                                    <div>
                                                                        <Label className="text-[11px]">Round Name</Label>
                                                                        <Input
                                                                            size={1}
                                                                            placeholder="Semi-Final Round 1 (Top 30)"
                                                                            value={rForm.round_name}
                                                                            onChange={(e) => setRoundFormField(roundKey, "round_name", e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <Label className="text-[11px]">Timezone</Label>
                                                                        <Input
                                                                            size={1}
                                                                            value={rForm.display_timezone}
                                                                            onChange={(e) => setRoundFormField(roundKey, "display_timezone", e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <Label className="text-[11px]">Start (KST)</Label>
                                                                        <Input
                                                                            type="datetime-local"
                                                                            value={rForm.start_at}
                                                                            onChange={(e) => setRoundFormField(roundKey, "start_at", e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <Label className="text-[11px]">End (KST)</Label>
                                                                        <Input
                                                                            type="datetime-local"
                                                                            value={rForm.end_at}
                                                                            onChange={(e) => setRoundFormField(roundKey, "end_at", e.target.value)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`round-active-${roundKey}`}
                                                                        checked={rForm.is_active}
                                                                        onChange={(e) => setRoundFormField(roundKey, "is_active", e.target.checked)}
                                                                    />
                                                                    <Label htmlFor={`round-active-${roundKey}`} className="text-[12px]">
                                                                        Active
                                                                    </Label>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleCreateRound(event.id, ea.app_id)}
                                                                        disabled={isSubmitting}
                                                                        className="text-white"
                                                                    >
                                                                        {isSubmitting && <Loader2 className="size-3.5 animate-spin mr-1" />}
                                                                        <Plus className="size-3.5 mr-1" />
                                                                        Add Round
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Add new app to event */}
                                <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-4 space-y-4">
                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                        Add App to Event
                                    </p>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px]">App *</Label>
                                            <select
                                                className="w-full rounded-md border border-slate-800 bg-slate-950 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                                                value={getAddAppForm(event.id).app_id}
                                                onChange={(e) => setAddAppFormField(event.id, "app_id", e.target.value)}
                                            >
                                                <option value="">Select an app...</option>
                                                {availableApps.map((app: any) => (
                                                    <option key={app.id} value={app.id}>
                                                        {app.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px]">Sort Order</Label>
                                            <Input
                                                type="number"
                                                value={getAddAppForm(event.id).sort_order}
                                                onChange={(e) => setAddAppFormField(event.id, "sort_order", Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px]">
                                            Description (optional — app-specific note for this event)
                                        </Label>
                                        <Input
                                            placeholder="Official voting for KM CHART AWARDS 2026 is live on UPICK..."
                                            value={getAddAppForm(event.id).description}
                                            onChange={(e) => setAddAppFormField(event.id, "description", e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px]">Award Name (in-app)</Label>
                                            <Input
                                                placeholder="KM Chart Awards 2026"
                                                value={getAddAppForm(event.id).award_name}
                                                onChange={(e) => setAddAppFormField(event.id, "award_name", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px]">Guide URL (optional)</Label>
                                            <Input
                                                placeholder="https://..."
                                                value={getAddAppForm(event.id).guide_url}
                                                onChange={(e) => setAddAppFormField(event.id, "guide_url", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px]">Awards in this app (optional)</Label>
                                        <TagInput
                                            items={getAddAppForm(event.id).awards ?? []}
                                            onChange={(items) => setAddAppFormField(event.id, "awards", items)}
                                            placeholder="Best Female Popular, Best Song, Rising Global..."
                                        />
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => handleAddApp(event.id)}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting && <Loader2 className="size-3.5 animate-spin mr-1" />}
                                        <Plus className="size-3.5 mr-1" />
                                        Add App
                                    </Button>
                                </div>
                            </CardContent>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    )
}
