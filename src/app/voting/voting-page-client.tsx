"use client"

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react"
import {
  CalendarDays,
  Trophy,
  Music2,
  Radio,
  BookOpen,
  Smartphone,
  Globe,
  ChevronRight,
  Gift,
  Star,
  Megaphone,
} from "lucide-react"
import { votingGuideContent, type VotingAppCategoryId, type VotingAppCardSection } from "@/lib/voting-guide"
import { cn } from "@/lib/utils"
import { t } from "@/i18n/translations"

// ─── Category config ─────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<VotingAppCategoryId, { pill: string; dot: string; icon: string }> = {
  music_shows: {
    pill: "bg-sky-100 text-sky-700 border-sky-200",
    dot: "bg-sky-400",
    icon: "text-sky-500",
  },
  awards: {
    pill: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
    icon: "text-amber-500",
  },
  birthday: {
    pill: "bg-violet-100 text-violet-700 border-violet-200",
    dot: "bg-violet-400",
    icon: "text-violet-500",
  },
  stream_support: {
    pill: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-400",
    icon: "text-emerald-500",
  },
}

function CategoryIcon({ id, className }: { id: VotingAppCategoryId; className?: string }) {
  const props = { className: cn("size-4", className) }
  if (id === "music_shows") return <Music2 {...props} />
  if (id === "awards") return <Trophy {...props} />
  if (id === "birthday") return <CalendarDays {...props} />
  return <Radio {...props} />
}

function SectionIcon({ title }: { title: string }) {
  const key = title.toLowerCase()
  const cls = "size-3.5 text-[#FF708A]"
  if (key.includes("currency")) return <Gift className={cls} />
  if (key.includes("collect")) return <Star className={cls} />
  if (key.includes("strategy") || key.includes("event")) return <Megaphone className={cls} />
  return <Star className={cls} />
}

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

