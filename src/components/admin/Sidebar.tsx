"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Users, Link as LinkIcon, Disc, ArrowLeft, LogOut, LayoutDashboard, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { name: "Overview", value: "overview", icon: LayoutDashboard },
  { name: "Users", value: "users", icon: Users },
  { name: "Members", value: "members", icon: Users },
  { name: "Social Links", value: "socials", icon: LinkIcon },
]

export function Sidebar() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentTab = searchParams.get("tab") || "overview"

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white/80 pb-6 pt-8 backdrop-blur-xl">
      <div className="px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft className="size-4" />
          Home
        </Link>
        <div className="mt-8">
          <h1 className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-900">Admin Console</h1>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">H2H Content Hub</p>
        </div>
      </div>

      <nav className="mt-10 flex flex-1 flex-col gap-1 px-4">
        {NAV_ITEMS.map((item) => {
          const isActive = currentTab === item.value
          return (
            <button
              key={item.value}
              onClick={() => router.push(`?tab=${item.value}`)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-slate-950 text-white shadow-md shadow-slate-950/10"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("size-5", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900")} />
              {item.name}
            </button>
          )
        })}
      </nav>

      <div className="px-4 mt-auto">
        <div className="flex flex-col gap-1">
          <Link
            href="/account"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Settings className="size-5 text-slate-400" />
            Account
          </Link>
          <Link
            href="/auth/signout"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
          >
            <LogOut className="size-5 text-rose-400" />
            Sign out
          </Link>
        </div>
      </div>
    </aside>
  )
}
