"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Clock, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/useTranslation"
import { LanguageSwitcher } from "@/components/language-switcher"
import { createClient } from "@/lib/supabase/client"

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
        className="flex items-center gap-2 rounded-full border border-white/60 bg-white/40 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-700 backdrop-blur-md transition hover:bg-white/60"
      >
        <Clock className="size-3.5 text-[#FF708A]" />
        <span>{currentTimeZone}</span>
        <ChevronDown className={cn("size-3 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-1 shadow-xl backdrop-blur-2xl ring-1 ring-black/5 animate-in fade-in zoom-in duration-200">
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
                  ? "bg-[#FFC2D1]/40 text-[#FF708A]" 
                  : "text-slate-600 hover:bg-slate-50"
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
    <div className="hidden items-center rounded-full border border-white/80 bg-white/40 px-8 py-2.5 md:inline-flex opacity-0">
      <span className="text-[11px] font-black uppercase tracking-widest">Login</span>
    </div>
  )

  return (
    <Link
      href={headerAccount?.href ?? "/login"}
      className="hidden items-center rounded-full border border-white/80 bg-white/40 px-2 py-1.5 shadow-sm backdrop-blur-md transition hover:bg-white/60 md:inline-flex"
    >
      {headerAccount ? (
        <div className="flex items-center gap-2 pr-1">
          {headerAccount.avatarUrl ? (
            <Image
              src={headerAccount.avatarUrl}
              alt={headerAccount.displayName}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover border-2 border-[#FFC2D1]"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#FFC2D1] to-[#A2D2FF] text-[10px] font-bold text-white">
              {headerAccount.displayName.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
      ) : (
        <span className="px-4 py-1 text-[11px] font-black uppercase tracking-widest text-slate-900">Login</span>
      )}
    </Link>
  )
}

function HeaderNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="relative group text-[12px] font-bold tracking-widest text-slate-900 transition-colors hover:text-[#FF8DA1] uppercase"
    >
      {label}
      <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gradient-to-r from-[#FFC2D1] to-[#A2D2FF] transition-all duration-300 group-hover:w-full" />
    </Link>
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
  const isHome = pathname === "/"
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { href: isHome ? "#comeback" : "/#comeback", label: t("stats.comeback.eyebrow") },
    { href: isHome ? "#performance" : "/#performance", label: t("performance.label") },
    { href: isHome ? "#concept" : "/#concept", label: t("header.nav.concept") },
    { href: isHome ? "#moments" : "/#moments", label: t("header.nav.moments") },
    { href: isHome ? "#join" : "/#join", label: t("header.nav.join") },
  ]

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/40 bg-white/30 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-[#A2D2FF] to-[#FFC2D1] shadow-sm">
              <Image src="/logo-official-removebg-.png" alt="Logo" width={40} height={40} className="h-full w-full object-cover" />
            </div>
            <div className="hidden md:block">
              <p className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-800 leading-none">
                {t("header.brand")}
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <HeaderNavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <TimeZoneSwitcher currentTimeZone={timeZone} onTimeZoneChange={onTimeZoneChange} />
          <div className="h-4 w-px bg-slate-200 mx-2 hidden sm:block" />
          <LanguageSwitcher />
          {mounted && <HeaderAccountButton />}
        </div>
      </div>
    </header>
  )
}