// ─── App Card — horizontal layout, expandable ────────────────────────────────
function VotingAppCard({
  name,
  badge,
  iconImageSrc,
  sections,
  guideHref,
  androidHref,
  iosHref,
  websiteHref,
}: {
  name: string
  badge?: string
  iconImageSrc?: string
  sections: VotingAppCardSection[]
  guideHref?: string
  androidHref?: string
  iosHref?: string
  websiteHref?: string
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="card-premium !rounded-[2.5rem] !bg-white/80 overflow-hidden">
      {/* ── Card header ── */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-slate-50/50"
      >
        <AppIcon imageSrc={iconImageSrc} name={name} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-black uppercase tracking-tight text-slate-900">{name}</p>
          {badge && (
            <span className="mt-1.5 inline-block rounded-lg bg-[#FFF0F5] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.3em] text-[#FF708A]">
              {badge}
            </span>
          )}
        </div>

        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-400 transition-transform",
            expanded && "rotate-90"
          )}
        >
          <ChevronRight className="size-4" />
        </div>
      </button>

      {/* ── Expanded content ── */}
      {expanded && (
        <>
          <div className="h-px bg-slate-100/80 mx-5" />

          {/* Sections — 3-column grid */}
          <div className="grid gap-px bg-slate-100 sm:grid-cols-3">
            {sections.map((section) => (
              <div key={section.title} className="space-y-4 bg-white p-6">
                <div className="flex items-center gap-2">
                  <SectionIcon title={section.title} />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{section.title}</p>
                </div>
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-2.5 text-[13px] font-medium leading-relaxed text-slate-600">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FFC2D1]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Action row */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-50/50 p-4 border-t border-slate-100">
            {guideHref && (
              <a
                href={guideHref}
                target={!guideHref.startsWith("#") ? "_blank" : undefined}
                rel={!guideHref.startsWith("#") ? "noreferrer" : undefined}
                className="flex items-center gap-2 rounded-xl bg-[#FFF0F5] px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#FF708A] transition hover:bg-[#FFC2D1]/40"
              >
                <BookOpen className="size-3.5" />
                {t("voting.viewGuide")}
              </a>
            )}
            {androidHref && (
              <a
                href={androidHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 transition hover:bg-slate-50"
              >
                <Smartphone className="size-3.5" />
                {t("voting.android")}
              </a>
            )}
            {iosHref && (
              <a
                href={iosHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 transition hover:bg-slate-50"
              >
                <Smartphone className="size-3.5" />
                {t("voting.ios")}
              </a>
            )}
            {websiteHref && (
              <a
                href={websiteHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 transition hover:bg-slate-50"
              >
                <Globe className="size-3.5" />
                {t("voting.website")}
              </a>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Main client component ────────────────────────────────────────────────────
export function VotingPageClient() {
  const [activeTab, setActiveTab] = useState<"guide" | "tracking">("guide")
  const [activeCategoryId, setActiveCategoryId] = useState<VotingAppCategoryId>("music_shows")

  const apps = useMemo(
    () => votingGuideContent.apps.filter((a) => a.categoryId === activeCategoryId),
    [activeCategoryId]
  )

  // Count apps per category
  const countByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    for (const app of votingGuideContent.apps) {
      map[app.categoryId] = (map[app.categoryId] ?? 0) + 1
    }
    return map
  }, [])

  return (
    <div className="mt-16 space-y-10">
      {/* ── Top-level tab: Guide / Tracking ─────────────────────────── */}
      <div className="flex gap-3">
        {(["guide", "tracking"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-2xl px-8 py-4 text-[11px] font-black uppercase tracking-widest transition-all",
              activeTab === tab
                ? "bg-[#FF3B57] text-white shadow-xl shadow-pink-100"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            {tab === "guide" ? t("voting.guide") : t("voting.tracking")}
          </button>
        ))}
      </div>

      {activeTab === "guide" ? (
        <>
          {/* ── Category selector — horizontal pill strip ─────────────── */}
          <div className="flex flex-wrap gap-2">
            {votingGuideContent.categories.map((c) => {
              const colors = CATEGORY_COLORS[c.id] ?? CATEGORY_COLORS.music_shows
              const isActive = activeCategoryId === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCategoryId(c.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border px-6 py-3.5 text-[11px] font-black uppercase tracking-widest transition-all",
                    isActive
                      ? colors.pill + " shadow-sm scale-105"
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <CategoryIcon id={c.id} className={isActive ? colors.icon : "text-slate-400"} />
                  {t(`voting.category.${c.id}`)}
                  <span
                    className={cn(
                      "flex h-5 min-w-[20px] items-center justify-center rounded-full px-2 text-[9px] font-black",
                      isActive ? "bg-white/60 text-inherit" : "bg-slate-200/60 text-slate-500"
                    )}
                  >
                    {countByCategory[c.id] ?? 0}
                  </span>
                </button>
              )
            })}
          </div>

          {/* ── Active category label ─────────────────────────────────── */}
          <div className="flex items-center gap-3 px-2">
            <div className={cn("h-1 w-8 rounded-full", CATEGORY_COLORS[activeCategoryId]?.dot ?? "bg-[#FF708A]")} />
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">
              {t(`voting.category.${activeCategoryId}`)} —{" "}
              {apps.length}{" "}
              {apps.length === 1
                ? t("voting.appCount").replace("{count}", "")
                : t("voting.appsCount").replace("{count}", "")}
            </p>
          </div>

          {/* ── App cards — single column, full width ─────────────────── */}
          <div className="grid gap-6">
            {apps.map((app) => (
              <VotingAppCard
                key={app.id}
                name={app.name}
                badge={app.badge}
                iconImageSrc={app.iconImageSrc}
                sections={app.sections}
                guideHref={app.guideHref}
                androidHref={app.androidHref}
                iosHref={app.iosHref}
                websiteHref={app.websiteHref}
              />
            ))}

            {apps.length === 0 && (
              <div className="card-premium !border-dashed !bg-transparent py-20 text-center text-sm italic text-slate-400">
                {t("voting.empty")}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="card-premium p-12">
          <p className="text-[12px] font-black uppercase tracking-[0.5em] text-[#FF708A] mb-6">{t("voting.tracking")}</p>
          <div className="max-w-2xl space-y-4">
            <h3 className="text-title text-2xl">{t("voting.comingSoon")}</h3>
            <p className="text-body">
              {t("voting.trackingDesc")}
            </p>
          </div>
        </div>
      )}

    </div>
  )
}