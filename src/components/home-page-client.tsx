"use client"

/* eslint-disable @next/next/no-img-element */
import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Facebook, Heart, Instagram, Music2, Star, Twitter, Youtube, Users2 } from "lucide-react"
import { HomeStatsSection } from "@/components/home-stats-section"
import { TrackPerformanceSection } from "@/components/track-performance-section"
import { TimelineSection } from "@/components/timeline-section"
import { ComebackWatchHeader } from "@/components/comeback-watch-header"
import { SpotlightNotice } from "@/components/spotlight-notice"
import { Navbar, type TimeZone } from "@/components/navbar"
import { NoticeBoard } from "@/components/notice-board"
import { useTranslation } from "@/hooks/useTranslation"
import { Users, Building2, Disc, MapPin, Calendar, HeartPulse, Palette, Hash } from "lucide-react"

// Import types
import type { FilmFrame, TimelineEvent } from "@/lib/release-catalog"
import type { MemberProfile } from "@/lib/member-profiles"
import type { GroupOfficialProfile } from "@/lib/group-official-profile"
import type { HomeStatsSnapshot } from "@/lib/home-stats"
import type { TrackPerformanceSnapshot } from "@/lib/track-performance"

type OfficialLink = { id?: string; name: string; href: string; note: string; platform?: string }

type OfficialLinkMeta = {
  icon: any
  // gradient applied to the card background on hover
  gradientFrom: string
  gradientTo: string
  // icon + text color when card is hovered
  accentColor: string
  // idle icon bg
  iconBg: string
  iconColor: string
}

const officialLinkMeta: Record<string, OfficialLinkMeta> = {
  YouTube: {
    icon: Youtube,
    gradientFrom: "from-red-50",
    gradientTo: "to-rose-100/60",
    accentColor: "text-red-600",
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
  },
  Instagram: {
    icon: Instagram,
    gradientFrom: "from-pink-50",
    gradientTo: "to-fuchsia-100/60",
    accentColor: "text-pink-600",
    iconBg: "bg-pink-100",
    iconColor: "text-pink-500",
  },
  X: {
    icon: Twitter,
    gradientFrom: "from-slate-50",
    gradientTo: "to-slate-100/60",
    accentColor: "text-slate-900",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-700",
  },
  "X (JP)": {
    icon: Twitter,
    gradientFrom: "from-slate-50",
    gradientTo: "to-blue-50/60",
    accentColor: "text-slate-800",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
  },
  TikTok: {
    icon: Music2,
    gradientFrom: "from-slate-50",
    gradientTo: "to-slate-900/10",
    accentColor: "text-slate-900",
    iconBg: "bg-slate-900/10",
    iconColor: "text-slate-800",
  },
  Weverse: {
    icon: Users2,
    gradientFrom: "from-sky-50",
    gradientTo: "to-cyan-100/60",
    accentColor: "text-sky-600",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-500",
  },
  Facebook: {
    icon: Facebook,
    gradientFrom: "from-blue-50",
    gradientTo: "to-indigo-100/60",
    accentColor: "text-blue-600",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
  },
}

interface HomePageClientProps {
  filmFrames: FilmFrame[]
  timelineEvents: TimelineEvent[]
  memberProfiles: MemberProfile[]
  officialProfile: GroupOfficialProfile
  officialLinks: OfficialLink[]
  homeStatsSnapshot: HomeStatsSnapshot
  trackPerformanceSnapshot: TrackPerformanceSnapshot
}

// --- Sub-components cho giao diện mới ---

function FactRow({ title, value, icon: Icon }: { title: string; value: React.ReactNode; icon?: any }) {
  return (
    <div className="flex items-start gap-4 py-3 group">
      {Icon && <div className="p-2 rounded-xl bg-white/80 shadow-sm text-sky-600 group-hover:text-sky-700 group-hover:bg-white transition-colors mt-0.5"><Icon className="size-5" /></div>}
      <div className="flex flex-col gap-1">
        <span className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover:text-slate-800 transition-colors">{title}</span>
        <span className="text-[15px] font-bold text-slate-950 leading-snug">{value}</span>
      </div>
    </div>
  )
}

