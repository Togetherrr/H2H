"use client"

import { useState, useEffect } from "react"
import { Pin, X, ExternalLink, Megaphone, ShoppingCart, Info, ArrowRight, Plus } from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"
import { ALL_NOTICES } from "@/lib/notices"
import { cn } from "@/lib/utils"
import { AppLink } from "@/components/app-link"

export function NoticeBoard() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [hasNew, setHasNew] = useState(true)

  // Reset "new" badge when opened
  useEffect(() => {
    if (isOpen) setHasNew(false)
  }, [isOpen])

  // Get only top 3 notices for the quick board
  const recentNotices = ALL_NOTICES.slice(0, 3)

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-6 print:hidden pointer-events-none">
      {/* The Board */}
      <div 
        className={cn(
          "w-[calc(100vw-3.5rem)] sm:w-96 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] origin-bottom-right",
          isOpen 
            ? "scale-100 opacity-100 translate-y-0 pointer-events-auto" 
            : "scale-90 opacity-0 translate-y-10 pointer-events-none"
        )}
      >
        <div className="card-premium p-0 flex flex-col max-h-[75vh] shadow-[0_30px_70px_rgba(255,182,193,0.4)] border-white/40 overflow-hidden bg-gradient-to-br from-[#FFF0F5] to-[#FFD1DC]">
          {/* Header */}
          <div className="flex items-center justify-between p-7 border-b border-white/20 bg-white/20 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-white text-[#FF708A] shadow-xl border border-white">
                <Pin className="size-6 fill-current" />
              </div>
              <div>
                <h3 className="text-[14px] font-black uppercase tracking-widest text-black">
                  {t("notice.title")}
                </h3>
                <p className="text-[9px] font-bold text-[#FF708A] uppercase tracking-widest opacity-80">Announcements</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-3 rounded-full hover:bg-white/30 transition-colors text-black"
              aria-label={t("notice.close")}
            >
              <X className="size-6" />
            </button>
          </div>

          {/* List */}
          <div className="overflow-y-auto p-5 flex flex-col gap-4 custom-scrollbar">
            {recentNotices.length > 0 ? (
              <>
                {recentNotices.map((notice) => (
                  <AppLink
                    key={notice.id}
                    href="/notices"
                    onClick={() => setIsOpen(false)}
                    className="group relative p-6 rounded-[2rem] bg-white/30 border border-white/30 transition-all hover:bg-white/50 hover:-translate-y-1 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-white text-[#FF708A] shadow-sm"
                      )}>
                        {t(`notice.type.${notice.type}` as any)}
                      </span>
                      <span className="text-[10px] font-bold text-black opacity-60">
                        {notice.date}
                      </span>
                    </div>
                    <h4 className="text-[15px] font-black text-black group-hover:text-[#FF708A] transition-colors line-clamp-2 leading-tight">
                      {notice.title_en}
                    </h4>
                  </AppLink>
                ))}
                
                {ALL_NOTICES.length > 3 && (
                  <div className="py-2 text-center">
                     <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 text-[10px] font-black uppercase tracking-[0.2em] text-[#FF708A]">
                      <Plus className="size-3" />
                      {`+${ALL_NOTICES.length - 3} MORE UPDATES`}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm font-bold text-black opacity-40 uppercase tracking-widest">{t("notice.empty")}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <AppLink
            href="/notices"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-3 p-8 text-[13px] font-black uppercase tracking-[0.3em] text-white bg-[#FF708A] hover:bg-black transition-all shadow-lg active:scale-95"
          >
            <span>{t("notice.viewAll")}</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-2" />
          </AppLink>
        </div>
      </div>

      {/* Floating Toggle Button */}
      <div className="relative pointer-events-auto">
        {!isOpen && hasNew && (
           <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 whitespace-nowrap px-4 py-2 rounded-xl bg-black text-white text-[10px] font-black uppercase tracking-widest shadow-xl animate-in fade-in slide-in-from-right-4 duration-500 hidden sm:block pointer-events-none">
              NEW UPDATES
              <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-black rotate-45" />
           </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full shadow-[0_15px_40px_rgba(255,182,193,0.4)] transition-all duration-500 hover:scale-110 active:scale-95 group relative",
            isOpen 
              ? "bg-black text-white" 
              : "bg-gradient-to-br from-[#FFF0F5] to-[#FFD1DC] text-[#FF708A] border-2 border-white/80"
          )}
        >
          <div className={cn(
            "transition-transform duration-500",
            isOpen ? "rotate-90" : "rotate-0"
          )}>
            {isOpen ? <X className="size-7" /> : <Megaphone className="size-7 group-hover:animate-bounce" />}
          </div>
          
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#FF708A] text-[11px] font-black text-white ring-4 ring-white shadow-lg pointer-events-none">
              {ALL_NOTICES.length}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
