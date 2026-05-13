export type VotingGuideSection = {
  id: string
  eyebrow: string
  title: string
  description?: string
  cards: Array<{
    title: string
    body: string
    note?: string
  }>
}

export type VotingAppCardSection = {
  title: string
  items: string[]
}

export type VotingAppCategoryId = "music_shows" | "awards" | "birthday" | "stream_support"

export type VotingAppCategory = {
  id: VotingAppCategoryId
  label: string
}

export type VotingAppCard = {
  id: string
  name: string
  program_name?: string // trường mới đồng bộ với database
  subtitle?: string
  badge?: string        // sẽ hiển thị giá trị của program_name
  iconText?: string
  iconImageSrc?: string
  categoryId: VotingAppCategoryId
  sections: VotingAppCardSection[]
  guideHref?: string
  androidHref?: string
  iosHref?: string
  websiteHref?: string
}

export type VotingGuideContent = {
  pageTitle: string
  pageSubtitle: string
  heroNote?: string
  tabs: {
    appGuideLabel: string
    trackingLabel: string
  }
  categories: VotingAppCategory[]
  apps: VotingAppCard[]
  masterTips: {
    title: string
    preparation: string[]
    execution: string[]
  }
  joinTeam: {
    title: string
    body: string
    ctaLabel: string
    href: string
  }
  sections: VotingGuideSection[]
  quickLinks: Array<{
    label: string
    href: string
    note?: string
  }>
}

