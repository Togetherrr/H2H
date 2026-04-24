export type OfficialSource = {
  label: string
  href: string
  note: string
}

export type GroupOfficialProfile = {
  groupName: string
  company: string
  labels: string
  origin: string
  debutDate: string
  membersCount: number
  fandomName: string
  officialColor: string
  logoAsset: string
  logoNote: string
  sources: OfficialSource[]
}

export const hearts2heartsOfficialProfile: GroupOfficialProfile = {
  groupName: "Hearts2Hearts",
  company: "SM Entertainment",
  labels: "SM Entertainment · EMI/Universal Japan",
  origin: "Seoul, South Korea",
  debutDate: "2025-02-24",
  membersCount: 8,
  fandomName: "S2U (하츄)",
  officialColor: "Sky Blue",
  logoAsset: "/logo-official-removebg-.png",
  logoNote: "Official logo asset shown for fan-reference only. All trademarks belong to their owners.",
  sources: [
    {
      label: "Wikipedia - Hearts2Hearts",
      href: "https://en.wikipedia.org/wiki/Hearts2Hearts",
      note: "Background info, agency, debut, members and labels.",
    },
    {
      label: "Kpop Wiki - Hearts2Hearts",
      href: "https://kpop.fandom.com/wiki/Hearts2Hearts",
      note: "Fandom name and listed official color.",
    },
  ],
}
