"use client"

import { useCallback, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { getAdminTabData } from "@/app/admin/actions"
import { Sidebar } from "@/components/admin/Sidebar"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Sparkles, Users, Link as LinkIcon, Database, Palette, BadgeCheck } from "lucide-react"
import { Image as ImageIcon } from "lucide-react"
import { MessageSquare } from "lucide-react"
import type { NoticeRow } from "@/lib/notices"

type AdminStats = {
  users: number
  members: number
  socials: number
  timeline: number
  themes: number
  feedbacks: number
}

type AdminTabData = {
  profiles?: any[]
  members?: any[]
  socials?: any[]
  themes?: any[]
  siteSettings?: any
  votingApps?: any[]
  awardEvents?: any[]
  availableApps?: any[]
  stats?: AdminStats
  feedbackMessages?: any[]
  notices?: NoticeRow[]
  youtubeItems?: any[]
}

type AdminDashboardProps = {
  initialTab: string
  profile: any
}

const VALID_TABS = new Set(["overview", "sync", "users", "members", "themes", "socials", "settings", "media", "voting", "award-events", "lineup-reveal", "career-records", "youtube-items", "comeback", "notices", "feedback"])

function normalizeTab(tab: string) {
  return VALID_TABS.has(tab) ? tab : "overview"
}

function LoadingBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className}`} />
}

function TabLoadingState({ title }: { title: string }) {
  return (
    <div className="animate-in fade-in duration-300">
      <LoadingBlock className="h-10 w-72" />
      <LoadingBlock className="mt-3 h-4 w-96 max-w-full" />
      <Card className="mt-8 overflow-hidden border-slate-800 shadow-sm bg-slate-900/60 backdrop-blur-sm">
        <div className="border-b border-slate-800 bg-slate-950/80 px-6 py-4">
          <p className="text-sm font-medium text-slate-400">{title}</p>
        </div>
        <div className="divide-y divide-slate-800">
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

const UsersManager = dynamic(
  () => import("@/components/admin/UsersManager").then((mod) => mod.UsersManager),
  { loading: () => <TabLoadingState title="Loading users..." /> },
)

const MembersManager = dynamic(
  () => import("@/components/admin/MembersManager").then((mod) => mod.MembersManager),
  { loading: () => <TabLoadingState title="Loading members..." /> },
)

const SocialsManager = dynamic(
  () => import("@/components/admin/SocialsManager").then((mod) => mod.SocialsManager),
  { loading: () => <TabLoadingState title="Loading social links..." /> },
)

const SiteSettingsManager = dynamic(
  () => import("@/components/admin/SiteSettingsManager").then((mod) => mod.SiteSettingsManager),
  { loading: () => <TabLoadingState title="Loading site settings..." /> },
)

const ThemesManager = dynamic(
  () => import("@/components/admin/ThemesManager").then((mod) => mod.ThemesManager),
  { loading: () => <TabLoadingState title="Loading themes..." /> },
)

const MediaLibrary = dynamic(
  () => import("@/components/admin/MediaManager").then((mod) => mod.MediaLibrary),
  { loading: () => <TabLoadingState title="Loading media library..." /> },
)

const VotingAppsManager = dynamic(
  () => import("@/components/admin/VotingAppsManager").then((mod) => mod.VotingAppsManager),
  { loading: () => <TabLoadingState title="Loading voting apps..." /> },
)

const AwardEventsManager = dynamic(
  () => import("@/components/admin/AwardEventsManager").then((mod) => mod.AwardEventsManager),
  { loading: () => <TabLoadingState title="Loading award events..." /> },
)

const LineupRevealManager = dynamic(
  () => import("@/components/admin/LineupRevealManager").then((mod) => mod.LineupRevealManager),
  { loading: () => <TabLoadingState title="Loading lineup reveal..." /> },
)

const CareerRecordsManager = dynamic(
  () => import("@/components/admin/CareerRecordsManager").then((mod) => mod.CareerRecordsManager),
  { loading: () => <TabLoadingState title="Loading career records..." /> },
)

const YoutubeItemsTab = dynamic(
  () => import("@/components/admin/YoutubeItemsTab").then((mod) => mod.YoutubeItemsTab),
  { loading: () => <TabLoadingState title="Loading YouTube items..." /> },
)
const ComebackWatchManager = dynamic(
  () => import("@/components/admin/ComebackWatchManager").then((mod) => mod.ComebackWatchManager),
  { loading: () => <TabLoadingState title="Loading comeback settings..." /> },
)

const FeedbackManager = dynamic(
  () => import("@/components/admin/FeedbackManager").then((mod) => mod.FeedbackManager),
  { loading: () => <TabLoadingState title="Loading feedback..." /> },
)

const SyncManager = dynamic(
  () => import("@/components/admin/SyncManager").then((mod) => mod.SyncManager),
  { loading: () => <TabLoadingState title="Loading sync tools..." /> },
)

const NoticesManager = dynamic(
  () => import("@/components/admin/NoticesManager").then((mod) => mod.NoticesManager),
  { loading: () => <TabLoadingState title="Loading notices..." /> },
)

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="border-rose-900 bg-rose-950/40 shadow-sm">
      <CardContent className="p-6">
        <p className="text-sm font-medium text-rose-400">Could not load this admin tab.</p>
        <p className="mt-2 text-sm text-rose-300">{message}</p>
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
        <div className="mb-8 flex items-center gap-3 text-sky-400">
          <Sparkles className="size-6" />
          <p className="text-sm font-semibold uppercase tracking-[0.45em]">Overview</p>
        </div>
        <h1 className="mt-2 text-4xl font-light tracking-tight text-white sm:text-5xl">
          Welcome back, {profile?.full_name || "Admin"}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
          Monitor key metrics and manage your group&apos;s online presence.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="border-slate-800 bg-slate-900/60 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Users</CardTitle>
              <Users className="size-4 text-sky-400" />
            </CardHeader>
            <CardContent>
              {stats ? (
                <>
                  <div className="text-3xl font-bold text-white">{stats.users}</div>
                  <p className="text-xs text-slate-400 mt-1">Registered fans & admins</p>
                </>
              ) : (
                <>
                  <LoadingBlock className="h-9 w-16" />
                  <LoadingBlock className="mt-3 h-3 w-28" />
                </>
              )}
            </CardContent>
          </Card>
          <Card className="border-slate-800 bg-slate-900/60 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Members</CardTitle>
              <Users className="size-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              {stats ? (
                <>
                  <div className="text-3xl font-bold text-white">{stats.members}</div>
                  <p className="text-xs text-slate-400 mt-1">Active profiles</p>
                </>
              ) : (
                <>
                  <LoadingBlock className="h-9 w-16" />
                  <LoadingBlock className="mt-3 h-3 w-24" />
                </>
              )}
            </CardContent>
          </Card>
          <Card className="border-slate-800 bg-slate-900/60 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Social Links</CardTitle>
              <LinkIcon className="size-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              {stats ? (
                <>
                  <div className="text-3xl font-bold text-white">{stats.socials}</div>
                  <p className="text-xs text-slate-400 mt-1">Connected channels</p>
                </>
              ) : (
                <>
                  <LoadingBlock className="h-9 w-16" />
                  <LoadingBlock className="mt-3 h-3 w-28" />
                </>
              )}
            </CardContent>
          </Card>
          <Card className="border-slate-800 bg-slate-900/60 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Active Themes</CardTitle>
              <Palette className="size-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              {stats ? (
                <>
                  <div className="text-3xl font-bold text-white">{(stats as any).themes || 1}</div>
                  <p className="text-xs text-slate-400 mt-1">Managed visual styles</p>
                </>
              ) : (
                <>
                  <LoadingBlock className="h-9 w-16" />
                  <LoadingBlock className="mt-3 h-3 w-32" />
                </>
              )}
            </CardContent>
          </Card>
          <Card className="border-slate-800 bg-slate-900/60 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Feedback</CardTitle>
              <MessageSquare className="size-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              {stats ? (
                <>
                  <div className="text-3xl font-bold text-white">{stats.feedbacks}</div>
                  <p className="text-xs text-slate-400 mt-1">Messages from fans</p>
                </>
              ) : (
                <>
                  <LoadingBlock className="h-9 w-16" />
                  <LoadingBlock className="mt-3 h-3 w-28" />
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-800 bg-slate-900 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-white">
                <Database className="size-5 text-sky-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <button
                type="button"
                onClick={() => handleTabChange("users")}
                className="group flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/50 p-4 text-left transition-colors hover:bg-slate-800 hover:border-slate-700"
              >
                <div>
                  <h4 className="font-medium text-slate-200">Manage Users</h4>
                  <p className="text-sm text-slate-400">Promote or revoke admin access</p>
                </div>
                <Users className="size-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("members")}
                className="group flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/50 p-4 text-left transition-colors hover:bg-slate-800 hover:border-slate-700"
              >
                <div>
                  <h4 className="font-medium text-slate-200">Update Members</h4>
                  <p className="text-sm text-slate-400">Add new members or update profiles</p>
                </div>
                <Users className="size-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("socials")}
                className="group flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/50 p-4 text-left transition-colors hover:bg-slate-800 hover:border-slate-700"
              >
                <div>
                  <h4 className="font-medium text-slate-200">Edit Social Links</h4>
                  <p className="text-sm text-slate-400">Add new channels like YouTube or TikTok</p>
                </div>
                <LinkIcon className="size-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("media")}
                className="group flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/50 p-4 text-left transition-colors hover:bg-slate-800 hover:border-slate-700"
              >
                <div>
                  <h4 className="font-medium text-slate-200">Manage Media</h4>
                  <p className="text-sm text-slate-400">Upload and organize images in your library</p>
                </div>
                <ImageIcon className="size-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("comeback")}
                className="group flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/50 p-4 text-left transition-colors hover:bg-slate-800 hover:border-slate-700"
              >
                <div>
                  <h4 className="font-medium text-slate-200">Comeback Watch</h4>
                  <p className="text-sm text-slate-400">Set the album title, countdown, and release links</p>
                </div>
                <BadgeCheck className="size-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("feedback")}
                className="group flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/50 p-4 text-left transition-colors hover:bg-slate-800 hover:border-slate-700"
              >
                <div>
                  <h4 className="font-medium text-slate-200">View Feedback</h4>
                  <p className="text-sm text-slate-400">Review user messages and mark their status</p>
                </div>
                <MessageSquare className="size-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </button>
            </CardContent>
          </Card>

          <Card className="border-slate-800 shadow-sm bg-slate-900">
            <CardHeader>
              <CardTitle className="text-lg text-white">Site Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Group Name", siteSettings?.group_name],
                  ["Company", siteSettings?.company],
                  ["Debut Date", siteSettings?.debut_date],
                  ["Fandom Name", siteSettings?.fandom_name],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-slate-800 p-4 shadow-sm border border-slate-700">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-sky-400/80">{label}</p>
                    {overviewData ? (
                      <p className="mt-1 text-sm font-medium text-white">{value as string || "-"}</p>
                    ) : (
                      <LoadingBlock className="mt-2 h-4 w-24" />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl border border-slate-800 bg-slate-800/20 p-4">
                <p className="text-sm text-slate-400">
                  You can now manage these core settings directly within the dashboard.
                </p>
                <button
                  type="button"
                  onClick={() => handleTabChange("settings")}
                  className="mt-3 inline-flex items-center text-sm font-medium text-sky-400 hover:text-sky-300"
                >
                  Go to Settings <LinkIcon className="ml-1 size-3" />
                </button>
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
      case "sync": {
        const syncData = dataByTab.sync
        return syncData ? (
          <SyncManager siteSettings={syncData.siteSettings} timelineCount={syncData.stats?.timeline} />
        ) : (
          <TabLoadingState title="Loading sync tools..." />
        )
      }
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
      case "themes": {
        const themes = dataByTab.themes?.themes
        return themes ? <ThemesManager initialThemes={themes} /> : <TabLoadingState title="Loading themes..." />
      }
      case "settings": {
        const settingsData = dataByTab.settings
        return settingsData ? (
          <SiteSettingsManager initialSettings={settingsData.siteSettings} />
        ) : (
          <TabLoadingState title="Loading site settings..." />
        )
      }
      case "media": {
        return <MediaLibrary />
      }
      case "voting": {
        const apps = dataByTab.voting?.votingApps
        return apps ? <VotingAppsManager initialApps={apps} /> : <TabLoadingState title="Loading voting apps..." />
      }
      case "award-events": {
        const awardEventsData = dataByTab["award-events"]
        return awardEventsData?.awardEvents && awardEventsData?.availableApps ? (
          <AwardEventsManager initialEvents={awardEventsData.awardEvents} availableApps={awardEventsData.availableApps} />
        ) : (
          <TabLoadingState title="Loading award events..." />
        )
      }
      case "lineup-reveal": {
        const settingsData = dataByTab["lineup-reveal"]
        return settingsData?.siteSettings ? (
          <LineupRevealManager initialSettings={settingsData.siteSettings} />
        ) : (
          <TabLoadingState title="Loading lineup reveal..." />
        )
      }
      case "career-records": {
        const settingsData = dataByTab["career-records"]
        return settingsData?.siteSettings ? (
          <CareerRecordsManager initialSettings={settingsData.siteSettings} />
        ) : (
          <TabLoadingState title="Loading career records..." />
        )
      }
      case "comeback": {
        const settingsData = dataByTab["comeback"]
        return settingsData?.siteSettings ? (
          <ComebackWatchManager initialSettings={settingsData.siteSettings} />
        ) : (
          <TabLoadingState title="Loading comeback settings..." />
        )
      }
      case "feedback": {
        const feedbackMessages = dataByTab.feedback?.feedbackMessages
        return feedbackMessages ? (
          <FeedbackManager initialFeedbackMessages={feedbackMessages} />
        ) : (
          <TabLoadingState title="Loading feedback..." />
        )
      }
      case "notices": {
        const notices = dataByTab.notices?.notices
        return notices ? <NoticesManager initialNotices={notices} /> : <TabLoadingState title="Loading notices..." />
      }
      case "youtube-items": {
        const youtubeItems = dataByTab["youtube-items"]?.youtubeItems
        return youtubeItems ? (
          <YoutubeItemsTab items={youtubeItems as any} />
        ) : (
          <TabLoadingState title="Loading YouTube items..." />
        )
      }
      case "overview":
      default:
        return renderOverview()
    }
  }

  return (
    <main className="flex min-h-screen bg-[#0A0A0A]">
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