function MemberCardNew({ member }: { member: MemberProfile }) {
  return (
    <Link
      href={`/members/${member.slug}`}
      className="group relative flex flex-col items-center bg-white/40 hover:bg-white/70 backdrop-blur-md rounded-[2rem] p-3 shadow-sm border border-white/60 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-200/30"
    >
      <div className="relative w-full aspect-[4/5] max-w-[120px] md:max-w-[140px] overflow-hidden rounded-[1.5rem] mb-3 transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-1 border-[4px] border-white shadow-sm">
        <img
          src={member.image}
          alt={member.name}
          className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-108"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sky-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <div className="text-center w-full pb-1">
        <h3 className="text-[15px] font-black uppercase tracking-tight text-slate-950 group-hover:text-sky-600 transition-colors">
          {member.name}
        </h3>
        <div className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full bg-pink-100/80 border border-pink-200 group-hover:bg-sky-100 group-hover:border-sky-300 transition-colors shadow-sm">
          <Star className="size-2.5 text-pink-500 group-hover:text-sky-500" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-600 group-hover:text-sky-600">
            {member.position || 'MEMBER'}
          </p>
        </div>
      </div>
    </Link>
  )
}

const AVAILABLE_ICONS = [
  { id: "Youtube", slug: "youtube" },
  { id: "Instagram", slug: "instagram" },
  { id: "X", slug: "x" },
  { id: "Facebook", slug: "facebook" },
  { id: "Tiktok", slug: "tiktok" },
  { id: "Weverse", slug: "weverse" },
  { id: "Weibo", slug: "sinaweibo" },
  { id: "Bilibili", slug: "bilibili" },
  { id: "Spotify", slug: "spotify" },
  { id: "Music", slug: "applemusic" },
  { id: "Link", slug: "linktree" },
]

