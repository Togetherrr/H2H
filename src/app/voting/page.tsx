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
          <div className="mb-8 grid gap-12 lg:grid-cols-[1.1fr_0.6fr]">
            <div className="flex flex-col justify-center space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white/50 backdrop-blur-sm w-fit">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-900 animate-pulse" />
                <p className="text-slate-900 font-black uppercase tracking-[0.3em] text-[10px]">
                  {t("voting.hub")}
                </p>
              </div>

              <div className="space-y-6">
                <h1 className="text-6xl font-black uppercase tracking-tighter text-black leading-[0.85] sm:text-7xl lg:text-8xl xl:text-9xl">
                  {titleSecondary ? (
                    <>
                      <span className="block">{titlePrimary} &amp;</span>
                      <span className="block text-black">{titleSecondary}</span>
                    </>
                  ) : (
                    <span>{titlePrimary}</span>
                  )}
                </h1>

                <p className="text-lg sm:text-xl font-semibold text-slate-500 max-w-xl leading-relaxed italic opacity-80">
                  {t("voting.subtitle")}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="card-premium w-full !rounded-[2.5rem] p-7 lg:w-80 border border-slate-200 !bg-white/75 !bg-none backdrop-blur-md shadow-sm transition-all hover:shadow-xl hover:border-slate-300" id="quick-links">
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
                        {item.note && (
                          <span className="block text-[12px] text-slate-500 font-semibold italic">{item.note}</span>
                        )}
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

        <div className="mt-32 space-y-12">
          {/* Support/Contact Footer Box */}
          <div className="reveal-up rounded-[2.5rem] border border-white/60 bg-white/75 p-10 md:p-16 text-center shadow-sm backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 via-pink-400 to-amber-400" />
            <div className="absolute -right-20 -top-20 size-64 bg-sky-100/20 blur-3xl rounded-full" />
            
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic leading-none text-slate-900">
                Need more help?
              </h3>
              <p className="text-slate-500 font-semibold italic text-lg leading-relaxed">
                If you have any questions or need detailed technical support, please check the <Link href="#quick-links" className="text-slate-900 underline underline-offset-4 decoration-pink-500 transition-colors hover:text-pink-500">Quick Links</Link> section above to access our official guide channels.
              </p>
              <div className="pt-4">
                <Link href="#top" className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-black text-white text-[12px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl">
                  <ArrowUp className="size-4" />
                  {t("voting.backToTop")}
                </Link>
              </div>
            </div>
          </div>

          <div className="flex justify-center opacity-30">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
              Hearts2Hearts Support Hub · Next Era
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}