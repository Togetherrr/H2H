"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function LoginForm() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const next = searchParams.get("next")

  async function handleGoogleSignIn() {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const supabase = createClient()
      const origin = window.location.origin

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: next
            ? `${origin}/auth/callback?next=${encodeURIComponent(next)}`
            : `${origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

      if (!data.url) {
        throw new Error("Supabase did not return an OAuth redirect URL.")
      }

      window.location.assign(data.url)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Khong the bat dau dang nhap Google."
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="group flex w-full items-center justify-center gap-3 rounded-full border border-slate-900 bg-slate-950 px-6 py-4 text-sm font-semibold uppercase tracking-[0.28em] text-white shadow-[0_18px_38px_rgba(12,18,42,0.18)] transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-950 shadow-sm transition group-hover:scale-105">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
            <path
              fill="#EA4335"
              d="M12.24 10.285v3.821h5.445c-.22 1.23-.92 2.273-1.98 2.973l3.201 2.485c1.865-1.72 2.94-4.251 2.94-7.264 0-.698-.062-1.37-.178-2.015z"
            />
            <path
              fill="#34A853"
              d="M12 22c2.7 0 4.964-.895 6.618-2.436l-3.201-2.485c-.89.597-2.027.95-3.417.95-2.626 0-4.852-1.774-5.646-4.159H3.05v2.615A9.996 9.996 0 0 0 12 22"
            />
            <path
              fill="#4A90E2"
              d="M6.354 13.87A5.996 5.996 0 0 1 6.04 12c0-.65.112-1.282.314-1.87V7.515H3.05A10.01 10.01 0 0 0 2 12c0 1.612.387 3.135 1.05 4.485z"
            />
            <path
              fill="#FBBC05"
              d="M12 5.971c1.468 0 2.785.505 3.822 1.498l2.867-2.867C16.96 2.998 14.696 2 12 2A9.996 9.996 0 0 0 3.05 7.515l3.304 2.615C7.148 7.745 9.374 5.97 12 5.97"
            />
          </svg>
        </span>
        {isLoading ? "Dang chuyen huong..." : "Tiep tuc voi Google"}
      </button>

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
          Khong the bat dau dang nhap Google. Kiem tra lai Google provider trong Supabase, `Site URL` /
          `Redirect URLs`, va thu refresh trang.
          <div className="mt-1 text-xs text-rose-500">{errorMessage}</div>
        </div>
      ) : null}
    </div>
  )
}
