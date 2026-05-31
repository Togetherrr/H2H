import type { Metadata } from "next"
import { Toaster } from "@/components/ui/sonner"
import { ClientProvider } from "@/components/client-provider"
import { AmbientLayer } from "@/components/ambient-layer"
import { ConditionalSiteFooter } from "@/components/conditional-site-footer"
import { getActiveTheme, generateThemeStyle } from "@/lib/theme-service"
import "./globals.css"

export const metadata: Metadata = {
  title: "S2U HUB",
  description: "For S2U.",
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const activeTheme = await getActiveTheme()
  const themeCss = generateThemeStyle(activeTheme)

  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={{ "--font-nunito": "ui-sans-serif, system-ui, sans-serif" } as React.CSSProperties}
    >
      <head>
        {themeCss && <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: themeCss }} />}
      </head>
      <body className="antialiased font-sans" suppressHydrationWarning>
        <AmbientLayer effects={activeTheme?.config?.effects} />
        <ClientProvider>
          {children}
          <ConditionalSiteFooter />
        </ClientProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
