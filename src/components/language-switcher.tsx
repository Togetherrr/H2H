"use client"

import { useLanguageStore } from "@/store/language"

export function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguageStore()

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 rounded-full border border-white/60 bg-white/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition-all hover:bg-white/60 hover:border-white/80"
      title={language === "vi" ? "Switch to English" : "Chuyển sang tiếng Việt"}
    >
      <span className="w-6 text-center">{language.toUpperCase()}</span>
      <span className="h-4 w-px bg-white/40"></span>
      <span className="w-6 text-center text-white/50">
        {language === "vi" ? "EN" : "VI"}
      </span>
    </button>
  )
}
