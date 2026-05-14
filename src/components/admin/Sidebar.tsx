"use client"

import Link from "next/link"
import { Users, Link as LinkIcon, Disc, ArrowLeft, LogOut, LayoutDashboard, Settings, Sparkles, Image as ImageIcon, BadgeCheck } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { name: "Overview", value: "overview", icon: LayoutDashboard },
  { name: "Users", value: "users", icon: Users },
  { name: "Members", value: "members", icon: Users },
  { name: "Voting Apps", value: "voting", icon: BadgeCheck },
  { name: "Themes", value: "themes", icon: Sparkles },
  { name: "Media", value: "media", icon: ImageIcon },
  { name: "Social Links", value: "socials", icon: LinkIcon },
  { name: "Site Settings", value: "settings", icon: Settings },
]

export function Sidebar({
  currentTab,
  onTabChange,
}: {
  currentTab: string
  onTabChange: (tab: string) => void
}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-950 pb-6 pt-8 backdrop-blur-xl">
      <div className="px-6">
        <Link
          href="/home"
          className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Home
        </Link>
        <div className="mt-8">
          <h1 className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-100">Admin Console</h1>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">H2H Content Hub</p>
        </div>
      </div>

      <nav className="mt-10 flex flex-1 flex-col gap-1 px-4">
        {NAV_ITEMS.map((item) => {
          const isActive = currentTab === item.value
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onTabChange(item.value)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-slate-800 text-white shadow-md shadow-black/20"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              )}
            >
              <item.icon className={cn("size-5", isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300")} />
              {item.name}
            </button>
          )
        })}
      </nav>

      <div className="px-4 mt-auto">
        <div className="flex flex-col gap-1">
          <Link
            href="/account"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-slate-900 hover:text-slate-200"
          >
            <Settings className="size-5 text-slate-500" />
            Account
          </Link>
          <Link
            href="/auth/signout"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-rose-500 transition hover:bg-slate-900/50 hover:text-rose-400"
          >
            <LogOut className="size-5 text-rose-500" />
            Sign out
          </Link>
        </div>
      </div>
    </aside>
  )
}
