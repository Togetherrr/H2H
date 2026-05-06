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
import { useTranslation } from "@/hooks/useTranslation"
import { Users, Building2, Disc, MapPin, Calendar, HeartPulse, Palette, Hash } from "lucide-react"

// Import types
import type { FilmFrame, TimelineEvent } from "@/lib/release-catalog"
import type { MemberProfile } from "@/lib/member-profiles"
import type { GroupOfficialProfile } from "@/lib/group-official-profile"
import type { HomeStatsSnapshot } from "@/lib/home-stats"
import type { TrackPerformanceSnapshot } from "@/lib/track-performance"

type OfficialLink = { name: string; href: string; note: string }

type OfficialLinkMeta = {
  icon: any
  badgeClassName: string
  badgeIconClassName: string
  arrowClassName: string
}

const officialLinkMeta: Record<string, OfficialLinkMeta> = {
  YouTube: {
    icon: Youtube,
    badgeClassName: "bg-red-50 text-red-500",
    badgeIconClassName: "text-red-500",
    arrowClassName: "bg-red-50 text-red-400 group-hover:text-red-500",
  },
  Instagram: {
    icon: Instagram,
    badgeClassName: "bg-pink-50 text-pink-500",
    badgeIconClassName: "text-pink-500",
    arrowClassName: "bg-pink-50 text-pink-400 group-hover:text-pink-500",
  },
  X: {
    icon: Twitter,
    badgeClassName: "bg-slate-50 text-slate-800",
    badgeIconClassName: "text-slate-800",
    arrowClassName: "bg-slate-50 text-slate-300 group-hover:text-slate-700",
  },
  "X (JP)": {
    icon: Twitter,
    badgeClassName: "bg-slate-100 text-slate-700",
    badgeIconClassName: "text-slate-700",
    arrowClassName: "bg-slate-100 text-slate-300 group-hover:text-slate-700",
  },
  TikTok: {
    icon: Music2,
    badgeClassName: "bg-slate-50 text-slate-900",
    badgeIconClassName: "text-slate-900",
    arrowClassName: "bg-slate-50 text-slate-300 group-hover:text-slate-700",
  },
  Weverse: {
    icon: Users2,
    badgeClassName: "bg-sky-50 text-sky-500",
    badgeIconClassName: "text-sky-500",
    arrowClassName: "bg-sky-50 text-sky-300 group-hover:text-sky-500",
  },
  Facebook: {
    icon: Facebook,
    badgeClassName: "bg-blue-50 text-blue-500",
    badgeIconClassName: "text-blue-500",
    arrowClassName: "bg-blue-50 text-blue-300 group-hover:text-blue-500",
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
      {Icon && <div className="p-2 rounded-xl bg-white/60 shadow-sm text-sky-500 group-hover:text-pink-500 group-hover:bg-white transition-colors mt-0.5"><Icon className="size-5" /></div>}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-pink-400 transition-colors">{title}</span>
        <span className="text-[14px] font-bold text-slate-900 leading-snug">{value}</span>
      </div>
    </div>
  )
}

function MemberCardNew({ member }: { member: MemberProfile }) {
  return (
    <Link
      href={`/members/${member.slug}`}
      className="group relative flex flex-col items-center bg-white/40 hover:bg-white/80 backdrop-blur-md rounded-[2rem] p-3 shadow-sm border border-white/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-pink-200/50"
    >
      <div className="relative w-full aspect-[4/5] max-w-[120px] md:max-w-[140px] overflow-hidden rounded-[1.5rem] mb-3 transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-2 border-[4px] border-white shadow-sm">
        <img
          src={member.image}
          alt={member.name}
          className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />
      </div>
      <div className="text-center w-full pb-1">
        <h3 className="text-[14px] font-black uppercase tracking-tight text-slate-800 group-hover:text-pink-500 transition-colors">
          {member.name}
        </h3>
        <div className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full bg-pink-100/50 border border-pink-200/50 group-hover:bg-pink-100 transition-colors">
          <Star className="size-2 text-pink-400" />
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-pink-500">
            {member.position || 'MEMBER'}
          </p>
        </div>
      </div>
    </Link>
  )
}

function OfficialLinkItem({ label, url, note, icon: Icon }: { label: string; url: string; note: string; icon: any }) {
  const meta = officialLinkMeta[label] ?? officialLinkMeta.X

  return (
    <Link
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 px-4 py-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/90 hover:shadow-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative flex min-w-0 items-center gap-4">
        <div className={`flex size-14 items-center justify-center rounded-full border border-white/80 shadow-sm transition-transform group-hover:scale-105 ${meta.badgeClassName}`}>
          <Icon className={`size-6 ${meta.badgeIconClassName}`} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-black text-slate-900">{label}</p>
          <p className="mt-1 truncate text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
            {note}
          </p>
        </div>
      </div>
      <div className={`relative flex size-11 shrink-0 items-center justify-center rounded-full border border-white/80 shadow-sm transition-all group-hover:scale-105 ${meta.arrowClassName}`}>
        <ArrowRight className="size-4" />
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
          <div className="card-premium p-6 md:p-10 relative overflow-hidden bg-[#FFD6E0]/60 border-white/40 shadow-2xl shadow-pink-200/50">
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
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 text-center bg-white/40 px-4 py-1.5 rounded-full border border-white/60 shadow-sm">
                        Source: SM Entertainment
                      </p>
                    </div>

                    <div className="flex-1 w-full flex flex-col gap-6 bg-white/30 backdrop-blur-md rounded-[2.5rem] p-6 lg:p-8 border border-white/60 shadow-inner">
                      <div className="border-b-2 border-pink-200/50 pb-5">
                        <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-tight flex items-end gap-3 flex-wrap">
                          {officialProfile.groupName}
                          <span className="text-2xl md:text-3xl text-slate-400/80 font-bold tracking-normal">(하츠투하츠)</span>
                        </h3>
                        <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest mt-2 ml-1">Official Profile</p>
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
                  <h3 className="text-3xl font-black uppercase text-slate-900 tracking-tighter">{t("concept.members.title")}</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-500/60 mt-2">HEARTS2HEARTS ROSTER</p>
                </div>
                {/* Updated smaller cards with wrap and center */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
                  {memberProfiles.map((member) => (
                    <MemberCardNew key={member.slug} member={member} />
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
        <div className="card-premium p-6 md:p-10 relative overflow-hidden bg-[#FFD6E0]/60 border-white/40 shadow-2xl shadow-pink-200/50">
          <div className="absolute top-0 right-0 size-96 bg-white/30 blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 size-96 bg-sky-200/20 blur-[100px] rounded-full -ml-20 -mb-20 pointer-events-none" />

          <div className="relative z-10">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <div className="pill-pink w-fit">
                  <Heart className="size-3.5 fill-current" />
                  <span>{t("concept.official")}</span>
                </div>
                <p className="text-description max-w-2xl">
                  Open the official profiles below.
                </p>
              </div>
            </div>

            <div className="rounded-[2.5rem] bg-white/30 backdrop-blur-md p-4 lg:p-6 border border-white/60 shadow-inner">
              <div className="grid gap-4">
                {officialLinks.map((item) => (
                  <OfficialLinkItem
                    key={item.name}
                    label={item.name}
                    url={item.href}
                    note={item.note}
                    icon={officialLinkMeta[item.name]?.icon ?? ArrowRight}
                  />
                ))}
              </div>
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
              {t("footer.copyright").replace("{year}", currentYear.toString())}
            </p>
            <p className="text-[11px] text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {t("footer.disclaimer")}
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
