import { ArrowRight, CalendarDays, Disc3, Instagram, Play, Star, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"

const members = [
  {
    stage: "Jiwoo",
    note: "Một trong tám thành viên của Hearts2Hearts, được giới thiệu trong đội hình debut đầu tiên.",
  },
  {
    stage: "Carmen",
    note: "Tên thành viên xuất hiện trong đội hình chính thức được SM công bố trước debut.",
  },
  {
    stage: "Yuha",
    note: "Thuộc line-up debut của nhóm, phù hợp để sau này mở rộng thành hồ sơ cá nhân riêng.",
  },
  {
    stage: "Stella",
    note: "Được trình bày ở đây như một profile card tạm, thuận tiện thay ảnh và mô tả sau này.",
  },
  {
    stage: "Juun",
    note: "Một trong tám thành viên được công bố trong giai đoạn debut của Hearts2Hearts.",
  },
  {
    stage: "A-na",
    note: "Tên thành viên hiện dùng để khớp đội hình công khai, chưa gán position giả định.",
  },
  {
    stage: "Ian",
    note: "Giữ layout profile ngắn để bạn có thể redesign và thêm concept shoot sau.",
  },
  {
    stage: "Ye-on",
    note: "Card cuối của đội hình 8 thành viên, đúng hướng cho landing page giới thiệu nhóm.",
  },
]

const moments = [
  "Debut ngày 24.02.2025",
  "Single đầu tay: The Chase",
  "B-side cùng đợt phát hành: Butterflies",
]

export default function HomePage() {
  return (
    <main className="page-shell relative min-h-screen">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pb-10 pt-5 sm:px-8 lg:px-10">
        <header className="reveal-up flex items-center justify-between border-b border-white/10 pb-4 delay-1">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-accent/80">Hearts2Hearts</p>
            <p className="mt-1 text-sm text-muted-foreground">K-pop performance collective</p>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#ve-nhom" className="transition hover:text-foreground">
              Về nhóm
            </a>
            <a href="#lich-dien" className="transition hover:text-foreground">
              Lịch diễn
            </a>
            <a href="#fanclub" className="transition hover:text-foreground">
              Fanclub
            </a>
          </nav>
        </header>

        <div className="relative grid flex-1 gap-10 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-16">
          <div className="space-y-8">
            <div className="reveal-up delay-1">
            <p className="mb-3 text-sm uppercase tracking-[0.5em] text-primary/80">SM Entertainment Girl Group</p>
              <p className="outline-kicker text-5xl font-semibold uppercase leading-none sm:text-7xl">
                Hearts
              </p>
            </div>

            <div className="reveal-up delay-2 space-y-5">
              <h1 className="hero-title max-w-4xl text-6xl font-semibold uppercase leading-[0.9] text-foreground sm:text-7xl lg:text-[7.5rem]">
                Hearts2
                <br />
                Hearts
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                Landing page này đã được chỉnh nội dung để gần với Hearts2Hearts hơn: nhóm nhạc nữ
                8 thành viên của SM Entertainment, debut ngày 24 tháng 2 năm 2025 với single album
                <span className="text-foreground"> The Chase</span>. Phần visual vẫn giữ chất
                editorial để bạn redesign tiếp sau.
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
                className="h-12 rounded-full border-white/15 bg-white/5 px-7 text-sm uppercase tracking-[0.25em] text-foreground hover:bg-white/10"
              >
                Theo dõi fanclub
                <ArrowRight className="size-4" />
              </Button>
            </div>

            <ul className="reveal-up delay-4 grid gap-3 text-sm text-foreground/90 sm:grid-cols-3">
              {moments.map((item) => (
                <li key={item} className="glass-panel rounded-3xl px-4 py-4 leading-6">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="reveal-soft delay-3 relative">
            <div className="float-slow absolute -left-8 top-10 hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-accent/80 backdrop-blur md:block">
              8 thành viên
            </div>
            <div className="float-delayed absolute -right-6 top-28 hidden rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-primary-foreground/90 backdrop-blur md:block">
              S2U
            </div>

            <div className="shine-border glass-panel relative overflow-hidden rounded-[2rem] p-5 sm:p-7">
              <div className="pulse-glow absolute -right-16 top-8 h-32 w-32 rounded-full bg-primary/25 blur-3xl" />
              <div className="float-slow absolute bottom-0 left-0 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
              <div className="spin-orbit absolute right-10 top-10 hidden h-24 w-24 rounded-full border border-white/10 md:block" />

              <div className="relative rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
                <div className="mb-12 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-accent/70">Debut Release</p>
                    <p className="mt-2 text-2xl uppercase">The Chase</p>
                  </div>
                  <Star className="size-5 text-primary" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-end justify-between border-b border-dashed border-white/10 pb-3">
                    <span className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Debut</span>
                    <span className="text-lg">24.02.2025</span>
                  </div>
                  <div className="flex items-end justify-between border-b border-dashed border-white/10 pb-3">
                    <span className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Agency</span>
                    <span className="text-lg">SM Entertainment</span>
                  </div>
                  <div className="flex items-end justify-between pb-2">
                    <span className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Fanclub</span>
                    <span className="text-lg">S2U</span>
                  </div>
                </div>

                <div className="mt-10 rounded-[1.4rem] border border-white/10 bg-gradient-to-br from-primary/20 via-transparent to-accent/10 p-5">
                  <p className="text-xs uppercase tracking-[0.4em] text-accent/80">Concept note</p>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    Bản phát hành đầu tay gồm ca khúc chủ đề <span className="text-foreground">The Chase</span>
                    và bài hát đi kèm <span className="text-foreground">Butterflies</span>, với mood bí ẩn,
                    mơ màng và thiên về performance.
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-1 hidden rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur md:block">
              <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Live energy</p>
              <p className="mt-1 text-sm">Đội hình 8 thành viên, debut 2025</p>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-y border-white/10 py-4">
        <div className="marquee-track flex gap-4 text-xs uppercase tracking-[0.5em] text-accent/75">
          {Array.from({ length: 2 }).map((_, groupIndex) => (
            <div key={groupIndex} className="flex gap-4">
              {["Hearts2Hearts", "The Chase", "Butterflies", "SM Entertainment", "S2U", "Debut 24.02.2025"].map(
                (item) => (
                  <span key={`${groupIndex}-${item}`} className="rounded-full border border-white/10 px-4 py-2">
                    {item}
                  </span>
                )
              )}
            </div>
          ))}
        </div>
      </section>

      <section
        id="ve-nhom"
        className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:px-10 lg:py-16"
      >
        <div className="reveal-up glass-panel rounded-[2rem] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.45em] text-primary/85">Profile</p>
          <h2 className="mt-4 text-4xl leading-none sm:text-5xl">Thông tin nền đã được chỉnh để khớp Hearts2Hearts.</h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">
            Tôi đã thay phần copy từ nhóm giả lập sang dữ liệu khớp với Hearts2Hearts ở mức landing
            page giới thiệu: nhóm nữ 8 thành viên, ra mắt dưới SM Entertainment, debut với
            <span className="text-foreground"> The Chase</span> và fanclub
            <span className="text-foreground"> S2U</span>.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
              <Disc3 className="size-5 text-primary" />
              <p className="mt-4 text-xl">1 single debut</p>
              <p className="mt-2 text-sm text-muted-foreground">Gồm title track The Chase và b-side Butterflies.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
              <CalendarDays className="size-5 text-primary" />
              <p className="mt-4 text-xl">Debut showcase</p>
              <p className="mt-2 text-sm text-muted-foreground">Chase Our Hearts tại Seoul trong ngày ra mắt.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {members.map((member, index) => (
            <article
              key={member.stage}
              className="reveal-up tilt-card glass-panel rounded-[2rem] p-6 hover:bg-white/[0.09]"
              style={{ animationDelay: `${0.15 + index * 0.08}s` }}
            >
              <p className="text-xs uppercase tracking-[0.45em] text-accent/70">Member profile</p>
              <h3 className="mt-4 text-4xl uppercase">{member.stage}</h3>
              <p className="mt-5 text-sm leading-7 text-muted-foreground">{member.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="lich-dien"
        className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-16"
      >
        <div className="reveal-up rounded-[2rem] border border-white/10 bg-black/15 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.45em] text-primary/85">Next schedule</p>
          <h2 className="mt-4 text-4xl sm:text-5xl">Khối nội dung để sau này thay bằng lịch hoạt động thật.</h2>

          <div className="mt-8 space-y-4">
            {[
              ["24.02.2025", "Seoul", "Debut fan showcase Chase Our Hearts trong ngày phát hành."],
              ["03.2025", "Performance", "Khối này có thể dùng cho sân khấu, radio, music show hoặc performance video."],
              ["Tương lai", "Comeback", "Bạn có thể thay phần này bằng lịch teaser, album rollout hoặc fan meeting thật."],
            ].map(([date, city, detail]) => (
              <div
                key={date}
                className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-accent/80">{date}</p>
                  <p className="mt-2 text-2xl uppercase">{city}</p>
                </div>
                <p className="max-w-sm text-sm leading-6 text-muted-foreground">{detail}</p>
              </div>
            ))}
          </div>
        </div>

        <aside id="fanclub" className="reveal-up glass-panel rounded-[2rem] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.45em] text-primary/85">Fanclub</p>
          <h2 className="mt-4 text-4xl sm:text-5xl">S2U là tên fandom chính thức được công bố sau debut.</h2>
          <p className="mt-5 text-sm leading-7 text-muted-foreground">
            Tôi đang giữ phần này như một CTA giả lập để sau này bạn nối sang form thật, fanclub page
            hoặc community hub riêng.
          </p>

          <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-black/15 p-4">
            <label htmlFor="fan-email" className="text-xs uppercase tracking-[0.35em] text-accent/80">
              Email của bạn
            </label>
            <input
              id="fan-email"
              type="email"
              placeholder="aura7@fanmail.vn"
              className="mt-4 h-12 w-full rounded-full border border-white/10 bg-white/5 px-5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            <Button className="mt-4 h-12 w-full rounded-full bg-accent text-sm uppercase tracking-[0.3em] text-accent-foreground hover:bg-accent/90">
              Nhận cập nhật đầu tiên
            </Button>
          </div>

          <div className="mt-8 flex items-center gap-3 text-muted-foreground">
            <a
              href="#"
              className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-white/10 hover:text-foreground"
              aria-label="Instagram"
            >
              <Instagram className="size-4" />
            </a>
            <a
              href="#"
              className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-white/10 hover:text-foreground"
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
