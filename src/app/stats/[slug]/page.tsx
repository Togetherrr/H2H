import Link from "next/link"
import { notFound } from "next/navigation"
import { HOME_STAT_SLUGS, getHomeStatDetailPage, type HomeStatSlug } from "@/lib/home-stat-details"

type StatDetailPageProps = {
  params: Promise<{
    slug: string
  }>
}

export const revalidate = 3600

export async function generateStaticParams() {
  return HOME_STAT_SLUGS.map((slug) => ({ slug }))
}

function isHomeStatSlug(value: string): value is HomeStatSlug {
  return HOME_STAT_SLUGS.includes(value as HomeStatSlug)
}

export default async function StatDetailPage({ params }: StatDetailPageProps) {
  const { slug } = await params

  if (!isHomeStatSlug(slug)) {
    notFound()
  }

  const detail = await getHomeStatDetailPage(slug)

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#e9f7ff_0%,#f6fbff_48%,#edf8ff_100%)] px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.2em] text-sky-700 transition hover:bg-white"
        >
          Back to home
        </Link>

        <section className="mt-5 rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-[0_20px_50px_rgba(87,145,188,0.14)] backdrop-blur-xl sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-sky-700/70">{detail.eyebrow}</p>
              <h1 className="mt-3 text-4xl uppercase leading-none text-slate-950 sm:text-5xl">{detail.title}</h1>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-700">{detail.summary}</p>
            </div>

            <aside className="rounded-[1.5rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(230,244,255,0.84))] p-5 shadow-[0_16px_40px_rgba(87,145,188,0.12)]">
              <p className="text-[11px] uppercase tracking-[0.24em] text-sky-700/75">Current total</p>
              <p className="mt-3 text-5xl font-light tracking-tight text-slate-950">{detail.total.toLocaleString()}</p>
              <p className="mt-2 text-sm text-slate-600">{detail.totalLabel}</p>

              <div className="mt-5 rounded-[1.2rem] border border-white/80 bg-white/75 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-sky-700/75">Source</p>
                <a
                  href={detail.sourceHref}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex text-sm text-slate-900 underline underline-offset-4"
                >
                  {detail.sourceLabel}
                </a>
                <p className="mt-2 text-xs leading-6 text-slate-500">{detail.sourceNote}</p>
              </div>
            </aside>
          </div>

          <div className="mt-8 grid gap-5">
            {detail.sections.map((section) => (
              <section
                key={section.title}
                className="rounded-[1.6rem] border border-white/75 bg-white/72 p-5 shadow-[0_14px_34px_rgba(87,145,188,0.08)]"
              >
                <h2 className="text-2xl uppercase leading-none text-slate-950 sm:text-3xl">{section.title}</h2>
                {section.description ? (
                  <p className="mt-3 text-sm leading-7 text-slate-600">{section.description}</p>
                ) : null}

                <div className="mt-5 grid gap-3">
                  {section.items.map((item) => (
                    <article
                      key={`${section.title}-${item.title}-${item.meta ?? ""}`}
                      className="rounded-[1.2rem] border border-sky-100/80 bg-sky-50/45 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="max-w-3xl">
                          <p className="text-lg text-slate-900">{item.title}</p>
                          {item.subtitle ? (
                            <p className="mt-1 text-sm uppercase tracking-[0.18em] text-sky-700/75">{item.subtitle}</p>
                          ) : null}
                          {item.meta ? <p className="mt-2 text-sm text-slate-500">{item.meta}</p> : null}
                        </div>
                        {item.value ? (
                          <span className="rounded-full border border-white/80 bg-white/85 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-700">
                            {item.value}
                          </span>
                        ) : null}
                      </div>

                      {item.chips && item.chips.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {item.chips.map((chip) => (
                            <span
                              key={`${item.title}-${chip}`}
                              className="rounded-full border border-sky-100 bg-white/85 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-sky-700"
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {item.href ? (
                        <a
                          href={item.href}
                          target={item.href.startsWith("/") ? undefined : "_blank"}
                          rel={item.href.startsWith("/") ? undefined : "noreferrer"}
                          className="mt-4 inline-flex text-xs uppercase tracking-[0.2em] text-sky-700 hover:text-sky-900"
                        >
                          {item.hrefLabel ?? "Open detail"}
                        </a>
                      ) : null}
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
