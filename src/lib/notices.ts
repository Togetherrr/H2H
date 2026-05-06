export type NoticeType = "comeback" | "company" | "event" | "general"

export interface Notice {
  id: string
  type: NoticeType
  title_en: string
  content_en: string
  link?: string
  linkText_en?: string
  isPinned?: boolean
  date: string
}

export const ALL_NOTICES: Notice[] = [
  {
    id: "1",
    type: "comeback",
    title_en: "Hearts2Hearts 1st Mini Album 'REBIRTH' Official Pre-order",
    content_en: "Official album pre-order is now available! Support the girls for their upcoming comeback. All sales count towards major music charts.",
    link: "https://example.com/buy-album",
    linkText_en: "Buy Album",
    isPinned: true,
    date: "2024-05-10"
  },
  {
    id: "2",
    type: "company",
    title_en: "Official Fanclub Recruitment Notice",
    content_en: "The recruitment for the 1st generation of S2U will begin next week. Stay tuned for details regarding membership benefits.",
    link: "#",
    linkText_en: "View Detail",
    date: "2024-05-01"
  },
  {
    id: "3",
    type: "event",
    title_en: "Special Video Call Event",
    content_en: "A special video call event for 'REBIRTH' buyers. 50 lucky winners will be selected.",
    link: "#",
    date: "2024-05-05"
  },
  {
    id: "4",
    type: "general",
    title_en: "Hearts2Hearts Official Website Launch",
    content_en: "Welcome to our official fan home! Explore profiles, discography, and more.",
    date: "2024-04-25"
  },
  {
    id: "5",
    type: "company",
    title_en: "Regarding Artist Protection and Legal Action",
    content_en: "We are committed to protecting our artists from malicious comments and false information.",
    link: "#",
    date: "2024-04-20"
  }
]