function renderBrandIcon(iconId: string | null | undefined, className: string = "size-5") {
  if (!iconId) return <ArrowRight className={className} />
  
  const isWeverse = iconId.toLowerCase() === "weverse"
  if (isWeverse) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 512 512">
        <defs>
          <linearGradient id="weverse-a" gradientUnits="userSpaceOnUse"/>
          <linearGradient id="weverse-b" x2="1" gradientTransform="scale(461.56)rotate(42.582 -.07 .17)" href="#weverse-a">
            <stop stopColor="#000120"/>
            <stop offset="1" stopColor="#000120"/>
          </linearGradient>
        </defs>
        <path fillRule="evenodd" d="M89.8 0h332.4C471.8 0 512 40.2 512 89.8v332.4c0 49.6-40.2 89.8-89.8 89.8H89.8C40.2 512 0 471.8 0 422.2V89.8C0 40.2 40.2 0 89.8 0" style={{fill: "url(#weverse-b)"}}/>
        <path fillRule="evenodd" d="M75.3 172.1s12-7.2 17.8-9.9 11.5-4.9 16.9-6.6l3.8-1.2q1.9-.5 3.9-1 1.9-.5 3.9-.9 1.9-.4 3.9-.8c5-.8 9.6-1.3 14-1.5 4.3-.1 8.3 0 12 .4s7 1.1 9.9 1.9c2.8.8 5.3 1.8 7.3 2.8.6.3 1.4.7 2.3 1.4q1.5.9 3.3 2.4l1 .8q.5.4.9.9.5.4 1 .9l.9.9 1 1.2 1 1.2q.4.6.9 1.2.4.7.9 1.3.4.8.9 1.5.4.8.9 1.5.4.8.9 1.6l.8 1.6q.3.8.7 1.6.4 1 .7 2 .4.9.7 1.9t.5 2q.3 1 .5 2c.6 2.9.9 6.1 1 9.6q0 5.25-.9 11.4l-1.3 8-1.2 7.9-1.2 7.9-1.3 7.9-1.2 8-1.3 7.9-1.2 7.9-1.3 7.9q-.1 1.2-.3 2.4-.1 1.2-.3 2.4l-.2 2.4-.2 2.4q-.4 4.5-.5 8.3 0 3.9.3 7.2.4 3.2 1.1 5.9.7 2.6 1.8 4.6 1.2 2 2.8 3.3.3.3.8.6.4.3.9.6.4.2.9.4.5.3 1 .4 2 .7 4.5.7 2.2 0 4.8-.7c1.8-.5 3.6-1.3 5.5-2.3 1.9-1.1 3.9-2.5 5.9-4.2s4-3.7 5.9-6.1c2-2.4 3.9-5.2 5.7-8.5q2.7-4.8 5.1-10.9 2.3-6.1 4.2-13.7c1.2-5 2.3-10.5 3-16.6l1.4-10.5 1.4-10.5 1.3-10.5 1.4-10.5 1.3-10.5 1.4-10.5 1.4-10.5 1.3-10.5H302l-1.8 13.5-1.7 13.5-1.7 13.5-1.7 13.4-1.8 13.5-1.7 13.5-1.7 13.5-1.7 13.4q-.7 5.4-1.1 10-.3 4.5-.3 8.3 0 3.7.3 6.7.4 3.1 1.1 5.4t1.8 4q1.1 1.6 2.6 2.7.3.3.7.5.4.3.8.5.5.2.9.3.4.2.9.3 1.8.5 4 .5c1.6 0 3.5-.3 5.4-.8 1.9-.6 3.9-1.5 5.9-2.8s4.1-2.9 6.2-5 4.2-4.5 6.3-7.5 4.1-6.4 6.1-10.4 3.8-8.5 5.6-13.5c1.8-5.1 3.4-10.8 4.9-17.1s2.8-13.2 3.9-20.8q.2-1.1.3-2.3.2-1.1.3-2.2.2-1.2.3-2.3.2-1.1.3-2.3.5-4.4.8-8.6t.5-8.3q.1-4.1.1-8.2v-4.1q-.1-1-.1-2.1 0-1-.1-2 0-1.1-.1-2.1 0-1.1-.1-2.1 0-1.1-.1-2.2-.1-1-.2-2.1-.3-4.3-.8-8.8-.1-1.2-.2-2.3-.2-1.2-.3-2.4-.2-1.1-.3-2.3t-.3-2.4h63.2c.2 1.2.3 2.8.4 5 .2 2.1.3 4.7.5 7.6.3 2.9.6 6.2 1 9.7q.2 1.3.4 2.7l.4 2.8q.3 1.4.5 2.7l.6 2.8c.8 3.8 1.9 7.7 3.2 11.6 1.4 4 3 7.9 5.1 11.7 2 3.8 4.4 7.5 7.3 10.9l2.2 2.6q1.2 1.3 2.5 2.5 1.2 1.2 2.5 2.3t2.7 2.1l-1.5 11.7-1.6 11.6-1.5 11.6-1.6 11.6q-2.9-1.1-5.8-2.5-2.8-1.4-5.5-3.1-2.8-1.6-5.3-3.5-2.6-1.8-5-3.9l-1.6-1.4-1.6-1.4q-.7-.8-1.5-1.5-.7-.8-1.5-1.5c-2.2 8.9-4.9 17.1-8 24.6-3.1 7.6-6.6 14.4-10.5 20.6s-8 11.7-12.5 16.7q-1.7 1.8-3.4 3.5t-3.5 3.4l-3.6 3.2-3.8 3q-1.9 1.4-3.8 2.7t-3.8 2.5q-2 1.3-4 2.4t-4.1 2.1q-2 1.1-4.1 2t-4.2 1.7q-2.1.9-4.2 1.6t-4.3 1.4c-5.7 1.7-11.6 3-17.5 3.8q-2.2.3-4.5.5-2.2.3-4.5.4-2.2.2-4.5.2-2.2.1-4.5.1-6.1 0-11.5-.7-5.5-.7-10.2-2-1.2-.3-2.3-.6l-2.2-.8q-1.2-.4-2.3-.8-1-.4-2.1-.9l-2-1q-1-.5-1.9-1-1-.5-1.9-1.1l-1.8-1.2q-.9-.6-1.7-1.2t-1.6-1.3q-.8-.6-1.6-1.3t-1.5-1.4-1.4-1.5q-.7-.7-1.3-1.5-.6-.7-1.3-1.5-.6-.8-1.1-1.6-.6-.9-1.1-1.7-.6-.8-1.1-1.7-.4-.9-.9-1.8-.5-.8-.9-1.7-.4-1-.8-1.9t-.7-1.9q-.4-.9-.7-1.9-.3-.9-.5-1.9c-3.2 4.7-6.5 8.8-10 12.3q-1.3 1.3-2.6 2.5t-2.6 2.3q-1.3 1.2-2.7 2.2-1.4 1.1-2.9 2.1-1.3 1-2.6 1.8-1.3.9-2.7 1.7t-2.8 1.5q-1.4.8-2.8 1.5-1.2.6-2.5 1.1-1.3.6-2.6 1.1l-2.6 1q-1.3.5-2.6.9-1.2.4-2.3.7-1.2.4-2.3.7-1.2.3-2.3.5-1.2.3-2.3.5-.9.2-1.9.4-.9.2-1.8.3t-1.9.3l-1.8.2c-2.1.2-3.8.3-4.9.3h-1.8q-8.1 0-15.1-1.5-6.9-1.5-12.7-4.5-1.4-.7-2.7-1.5-1.4-.8-2.7-1.7t-2.5-1.9l-2.4-2q-4.5-4.2-7.9-9.7-3.4-5.4-5.6-11.8-2.2-6.5-3.2-13.9-1-7.5-.9-15.7.1-8.3 1.3-17.3l1.3-8.2 1.4-8.2 1.3-8.2 1.3-8.2 1.3-8.2 1.3-8.2 1.3-8.2 1.3-8.2q.1-2.2-.3-3.9-.3-1.6-1-2.8-.2-.3-.4-.5-.2-.3-.4-.5-.2-.3-.4-.5t-.5-.4q-.2-.2-.5-.4-.2-.1-.5-.3-.3-.1-.6-.3-.2-.1-.5-.2l-.6-.2q-.3-.1-.6-.1l-.6-.2q-.2 0-.5-.1h-.6q-.3 0-.6-.1H114l-2.2.2q-1 .2-1.7.4-1.6.5-3.1.9-.8.3-1.5.5-.7.3-1.4.5l-1.4.6q-.7.2-1.4.5l-2.8 1.2q-1.3.7-2.7 1.4c-1 .5-20.5-38.3-20.5-38.3" fill="#00C7BB"/>
      </svg>
    )
  }

  const curated = AVAILABLE_ICONS.find(i => i.id.toLowerCase() === iconId.toLowerCase())
  const slug = curated ? curated.slug : iconId.toLowerCase().trim().replace(/\s+/g, "-")
  
  const src = `https://cdn.simpleicons.org/${slug}`

  return (
    <img 
      key={src}
      src={src} 
      alt={iconId}
      className={className}
      loading="lazy"
    />
  )
}

