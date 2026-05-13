"use client"

/* eslint-disable @next/next/no-img-element */

import Link from "next/link"
import { User, Sparkles } from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"
import type { MemberProfile } from "@/lib/member-profiles"
import type { GroupOfficialProfile } from "@/lib/group-official-profile"

interface ProfileSectionProps {
  memberProfiles: MemberProfile[]
  officialProfile: GroupOfficialProfile
}

export function ProfileSection({ memberProfiles, officialProfile }: ProfileSectionProps) {
  const { t } = useTranslation()

  return (
    <section id="profile" className="py-20 select-none relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 relative z-10">

        {/* --- Section Header --- */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-100 bg-white shadow-sm scale-90 origin-left">
              <User className="size-3.5 text-sky-500" />
              <p className="text-sky-600 font-black uppercase tracking-widest text-[9px]">
                {t("moments.fact.group")}
              </p>
            </div>
            <h2 className="section-title">Artist Profile</h2>
          </div>

          {/* Một tag trang trí nhỏ để lấp khoảng trống bên phải, giữ vibe Sparkles của bạn */}
          <div className="hidden md:flex items-center gap-2 text-sky-400/50">
            <Sparkles className="size-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Premium Edition</span>
          </div>
        </div>

        {/* --- Main Profile Card --- */}
        <div className="card-premium p-8 md:p-12 relative overflow-hidden group/section">
          {/* Giữ nguyên Animated Background Blobs của bạn */}
          <div className="absolute top-0 right-0 -mr-24 -mt-24 size-96 bg-gradient-to-br from-white/30 to-pink-200/20 rounded-full blur-3xl transition-transform duration-1000 group-hover/section:-translate-x-10 group-hover/section:translate-y-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 size-96 bg-gradient-to-tr from-sky-400/10 to-transparent rounded-full blur-3xl transition-transform duration-1000 group-hover/section:translate-x-10 group-hover/section:-translate-y-10 pointer-events-none" />

          <div className="relative z-10">
            {/* ── 1. Group Identity Header ── */}
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 mb-16">
              {/* Logo container giữ nguyên style */}
              <div className="shrink-0 relative group/logo">
                <div className="absolute -inset-3 bg-sky-400/15 rounded-[2.5rem] blur-2xl opacity-0 group-hover/logo:opacity-100 transition-opacity duration-700" />
                <div className="relative size-40 rounded-[2rem] bg-white/40 p-6 backdrop-blur-xl border border-white/60 shadow-inner flex items-center justify-center transition-transform duration-700 group-hover/logo:scale-105">
                  <img src={officialProfile.logoAsset} alt="Logo" className="h-full w-full object-contain" />
                </div>
              </div>

              {/* Group Info Grid */}
              <div className="flex-1 w-full text-center lg:text-left">
                <h3 className="text-5xl md:text-7xl font-black uppercase text-black tracking-tighter leading-[0.9] mb-8">
                  {officialProfile.groupName}
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                  {[
                    { label: t("moments.fact.company"), value: officialProfile.company },
                    { label: t("moments.fact.debut"), value: officialProfile.debutDate },
                    { label: t("moments.fact.fandom"), value: officialProfile.fandomName },
                    { label: t("moments.fact.origin"), value: officialProfile.origin },
                  ].map((fact) => (
                    <div key={fact.label} className="group/fact space-y-1.5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-black/30 transition-colors group-hover/fact:text-sky-500">
                        {fact.label}
                      </p>
                      <p className="text-base font-black text-black leading-tight tracking-tight">
                        {fact.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── 2. Members Showcase ── */}
            <div>
              <div className="flex items-center gap-4 mb-10">
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-black/40">
                  {t("concept.members.title")}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-black/5 via-black/5 to-transparent" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8">
                {memberProfiles.map((member, index) => (
                  <Link
                    key={member.slug}
                    href={`/members/${member.slug}`}
                    className="group/member block relative"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Member Image Card - Giữ nguyên logic UI của bạn */}
                    <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] border border-white/60 bg-white/50 shadow-sm transition-all duration-500 group-hover/member:-translate-y-2 group-hover/member:shadow-xl group-hover/member:border-sky-200">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover/member:scale-110"
                      />

                      {/* Keywords Overlay - Giữ nguyên logic UI của bạn */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover/member:opacity-100 transition-all duration-500 flex flex-col justify-end p-5">
                        <div className="flex flex-wrap gap-1.5 justify-center translate-y-4 group-hover/member:translate-y-0 transition-transform duration-500">
                          {member.keywords.slice(0, 2).map((k) => (
                            <span key={k} className="text-[8px] font-black uppercase tracking-widest text-white bg-white/20 px-2 py-1 rounded-full border border-white/20 backdrop-blur-md">
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Member Name & Position */}
                    <div className="mt-4 text-center transition-transform duration-500 group-hover/member:scale-105">
                      <h4 className="text-sm font-black uppercase text-black tracking-tight group-hover/member:text-sky-600 transition-colors">
                        {member.name}
                      </h4>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/30 mt-1">
                        {member.position}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
