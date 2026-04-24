/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { notFound } from "next/navigation"
import { memberProfiles } from "@/lib/member-profiles"

type MemberDetailPageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function MemberDetailPage({ params }: MemberDetailPageProps) {
  const { slug } = await params
  const member = memberProfiles.find((item) => item.slug === slug)

  if (!member) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#e9f7ff_0%,#f6fbff_48%,#edf8ff_100%)] px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.2em] text-sky-700 transition hover:bg-white"
        >
          Back to home
        </Link>

        <section className="mt-5 rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-[0_20px_50px_rgba(87,145,188,0.14)] backdrop-blur-xl sm:p-8">
          <div className="grid gap-6 md:grid-cols-[0.95fr_1.05fr] md:items-start">
            <div className="overflow-hidden rounded-[1.5rem] border border-sky-100/80 bg-sky-50/60">
              <img src={member.image} alt={`${member.name} profile`} className="h-full w-full object-cover" />
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-sky-700/70">Hearts2Hearts member</p>
              <h1 className="mt-3 text-4xl uppercase leading-none text-slate-950 sm:text-5xl">{member.name}</h1>
              <p className="mt-4 text-sm uppercase tracking-[0.2em] text-slate-500">{member.position}</p>

              <p className="mt-6 text-sm leading-7 text-slate-700">{member.intro}</p>

              <div className="mt-6 rounded-[1.2rem] border border-white/70 bg-white/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.28em] text-sky-700/80">Highlights</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {member.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-sky-100 bg-sky-50/75 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-sky-700"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-[1.2rem] border border-amber-200/75 bg-amber-50/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.28em] text-amber-800/90">Source & Attribution</p>
                <p className="mt-2 text-xs leading-6 text-amber-900/90">
                  Profile summary is fan-curated for informational use. Official trademarks, logos and artist-related
                  assets belong to their respective owners.
                </p>
                <a
                  href={member.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex text-xs uppercase tracking-[0.16em] text-amber-800 underline-offset-4 hover:underline"
                >
                  Source: {member.sourceName}
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
