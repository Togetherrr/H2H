export const revalidate = 3600
import { Navbar } from "@/components/navbar"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ComingSoonPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white selection:bg-sky-100">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute -left-[10%] -top-[10%] h-[800px] w-[800px] rounded-full bg-sky-100/30 blur-[120px] animate-pulse" />
        <div className="absolute -right-[10%] -bottom-[10%] h-[800px] w-[800px] rounded-full bg-pink-100/30 blur-[120px] animate-pulse" />
      </div>

      <Navbar />

      <div className="container max-w-4xl px-4 text-center space-y-12 reveal-up pt-20">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm animate-bounce">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">Feature Pending</p>
          </div>
          
          <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter text-black leading-none italic">
            Stay <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-pink-400 to-amber-400 animate-gradient-x">Tuned</span>
          </h1>
          
          <p className="text-lg md:text-xl font-medium text-slate-500 max-w-xl mx-auto leading-relaxed">
            We are currently building something special for the Hearts2Hearts family. This section will be ready in the next era.
          </p>
        </div>

        <div className="flex justify-center pt-8">
          <Link 
            href="/home" 
            className="group flex items-center gap-3 px-8 py-4 rounded-full bg-black text-white text-[12px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-black/20"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            Return Home
          </Link>
        </div>
      </div>

      {/* Decorative text */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">
        H2H Digital Archive · Next Phase
      </div>
    </main>
  )
}
