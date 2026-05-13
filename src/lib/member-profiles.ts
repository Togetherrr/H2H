export type MemberProfile = {
  slug: string
  name: string
  position: string
  image: string
  intro: string
  keywords: string[]
  sourceName: string
  sourceUrl: string
  // Full info from DB
  nameKr?: string
  fullName?: string
  fullNameKr?: string
  englishName?: string
  birthDate?: string
  zodiac?: string
  bloodType?: string
  mbti?: string
  heightCm?: number | string
  nationality?: string
  birthplace?: string
  emoji?: string
  trainingYears?: number | string
  roleModel?: string
  character?: string
  nicknames?: string[]
  funFacts?: string[]
  favorites?: Record<string, string | string[]>
  detail?: {
    bio?: string
    bio_en?: string
    highlights?: string[]
    group_label?: string
    role_label?: string
    source_name?: string
    source_url?: string
  }
}

export const memberProfiles: MemberProfile[] = [
  {
    slug: "jiwoo",
    name: "Jiwoo",
    position: "Leader",
    image: "/the-chase.jpg",
    intro:
      "Jiwoo là trưởng nhóm, đại diện cho tinh thần kết nối và định hướng tổng thể trong nhiều hoạt động của Hearts2Hearts.",
    keywords: ["Leadership", "Stage presence", "Team direction"],
    sourceName: "KProfiles",
    sourceUrl: "https://kprofiles.com/members-profiles/",
  },
  {
    slug: "carmen",
    name: "Carmen",
    position: "Member",
    image: "/style.jpg",
    intro:
      "Carmen mang màu sắc mềm mại, cân bằng năng lượng trong đội hình và tạo dấu ấn qua phong thái trình diễn nhẹ nhàng.",
    keywords: ["Soft tone", "Visual mood", "Balance"],
    sourceName: "KProfiles",
    sourceUrl: "https://kprofiles.com/members-profiles/",
  },
  {
    slug: "yuha",
    name: "Yuha",
    position: "Member",
    image: "/focus.jpg",
    intro:
      "Yuha nổi bật ở những khung hình cận và các phần trình diễn cần điểm nhấn về biểu cảm và ánh nhìn.",
    keywords: ["Close-up impact", "Expression", "Focus"],
    sourceName: "KProfiles",
    sourceUrl: "https://kprofiles.com/members-profiles/",
  },
  {
    slug: "stella",
    name: "Stella",
    position: "Member",
    image: "/group.png",
    intro:
      "Stella đem lại sắc thái sắc sảo hơn cho tổng thể, phù hợp với những concept có nhịp điệu mạnh và rõ cá tính.",
    keywords: ["Sharp vibe", "Performance edge", "Concept fit"],
    sourceName: "KProfiles",
    sourceUrl: "https://kprofiles.com/members-profiles/",
  },
  {
    slug: "juun",
    name: "Juun",
    position: "Member",
    image: "/the-chase.jpg",
    intro:
      "Juun đóng góp màu sắc tươi mới trong đội hình, giúp phần trình diễn tổng thể có cảm giác linh hoạt và trẻ trung.",
    keywords: ["Fresh energy", "Rhythm", "Group chemistry"],
    sourceName: "KProfiles",
    sourceUrl: "https://kprofiles.com/members-profiles/",
  },
  {
    slug: "a-na",
    name: "A-na",
    position: "Member",
    image: "/style.jpg",
    intro:
      "A-na mang phong cách biểu diễn gọn gàng và ổn định, góp phần giữ nhịp mạch xuyên suốt trong các sân khấu nhóm.",
    keywords: ["Clean style", "Stability", "Stage flow"],
    sourceName: "KProfiles",
    sourceUrl: "https://kprofiles.com/members-profiles/",
  },
  {
    slug: "ian",
    name: "Ian",
    position: "Member",
    image: "/focus.jpg",
    intro:
      "Ian nổi bật ở những phần chuyển động và biểu cảm giàu năng lượng, tạo điểm hút trong các đoạn cao trào.",
    keywords: ["Energy", "Motion", "Highlight moments"],
    sourceName: "KProfiles",
    sourceUrl: "https://kprofiles.com/members-profiles/",
  },
  {
    slug: "ye-on",
    name: "Ye-on",
    position: "Member",
    image: "/group.png",
    intro:
      "Ye-on mang cảm giác dịu và sáng, giúp cân bằng tổng thể hình ảnh nhóm trong các concept thiên về cảm xúc.",
    keywords: ["Bright tone", "Emotion", "Visual harmony"],
    sourceName: "KProfiles",
    sourceUrl: "https://kprofiles.com/members-profiles/",
  },
]
