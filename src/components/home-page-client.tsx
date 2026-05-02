"use client"

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Sparkles, Waves } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FilmStrip } from "@/components/film-strip"
import { HomeStatsSection } from "@/components/home-stats-section"
import { TimelineSection } from "@/components/timeline-section"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslation } from "@/hooks/useTranslation"
import { createClient } from "@/lib/supabase/client"
import type { FilmFrame, TimelineEvent } from "@/lib/release-catalog"
import type { MemberProfile } from "@/lib/member-profiles"
import type { GroupOfficialProfile } from "@/lib/group-official-profile"
import type { HomeStatsSnapshot } from "@/lib/home-stats"

type OfficialLink = {
  name: string
  href: string
  note: string
}

type HeaderAccount = {
  avatarUrl: string | null
  displayName: string
  href: string
  isAdmin: boolean
}

interface HomePageClientProps {
  filmFrames: FilmFrame[]
  timelineEvents: TimelineEvent[]
  memberProfiles: MemberProfile[]
  officialProfile: GroupOfficialProfile
  officialLinks: OfficialLink[]
  homeStatsSnapshot: HomeStatsSnapshot
}

type HeaderNavLinkProps = {
  href: string
  label: string
}

function HeaderNavLink({ href, label }: HeaderNavLinkProps) {
  return (
    <a
      href={href}
      className="relative group text-[12px] font-semibold tracking-[0.16em] text-foreground/90 transition-colors hover:text-primary"
    >
      {label}
      <span className="absolute -bottom-1 left-1/2 h-[1.5px] w-0 bg-gradient-to-r from-accent via-primary to-primary/60 opacity-85 transition-all duration-300 group-hover:left-0 group-hover:w-full" />
    </a>
  )
}

function HeaderAccountButton() {
  const router = useRouter()
  const [headerAccount, setHeaderAccount] = useState<HeaderAccount | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadAccount() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!isMounted || !user) return

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, role")
          .eq("id", user.id)
          .maybeSingle()

        if (!isMounted) return

        const nextHeaderAccount = {
          avatarUrl: profile?.avatar_url ?? null,
          displayName: profile?.full_name ?? user.email ?? "User",
          href: profile?.role === "admin" ? "/admin" : "/account",
          isAdmin: profile?.role === "admin",
        }

        setHeaderAccount(nextHeaderAccount)

        if (nextHeaderAccount.isAdmin) {
          router.prefetch("/admin")
        }
      } catch {
        if (isMounted) {
          setHeaderAccount(null)
        }
      }
    }

    loadAccount()

    return () => {
      isMounted = false
    }
  }, [router])

  return (
    <Link
      href={headerAccount?.href ?? "/login"}
      prefetch={headerAccount?.isAdmin ? true : undefined}
      onMouseEnter={() => {
        if (headerAccount?.isAdmin) {
          router.prefetch("/admin")
        }
      }}
      onFocus={() => {
        if (headerAccount?.isAdmin) {
          router.prefetch("/admin")
        }
      }}
      aria-label={headerAccount ? `${headerAccount.displayName} account` : "Login"}
      className="hidden items-center rounded-full border border-primary/20 bg-secondary/60 px-2 py-1.5 shadow-sm transition hover:bg-background/80 md:inline-flex backdrop-blur-md"
    >
      {headerAccount ? (
        <div className="flex items-center gap-2 pr-1">
          {headerAccount.avatarUrl ? (
            <img
              src={headerAccount.avatarUrl}
              alt={headerAccount.displayName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold uppercase tracking-[0.16em] text-background">
              {headerAccount.displayName.slice(0, 2)}
            </span>
          )}
          {headerAccount.isAdmin ? (
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">Admin</span>
          ) : null}
        </div>
      ) : (
        <span className="px-3 text-[12px] font-semibold uppercase tracking-[0.28em] text-foreground/70">Login</span>
      )}
    </Link>
  )
}

type HeroFeatureCardProps = {
  label: string
  title: string
  description: string
}

function HeroFeatureCard({ label, title, description }: HeroFeatureCardProps) {
  return (
    <div className="hero-feature-card group hover:border-accent/40 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(255,107,157,0.12)]">
      <p className="text-[11px] uppercase tracking-[0.35em] text-primary/70">{label}</p>
      <p className="mt-3 text-2xl uppercase text-foreground">{title}</p>
      <p className="mt-3 text-sm leading-7 text-foreground/70">{description}</p>
    </div>
  )
}

type OfficialFactCardProps = {
  label: string
  value: ReactNode
}

function OfficialFactCard({ label, value }: OfficialFactCardProps) {
  return (
    <div className="rounded-xl border border-primary/10 bg-background/80 px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-primary/75">{label}</p>
      <div className="mt-1 text-sm text-foreground">{value}</div>
    </div>
  )
}

