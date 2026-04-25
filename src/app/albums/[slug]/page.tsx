/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { notFound } from "next/navigation"
import { getReleaseBySlug } from "../../../lib/release-catalog"

type AlbumPageProps = {
  params: Promise<{
    slug: string
  }>
}

export const revalidate = 3600

export default async function AlbumDetailPage({ params }: AlbumPageProps) {
  const { slug } = await params
  const album = await getReleaseBySlug(slug)

  if (!album) {
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
              <img src={album.cover} alt={`${album.title} cover`} className="h-full w-full object-cover" />
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-sky-700/70">{album.subtitle}</p>
              <h1 className="mt-3 text-4xl uppercase leading-none text-slate-950 sm:text-5xl">{album.title}</h1>
              <p className="mt-4 text-sm uppercase tracking-[0.2em] text-slate-500">{album.type}</p>
              <p className="mt-2 text-sm text-slate-600">Release date: {album.date}</p>

              <p className="mt-6 text-sm leading-7 text-slate-700">{album.summary}</p>

              <div className="mt-6 rounded-[1.2rem] border border-white/70 bg-white/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.28em] text-sky-700/80">Track list</p>
                {album.tracks.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    {album.tracks.map((track, index) => (
                      <li key={track}>
                        {index + 1}. {track}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-slate-600">Track list sẽ được cập nhật khi nguồn wiki bổ sung.</p>
                )}

                {album.sourceUrl ? (
                  <a
                    href={album.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex text-xs uppercase tracking-[0.2em] text-sky-700 hover:text-sky-900"
                  >
                    View source on Wikidata
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
