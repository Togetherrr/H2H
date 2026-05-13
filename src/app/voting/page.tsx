export const revalidate = 60
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { votingGuideContent } from "@/lib/voting-guide"
import { VotingPageClient } from "@/app/voting/voting-page-client"
import { t } from "@/i18n/translations"
import { ArrowUp } from "lucide-react"

export async function generateMetadata() {
  return {
    title: `${t("voting.title")} | Hearts2Hearts`,
    description: t("voting.subtitle"),
  }
}

export default async function VotingPage() {
  const titleParts = (t("voting.title") as string).split("&")
  const titlePrimary = titleParts[0]?.trim() ?? ""
  const titleSecondary = titleParts[1]?.trim()

  return (
    <main id="top" className="relative min-h-screen overflow-x-hidden selection:bg-primary/30">
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[650px] w-[650px] rounded-full bg-[#A2D2FF]/10 blur-[120px]" />
        <div className="absolute -bottom-[12%] -right-[10%] h-[650px] w-[650px] rounded-full bg-[#FFC2D1]/10 blur-[120px]" />
      </div>

      <Navbar />

      <div className="section-shell pt-32 lg:pt-48 pb-24">
        <header className="reveal-up">
          <div className="rounded-[2.5rem] border border-white/60 bg-white/75 p-10 shadow-sm backdrop-blur-md sm:p-12">
            <div className="mb-8 flex items-center gap-3">
              <div className="pill-base border border-primary/20 bg-white/80 backdrop-blur-md">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                <p className="text-primary font-black uppercase tracking-widest text-[12px]">
                  {t("voting.hub")}
                </p>
              </div>
            </div>

            <div className="mb-12 grid gap-12 lg:grid-cols-[1.1fr_0.6fr]">
              <div className="space-y-7">
                <h1 className="text-5xl font-black uppercase tracking-tighter text-black leading-[0.95] sm:text-6xl lg:text-7xl xl:text-8xl">
                  {titleSecondary ? (
                    <>
                      <span>{titlePrimary} &amp;</span>
                      <br />
                      <span className="text-gradient">{titleSecondary}</span>
                    </>
                  ) : (
                    <span>{titlePrimary}</span>
                  )}
                </h1>

                <p className="text-lg sm:text-xl font-semibold text-slate-700 max-w-2xl leading-relaxed">
                  {t("voting.subtitle")}
                </p>

                <div className="flex flex-wrap gap-3 pt-3">
                  <div className="flex items-center gap-3 rounded-full border border-sky-100 bg-sky-50/80 px-5 py-2.5 shadow-sm">
                    <span className="text-[12px] font-black uppercase tracking-widest text-sky-700">
                      {t("voting.category.music_shows")}
                    </span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-[10px] font-black text-sky-700">8</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-full border border-amber-100 bg-amber-50/80 px-5 py-2.5 shadow-sm">
                    <span className="text-[12px] font-black uppercase tracking-widest text-amber-700">
                      {t("voting.category.awards")}
                    </span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-[10px] font-black text-amber-700">6</span>
                  </div>
                </div>
              </div>

              <div className="card-premium w-full !rounded-[2.5rem] p-7 lg:w-80 border border-border/60 bg-white/75 backdrop-blur-md shadow-sm">
                <p className="mb-6 text-[12px] font-black uppercase tracking-widest text-primary">{t("voting.quickLinks")}</p>
                <div className="grid gap-4">
                  {votingGuideContent.quickLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="group flex items-center justify-between rounded-2xl border border-border/50 bg-white/80 px-5 py-4 transition hover:bg-white"
                    >
                      <div className="space-y-1">
                        <span className="block text-[13px] font-black uppercase tracking-wider text-slate-900">{item.label}</span>
                        {item.note && (
                          <span className="block text-[12px] text-slate-500 font-semibold italic">{item.note}</span>
                        )}
                      </div>
                      <span className="ml-3 text-lg text-slate-400 transition group-hover:text-primary">→</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200/80" />
          </div>
        </header>

        <VotingPageClient />

        <div className="mt-20 flex justify-center">
          <Link href="#top" className="button-base button-secondary">
            <ArrowUp className="size-4" />
            <span>{t("common.backToTop")}</span>
          </Link>
        </div>
      </div>
    </main>
  )
}