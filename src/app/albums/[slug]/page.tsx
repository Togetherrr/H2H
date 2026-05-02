import { getTranslation, normalizeLanguage } from "@/i18n/translations"
import { ArrowLeft, Music2, ExternalLink, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getReleaseBySlug } from "@/lib/release-catalog"

type AlbumPageProps = {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{ lang?: string }>
}

export const revalidate = 3600

export default async function AlbumDetailPage({ params, searchParams }: AlbumPageProps) {
  const { slug } = await params
  const { lang: queryLang } = await searchParams
  const lang = normalizeLanguage(queryLang)
  const t = (key: any) => getTranslation(lang, key)

  const album = await getReleaseBySlug(slug)

  if (!album) {
    notFound()
  }

  return (
    <main className="min-h-screen selection:bg-[#A2D2FF]/30">
      <div className="section-shell pt-32 lg:pt-40 pb-12 lg:pb-24">
        <Link
          href={`/${queryLang ? `?lang=${queryLang}` : ""}`}
          className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-white px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-500 shadow-sm transition hover:bg-[#FFC2D1] hover:text-white hover:border-transparent"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.backToHome")}
        </Link>

        <section className="mt-12 overflow-hidden rounded-[3rem] border border-white bg-white/40 shadow-xl backdrop-blur-xl">
          <div className="grid gap-10 lg:grid-cols-[450px_1fr]">
            {/* Image section */}
            <div className="relative aspect-square lg:aspect-auto">
              <Image 
                src={album.cover} 
                alt={`${album.title} cover`} 
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 450px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* Info section */}
            <div className="flex flex-col p-10 lg:p-16">
              <div className="flex-1">
                <p className="text-[13px] font-black uppercase tracking-[0.4em] text-[#FF708A]">
                  {album.subtitle}
                </p>
                <h1 className="text-title mt-4 text-5xl uppercase lg:text-7xl">
                  {album.title}
                </h1>
                
                <div className="mt-6 flex flex-wrap gap-6">
                  <div className="flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-slate-500">
                    <Music2 className="size-4 text-sky-400" />
                    {album.type}
                  </div>
                  <div className="flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-slate-500">
                    <Calendar className="size-4 text-pink-400" />
                    {t("album.releaseDate")}: {album.date}
                  </div>
                </div>

                <div className="mt-10 max-w-xl">
                  <p className="text-body text-lg leading-relaxed text-slate-700">
                    {album.summary}
                  </p>
                </div>

                <div className="mt-12 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-[#A2D2FF]" />
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">
                      {t("album.trackList")}
                    </p>
                  </div>
                  
                  {album.tracks.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {album.tracks.map((track, index) => (
                        <div
                          key={track}
                          className="flex items-center gap-4 rounded-2xl border border-white bg-white/60 p-4 shadow-sm"
                        >
                          <span className="text-[10px] font-black text-slate-300">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="text-sm font-bold text-slate-700">{track}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm italic text-slate-400">
                      {t("album.trackListEmpty")}
                    </p>
                  )}
                </div>
              </div>

              {/* Source */}
              {album.sourceUrl && (
                <div className="mt-16">
                  <a
                    href={album.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-sky-100 bg-sky-50/50 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-sky-600 transition hover:bg-sky-100"
                  >
                    {t("album.viewSource")}
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

