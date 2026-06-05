import { createClient } from "@/lib/supabase/server"

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
  try {
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from("themes")
      .select("*")
      .eq("is_active", true)
      .maybeSingle()

    if (error || !data) {
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

  const bgImageVar = assets?.background_image
    ? `--bg-album-art: url('${assets.background_image}'); --background-image: url('${assets.background_image}');`
    : ""

  return `
    :root {
      --primary: ${colors.primary};
      --accent: ${colors.accent};
      --foreground: ${colors.foreground};
      --surface: ${colors.surface || '0 0% 100%'};
      --background-fallback: ${colors.background_fallback || '222 47% 11%'};
      
      /* Asset Variables */
      ${bgImageVar}
    }
  `
}
