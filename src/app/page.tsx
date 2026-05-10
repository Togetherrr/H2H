"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LineupReveal } from "@/components/lineup-reveal"
import { AnimatePresence, motion } from "framer-motion"

export default function LandingPage() {
  const router = useRouter()
  const [isIntroDone, setIsIntroDone] = useState(false)

  useEffect(() => {
    // prefetch trang home để trình duyệt nạp sẵn dữ liệu và ảnh nền
    router.prefetch("/home")
  }, [router])

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
  {!isIntroDone ? (
    <LineupReveal key="intro" onComplete={handleIntroComplete} />
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