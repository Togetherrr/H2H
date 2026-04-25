import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/admin/Sidebar"
import { UsersManager } from "@/components/admin/UsersManager"
import { MembersManager } from "@/components/admin/MembersManager"
import { SocialsManager } from "@/components/admin/SocialsManager"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Sparkles, Users, Disc3, Link as LinkIcon, Database } from "lucide-react"

export default async function AdminPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { user, profile } = await requireAdmin()
  const searchParams = await props.searchParams
  const tab = typeof searchParams.tab === "string" ? searchParams.tab : "overview"

  const supabase = await createClient()

  let profiles: any[] = []
  let members: any[] = []
  let socials: any[] = []
  let stats = { users: 0, members: 0, socials: 0, timeline: 0 }
  let siteSettings: any = null

  if (tab === "users") {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })
    profiles = data || []
  } else if (tab === "members") {
    const { data } = await supabase.from("members").select("*").order("sort_order", { ascending: true })
    members = data || []
  } else if (tab === "socials") {
    const { data } = await supabase.from("social_links").select("*").order("sort_order", { ascending: true })
    socials = data || []
  } else if (tab === "overview") {
    const [
      { count: usersCount },
      { count: membersCount },
      { count: socialsCount },
      { count: timelineCount },
      { data: settings },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("members").select("*", { count: "exact", head: true }),
      supabase.from("social_links").select("*", { count: "exact", head: true }),
      supabase.from("timeline_events").select("*", { count: "exact", head: true }),
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    ])
    stats = {
      users: usersCount || 0,
      members: membersCount || 0,
      socials: socialsCount || 0,
      timeline: timelineCount || 0,
    }
    siteSettings = settings
  }

  const renderContent = () => {
    switch (tab) {
      case "users":
        return <UsersManager profiles={profiles} />
      case "members":
        return <MembersManager initialMembers={members} />
      case "socials":
        return <SocialsManager initialLinks={socials} />
      case "overview":
      default:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-8 flex items-center gap-3 text-sky-700">
              <Sparkles className="size-6" />
              <p className="text-sm font-semibold uppercase tracking-[0.45em]">Overview</p>
            </div>
            <h1 className="mt-2 text-4xl font-light tracking-tight text-slate-950 sm:text-5xl">
              Welcome back, {profile?.full_name || "Admin"}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Monitor key metrics and manage your group's online presence.
            </p>
            
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-slate-200 bg-white/60 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Total Users</CardTitle>
                  <Users className="size-4 text-sky-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{stats.users}</div>
                  <p className="text-xs text-slate-500 mt-1">Registered fans & admins</p>
                </CardContent>
              </Card>
              <Card className="border-slate-200 bg-white/60 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Members</CardTitle>
                  <Users className="size-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{stats.members}</div>
                  <p className="text-xs text-slate-500 mt-1">Active profiles</p>
                </CardContent>
              </Card>
              <Card className="border-slate-200 bg-white/60 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Social Links</CardTitle>
                  <LinkIcon className="size-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{stats.socials}</div>
                  <p className="text-xs text-slate-500 mt-1">Connected channels</p>
                </CardContent>
              </Card>
              <Card className="border-slate-200 bg-white/60 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Events / Releases</CardTitle>
                  <Disc3 className="size-4 text-rose-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{stats.timeline}</div>
                  <p className="text-xs text-slate-500 mt-1">Timeline milestones</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Database className="size-5 text-sky-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <a href="?tab=users" className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100 hover:border-slate-200">
                    <div>
                      <h4 className="font-medium text-slate-900">Manage Users</h4>
                      <p className="text-sm text-slate-500">Promote or revoke admin access</p>
                    </div>
                    <Users className="size-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                  </a>
                  <a href="?tab=members" className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100 hover:border-slate-200">
                    <div>
                      <h4 className="font-medium text-slate-900">Update Members</h4>
                      <p className="text-sm text-slate-500">Add new members or update profiles</p>
                    </div>
                    <Users className="size-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                  </a>
                  <a href="?tab=socials" className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100 hover:border-slate-200">
                    <div>
                      <h4 className="font-medium text-slate-900">Edit Social Links</h4>
                      <p className="text-sm text-slate-500">Add new channels like YouTube or TikTok</p>
                    </div>
                    <LinkIcon className="size-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                  </a>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-white to-sky-50/50">
                <CardHeader>
                  <CardTitle className="text-lg">Site Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-sky-700/75">Group Name</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{siteSettings?.group_name || "-"}</p>
                    </div>
                    <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-sky-700/75">Company</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{siteSettings?.company || "-"}</p>
                    </div>
                    <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-sky-700/75">Debut Date</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{siteSettings?.debut_date || "-"}</p>
                    </div>
                    <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-sky-700/75">Fandom Name</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{siteSettings?.fandom_name || "-"}</p>
                    </div>
                  </div>
                  <div className="mt-6 rounded-xl border border-sky-100 bg-sky-50/50 p-4">
                    <p className="text-sm text-slate-600">
                      To edit these core settings, please use the Supabase dashboard directly to update the `site_settings` table.
                    </p>
                    <a 
                      href="https://supabase.com/dashboard/project/csztfcowiepgjhdjdtik/editor/1?schema=public&table=site_settings"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center text-sm font-medium text-sky-600 hover:text-sky-700"
                    >
                      Open Supabase <LinkIcon className="ml-1 size-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
    }
  }

  return (
    <main className="flex min-h-screen bg-[#fafbfc]">
      <Sidebar />
      <div className="flex-1 pl-64">
        <div className="mx-auto max-w-6xl px-8 py-12">
          {renderContent()}
        </div>
      </div>
    </main>
  )
}
