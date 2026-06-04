import Image from "next/image"

export default function AdminLoading() {
  return (
    <main className="fixed inset-0 z-[9999] grid place-items-center overflow-hidden bg-[#A2D2FF]">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-md" />
      <div className="absolute size-96 rounded-full bg-white/40 blur-[120px] animate-pulse" />

      <div className="relative flex flex-col items-center gap-5 text-center">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/logo-official-removebg-.png"
            alt="Loading Logo"
            width={112}
            height={112}
            className="size-24 object-contain drop-shadow-sm animate-pulse md:size-28"
            priority
          />
          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-800/80">HEARTS2HEARTS</p>
        </div>
        <div className="h-2 w-40 overflow-hidden rounded-full bg-white/60">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-sky-400 via-pink-400 to-rose-400" />
        </div>
      </div>
    </main>
  )
}
