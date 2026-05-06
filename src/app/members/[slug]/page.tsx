import { t } from "@/i18n/translations"
import { ArrowLeft, Sparkles, ShieldCheck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { memberProfiles } from "@/lib/member-profiles"

type MemberDetailPageProps = {
  params: Promise<{ slug: string }>
}

export default async function MemberDetailPage({ params }: MemberDetailPageProps) {
  const { slug } = await params
  const member = memberProfiles.find((item) => item.slug === slug)
  if (!member) notFound()

  return (
    <main className="min-h-screen selection:bg-[#A2D2FF]/30">
      <div className="section-shell pt-32 lg:pt-40 pb-12 lg:pb-24">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-white px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-500 shadow-sm transition hover:bg-[#FFC2D1] hover:text-white hover:border-transparent">
          <ArrowLeft className="h-4 w-4" />
          {t("common.backToHome")}
        </Link>

        <section className="mt-12 overflow-hidden rounded-[3rem] border border-white bg-white/40 shadow-xl backdrop-blur-xl">
          <div className="grid gap-10 lg:grid-cols-[450px_1fr]">
            <div className="relative aspect-[4/5] lg:aspect-auto">
              <Image src={member.image} alt={`${member.name} profile`} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 450px" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8">
                <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-md">
                  <Sparkles className="size-4 text-[#FFC2D1]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">{t("member.eyebrow")}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col p-10 lg:p-16">
              <div className="flex-1">
                <p className="text-[13px] font-black uppercase tracking-[0.4em] text-[#FF708A]">Hearts2Hearts</p>
                <h1 className="text-title mt-4 text-6xl uppercase lg:text-8xl">{member.name}</h1>
                <p className="mt-6 text-[14px] font-black uppercase tracking-[0.3em] text-slate-400">{member.position}</p>
                <div className="mt-10 max-w-xl"><p className="text-body text-lg leading-relaxed text-slate-700">{member.intro}</p></div>
                <div className="mt-12 space-y-6">
                  <div className="flex items-center gap-3"><div className="h-px w-8 bg-[#FFC2D1]" /><p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">{t("member.highlights")}</p></div>
                  <div className="flex flex-wrap gap-3">
                    {member.keywords.map((keyword) => (<span key={keyword} className="rounded-2xl border border-white bg-white/60 px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 shadow-sm">{keyword}</span>))}
                  </div>
                </div>
              </div>
              <div className="mt-16 rounded-[2rem] border border-amber-100 bg-amber-50/50 p-8">
                <div className="flex items-start gap-4">
                  <ShieldCheck className="mt-1 size-5 text-amber-600" />
                  <div className="space-y-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-800">{t("member.sourceAttribution")}</p>
                    <p className="text-xs leading-relaxed text-amber-900/80">{t("member.disclaimer")}</p>
                    <a href={member.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex text-[10px] font-black uppercase tracking-widest text-amber-700 underline underline-offset-4 hover:text-amber-900">Source: {member.sourceName}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