export const votingGuideContent: VotingGuideContent = {
  pageTitle: "VOTING & SUPPORT",
  pageSubtitle: "track live voting progress and master the guide to all k-pop voting applications.",
  heroNote: undefined,
  tabs: { appGuideLabel: "APP GUIDE", trackingLabel: "TRACKING" },
  categories: [
    { id: "music_shows", label: "MUSIC SHOWS" },
    { id: "awards", label: "AWARDS" },
    { id: "birthday", label: "BIRTHDAY / ANNIV." },
    { id: "stream_support", label: "STREAM SUPPORT" },
  ],
  apps: [
    // ── music shows ──────────────────────────────────────────────────────────
    {
      id: "mnet-plus",
      name: "MNET PLUS",
      program_name: "M COUNTDOWN",
      badge: "M COUNTDOWN",
      iconImageSrc: "/voting/mnet-plus.svg",
      categoryId: "music_shows",
      sections: [
        { title: "Currencies & Expiry", items: ["Account"] },
        { title: "How to Collect", items: ["Sign up"] },
        {
          title: "Events & Strategy",
          items: [
            "Pre-vote (Sat–Tue): 5 votes/day per device.",
            "Live vote (Thu 08:00 PM): 5 votes (KST).",
          ],
        },
      ],
      guideHref: "#", androidHref: "#", iosHref: "#",
    },
    {
      id: "higher",
      name: "HIGHER",
      program_name: "INKIGAYO",
      badge: "INKIGAYO",
      iconImageSrc: "/voting/higher.svg",
      categoryId: "music_shows",
      sections: [
        { title: "Currencies & Expiry", items: ["Ruby: 90 Days", "Diamond: No Expiry"] },
        { title: "How to Collect", items: ["Ruby: Daily missions + 50 Ads/day.", "Diamond: Purchase."] },
        {
          title: "Events & Strategy",
          items: [
            "Live vote (Sun 05:20 PM): max 5 votes (50 Ruby each) (KST).",
            "Hot stage: max 10 votes/day (30 Ruby each).",
          ],
        },
      ],
      guideHref: "#", androidHref: "#", iosHref: "#",
    },
    {
      id: "muniverse",
      name: "MUNIVERSE",
      program_name: "STAGE M PICK",
      badge: "STAGE M PICK",
      iconImageSrc: "/voting/muniverse.svg",
      categoryId: "music_shows",
      sections: [
        { title: "Currencies & Expiry", items: ["Silver Lumy: 30 Days", "Gold Lumy: No Expiry"] },
        { title: "How to Collect", items: ["Daily attendance: 100 Silver Lumy/account.", "Purchase: Gold Lumy."] },
        {
          title: "Events & Strategy",
          items: [
            "Stage M Pick (Sat 07:00 PM–Thu 01:00 PM): 1 vote = 10 Silver or 1 Gold Lumy (KST).",
            "Max 10 votes/day per account using Silver Lumy.",
          ],
        },
      ],
      guideHref: "#", androidHref: "#", iosHref: "#",
    },
    {
      id: "mubeat",
      name: "MUBEAT",
      program_name: "MUSIC CORE",
      badge: "MUSIC CORE",
      iconImageSrc: "/voting/mubeat.svg",
      categoryId: "music_shows",
      sections: [
        { title: "Currencies & Expiry", items: ["Heart Beats: 90 Days", "Star Beats: No Expiry"] },
        {
          title: "How to Collect",
          items: ["Watch Ads: 15 ads/day per account.", "Quizzes: Reset Mon 02:00 PM (KST)."],
        },
        {
          title: "Events & Strategy",
          items: [
            "Pre-vote (Tue 08:00 PM–Thu 01:00 PM): 3 Beats/vote (KST).",
            "Live vote (Sat): max 5 tickets/account (30 Beats each).",
          ],
        },
      ],
      guideHref: "#", androidHref: "#", iosHref: "#",
    },
    {
      id: "linc",
      name: "LINC",
      program_name: "INKIGAYO",
      badge: "INKIGAYO",
      iconImageSrc: "/voting/linc.svg",
      categoryId: "music_shows",
      sections: [
        { title: "Currencies & Expiry", items: ["Fan Point: 180 Days", "Diamond: 5 Years"] },
        { title: "How to Collect", items: ["Ads: 30/day (LINC) + 20/day (TIN).", "Chat: stay min. 24hrs to keep points."] },
        {
          title: "Events & Strategy",
          items: ["Pre-voting (Mon–Fri): max 10 votes/day.", "1 vote = 30 FP or 8 Diamond."],
        },
      ],
      guideHref: "#", androidHref: "#", iosHref: "#",
    },
    {
      id: "tin",
      name: "TIN",
      program_name: "INKIGAYO FAN POINTS",
      badge: "INKIGAYO FAN POINTS",
      iconImageSrc: "/voting/tin.svg",
      categoryId: "music_shows",
      sections: [
        { title: "Currencies & Expiry", items: ["Fan Points"] },
        { title: "How to Collect", items: ["Download TIN app.", "Watch up to 20 additional ads/day."] },
        {
          title: "Events & Strategy",
          items: ["Fan Points from TIN auto-send to LINC app reserve.", "Alternate ads between LINC and TIN."],
        },
      ],
      guideHref: "#", androidHref: "#", iosHref: "#",
    },
    {
      id: "idolchamp",
      name: "IDOLCHAMP",
      program_name: "SHOW CHAMPION",
      badge: "SHOW CHAMPION",
      iconImageSrc: "/voting/idolchamp.svg",
      categoryId: "music_shows",
      sections: [
        { title: "Currencies & Expiry", items: ["Ruby Chamsim: 90 Days", "Time Chamsim: End of Month"] },
        { title: "How to Collect", items: ["10 Ads/day.", "Check-in (+30), Likes (+20), Quizzes (+20)."] },
        { title: "Events & Strategy", items: ["Pre-vote: No daily limit.", "1 ♥ = 1 Ticket.", "5 💙 = 1 Ticket."] },
      ],
      guideHref: "#", androidHref: "#", iosHref: "#",
    },
    {
      id: "fancast",
      name: "FANCAST",
      program_name: "MUSIC BANK",
      badge: "MUSIC BANK",
      iconImageSrc: "/voting/fancast.svg",
      categoryId: "music_shows",
      sections: [
        { title: "Currencies & Expiry", items: ["Blue Hearts: 30–60 days", "Gold Hearts"] },
        { title: "How to Collect", items: ["Daily Attendance: 10/day.", "Watch Ads: 20 Hearts/ad, 60 ads/day."] },
        {
          title: "Events & Strategy",
          items: ["Pre-vote: 50 Blue or 50 Yellow Hearts/vote.", "Unlimited votes/day (10-min cooldown)."],
        },
      ],
      guideHref: "#", androidHref: "#", iosHref: "#",
    },

    // ── awards ───────────────────────────────────────────────────────────────
    {
      id: "podoal",
      name: "PODOAL",
      program_name: "ASEA, DEBUT POLLS",
      badge: "ASEA, DEBUT POLLS",
      iconImageSrc: "/voting/podoal.svg",
      categoryId: "awards",
      sections: [
        { title: "Currencies & Expiry", items: ["Podoal (no expiry)", "Jelly (no expiry)"] },
        { title: "How to Collect", items: ["Attendance", "Watch Ads", "Missions", "Podoschool"] },
        { title: "Events & Strategy", items: ["Use PodoAL for Fan Voting and Jellies for Monthly Charts."] },
      ],
      guideHref: "#", androidHref: "#", iosHref: "#",
    },
    {
      id: "my1pick",
      name: "MY1PICK",
      program_name: "KM CHART, GDA, SMA, DREAM CONCERT, ASEA, APAN",
      badge: "KM CHART, GDA, SMA, DREAM CONCERT, ASEA, APAN",
      iconImageSrc: "/voting/my1pick.svg",
      categoryId: "awards",
      sections: [
        { title: "Currencies & Expiry", items: ["Gold Heart", "Blue Heart", "OnePick Heart"] },
        { title: "How to Collect", items: ["Attendance", "Watch Ads (15-20/day)", "Surveys"] },
        { title: "Events & Strategy", items: ["KM Chart: Use Gold Hearts.", "Burn Blue Hearts daily."] },
      ],
      guideHref: "#", androidHref: "#", iosHref: "#",
    },
    {
      id: "bigc",
      name: "BIGC",
      program_name: "STAGE M PICK",
      badge: "STAGE M PICK",
      iconImageSrc: "/voting/bigc.svg",
      categoryId: "awards",
      sections: [
        { title: "Currencies & Expiry", items: ["BIGC GEMs", "ROYAL GEMs"] },
        { title: "How to Collect", items: ["Daily Attendance (20).", "Watch Ads (3/ad, up to 100/day)."] },
        { title: "Events & Strategy", items: ["1 ROYAL GEM = 20 BIGC GEMs for voting."] },
      ],
      guideHref: "#", androidHref: "#", iosHref: "#",
    },
    {
      id: "whosfan",
      name: "WHOSFAN",
      program_name: "HANTEO MUSIC AWARDS (HMA)",
      badge: "HANTEO MUSIC AWARDS (HMA)",
      iconImageSrc: "/voting/whosfan.svg",
      categoryId: "awards",
      sections: [
        { title: "Currencies & Expiry", items: ["Whosfan Hearts"] },
        { title: "How to Collect", items: ["Daily check-in.", "Watch ads.", "Community missions."] },
        { title: "Events & Strategy", items: ["Vote during HMA periods.", "Stack Hearts before windows open."] },
      ],
      guideHref: "#", androidHref: "#", iosHref: "#",
    },
    {
      id: "superstar",
      name: "SUPERSTAR",
      program_name: "MELON MUSIC AWARDS",
      badge: "MELON MUSIC AWARDS",
      iconImageSrc: "/voting/superstar.svg",
      categoryId: "awards",
      sections: [
        { title: "Currencies & Expiry", items: ["Stars (no expiry)"] },
        { title: "How to Collect", items: ["Daily missions.", "Watch ads."] },
        { title: "Events & Strategy", items: ["Use Stars during MMA voting period.", "Stack Stars months in advance."] },
      ],
      guideHref: "#", androidHref: "#", iosHref: "#",
    },

    // ── birthday / anniversary ───────────────────────────────────────────────
    {
      id: "choeadol",
      name: "CHOEADOL",
      program_name: "HEART EVENTS, THEME PICKS, SUPPORT EVENTS",
      badge: "HEART EVENTS, THEME PICKS, SUPPORT EVENTS",
      iconImageSrc: "/voting/choeadol.svg",
      categoryId: "birthday",
      sections: [
        { title: "Currencies & Expiry", items: ["Daily Hearts", "Ever Hearts"] },
        { title: "How to Collect", items: ["Heart Boxes every 4 hours.", "Watch ads (reset 30 min)."] },
        { title: "Events & Strategy", items: ["Batch voting (100+) triggers rebate to grow Ever Hearts."] },
      ],
      guideHref: "#", androidHref: "#", iosHref: "#",
    },
    {
      id: "kdol",
      name: "KDOL",
      program_name: "REAL-TIME, DAILY, WEEKLY, MONTHLY RANKINGS",
      badge: "REAL-TIME, DAILY, WEEKLY, MONTHLY RANKINGS",
      iconImageSrc: "/voting/kdol.svg",
      categoryId: "birthday",
      sections: [
        { title: "Currencies & Expiry", items: ["Purple Hearts", "Gems"] },
        { title: "How to Collect", items: ["5 Attendance Boxes.", "Watch Ads (200 hearts/ad)."] },
        { title: "Events & Strategy", items: ["Rankings reset daily at 00:00 KST."] },
      ],
      guideHref: "#", androidHref: "#", iosHref: "#",
    },
    {
      id: "queeri",
      name: "QUEERI",
      program_name: "DAILY CHARTS, FAN SUPPORT POLLS",
      badge: "DAILY CHARTS, FAN SUPPORT POLLS",
      iconImageSrc: "/voting/queeri.svg",
      categoryId: "birthday",
      sections: [
        { title: "Currencies & Expiry", items: ["Silver Crowns", "Gold Crowns"] },
        { title: "How to Collect", items: ["Daily Attendance.", "Watch Ads (20/day)."] },
        { title: "Events & Strategy", items: ["Convert Silver to Gold regularly before expiry."] },
      ],
      guideHref: "#", androidHref: "#", iosHref: "#",
    },
    {
      id: "upick",
      name: "UPICK",
      program_name: "POLLS, EVENTS, CAMPAIGNS",
      badge: "POLLS, EVENTS, CAMPAIGNS",
      iconImageSrc: "/voting/upick.svg",
      categoryId: "birthday",
      sections: [
        { title: "Currencies & Expiry", items: ["Blue Jams", "Pink Jams"] },
        { title: "How to Collect", items: ["Daily Attendance.", "Watch Ads (1,200 Blue Jams/day)."] },
        { title: "Events & Strategy", items: ["Time Attack Events: 100% vote refund."] },
      ],
      guideHref: "#", androidHref: "#", iosHref: "#",
    },
    {
      id: "picnic",
      name: "PICNIC",
      program_name: "DEBUT POLLS, BIRTHDAY SUPPORT",
      badge: "DEBUT POLLS, BIRTHDAY SUPPORT",
      iconImageSrc: "/voting/picnic.svg",
      categoryId: "birthday",
      sections: [
        { title: "Currencies & Expiry", items: ["Star Candy"] },
        { title: "How to Collect", items: ["Attendance", "Watching Ads", "Community"] },
        { title: "Events & Strategy", items: ["Focus on Star Candy for high-priority support."] },
      ],
      guideHref: "#", androidHref: "#", iosHref: "#",
    },
    {
      id: "bugs-favorite",
      name: "BUGS FAVORITE",
      program_name: "DEBUT POLLS, BIRTHDAY SUPPORT",
      badge: "DEBUT POLLS, BIRTHDAY SUPPORT",
      iconImageSrc: "/voting/bugs-favorite.svg",
      categoryId: "birthday",
      sections: [
        { title: "Currencies & Expiry", items: ["Pink Heart", "Gold Heart"] },
        { title: "How to Collect", items: ["Daily Attendance.", "Heart Station Missions."] },
        { title: "Events & Strategy", items: ["Use Pink Hearts daily before expiry."] },
      ],
      guideHref: "#", androidHref: "#", iosHref: "#",
    },
  ],
  masterTips: {
    title: "MASTER VOTING TIPS",
    preparation: [
      "create multiple accounts (if allowed by the app rules).",
      "start collecting points/beats/jellies at least a month before the comeback.",
      "note expiration dates! many points expire at the end of the month.",
    ],
    execution: [
      'coordinate with fanbases for "mass voting" times.',
      "don't drop all votes on day 1; pace them according to strategy.",
      "for live voting, open the app 5 minutes before the show segment.",
    ],
  },
  joinTeam: {
    title: "JOIN OUR VOTING TEAM",
    body: "passionate about helping hearts2hearts win? join our dedicated frontline voting team! drop us a dm on x (twitter) to get started.",
    ctaLabel: "DM US ON X",
    href: "#",
  },
  sections: [
    {
      id: "overview",
      eyebrow: "Overview",
      title: "what is voting for?",
      description: "a quick summary of what fan voting impacts and when it matters.",
      cards: [
        { title: "what it affects", body: "add your exact description here (awards, shows, polls, or app events)." },
        { title: "when to prioritize", body: "add guidance about comeback windows, rounds, or deadlines." },
        { title: "account basics", body: "add requirements: login, region, verification, or age limits." },
      ],
    },
    {
      id: "how-to",
      eyebrow: "How To Vote",
      title: "step-by-step flow",
      description: "mirror the exact step blocks from your guide page here.",
      cards: [
        { title: "step 1", body: "open the app/website and sign in." },
        { title: "step 2", body: "navigate to the voting banner or event page." },
        { title: "step 3", body: "select the category and confirm your vote." },
        { title: "step 4", body: "claim / spend tickets, coins, or hearts (if applicable)." },
      ],
    },
  ],
  quickLinks: [
    { label: "official voting page", href: "#", note: "replace with your official link." },
    { label: "support / help center", href: "#", note: "replace with your support link." },
  ],
}