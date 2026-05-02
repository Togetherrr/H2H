import { createClient } from "@/lib/supabase/server"

export interface ThemeConfig {
  colors: {
    primary: string
    secondary: string
    background: string
    accent: string
    foreground?: string
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
  const supabase = await createClient()
  
  const { data, error } = await (supabase as any)
    .from("themes")
    .select("*")
    .eq("is_active", true)
    .maybeSingle()

  if (error || !data) {
    if (error) console.error("Error fetching active theme:", error)
    return null
  }

  return data as unknown as Theme
}

export function generateThemeStyle(theme: Theme | null): string {
  if (!theme) return ""

  const { colors, assets } = theme.config
  
  return `
    :root {
      --primary: ${colors.primary};
      --secondary: ${colors.secondary};
      --background: ${colors.background};
      --foreground: ${colors.foreground || '222 47% 11%'};
      --accent: ${colors.accent};
      --background-image: ${assets.background_image ? `url('${assets.background_image}')` : 'none'};
    }
  `
}
