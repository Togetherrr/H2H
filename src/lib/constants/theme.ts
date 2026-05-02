/**
 * HEARTS2HEARTS (H2H) - OFFICIAL THEME CONFIGURATION
 * This file serves as the "source of truth" for the band's branding.
 * These values are defaults and can be overridden by the Admin via Supabase.
 */

export const H2H_THEMES = {
  SKY_BLUE_OFFICIAL: {
    id: "h2h-sky-blue",
    name: "Sky Blue Official",
    description: "The classic Hearts2Hearts debut branding.",
    colors: {
      // Primary Brand Color (Official Sky Blue)
      primary: {
        hex: "#4AA7E8",
        hsl: "202 88% 60%",
        description: "Official band color used for key branding and interactions."
      },
      // Premium Text Color (Midnight Navy) - High contrast & Elegance
      foreground: {
        hex: "#0F172A", // Slate-900 / Midnight Navy
        hsl: "222 47% 11%",
        description: "Reserved for headings and body text to ensure a premium feel."
      },
      // Background Surface (Soft Ice) - Professional & Airy
      background: {
        hex: "#E0F2FE", 
        hsl: "201 94% 94%",
        description: "Soft Sky Blue background (less white, more sky identity)."
      },
      // Accent Color (Heart Pink) - Capturing the "Hearts" in H2H
      accent: {
        hex: "#FF6B9D",
        hsl: "340 100% 71%",
        description: "Used sparingly for icons, highlights, and emotional touches."
      },
      // Secondary Branding (Soft Sky)
      secondary: {
        hex: "#BAE6FD",
        hsl: "199 89% 86%",
        description: "Used for panel backgrounds and muted UI elements (Clear Sky)."
      }
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
      foreground: { hex: "#0E7490", hsl: "192 78% 25%", description: "" },
      background: { hex: "#E0F2FE", hsl: "201 94% 94%", description: "" },
      accent: { hex: "#F43F5E", hsl: "350 89% 60%", description: "" },
      secondary: { hex: "#7DD3FC", hsl: "199 89% 74%", description: "" }
    }
  }
};

export type H2HTheme = typeof H2H_THEMES.SKY_BLUE_OFFICIAL;
export const DEFAULT_THEME = H2H_THEMES.SKY_BLUE_OFFICIAL;
