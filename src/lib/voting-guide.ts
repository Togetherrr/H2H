export type VotingAppCategoryId = "music_shows" | "awards" | "birthday" | "stream_support"

export type VotingAppCategory = {
  id: VotingAppCategoryId
  label: string
}

export type VotingGuideContent = {
  quickLinks: Array<{
    label: string
    href: string
    note?: string
  }>
}

export const votingGuideContent: VotingGuideContent = {
  quickLinks: [
    {
      label: "H2H International Fanbase (X)",
      href: "https://x.com/h2hbase_?s=21&t=pdmuTQs3SQoA48jwhHAoQQ",
      note: "Global updates, voting guides & mass voting schedules."
    },
    {
      label: "H2H Vietnam Fanpage (FB)",
      href: "https://www.facebook.com/share/1BVcfM9jEr/?mibextid=wwXIfr",
      note: "Fanpage update in Vietnam"
    },
  ],
}