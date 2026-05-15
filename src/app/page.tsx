"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LineupReveal } from "@/components/lineup-reveal"
import { AnimatePresence, motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"

export default function LandingPage() {
  const router = useRouter()
  const [isIntroDone, setIsIntroDone] = useState(false)
  const [memberImages, setMemberImages] = useState<Record<string, string>>({})
  const [isRevealReady, setIsRevealReady] = useState(false)

  useEffect(() => {
    // prefetch trang home để trình duyệt nạp sẵn dữ liệu và ảnh nền
    router.prefetch("/home")
  }, [router])

  useEffect(() => {
    let isMounted = true

    const loadLineupRevealImages = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("site_settings").select("metadata").eq("id", 1).maybeSingle()
      const rawImages = (data?.metadata as any)?.lineup_reveal_images

      if (!isMounted) {
        return
      }

      if (rawImages && typeof rawImages === "object") {
        const normalized = Object.fromEntries(
          Object.entries(rawImages)
            .filter(([, value]) => typeof value === "string" && value.trim().length > 0)
            .map(([key, value]) => [key, (value as string).trim()])
        )

        setMemberImages(normalized)
      }

      setIsRevealReady(true)
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

  return (
    /* mình sử dụng style giống hệt globals.css của bạn 
       để tạo sự đồng nhất ngay từ lớp nền của landing page 
    */
    <main className="min-h-[100dvh] relative bg-[#1a2238] overflow-hidden">
      <AnimatePresence mode="wait">
        {!isRevealReady ? null : !isIntroDone ? (
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
          * { animation: none !important; transition: none !important; }
        }
      `}</style>
    </main>
  )
}