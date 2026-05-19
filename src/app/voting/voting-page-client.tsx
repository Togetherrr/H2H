"use client"

import Image from "next/image"
import { useAwardEvents } from "@/hooks/useAwardEvents"
import { AwardEventCard } from "@/components/award-event-card"
import { useState } from "react"
import {
  BookOpen,
  Smartphone,
  Copy,
  Sparkles,
  CheckCircle2,
  LayoutGrid,
  ChevronRight,
  Loader2,
  AlertCircle,
  Clock,
  Trophy,
  X,
  Globe,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { type VotingAppCategoryId } from "@/lib/voting-guide"
import { cn } from "@/lib/utils"
import { t } from "@/i18n/translations"
import { useVotingApps, type MappedApp } from "@/hooks/useVotingApps"
import { useTimeZoneStore } from "@/lib/timezone-store"
import { formatDateTime, formatDateOnly } from "@/lib/timezone"

const CATEGORIES = [
  { id: "music_shows", active: "bg-sky-100/80 text-sky-600 border-sky-200" },
  { id: "awards", active: "bg-amber-100/80 text-amber-600 border-amber-200" },
  { id: "birthday", active: "bg-violet-100/80 text-violet-600 border-violet-200" },
  { id: "stream_support", active: "bg-emerald-100/80 text-emerald-600 border-emerald-200" },
] as const

function AppIcon({ imageSrc, name }: { imageSrc?: string; name: string }) {
  if (imageSrc) {
    return (
      <Image
        src={imageSrc}
        alt={name}
        width={48}
        height={48}
        className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white shadow-md"
      />
    )
  }
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFC2D1] to-[#A2D2FF] text-[13px] font-black uppercase text-white shadow-md ring-2 ring-white">
      {name.slice(0, 2).toUpperCase()}
    </div>
  )
}

