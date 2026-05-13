export const dynamic = "force-dynamic"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { LoginForm } from "@/app/login/login-form"
import { getCurrentProfile, getCurrentSession } from "@/lib/auth"
import { hasSupabaseEnv } from "@/lib/supabase/env"

export default async function LoginPage() {
  const session = hasSupabaseEnv() ? await getCurrentSession() : null
  const { profile } = hasSupabaseEnv() ? await getCurrentProfile() : { profile: null }
  const destination = profile?.role === "admin" ? "/admin" : "/"

  return (
    <main className="sky-page relative isolate overflow-hidden px-6 py-10 sm:px-8 lg:px-10">
      <div className="hero-spotlight hero-spotlight-left" />
      <div className="hero-spotlight hero-spotlight-right" />
      <div className="hero-spotlight hero-spotlight-top" />

      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="reveal-up rounded-[2.2rem] border border-white/70 bg-white/55 p-7 shadow-[0_24px_70px_rgba(84,138,181,0.12)] backdrop-blur-2xl sm:p-10">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/80 bg-white/75 px-4 py-2 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-sky-100 bg-white/90">
                <Image
                  src="/logo-official-removebg-.png"
                  alt="H2H logo"
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-sky-700/80">H2H Auth</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-slate-500">Hearts2Hearts For S2U</p>
              </div>
            </div>

            <h1 className="mt-8 text-5xl leading-none text-slate-950 sm:text-6xl">Welcome Back</h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Dang nhap de mo khoa tai khoan fan, luu du lieu rieng cua ban va vao khu vuc admin neu tai
              khoan da duoc cap role quan tri.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.6rem] border border-white/70 bg-white/70 p-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-sky-700/80">Public Site</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">Landing page van mo san cho tat ca user.</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/70 bg-white/70 p-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-sky-700/80">Fan Account</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">San sang cho cac tinh nang user sau nay.</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/70 bg-white/70 p-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-sky-700/80">Admin Access</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">Role admin se duoc dieu huong vao khu quan tri.</p>
              </div>
            </div>
          </section>

          <section className="reveal-soft sky-panel rounded-[2.2rem] p-7 sm:p-9">
            <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-sky-700/75">Sign In</p>
            <h2 className="mt-4 text-4xl leading-none text-slate-950 sm:text-5xl">Join The H2H Archive</h2>
            <p className="mt-5 text-sm leading-7 text-slate-600">
              Su dung Google de dang nhap nhanh. Sau lan dang nhap dau tien, he thong se tao `profiles`
              record voi role mac dinh la `user`.
            </p>

            {session ? (
              <div className="mt-8 rounded-[1.7rem] border border-emerald-100 bg-emerald-50/85 p-5 text-sm leading-7 text-emerald-800">
                Ban da dang nhap. Tiep tuc vao{" "}
                <Link href={destination} className="font-semibold underline underline-offset-4">
                  {profile?.role === "admin" ? "admin console" : "trang chu"}
                </Link>
                .
              </div>
            ) : (
              <div className="mt-8">
                <Suspense fallback={<div className="text-sm text-slate-500">Dang tai form dang nhap...</div>}>
                  <LoginForm />
                </Suspense>
              </div>
            )}

            <div className="mt-8 rounded-[1.7rem] border border-white/70 bg-white/70 p-5">
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Notes</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Neu Google login van khong chay, hay kiem tra them `Authentication {" > "} URL Configuration`
                trong Supabase va bao dam `Site URL` la `http://localhost:3000`.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
