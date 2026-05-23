"use client"

import { useEffect, useState } from "react"
import { ArrowRight, Megaphone, MessageSquare, Pin, Plus, Send, X } from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"
import { ALL_NOTICES } from "@/lib/notices"
import { cn } from "@/lib/utils"
import { AppLink } from "@/components/app-link"

const CATEGORY_OPTIONS = [
  { value: "general", label: "General" },
  { value: "idea", label: "Idea" },
  { value: "bug", label: "Bug" },
  { value: "content", label: "Content" },
  { value: "other", label: "Other" },
]

type ActiveTab = "notices" | "feedback"

export function NoticeFeedbackHub() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>("notices")
  const [hasNew, setHasNew] = useState(true)

  const [name, setName] = useState("")
  const [category, setCategory] = useState("general")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [feedbackMessage, setFeedbackMessage] = useState("")

  useEffect(() => {
    if (isOpen && activeTab === "notices") setHasNew(false)
  }, [isOpen, activeTab])

  const recentNotices = ALL_NOTICES.slice(0, 3)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus("submitting")
    setFeedbackMessage("")

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, message }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.error || "Could not submit feedback.")
      }

      setStatus("success")
      setFeedbackMessage("Thanks for the feedback. The admin team will see it soon.")
      setName("")
      setCategory("general")
      setMessage("")
    } catch (error) {
      setStatus("error")
      setFeedbackMessage(error instanceof Error ? error.message : "Could not submit feedback.")
    }
  }

  return (
    <div className="fixed bottom-28 right-8 md:bottom-32 z-[1000] flex flex-col items-end gap-6 print:hidden pointer-events-none">
      <div
        className={cn(
          "w-[calc(100vw-3.5rem)] sm:w-[26rem] overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] origin-bottom-right",
          isOpen
            ? "scale-100 opacity-100 translate-y-0 pointer-events-auto"
            : "scale-90 opacity-0 translate-y-10 pointer-events-none"
        )}
      >
        <div className="card-premium p-0 flex flex-col max-h-[75vh] shadow-[0_30px_70px_rgba(196,217,255,0.45)] border-white/40 overflow-hidden bg-gradient-to-br from-[#F8FBFF] to-[#FFF0F5]">
          <div className="flex items-center justify-between p-6 border-b border-white/20 bg-white/25 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1.1rem] bg-white text-slate-800 shadow-xl border border-white">
                {activeTab === "notices" ? <Pin className="size-5" /> : <MessageSquare className="size-5" />}
              </div>
              <div>
                <h3 className="text-[13px] font-black uppercase tracking-widest text-black">Updates Hub</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest opacity-80">Notices & feedback</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2.5 rounded-full hover:bg-white/40 transition-colors text-black"
              aria-label="Close hub"
              type="button"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="px-6 pt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("notices")}
              className={cn(
                "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition",
                activeTab === "notices"
                  ? "bg-black text-white"
                  : "bg-white/70 text-slate-500 hover:text-slate-900"
              )}
            >
              Notices
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("feedback")}
              className={cn(
                "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition",
                activeTab === "feedback"
                  ? "bg-black text-white"
                  : "bg-white/70 text-slate-500 hover:text-slate-900"
              )}
            >
              Feedback
            </button>
          </div>

          <div className="overflow-y-auto p-5 pt-4 flex flex-col gap-4 custom-scrollbar">
            {activeTab === "notices" ? (
              recentNotices.length > 0 ? (
                <>
                  {recentNotices.map((notice) => (
                    <AppLink
                      key={notice.id}
                      href="/notices"
                      onClick={() => setIsOpen(false)}
                      className="group relative p-6 rounded-[2rem] bg-white/40 border border-white/40 transition-all hover:bg-white/70 hover:-translate-y-1 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-white text-[#FF708A] shadow-sm">
                          {t(`notice.type.${notice.type}` as any)}
                        </span>
                        <span className="text-[10px] font-bold text-black opacity-60">
                          {notice.date}
                        </span>
                      </div>
                      <h4 className="text-[15px] font-black text-black group-hover:text-[#FF708A] transition-colors line-clamp-2 leading-tight">
                        {notice.title_en}
                      </h4>
                    </AppLink>
                  ))}

                  {ALL_NOTICES.length > 3 && (
                    <div className="py-2 text-center">
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 text-[10px] font-black uppercase tracking-[0.2em] text-[#FF708A]">
                        <Plus className="size-3" />
                        {`+${ALL_NOTICES.length - 3} MORE UPDATES`}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-sm font-bold text-black opacity-40 uppercase tracking-widest">{t("notice.empty")}</p>
                </div>
              )
            ) : (
              <>
                <p className="text-xs leading-5 text-slate-600">
                  Share ideas, bugs, or anything you want the admin team to see.
                </p>

                <form onSubmit={handleSubmit} className="space-y-3 text-left">
                  <label className="space-y-2 text-left block">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Name</span>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Optional"
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
              </>
            )}
          </div>

          {activeTab === "notices" && (
            <AppLink
              href="/notices"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-3 p-6 text-[12px] font-black uppercase tracking-[0.3em] text-white bg-[#FF708A] hover:bg-black transition-all shadow-lg active:scale-95"
            >
              <span>{t("notice.viewAll")}</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-2" />
            </AppLink>
          )}
        </div>
      </div>

      {!isOpen && (
        <div className="relative pointer-events-auto">
          {hasNew && (
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 whitespace-nowrap px-4 py-2 rounded-xl bg-black text-white text-[10px] font-black uppercase tracking-widest shadow-xl animate-in fade-in slide-in-from-right-4 duration-500 hidden sm:block pointer-events-none">
              NEW UPDATES
              <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-black rotate-45" />
            </div>
          )}
          <div className="w-[calc(100vw-3.5rem)] sm:w-[18rem] rounded-[1.6rem] border border-white/70 bg-white/85 backdrop-blur-md shadow-[0_18px_40px_rgba(196,217,255,0.28)] p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Updates Hub</p>
                <p className="text-[12px] font-semibold text-slate-900">Notices & feedback</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white"
                aria-label="Open updates hub"
              >
                <Megaphone className="size-4" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("notices")
                  setIsOpen(true)
                }}
                className="flex items-center justify-between rounded-[1.1rem] border border-white/80 bg-white/70 px-3 py-2 text-left transition hover:bg-white"
              >
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#FF708A]">
                  <Pin className="size-3.5" /> Notices
                </span>
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#FF708A] px-2 text-[9px] font-black text-white">
                  {ALL_NOTICES.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("feedback")
                  setIsOpen(true)
                }}
                className="flex items-center justify-between rounded-[1.1rem] border border-white/80 bg-white/70 px-3 py-2 text-left transition hover:bg-white"
              >
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-sky-500">
                  <MessageSquare className="size-3.5" /> Feedback
                </span>
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-sky-500 px-2 text-[9px] font-black text-white">
                  FB
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
