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
        className="flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white/80 backdrop-blur-md transition hover:bg-white/15 hover:border-white/25"
      >
        <Clock className="size-3.5 text-sky-400" />
        <span>{currentTimeZone}</span>
        <ChevronDown className={cn("size-3 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 overflow-hidden rounded-2xl border border-white/15 bg-slate-900/90 p-1 shadow-xl backdrop-blur-2xl animate-in fade-in zoom-in duration-200">
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
                  ? "bg-sky-400/20 text-sky-300" 
                  : "text-white/70 hover:bg-white/10"
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
    <div className="hidden items-center rounded-full border border-white/15 bg-white/8 px-8 py-2.5 md:inline-flex opacity-0">
      <span className="text-[11px] font-black uppercase tracking-widest text-white/70">{t("header.login")}</span>
    </div>
  )

  return (
    <Link
      href={headerAccount?.href ?? "/login"}
      className="flex items-center rounded-full border border-white/15 bg-white/8 p-1 shadow-sm backdrop-blur-md transition hover:border-sky-400/30 hover:bg-white/15"
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
          <span className="hidden text-[10px] font-black uppercase tracking-widest text-white/80 md:block max-w-[80px] truncate">
            {headerAccount.displayName}
          </span>
        </div>
      ) : (
        <span className="px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-white/80">{t("header.login")}</span>
      )}
    </Link>
  )
}

function HeaderNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="relative group text-[11px] font-black tracking-[0.2em] text-white/70 transition-colors hover:text-sky-300 uppercase"
    >
      {label}
      <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gradient-to-r from-sky-400 to-sky-300 transition-all duration-300 group-hover:w-full" />
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
    { href: isHome ? "#performance" : "/#performance", label: t("header.nav.performance") },
    { href: isHome ? "#concept" : "/#concept", label: t("header.nav.concept") },
    { href: isHome ? "#moments" : "/#moments", label: t("header.nav.moments") },
    { href: isHome ? "#join" : "/#join", label: t("header.nav.join") },
    { href: "/voting", label: t("header.nav.voting") },
  ]

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:px-6">
      <div className="flex h-16 w-full max-w-[1400px] items-center justify-between rounded-full border border-white/15 bg-black/30 px-6 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-all hover:bg-black/40 hover:border-white/20">
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-sky-100 bg-gradient-to-br from-sky-200 to-pink-100 shadow-sm transition-transform group-hover:scale-110">
              <Image src="/logo-official-removebg-.png" alt="Logo" width={36} height={36} className="h-full w-full object-cover" />
            </div>
            <p className="hidden xl:block text-[11px] font-black uppercase tracking-[0.3em] text-slate-800">
              {t("header.brand")}
            </p>
          </Link>

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
            <LanguageSwitcher />
          </div>
          
          {mounted && <HeaderAccountButton />}
        </div>
      </div>
    </header>
  )
}
