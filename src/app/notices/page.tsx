"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Megaphone, ShoppingCart, Info, Pin, ExternalLink, Sparkles } from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"
import { ALL_NOTICES } from "@/lib/notices"
import { Navbar, type TimeZone } from "@/components/navbar"
import { cn } from "@/lib/utils"

export default function NoticesPage() {
  const { t } = useTranslation()
  const [timeZone, setTimeZone] = useState<TimeZone>("KST")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <main className="relative min-h-screen selection:bg-[#A2D2FF]/30">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] size-[500px] rounded-full bg-[#A2D2FF]/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] size-[500px] rounded-full bg-[#FFC2D1]/10 blur-[120px]" />
      </div>

      <Navbar timeZone={timeZone} onTimeZoneChange={setTimeZone} />

      <div className="section-shell pt-32 lg:pt-48 pb-24">
        {/* Header Section */}
        <div className="mb-20">
          <Link 
            href="/"
            className="group inline-flex items-center gap-2 mb-10 text-[11px] font-black uppercase tracking-[0.3em] text-black hover:text-[#FF708A] transition-colors"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            {t("notice.back")}
          </Link>
          
          <div className="flex items-center gap-6 mb-6">
             <div className="h-16 w-16 rounded-[2rem] bg-gradient-to-br from-[#FFF0F5] to-[#FFD1DC] flex items-center justify-center text-[#FF708A] shadow-2xl border border-white">
                <Megaphone className="size-8" />
             </div>
             <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-black uppercase tracking-tighter">
               {t("notice.allNotices")}
             </h1>
          </div>
          <p className="text-xl font-bold text-[#FF708A] max-w-2xl uppercase tracking-widest opacity-80">
            Official announcement center
          </p>
        </div>

        {/* Notices Grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {ALL_NOTICES.map((notice, index) => (
            <div 
              key={notice.id}
              className={cn(
                "card-premium group relative flex flex-col p-8 shadow-pink-200/20",
                notice.isPinned && "ring-2 ring-[#FF708A]/20"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {notice.isPinned && (
                <div className="absolute top-8 right-8 flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#FF708A] shadow-xl">
                  <Sparkles className="size-3.5 fill-current" />
                  {t("notice.pin")}
                </div>
              )}

              <div className="flex items-center gap-4 mb-8">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#FF708A] shadow-xl"
                )}>
                  {notice.type === "comeback" ? <ShoppingCart className="size-6" /> : 
                   notice.type === "company" ? <Megaphone className="size-6" /> : 
                   <Info className="size-6" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black">{notice.type}</span>
                  <span className="text-[11px] font-bold text-white opacity-80">{notice.date.replace(/-/g, '.')}</span>
                </div>
              </div>

              <h2 className="text-2xl font-black text-black uppercase tracking-tight leading-tight mb-4 transition-colors">
                {notice.title_en}
              </h2>

              <p className="text-sm font-medium text-white/90 leading-relaxed mb-10 flex-1">
                {notice.content_en}
              </p>

              {notice.link && (
                <div className="mt-auto">
                  <a 
                    href={notice.link}
                    target={notice.link.startsWith('http') ? "_blank" : undefined}
                    rel={notice.link.startsWith('http') ? "noreferrer" : undefined}
                    className="flex items-center justify-between w-full rounded-2xl bg-white/20 border border-white/20 px-6 py-4 text-[11px] font-black uppercase tracking-widest text-black transition-all hover:bg-white hover:text-[#FF708A] group/btn shadow-sm"
                  >
                    <span>{notice.linkText_en || t("notice.viewDetail")}</span>
                    <ExternalLink className="size-4 text-white group-hover/btn:text-[#FF708A] transition-colors" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="section-shell pb-12 mt-16">
        <div className="card-premium !rounded-[2.5rem] p-10 text-center">
          <p className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-500">
            {t("footer.copyright").replace("{year}", "2026")}
          </p>
        </div>
      </footer>
    </main>
  )
}
