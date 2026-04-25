import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Database, Disc3, ExternalLink, LogOut, Settings, Sparkles, Users } from "lucide-react"
import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "A"
  const parts = source.split(/\s+/).filter(Boolean)

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

type OverviewCardProps = {
  eyebrow: string
  title: string
  description: string
  value: string
}

function OverviewCard({ eyebrow, title, description, value }: OverviewCardProps) {
  return (
    <article className="rounded-[1.8rem] border border-white/75 bg-white/75 p-5 shadow-[0_16px_35px_rgba(84,138,181,0.08)]">
      <p className="text-[10px] uppercase tracking-[0.28em] text-sky-700/75">{eyebrow}</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <h3 className="text-xl text-slate-950">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <p className="shrink-0 text-4xl leading-none text-slate-950">{value}</p>
      </div>
    </article>
  )
}

type QuickLinkCardProps = {
  href: string
  icon: React.ReactNode
  title: string
  description: string
}

function QuickLinkCard({ href, icon, title, description }: QuickLinkCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-[1.8rem] border border-white/75 bg-white/70 p-5 shadow-[0_16px_35px_rgba(84,138,181,0.08)] transition hover:-translate-y-1 hover:border-sky-200"
    >
      <div className="flex items-center gap-3 text-sky-700">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100/80">{icon}</div>
        <div className="flex items-center gap-2">
          <h3 className="text-lg text-slate-950">{title}</h3>
          <ExternalLink className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-600">{description}</p>
    </Link>
  )
}

