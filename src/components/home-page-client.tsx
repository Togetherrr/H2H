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

function OfficialLinkCard({ label, url, note, icon: Icon }: { label: string; url: string; note: string; icon: any }) {
  const meta = officialLinkMeta[label] ?? officialLinkMeta.X

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
          <Icon className={`size-5 transition-colors ${meta.iconColor}`} />
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
                <div className="pill-pink w-fit">
                  <Heart className="size-3.5 fill-current" />
                  <span>{t("concept.official")}</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {officialLinks.map((item) => (
                <OfficialLinkCard
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
