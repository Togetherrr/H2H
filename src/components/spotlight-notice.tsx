"use client"

import { Megaphone, ShoppingCart, Info, Sparkles, ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/hooks/useTranslation"
import { ALL_NOTICES } from "@/lib/notices"
import { cn } from "@/lib/utils"

export function SpotlightNotice() {
  const { t, lang } = useTranslation()

  // Get top 3 important notices
  const displayNotices = ALL_NOTICES.slice(0, 3)

  if (displayNotices.length === 0) return null

  return (
    <div className="w-full max-w-6xl mx-auto mb-12 animate-in fade-in slide-in-from-top-4 duration-1000 print:hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8 px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFC2D1] text-[#FF708A] shadow-sm">
            <Megaphone className="size-4" />
          </div>
          <h2 className="text-[13px] font-black uppercase tracking-[0.3em] text-slate-900">
            {t("notice.allNotices")}
          </h2>
        </div>
        
        {ALL_NOTICES.length > 3 && (
          <Link 
            href="/notices"
            className="group flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#FF708A] transition-all hover:text-[#E05670]"
          >
            {t("notice.viewMore")}
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      {/* Grid of 3 Small Notices */}
      <div className="grid gap-6 md:grid-cols-3">
        {displayNotices.map((notice) => (
          <div 
            key={notice.id}
            className="group relative flex flex-col rounded-[2rem] border border-white bg-white/50 p-6 shadow-sm backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:bg-white hover:shadow-xl"
          >
            {notice.isPinned && (
              <div className="absolute top-4 right-6 flex items-center gap-1 text-[8px] font-black uppercase tracking-tighter text-[#FF708A]">
                <Sparkles className="size-2.5 fill-current" />
                {t("notice.pin")}
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm",
                notice.type === 'comeback' ? "bg-[#FF708A]" : 
                notice.type === 'company' ? "bg-slate-900" : "bg-[#A2D2FF]"
              )}>
                {notice.type === "comeback" ? <ShoppingCart className="size-4" /> : 
                 notice.type === "company" ? <Megaphone className="size-4" /> : 
                 <Info className="size-4" />}
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{notice.date.replace(/-/g, '.')}</span>
            </div>

            <h3 className="text-[14px] font-black text-slate-950 uppercase tracking-tight leading-tight mb-3 group-hover:text-[#FF708A] transition-colors line-clamp-2">
              {lang === 'vi' ? notice.title_vi : notice.title_en}
            </h3>

            <p className="text-[12px] text-slate-600 leading-relaxed mb-6 line-clamp-3">
              {lang === 'vi' ? notice.content_vi : notice.content_en}
            </p>

            {notice.link && (
              <div className="mt-auto pt-4 border-t border-slate-100/50">
                <a 
                  href={notice.link}
                  target={notice.link.startsWith('http') ? "_blank" : undefined}
                  rel={notice.link.startsWith('http') ? "noreferrer" : undefined}
                  className="flex items-center justify-between group/link"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 group-hover/link:text-[#FF708A] transition-colors">
                    {lang === 'vi' ? (notice.linkText_vi || t("notice.viewDetail")) : (notice.linkText_en || t("notice.viewDetail"))}
                  </span>
                  <ExternalLink className="size-3.5 text-slate-300 group-hover/link:text-[#FF708A] transition-colors" />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile View All Button */}
      <div className="mt-8 flex justify-center md:hidden">
        <Link 
          href="/notices"
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-8 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-white"
        >
          {t("notice.viewMore")}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  )
}