export default async function AdminPage() {
  const { user, profile } = await requireAdmin()
  const supabase = await createClient()
  const initials = getInitials(profile?.full_name, user.email)

  const [
    { count: membersCount },
    { count: releasesCount },
    { count: timelineCount },
    { count: linksCount },
    { data: siteSettings },
  ] = await Promise.all([
    supabase.from("members").select("*", { count: "exact", head: true }),
    supabase.from("releases").select("*", { count: "exact", head: true }),
    supabase.from("timeline_events").select("*", { count: "exact", head: true }),
    supabase.from("social_links").select("*", { count: "exact", head: true }),
    supabase
      .from("site_settings")
      .select("group_name, company, debut_date, fandom_name, official_color")
      .eq("id", 1)
      .maybeSingle(),
  ])

  return (
    <main className="sky-page min-h-screen px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="reveal-up sticky top-5 z-50 overflow-hidden rounded-full border border-white/45 bg-white/35 px-4 py-3 shadow-[0_10px_36px_rgba(31,38,135,0.09)] backdrop-blur-2xl ring-1 ring-white/25">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-700 transition hover:bg-white"
              >
                <ArrowLeft className="size-4" />
                Home
              </Link>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-sky-700/80">Admin Console</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">Hearts2Hearts Content Hub</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/account"
                className="rounded-full border border-white/70 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 transition hover:bg-white"
              >
                Account
              </Link>
              <Link
                href="/auth/signout"
                className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-600 transition hover:bg-rose-50"
              >
                <LogOut className="size-4" />
                Sign out
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-6 pb-6 pt-8 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="sky-panel reveal-up rounded-[2.2rem] p-7 sm:p-9">
            <div className="flex items-center gap-3 text-sky-700">
              <Sparkles className="size-5" />
              <p className="text-xs uppercase tracking-[0.45em]">Admin Overview</p>
            </div>
            <h1 className="mt-5 text-4xl uppercase leading-none text-slate-950 sm:text-5xl">
              Manage H2H Content
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600">
              Day la trang admin co ban de ban di chuyen nhanh giua trang chu va khu quan tri. Tu day ban
              co the theo doi tinh trang du lieu va tiep tuc mo rong CRUD cho tung module.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <OverviewCard
                eyebrow="Members"
                title="Member profiles"
                description="Tong so profile thanh vien hien co trong database."
                value={String(membersCount ?? 0)}
              />
              <OverviewCard
                eyebrow="Releases"
                title="Discography"
                description="So release hien dang duoc luu trong he thong."
                value={String(releasesCount ?? 0)}
              />
              <OverviewCard
                eyebrow="Timeline"
                title="Timeline events"
                description="So moc su kien dang duoc quan ly tren site."
                value={String(timelineCount ?? 0)}
              />
              <OverviewCard
                eyebrow="Links"
                title="Social links"
                description="So link chinh thuc dang xuat hien tren landing page."
                value={String(linksCount ?? 0)}
              />
            </div>
          </article>

          <aside className="sky-panel reveal-soft rounded-[2.2rem] p-7 sm:p-9">
            <p className="text-xs uppercase tracking-[0.35em] text-sky-700/80">Current Admin</p>
            <div className="mt-6 flex items-center gap-4">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name ?? user.email ?? "Admin avatar"}
                  width={76}
                  height={76}
                  className="h-[76px] w-[76px] rounded-full border border-white/75 object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-slate-950 text-lg font-semibold text-white shadow-sm">
                  {initials}
                </div>
              )}

              <div>
                <p className="text-2xl text-slate-950">{profile?.full_name ?? "H2H Admin"}</p>
                <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-sky-700">Role: {profile?.role}</p>
              </div>
            </div>

            <div className="mt-8 rounded-[1.8rem] border border-white/70 bg-white/70 p-5">
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Site Snapshot</p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-xl border border-white/80 bg-white/80 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-sky-700/75">Group</p>
                  <p className="mt-1 text-sm text-slate-800">{siteSettings?.group_name ?? "Hearts2Hearts"}</p>
                </div>
                <div className="rounded-xl border border-white/80 bg-white/80 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-sky-700/75">Company</p>
                  <p className="mt-1 text-sm text-slate-800">{siteSettings?.company ?? "-"}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/80 bg-white/80 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-sky-700/75">Debut</p>
                    <p className="mt-1 text-sm text-slate-800">{siteSettings?.debut_date ?? "-"}</p>
                  </div>
                  <div className="rounded-xl border border-white/80 bg-white/80 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-sky-700/75">Fandom</p>
                    <p className="mt-1 text-sm text-slate-800">{siteSettings?.fandom_name ?? "-"}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-white/80 bg-white/80 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-sky-700/75">Official Color</p>
                  <p className="mt-1 text-sm text-slate-800">{siteSettings?.official_color ?? "-"}</p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="pb-10">
          <div className="mb-5 flex items-center gap-3 text-sky-700">
            <Database className="size-5" />
            <p className="text-xs uppercase tracking-[0.45em]">Manage Modules</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <QuickLinkCard
              href="https://supabase.com/dashboard/project/csztfcowiepgjhdjdtik/editor/1?schema=public&table=site_settings"
              icon={<Settings className="size-5" />}
              title="Site Settings"
              description="Chinh ten nhom, ngay debut, company, fandom name va thong tin tong."
            />
            <QuickLinkCard
              href="https://supabase.com/dashboard/project/csztfcowiepgjhdjdtik/editor/2?schema=public&table=members"
              icon={<Users className="size-5" />}
              title="Members"
              description="Quan ly profile thanh vien, thu tu hien thi, hinh anh va phan gioi thieu."
            />
            <QuickLinkCard
              href="https://supabase.com/dashboard/project/csztfcowiepgjhdjdtik/editor/3?schema=public&table=releases"
              icon={<Disc3 className="size-5" />}
              title="Releases"
              description="Them EP, single, album va lien ket voi tracks cho discography."
            />
            <QuickLinkCard
              href="https://supabase.com/dashboard/project/csztfcowiepgjhdjdtik/editor/4?schema=public&table=timeline_events"
              icon={<Sparkles className="size-5" />}
              title="Timeline"
              description="Cap nhat cac moc su kien va noi dung hien thi tren landing page."
            />
          </div>

          <div className="mt-6 rounded-[2rem] border border-white/75 bg-white/70 p-6 shadow-[0_16px_35px_rgba(84,138,181,0.08)]">
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Suggested Next Step</p>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Trang admin nay da du de direct vao khu quan tri va di chuyen qua lai tinh te giua Home,
              Account va Admin. Buoc tiep theo hop ly nhat la minh lam CRUD ngay trong project cho
              `site_settings` va `members`, de ban khong can mo dashboard Supabase nua.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
