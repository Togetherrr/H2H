"use client"

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { ArrowRight, Heart, Star } from "lucide-react"
import { HomeStatsSection } from "@/components/home-stats-section"
import { TrackPerformanceSection } from "@/components/track-performance-section"
import { TimelineSection } from "@/components/timeline-section"
import { ComebackWatchHeader } from "@/components/comeback-watch-header"
import { SpotlightNotice } from "@/components/spotlight-notice"
import { Navbar, type TimeZone } from "@/components/navbar"
import { useTranslation } from "@/hooks/useTranslation"
import type { FilmFrame, TimelineEvent } from "@/lib/release-catalog"
import type { MemberProfile } from "@/lib/member-profiles"
import type { GroupOfficialProfile } from "@/lib/group-official-profile"
import type { HomeStatsSnapshot } from "@/lib/home-stats"
import type { TrackPerformanceSnapshot } from "@/lib/track-performance"

type OfficialLink = { name: string; href: string; note: string }

interface HomePageClientProps {
  filmFrames: FilmFrame[]
  timelineEvents: TimelineEvent[]
  memberProfiles: MemberProfile[]
  officialProfile: GroupOfficialProfile
  officialLinks: OfficialLink[]
  homeStatsSnapshot: HomeStatsSnapshot
  trackPerformanceSnapshot: TrackPerformanceSnapshot
}

function OfficialFactCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm hover:border-sky-400/25 hover:bg-white/8 transition-all">
      <p className="text-[10px] font-black uppercase tracking-widest text-sky-400">{label}</p>
      <div className="mt-1.5 text-[15px] font-semibold text-white/90">{value}</div>
    </div>
  )
}

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

  const officialFacts = [
    { key: "group",   label: t("moments.fact.group"),   value: officialProfile.groupName },
    { key: "company", label: t("moments.fact.company"), value: officialProfile.company },
    { key: "labels",  label: t("moments.fact.labels"),  value: officialProfile.labels },
    { key: "origin",  label: t("moments.fact.origin"),  value: officialProfile.origin },
    { key: "debut",   label: t("moments.fact.debut"),   value: officialProfile.debutDate },
    { key: "members", label: t("moments.fact.members"), value: officialProfile.membersCount },
    { key: "fandom",  label: t("moments.fact.fandom"),  value: officialProfile.fandomName },
    {
      key: "color", label: t("moments.fact.color"),
      value: (
        <div className="flex items-center gap-2">
          <div className="flex h-4 w-10 overflow-hidden rounded-full ring-1 ring-white/20">
            <div className="h-full w-1/2 bg-[#A2D2FF]" />
            <div className="h-full w-1/2 bg-[#FFC2D1]" />
          </div>
          <span className="text-[13px] text-white/80">{officialProfile.officialColor}</span>
        </div>
      ),
    },
  ]

  const currentYear = new Date().getFullYear()

  return (
    <main id="top" className="relative min-h-screen selection:bg-sky-400/20">
      <Navbar timeZone={timeZone} onTimeZoneChange={setTimeZone} />

      {/* ── Hero / Comeback ── */}
      <div id="comeback">
        <ComebackWatchHeader snapshot={homeStatsSnapshot} timeZone={timeZone} />
      </div>

      <div className="section-shell">
        {/* ── Spotlight ── */}
        <div className="mt-4">
          <SpotlightNotice />
        </div>

        {/* ── Stats ── */}
        <div id="stats" className="mt-20">
          <HomeStatsSection snapshot={homeStatsSnapshot} />
        </div>

        {/* ── Performance ── */}
        <div id="performance" className="mt-24">
          <TrackPerformanceSection snapshot={trackPerformanceSnapshot} />
        </div>

        {/* ── Timeline ── */}
        <div id="timeline" className="mt-24">
          <TimelineSection events={timelineEvents} />
        </div>
      </div>

      {/* ── Concept & Profile ── */}
      <section id="concept" className="section-shell mt-24">
        <div className="card-premium p-8 lg:p-16">
          <div className="grid gap-16 lg:grid-cols-[1fr_0.8fr]">
            <article className="space-y-12">
              <div>
                <div className="flex items-center gap-3 text-sky-400">
                  <Star className="size-5 fill-current" />
                  <p className="text-[11px] font-black uppercase tracking-[0.5em]">{t("concept.official")}</p>
                </div>
                <h2 className="text-title mt-6 text-5xl sm:text-6xl">{t("concept.official.title")}</h2>
                <p className="text-body mt-8 max-w-2xl">{t("concept.official.desc")}</p>
              </div>

              {/* Official Profile card */}
              <div className="rounded-[3rem] border border-white/10 bg-white/5 p-10 backdrop-blur-sm">
                <div className="grid gap-12 md:grid-cols-[200px_1fr] items-start">
                  <div className="mx-auto w-full max-w-[200px]">
                    <div className="aspect-square rounded-[2rem] border border-sky-400/20 bg-white/8 p-8">
                      <img src={officialProfile.logoAsset} alt="Logo" className="h-full w-full object-contain" />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {officialFacts.map((fact) => (
                      <OfficialFactCard key={fact.key} label={fact.label} value={fact.value} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Members Grid */}
              <div id="members" className="space-y-10">
                <h3 className="text-title text-4xl">{t("concept.members.title")}</h3>
                <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
                  {memberProfiles.map((member) => (
                    <Link
                      key={member.slug}
                      href={`/members/${member.slug}`}
                      className="group overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-sky-400/30 hover:bg-white/10 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden rounded-[2.2rem]">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-sky-950/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                      <div className="p-5 text-center">
                        <p className="text-[16px] font-black uppercase tracking-tight text-white">{member.name}</p>
                        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-400">{member.position}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </article>

            {/* Official Links sidebar */}
            <article id="moments" className="space-y-10">
              <div className="glass-blue rounded-[3rem] p-10 lg:p-12 sticky top-32">
                <div className="flex items-center gap-3 text-sky-400">
                  <Heart className="size-5 fill-current" />
                  <p className="text-[11px] font-black uppercase tracking-[0.5em]">{t("moments.title")}</p>
                </div>
                <p className="text-body mt-8">{t("moments.subtitle")}</p>

                <div className="mt-10 grid gap-4">
                  {officialLinks.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-sky-400/25 hover:bg-white/10"
                    >
                      <div>
                        <p className="text-[15px] font-black uppercase tracking-tight text-white group-hover:text-sky-300 transition-colors">{item.name}</p>
                        <p className="mt-1 text-xs text-white/50">{item.note}</p>
                      </div>
                      <div className="size-10 rounded-full bg-sky-400/10 flex items-center justify-center text-sky-400 group-hover:bg-sky-400 group-hover:text-white transition-all duration-300">
                        <ArrowRight className="size-5" />
                      </div>
                    </a>
                  ))}
                </div>

                <div className="mt-12 pt-10 border-t border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-sky-400 mb-6">{t("moments.sources")}</p>
                  <div className="grid gap-3">
                    {officialProfile.sources.map((source) => (
                      <a
                        key={source.href}
                        href={source.href}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl border border-white/8 bg-white/5 px-5 py-4 text-xs transition hover:bg-white/10 hover:border-sky-400/15"
                      >
                        <span className="font-bold text-white/80">{source.label}</span>
                        <span className="mx-2 text-white/20">|</span>
                        <span className="text-white/50">{source.note}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </article>
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
            <p className="text-[12px] font-black uppercase tracking-[0.3em] text-white/40">
              {t("footer.copyright").replace("{year}", currentYear.toString())}
            </p>
            <p className="text-[11px] text-white/30 max-w-2xl mx-auto leading-relaxed">
              {t("footer.disclaimer")}
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
