import type { Metadata } from "next"
import { Inter, Montserrat } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { ClientProvider } from "@/components/client-provider"
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${bodyFont.variable} ${displayFont.variable} antialiased`} suppressHydrationWarning>
        <ClientProvider>{children}</ClientProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
