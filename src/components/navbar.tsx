"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Clock, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/useTranslation"
import { createClient } from "@/lib/supabase/client"
import { AppLink } from "@/components/app-link"

export type TimeZone = "KST" | "EDT" | "UTC" | "LOCAL"

type HeaderAccount = {
  avatarUrl: string | null
  displayName: string
  href: string
  isAdmin: boolean
}

function TimeZoneSwitcher({ 
  currentTimeZone, 
  onTimeZoneChange 
}: { 
  currentTimeZone: TimeZone, 
  onTimeZoneChange?: (tz: TimeZone) => void 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const options: TimeZone[] = ["KST", "EDT", "UTC", "LOCAL"]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        suppressHydrationWarning
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-600 transition hover:bg-white hover:border-sky-200"
      >
        <Clock className="size-3.5 text-sky-500" />
        <span>{currentTimeZone}</span>
        <ChevronDown className={cn("size-3 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-xl animate-in fade-in zoom-in duration-200">
          {options.map((tz) => (
            <button
              key={tz}
              onClick={() => {
                if (onTimeZoneChange) onTimeZoneChange(tz)
                setIsOpen(false)
              }}
              className={cn(
                "w-full px-4 py-2 text-left text-[11px] font-black uppercase tracking-widest transition-colors rounded-xl",
                currentTimeZone === tz 
                  ? "bg-sky-50 text-sky-600" 
                  : "text-slate-500 hover:bg-slate-50"
              )}
            >
              {tz}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function HeaderAccountButton() {
  const router = useRouter()
  const { t } = useTranslation()
  const [headerAccount, setHeaderAccount] = useState<HeaderAccount | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    let isMounted = true

    async function loadAccount() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!isMounted || !user) return

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, role")
          .eq("id", user.id)
          .maybeSingle()

        if (!isMounted) return

        const nextHeaderAccount = {
          avatarUrl: profile?.avatar_url ?? null,
          displayName: profile?.full_name ?? user.email ?? "User",
          href: profile?.role === "admin" ? "/admin" : "/account",
          isAdmin: profile?.role === "admin",
        }

        setHeaderAccount(nextHeaderAccount)

        if (nextHeaderAccount.isAdmin) {
          router.prefetch("/admin")
        }
      } catch {
        if (isMounted) {
          setHeaderAccount(null)
        }
      }
    }

    loadAccount()

    return () => {
      isMounted = false
    }
  }, [router])

  if (!mounted) return (
    <div className="hidden items-center rounded-full border border-slate-100 bg-slate-50 px-8 py-2.5 md:inline-flex opacity-0">
      <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{t("header.login")}</span>
    </div>
  )

  return (
    <AppLink
      href={headerAccount?.href ?? "/login"}
      className="flex items-center rounded-full border border-slate-200 bg-slate-50 p-1 shadow-sm transition hover:border-sky-300 hover:bg-white"
    >
      {headerAccount ? (
        <div className="flex items-center gap-2 pr-4">
          {headerAccount.avatarUrl ? (
            <Image
              src={headerAccount.avatarUrl}
              alt={headerAccount.displayName}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#FFC2D1] to-[#A2D2FF] text-[10px] font-bold text-white border-2 border-white">
              {headerAccount.displayName.slice(0, 2).toUpperCase()}
            </span>
          )}
          <span className="hidden text-[10px] font-black uppercase tracking-widest text-slate-700 md:block max-w-[80px] truncate">
            {headerAccount.displayName}
          </span>
        </div>
      ) : (
        <span className="px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600">{t("header.login")}</span>
      )}
    </AppLink>
  )
}

function HeaderNavLink({ href, label }: { href: string; label: string }) {
  if (href.startsWith("#")) {
    return (
      <a
        href={href}
        className="relative group text-[11px] font-black tracking-[0.2em] text-slate-500 transition-colors hover:text-sky-500 uppercase"
      >
        {label}
        <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-sky-400 transition-all duration-300 group-hover:w-full" />
      </a>
    )
  }

  return (
    <AppLink
      href={href}
      className="relative group text-[11px] font-black tracking-[0.2em] text-slate-500 transition-colors hover:text-sky-500 uppercase"
    >
      {label}
      <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-sky-400 transition-all duration-300 group-hover:w-full" />
    </AppLink>
  )
}

export function Navbar({ 
  timeZone = "KST", 
  onTimeZoneChange 
}: { 
  timeZone?: TimeZone, 
  onTimeZoneChange?: (tz: TimeZone) => void 
}) {
  const { t } = useTranslation()
  const pathname = usePathname()
  const isHome = pathname === "/home"
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { href: isHome ? "#comeback" : "/home#comeback", label: t("stats.comeback.eyebrow") },
    { href: isHome ? "#performance" : "/home#performance", label: t("header.nav.performance") },
    { href: isHome ? "#concept" : "/home#concept", label: t("header.nav.concept") },
    { href: isHome ? "#moments" : "/home#moments", label: t("header.nav.moments") },
    { href: isHome ? "#join" : "/home#join", label: t("header.nav.join") },
    { href: "/voting", label: t("header.nav.voting") },
  ]

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:px-6">
      <div className="flex h-16 w-full max-w-[1400px] items-center justify-between rounded-full border border-slate-200 bg-white/95 px-6 py-2 shadow-lg shadow-black/5 backdrop-blur-xl transition-all hover:bg-white hover:border-sky-200">
        <div className="flex items-center gap-6">
          <AppLink href="/home" className="group flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-sky-100 bg-gradient-to-br from-sky-200 to-pink-100 shadow-sm transition-transform group-hover:scale-110">
              <Image src="/logo-official-removebg-.png" alt="Logo" width={36} height={36} className="h-full w-full object-cover" />
            </div>
            <p className="hidden xl:block text-[11px] font-black uppercase tracking-[0.3em] text-slate-800">
              {t("header.brand")}
            </p>
          </AppLink>

          <nav className="hidden items-center gap-6 xl:flex">
            {navItems.map((item) => (
              <HeaderNavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 sm:flex">
            <TimeZoneSwitcher currentTimeZone={timeZone} onTimeZoneChange={onTimeZoneChange} />
            <div className="h-4 w-px bg-slate-300/50" />
          </div>
          
          {mounted && <HeaderAccountButton />}
        </div>
      </div>
    </header>
  )
}
