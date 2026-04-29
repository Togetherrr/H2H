"use client"

import { useCallback, useEffect, useState } from "react"
import { getAdminTabData } from "@/app/admin/actions"
import { Sidebar } from "@/components/admin/Sidebar"
import { UsersManager } from "@/components/admin/UsersManager"
import { MembersManager } from "@/components/admin/MembersManager"
import { SocialsManager } from "@/components/admin/SocialsManager"
import { SiteSettingsManager } from "@/components/admin/SiteSettingsManager"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Sparkles, Users, Disc3, Link as LinkIcon, Database } from "lucide-react"

type AdminStats = {
  users: number
  members: number
  socials: number
  timeline: number
}

type AdminTabData = {
  profiles?: any[]
  members?: any[]
  socials?: any[]
  siteSettings?: any
  stats?: AdminStats
}

type AdminDashboardProps = {
  initialTab: string
  profile: any
}

const VALID_TABS = new Set(["overview", "users", "members", "socials", "settings"])

function normalizeTab(tab: string) {
  return VALID_TABS.has(tab) ? tab : "overview"
}

function LoadingBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-slate-100 ${className}`} />
}

function TabLoadingState({ title }: { title: string }) {
  return (
    <div className="animate-in fade-in duration-300">
      <LoadingBlock className="h-10 w-72" />
      <LoadingBlock className="mt-3 h-4 w-96 max-w-full" />
      <Card className="mt-8 overflow-hidden border-slate-200 shadow-sm bg-white/60 backdrop-blur-sm">
        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <p className="text-sm font-medium text-slate-500">{title}</p>
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="grid grid-cols-[56px_1fr_1fr_96px] items-center gap-5 px-6 py-4">
              <LoadingBlock className="size-8 rounded-full" />
              <LoadingBlock className="h-4 w-40" />
              <LoadingBlock className="h-4 w-64 max-w-full" />
              <LoadingBlock className="h-8 w-20" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="border-rose-100 bg-rose-50/80 shadow-sm">
      <CardContent className="p-6">
        <p className="text-sm font-medium text-rose-700">Could not load this admin tab.</p>
        <p className="mt-2 text-sm text-rose-600">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
        >
          Retry
        </button>
      </CardContent>
    </Card>
  )
}

export function AdminDashboard({ initialTab, profile }: AdminDashboardProps) {
  const [tab, setTab] = useState(() => normalizeTab(initialTab))
  const [dataByTab, setDataByTab] = useState<Record<string, AdminTabData>>({})
  const [loadingTabs, setLoadingTabs] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  const loadTab = useCallback(async (targetTab: string, force = false) => {
    const normalizedTab = normalizeTab(targetTab)

    if (!force && dataByTab[normalizedTab]) {
      return
    }

    setLoadingTabs((current) => ({ ...current, [normalizedTab]: true }))
    setErrors((current) => ({ ...current, [normalizedTab]: undefined }))

    const result = await getAdminTabData(normalizedTab) as AdminTabData & { error?: string }

    if (result?.error) {
      setErrors((current) => ({ ...current, [normalizedTab]: result.error }))
    } else {
      setDataByTab((current) => ({ ...current, [normalizedTab]: result }))
    }

    setLoadingTabs((current) => ({ ...current, [normalizedTab]: false }))
  }, [dataByTab])

  useEffect(() => {
    loadTab(tab)
  }, [loadTab, tab])

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      setTab(normalizeTab(params.get("tab") || "overview"))
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  const handleTabChange = (nextTab: string) => {
    const normalizedTab = normalizeTab(nextTab)
    setTab(normalizedTab)

    const url = new URL(window.location.href)
    if (normalizedTab === "overview") {
      url.searchParams.delete("tab")
    } else {
      url.searchParams.set("tab", normalizedTab)
    }
    window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`)
  }

  const renderOverview = () => {
    const overviewData = dataByTab.overview
    const stats = overviewData?.stats
    const siteSettings = overviewData?.siteSettings

    return (
      <div className="animate-in fade-in duration-300">
        <div className="mb-8 flex items-center gap-3 text-sky-700">
          <Sparkles className="size-6" />
          <p className="text-sm font-semibold uppercase tracking-[0.45em]">Overview</p>
        </div>
        <h1 className="mt-2 text-4xl font-light tracking-tight text-slate-950 sm:text-5xl">
          Welcome back, {profile?.full_name || "Admin"}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Monitor key metrics and manage your group&apos;s online presence.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-slate-200 bg-white/60 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Users</CardTitle>
              <Users className="size-4 text-sky-600" />
            </CardHeader>
            <CardContent>
              {stats ? (
                <>
                  <div className="text-3xl font-bold text-slate-900">{stats.users}</div>
                  <p className="text-xs text-slate-500 mt-1">Registered fans & admins</p>
                </>
              ) : (
                <>
                  <LoadingBlock className="h-9 w-16" />
                  <LoadingBlock className="mt-3 h-3 w-28" />
                </>
              )}
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white/60 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Members</CardTitle>
              <Users className="size-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              {stats ? (
                <>
                  <div className="text-3xl font-bold text-slate-900">{stats.members}</div>
                  <p className="text-xs text-slate-500 mt-1">Active profiles</p>
                </>
              ) : (
                <>
                  <LoadingBlock className="h-9 w-16" />
                  <LoadingBlock className="mt-3 h-3 w-24" />
                </>
              )}
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white/60 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Social Links</CardTitle>
              <LinkIcon className="size-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              {stats ? (
                <>
                  <div className="text-3xl font-bold text-slate-900">{stats.socials}</div>
                  <p className="text-xs text-slate-500 mt-1">Connected channels</p>
                </>
              ) : (
                <>
                  <LoadingBlock className="h-9 w-16" />
                  <LoadingBlock className="mt-3 h-3 w-28" />
                </>
              )}
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white/60 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Events / Releases</CardTitle>
              <Disc3 className="size-4 text-rose-600" />
            </CardHeader>
            <CardContent>
              {stats ? (
                <>
                  <div className="text-3xl font-bold text-slate-900">{stats.timeline}</div>
                  <p className="text-xs text-slate-500 mt-1">Timeline milestones</p>
                </>
              ) : (
                <>
                  <LoadingBlock className="h-9 w-16" />
                  <LoadingBlock className="mt-3 h-3 w-32" />
                </>
              )}
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
              <button
                type="button"
                onClick={() => handleTabChange("users")}
                className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 text-left transition-colors hover:bg-slate-100 hover:border-slate-200"
              >
                <div>
                  <h4 className="font-medium text-slate-900">Manage Users</h4>
                  <p className="text-sm text-slate-500">Promote or revoke admin access</p>
                </div>
                <Users className="size-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("members")}
                className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 text-left transition-colors hover:bg-slate-100 hover:border-slate-200"
              >
                <div>
                  <h4 className="font-medium text-slate-900">Update Members</h4>
                  <p className="text-sm text-slate-500">Add new members or update profiles</p>
                </div>
                <Users className="size-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("socials")}
                className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 text-left transition-colors hover:bg-slate-100 hover:border-slate-200"
              >
                <div>
                  <h4 className="font-medium text-slate-900">Edit Social Links</h4>
                  <p className="text-sm text-slate-500">Add new channels like YouTube or TikTok</p>
                </div>
                <LinkIcon className="size-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-white to-sky-50/50">
            <CardHeader>
              <CardTitle className="text-lg">Site Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Group Name", siteSettings?.group_name],
                  ["Company", siteSettings?.company],
                  ["Debut Date", siteSettings?.debut_date],
                  ["Fandom Name", siteSettings?.fandom_name],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-sky-700/75">{label}</p>
                    {overviewData ? (
                      <p className="mt-1 text-sm font-medium text-slate-900">{value || "-"}</p>
                    ) : (
                      <LoadingBlock className="mt-2 h-4 w-24" />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl border border-sky-100 bg-sky-50/50 p-4">
                <p className="text-sm text-slate-600">
                  To edit these core settings, please use the Supabase dashboard directly to update the
                  `site_settings` table.
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

  const renderContent = () => {
    if (errors[tab]) {
      return <ErrorState message={errors[tab] || "Unknown error"} onRetry={() => loadTab(tab, true)} />
    }

    switch (tab) {
      case "users": {
        const profiles = dataByTab.users?.profiles
        return profiles ? <UsersManager profiles={profiles} /> : <TabLoadingState title="Loading users..." />
      }
      case "members": {
        const members = dataByTab.members?.members
        return members ? <MembersManager initialMembers={members} /> : <TabLoadingState title="Loading members..." />
      }
      case "socials": {
        const socials = dataByTab.socials?.socials
        return socials ? <SocialsManager initialLinks={socials} /> : <TabLoadingState title="Loading social links..." />
      }
      case "settings": {
        const settingsData = dataByTab.settings
        return settingsData ? (
          <SiteSettingsManager initialSettings={settingsData.siteSettings} />
        ) : (
          <TabLoadingState title="Loading site settings..." />
        )
      }
      case "overview":
      default:
        return renderOverview()
    }
  }

  return (
    <main className="flex min-h-screen bg-[#fafbfc]">
      <Sidebar currentTab={tab} onTabChange={handleTabChange} />
      <div className="flex-1 pl-64">
        <div className="mx-auto max-w-6xl px-8 py-12">
          <div key={tab} className="animate-in fade-in duration-300">
            {renderContent()}
          </div>
        </div>
      </div>
    </main>
  )
}
