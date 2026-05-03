"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Megaphone, ShoppingCart, Info, Pin, ExternalLink, Sparkles } from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"
import { ALL_NOTICES } from "@/lib/notices"
import { Navbar, type TimeZone } from "@/components/navbar"
import { cn } from "@/lib/utils"

export default function NoticesPage() {
  const { t, lang } = useTranslation()
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

      <div className="section-shell pt-32 lg:pt-44">
        {/* Header Section */}
        <div className="mb-16">
          <Link 
            href="/"
            className="group inline-flex items-center gap-2 mb-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-[#FF708A] transition-colors"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            {t("notice.back")}
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
             <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#FFC2D1] to-[#A2D2FF] flex items-center justify-center text-white shadow-lg shadow-pink-100">
                <Megaphone className="size-6" />
             </div>
             <h1 className="text-4xl sm:text-6xl font-black text-slate-900 uppercase tracking-tight">
               {t("notice.allNotices")}
             </h1>
          </div>
          <p className="text-body max-w-2xl">
            {lang === 'vi' 
              ? "Nơi tổng hợp các thông tin và thông báo quan trọng đang được ghim dành cho S2U." 
              : "A central place for all currently pinned and important announcements for S2U."}
          </p>
        </div>

        {/* Notices Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ALL_NOTICES.map((notice, index) => (
            <div 
              key={notice.id}
              className={cn(
                "group relative overflow-hidden rounded-[2.5rem] border border-white bg-white/40 p-8 shadow-sm backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:bg-white hover:shadow-xl",
                notice.isPinned && "border-[#FFC2D1] ring-1 ring-[#FFC2D1]/20"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {notice.isPinned && (
                <div className="absolute top-6 right-8 flex items-center gap-1.5 rounded-full bg-[#FF708A] px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-sm">
                  <Sparkles className="size-3" />
                  {t("notice.pin")}
                </div>
              )}

              <div className="flex items-center gap-3 mb-6">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm",
                  notice.type === 'comeback' ? "bg-[#FF708A]" : 
                  notice.type === 'company' ? "bg-slate-900" : "bg-[#A2D2FF]"
                )}>
                  {notice.type === "comeback" ? <ShoppingCart className="size-5" /> : 
                   notice.type === "company" ? <Megaphone className="size-5" /> : 
                   <Info className="size-5" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FF99AC]">{notice.type}</span>
                  <span className="text-[11px] font-bold text-slate-400">{notice.date.replace(/-/g, '.')}</span>
                </div>
              </div>

              <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight leading-tight mb-4 group-hover:text-[#FF708A] transition-colors">
                {lang === 'vi' ? notice.title_vi : notice.title_en}
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed mb-8 flex-1">
                {lang === 'vi' ? notice.content_vi : notice.content_en}
              </p>

              {notice.link && (
                <div className="mt-auto">
                  <a 
                    href={notice.link}
                    target={notice.link.startsWith('http') ? "_blank" : undefined}
                    rel={notice.link.startsWith('http') ? "noreferrer" : undefined}
                    className="flex items-center justify-between w-full rounded-2xl bg-slate-50 border border-slate-100 px-6 py-4 text-[11px] font-black uppercase tracking-[0.1em] text-slate-900 transition-all hover:bg-slate-900 hover:text-white group/btn"
                  >
                    <span>{lang === 'vi' ? (notice.linkText_vi || t("notice.viewDetail")) : (notice.linkText_en || t("notice.viewDetail"))}</span>
                    <ExternalLink className="size-4 text-[#FF708A] group-hover/btn:text-white transition-colors" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="section-shell pb-12 mt-24">
        <div className="card-premium !rounded-[2.5rem] !bg-white/20 p-10 text-center">
          <p className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-500">
            {t("footer.copyright").replace("{year}", "2026")}
          </p>
        </div>
      </footer>
    </main>
  )
}