function GuideModal({
  isOpen,
  onClose,
  app
}: {
  isOpen: boolean;
  onClose: () => void;
  app: MappedApp
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
                {app.badge} • Follow steps below
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
                      <div className="relative group/img overflow-hidden rounded-[2.5rem] border-4 border-white shadow-2xl shadow-slate-200/50 transition-transform duration-500 hover:scale-[1.02]">
                        <Image
                          src={step.image_url}
                          alt={step.title || "Guide image"}
                          width={800}
                          height={1200}
                          className="w-full h-auto object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <BookOpen className="size-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold italic">No guide steps available for this app.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function VotingAppCard({ app }: { app: MappedApp }) {
  const [expanded, setExpanded] = useState(false)
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const timeZone = useTimeZoneStore((s) => s.timeZone)

  const isMnet = app.name?.toUpperCase() === "MNET PLUS"
  const isAwardApp = app.categoryId === "awards"
  const activeRound = app.rounds?.find((round) => round.is_active)
  const now = new Date()
  const isCurrentlyVoting =
    activeRound &&
    now >= new Date(activeRound.start_at) &&
    now <= new Date(activeRound.end_at)

  const currencyItems = app.sections.find((section) => section.title === "currencies")?.items ?? []
  const collectItems = app.sections.find((section) => section.title === "collection")?.items ?? []
  const strategyItems = app.sections.find((section) => section.title === "strategy")?.items ?? []

  return (
    <div id={`app-${app.id}`} className="reveal-up group relative">
      <div
        className={cn(
          "card-premium !rounded-[2.5rem] !p-0 overflow-hidden border border-white/60 transition-all duration-500",
          isMnet ? "!bg-[#FFE4E9]" : (isAwardApp ? "!bg-[#FFEBF0]" : "!bg-white/40 backdrop-blur-md shadow-sm")
        )}
      >
        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-5">
              <AppIcon imageSrc={app.iconImageSrc} name={app.name} />
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black tracking-tighter text-slate-900 uppercase leading-none italic">
                    {app.name}
                  </h3>
                  {isCurrentlyVoting && (
                    <span className="flex h-2 w-2 rounded-full bg-[#FF3B57] animate-ping" />
                  )}
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] border transition-colors",
                      isMnet || isAwardApp
                        ? "bg-white/60 text-[#FF5A78] border-[#FFD1D9]"
                        : "bg-white/60 text-slate-500 border-white"
                    )}
                  >
                    {app.badge}
                  </span>
                  {(() => {
                    const now = new Date();
                    const activeRound = app.rounds.find(r => r.is_active && now >= new Date(r.start_at) && now <= new Date(r.end_at));
                    const futureRound = app.rounds.find(r => r.is_active && now < new Date(r.start_at));
                    const pastRound = app.rounds.length > 0 && !activeRound && !futureRound;

                    if (activeRound) {
                      return (
                        <div className="flex items-center gap-1.5 rounded-lg bg-green-500/10 px-2 py-0.5 text-green-600 border border-green-500/20">
                          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                          <p className="text-[9px] font-black uppercase tracking-widest italic leading-none">Active</p>
                        </div>
                      );
                    }
                    if (futureRound) {
                      return (
                        <div className="flex items-center gap-1.5 rounded-lg bg-sky-500/10 px-2 py-0.5 text-sky-600 border border-sky-500/20">
                          <div className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                          <p className="text-[9px] font-black uppercase tracking-widest italic leading-none">Coming Soon</p>
                        </div>
                      );
                    }
                    if (pastRound) {
                      return (
                        <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2 py-0.5 text-slate-400 border border-slate-200">
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                          <p className="text-[9px] font-black uppercase tracking-widest italic leading-none">Ended</p>
                        </div>
                      );
                    }
                    return (
                      <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2 py-0.5 text-slate-500 border border-slate-200">
                        <CheckCircle2 className="size-3" />
                        <p className="text-[9px] font-black uppercase tracking-widest italic leading-none">Official App</p>
                      </div>
                    );
                  })()}
                  {activeRound && (
                    <span className="text-[9px] font-bold text-[#FF708A] uppercase tracking-[0.2em] opacity-80">
                      • {activeRound.round_name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {activeRound && (
              <div className="rounded-2xl border border-white/60 bg-white/50 px-5 py-4 text-slate-700 shadow-sm backdrop-blur-sm">
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1">voting period</p>
                <p className="text-[12px] font-bold whitespace-nowrap">
                  {formatDateTime(activeRound.start_at, timeZone)} — {formatDateTime(activeRound.end_at, timeZone)}
                  <span className="ml-2 text-[#FF708A] font-black uppercase tracking-widest text-[9px]">
                    {timeZone}
                  </span>
                </p>
              </div>
            )}
          </div>

          <div
            className={cn(
              "grid transition-all duration-500 ease-in-out",
              expanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
            )}
          >
            <div className="pt-8 space-y-8">
              {isAwardApp && app.ceremony_at && activeRound && (
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#FF708A] to-[#FF3B57] p-6 text-white shadow-lg">
                  <div className="absolute right-0 top-0 size-32 bg-white/10 blur-2xl rounded-full -mr-10 -mt-10" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <Trophy className="size-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-pink-100">official ceremony time</p>
                        <p className="text-xl md:text-2xl font-black uppercase tracking-tighter">
                          {formatDateTime(app.ceremony_at, timeZone)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(app.description || (app.reflection_rate && app.reflection_rate.length > 0)) && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {app.description && (
                    <div className="rounded-2xl bg-white/40 border border-white p-5 shadow-sm">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Description</p>
                      {(() => {
                        const lines = String(app.description)
                          .split(/\r?\n/)
                          .map((line) => line.trim())
                          .filter(Boolean)

                        // Prefer a list when multiple lines exist; otherwise keep the original rendering
                        // but preserve any embedded newlines from older/hand-edited content.
                        if (lines.length <= 1) {
                          return (
                            <p className="text-[13px] font-bold text-slate-700 leading-relaxed italic whitespace-pre-line">
                              {String(app.description)}
                            </p>
                          )
                        }

                        return (
                          <ul className="mt-1 space-y-2 text-[13px] font-bold text-slate-700 leading-relaxed italic">
                            {lines.map((line, idx) => (
                              <li key={idx} className="flex items-start gap-2.5">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#FF708A] shrink-0" />
                                <span className="whitespace-pre-line">{line}</span>
                              </li>
                            ))}
                          </ul>
                        )
                      })()}
                    </div>
                  )}
                  {app.reflection_rate && app.reflection_rate.length > 0 && (
                    <div className="rounded-[2rem] border border-white/60 bg-white/30 p-7 shadow-sm">
                      <p className="text-[10px] font-black text-[#FF708A] uppercase tracking-[0.3em] mb-5 flex items-center gap-2">
                        <Sparkles className="size-3" /> Reflection Rate
                      </p>
                      <ul className="space-y-3 text-[13px] font-semibold text-slate-700 italic opacity-80">
                        {(() => {
                          const rawRate = app.reflection_rate as any;
                          let rates: string[] = [];

                          if (Array.isArray(rawRate)) {
                            rates = rawRate;
                          } else if (typeof rawRate === 'string') {
                            const trimmed = rawRate.trim();
                            if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                              try {
                                const parsed = JSON.parse(trimmed);
                                rates = Array.isArray(parsed) ? parsed : [trimmed];
                              } catch (e) {
                                rates = [trimmed];
                              }
                            } else {
                              rates = [trimmed];
                            }
                          }

                          return rates
                            .filter(rate => rate && String(rate).trim().length > 0)
                            .map((rate, idx) => (
                              <li key={idx} className="flex items-start gap-2.5">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                                <span>{rate}</span>
                              </li>
                            ));
                        })()}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-[2rem] border border-white/60 bg-white/30 p-7 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF708A] mb-5">Currencies</p>
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
                </div>

                <div className="rounded-[2rem] border border-white/60 bg-white/30 p-7 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-5">Collection</p>
                  <ul className="space-y-3 text-[13px] font-semibold text-slate-700 italic opacity-80">
                    {collectItems.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#FF708A] shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[2rem] border border-white/60 bg-white/30 p-7 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-5">Strategy</p>
                  <ul className="space-y-3 text-[13px] font-semibold text-slate-700 italic opacity-80">
                    {strategyItems.length === 0 ? (
                      <li className="text-slate-400 font-medium">No strategies yet.</li>
                    ) : (
                      strategyItems.map((item, index) => (
                        <li key={index} className="flex items-start gap-2.5">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-white/60 pt-8">
            <div className="flex gap-4 items-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1">links:</p>
              {app.androidHref && (
                <a
                  href={app.androidHref}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 rounded-2xl bg-white border border-white text-[#FF708A] shadow-sm transition-all hover:-translate-y-1"
                  title="Android App"
                >
                  <Smartphone className="size-5" />
                </a>
              )}
              {app.iosHref && (
                <a
                  href={app.iosHref}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 rounded-2xl bg-white border border-white text-[#FF708A] shadow-sm transition-all hover:-translate-y-1"
                  title="iOS App"
                >
                  <Smartphone className="size-5" />
                </a>
              )}
              {app.websiteHref && (
                <a
                  href={app.websiteHref}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 rounded-2xl bg-white border border-white text-[#FF708A] shadow-sm transition-all hover:-translate-y-1"
                  title="Website"
                >
                  <Globe className="size-5" />
                </a>
              )}
            </div>

            <div className="flex items-center gap-4">
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
                <ChevronRight className={cn("size-4 transition-transform", expanded && "rotate-90")} />
              </button>

              <button
                onClick={() => setIsGuideOpen(true)}
                className="flex items-center gap-3 rounded-2xl bg-[#FF3B57] px-8 py-4 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-pink-100 hover:bg-[#FF2B4A] transition-all hover:scale-105 active:scale-95"
              >
                <BookOpen className="size-4" /> View Guide
              </button>
            </div>
          </div>
        </div>
      </div>

      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        app={app}
      />
    </div>
  )
}


function Skeleton() {
  return (
    <div className="card-premium !rounded-[2.5rem] !bg-white/40 border border-white/60 p-8 animate-pulse">
      <div className="h-6 w-40 rounded-xl bg-white/60" />
      <div className="mt-6 grid gap-3">
        <div className="h-4 w-full rounded-lg bg-white/60" />
        <div className="h-4 w-5/6 rounded-lg bg-white/60" />
        <div className="h-4 w-2/3 rounded-lg bg-white/60" />
      </div>
    </div>
  )
}
// Thay thế toàn bộ function VotingPageClient() trong voting-page-client.tsx bằng đoạn này.
// Phần còn lại của file (AppIcon, GuideModal, VotingAppCard, Skeleton) giữ nguyên.
//
// Thêm 2 import sau vào đầu file:
//   import { useAwardEvents } from "@/hooks/useAwardEvents"
//   import { AwardEventCard } from "@/components/voting/AwardEventCard"

export function VotingPageClient() {
  const [activeTab, setActivetab] = useState<"guide" | "tracking">("guide")
  const [activeCategoryId, setActiveCategoryId] = useState<VotingAppCategoryId>("music_shows")

  // ── hooks (luôn gọi cả 2 — không được gọi conditional) ──────────────────
  // Hook cũ: dùng cho music_shows, birthday, stream_support
  const { apps, loading: appsLoading, error: appsError } = useVotingApps(activeCategoryId)
  // Hook mới: dùng riêng cho awards tab
  const { events, loading: eventsLoading, error: eventsError } = useAwardEvents()

  const isAwards = activeCategoryId === "awards"
  const loading = isAwards ? eventsLoading : appsLoading
  const error = isAwards ? eventsError : appsError
  // ────────────────────────────────────────────────────────────────────────

  const scrollToItem = (id: string) => {
    // Awards dùng id "event-{id}", các tab khác dùng "app-{id}"
    const elementId = isAwards ? `event-${id}` : `app-${id}`
    const element = document.getElementById(elementId)
    if (!element) return
    element.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="mt-16 space-y-12">
      <div className="flex gap-3 justify-center">
        {(["guide", "tracking"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActivetab(tab)}
            className={cn(
              "rounded-2xl px-8 py-4 text-[11px] font-black uppercase tracking-widest transition-all",
              activeTab === tab
                ? "bg-[#FF3B57] text-white shadow-xl shadow-pink-100 scale-105"
                : "bg-white/40 border border-white/60 text-slate-600 hover:bg-white/60"
            )}
          >
            {tab === "guide" ? t("voting.guide") : t("voting.tracking")}
          </button>
        ))}
      </div>

      {activeTab === "guide" ? (
        <div className="space-y-12">
          <div className="flex flex-wrap gap-2.5 justify-center">
            {CATEGORIES.map((category) => {
              const isActive = activeCategoryId === category.id
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategoryId(category.id)}
                  className={cn(
                    "rounded-2xl border px-6 py-4 text-[11px] font-black uppercase tracking-widest transition-all",
                    isActive
                      ? `${category.active} shadow-lg shadow-pink-100 scale-105`
                      : "bg-white/40 border-white/60 text-slate-500 hover:bg-white/60"
                  )}
                >
                  {t(`voting.category.${category.id}`)}
                </button>
              )
            })}
          </div>

          {["birthday", "stream_support"].includes(activeCategoryId) ? (
            <div className="card-premium !p-20 text-center !bg-white/40 backdrop-blur-md border border-white/60 rounded-[3rem] reveal-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm mb-8">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
                <p className="text-slate-600 font-black uppercase tracking-widest text-[9px]">Future Phase</p>
              </div>
              <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-slate-900 italic leading-none">
                {activeCategoryId === "birthday" ? "Birthday Events" : "Vote Donate"}
              </h3>
              <p className="text-slate-500 font-bold italic opacity-60 text-lg max-w-xl mx-auto leading-relaxed">
                {activeCategoryId === "birthday"
                  ? "Birthday and anniversary support campaigns will appear here in the next era. Stay tuned for official birthday goals!"
                  : "Community donation projects for voting support are currently being organized. This section will open when donation channels are finalized."}
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50/60 px-5 py-4 text-red-600">
                  <AlertCircle className="size-5 shrink-0" />
                  <p className="text-sm font-medium">lỗi khi tải dữ liệu: {error}</p>
                </div>
              )}

              {!error && (
                <div className="card-premium !rounded-[2.5rem] !bg-white/40 border border-white/60 p-8 lg:p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white shadow-lg">
                      <LayoutGrid className="size-5" />
                    </div>
                    <h4 className="text-[16px] font-black uppercase tracking-tighter text-slate-900 leading-none">
                      {isAwards ? "active campaigns" : "apps directory"}
                    </h4>
                    {loading && <Loader2 className="size-4 animate-spin text-[#FF708A]" />}
                  </div>

                  {loading ? (
                    <div className="flex gap-3 flex-wrap">
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="h-10 w-28 rounded-xl bg-white/60 animate-pulse" />
                      ))}
                    </div>
                  ) : isAwards ? (
                    // Awards: quick-nav bằng event
                    <div className="flex flex-wrap gap-3">
                      {events.map((event) => (
                        <button
                          key={event.id}
                          onClick={() => scrollToItem(event.id)}
                          className="flex items-center gap-3 rounded-xl border border-white bg-white/60 px-5 py-3 text-[12px] font-bold text-slate-700 transition hover:bg-[#FFC2D1]/20 hover:border-[#FFC2D1]/60 hover:shadow-sm"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                          {event.name}
                          {event.hasActiveVoting && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#FF3B57] animate-ping" />
                          )}
                        </button>
                      ))}
                      {events.length === 0 && !loading && (
                        <p className="text-slate-400 text-sm font-medium italic">No active award events at this time.</p>
                      )}
                    </div>
                  ) : (
                    // Music shows / other: quick-nav bằng app (logic cũ)
                    <div className="flex flex-wrap gap-3">
                      {apps.map((app) => (
                        <button
                          key={app.id}
                          onClick={() => scrollToItem(app.id)}
                          className="flex items-center gap-3 rounded-xl border border-white bg-white/60 px-5 py-3 text-[12px] font-bold text-slate-700 transition hover:bg-[#FFC2D1]/20 hover:border-[#FFC2D1]/60 hover:shadow-sm"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-[#FF708A]" />
                          {app.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="grid gap-10">
                {loading ? (
                  [1, 2].map((item) => <Skeleton key={item} />)
                ) : isAwards ? (
                  // ── Awards: dùng AwardEventCard (multi-app, multi-nomination) ──
                  events.map((event) => (
                    <AwardEventCard key={event.id} event={event} />
                  ))
                ) : (
                  // ── Music shows / other: logic cũ (dedup by name) ──────────────
                  (() => {
                    const uniqueAppsMap = new Map<string, MappedApp>()
                    const now = new Date()

                    apps.forEach((app) => {
                      const key = app.name.toLowerCase().trim()
                      const existing = uniqueAppsMap.get(key)

                      const hasActiveRound = app.rounds.some(
                        (r) => r.is_active && now >= new Date(r.start_at) && now <= new Date(r.end_at)
                      )

                      if (!existing) {
                        uniqueAppsMap.set(key, app)
                      } else {
                        const existingHasActive = existing.rounds.some(
                          (r) => r.is_active && now >= new Date(r.start_at) && now <= new Date(r.end_at)
                        )
                        if (hasActiveRound && !existingHasActive) {
                          uniqueAppsMap.set(key, app)
                        } else if (hasActiveRound === existingHasActive) {
                          if (app.id > existing.id) uniqueAppsMap.set(key, app)
                        }
                      }
                    })

                    return Array.from(uniqueAppsMap.values()).map((app) => (
                      <VotingAppCard key={app.id} app={app} />
                    ))
                  })()
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="card-premium !p-20 text-center !bg-white/40 backdrop-blur-md border border-white/60 rounded-[3rem]">
          <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 text-slate-900 italic">stay tuned</h3>
          <p className="text-slate-500 font-medium italic opacity-60">
            tracking features are under development and will be available in the next update.
          </p>
        </div>
      )}
    </div>
  )
}