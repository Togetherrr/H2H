/* eslint-disable @next/next/no-img-element */
import { ArrowLeft, Music2, ExternalLink, Calendar, Disc, Play, Youtube, Info, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getReleaseBySlug } from "@/lib/release-catalog"
import { cn } from "@/lib/utils"
import { Navbar } from "@/components/navbar"

type AlbumPageProps = {
  params: Promise<{ slug: string }>
}

export const revalidate = 3600

export default async function AlbumDetailPage({ params }: AlbumPageProps) {
  const { slug } = await params
  const album = await getReleaseBySlug(slug)
  if (!album) notFound()

  // Construct a high-quality YouTube thumbnail URL
  const thumbnailUrl = album.youtubeId 
    ? `https://img.youtube.com/vi/${album.youtubeId}/maxresdefault.jpg` 
    : album.cover

  return (
    <main className="min-h-screen selection:bg-pink-200 relative">
      {/* 
          Note: Global background handled by body in RootLayout.
          The detail content is wrapped in a 'card-premium' container to match the website's pink theme.
      */}

      <Navbar />

      {/* Floating Sparkles */}
      <div className="fixed inset-0 pointer-events-none z-[2]">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="absolute size-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.3,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-32 lg:pt-40 pb-24 relative z-10">
        {/* Navigation Breadcrumb */}
        <Link 
          href="/home" 
          className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-6 py-3 text-[11px] font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-white hover:text-slate-900 mb-12"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Timeline
        </Link>

        {/* --- MAIN PINK CARD (Matches Timeline Layout) --- */}
        <div className="card-premium p-8 md:p-16 relative overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-1000">
          
          {/* Subtle Pink Texture Overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
          
          <div className="grid gap-16 lg:grid-cols-[440px_1fr] items-start relative z-10">
            
            {/* Left Column: Visuals & Metadata */}
            <div className="space-y-12">
              
              {/* Album Cover & Disc */}
              <div className="relative group/visual">
                {/* Spinning Disc */}
                <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/4 size-[360px] opacity-0 group-hover/visual:opacity-100 group-hover/visual:-translate-x-[5%] transition-all duration-1000 ease-out pointer-events-none">
                  <div className="relative w-full h-full rounded-full bg-slate-900 border-[12px] border-slate-800 shadow-2xl flex items-center justify-center animate-[spin_12s_linear_infinite]">
                      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(255,255,255,0.05)_41%,_transparent_42%)] opacity-30" />
                      <div className="size-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                        <div className="size-6 rounded-full bg-slate-900" />
                      </div>
                  </div>
                </div>

                <div className="relative aspect-square rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] border-[8px] border-white bg-white group/cover transition-all duration-500">
                  <Image 
                    src={album.cover} 
                    alt={`${album.title} cover`} 
                    fill 
                    className="object-cover transition-transform duration-1000 group-hover/cover:scale-105" 
                    sizes="(max-width: 1024px) 100vw, 440px" 
                    priority 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                </div>
              </div>

              {/* Release Info Bento Cards (Lighter Pink vs Main Card) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-8 rounded-[2rem] bg-white/40 border border-white/60 shadow-sm transition-all hover:bg-white/60">
                    <Calendar className="size-5 text-slate-900/40 mb-3" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900/40">Release Date</p>
                    <p className="text-base font-black text-slate-900 mt-1">{album.date}</p>
                </div>
                <div className="p-8 rounded-[2rem] bg-white/40 border border-white/60 shadow-sm transition-all hover:bg-white/60">
                    <Disc className="size-5 text-slate-900/40 mb-3" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900/40">Format</p>
                    <p className="text-base font-black text-slate-900 mt-1">{album.type}</p>
                </div>
              </div>

              {/* Album Tracks (Moved to left column as per previous request) */}
              <div className="space-y-6">
                <div className="flex items-center gap-4 px-2">
                  <div className="size-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl">
                    <Music2 className="size-5" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Album Tracks</h3>
                </div>
                
                <div className="rounded-[2.5rem] border border-white/40 bg-white/20 p-6 shadow-inner">
                  <div className="space-y-2">
                    {album.tracks.length > 0 ? album.tracks.map((track, index) => (
                      <div 
                        key={`${track}-${index}`} 
                        className="group/item flex items-center gap-4 p-3 rounded-2xl transition-all hover:bg-white/40 hover:shadow-sm"
                      >
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[9px] font-black text-white transition-all group-hover/item:scale-110">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <span className="text-[12px] font-black text-slate-900 uppercase tracking-tight truncate">
                          {track}
                        </span>
                      </div>
                    )) : (
                      <div className="py-10 text-center opacity-40">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-900">Updating...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Title, Summary & Media */}
            <div className="flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px w-12 bg-slate-900/20" />
                <p className="text-[14px] font-black uppercase tracking-[0.4em] text-slate-900/60">
                  {album.subtitle}
                </p>
              </div>
              
              <h1 className="text-slate-900 text-7xl md:text-9xl font-black tracking-tighter uppercase leading-[0.85] mb-8">
                {album.title}
              </h1>

              <div className="max-w-2xl mb-16">
                <p className="text-xl md:text-2xl font-medium leading-relaxed text-slate-800 tracking-tight">
                  {album.summary}
                </p>
              </div>

              {/* Large MV Preview Section */}
              {album.youtubeId && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-5">
                      <div className="flex size-14 items-center justify-center rounded-[1.8rem] bg-rose-500 text-white shadow-xl shadow-rose-200">
                        <Youtube className="size-7" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black uppercase tracking-widest text-slate-900">Official Music Video</h3>
                        <p className="text-[11px] font-black text-rose-500 uppercase tracking-[0.3em] mt-1">SMTOWN Channel</p>
                      </div>
                    </div>
                    <a 
                      href={`https://www.youtube.com/watch?v=${album.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden sm:flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-all"
                    >
                      Watch on YouTube
                      <ExternalLink className="size-4" />
                    </a>
                  </div>

                  <a 
                    href={`https://www.youtube.com/watch?v=${album.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative aspect-video rounded-[3.5rem] overflow-hidden shadow-2xl border-[10px] border-white group/video transition-transform hover:-translate-y-2 bg-slate-200"
                  >
                    <img 
                      src={thumbnailUrl}
                      alt="MV Preview Thumbnail"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover/video:scale-105"
                    />
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/10 group-hover/video:bg-black/30 transition-all flex items-center justify-center">
                      <div className="size-24 rounded-full bg-white flex items-center justify-center text-rose-500 shadow-2xl transition-all group-hover/video:scale-110 group-hover/video:bg-rose-500 group-hover/video:text-white">
                        <Play className="size-10 fill-current ml-2" />
                      </div>
                    </div>
                    <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                      <div className="bg-slate-900 px-6 py-3 rounded-2xl border border-white/20 shadow-2xl">
                          <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-0.5">Streaming now on</p>
                          <p className="text-lg font-black text-white uppercase tracking-tight">Official SMTOWN YouTube</p>
                      </div>
                    </div>
                  </a>
                </div>
              )}

              {/* Branding Footer inside the card */}
              <div className="mt-24 pt-12 border-t border-slate-900/10 flex flex-col md:flex-row items-center justify-between gap-12 opacity-50">
                <div className="flex items-center gap-8 grayscale">
                    <div className="flex items-center gap-3">
                      <Sparkles className="size-4 text-slate-900" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Official SM Artist</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/b/b3/SM_Entertainment_logo.svg" alt="SM" className="h-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">SM Entertainment</span>
                    </div>
                </div>
                <img src="/logo-remove.png" alt="H2H" className="h-8 grayscale" />
              </div>
            </div>
          </div>
        </div>

        {/* Global Footer Credits */}
        <div className="mt-12 flex items-center justify-center gap-2 opacity-20">
           <Info className="size-3 text-white" />
           <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white">Verified Release Record · 2026</p>
        </div>
      </div>
    </main>
  )
}
