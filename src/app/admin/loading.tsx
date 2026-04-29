import { ArrowLeft, LayoutDashboard, Link as LinkIcon, Settings, Users } from "lucide-react"

const NAV_ITEMS = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Users", icon: Users },
  { name: "Members", icon: Users },
  { name: "Social Links", icon: LinkIcon },
  { name: "Site Settings", icon: Settings },
]

export default function AdminLoading() {
  return (
    <main className="flex min-h-screen bg-[#fafbfc]">
      <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white/80 pb-6 pt-8 backdrop-blur-xl">
        <div className="px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            <ArrowLeft className="size-4" />
            Home
          </div>
          <div className="mt-8">
            <div className="h-3 w-32 rounded bg-slate-200" />
            <div className="mt-3 h-2 w-28 rounded bg-slate-100" />
          </div>
        </div>

        <nav className="mt-10 flex flex-1 flex-col gap-1 px-4">
          {NAV_ITEMS.map((item, index) => (
            <div
              key={item.name}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                index === 0 ? "bg-slate-950 text-white" : "text-slate-300"
              }`}
            >
              <item.icon className="size-5" />
              <div className={`h-3 rounded ${index === 0 ? "w-20 bg-white/35" : "w-24 bg-slate-100"}`} />
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex-1 pl-64">
        <div className="mx-auto max-w-6xl px-8 py-12">
          <div className="mb-8 flex items-center gap-3">
            <div className="size-6 rounded-full bg-sky-100" />
            <div className="h-3 w-28 rounded bg-sky-100" />
          </div>
          <div className="h-12 w-80 max-w-full rounded bg-slate-200" />
          <div className="mt-5 h-4 w-[32rem] max-w-full rounded bg-slate-100" />

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-slate-200 bg-white/70 p-6 shadow-sm">
                <div className="h-3 w-24 rounded bg-slate-100" />
                <div className="mt-6 h-8 w-16 rounded bg-slate-200" />
                <div className="mt-3 h-3 w-28 rounded bg-slate-100" />
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="h-5 w-36 rounded bg-slate-200" />
                <div className="mt-6 space-y-4">
                  <div className="h-16 rounded-xl bg-slate-100" />
                  <div className="h-16 rounded-xl bg-slate-100" />
                  <div className="h-16 rounded-xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
