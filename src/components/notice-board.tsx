"use client"

import { useState, useEffect } from "react"
import { Pin, X, ExternalLink, Megaphone, ShoppingCart, Info, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/hooks/useTranslation"
import { ALL_NOTICES } from "@/lib/notices"
import { cn } from "@/lib/utils"

export function NoticeBoard() {
  const { t, lang } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [hasNew, setHasNew] = useState(true)

  // Reset "new" badge when opened
  useEffect(() => {
    if (isOpen) setHasNew(false)
  }, [isOpen])

  // Get only top 3 notices for the quick board
  const recentNotices = ALL_NOTICES.slice(0, 3)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 print:hidden">
      {/* The Board */}
      <div 
        className={cn(
          "w-[calc(100vw-3rem)] sm:w-96 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] origin-bottom-right",
          isOpen 
            ? "scale-100 opacity-100 translate-y-0" 
            : "scale-90 opacity-0 translate-y-10 pointer-events-none"
        )}
      >
        <div className="card-premium p-0 flex flex-col max-h-[70vh] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-white/80">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/20 bg-white/40 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFC2D1] text-[#E05670]">
                <Pin className="size-4 fill-current" />
              </div>
              <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-900">
                {t("notice.title")}
              </h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full hover:bg-white/50 transition-colors text-slate-500"
              aria-label={t("notice.close")}
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-5 space-y-4 max-h-[50vh]">
            <style jsx>{`
              div::-webkit-scrollbar {
                width: 4px;
              }
              div::-webkit-scrollbar-track {
                background: transparent;
              }
              div::-webkit-scrollbar-thumb {
                background: rgba(0, 0, 0, 0.1);
                border-radius: 10px;
              }
            `}</style>
            
            {recentNotices.length > 0 ? (
              recentNotices.map((notice) => (
                <div 
                  key={notice.id}
                  className="relative group rounded-2xl border border-white/60 bg-white/30 p-5 transition-all hover:bg-white/50 hover:shadow-sm"
                >
                  {notice.isPinned && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter text-[#FF708A]">
                      <Pin className="size-2.5 fill-current" />
                      {t("notice.pin")}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-lg text-white",
                      notice.type === 'comeback' ? "bg-[#FF708A]" : "bg-[#A2D2FF]"
                    )}>
                      {notice.type === "comeback" ? <ShoppingCart className="size-3" /> : 
                       notice.type === "company" ? <Megaphone className="size-3" /> : 
                       <Info className="size-3" />}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{notice.date.replace(/-/g, '.')}</span>
                  </div>

                  <h4 className="text-[14px] font-black text-slate-900 leading-tight mb-2">
                    {lang === 'vi' ? notice.title_vi : notice.title_en}
                  </h4>
                  <p className="text-[12px] text-slate-600 leading-relaxed mb-4 line-clamp-2">
                    {lang === 'vi' ? notice.content_vi : notice.content_en}
                  </p>

                  {notice.link && (
                    <a 
                      href={notice.link}
                      target={notice.link.startsWith('http') ? "_blank" : undefined}
                      rel={notice.link.startsWith('http') ? "noreferrer" : undefined}
                      className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#FF708A] hover:text-[#E05670] transition-colors"
                    >
                      {lang === 'vi' ? (notice.linkText_vi || t("notice.viewDetail")) : (notice.linkText_en || t("notice.viewDetail"))}
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className="py-10 text-center">
                <p className="text-sm text-slate-400">{t("notice.empty")}</p>
              </div>
            )}
          </div>
          
          {/* Footer with View More */}
          <Link 
            href="/notices"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 p-5 border-t border-white/20 hover:bg-white/40 transition-colors group"
          >
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">{t("notice.viewMore")}</span>
            <ArrowRight className="size-4 text-[#FF708A] transition-transform group-hover:translate-x-1" />
          </Link>

          <div className="h-1.5 w-full bg-gradient-to-r from-[#A2D2FF] via-[#FFC2D1] to-[#A2D2FF]" />
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 group relative",
          isOpen 
            ? "bg-slate-950 text-white" 
            : "bg-white text-[#FF708A] border-4 border-[#FFC2D1]/30"
        )}
        aria-label={t("notice.open")}
      >
        <div className={cn(
          "transition-transform duration-500",
          isOpen ? "rotate-90" : "rotate-0"
        )}>
          {isOpen ? <X className="size-6" /> : <Megaphone className="size-6" />}
        </div>
        
        {/* Animated Rings when closed */}
        {!isOpen && (
          <>
            <span className="absolute inset-0 rounded-full bg-[#FFC2D1] animate-ping opacity-20" />
            {hasNew && (
              <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#FF708A] text-[10px] font-black text-white ring-4 ring-white animate-bounce">
                {ALL_NOTICES.length}
              </span>
            )}
          </>
        )}
      </button>
    </div>
  )
}