export function HomePageClient({
  filmFrames,
  timelineEvents,
  memberProfiles,
  officialProfile,
  officialLinks,
  homeStatsSnapshot,
}: HomePageClientProps) {
  const { t } = useTranslation()
  const navItems = [
    { key: "concept", label: t("header.nav.concept") },
    { key: "moments", label: t("header.nav.moments") },
    { key: "join", label: t("header.nav.join") },
  ]
  const heroTags = t("hero.tags") as unknown as string[]
  const featureCards = [
    {
      key: "card1",
      label: t("features.card1.label"),
      title: t("features.card1.title"),
      description: t("features.card1.desc"),
    },
    {
      key: "card2",
      label: t("features.card2.label"),
      title: t("features.card2.title"),
      description: t("features.card2.desc"),
    },
    {
      key: "card3",
      label: t("features.card3.label"),
      title: t("features.card3.title"),
      description: t("features.card3.desc"),
    },
  ]
  const officialFacts = [
    { key: "group", label: t("moments.fact.group"), value: officialProfile.groupName },
    { key: "company", label: t("moments.fact.company"), value: officialProfile.company },
    { key: "labels", label: t("moments.fact.labels"), value: officialProfile.labels },
    { key: "origin", label: t("moments.fact.origin"), value: officialProfile.origin },
    { key: "debut", label: t("moments.fact.debut"), value: officialProfile.debutDate },
    { key: "members", label: t("moments.fact.members"), value: officialProfile.membersCount },
    { key: "fandom", label: t("moments.fact.fandom"), value: officialProfile.fandomName },
    {
      key: "color",
      label: t("moments.fact.color"),
      value: (
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-primary ring-2 ring-primary/20 shadow-[0_0_10px_hsla(var(--primary),0.5)]" />
          {officialProfile.officialColor}
        </div>
      ),
    },
  ]
  const currentYear = new Date().getFullYear()

  return (
    <main className="sky-page bg-background">
      <section className="hero-shell mx-auto min-h-screen w-full max-w-7xl px-5 pb-12 pt-24 sm:px-8 sm:pt-28 lg:px-10">
        <header className="reveal-up fixed inset-x-0 top-5 z-50 mx-auto flex w-[calc(100%-2.5rem)] max-w-7xl items-center justify-between overflow-hidden rounded-full border border-primary/20 bg-secondary/40 px-6 py-2.5 shadow-[0_10px_36px_rgba(31,38,135,0.09)] backdrop-blur-2xl ring-1 ring-white/20 transition-all duration-500 hover:border-white/75 hover:bg-background/60 hover:shadow-[0_24px_65px_hsla(var(--primary),0.18)] sm:w-[calc(100%-4rem)] lg:w-[calc(100%-5rem)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white/35 to-transparent"
          />
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-primary/40 opacity-20 blur transition duration-1000 group-hover:opacity-40" />
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-primary/20 bg-background/90 shadow-sm">
                <img
                  src="/logo-official-removebg-.png"
                  alt="H2H official logo"
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:rotate-12"
                />
              </div>
            </div>
            <div className="flex flex-col items-start translate-y-0.5">
              <p className="text-[10px] font-bold uppercase leading-none tracking-[0.6em] text-primary transition-all group-hover:tracking-[0.7em]">
                {t("header.brand")}
              </p>
              <p className="mt-1.5 text-[9px] font-medium uppercase tracking-[0.25em] text-foreground/40 group-hover:text-accent transition-colors">
                {t("header.tagline")}
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-10 md:flex">
            {navItems.map((item) => (
              <HeaderNavLink key={item.key} href={`#${item.key}`} label={item.label} />
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <HeaderAccountButton />
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background/50 md:hidden">
              <div className="relative h-[1px] w-4 bg-primary after:absolute after:left-0 after:top-1.5 after:h-[1px] after:w-4 after:bg-primary after:content-[''] before:absolute before:left-0 before:-top-1.5 before:h-[1px] before:w-4 before:bg-primary before:content-['']" />
            </div>
          </div>
        </header>

        <div className="relative pb-8 pt-12 lg:pt-16">
          {/* Floating Hearts Decoration */}
          <div className="floating-heart pointer-events-none absolute -left-12 top-0 opacity-20 animate-bounce delay-1000">
             <svg width="40" height="40" viewBox="0 0 24 24" fill="hsl(var(--accent))"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
          <div className="floating-heart pointer-events-none absolute -right-8 top-1/4 opacity-15 animate-pulse delay-500">
             <svg width="30" height="30" viewBox="0 0 24 24" fill="hsl(var(--accent))"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
          <div className="mx-auto max-w-5xl text-center">
            <div className="reveal-up delay-1 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/40 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.4em] text-primary shadow-sm backdrop-blur-md">
              <Sparkles className="size-3 text-accent animate-pulse" />
              {t("hero.badge")}
            </div>

            <div className="hero-title-stack relative mt-8">
              <div className="hero-title-strip scale-105 opacity-90" aria-hidden="true">
                <FilmStrip frames={filmFrames} />
              </div>

              <h1 className="reveal-up delay-2 hero-headline text-[3.8rem] font-light uppercase leading-[0.8] tracking-tighter mix-blend-darken sm:text-[5.5rem] lg:text-[8.5rem]">
                <span className="hero-title-sky bg-gradient-to-b from-sky-600 to-sky-400 bg-clip-text text-transparent">
                  {t("hero.title")}
                </span>
              </h1>
            </div>

            <p className="reveal-up delay-3 mx-auto mt-10 max-w-2xl text-base font-light leading-relaxed tracking-wide text-foreground/70 sm:text-lg">
              {t("hero.subtitle")}
            </p>

            <div className="reveal-up delay-3 mt-10 flex flex-wrap items-center justify-center gap-3">
              {heroTags.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-primary/20 bg-background/30 px-5 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-primary/70 shadow-sm backdrop-blur-sm transition-transform hover:-translate-y-1"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="reveal-up delay-3 mt-8 flex justify-center">
            <div className="hero-logo-ring relative h-24 w-24 rounded-full border border-primary/20 bg-background/50 p-3 shadow-[0_20px_45px_hsla(var(--primary),0.12)] backdrop-blur-xl sm:h-28 sm:w-28">
              <img
                src="/logo-official-removebg-.png"
                alt="H2H official logo"
                className="h-full w-full object-contain drop-shadow-[0_18px_20px_hsla(var(--primary),0.3)]"
              />
            </div>
          </div>

          <div className="reveal-up delay-4 mt-8 grid gap-4 lg:grid-cols-3">
            {featureCards.map((card) => (
              <HeroFeatureCard
                key={card.key}
                label={card.label}
                title={card.title}
                description={card.description}
              />
            ))}
          </div>

          <HomeStatsSection snapshot={homeStatsSnapshot} />

          <TimelineSection events={timelineEvents} />
        </div>
      </section>

      <section id="concept" className="mx-auto w-full max-w-7xl px-5 py-4 sm:px-8 lg:px-10">
        <div className="sky-panel reveal-up rounded-[2.4rem] p-6 sm:p-8 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-[1.9rem] border border-primary/20 bg-background/60 p-5 shadow-[0_16px_38px_hsla(var(--primary),0.06)]">
              <p className="text-xs uppercase tracking-[0.45em] text-primary/70">{t("concept.official")}</p>
              <h2 className="mt-4 text-3xl uppercase leading-none text-foreground sm:text-4xl">
                {t("concept.official.title")}
              </h2>
              <p className="mt-4 text-sm leading-7 text-foreground/70">{t("concept.official.desc")}</p>

              <div className="mt-6 rounded-[1.8rem] border border-primary/10 bg-background/70 p-5 shadow-[0_18px_40px_hsla(var(--primary),0.08)]">
                <div className="grid gap-5 md:grid-cols-[1fr_1.1fr] md:items-start">
                  <div className="overflow-hidden rounded-[1.3rem] border border-primary/10 bg-secondary/70 p-4">
                    <div className="mx-auto w-full max-w-[180px] rounded-2xl border border-primary/10 bg-background/90 p-4 shadow-[0_14px_30px_hsla(var(--primary),0.08)]">
                      <img
                        src={officialProfile.logoAsset}
                        alt={`${officialProfile.groupName} logo`}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <p className="mt-3 text-center text-[11px] leading-5 text-foreground/50">{officialProfile.logoNote}</p>
                  </div>

                  <div className="grid gap-2">
                    {officialFacts.map((fact) => (
                      <OfficialFactCard key={fact.key} label={fact.label} value={fact.value} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.45em] text-primary/70">{t("concept.members")}</p>
                <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/40">
                  {t("concept.members.detail")}
                </p>
              </div>
              <h3 className="mt-4 text-3xl uppercase leading-none text-foreground sm:text-4xl">
                {t("concept.members.title")}
              </h3>
              <p className="mt-4 text-sm leading-7 text-foreground/70">{t("concept.members.desc")}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {memberProfiles.map((member) => (
                  <Link
                    key={member.slug}
                    href={`/members/${member.slug}`}
                    className="group overflow-hidden rounded-[1.2rem] border border-primary/15 bg-background/70 shadow-[0_10px_24px_hsla(var(--primary),0.06)] transition hover:-translate-y-1 hover:border-primary/40"
                  >
                    <div className="relative h-28 overflow-hidden border-b border-primary/10 bg-secondary/60">
                      <img
                        src={member.image}
                        alt={`${member.name} profile`}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-sm uppercase tracking-[0.08em] text-foreground">{member.name}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-primary/80">
                        {member.position}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </article>

            <article
              id="moments"
              className="rounded-[1.9rem] border border-primary/20 bg-background/60 p-5 shadow-[0_16px_38px_hsla(var(--primary),0.06)]"
            >
              <div className="flex items-center gap-3 text-primary">
                <Sparkles className="size-5" />
                <p className="text-xs uppercase tracking-[0.45em]">{t("moments.title")}</p>
              </div>

              <p className="mt-4 text-sm leading-7 text-foreground/70">{t("moments.subtitle")}</p>

              <div className="mt-6 grid gap-3">
                {officialLinks.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group rounded-[1.1rem] border border-primary/10 bg-background/70 px-4 py-3 shadow-[0_8px_20px_hsla(var(--primary),0.04)] transition hover:-translate-y-0.5 hover:border-primary/40"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm uppercase tracking-[0.12em] text-foreground">{item.name}</p>
                        <p className="mt-1 text-xs text-foreground/50">{item.note}</p>
                      </div>
                      <ArrowRight className="size-4 text-primary transition group-hover:translate-x-0.5" />
                    </div>
                  </a>
                ))}
              </div>

              <div className="mt-6 rounded-[1.4rem] border border-primary/10 bg-background/65 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-foreground/60">{t("moments.sources")}</p>
                <div className="mt-3 grid gap-2">
                  {officialProfile.sources.map((source) => (
                    <a
                      key={source.href}
                      href={source.href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-primary/10 bg-background/75 px-4 py-3 transition hover:border-primary/40"
                    >
                      <p className="text-sm uppercase tracking-[0.1em] text-foreground">{source.label}</p>
                      <p className="mt-1 text-xs text-foreground/50">{source.note}</p>
                    </a>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="join" className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="grid gap-6">
          <aside className="sky-panel reveal-up rounded-[2.2rem] p-6 sm:p-8">
            <div className="flex items-center gap-3 text-primary">
              <Waves className="size-5" />
              <p className="text-xs uppercase tracking-[0.45em]">{t("join.title")}</p>
            </div>

            <h2 className="mt-5 text-4xl uppercase leading-none text-foreground sm:text-5xl">
              {t("join.subtitle")}
            </h2>
            <p className="mt-5 text-sm leading-7 text-foreground/70">{t("join.desc")}</p>

            <div className="mt-8 rounded-[1.8rem] border border-primary/20 bg-gradient-to-b from-background/90 to-secondary/80 p-5 shadow-[0_16px_40px_hsla(var(--primary),0.08)]">
              <label htmlFor="fan-email" className="text-xs uppercase tracking-[0.35em] text-primary/80">
                {t("join.email")}
              </label>
              <input
                id="fan-email"
                type="email"
                placeholder="skyline@h2h.vn"
                suppressHydrationWarning
                className="mt-4 h-12 w-full rounded-full border border-primary/20 bg-background/90 px-5 text-sm text-foreground outline-none placeholder:text-foreground/40 focus:border-primary/60"
              />
              <Button className="mt-4 h-12 w-full rounded-full bg-foreground text-sm uppercase tracking-[0.3em] text-background hover:bg-foreground/80">
                {t("join.subscribe")}
              </Button>
            </div>
          </aside>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-7xl px-5 pb-10 pt-2 sm:px-8 lg:px-10">
        <div className="rounded-2xl border border-primary/10 bg-background/55 px-6 py-4 shadow-[0_10px_24px_hsla(var(--primary),0.08)] backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2.5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-foreground/60">
              © {currentYear} H2H Home · Unofficial Fan Project · Non-commercial
            </p>

            <div className="relative group">
              <div className="flex h-4 w-4 cursor-default items-center justify-center rounded-full border border-foreground/30 text-[9px] font-semibold text-foreground/40 transition hover:border-primary hover:text-primary">
                i
              </div>

              <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2.5 w-80 -translate-x-1/2 translate-y-1 rounded-xl border border-primary/20 bg-background/95 p-4 opacity-0 shadow-[0_16px_40px_hsla(var(--primary),0.18)] backdrop-blur-md transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-primary/20 bg-background/95" />

                <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">
                  Copyright Notice
                </p>

                <p className="text-[11px] leading-5 text-foreground/60">
                  This is an independent fan encyclopedia, not affiliated with H2H or their label.
                  All artist names, logos, images, and music-related assets belong to their respective owners.
                  Content is used for fan reference under fair use principles. No commercial benefit is derived.
                </p>

                <p className="mt-2 text-[11px] leading-5 text-foreground/60">
                  Rights holder?{" "}
                  <a
                    href="mailto:contact@h2hhub.fan"
                    className="pointer-events-auto text-primary underline underline-offset-2"
                  >
                    Contact us
                  </a>{" "}
                  for immediate removal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
