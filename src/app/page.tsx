"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LineupReveal } from "@/components/lineup-reveal"
import { AnimatePresence, motion } from "framer-motion"

export default function LandingPage() {
  const router = useRouter()
  const [isIntroDone, setIsIntroDone] = useState(false)

  useEffect(() => {
    router.prefetch("/home")
  }, [router])

  const handleIntroComplete = () => {
    setIsIntroDone(true)
    // Chuyển hướng ngay lập tức sang Home
    router.replace("/home")
  }

  return (
    // Đổi bg sang trắng/sky nhạt để tiệp màu với Intro mới
    <main className="min-h-[100dvh] relative bg-white overflow-hidden">
      <AnimatePresence mode="wait">
        {!isIntroDone ? (
          <LineupReveal key="intro" onComplete={handleIntroComplete} />
        ) : (
          <motion.div
            key="out"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.3 }} // Chuyển cảnh nhanh hơn
            className="fixed inset-0 z-[1000] bg-white"
          />
        )}
      </AnimatePresence>
    </main>
  )
}

