import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { votingGuideContent } from "@/lib/voting-guide"
import VotingPageClient from "./voting-page-client"
import { t } from "@/i18n/translations"
import { ArrowUp } from "lucide-react"

export async function generateMetadata() {
  return {
    title: `${t("voting.title")} | Hearts2Hearts`,
    description: t("voting.subtitle"),
  }
}

export default async function VotingPage() {
  return (
    <main id="top" className="relative min-h-screen selection:bg-[#FFC2D1]/30">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] size-[520px] rounded-full bg-[#A2D2FF]/10 blur-[120px]" />
        <div className="absolute bottom-[-12%] right-[-10%] size-[520px] rounded-full bg-[#FFC2D1]/12 blur-[120px]" />
      </div>

      <Navbar />

      <div className="section-shell pt-32 lg:pt-48 pb-24">
        <header className="reveal-up">
          {/* ── Eyebrow ── */}
          <div className="mb-6 flex items-center gap-3">
            <div className="pill-base border border-[#FFC2D1]/60 bg-white/40">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF99AC]" />
              <p className="text-[#FF99AC]">
                {t("voting.hub")}
              </p>
            </div>
          </div>

          {/* ── Main title + Quick Links row ── */}
          <div className="mb-10 grid gap-10 lg:grid-cols-[1fr_auto]">
            <div className="space-y-6">
              <h1 className="text-5xl font-black uppercase tracking-tighter text-black leading-[0.92] sm:text-6xl lg:text-8xl">
                <span>{t("voting.title").split("&")[0]} &</span>
                <br />
                <span>
                  {t("voting.title").split("&")[1]?.trim()}
                </span>
              </h1>

              <p className="text-body max-w-xl">
                {t("voting.subtitle")}
              </p>

              {/* Category stat pills */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50/80 px-4 py-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-sky-600">
                    {t("voting.category.music_shows")}
                  </span>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-[9px] font-black text-sky-600">8</span>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50/80 px-4 py-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-amber-600">
                    {t("voting.category.awards")}
                  </span>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[9px] font-black text-amber-600">6</span>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50/80 px-4 py-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-violet-600">
                    {t("voting.category.birthday")}
                  </span>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-[9px] font-black text-violet-600">6</span>
                </div>
              </div>
            </div>

            {/* Quick Links card */}
            <div className="card-premium w-full !rounded-[2rem] p-6 lg:w-72">
              <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-[#FF708A]">{t("voting.quickLinks")}</p>
              <div className="grid gap-2.5">
                {votingGuideContent.quickLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith("#") ? undefined : "_blank"}
                    rel={item.href.startsWith("#") ? undefined : "noreferrer"}
                    className="group flex items-center justify-between rounded-xl border border-white/50 bg-white/40 px-4 py-3 transition hover:bg-white/70"
                  >
                    <div>
                      <span className="block text-[11px] font-black uppercase tracking-wider text-slate-800">
                        {item.label}
                      </span>
                      {item.note && (
                        <span className="mt-0.5 block text-[10px] text-slate-500">{item.note}</span>
                      )}
                    </div>
                    <span className="ml-3 text-slate-300 transition group-hover:text-[#FF708A]">→</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/60" />
        </header>

        <VotingPageClient />

        {/* Join Team Section */}
        <section id="join-team" className="mt-20 reveal-up delay-3">
          <div className="card-premium !bg-gradient-to-br from-[#FFC2D1]/40 via-white/40 to-[#A2D2FF]/40 p-10 lg:p-16">
            <div className="flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="max-w-2xl space-y-4 text-center md:text-left">
                <h2 className="text-title text-4xl uppercase">
                  {t("voting.join")}
                </h2>
                <p className="text-body">
                  {t("voting.join.desc")}
                </p>
              </div>
              <a
                href={votingGuideContent.joinTeam.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-[#FF3B57] px-10 py-5 text-[12px] font-black uppercase tracking-widest text-white shadow-xl shadow-pink-200 transition-all hover:scale-105 hover:bg-[#FF2B4A]"
              >
                {t("voting.join.cta")}
              </a>
            </div>
          </div>
        </section>

        <div className="mt-20 flex justify-center">
          <Link
            href="#top"
            className="group inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/40 px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-700 backdrop-blur-md transition hover:bg-white/60"
          >
            <ArrowUp className="size-4 transition-transform group-hover:-translate-y-1" />
            {t("voting.backToTop")}
          </Link>
        </div>
      </div>
    </main>
  )
}