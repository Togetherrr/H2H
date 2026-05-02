import type { Metadata } from "next"
import { Merriweather, Playfair_Display } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { ClientProvider } from "@/components/client-provider"
import { getActiveTheme, generateThemeStyle } from "@/lib/theme-service"
import "./globals.css"

const bodyFont = Merriweather({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
  variable: "--font-body",
})

const displayFont = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-display",
})

export const metadata: Metadata = {
  title: "H2H Home",
  description: "Homepage Hearts2Hearts với concept film-strip, logo remove và bảng màu skyblue.",
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const theme = await getActiveTheme()
  const themeStyle = generateThemeStyle(theme)

  return (
    <html 
      lang="vi" 
      suppressHydrationWarning
      data-film-grain={theme?.config.effects.film_grain}
      data-glow-orbs={theme?.config.effects.glow_orbs}
      data-floating-hearts={theme?.config.effects.floating_hearts}
    >
      <head>
        {themeStyle && <style dangerouslySetInnerHTML={{ __html: themeStyle }} />}
      </head>
      <body className={`${bodyFont.variable} ${displayFont.variable}`} suppressHydrationWarning>
        <ClientProvider>{children}</ClientProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
