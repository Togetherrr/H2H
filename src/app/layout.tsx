import type { Metadata } from "next"
import { Baloo_2 } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { ClientProvider } from "@/components/client-provider"
import { NoticeBoard } from "@/components/notice-board"
import { AmbientLayer } from "@/components/ambient-layer"
import { getActiveTheme, generateThemeStyle } from "@/lib/theme-service"
import "./globals.css"

const bodyFont = Baloo_2({
  subsets: ["latin", "vietnamese"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
})

const displayFont = Baloo_2({
  subsets: ["latin", "vietnamese"],
  variable: "--font-display",
  weight: ["700", "800"],
})

export const metadata: Metadata = {
  title: "Hearts2Hearts | Official Fan Home",
  description: "An official fan home for S2U with a Baby Blue and Baby Pink visual theme.",
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const activeTheme = await getActiveTheme()
  const themeCss = generateThemeStyle(activeTheme)

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {themeCss && <style dangerouslySetInnerHTML={{ __html: themeCss }} />}
      </head>
      <body className={`${bodyFont.variable} ${displayFont.variable} antialiased`} suppressHydrationWarning>
        <AmbientLayer effects={activeTheme?.config?.effects} />
        <ClientProvider>
          {children}
          <NoticeBoard />
        </ClientProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
