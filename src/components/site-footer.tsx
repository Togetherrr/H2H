"use client"

import { Heart, X, Shield, Copyright, ExternalLink } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "@/hooks/useTranslation"

type ModalType = "privacy" | "copyright" | null

export function SiteFooter() {
  const { t } = useTranslation()
  const [activeModal, setActiveModal] = useState<ModalType>(null)

  const closeModal = () => setActiveModal(null)

  return (
    <>
      <footer id="site-footer" className="relative z-0 max-w-5xl mx-auto px-4 pb-28 md:pb-36">
        <div className="card-premium shimmer-border !rounded-[2.5rem] p-10 text-center relative overflow-hidden">
          {/* Ambient glows */}
          <div className="absolute top-0 right-0 size-96 bg-pink-200/10 blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 size-96 bg-sky-200/10 blur-[100px] rounded-full -ml-20 -mb-20 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* Decorative divider */}
            <div className="flex items-center gap-6 text-sky-400">
              <Heart className="size-5 fill-current" />
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />
             <Heart className="size-5 fill-current" />
            </div>


            {/* Disclaimer */}
            <p className="text-[11px] text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {t("footer.disclaimer")}
            </p>

            {/* Legal links */}
            <div className="flex items-center gap-1 flex-wrap justify-center">
              <button
                onClick={() => setActiveModal("privacy")}
                className="group flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-widest text-slate-500 hover:text-sky-400 hover:bg-sky-400/10 border border-transparent hover:border-sky-400/20 transition-all duration-300"
              >
                <Shield className="size-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                Privacy Policy
              </button>

              <span className="text-slate-700 text-[10px]">·</span>

              <button
                onClick={() => setActiveModal("copyright")}
                className="group flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-widest text-slate-500 hover:text-pink-400 hover:bg-pink-400/10 border border-transparent hover:border-pink-400/20 transition-all duration-300"
              >
                <Copyright className="size-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                Copyright Notice
              </button>
            </div>

            {/* Fan-made notice */}
            <p className="text-[10px] text-slate-600 tracking-widest uppercase">
              Fan-made site · Not affiliated with any agency or label
            </p>
          </div>
        </div>
      </footer>

      {/* Modal Overlay */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal Card */}
          <div
            className="relative z-10 w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-3xl border border-slate-700/60 bg-slate-900/95 shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
            style={{
              background:
                "linear-gradient(135deg, rgb(15 23 42 / 0.98) 0%, rgb(15 23 42 / 0.95) 100%)",
            }}
          >
            {/* Glow accent */}
            <div
              className={`absolute top-0 right-0 size-64 blur-[80px] rounded-full -mr-10 -mt-10 pointer-events-none opacity-30 ${
                activeModal === "privacy" ? "bg-sky-400" : "bg-pink-400"
              }`}
            />

            {/* Header */}
            <div className="relative flex items-center justify-between p-6 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                {activeModal === "privacy" ? (
                  <div className="flex items-center justify-center size-9 rounded-xl bg-sky-400/10 border border-sky-400/20">
                    <Shield className="size-4 text-sky-400" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center size-9 rounded-xl bg-pink-400/10 border border-pink-400/20">
                    <Copyright className="size-4 text-pink-400" />
                  </div>
                )}
                <div>
                  <h2 className="text-sm font-bold text-slate-100 tracking-wide">
                    {activeModal === "privacy" ? "Privacy Policy" : "Copyright Notice"}
                  </h2>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
                    Fan Site · Non-commercial
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="flex items-center justify-center size-8 rounded-full text-slate-500 hover:text-slate-200 hover:bg-slate-700/50 transition-all duration-200"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Content */}
            <div className="relative p-6 space-y-5 text-[13px] text-slate-400 leading-relaxed">
              {activeModal === "privacy" ? (
                <>
                  <Section title="Information We Collect">
                    This website does not collect, store, or process any personal
                    information from visitors. We do not use tracking cookies, analytics
                    services, or any form of user profiling. Your visit to this site is
                    entirely anonymous.
                  </Section>

                  <Section title="Third-Party Content">
                    This site may display or link to content hosted on third-party
                    platforms (e.g. YouTube, Twitter/X, Instagram, Weverse). Those
                    platforms operate under their own privacy policies, which govern any
                    data they collect when you interact with embedded or linked content.
                  </Section>

                  <Section title="No Data Sharing">
                    We do not sell, trade, or otherwise transfer any information to
                    outside parties. As a fan-operated, non-commercial website, we have
                    no financial interest in your data.
                  </Section>

                  <Section title="Contact">
                    If you have any concerns regarding privacy on this site, you may
                    reach out to the site administrator via the contact information
                    provided elsewhere on this page.
                  </Section>

                  <p className="text-[11px] text-slate-600 pt-2 border-t border-slate-800">
                    Last updated · 2026 · This policy may be updated at any time
                    without prior notice.
                  </p>
                </>
              ) : (
                <>
                  <Section title="Fan-Made Content">
                    This is an independent fan site created out of love and admiration.
                    It is not affiliated with, endorsed by, or connected to any talent
                    agency, entertainment company, or official management team.
                  </Section>

                  <Section title="Media & Images">
                    All photos, videos, audio recordings, logos, and other media
                    displayed on this site remain the exclusive property of their
                    respective copyright holders — including but not limited to the
                    artists themselves, their management agencies, record labels,
                    photographers, and content creators. No ownership is claimed over
                    any such material.
                  </Section>

                  <Section title="Fair Use Disclaimer">
                    Content is shared here under the principles of fan appreciation
                    and non-commercial use, solely for the purpose of celebrating and
                    promoting the artists. If you are a copyright owner and believe
                    your material has been used inappropriately, please contact us and
                    we will promptly remove it.
                  </Section>

                  <Section title="Original Fan Works">
                    Any original writing, design, or creative work produced by this
                    site&apos;s administrator remains the property of its creator. Please do
                    not reproduce without credit.
                  </Section>

                  <div className="flex items-start gap-2 p-3 rounded-xl bg-pink-400/5 border border-pink-400/15 mt-4">
                    <ExternalLink className="size-3.5 text-pink-400/70 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-slate-500">
                      All rights to the artists&apos; names, likenesses, and intellectual
                      property belong to their respective owners. This site operates
                      on a non-profit, fan-appreciation basis only.
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-600 pt-2 border-t border-slate-800">
                    © {new Date().getFullYear()} Fan Site · All third-party content
                    belongs to respective owners.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300">
        {title}
      </h3>
      <p>{children}</p>
    </div>
  )
}