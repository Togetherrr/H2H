"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, Transition } from 'framer-motion'

const PAIRS = [
  { type: 'vertical', left: { tag: 'JIWOO', name: 'Jiwoo' }, right: { tag: 'CARMEN', name: 'Carmen' } },
  { type: 'horizontal', left: { tag: 'STELLA', name: 'Stella' }, right: { tag: 'YUHA', name: 'Yuha' } },
  { type: 'vertical', left: { tag: 'JUUN', name: 'Juun' }, right: { tag: 'A-NA', name: 'A-na' } },
  { type: 'horizontal', left: { tag: 'IAN', name: 'Ian' }, right: { tag: 'YEON', name: 'Yeon' } },
]

type LineupRevealProps = {
  onComplete: () => void
  memberImages?: Record<string, string>
}

export function LineupReveal({ onComplete, memberImages }: LineupRevealProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    // Tốc độ siêu nhanh: Mỗi cặp chỉ hiện trong 1.3 giây
    const timer = setTimeout(() => {
      if (index === PAIRS.length - 1) {
        onComplete()
      } else {
        setIndex(prev => prev + 1)
      }
    }, 1300) 
    return () => clearTimeout(timer)
  }, [index, onComplete])

  const current = PAIRS[index]

  // Hiệu ứng trượt cực nhanh (0.4s) và dứt khoát
  const transitionConfig: Transition = { 
    duration: 0.4, 
    ease: [0.25, 1, 0.5, 1] 
  }

  const getVariants = (side: 'L' | 'R', type: string) => {
    if (type === 'vertical') return { initial: { y: side === 'L' ? "-100%" : "100%" }, animate: { y: 0 } }
    return { initial: { x: side === 'L' ? "-100%" : "100%" }, animate: { x: 0 } }
  }

  const leftImage = memberImages?.[current.left.tag]
  const rightImage = memberImages?.[current.right.tag]

  return (
    <div className="fixed inset-0 z-[999] overflow-hidden font-body bg-white">
      {/* Nền Gradient tươi sáng */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-pink-100 opacity-60" />
      
      <AnimatePresence mode="wait">
        <motion.div 
          key={index} 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          transition={{ duration: 0.2 }} 
          className="relative w-full h-full grid grid-cols-2"
        >
          {/* Cạnh trái */}
          <div className="relative overflow-hidden border-r border-slate-200/50">
            <motion.div
              variants={getVariants('L', current.type)}
              initial="initial"
              animate="animate"
              transition={transitionConfig}
              className="absolute inset-0 bg-sky-50/40 flex items-center justify-center"
            >
              {leftImage ? (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${leftImage})` }}
                />
              ) : null}
              <div className="absolute inset-0 bg-white/30" />
              {!leftImage ? (
                <span className="text-sky-200/50 text-9xl font-display font-black italic select-none">
                  {current.left.tag}
                </span>
              ) : null}
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.2 }}
              className="absolute bottom-12 left-12 z-10"
            >
              <span className="pill-sky mb-2 inline-block bg-white/90 shadow-sm">{current.left.tag}</span>
              <h2 className="text-6xl font-display font-bold text-slate-800 uppercase tracking-tighter">
                {current.left.name}
              </h2>
            </motion.div>
          </div>

          {/* Cạnh phải */}
          <div className="relative overflow-hidden">
            <motion.div
              variants={getVariants('R', current.type)}
              initial="initial"
              animate="animate"
              transition={transitionConfig}
              className="absolute inset-0 bg-pink-50/40 flex items-center justify-center"
            >
              {rightImage ? (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${rightImage})` }}
                />
              ) : null}
              <div className="absolute inset-0 bg-white/30" />
              {!rightImage ? (
                <span className="text-pink-200/50 text-9xl font-display font-black italic select-none">
                  {current.right.tag}
                </span>
              ) : null}
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.5 }}
              className="absolute bottom-12 right-12 text-right flex flex-col items-end z-10"
            >
              <span className="pill-pink mb-2 inline-block bg-white/90 shadow-sm">{current.right.tag}</span>
              <h2 className="text-6xl font-display font-bold text-slate-800 uppercase tracking-tighter">
                {current.right.name}
              </h2>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Skip Button */}
      <button 
        onClick={onComplete} 
        className="absolute top-10 right-10 z-50 text-slate-400 text-[11px] tracking-widest uppercase hover:text-sky-500 font-bold font-display"
      >
        Skip ›
      </button>

      {/* Thanh tiến trình đồng bộ thời gian mới (1.3s) */}
      <div className="absolute bottom-0 left-0 h-1 bg-slate-100 w-full z-50">
        <motion.div 
          key={index}
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.0, ease: "linear" }}
          className="h-full bg-gradient-to-r from-sky-300 to-pink-300"
        />
      </div>
    </div>
  )
}