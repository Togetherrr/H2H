export const revalidate = 60

import { Navbar } from "@/components/navbar"
import { VotingPageClient } from "@/app/voting/voting-page-client"
import { votingGuideContent } from "@/lib/voting-guide"
import { t } from "@/i18n/translations"

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
          <div className="mb-8 grid gap-12 lg:grid-cols-[1.1fr_0.6fr]">
            <div className="flex flex-col justify-center space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white/50 backdrop-blur-sm w-fit">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-900 animate-pulse" />
                <p className="text-slate-900 font-black uppercase tracking-[0.3em] text-[10px]">{t("voting.hub")}</p>
              </div>

              <div className="space-y-4">
                <h1 className="font-sans text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-slate-900 leading-[0.9] drop-shadow-md">
                  {titleSecondary ? (
                    <>
                      <span className="block text-slate-400/80">{titlePrimary} &amp;</span>
                      <span className="block">{titleSecondary}</span>
                    </>
                  ) : (
                    <span>{titlePrimary}</span>
                  )}
                </h1>

                <p className="font-sans text-base sm:text-lg font-bold text-slate-500 max-w-xl leading-relaxed italic opacity-90">
                  {t("voting.subtitle")}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div
                className="card-premium w-full !rounded-[2.5rem] p-7 lg:w-80 border border-slate-200 !bg-white/75 !bg-none backdrop-blur-md shadow-sm transition-all hover:shadow-xl hover:border-slate-300"
                id="quick-links"
              >
                <p className="mb-6 text-[12px] font-black uppercase tracking-[0.3em] text-slate-400">{t("voting.quickLinks")}</p>
                <div className="grid gap-4">
                  {votingGuideContent.quickLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 px-5 py-4 transition hover:bg-white hover:border-slate-200"
                    >
                      <div className="space-y-1">
                        <span className="block text-[13px] font-black uppercase tracking-wider text-slate-900">{item.label}</span>
                        {item.note && <span className="block text-[12px] text-slate-500 font-semibold italic">{item.note}</span>}
                      </div>
                      <span className="ml-3 text-lg text-slate-400 transition group-hover:text-slate-950">→</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-100 opacity-50" />
        </header>

        <VotingPageClient />
      </div>
    </main>
  )
}
