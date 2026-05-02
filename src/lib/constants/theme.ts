/**
 * HEARTS2HEARTS (H2H) - OFFICIAL THEME CONFIGURATION
 * This file serves as the "source of truth" for the band's branding.
 * Background colors are replaced by Background Images per Album.
 */

export const H2H_THEMES = {
  SKY_BLUE_OFFICIAL: {
    id: "h2h-sky-blue",
    name: "Sky Blue Official",
    description: "The classic Hearts2Hearts debut branding.",
    colors: {
      primary: { hex: "#4AA7E8", hsl: "202 88% 60%", description: "Official band color used for key branding and interactions." },
      surface: { hex: "#FFFFFF", hsl: "0 0% 100%", description: "Background color for cards, panels, and popups." },
      foreground: { hex: "#0F172A", hsl: "222 47% 11%", description: "Reserved for headings and body text to ensure a premium feel." },
      accent: { hex: "#FF6B9D", hsl: "340 100% 71%", description: "Used sparingly for icons, highlights, and emotional touches." },
      background_fallback: { hex: "#E0F2FE", hsl: "201 94% 94%", description: "Fallback solid color while image loads." }
    },
    assets: {
      logo: "/logo-official-removebg-.png",
      background_image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop"
    },
    effects: {
      film_grain: true,
      glow_orbs: true,
      floating_hearts: false
    },
    glassmorphism: {
      opacity: 0.35,
      blur: "12px",
      border: "rgba(255, 255, 255, 0.45)"
    },
    fonts: {
      display: "var(--font-display)",
      body: "var(--font-body)"
    }
  },
  THE_CHASE: {
    id: "h2h-the-chase",
    name: "The Chase Concept",
    description: "Inspired by the 1st Single Album 'The Chase'.",
    colors: {
      primary: { hex: "#7DD3FC", hsl: "199 89% 74%", description: "" },
      surface: { hex: "#082f49", hsl: "204 80% 16%", description: "" },
      foreground: { hex: "#0E7490", hsl: "192 78% 25%", description: "" },
      accent: { hex: "#F43F5E", hsl: "350 89% 60%", description: "" },
      background_fallback: { hex: "#E0F2FE", hsl: "201 94% 94%", description: "" }
    },
    assets: {
      logo: "/logo-official-removebg-.png",
      background_image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop"
    },
    effects: {
      film_grain: true,
      glow_orbs: false,
      floating_hearts: true
    }
  }
};

export type H2HTheme = typeof H2H_THEMES.SKY_BLUE_OFFICIAL;
export const DEFAULT_THEME = H2H_THEMES.SKY_BLUE_OFFICIAL;
