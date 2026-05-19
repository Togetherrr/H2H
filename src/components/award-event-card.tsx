"use client"

import Image from "next/image"
import { useState } from "react"
import {
    BookOpen,
    Smartphone,
    Sparkles,
    ChevronDown,
    Trophy,
    X,
    Globe,
    ExternalLink,
    Clock,
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useTimeZoneStore } from "@/lib/timezone-store"
import { formatDateTime } from "@/lib/timezone"
import type { MappedAwardEvent, MappedEventApp } from "@/hooks/useAwardEvents"

// ── Reusable sub-components ───────────────────────────────────────────────

function AppIcon({ imageSrc, name, size = "md" }: { imageSrc?: string; name: string; size?: "sm" | "md" }) {
    const cls = size === "sm"
        ? "h-7 w-7 rounded-xl text-[10px]"
        : "h-12 w-12 rounded-2xl text-[13px]"

    if (imageSrc) {
        return (
            <Image
                src={imageSrc}
                alt={name}
                width={size === "sm" ? 28 : 48}
                height={size === "sm" ? 28 : 48}
                className={cn(cls, "object-cover ring-2 ring-white shadow-md")}
            />
        )
    }
    return (
        <div
            className={cn(
                cls,
                "flex items-center justify-center bg-gradient-to-br from-[#FFC2D1] to-[#A2D2FF] font-black uppercase text-white shadow-md ring-2 ring-white"
            )}
        >
            {name.slice(0, 2).toUpperCase()}
        </div>
    )
}

