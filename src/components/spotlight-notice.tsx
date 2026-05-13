"use client"

import { Megaphone, ShoppingCart, Info, Sparkles, ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/hooks/useTranslation"
import { ALL_NOTICES } from "@/lib/notices"
import { cn } from "@/lib/utils"

export function SpotlightNotice() {
  const { t } = useTranslation()

  // Get top 3 important notices
  const displayNotices = ALL_NOTICES.slice(0, 3)

  if (displayNotices.length === 0) return null

  return (
    <div className="w-full max-w-5xl mx-auto mb-20 animate-in fade-in slide-in-from-top-6 duration-1000 print:hidden px-4">
      {/* Section Header */}
      <div className="relative z-30 flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFF0F5] to-[#FFD1DC] text-[#FF708A] shadow-xl border border-white">
            <Megaphone className="size-7" />
          </div>
          <h2 className="section-title">
            {t("notice.title")}
          </h2>
        </div>

      </div>

      {/* Stack of Narrow Horizontal Notices */}
      <div className="flex flex-col gap-4">
        {displayNotices.map((notice, i) => (
          <a
            key={notice.id}
            href={notice.link || "#"}
            target={notice.link?.startsWith('http') ? "_blank" : undefined}
            rel={notice.link?.startsWith('http') ? "noreferrer" : undefined}
            className={`card-premium group relative z-10 flex items-center gap-6 p-4 md:p-6 !rounded-3xl shadow-pink-200/10 hover:-translate-y-1 cursor-pointer slide-in-left ${i === 1 ? 'slide-delay-1' : i === 2 ? 'slide-delay-2' : ''}`}
          >
            {/* Icon Column */}
            <div className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#FF708A] shadow-lg border border-white/20"
            )}>
              {notice.type === "comeback" ? <ShoppingCart className="size-6" /> :
                notice.type === "company" ? <Megaphone className="size-6" /> :
                  <Info className="size-6" />}
            </div>

            {/* Content Column */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[9px] font-black text-white opacity-70 uppercase tracking-widest">{notice.date.replace(/-/g, '.')}</span>
                {notice.isPinned && (
                  <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-[#FF708A] bg-white px-2 py-0.5 rounded-full">
                    <Sparkles className="size-2 fill-current" />
                    {t("notice.pin")}
                  </span>
                )}
              </div>
              <h3 className="text-[15px] md:text-[17px] font-black text-black uppercase tracking-tight leading-tight truncate group-hover:text-[#D94F6A] transition-colors">
                {notice.title_en}
              </h3>
            </div>

            {/* Action Column */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 border border-white/20 text-black group-hover:bg-white group-hover:text-[#FF708A] transition-all">
              <ExternalLink className="size-4" />
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
