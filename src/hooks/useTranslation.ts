"use client"

import { useLanguageStore } from "@/store/language"
import { getTranslation, type TranslationKey } from "@/i18n/translations"

export function useTranslation() {
  const language = useLanguageStore((state) => state.language)

  return {
    t: <K extends TranslationKey>(key: K) => getTranslation(language, key),
    lang: language,
  }
}
