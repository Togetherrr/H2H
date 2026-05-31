"use client"
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LineupReveal } from "@/components/lineup-reveal"
import { AnimatePresence, motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/database.types"

export default function LandingPage() {
  const router = useRouter()
  const [isIntroDone, setIsIntroDone] = useState(false)
  const [memberImages, setMemberImages] = useState<Record<string, string>>({})
  const [isRevealReady, setIsRevealReady] = useState(false)
  const [isBackNav, setIsBackNav] = useState(false)

  useEffect(() => {
    // Nếu user navigate back về trang này thì redirect thẳng sang /home
    // mà không hiện landing page
    try {
      const entries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[]
      if (entries.length > 0 && entries[0].type === "back_forward") {
        setIsBackNav(true)
        router.replace("/home")
        return
      }
    } catch {
      // ignore nếu browser không hỗ trợ
    }

    // prefetch trang home để trình duyệt nạp sẵn dữ liệu và ảnh nền
    router.prefetch("/home")
  }, [router])

  useEffect(() => {
    let isMounted = true

    const loadLineupRevealImages = async () => {
      const supabase = createClient()
      type SiteSettingsMetadata = Database["public"]["Tables"]["site_settings"]["Row"]["metadata"]

      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("metadata")
          .eq("id", 1)
          .limit(1)
          .maybeSingle<{ metadata: SiteSettingsMetadata }>()

        if (error) {
          console.warn("LandingPage: site_settings query failed", error)
          return
        }

        const rawImages = (data?.metadata as { lineup_reveal_images?: Record<string, string> } | null)?.lineup_reveal_images

        if (!isMounted) return

        if (rawImages && typeof rawImages === "object") {
          const normalized = Object.fromEntries(
            Object.entries(rawImages)
              .filter(([, value]) => typeof value === "string" && value.trim().length > 0)
              .map(([key, value]) => [key, (value as string).trim()])
          )

          setMemberImages(normalized)

          // Preload all images before starting the reveal
          const imageUrls = [...Object.values(normalized), "/background.jpg"] as string[]
          await Promise.all(
            imageUrls.map((url) => {
              return new Promise((resolve) => {
                const img = new Image()
                img.src = url
                img.onload = resolve
                img.onerror = resolve
              })
            })
          )
        }
      } catch (error) {
        console.warn("LandingPage: failed to load lineup images", error)
      } finally {
        if (isMounted) setIsRevealReady(true)
      }
    }

    void loadLineupRevealImages()

    return () => {
      isMounted = false
    }
  }, [])

  const handleIntroComplete = () => {
    setIsIntroDone(true)

    // chuyển hướng sau khi hiệu ứng fade-out đã bắt đầu
    setTimeout(() => {
      router.replace("/home")
    }, 100)
  }

  // Không hiện landing page nếu user đang navigate back
  if (isBackNav) return null

  return (
    /* mình sử dụng style giống hết globals.css của bạn
       để tạo sự đồng nhất ngay từ lớp nền của landing page
    */
    <main className="min-h-[100dvh] relative bg-[#1a2238] overflow-hidden">
      <AnimatePresence mode="wait">
        {!isRevealReady ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#A2D2FF]"
          >
            {/* Hiệu ứng ánh sáng trắng dịu nhẹ phía sau logo */}
            <div className="absolute size-96 bg-white/40 blur-[120px] rounded-full animate-pulse" />

            <div className="relative flex flex-col items-center">
              <motion.div
                animate={{
                  scale: [1, 1.03, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative z-10 flex flex-col items-center gap-6"
              >
                <img
                  src="/logo-official-removebg-.png"
                  alt="Loading Logo"
                  className="size-24 md:size-28 object-contain filter drop-shadow-sm"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
                <h1 className="text-slate-800/80 font-black uppercase tracking-[0.6em] text-[10px] md:text-xs text-center">
                  HEARTS2HEARTS
                </h1>
              </motion.div>
            </div>
          </motion.div>
        ) : !isIntroDone ? (
          <LineupReveal key="intro" onComplete={handleIntroComplete} memberImages={memberImages} />
        ) : (
          /* Sử dụng các class Tailwind để khớp hoàn toàn với globals.css:
             - bg-[#1a2238]: Màu nền chính
             - bg-[url('/background.jpg')]: Ảnh nền album art
             - bg-cover, bg-center, bg-fixed, bg-no-repeat: Các thuộc tính hiển thị
          */
          <motion.div
            key="out"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[1000] bg-[#1a2238] bg-[url('/background.jpg')] bg-cover bg-center bg-fixed bg-no-repeat"
          />
        )}
      </AnimatePresence>
      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </main>
  )
}

