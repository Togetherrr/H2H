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

/** Default theme values matching globals.css :root */
const DEFAULT_THEME: Theme = {
  id: "default",
  name: "Default",
  config: {
    colors: {
      primary: "200 80% 62%",
      accent: "345 100% 85%",
      foreground: "210 40% 96%",
      surface: "220 30% 15%",
      background_fallback: "222 47% 11%",
    },
    assets: {
      logo: "/logo-official-removebg-.png",
      background_image: null,
    },
    effects: {
      film_grain: true,
      glow_orbs: true,
      floating_hearts: false,
    },
  },
  is_active: true,
}

export async function getActiveTheme(): Promise<Theme> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return DEFAULT_THEME
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
      return DEFAULT_THEME
    }

    return data as unknown as Theme
  } catch {
    return DEFAULT_THEME
  }
}

export function generateThemeStyle(theme: Theme | null): string {
  const resolvedTheme = theme ?? DEFAULT_THEME
  const { colors, assets } = resolvedTheme.config
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
