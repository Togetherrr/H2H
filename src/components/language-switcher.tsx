"use client"

import { useEffect, useState } from "react"
import { DEFAULT_LANGUAGE } from "@/i18n/translations"
import { useLanguageStore } from "@/store/language"

export function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguageStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const displayLanguage = mounted ? language : DEFAULT_LANGUAGE

  return (
    <button
      onClick={toggleLanguage}
      suppressHydrationWarning
      className="flex items-center gap-2 rounded-full border border-white/60 bg-white/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition-all hover:bg-white/60 hover:border-white/80"
      title={displayLanguage === "vi" ? "Switch to English" : "Chuyển sang tiếng Việt"}
    >
      <span className="w-6 text-center">{displayLanguage.toUpperCase()}</span>
      <span className="h-4 w-px bg-white/40"></span>
      <span className="w-6 text-center text-white/50">
        {displayLanguage === "vi" ? "EN" : "VI"}
      </span>
    </button>
  )
}
