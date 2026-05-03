import type { Metadata } from "next"
import { Inter, Montserrat } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { ClientProvider } from "@/components/client-provider"
import { NoticeBoard } from "@/components/notice-board"
import { getActiveTheme, generateThemeStyle } from "@/lib/theme-service"
import "./globals.css"

const bodyFont = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
})

const displayFont = Montserrat({
  subsets: ["latin", "vietnamese"],
  variable: "--font-display",
  weight: ["400", "700", "900"],
})

export const metadata: Metadata = {
  title: "Hearts2Hearts | Official Fan Home",
  description: "Không gian trải nghiệm dành riêng cho S2U với sắc màu Baby Blue & Baby Pink.",
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const activeTheme = await getActiveTheme()
  const themeCss = generateThemeStyle(activeTheme)

  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        {themeCss && <style dangerouslySetInnerHTML={{ __html: themeCss }} />}
      </head>
      <body className={`${bodyFont.variable} ${displayFont.variable} antialiased`} suppressHydrationWarning>
        <ClientProvider>
          {children}
          <NoticeBoard />
        </ClientProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