/** Guide modal — shows step-by-step images, same design as original */
function GuideModal({
    isOpen,
    onClose,
    app,
}: {
    isOpen: boolean
    onClose: () => void
    app: MappedEventApp
}) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto !rounded-[3rem] bg-white/95 backdrop-blur-xl border-white shadow-2xl p-0 gap-0 custom-scrollbar overflow-x-hidden">
                <DialogHeader className="p-8 pb-4 flex flex-row items-center justify-between gap-4 sticky top-0 bg-white/60 backdrop-blur-md z-20 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <AppIcon imageSrc={app.iconImageSrc} name={app.name} />
                        <div className="text-left">
                            <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-slate-900 italic">
                                {app.name} Guide
                            </DialogTitle>
                            <DialogDescription className="text-[10px] font-black text-[#FF708A] uppercase tracking-widest mt-1 opacity-60">
                                Follow steps below to vote
                            </DialogDescription>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors shrink-0"
                    >
                        <X className="size-5" />
                    </button>
                </DialogHeader>

                <div className="p-8 space-y-16">
                    {app.guideSteps && app.guideSteps.length > 0 ? (
                        <div className="space-y-20">
                            {app.guideSteps.map((step, index) => (
                                <div key={index} className="flex flex-col items-center text-center gap-8 group/step">
                                    <div className="space-y-4 w-full max-w-2xl">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black text-white text-base font-black italic shadow-lg shadow-black/10 group-hover/step:scale-110 transition-transform">
                                                {String(index + 1).padStart(2, "0")}
                                            </div>
                                            <h5 className="text-xl font-black uppercase tracking-tight text-slate-900 leading-tight italic">
                                                {step.title || "Next Step"}
                                            </h5>
                                        </div>
                                        {step.description && (
                                            <p className="text-[15px] font-semibold text-slate-500 leading-relaxed italic opacity-80 px-4">
                                                {step.description}
                                            </p>
                                        )}
                                    </div>
                                    {step.image_url && (
                                        <div className="w-full max-w-lg mx-auto">
                                            <div className="relative overflow-hidden rounded-[2.5rem] border-4 border-white shadow-2xl shadow-slate-200/50 transition-transform duration-500 hover:scale-[1.02]">
                                                <Image
                                                    src={step.image_url}
                                                    alt={step.title || "Guide image"}
                                                    width={800}
                                                    height={1200}
                                                    className="w-full h-auto object-cover"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <BookOpen className="size-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold italic">No guide steps available.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ── App status badge ──────────────────────────────────────────────────────
function AppStatusBadge({ app }: { app: MappedEventApp }) {
    const now = new Date()
    const hasActiveRound = app.rounds.some(
        (r) => r.is_active && now >= new Date(r.start_at) && now <= new Date(r.end_at)
    )
    const hasFutureRound = !hasActiveRound && app.rounds.some(
        (r) => r.is_active && now < new Date(r.start_at)
    )

    if (hasActiveRound) {
        return (
            <div className="flex items-center gap-1.5 rounded-lg bg-green-500/10 px-2 py-0.5 text-green-600 border border-green-500/20">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                <p className="text-[9px] font-black uppercase tracking-widest leading-none">Active</p>
            </div>
        )
    }
    if (hasFutureRound) {
        return (
            <div className="flex items-center gap-1.5 rounded-lg bg-sky-500/10 px-2 py-0.5 text-sky-600 border border-sky-500/20">
                <div className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                <p className="text-[9px] font-black uppercase tracking-widest leading-none">Coming Soon</p>
            </div>
        )
    }
    return null
}

// ── Main card ─────────────────────────────────────────────────────────────
export function AwardEventCard({ event }: { event: MappedAwardEvent }) {
    const [expanded, setExpanded] = useState(true)
    const [selectedAppIdx, setSelectedAppIdx] = useState(0)
    const [isGuideOpen, setIsGuideOpen] = useState(false)
    const timeZone = useTimeZoneStore((s) => s.timeZone)

    const selectedApp = event.apps[selectedAppIdx]
    if (!selectedApp) return null

    const appAwards = selectedApp.awards ?? []
    const currencyItems = selectedApp.currencies
    const collectItems = selectedApp.collection
    const strategyItems = selectedApp.strategies

    return (
        <div id={`event-${event.id}`} className="reveal-up group relative">
            <div className="card-premium !rounded-[2.5rem] !p-0 overflow-hidden border border-white/60 !bg-[#FFEBF0] transition-all duration-500">
                <div className="p-6 md:p-8 space-y-6">

                    {/* ── Event header ─────────────────────────────────────────── */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-[#FF3B57]" />
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#FF708A]">
                                    Official Event
                                </p>
                                {event.hasActiveVoting && (
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-[#FF3B57] animate-ping" />
                                )}
                            </div>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter text-slate-900 italic leading-none">
                                {event.name}
                            </h2>
                        </div>
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className={cn(
                                "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all",
                                expanded
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white/60 text-slate-500 border-white hover:bg-white"
                            )}
                        >
                            <ChevronDown className={cn("size-5 transition-transform duration-300", expanded && "rotate-180")} />
                        </button>
                    </div>

                    {/* ── Nominations pills ────────────────────────────────────── */}
                    {event.nominations.length > 0 && (
                        <div className="space-y-2.5">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Nominations</p>
                            <div className="flex flex-wrap gap-2">
                                {event.nominations.map((nom) => (
                                    <span
                                        key={nom}
                                        className="flex items-center gap-1.5 rounded-xl bg-white/70 border border-white px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-700 shadow-sm"
                                    >
                                        <Trophy className="size-3 text-amber-400 shrink-0" />
                                        {nom}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── App switcher tabs ────────────────────────────────────── */}
                    {event.apps.length > 1 && (
                        <div className="space-y-2.5">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
                                Voting Platforms ({event.apps.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {event.apps.map((app, idx) => {
                                    const isSelected = idx === selectedAppIdx
                                    return (
                                        <button
                                            key={app.id}
                                            onClick={() => {
                                                setSelectedAppIdx(idx)
                                                setIsGuideOpen(false)
                                            }}
                                            className={cn(
                                                "flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-[11px] font-black uppercase tracking-wider transition-all",
                                                isSelected
                                                    ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                                                    : "bg-white/60 border-white text-slate-600 hover:bg-white hover:shadow-sm"
                                            )}
                                        >
                                            <AppIcon imageSrc={app.iconImageSrc} name={app.name} size="sm" />
                                            {app.name}
                                            {app.isActiveNow && (
                                                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── Selected app panel ───────────────────────────────────── */}
                    <div className="rounded-[2rem] border border-white/60 bg-white/50 p-5 space-y-4 transition-all duration-300">
                        {/* App header + voting period */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <AppIcon imageSrc={selectedApp.iconImageSrc} name={selectedApp.name} />
                                <div>
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <h3 className="text-2xl font-black tracking-tighter text-slate-900 uppercase leading-none italic">
                                            {selectedApp.name}
                                        </h3>
                                        {selectedApp.isActiveNow && (
                                            <span className="flex h-2 w-2 rounded-full bg-[#FF3B57] animate-ping" />
                                        )}
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                                        <AppStatusBadge app={selectedApp} />
                                        {selectedApp.activeRound && (
                                            <span className="text-[9px] font-bold text-[#FF708A] uppercase tracking-[0.2em] opacity-80">
                                                • {selectedApp.activeRound.round_name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {selectedApp.activeRound && (
                                <div className="rounded-2xl border border-white/60 bg-white/50 px-5 py-4 shadow-sm backdrop-blur-sm shrink-0">
                                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1 flex items-center gap-1.5">
                                        <Clock className="size-2.5" /> Voting Period
                                    </p>
                                    <p className="text-[12px] font-bold whitespace-nowrap">
                                        {formatDateTime(selectedApp.activeRound.start_at, timeZone)}
                                        <span className="mx-1 text-slate-400">—</span>
                                        {formatDateTime(selectedApp.activeRound.end_at, timeZone)}
                                        <span className="ml-2 text-[#FF708A] font-black uppercase tracking-widest text-[9px]">
                                            {timeZone}
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Event nominations / app awards / description */}
                        {(event.nominations.length > 0 || appAwards.length > 0 || selectedApp.description) && (
                            <div className="rounded-2xl bg-white/40 border border-white p-4">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                    {event.nominations.length > 0
                                        ? "Nominations"
                                        : appAwards.length > 0
                                            ? "Awards in this app"
                                            : "Description"}
                                </p>
                                {event.nominations.length > 0 ? (
                                    <ul className="mt-1 space-y-1.5 text-[13px] font-bold text-slate-700 leading-relaxed italic">
                                        {event.nominations.map((nom, index) => (
                                            <li key={`${nom}-${index}`} className="flex items-start gap-2">
                                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#FF708A] shrink-0" />
                                                {nom}
                                            </li>
                                        ))}
                                    </ul>
                                ) : appAwards.length > 0 ? (
                                    <ul className="mt-1 space-y-1.5 text-[13px] font-bold text-slate-700 leading-relaxed italic">
                                        {appAwards.map((award, index) => (
                                            <li key={`${award}-${index}`} className="flex items-start gap-2">
                                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#FF708A] shrink-0" />
                                                {award}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-[13px] font-bold text-slate-700 leading-relaxed italic">
                                        {selectedApp.description}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* App-specific naming and awards removed based on user feedback */}
                    </div>

                    {/* ── Expandable: reflection rate + currencies/collection/strategy ── */}
                    <div
                        className={cn(
                            "grid transition-all duration-500 ease-in-out",
                            expanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                        )}
                    >
                        <div className="space-y-6 pt-2">
                            {/* Reflection rate (event-level) */}
                            {event.reflection_rate && event.reflection_rate.length > 0 && (
                                <div className="rounded-[2rem] border border-white/60 bg-white/30 p-7 shadow-sm">
                                    <p className="text-[10px] font-black text-[#FF708A] uppercase tracking-[0.3em] mb-5 flex items-center gap-2">
                                        <Sparkles className="size-3" /> Reflection Rate
                                    </p>
                                    <ul className="space-y-3 text-[13px] font-semibold text-slate-700 italic opacity-80">
                                        {event.reflection_rate
                                            .filter((r) => r && String(r).trim().length > 0)
                                            .map((rate, idx) => (
                                                <li key={idx} className="flex items-start gap-2.5">
                                                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                                                    {rate}
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                            )}

                            {/* Currencies / Collection / Strategy grid */}
                            <div className="grid gap-6 lg:grid-cols-3">
                                <div className="rounded-[2rem] border border-white/60 bg-white/30 p-7 shadow-sm">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF708A] mb-5">Currencies</p>
                                    {currencyItems.length === 0 ? (
                                        <p className="text-slate-400 text-[12px] font-medium italic">No data.</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {currencyItems.map((item) => (
                                                <span
                                                    key={item}
                                                    className="rounded-xl bg-white border border-white px-4 py-2 text-[12px] font-bold text-slate-700 shadow-sm"
                                                >
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-[2rem] border border-white/60 bg-white/30 p-7 shadow-sm">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-5">Collection</p>
                                    {collectItems.length === 0 ? (
                                        <p className="text-slate-400 text-[12px] font-medium italic">No data.</p>
                                    ) : (
                                        <ul className="space-y-3 text-[13px] font-semibold text-slate-700 italic opacity-80">
                                            {collectItems.map((item) => (
                                                <li key={item} className="flex items-start gap-2.5">
                                                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#FF708A] shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div className="rounded-[2rem] border border-white/60 bg-white/30 p-7 shadow-sm">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-5">Strategy</p>
                                    {strategyItems.length === 0 ? (
                                        <p className="text-slate-400 text-[12px] font-medium italic">No strategies yet.</p>
                                    ) : (
                                        <ul className="space-y-3 text-[13px] font-semibold text-slate-700 italic opacity-80">
                                            {strategyItems.map((item, i) => (
                                                <li key={i} className="flex items-start gap-2.5">
                                                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Footer: links + actions ──────────────────────────────── */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/50 pt-6">
                        {/* Download links for selected app */}
                        <div className="flex gap-3 items-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1">links:</p>
                            {selectedApp.androidHref && (
                                <a
                                    href={selectedApp.androidHref}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-3.5 rounded-2xl bg-white border border-white text-[#FF708A] shadow-sm transition-all hover:-translate-y-1"
                                    title="Android App"
                                >
                                    <Smartphone className="size-5" />
                                </a>
                            )}
                            {selectedApp.iosHref && (
                                <a
                                    href={selectedApp.iosHref}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-3.5 rounded-2xl bg-white border border-white text-[#FF708A] shadow-sm transition-all hover:-translate-y-1"
                                    title="iOS App"
                                >
                                    <Smartphone className="size-5" />
                                </a>
                            )}
                            {selectedApp.websiteHref && (
                                <a
                                    href={selectedApp.websiteHref}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-3.5 rounded-2xl bg-white border border-white text-[#FF708A] shadow-sm transition-all hover:-translate-y-1"
                                    title="Website"
                                >
                                    <Globe className="size-5" />
                                </a>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className={cn(
                                    "flex items-center gap-3 px-7 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg",
                                    expanded
                                        ? "bg-[#0F172A] text-white"
                                        : "bg-white border border-white text-slate-500 hover:bg-slate-50"
                                )}
                            >
                                {expanded ? "Hide Details" : "Show Details"}
                                <ChevronDown className={cn("size-4 transition-transform", expanded && "rotate-180")} />
                            </button>

                            {/* Guide button: URL → external link, no URL → modal */}
                            {selectedApp.guideUrl ? (
                                <a
                                    href={selectedApp.guideUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-3 rounded-2xl bg-[#FF3B57] px-8 py-4 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-pink-100 hover:bg-[#FF2B4A] transition-all hover:scale-105 active:scale-95"
                                >
                                    <ExternalLink className="size-4" />
                                    View {selectedApp.name} Guide
                                </a>
                            ) : (
                                <button
                                    onClick={() => setIsGuideOpen(true)}
                                    className="flex items-center gap-3 rounded-2xl bg-[#FF3B57] px-8 py-4 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-pink-100 hover:bg-[#FF2B4A] transition-all hover:scale-105 active:scale-95"
                                >
                                    <BookOpen className="size-4" />
                                    View {selectedApp.name} Guide
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Guide modal — only if no external URL */}
            {!selectedApp.guideUrl && (
                <GuideModal
                    isOpen={isGuideOpen}
                    onClose={() => setIsGuideOpen(false)}
                    app={selectedApp}
                />
            )}
        </div>
    )
}