function OfficialLinkCard({ label, url, note, metaKey }: { label: string; url: string; note: string; metaKey: string }) {
  const normalizedKey = metaKey.toLowerCase().replace(/[^a-z0-9]/g, "")
  const meta = Object.entries(officialLinkMeta).find(
    ([k]) => k.toLowerCase().replace(/[^a-z0-9]/g, "") === normalizedKey
  )?.[1] ?? officialLinkMeta.X

  return (
    <Link
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`group relative flex flex-col gap-4 overflow-hidden rounded-[1.75rem] border border-white/80 bg-white p-5 shadow-md transition-all duration-400 hover:-translate-y-1.5 hover:shadow-xl`}
    >
      {/* Hover gradient wash */}
      <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradientFrom} ${meta.gradientTo} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="relative flex items-start justify-between gap-3">
        {/* Icon */}
        <div className={`flex size-11 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md ${meta.iconBg}`}>
          {renderBrandIcon(metaKey, "size-5 object-contain")}
        </div>

        {/* Arrow */}
        <div className={`flex size-8 items-center justify-center rounded-full border border-slate-100 bg-white/80 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:border-transparent group-hover:bg-white group-hover:shadow-md ${meta.accentColor}`}>
          <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>

      <div className="relative">
        <p className={`text-[15px] font-black text-slate-900 transition-colors duration-200 group-hover:${meta.accentColor}`}>{label}</p>
        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-500 transition-colors line-clamp-1">
          {note}
        </p>
      </div>
    </Link>
  )
}

