"use client"

/* eslint-disable @next/next/no-img-element */

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
} from "lucide-react"
import { type VotingAppCategoryId } from "@/lib/voting-guide"
import { cn } from "@/lib/utils"
import { t } from "@/i18n/translations"
import { useVotingApps, type MappedApp } from "@/hooks/useVotingApps"

const CATEGORIES = [
  { id: "music_shows", active: "bg-sky-100/80 text-sky-600 border-sky-200" },
  { id: "awards", active: "bg-amber-100/80 text-amber-600 border-amber-200" },
  { id: "birthday", active: "bg-violet-100/80 text-violet-600 border-violet-200" },
  { id: "stream_support", active: "bg-emerald-100/80 text-emerald-600 border-emerald-200" },
] as const

function AppIcon({ imageSrc, name }: { imageSrc?: string; name: string }) {
  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={name}
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

function VotingAppCard({ app }: { app: MappedApp }) {
  const [expanded, setExpanded] = useState(false)

  const isMnet = app.name?.toUpperCase() === "MNET PLUS"
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
          isMnet ? "!bg-[#FFE4E9]" : "!bg-white/40 backdrop-blur-md shadow-sm"
        )}
      >
        <button
          onClick={() => setExpanded((value) => !value)}
          className="flex w-full items-center justify-between p-6 text-left transition hover:bg-white/20"
        >
          <div className="flex items-center gap-5">
            <AppIcon imageSrc={app.iconImageSrc} name={app.name} />
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-black tracking-tighter text-slate-900 uppercase leading-none">
                  {app.name}
                </h3>
                {isCurrentlyVoting && (
                  <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
                )}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] border transition-colors",
                    isMnet
                      ? "bg-[#FFEDF0] text-[#FF5A78] border-[#FFD1D9]"
                      : "bg-white/60 text-slate-500 border-white"
                  )}
                >
                  {app.badge}
                </span>
                {activeRound && (
                  <span className="text-[9px] font-bold text-[#FF708A] uppercase tracking-[0.2em] opacity-80">
                    • {activeRound.round_name}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border border-white bg-white/80 text-slate-400 transition-all duration-500 shadow-sm",
              expanded && (isMnet ? "rotate-90 text-[#FF5A78]" : "rotate-90 text-slate-900")
            )}
          >
            <ChevronRight className="size-5" />
          </div>
        </button>

        <div
          className={cn(
            "grid transition-all duration-500 ease-in-out",
            expanded ? "max-h-[1500px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          )}
        >
          <div className="p-8 pt-0 space-y-8">
            {activeRound && (
              <div className="rounded-[2rem] bg-white/50 border border-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-[#FF708A] shadow-sm">
                    <Clock className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">voting period</p>
                    <p className="text-[13px] font-bold text-slate-700">
                      {new Date(activeRound.start_at).toLocaleDateString()} -
                      {" "}
                      {new Date(activeRound.end_at).toLocaleDateString()}
                      <span className="ml-2 text-slate-400 font-medium">
                        ({activeRound.display_timezone || "KST"})
                      </span>
                    </p>
                  </div>
                </div>
                {isCurrentlyVoting ? (
                  <div className="px-5 py-2 rounded-xl bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-100">
                    vote active now
                  </div>
                ) : (
                  <div className="px-5 py-2 rounded-xl bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-200">
                    scheduled
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-10">
              <div className="w-full lg:w-1/3 space-y-7">
                <div className="space-y-4">
                  <p className="text-[12px] font-black uppercase tracking-[0.3em] text-[#FF708A] flex items-center gap-2">
                    <Sparkles className="size-3.5" /> Currencies
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {currencyItems.map((item) => (
                      <span
                        key={item}
                        className="px-4 py-2 rounded-xl bg-white border border-white text-[14px] font-bold text-slate-700 shadow-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-5 border-t border-white/60">
                  <p className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                    <CheckCircle2 className="size-4" /> Collection
                  </p>
                  <ul className="space-y-4 pl-1">
                    {collectItems.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-[15px] font-semibold text-slate-600 leading-relaxed italic"
                      >
                        <div className="mt-3 h-1.5 w-1.5 rounded-full bg-[#FFC2D1] shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div
                className={cn(
                  "w-full lg:w-2/3 rounded-[2rem] border border-white/60 p-7 lg:p-9 backdrop-blur-sm",
                  isMnet ? "bg-white/40" : "bg-white/20"
                )}
              >
                <p className="text-[12px] font-black uppercase tracking-[0.35em] text-slate-800 mb-6 flex items-center gap-3">
                  <span className="h-px w-10 bg-[#FF708A]" /> Strategy & Schedule
                </p>
                <div className="grid gap-5">
                  {strategyItems.map((item, index) => (
                    <div
                      key={`${app.id}-${index}`}
                      className="group/item flex items-center justify-between gap-5 rounded-2xl border border-white bg-white/70 p-6 transition hover:bg-white hover:shadow-md"
                    >
                      <div className="flex items-center gap-5">
                        <span className="text-2xl font-black text-[#FFC2D1] italic">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <p className="text-[16px] font-semibold text-slate-800 leading-snug">{item}</p>
                      </div>
                      <Copy
                        className="size-5 text-slate-300 group-hover/item:text-[#FF708A] transition-colors shrink-0 cursor-pointer"
                        onClick={() => navigator.clipboard.writeText(item)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/60 pt-8">
              <div className="flex gap-2.5 pl-1">
                {app.androidHref && (
                  <a
                    href={app.androidHref}
                    target="_blank"
                    rel="noreferrer"
                    title="Android"
                    className="p-3 rounded-2xl bg-white border border-white text-slate-400 hover:text-[#FF708A] shadow-sm transition-all hover:-translate-y-1 hover:border-[#FFEDF0]"
                  >
                    <Smartphone className="size-5" />
                  </a>
                )}
                {app.iosHref && (
                  <a
                    href={app.iosHref}
                    target="_blank"
                    rel="noreferrer"
                    title="iOS"
                    className="p-3 rounded-2xl bg-white border border-white text-slate-400 hover:text-[#FF708A] shadow-sm transition-all hover:-translate-y-1 hover:border-[#FFEDF0]"
                  >
                    <Smartphone className="size-5" />
                  </a>
                )}
              </div>

              <button
                className="flex items-center gap-3 rounded-2xl bg-[#FF3B57] px-8 py-4 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-pink-100 hover:bg-[#FF2B4A] transition-all hover:scale-105 active:scale-95"
              >
                <BookOpen className="size-4" /> View Guide
              </button>
            </div>
          </div>
        </div>
      </div>
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

export function VotingPageClient() {
  const [activeTab, setActiveTab] = useState<"guide" | "tracking">("guide")
  const [activeCategoryId, setActiveCategoryId] = useState<VotingAppCategoryId>("music_shows")
  const { apps, loading, error } = useVotingApps(activeCategoryId)

  const scrollToApp = (id: string) => {
    const element = document.getElementById(`app-${id}`)
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
            onClick={() => setActiveTab(tab)}
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
                  apps directory
                  {!loading && <span className="ml-2.5 text-[#FF708A] opacity-40">/ {apps.length}</span>}
                </h4>
                {loading && <Loader2 className="size-4 animate-spin text-[#FF708A]" />}
              </div>

              {loading ? (
                <div className="flex gap-3 flex-wrap">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-10 w-28 rounded-xl bg-white/60 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {apps.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => scrollToApp(app.id)}
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
            {loading
              ? [1, 2].map((item) => <Skeleton key={item} />)
              : apps.map((app) => <VotingAppCard key={app.id} app={app} />)}
          </div>
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