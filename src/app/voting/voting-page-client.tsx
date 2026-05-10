"use client"

import Image from "next/image"
import { useState } from "react"
import {
  BookOpen, Smartphone, Copy, Sparkles,
  CheckCircle2, LayoutGrid, ChevronRight,
  Loader2, AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useVotingApps, type MappedApp } from "@/hooks/useVotingApps"

// ─── categories (id phải khớp với giá trị trong database) ──────────

const CATEGORIES = [
  { id: "music_shows",    label: "Music Shows",  active: "bg-sky-100/80 text-sky-600 border-sky-200" },
  { id: "awards",         label: "Awards",       active: "bg-amber-100/80 text-amber-600 border-amber-200" },
  { id: "birthday",       label: "Anniversary",  active: "bg-violet-100/80 text-violet-600 border-violet-200" },
  { id: "stream_support", label: "Support",      active: "bg-emerald-100/80 text-emerald-600 border-emerald-200" },
] as const

type CategoryId = (typeof CATEGORIES)[number]["id"]

// ─── appicon ─────────────────────────────────────────────────────────────────

function AppIcon({ imageSrc, name }: { imageSrc?: string; name: string }) {
  return (
    <div className="relative group-hover:scale-105 transition-transform duration-500">
      <div className="h-16 w-16 rounded-[2rem] bg-gradient-to-br from-[#FFC2D1] to-[#A2D2FF] p-[2px] shadow-sm">
        <div className="relative flex h-full w-full items-center justify-center rounded-[1.9rem] bg-white overflow-hidden">
          {imageSrc ? (
            <Image 
              src={imageSrc.startsWith('http') ? imageSrc : `/${imageSrc}`} 
              alt={name} 
              fill 
              className="object-cover" 
              unoptimized
            />
          ) : (
            <span className="text-lg font-black text-[#FF708A]">
              {name.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
      </div>
      <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[#FF708A] border-4 border-white shadow-sm" />
    </div>
  )
}

// ─── votingappcard ────────────────────────────────────────────────────────────

function VotingAppCard({ app }: { app: MappedApp }) {
  const [expanded, setExpanded] = useState(true)

  // nhận diện mnet plus để đổi sang màu hồng cinematic
  const is_mnet = app.name?.toUpperCase() === "MNET PLUS";

  // trích xuất dữ liệu từ các sections mà hook usevotingapps đã xử lý
  const currency_items = app.sections.find((s) => s.title === "currencies")?.items || [];
  const collect_items  = app.sections.find((s) => s.title === "collection")?.items || [];
  const strategy_items = app.sections.find((s) => s.title === "strategy")?.items || [];

  return (
    <div id={`app-${app.id}`} className="reveal-up group relative">
      <div className={cn(
        "card-premium !rounded-[2.5rem] !p-0 overflow-hidden border border-white/60 transition-all duration-500",
        is_mnet ? "!bg-[#FFE4E9]" : "!bg-white/40 backdrop-blur-md shadow-sm"
      )}>

        {/* header */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between p-6 text-left transition hover:bg-white/20"
        >
          <div className="flex items-center gap-5">
            <AppIcon imageSrc={app.iconImageSrc} name={app.name} />
            <div>
              <h3 className="text-xl font-black tracking-tighter text-slate-900 uppercase leading-none">
                {app.name}
              </h3>
              <div className="mt-2">
                <span className={cn(
                  "rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] border transition-colors",
                  is_mnet 
                    ? "bg-[#FFEDF0] text-[#FF5A78] border-[#FFD1D9]" 
                    : "bg-white/60 text-slate-500 border-white"
                )}>
                  {app.badge}
                </span>
              </div>
            </div>
          </div>
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border border-white bg-white/80 text-slate-400 transition-all duration-500 shadow-sm",
            expanded && (is_mnet ? "rotate-90 text-[#FF5A78]" : "rotate-90 text-slate-900")
          )}>
            <ChevronRight className="size-5" />
          </div>
        </button>

        {/* body */}
        <div className={cn(
          "grid transition-all duration-500 ease-in-out",
          expanded ? "max-h-[1500px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        )}>
          <div className="p-8 pt-0">
            <div className="flex flex-col lg:flex-row gap-8">

              {/* left — info */}
              <div className="w-full lg:w-1/3 space-y-6">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF708A] flex items-center gap-2">
                    <Sparkles className="size-3.5" /> Currencies
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currency_items.map((item) => (
                      <span key={item} className="px-3 py-1.5 rounded-xl bg-white border border-white text-[12px] font-bold text-slate-700 shadow-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                    <CheckCircle2 className="size-3.5" /> Collection
                  </p>
                  <ul className="space-y-3">
                    {collect_items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-[13px] font-medium text-slate-500 leading-relaxed">
                        <div className="mt-2 h-1 w-1 rounded-full bg-[#FFC2D1] shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* right — strategies */}
              <div className={cn(
                "w-full lg:w-2/3 rounded-[2rem] border border-white/60 p-6 lg:p-8 backdrop-blur-sm",
                is_mnet ? "bg-white/40" : "bg-white/20"
              )}>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-800 mb-6 flex items-center gap-3">
                  <span className="h-px w-8 bg-[#FF708A]" /> Strategy & Schedule
                </p>
                <div className="grid gap-4">
                  {strategy_items.map((item, idx) => (
                    <div key={idx} className="group/item flex items-center justify-between gap-4 rounded-2xl border border-white bg-white/60 p-5 transition hover:bg-white hover:shadow-md">
                      <div className="flex items-center gap-4">
                        <span className="text-[14px] font-black text-[#FFC2D1]">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <p className="text-[14px] font-bold text-slate-800 leading-relaxed">{item}</p>
                      </div>
                      <Copy 
                        className="size-4 text-slate-300 group-hover/item:text-[#FF708A] transition-colors shrink-0 cursor-pointer" 
                        onClick={() => navigator.clipboard.writeText(item)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* footer */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/60 pt-8">
              <div className="flex gap-2.5">
                {app.androidHref && (
                  <a href={app.androidHref} target="_blank" rel="noreferrer"
                    title="Android"
                    className="p-3.5 rounded-2xl bg-white border border-white text-slate-400 hover:text-[#FF708A] shadow-sm transition-all hover:-translate-y-1">
                    <Smartphone className="size-5" />
                  </a>
                )}
                {app.iosHref && (
                  <a href={app.iosHref} target="_blank" rel="noreferrer"
                    title="iOS"
                    className="p-3.5 rounded-2xl bg-white border border-white text-slate-400 hover:text-[#FF708A] shadow-sm transition-all hover:-translate-y-1">
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

// ─── skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="card-premium !rounded-[2.5rem] !bg-white/40 !p-0 border border-white/60 animate-pulse">
      <div className="flex items-center gap-5 p-6">
        <div className="h-16 w-16 rounded-[2rem] bg-white/60" />
        <div className="space-y-2.5">
          <div className="h-4 w-28 rounded-lg bg-white/60" />
          <div className="h-3 w-16 rounded-lg bg-white/40" />
        </div>
      </div>
    </div>
  )
}

// ─── main ─────────────────────────────────────────────────────────────────────

export default function VotingPageClient() {
  const [activeTab, setActiveTab]           = useState<"guide" | "tracking">("guide")
  const [activeCategoryId, setActiveCategoryId] = useState<CategoryId>("music_shows")

  const { apps, loading, error } = useVotingApps(activeCategoryId)

  const scrollToApp = (id: string) =>
    document.getElementById(`app-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })

  return (
    <div className="mt-16 space-y-12">

      {/* tabs swtich */}
      <div className="flex gap-3">
        {(["guide", "tracking"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-2xl px-10 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all",
              activeTab === tab
                ? "bg-[#FF3B57] text-white shadow-xl shadow-pink-100"
                : "bg-white/40 border border-white/60 text-slate-600 hover:bg-white/60"
            )}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "guide" ? (
        <div className="space-y-12">

          {/* category filter */}
          <div className="flex flex-wrap gap-2.5">
            {CATEGORIES.map((c) => {
              const isActive = activeCategoryId === c.id
              return (
                <button key={c.id} onClick={() => setActiveCategoryId(c.id)}
                  className={cn(
                    "rounded-2xl border px-6 py-4 text-[11px] font-black uppercase tracking-widest transition-all",
                    isActive ? `${c.active} shadow-sm scale-105` : "bg-white/40 border-white/60 text-slate-500 hover:bg-white"
                  )}>
                  {c.label}
                </button>
              )
            })}
          </div>

          {/* error handling */}
          {error && (
            <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50/60 px-5 py-4 text-red-600">
              <AlertCircle className="size-5 shrink-0" />
              <p className="text-sm font-medium">lỗi khi tải dữ liệu: {error}</p>
            </div>
          )}

          {/* apps directory */}
          {!error && (
            <div className="card-premium !rounded-[2.5rem] !bg-white/40 border border-white/60 p-8 lg:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white shadow-lg">
                  <LayoutGrid className="size-5" />
                </div>
                <h4 className="text-[15px] font-black uppercase tracking-tighter text-slate-900">
                  apps directory
                  {!loading && (
                    <span className="ml-2 text-[#FF708A] opacity-40">/ {apps.length}</span>
                  )}
                </h4>
                {loading && <Loader2 className="size-4 animate-spin text-[#FF708A]" />}
              </div>

              {loading ? (
                <div className="flex gap-3 flex-wrap">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 w-28 rounded-xl bg-white/60 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {apps.map((app) => (
                    <button key={app.id} onClick={() => scrollToApp(app.id)}
                      className="flex items-center gap-3 rounded-xl border border-white bg-white/60 px-5 py-3 text-[12px] font-bold text-slate-700 transition hover:bg-[#FFC2D1]/20 hover:border-[#FFC2D1]/60">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#FF708A]" />
                      {app.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* app list grid */}
          <div className="grid gap-10">
            {loading
              ? [1, 2].map((i) => <Skeleton key={i} />)
              : apps.map((app) => <VotingAppCard key={app.id} app={app} />)
            }
          </div>
        </div>
      ) : (
        <div className="card-premium !p-20 text-center !bg-white/40 backdrop-blur-md border border-white/60">
          <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 text-slate-900">coming soon</h3>
          <p className="text-slate-500 font-medium">tracking features will be available in the next update.</p>
        </div>
      )}
    </div>
  )
}