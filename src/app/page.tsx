import Image from "next/image"
import { ArrowRight, Disc3, Instagram, Play, Sparkles, Stars, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"

const facts = [
  "Nhóm nhạc nữ 8 thành viên của SM Entertainment",
  "Debut ngày 24.02.2025",
  "Single đầu tay: The Chase",
  "B-side phát hành cùng đợt: Butterflies",
]

const sneakPeeks = ["Jiwoo", "Carmen", "Yuha", "Stella", "Juun", "A-na", "Ian", "Ye-on"]

export default function HomePage() {
  return (
    <main className="page-shell relative min-h-screen">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pb-12 pt-5 sm:px-8 lg:px-10">
        <header className="reveal-up flex items-center justify-between border-b border-sky-100/20 pb-4 delay-1">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-sky-100/40 bg-white/70 shadow-[0_12px_30px_rgba(117,186,255,0.18)] backdrop-blur">
              <Image src="/logo-remove.png" alt="Hearts2Hearts logo" fill className="object-cover" priority />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-primary/85">Hearts2Hearts</p>
              <p className="mt-1 text-sm text-muted-foreground">Sky blue landing concept</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#thong-tin" className="transition hover:text-foreground">
              Thông tin nhóm
            </a>
            <a href="#sneak-peek" className="transition hover:text-foreground">
              Sneak peek
            </a>
            <a href="#fanclub" className="transition hover:text-foreground">
              Fanclub
            </a>
          </nav>
        </header>

        <div className="relative grid flex-1 gap-10 py-10 lg:grid-cols-[1fr_1.02fr] lg:items-center lg:py-16">
          <div className="space-y-8">
            <div className="reveal-up delay-1">
              <p className="mb-3 text-sm uppercase tracking-[0.5em] text-primary/80">Official group info starter</p>
              <p className="outline-kicker text-5xl font-semibold uppercase leading-none sm:text-7xl">Sky Mood</p>
            </div>

            <div className="reveal-up delay-2 space-y-5">
              <h1 className="hero-title max-w-4xl text-6xl font-semibold uppercase leading-[0.9] text-foreground sm:text-7xl lg:text-[7rem]">
                Hearts2
                <br />
                Hearts
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                Tôi đã đổi visual sang tông <span className="text-foreground">sky blue</span> để hợp hơn
                với nhóm, đồng thời giữ landing page theo hướng nhẹ, sáng và mềm hơn. Hiện tại phần hero
                ưu tiên logo, visual nhóm và thông tin cơ bản để bạn tiếp tục design lại sau.
              </p>
            </div>

            <div className="reveal-up delay-3 flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                className="pulse-glow h-12 rounded-full bg-primary px-7 text-sm uppercase tracking-[0.25em] text-primary-foreground hover:bg-primary/90"
              >
                Xem debut
                <Play className="size-4 fill-current" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-sky-100/30 bg-white/30 px-7 text-sm uppercase tracking-[0.25em] text-foreground hover:bg-white/50"
              >
                Fanclub S2U
                <ArrowRight className="size-4" />
              </Button>
            </div>

            <ul className="reveal-up delay-4 grid gap-3 text-sm text-foreground/90 sm:grid-cols-2">
              {facts.map((item) => (
                <li key={item} className="glass-panel rounded-3xl px-4 py-4 leading-6">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="reveal-soft delay-3 relative">
            <div className="float-slow absolute -left-6 top-10 hidden rounded-full border border-sky-100/30 bg-white/45 px-4 py-2 text-xs uppercase tracking-[0.35em] text-primary backdrop-blur md:block">
              Debut 2025
            </div>
            <div className="float-delayed absolute -right-4 top-24 hidden rounded-full border border-sky-200/35 bg-sky-200/20 px-4 py-2 text-xs uppercase tracking-[0.35em] text-primary backdrop-blur md:block">
              H2H
            </div>

            <div className="shine-border glass-panel relative overflow-hidden rounded-[2.4rem] p-4 sm:p-6">
              <div className="pulse-glow absolute -right-8 top-5 h-32 w-32 rounded-full bg-primary/25 blur-3xl" />
              <div className="float-slow absolute -left-4 bottom-0 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
              <div className="spin-orbit absolute right-8 top-8 hidden h-24 w-24 rounded-full border border-sky-100/25 md:block" />

              <div className="relative rounded-[2rem] border border-sky-100/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(206,234,255,0.18))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
                <div className="absolute inset-x-8 top-4 h-px bg-gradient-to-r from-transparent via-sky-200/80 to-transparent" />

                <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="relative min-h-[420px] overflow-hidden rounded-[1.8rem] border border-sky-100/25 bg-[radial-gradient(circle_at_top,rgba(197,230,255,0.85),rgba(255,255,255,0.72)_35%,rgba(185,222,255,0.52)_70%,rgba(173,214,251,0.2)_100%)] p-6">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.82),transparent_30%),radial-gradient(circle_at_80%_25%,rgba(147,197,253,0.22),transparent_25%),radial-gradient(circle_at_50%_100%,rgba(125,211,252,0.2),transparent_35%)]" />

                    <div className="relative flex h-full flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div className="rounded-full border border-sky-200/60 bg-white/75 px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-primary shadow-sm">
                          Group visual
                        </div>
                        <Stars className="size-5 text-primary/70" />
                      </div>

                      <div className="mx-auto w-full max-w-md">
                        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/60 bg-gradient-to-b from-white/90 via-sky-50 to-sky-100/80 shadow-[0_35px_80px_rgba(119,178,233,0.22)]">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.45),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0),rgba(125,211,252,0.12))]" />
                          <div className="relative h-full w-full">
                            <Image
                              src="/group.png"
                              alt="Ảnh nhóm Hearts2Hearts"
                              fill
                              className="object-cover object-center"
                              priority
                            />
                          </div>
                        </div>
                      </div>

                      <p className="text-center text-sm leading-6 text-slate-600">
                        Ảnh nhóm thật đã được gắn vào hero để landing page nhìn đúng hướng fanpage hơn.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[1.6rem] border border-sky-100/25 bg-white/55 p-5 backdrop-blur">
                      <p className="text-xs uppercase tracking-[0.35em] text-primary/80">Hearts2Hearts</p>
                      <p className="mt-3 text-3xl uppercase text-slate-800">The Chase</p>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        Khối thông tin nhanh cho hero: tên nhóm, debut, single đầu tay và fandom.
                      </p>
                    </div>

                    <div className="rounded-[1.6rem] border border-sky-100/25 bg-sky-100/35 p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.35em] text-primary/80">Debut profile</p>
                        <Sparkles className="size-4 text-primary" />
                      </div>
                      <div className="mt-4 space-y-3">
                        <div className="flex items-end justify-between border-b border-dashed border-sky-200/55 pb-3">
                          <span className="text-sm uppercase tracking-[0.3em] text-slate-500">Agency</span>
                          <span className="text-lg text-slate-800">SM Entertainment</span>
                        </div>
                        <div className="flex items-end justify-between border-b border-dashed border-sky-200/55 pb-3">
                          <span className="text-sm uppercase tracking-[0.3em] text-slate-500">Debut</span>
                          <span className="text-lg text-slate-800">24.02.2025</span>
                        </div>
                        <div className="flex items-end justify-between">
                          <span className="text-sm uppercase tracking-[0.3em] text-slate-500">Fanclub</span>
                          <span className="text-lg text-slate-800">S2U</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[1.6rem] border border-sky-100/25 bg-white/55 p-5">
                      <p className="text-xs uppercase tracking-[0.35em] text-primary/80">Sneak peek</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {sneakPeeks.map((member) => (
                          <span
                            key={member}
                            className="rounded-full border border-sky-200/50 bg-white/80 px-3 py-2 text-xs uppercase tracking-[0.24em] text-slate-700"
                          >
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-y border-sky-100/15 py-4">
        <div className="marquee-track flex gap-4 text-xs uppercase tracking-[0.5em] text-primary/75">
          {Array.from({ length: 2 }).map((_, groupIndex) => (
            <div key={groupIndex} className="flex gap-4">
              {["Hearts2Hearts", "Sky Blue", "The Chase", "Butterflies", "SM Entertainment", "S2U"].map((item) => (
                <span key={`${groupIndex}-${item}`} className="rounded-full border border-sky-100/20 px-4 py-2">
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section
        id="thong-tin"
        className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:py-16"
      >
        <div className="reveal-up glass-panel rounded-[2rem] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.45em] text-primary/85">Thông tin nhóm</p>
          <h2 className="mt-4 text-4xl leading-none text-slate-900 sm:text-5xl">Landing page giờ tập trung vào nhóm thay vì profile từng thành viên.</h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-slate-600">
            Theo đúng yêu cầu, tôi đã bỏ layout member cards dài và giữ phần thành viên ở mức sneak peek.
            Trọng tâm hiện tại là logo, visual nhóm, thông tin debut và các khối giới thiệu chính.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <article className="reveal-up tilt-card glass-panel rounded-[2rem] p-6">
            <Disc3 className="size-5 text-primary" />
            <h3 className="mt-4 text-3xl uppercase text-slate-900">Single debut</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Hearts2Hearts ra mắt với single album đầu tay gồm ca khúc chủ đề <span className="text-slate-900">The Chase</span> và b-side <span className="text-slate-900">Butterflies</span>.
            </p>
          </article>

          <article className="reveal-up tilt-card glass-panel rounded-[2rem] p-6 delay-1">
            <Sparkles className="size-5 text-primary" />
            <h3 className="mt-4 text-3xl uppercase text-slate-900">Sky blue palette</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Toàn bộ màu đã được đổi sang hệ xanh trời, trắng sữa và bạc nhạt để nhìn mềm, sáng và hợp mood của logo hơn bản trước.
            </p>
          </article>
        </div>
      </section>

      <section
        id="sneak-peek"
        className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-16"
      >
        <div className="reveal-up rounded-[2rem] border border-sky-100/20 bg-white/35 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.45em] text-primary/85">Sneak peek</p>
          <h2 className="mt-4 text-4xl text-slate-900 sm:text-5xl">Giữ chỗ cho phần member preview.</h2>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {sneakPeeks.map((member, index) => (
              <div
                key={member}
                className="reveal-up rounded-[1.4rem] border border-sky-100/30 bg-white/65 px-4 py-4 text-sm uppercase tracking-[0.35em] text-slate-700 backdrop-blur"
                style={{ animationDelay: `${0.12 + index * 0.05}s` }}
              >
                {member}
              </div>
            ))}
          </div>
        </div>

        <aside id="fanclub" className="reveal-up glass-panel rounded-[2rem] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.45em] text-primary/85">Fanclub</p>
          <h2 className="mt-4 text-4xl text-slate-900 sm:text-5xl">S2U</h2>
          <p className="mt-5 text-sm leading-7 text-slate-600">
            Khối CTA này giữ lại để sau bạn có thể nối sang fanclub page, subscribe form hoặc community hub.
          </p>

          <div className="mt-8 rounded-[1.75rem] border border-sky-100/20 bg-white/45 p-4">
            <label htmlFor="fan-email" className="text-xs uppercase tracking-[0.35em] text-primary/80">
              Email của bạn
            </label>
            <input
              id="fan-email"
              type="email"
              placeholder="s2u@fanmail.vn"
              className="mt-4 h-12 w-full rounded-full border border-sky-100/35 bg-white/80 px-5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-primary"
            />
            <Button className="mt-4 h-12 w-full rounded-full bg-primary text-sm uppercase tracking-[0.3em] text-primary-foreground hover:bg-primary/90">
              Nhận cập nhật
            </Button>
          </div>

          <div className="mt-8 flex items-center gap-3 text-slate-500">
            <a
              href="#"
              className="flex size-11 items-center justify-center rounded-full border border-sky-100/20 bg-white/55 transition hover:bg-white/80 hover:text-slate-800"
              aria-label="Instagram"
            >
              <Instagram className="size-4" />
            </a>
            <a
              href="#"
              className="flex size-11 items-center justify-center rounded-full border border-sky-100/20 bg-white/55 transition hover:bg-white/80 hover:text-slate-800"
              aria-label="YouTube"
            >
              <Youtube className="size-4" />
            </a>
          </div>
        </aside>
      </section>
    </main>
  )
}
