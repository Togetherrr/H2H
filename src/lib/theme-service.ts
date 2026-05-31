import { createStaticClient } from "@/lib/supabase/static"

export interface ThemeConfig {
  colors: {
    primary: string
    accent: string
    foreground: string
    surface: string
    background_fallback?: string
  }
  assets: {
    logo: string
    background_image: string | null
  }
  effects: {
    film_grain: boolean
    glow_orbs: boolean
    floating_hearts: boolean
  }
}

export interface Theme {
  id: string
  name: string
  config: ThemeConfig
  is_active: boolean
}

export async function getActiveTheme(): Promise<Theme | null> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return null
  }

  const supabase = createStaticClient()
  
  try {
    const { data, error } = await (supabase as any)
      .from("themes")
      .select("*")
      .eq("is_active", true)
      .maybeSingle()

    if (error || !data) {
      if (error && process.env.H2H_LOG_THEME_ERRORS === "1" && process.env.NODE_ENV !== "production") {
        console.error("Error fetching active theme:", error)
      }
      return null
    }

    return data as unknown as Theme
  } catch {
    return null
  }
}

export function generateThemeStyle(theme: Theme | null): string {
  if (!theme || !theme.config || !theme.config.colors) return ""

  const { colors, assets } = theme.config
  const primary = colors.primary?.trim() || "200 80% 62%"
  const accent = colors.accent?.trim() || "345 100% 85%"
  const foreground = colors.foreground?.trim() || "210 40% 96%"
  const surface = colors.surface?.trim() || "220 30% 15%"
  const backgroundFallback = colors.background_fallback?.trim() || "222 47% 11%"
  const bgImageVar = assets?.background_image?.trim()
    ? `--background-image: url('${assets.background_image.trim()}');`
    : ""
  
  return `
    :root {
      --primary: ${primary};
      --accent: ${accent};
      --foreground: ${foreground};
      --surface: ${surface};
      --background-fallback: ${backgroundFallback};
      
      /* Asset Variables */
      ${bgImageVar}
    }
  `
}