// --- COMPONENT CHÍNH ---

export function HomePageClient({
  timelineEvents,
  memberProfiles,
  officialProfile,
  officialLinks,
  homeStatsSnapshot,
  trackPerformanceSnapshot,
}: HomePageClientProps) {
  const { t } = useTranslation()
  const [timeZone, setTimeZone] = useState<TimeZone>("KST")
  const currentYear = new Date().getFullYear()

  return (
    <main id="top" className="relative min-h-screen selection:bg-sky-400/20">
      <Navbar timeZone={timeZone} onTimeZoneChange={setTimeZone} />

      <div id="comeback">
        <ComebackWatchHeader snapshot={homeStatsSnapshot} timeZone={timeZone} />
      </div>

      <div className="section-shell">
        <div className="relative z-30">
          <SpotlightNotice />
        </div>
      </div>

      {/* ── SECTION PROFILE (GIAO DIỆN MỚI) ── */}
      <section id="concept" className="py-16 select-none relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 relative z-10">

          {/* Header */}
          <div className="mb-10 relative z-30 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-100 bg-white shadow-sm scale-90 origin-left">
                <Star className="size-3.5 text-sky-500" />
                <p className="text-sky-600 font-black uppercase tracking-widest text-[9px]">
                  {t("concept.official")}
                </p>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-slate-900">
                Profile
              </h2>
            </div>

          </div>

          {/* Profile Content Card */}
          <div className="card-premium shimmer-border p-6 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 size-96 bg-white/30 blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 size-96 bg-sky-200/30 blur-[100px] rounded-full -ml-20 -mb-20 pointer-events-none" />

            <div className="relative z-10">
              <div className="mb-12">
                <div className="rounded-[3.5rem] bg-white/40 backdrop-blur-md p-6 lg:p-8 border border-white/60 shadow-inner">
                  <div className="flex flex-col lg:flex-row gap-10 items-start">
                    <div className="flex flex-col items-center justify-center shrink-0 w-full lg:w-auto pt-4">
                      <div className="aspect-square size-36 lg:size-48 rounded-[3rem] bg-white/60 backdrop-blur-md p-6 shadow-sm flex items-center justify-center border border-white/80 transition-transform hover:rotate-3 duration-500 relative mb-4">
                        <img src={officialProfile.logoAsset} alt="Logo" className="w-full h-full object-contain relative z-10 drop-shadow-md" />
                      </div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600 text-center bg-white/60 px-4 py-1.5 rounded-full border border-white/80 shadow-sm">
                        Source: SM Entertainment
                      </p>
                    </div>

                    <div className="flex-1 w-full flex flex-col gap-6 bg-white/30 backdrop-blur-md rounded-[2.5rem] p-6 lg:p-8 border border-white/60 shadow-inner">
                      <div className="border-b-2 border-pink-200/50 pb-5">
                        <h3 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter uppercase leading-tight flex items-end gap-3 flex-wrap">
                          {officialProfile.groupName}
                          <span className="text-2xl md:text-3xl text-slate-500/80 font-bold tracking-normal">(하츠투하츠)</span>
                        </h3>
                        <p className="text-[12px] font-black text-pink-500 uppercase tracking-widest mt-2 ml-1">Official Profile</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                        <FactRow title={t("moments.fact.company")} value={officialProfile.company} icon={Building2} />
                        <FactRow title={t("moments.fact.labels")} value={officialProfile.labels} icon={Disc} />
                        <FactRow title={t("moments.fact.origin")} value={officialProfile.origin} icon={MapPin} />
                        <FactRow title={t("moments.fact.debut")} value={officialProfile.debutDate} icon={Calendar} />
                        <FactRow title={t("moments.fact.members")} value={officialProfile.membersCount} icon={Users2} />
                        <FactRow title={t("moments.fact.fandom")} value={officialProfile.fandomName} icon={HeartPulse} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-white/30">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-black uppercase text-slate-950 tracking-tighter">{t("concept.members.title")}</h3>
                  <p className="text-[12px] font-black uppercase tracking-[0.4em] text-pink-600/80 mt-2">HEARTS2HEARTS ROSTER</p>
                </div>
                {/* Updated smaller cards with wrap and center */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
                  {memberProfiles.map((member, i) => (
                    <div key={member.slug} className={`card-enter card-enter-${Math.min(i + 1, 7)}`}>
                      <MemberCardNew member={member} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-shell space-y-16 lg:space-y-20">
        <div id="stats">
          <HomeStatsSection snapshot={homeStatsSnapshot} />
        </div>

        <div id="performance">
          <TrackPerformanceSection snapshot={trackPerformanceSnapshot} />
        </div>

        <div id="timeline">
          <TimelineSection events={timelineEvents} />
        </div>
      </div>

      {/* ── OFFICIAL LINKS ── */}
      <section id="moments" className="section-shell">
        <div className="card-premium shimmer-border p-6 md:p-10 relative overflow-hidden">
          {/* Background blobs */}
          <div className="absolute top-0 right-0 size-96 bg-pink-200/20 blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 size-96 bg-sky-200/20 blur-[100px] rounded-full -ml-20 -mb-20 pointer-events-none" />

          <div className="relative z-10">
            {/* Section header */}
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-pink-200 bg-white/70 backdrop-blur-sm shadow-sm w-fit">
                  <Heart className="size-3.5 text-pink-500 fill-pink-500" />
                  <span className="text-pink-600 font-black uppercase tracking-widest text-[9px]">{t("concept.official")}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-slate-900">
                  Stay Connected
                </h2>
                <p className="text-[13px] text-slate-500 font-medium max-w-sm leading-relaxed">
                  Follow H2H across all platforms and never miss a moment.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 shrink-0 self-end">
                <Star className="size-4 text-pink-400 fill-current" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {officialLinks.length} Platforms
                </span>
              </div>
            </div>

            {/* 2-column card grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {officialLinks.map((item, index) => {
                // Determine the correct meta mapping key (try platform, then note, then name)
                const metaKey = (item as any).platform || item.note || item.name

                return (
                  <OfficialLinkCard
                    key={item.id ?? `link-${index}`}
                    label={item.name}
                    url={item.href}
                    note={item.note}
                    metaKey={metaKey}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <footer className="section-shell pb-12">
        <div className="card-premium !rounded-[2.5rem] p-10 text-center">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-6 text-sky-400">
              <Heart className="size-5 fill-current" />
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />
              <Star className="size-5 fill-current" />
            </div>
            <p className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-500">
              {t("footer.copyright")}
            </p>
            <p className="text-[11px] text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {t("footer.disclaimer")}
            </p>
          </div>
        </div>
      </footer>
      <NoticeBoard />
    </main>
  )
}
