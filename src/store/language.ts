import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Language } from "@/i18n/translations"

interface LanguageStore {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      language: "vi",
      setLanguage: (lang: Language) => set({ language: lang }),
      toggleLanguage: () => {
        const current = get().language
        set({ language: current === "vi" ? "en" : "vi" })
      },
    }),
    {
      name: "h2h-language",
    }
  )
)
