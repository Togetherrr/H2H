import type { Metadata } from "next"
import { Be_Vietnam_Pro, Playfair_Display } from "next/font/google"
import "./globals.css"

const bodyFont = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
})

const displayFont = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-display",
})

export const metadata: Metadata = {
  title: "H2H",
  description: "Landing page nhóm nhạc K-pop với phong cách editorial sân khấu.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>{children}</body>
    </html>
  )
}
