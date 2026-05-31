"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { motion } from "framer-motion"
import { Heart, MessageSquare, Send, X, ArrowRight, ThumbsUp, ThumbsDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

const CATEGORY_OPTIONS = [
  { value: "general", label: "General" },
  { value: "idea", label: "Idea" },
  { value: "bug", label: "Bug" },
  { value: "content", label: "Content" },
  { value: "other", label: "Other" },
]

export function FeedbackWidget() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [category, setCategory] = useState("general")
  const [rating, setRating] = useState<"good" | "normal" | "bad" | "">("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus("submitting")
    setFeedbackMessage("")

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, category, rating, message }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.error || "Could not submit feedback.")
      }

      setStatus("success")
      setFeedbackMessage("Thanks for the feedback. The admin team will see it soon.")
      setName("")
      setEmail("")
      setCategory("general")
      setRating("")
      setMessage("")
      setIsOpen(false)
    } catch (error) {
      setStatus("error")
      setFeedbackMessage(error instanceof Error ? error.message : "Could not submit feedback.")
    }
  }

  if (!mounted) return null

  return createPortal(
    <div className="fixed bottom-16 left-8 md:bottom-20 z-[9999] flex flex-col items-start gap-3 print:hidden pointer-events-none">
      <motion.div
        className={cn(
          "w-[18rem] sm:w-[21rem] max-w-[calc(100vw-4rem)] overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] origin-bottom-right mt-12",
          isOpen
            ? "scale-100 opacity-100 translate-y-0 pointer-events-auto"
            : "scale-90 opacity-0 translate-y-10 pointer-events-none"
        )}
        initial={false}
      >
        <div className="card-premium p-0 flex flex-col max-h-[24rem] shadow-[0_30px_70px_rgba(59,130,248,0.24)] border-white/40 overflow-hidden bg-gradient-to-br from-[#F4FBFF] via-[#EEF8FF] to-[#EAF3FF]">
          <div className="flex items-center justify-between p-4 border-b border-white/40 bg-white/35 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[1.1rem] bg-white text-sky-500 shadow-xl border border-white">
                <MessageSquare className="size-5 fill-current" />
              </div>
              <div>
                <h3 className="text-[12px] font-black uppercase tracking-widest text-black">Feedback</h3>
                <p className="text-[9px] font-bold text-sky-500 uppercase tracking-widest opacity-80">Send to admin</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full hover:bg-white/50 transition-colors text-black"
              aria-label="Close feedback"
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="p-4 overflow-y-auto custom-scrollbar">
            <p className="text-xs leading-5 text-slate-600">
              Feel free to share feedback about anything on the site. If you’d like us to follow up,
              you can leave an email below (optional).
            </p>

            <form onSubmit={handleSubmit} className="mt-3 space-y-3 text-left">
              <label className="space-y-2 text-left block">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300"
                />
              </label>

              <label className="space-y-2 text-left block">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Optional (for follow-up)"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300"
                />
              </label>

              <label className="block space-y-2 text-left">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Category</span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-300"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="space-y-2 text-left">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Overall</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRating("good")}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition",
                      rating === "good"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200"
                    )}
                  >
                    <ThumbsUp className="size-3.5" /> Good
                  </button>
                  <button
                    type="button"
                    onClick={() => setRating("normal")}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition",
                      rating === "normal"
                        ? "border-slate-300 bg-slate-50 text-slate-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    )}
                  >
                    <Minus className="size-3.5" /> Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setRating("bad")}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition",
                      rating === "bad"
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-rose-200"
                    )}
                  >
                    <ThumbsDown className="size-3.5" /> Bad
                  </button>
                </div>
              </div>

              <label className="block space-y-2 text-left">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Message</span>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={4}
                  placeholder="Write your feedback here..."
                  className="w-full rounded-3xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300"
                />
              </label>

              {feedbackMessage ? (
                <p className={`rounded-2xl px-4 py-3 text-sm ${status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                  {feedbackMessage}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="size-4" />
                {status === "submitting" ? "Sending..." : "Send feedback"}
              </button>
            </form>
          </div>
        </div>
      </motion.div>

      <div className="relative pointer-events-auto">
        {!isOpen && (
          <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 whitespace-nowrap px-4 py-2 rounded-xl bg-sky-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl animate-in fade-in slide-in-from-left-4 duration-500 hidden pointer-events-none">
            FEEDBACK
            <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-sky-600 rotate-45" />
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full shadow-[0_15px_40px_rgba(56,189,248,0.28)] transition-all duration-500 hover:scale-110 active:scale-95 group relative ring-4 ring-white/80",
            isOpen
              ? "bg-slate-950 text-white"
              : "bg-gradient-to-br from-[#F4FBFF] to-[#D9F0FF] text-sky-500 border-2 border-white/80"
          )}
        >
          <div className={cn("transition-transform duration-500", isOpen ? "rotate-90" : "rotate-0")}>
            {isOpen ? <X className="size-6" /> : <MessageSquare className="size-6 group-hover:animate-bounce" />}
          </div>
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-[9px] font-black text-white ring-4 ring-white shadow-lg pointer-events-none">
              FB
            </span>
          )}
        </button>
      </div>
    </div>,
    document.body
  )
}