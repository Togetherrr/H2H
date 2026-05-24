"use client"

import { ArrowUpRight, Megaphone, Pin } from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"
import type { Notice } from "@/lib/notices"
import { cn } from "@/lib/utils"

export function SpotlightNotice({ notices }: { notices: Notice[] }) {
  const { t } = useTranslation()
  const displayNotices = notices

  if (displayNotices.length === 0) return null

  return (
    <section className="mx-auto mb-12 w-full max-w-5xl px-4 print:hidden animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/60 shadow-[0_18px_55px_rgba(53,99,132,0.18)] backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-white/70 px-5 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3.5 sm:gap-5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-[1.25rem] bg-[#FFF0F5] text-[#E95676] ring-1 ring-[#F7D5DE] sm:size-14">
              <Megaphone className="size-5 sm:size-6" />
            </div>
            <h2 className="section-title text-slate-900">
              {t("notice.title")}
            </h2>
          </div>
          <span className="hidden rounded-full border border-[#F3A7B7]/70 bg-[#FFF5F8]/95 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#D94F6A] shadow-sm ring-1 ring-white/80 sm:inline-flex">
            {displayNotices.length} active
          </span>
        </div>

        <div className="space-y-3 bg-white/25 p-3 sm:p-4 lg:p-5">
          {displayNotices.map((notice) => (
            <div
              key={notice.id}
              className={cn(
                "rounded-[1.25rem] border px-4 py-4 shadow-[0_12px_30px_rgba(53,99,132,0.08)] ring-1 ring-white/50 transition sm:px-5",
                notice.isPinned
                  ? "border-[#F4B4C2]/80 bg-[#FFF5F8]/85"
                  : "border-white/80 bg-white/55 hover:bg-white/70"
              )}
            >
              <div className={cn(
                "grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center",
                notice.link && notice.link !== "#" ? "" : "sm:grid-cols-1"
              )}>
                <div className="min-w-0">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    {notice.isPinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#E95676] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-white shadow-sm">
                        <Pin className="size-2.5 fill-current" />
                        Featured
                      </span>
                    )}
                    <span className={cn(
                      "rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] ring-1",
                      notice.isPinned
                        ? "bg-white/75 text-[#D94F6A] ring-[#F7C3CF]"
                        : "bg-white/65 text-slate-500 ring-white/80"
                    )}>
                      {notice.type}
                    </span>
                    <time className="text-[11px] font-semibold text-slate-400" dateTime={notice.date}>
                      {notice.date.replace(/-/g, ".")}
                    </time>
                  </div>
                  <h3 className="truncate text-[13px] font-bold leading-5 text-slate-900 sm:text-sm">
                    {notice.title_en}
                  </h3>
                  <p className="mt-0.5 line-clamp-1 text-xs leading-5 text-slate-500">
                    {notice.content_en}
                  </p>
                </div>

                {notice.link && notice.link !== "#" && (
                  <a
                    href={notice.link}
                    target={notice.link.startsWith("http") ? "_blank" : undefined}
                    rel={notice.link.startsWith("http") ? "noreferrer" : undefined}
                    aria-label={notice.linkText_en || t("notice.viewDetail")}
                    title={notice.linkText_en || t("notice.viewDetail")}
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-[#D94F6A] ring-1 ring-white/90 transition hover:-translate-y-0.5 hover:bg-white hover:text-[#C84664] hover:shadow-[0_10px_24px_rgba(217,79,106,0.16)]"
                  >
                    <ArrowUpRight className="size-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
