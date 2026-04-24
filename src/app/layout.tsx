import type { Metadata } from "next"
import { Merriweather, Playfair_Display } from "next/font/google"
import { ClientProvider } from "@/components/client-provider"
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  )
}
