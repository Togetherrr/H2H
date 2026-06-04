"use client"

import { Users, Link as LinkIcon, Disc, ArrowLeft, LogOut, LayoutDashboard, Settings, Sparkles, Image as ImageIcon, BadgeCheck, Film, CalendarClock, Trophy, MessageSquare, RefreshCw, Megaphone } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { name: "Overview", value: "overview", icon: LayoutDashboard },
  { name: "Sync", value: "sync", icon: RefreshCw },
  { name: "Users", value: "users", icon: Users },
  { name: "Members", value: "members", icon: Users },
  { name: "Voting Apps", value: "voting", icon: BadgeCheck },
  { name: "Award Events", value: "award-events", icon: Trophy },
  { name: "Lineup Reveal", value: "lineup-reveal", icon: ImageIcon },
  { name: "Career Records", value: "career-records", icon: Film },
  { name: "YouTube MV", value: "youtube-items", icon: Film },
  { name: "Themes", value: "themes", icon: Sparkles },
  { name: "Comeback", value: "comeback", icon: CalendarClock },
  { name: "Notices", value: "notices", icon: Megaphone },
  { name: "Feedback", value: "feedback", icon: MessageSquare },
  { name: "Media", value: "media", icon: ImageIcon },
  { name: "Social Links", value: "socials", icon: LinkIcon },
  { name: "Site Settings", value: "settings", icon: Settings },
]

export function Sidebar({
  currentTab,
}: {
  currentTab: string
}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col overflow-hidden border-r border-slate-800 bg-slate-950 pb-6 pt-8 backdrop-blur-xl">
      <div className="shrink-0 px-6">
        <a
          href="/home"
          className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Home
        </a>
      </div>

      <nav className="mt-10 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-4">
        {NAV_ITEMS.map((item) => {
          const isActive = currentTab === item.value
          const href = item.value === "overview" ? "/admin" : `/admin?tab=${item.value}`
          return (
            <a
              key={item.value}
              href={href}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-slate-800 text-white shadow-md shadow-black/20"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              )}
            >
              <item.icon className={cn("size-5", isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300")} />
              {item.name}
            </a>
          )
        })}
        <div className="mt-auto flex shrink-0 flex-col gap-1 pt-2">
          <a
            href="/account"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-slate-900 hover:text-slate-200"
          >
            <Settings className="size-5 text-slate-500" />
            Account
          </a>
        </div>
      </nav>

      <div className="shrink-0 px-4 pt-2">
        <a
          href="/auth/signout"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-rose-500 transition hover:bg-slate-900/50 hover:text-rose-400"
        >
          <LogOut className="size-5 text-rose-500" />
          Sign out
        </a>
      </div>
    </aside>
  )
}
