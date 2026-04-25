import { create } from "zustand"
import {
  DEFAULT_LANGUAGE,
  normalizeLanguage,
  type Language,
} from "@/i18n/translations"

interface LanguageStore {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
}

export const useLanguageStore = create<LanguageStore>()(
  (set, get) => ({
    language: DEFAULT_LANGUAGE,
    setLanguage: (lang: Language) => set({ language: normalizeLanguage(lang) }),
    toggleLanguage: () => {
      const current = get().language
      set({ language: current === "vi" ? "en" : "vi" })
    },
  })
)
