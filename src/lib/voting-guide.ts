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
  subtitle?: string
  badge?: string
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
  pageSubtitle: "Track live voting progress and master the guide to all K-pop voting applications.",
  heroNote: undefined,
  tabs: { appGuideLabel: "APP GUIDE", trackingLabel: "TRACKING" },
  categories: [
    { id: "music_shows", label: "MUSIC SHOWS" },
    { id: "awards", label: "AWARDS" },
    { id: "birthday", label: "BIRTHDAY / ANNIV." },
    { id: "stream_support", label: "STREAM SUPPORT" },
  ],
  apps: [
    // ── MUSIC SHOWS ──────────────────────────────────────────────────────────
    {
      id: "mnet-plus",
      name: "MNET PLUS",
      badge: "MCOUNTDOWN",
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
      guideHref: "#",
      androidHref: "#",
      iosHref: "#",
    },
    {
      id: "higher",
      name: "HIGHER",
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
            "Unlimited accounts: logout & switch emails to stack votes.",
          ],
        },
      ],
      guideHref: "#",
      androidHref: "#",
      iosHref: "#",
    },
    {
      id: "muniverse",
      name: "MUNIVERSE",
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
            "Max 10 votes/day per account using Silver Lumy; Gold Lumy votes are unlimited.",
            "Unlimited accounts: logout & switch emails to stack votes.",
          ],
        },
      ],
      guideHref: "#",
      androidHref: "#",
      iosHref: "#",
      websiteHref: "#",
    },
    {
      id: "mubeat",
      name: "MUBEAT",
      badge: "MUSIC CORE, AWARDS",
      iconImageSrc: "/voting/mubeat.svg",
      categoryId: "music_shows",
      sections: [
        { title: "Currencies & Expiry", items: ["Heart Beats: 90 Days", "Star Beats: No Expiry"] },
        {
          title: "How to Collect",
          items: [
            "Watch Ads: 15 ads/day per account (Max 100/device).",
            "Quizzes: Reset Mon 02:00 PM (KST).",
            "Awards Voting Ticket: Watch Ad.",
          ],
        },
        {
          title: "Events & Strategy",
          items: [
            "Pre-vote (Tue 08:00 PM–Thu 01:00 PM): 3 Beats/vote (KST).",
            "Live vote (Sat): max 5 tickets/account (30 Beats each).",
            "Awards (GDA, SMA).",
          ],
        },
      ],
      guideHref: "#",
      androidHref: "#",
      iosHref: "#",
    },
    {
      id: "linc",
      name: "LINC",
      badge: "INKIGAYO",
      iconImageSrc: "/voting/linc.svg",
      categoryId: "music_shows",
      sections: [
        { title: "Currencies & Expiry", items: ["Fan Point: 180 Days", "Diamond: 5 Years"] },
        { title: "How to Collect", items: ["Ads: 30/day (LINC) + 20/day (TIN).", "Chat: stay min. 24hrs to keep points."] },
        {
          title: "Events & Strategy",
          items: [
            "Pre-voting (Mon–Fri): max 10 votes/day.",
            "1 vote = 30 FP or 8 Diamond.",
            "Goal: 3,000 FP for 4-week comeback.",
          ],
        },
      ],
      guideHref: "#",
      androidHref: "#",
      iosHref: "#",
    },
    {
      id: "tin",
      name: "TIN",
      badge: "(INKIGAYO FAN POINTS)",
      iconImageSrc: "/voting/tin.svg",
      categoryId: "music_shows",
      sections: [
        { title: "Currencies & Expiry", items: ["Fan Points"] },
        {
          title: "How to Collect",
          items: [
            "Download TIN app (digital photocard tracker).",
            "Tap Fan Points icon.",
            "Watch up to 20 additional ads/day.",
          ],
        },
        {
          title: "Events & Strategy",
          items: [
            "Fan Points from TIN auto-send to LINC app reserve.",
            "Alternate ads between LINC and TIN to bypass cooldowns.",
          ],
        },
      ],
      guideHref: "#",
      androidHref: "#",
      iosHref: "#",
    },
    {
      id: "idolchamp",
      name: "IDOLCHAMP",
      badge: "SHOW CHAMPION",
      iconImageSrc: "/voting/idolchamp.svg",
      categoryId: "music_shows",
      sections: [
        {
          title: "Currencies & Expiry",
          items: ["Ruby Chamsim: 90 Days", "Time Chamsim: End of Month"],
        },
        {
          title: "How to Collect",
          items: ["10 Ads/day (1 Spin Roulette: ♥ 1–10).", "Check-in (+30), Likes (+20), Quizzes (+20)."],
        },
        {
          title: "Events & Strategy",
          items: ["Pre-vote: No daily limit.", "1 ♥ = 1 Ticket.", "5 💙 = 1 Ticket."],
        },
      ],
      guideHref: "#",
      androidHref: "#",
      iosHref: "#",
    },
    {
      id: "fancast",
      name: "FANCAST",
      badge: "MUSIC BANK",
      iconImageSrc: "/voting/fancast.svg",
      categoryId: "music_shows",
      sections: [
        {
          title: "Currencies & Expiry",
          items: ["Blue Hearts: 30–60 days", "Gold Hearts (Paid/mission)"],
        },
        {
          title: "How to Collect",
          items: [
            "Daily Attendance: 10/day (810/month max).",
            "Watch Ads: 20 Hearts/ad, 60 ads/day.",
            "Charging Station Missions: Variable.",
            "Purchase (Gold Hearts).",
          ],
        },
        {
          title: "Events & Strategy",
          items: [
            "Pre-vote (Sun 15:00–Wed 11:00 KST): 50 Blue or 50 Yellow Hearts/vote.",
            "Unlimited votes/day (10-min cooldown after 500 votes).",
            "No live vote.",
          ],
        },
      ],
      guideHref: "#",
      androidHref: "#",
      iosHref: "#",
    },

    // ── AWARDS ───────────────────────────────────────────────────────────────
    {
      id: "podoal",
      name: "PODOAL",
      badge: "ASEA, DEBUT POLLS",
      iconImageSrc: "/voting/podoal.svg",
      categoryId: "awards",
      sections: [
        {
          title: "Currencies & Expiry",
          items: ["Podoal (no expiry)", "Jelly (no expiry)"],
        },
        {
          title: "How to Collect",
          items: [
            "Attendance",
            "Watch Ads",
            "Missions",
            "Podoschool & Quiz Bites",
            "Passtival",
            "Meal Time",
            "Invite Friends",
            "Games",
          ],
        },
        {
          title: "Events & Strategy",
          items: [
            "Awards (ASEA).",
            'Use PodoAL for "Fan Voting" (Ads/Billboards) and Jellies for official "Monthly Charts."',
          ],
        },
      ],
      guideHref: "#",
      androidHref: "#",
      iosHref: "#",
    },
    {
      id: "my1pick",
      name: "MY1PICK",
      badge: "KM CHART, GDA, SMA, DREAM CONCERT, ASEA, APAN",
      iconImageSrc: "/voting/my1pick.svg",
      categoryId: "awards",
      sections: [
        {
          title: "Currencies & Expiry",
          items: [
            "1. Gold Heart (Free, expires monthly)",
            "2. Blue Heart (Daily, expires at midnight KST)",
            "3. OnePick Heart (Paid, no expiry)",
          ],
        },
        {
          title: "How to Collect",
          items: [
            "Blue: Daily Attendance, Community posts.",
            "Gold: Watch Ads (15–20/day), Missions, Surveys.",
            "OnePick: In-app purchases, Shopping for Merch.",
          ],
        },
        {
          title: "Events & Strategy",
          items: [
            "KM Chart: Use Gold Hearts (20 hearts = 1 vote).",
            "Daily Polls: Use Blue Hearts as they don't carry over.",
            "Strategy: Burn Blue Hearts daily; stockpile Gold for KM Chart cycles; reserve OnePick for year-end \"Triple Crown\" awards.",
          ],
        },
      ],
      guideHref: "#",
      androidHref: "#",
      iosHref: "#",
    },
    {
      id: "bigc",
      name: "BIGC",
      badge: "STAGE M PICK",
      iconImageSrc: "/voting/bigc.svg",
      categoryId: "awards",
      sections: [
        {
          title: "Currencies & Expiry",
          items: ["BIGC GEMs (Free, 1 year)", "ROYAL GEMs (Paid, 1 year)"],
        },
        {
          title: "How to Collect",
          items: [
            "Daily Attendance (20).",
            "Watch Ads (3/ad, up to 100/day).",
            "Invitation Event (10).",
            "Visit BIGC SNS (15).",
            "Purchase (ROYAL GEMs).",
          ],
        },
        {
          title: "Events & Strategy",
          items: [
            "1 ROYAL GEM = 20 BIGC GEMs for voting. GEMs can be gifted (min 100).",
          ],
        },
      ],
      guideHref: "#",
      androidHref: "#",
      iosHref: "#",
      websiteHref: "#",
    },
    {
      id: "whosfan",
      name: "WHOSFAN",
      badge: "HANTEO MUSIC AWARDS (HMA)",
      iconImageSrc: "/voting/whosfan.svg",
      categoryId: "awards",
      sections: [
        {
          title: "Currencies & Expiry",
          items: ["Whosfan Hearts (monthly expiry)"],
        },
        {
          title: "How to Collect",
          items: [
            "Daily check-in.",
            "Watch ads.",
            "Community missions.",
          ],
        },
        {
          title: "Events & Strategy",
          items: [
            "Vote during HMA voting periods.",
            "Stack Hearts before voting windows open.",
          ],
        },
      ],
      guideHref: "#",
      androidHref: "#",
      iosHref: "#",
    },
    {
      id: "mubeat-awards",
      name: "MUBEAT",
      badge: "GDA, SMA",
      iconImageSrc: "/voting/mubeat.svg",
      categoryId: "awards",
      sections: [
        {
          title: "Currencies & Expiry",
          items: ["Heart Beats: 90 Days", "Star Beats: No Expiry"],
        },
        {
          title: "How to Collect",
          items: [
            "Watch Ads: 15 ads/day per account (Max 100/device).",
            "Quizzes: Reset Mon 02:00 PM (KST).",
            "Awards Voting Ticket: Watch Ad.",
          ],
        },
        {
          title: "Events & Strategy",
          items: [
            "Awards tickets earned by watching ads during campaign periods.",
            "GDA & SMA: submit tickets during designated voting windows.",
          ],
        },
      ],
      guideHref: "#",
      androidHref: "#",
      iosHref: "#",
    },
    {
      id: "superstar",
      name: "SUPERSTAR",
      badge: "MELON MUSIC AWARDS",
      iconImageSrc: "/voting/superstar.svg",
      categoryId: "awards",
      sections: [
        {
          title: "Currencies & Expiry",
          items: ["Stars (no expiry)"],
        },
        {
          title: "How to Collect",
          items: [
            "Daily missions.",
            "Watch ads.",
            "Special event missions.",
          ],
        },
        {
          title: "Events & Strategy",
          items: [
            "Use Stars during MMA voting period.",
            "Stack Stars months in advance for year-end awards.",
          ],
        },
      ],
      guideHref: "#",
      androidHref: "#",
      iosHref: "#",
    },

    // ── BIRTHDAY / ANNIVERSARY ───────────────────────────────────────────────
    {
      id: "choeadol",
      name: "CHOEADOL",
      badge: "HEART EVENTS, THEME PICKS, IMAGE PICKS, SUPPORT EVENTS",
      iconImageSrc: "/voting/choeadol.svg",
      categoryId: "birthday",
      sections: [
        {
          title: "Currencies & Expiry",
          items: [
            "Daily Hearts (expire 23:59 KST)",
            "Ever Hearts (no expiry)",
            "Diamonds (support refunds only)",
          ],
        },
        {
          title: "How to Collect",
          items: [
            "Log in twice daily.",
            "Heart Boxes every 4 hours.",
            "Watch ads (reset 30 min).",
            "Maintain streak for Ever Hearts.",
          ],
        },
        {
          title: "Events & Strategy",
          items: [
            "Batch voting (100+ hearts) triggers rebate to grow Ever Hearts. Prioritize Ever Hearts for long-term voting.",
          ],
        },
      ],
      guideHref: "#",
      androidHref: "#",
      iosHref: "#",
    },
    {
      id: "kdol",
      name: "KDOL",
      badge: "REAL-TIME, DAILY, WEEKLY, MONTHLY RANKINGS",
      iconImageSrc: "/voting/kdol.svg",
      categoryId: "birthday",
      sections: [
        {
          title: "Currencies & Expiry",
          items: [
            "Purple Hearts (no expiry, cannot purchase)",
            "Gems (games/purchase)",
          ],
        },
        {
          title: "How to Collect",
          items: [
            "5 Attendance Boxes (300, 200, 150, 300, 500 hearts).",
            "Invitation Links (1,000 hearts + 5 gems).",
            "View Ads (200 hearts/ad, every 10 min).",
          ],
        },
        {
          title: "Events & Strategy",
          items: [
            "Real-time rankings reset daily at 00:00 KST. Use Gems for bonus heart games.",
          ],
        },
      ],
      guideHref: "#",
      androidHref: "#",
      iosHref: "#",
    },
    {
      id: "queeri",
      name: "QUEERI",
      badge: "DAILY CHARTS, FAN SUPPORT POLLS, AD SPONSORSHIP",
      iconImageSrc: "/voting/queeri.svg",
      categoryId: "birthday",
      sections: [
        {
          title: "Currencies & Expiry",
          items: [
            "Silver Crowns (expire 28th monthly)",
            "Gold Crowns (expire 60 days)",
          ],
        },
        {
          title: "How to Collect",
          items: [
            "Daily Attendance (5, streak increases).",
            "Watch Ads (20/day, 5 each).",
            "Trade Silver for Gold (2:1).",
            "Day 7 Streak: 100 Silver + 20 Gold.",
          ],
        },
        {
          title: "Events & Strategy",
          items: [
            "Convert Silver to Gold regularly before expiry. Focus Gold on campaigns with strategic impact.",
          ],
        },
      ],
      guideHref: "#",
      androidHref: "#",
      iosHref: "#",
    },
    {
      id: "upick",
      name: "UPICK",
      badge: "POLLS, EVENTS, CAMPAIGNS",
      iconImageSrc: "/voting/upick.svg",
      categoryId: "birthday",
      sections: [
        {
          title: "Currencies & Expiry",
          items: [
            "Blue Jams (expire monthly)",
            "Pink Jams (no expiry)",
          ],
        },
        {
          title: "How to Collect",
          items: [
            "Daily Attendance.",
            "Watch Ads (20/ad, 60 ads/day = 1,200 Blue Jams).",
            "Twitter follow mission (100).",
            "Purchase (Pink Jams).",
          ],
        },
        {
          title: "Events & Strategy",
          items: [
            "Time Attack Events: 100% vote refund. Buy Blue Jam Carry-Over Coupon (50 Pink Jams) to extend expiry.",
          ],
        },
      ],
      guideHref: "#",
      androidHref: "#",
      iosHref: "#",
    },
    {
      id: "picnic",
      name: "PICNIC",
      badge: "DEBUT POLLS, BIRTHDAY SUPPORT, WEEKLY PIC-CHART",
      iconImageSrc: "/voting/picnic.svg",
      categoryId: "birthday",
      sections: [
        {
          title: "Currencies & Expiry",
          items: [
            "Star Candy (Paid/Free)",
            "Free Stars expire 60 months (5 years) after acquisition unless stated otherwise for specific events.",
          ],
        },
        {
          title: "How to Collect",
          items: [
            "Attendance/Daily Login",
            "Watching Ads",
            "Participating in Communities",
            "Direct Purchase (In-App Purchase)",
          ],
        },
        {
          title: "Events & Strategy",
          items: [
            "Monthly/Debut Votes: Support for specific idol milestones.",
            'Strategy: Focus on "Star Candy Recharge" via daily activities to accumulate for high-priority support events.',
            "Weekly PIC Chart: Resets weekly.",
          ],
        },
      ],
      guideHref: "#",
      androidHref: "#",
      iosHref: "#",
      websiteHref: "#",
    },
    {
      id: "bugs-favorite",
      name: "BUGS FAVORITE",
      badge: "DEBUT POLLS, BIRTHDAY SUPPORT",
      iconImageSrc: "/voting/bugs-favorite.svg",
      categoryId: "birthday",
      sections: [
        {
          title: "Currencies & Expiry",
          items: [
            "Pink Heart (Daily expire 23:59 KST; Missions expire 30 days)",
            "Gold Heart (Paid, expire 1 year)",
          ],
        },
        {
          title: "How to Collect",
          items: [
            "Daily Attendance: 100 Hearts (Free) or 300 Hearts (Subscribers).",
            "Heart Station: Missions/Shopping.",
            "Store: Purchase Gold Hearts.",
          ],
        },
        {
          title: "Events & Strategy",
          items: [
            "Use Pink Hearts daily before expiry.",
            "Reserve Gold Hearts for high-priority birthday/debut support events.",
          ],
        },
      ],
      guideHref: "#",
      androidHref: "#",
      iosHref: "#",
      websiteHref: "#",
    },
  ],
  masterTips: {
    title: "MASTER VOTING TIPS",
    preparation: [
      "Create multiple accounts (if allowed by the app rules).",
      "Start collecting points/beats/jellies at least a month before the comeback.",
      "Note expiration dates! Many points expire at the end of the month or after 90 days.",
    ],
    execution: [
      'Coordinate with fanbases for "mass voting" times.',
      "Don't drop all votes on day 1; pace them according to the fanbase strategy.",
      "For live voting, open the app and be ready 5 minutes before the show segment.",
    ],
  },
  joinTeam: {
    title: "JOIN OUR VOTING TEAM",
    body: "Passionate about helping Hearts2Hearts win? Join our dedicated frontline voting team! Drop us a DM on X (Twitter) to get started.",
    ctaLabel: "DM US ON X",
    href: "#",
  },
  sections: [
    {
      id: "overview",
      eyebrow: "Overview",
      title: "What is voting for?",
      description: "A quick summary of what fan voting impacts and when it matters.",
      cards: [
        { title: "What it affects", body: "Add your exact description here (awards, shows, polls, or app events)." },
        { title: "When to prioritize", body: "Add guidance about comeback windows, rounds, or deadlines." },
        { title: "Account basics", body: "Add requirements: login, region, verification, or age limits." },
      ],
    },
    {
      id: "how-to",
      eyebrow: "How To Vote",
      title: "Step-by-step flow",
      description: "Mirror the exact step blocks from your guide page here.",
      cards: [
        { title: "Step 1", body: "Open the app/website and sign in." },
        { title: "Step 2", body: "Navigate to the voting banner or event page." },
        { title: "Step 3", body: "Select the category and confirm your vote." },
        { title: "Step 4", body: "Claim / spend tickets, coins, or hearts (if applicable)." },
      ],
    },
    {
      id: "tickets",
      eyebrow: "Tickets",
      title: "Earn & use voting tickets",
      description: "Add all ticket sources exactly like your current guide.",
      cards: [
        { title: "Daily check-in", body: "Describe check-in rewards and limits." },
        { title: "Missions", body: "Describe watch/share/quiz missions and payouts." },
        { title: "Ads / offers", body: "Describe ad watching and any restrictions." },
      ],
    },
    {
      id: "tips",
      eyebrow: "Tips",
      title: "Avoid losing votes",
      description: "Common issues that cause votes not to count.",
      cards: [
        { title: "Timezone", body: "Explain reset time (KST/UTC) and how to avoid confusion." },
        { title: "Network", body: "Vote on stable connection; retry if confirmation fails." },
        { title: "Screenshots", body: "If your guide requires proof, add the exact steps." },
      ],
    },
    {
      id: "faq",
      eyebrow: "FAQ",
      title: "Quick answers",
      cards: [
        { title: "Why can't I vote?", body: "Add reasons: missing tickets, not logged in, region lock." },
        { title: "My tickets disappeared", body: "Add guidance: reset time, claimed vs unclaimed." },
        { title: "Can I vote multiple times?", body: "Add exact limits and cooldowns." },
      ],
    },
  ],
  quickLinks: [
    { label: "Official voting page", href: "#", note: "Replace with your official link." },
    { label: "Support / help center", href: "#", note: "Replace with your support link." },
  ],
}