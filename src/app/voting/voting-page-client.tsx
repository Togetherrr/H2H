"use client"
import Image from "next/image"
import { useMemo, useState } from "react"
import {
  CalendarDays,
  Trophy,
  Music2,
  Radio,
  ChevronRight,
  BookOpen,
  Smartphone,
  Copy,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Clock,
  Globe,
  LayoutGrid
} from "lucide-react"
import { votingGuideContent, type VotingAppCategoryId, type VotingAppCardSection } from "@/lib/voting-guide"
import { cn } from "@/lib/utils"

// ─── Constants ──────────────────────────────────────────────────────────────
const CATEGORY_STYLES: Record<VotingAppCategoryId, { active: string; icon: string; label: string }> = {
  music_shows: { active: "bg-sky-100/80 text-sky-600 border-sky-200", icon: "text-sky-400", label: "Music Shows" },
  awards: { active: "bg-amber-100/80 text-amber-600 border-amber-200", icon: "text-amber-400", label: "Awards" },
  birthday: { active: "bg-violet-100/80 text-violet-600 border-violet-200", icon: "text-violet-400", label: "Anniversary" },
  stream_support: { active: "bg-emerald-100/80 text-emerald-600 border-emerald-200", icon: "text-emerald-400", label: "Support" },
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function AppIcon({ imageSrc, name }: { imageSrc?: string; name: string }) {
  return (
    <div className="relative group-hover:scale-105 transition-transform duration-500">
      <div className="h-16 w-16 rounded-[2rem] bg-gradient-to-br from-[#FFC2D1] to-[#A2D2FF] p-[2px] shadow-sm">
        <div className="relative flex h-full w-full items-center justify-center rounded-[1.9rem] bg-white overflow-hidden">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={name}
              fill
              className="object-cover"
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

function VotingAppCard({ id, name, badge, iconImageSrc, sections, guideHref, androidHref, iosHref, websiteHref }: any) {
  const [expanded, setExpanded] = useState(true)

  const currency = sections.find((s: any) => s.title.toLowerCase().includes("currency"))
  const collect = sections.find((s: any) => s.title.toLowerCase().includes("collect"))
  const strategy = sections.find((s: any) => s.title.toLowerCase().includes("strategy") || s.title.toLowerCase().includes("event"))

  return (
    <div id={`app-${id}`} className="reveal-up group relative">
      <div className="card-premium !rounded-[2.5rem] !bg-white/40 !p-0 overflow-hidden border border-white/60">
        <button onClick={() => setExpanded(!expanded)} className="flex w-full items-center justify-between p-6 text-left transition hover:bg-white/40">
          <div className="flex items-center gap-5">
            <AppIcon imageSrc={iconImageSrc} name={name} />
            <div>
              <h3 className="text-xl font-black tracking-tighter text-slate-900 uppercase leading-none">{name}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="rounded-lg bg-[#FFF0F5] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#FF708A] border border-[#FFC2D1]/30">
                  {badge || "VOTING APP"}
                </span>
              </div>
            </div>
          </div>
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-full border border-white bg-white/80 text-slate-400 transition-all duration-500 shadow-sm", expanded && "rotate-90 text-[#FF708A]")}>
            <ChevronRight className="size-5" />
          </div>
        </button>

        <div className={cn("grid transition-all duration-500", expanded ? "max-h-[1500px] opacity-100" : "max-h-0 opacity-0")}>
          <div className="p-8 pt-0">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column (1/3) */}
              <div className="w-full lg:w-1/3 space-y-6">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF708A] flex items-center gap-2">
                    <Sparkles className="size-3.5" /> Currencies
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currency?.items.map((item: string) => (
                      <span key={item} className="px-3 py-1.5 rounded-xl bg-white/60 border border-white text-[12px] font-bold text-slate-700 shadow-sm">{item}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-4 pt-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                    <CheckCircle2 className="size-3.5" /> Collection
                  </p>
                  <ul className="space-y-3">
                    {collect?.items.map((item: string) => (
                      <li key={item} className="flex items-start gap-2 text-[13px] font-medium text-slate-500 leading-relaxed">
                        <div className="mt-2 h-1 w-1 rounded-full bg-[#FFC2D1] shrink-0" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column (2/3) */}
              <div className="w-full lg:w-2/3 rounded-[2rem] border border-white/60 bg-white/40 p-6 lg:p-8">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-800 mb-6 flex items-center gap-3">
                  <span className="h-px w-8 bg-[#FF708A]" /> Strategy & Schedule
                </p>
                <div className="grid gap-4">
                  {strategy?.items.map((item: string, idx: number) => (
                    <div key={idx} className="group/item flex items-center justify-between gap-4 rounded-2xl border border-white bg-white/60 p-5 transition hover:bg-white">
                      <div className="flex items-center gap-4">
                        <span className="text-[14px] font-black text-[#FFC2D1]">0{idx + 1}</span>
                        <p className="text-[14px] font-bold text-slate-800 leading-relaxed">{item}</p>
                      </div>
                      <Copy className="size-4 text-slate-300 group-hover/item:text-[#FF708A] transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/60 pt-8">
              <div className="flex gap-2.5">
                {androidHref && <a href={androidHref} target="_blank" className="p-3.5 rounded-2xl bg-white border border-white text-slate-400 hover:text-[#FF708A] shadow-sm transition-all"><Smartphone className="size-5" /></a>}
                {iosHref && <a href={iosHref} target="_blank" className="p-3.5 rounded-2xl bg-white border border-white text-slate-400 hover:text-[#FF708A] shadow-sm transition-all"><Smartphone className="size-5" /></a>}
                {websiteHref && <a href={websiteHref} target="_blank" className="p-3.5 rounded-2xl bg-white border border-white text-slate-400 hover:text-[#FF708A] shadow-sm transition-all"><Globe className="size-5" /></a>}
              </div>
              <a href={guideHref} className="flex items-center gap-3 rounded-2xl bg-[#FF3B57] px-8 py-4 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-pink-100 hover:bg-[#FF2B4A] transition-all">
                <BookOpen className="size-4" /> View Guide
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────

export default function VotingPageClient() {
  const [activeTab, setActiveTab] = useState<"guide" | "tracking">("guide")
  const [activeCategoryId, setActiveCategoryId] = useState<VotingAppCategoryId>("music_shows")

  const apps = useMemo(
    () => votingGuideContent.apps.filter((a) => a.categoryId === activeCategoryId),
    [activeCategoryId]
  )

  const scrollToApp = (id: string) => {
    const el = document.getElementById(`app-${id}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="mt-16 space-y-12">

      {/* 1. Top Tabs (Guide / Tracking) */}
      <div className="flex gap-3">
        {["guide", "tracking"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab as any)}
            className={cn("rounded-2xl px-10 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all",
              activeTab === tab ? "bg-[#FF3B57] text-white shadow-xl shadow-pink-100" : "bg-white/40 border border-white/60 text-slate-600 hover:bg-white/60")}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "guide" ? (
        <div className="space-y-12">

          {/* 2. Category Filter */}
          <div className="flex flex-wrap gap-2.5">
            {votingGuideContent.categories.map((c) => {
              const isActive = activeCategoryId === c.id
              const config = CATEGORY_STYLES[c.id]
              return (
                <button key={c.id} onClick={() => setActiveCategoryId(c.id)}
                  className={cn("flex items-center gap-3 rounded-2xl border px-6 py-4 text-[11px] font-black uppercase tracking-widest transition-all",
                    isActive ? `${config.active} shadow-sm scale-105` : "bg-white/40 border-white/60 text-slate-500 hover:bg-white")}>
                  {config.label}
                </button>
              )
            })}
          </div>

          {/* 3. Quick Directory Section */}
          <div className="card-premium !rounded-[2.5rem] !bg-white/40 border border-white/60 p-8 lg:p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                <LayoutGrid className="size-5" />
              </div>
              <h4 className="text-[15px] font-black uppercase tracking-tighter text-slate-900">
                Apps Directory <span className="ml-2 text-[#FF708A] opacity-40">/</span> {apps.length}
              </h4>
            </div>

            <div className="flex flex-wrap gap-3">
              {apps.map((app) => (
                <button key={app.id} onClick={() => scrollToApp(app.id)}
                  className="flex items-center gap-3 rounded-xl border border-white bg-white/60 px-5 py-3 text-[12px] font-bold text-slate-700 transition hover:bg-[#FFC2D1]/20 hover:border-[#FFC2D1]/60">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#FF708A]" />
                  {app.name}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Main App List */}
          <div className="grid gap-10">
            {apps.map((app) => (
              <VotingAppCard key={app.id} {...app} />
            ))}
          </div>
        </div>
      ) : (
        <div className="card-premium !p-20 text-center">
          <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 text-slate-900">Coming Soon</h3>
          <p className="text-slate-500 font-medium">Tracking features will be available in the next update.</p>
        </div>
      )}
    </div>
  )
}