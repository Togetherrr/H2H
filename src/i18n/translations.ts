export const DEFAULT_LANGUAGE = "vi" as const
export const SUPPORTED_LANGUAGES = ["vi", "en"] as const

export type Language = (typeof SUPPORTED_LANGUAGES)[number]

export const translations = {
  en: {
    // Header
    "header.brand": "Hearts2Hearts",
    "header.tagline": "For S2U",
    "header.nav.concept": "Concept",
    "header.nav.moments": "Moments",
    "header.nav.join": "Join",
    "header.nav.performance": "Performance",
    "header.nav.voting": "Voting",
    "header.login": "Login",

    // Hero Section
    "hero.title": "Hearts2Hearts",

    // CTA Buttons
    "cta.opening": "Watch opening",
    "cta.concept": "Explore concept",

    // Stats Section
    "stats.eyebrow": "Live stats",
    "stats.title": "A quick look at the Hearts2Hearts era",
    "stats.debutDays": "Days since debut",
    "stats.albums": "Album projects",
    "stats.musicShows": "Music show wins",
    "stats.awardCeremonies": "Award ceremony wins",
    "stats.source": "Source",
    "stats.viewDetails": "View detail",
    "stats.latestRelease": "Latest release",
    "stats.latestRelease.watchMv": "Watch MV",
    "stats.latestRelease.mvPending": "MV link ready to add",
    "stats.comeback.eyebrow": "Comeback watch",
    "stats.comeback.templateTitle": "Comeback countdown",
    "stats.comeback.templateLabel": "Waiting for official announcement",
    "stats.comeback.templateDisplay": "Countdown display",
    "stats.comeback.ready": "Countdown is on",
    "stats.comeback.pending": "Waiting for the next official date",
    "stats.comeback.pendingDesc":
      "No official comeback schedule is public yet. This panel is already prepared so the countdown can appear immediately when a confirmed date is added.",
    "stats.comeback.placeholder": "Standby mode",
    "stats.comeback.placeholderDesc":
      "When SM or the group posts the official date, this card will switch to a live countdown without breaking the layout.",
    "stats.comeback.days": "Days",
    "stats.comeback.hours": "Hours",
    "stats.comeback.minutes": "Minutes",
    "stats.comeback.seconds": "Seconds",
    "stats.comeback.date": "Release date:",
    "stats.comeback.realtime": "This countdown updates in real time after the official schedule is added.",

    // Track Performance Section
    "performance.label": "Track performance",
    "performance.title": "Track performance",
    "performance.subtitle": "Spotify Charts daily streams and official MV views in one snapshot.",
    "performance.updatedAt": "Updated",
    "performance.spotify": "Spotify",
    "performance.youtube": "YouTube",
    "performance.melon": "Melon",
    "performance.bugs": "Bugs",
    "performance.genie": "Genie",
    "performance.vibe": "Vibe",
    "performance.korea": "South Korea",
    "performance.korea.desc": "Quick access to official domestic charts in South Korea. Click to visit each platform's live ranking page.",
    "performance.korea.visit": "Visit Chart",
    "performance.totalStreams": "Total streams",
    "performance.dailyStreams": "Total daily streams",
    "performance.totalViews": "Total views",
    "performance.dailyViews": "Total daily views",
    "performance.dailyChange": "Daily change",
    "performance.totalLabel": "Total",
    "performance.topTracks": "Top 5 tracks",
    "performance.topVideos": "Top 5 videos",
    "performance.viewAll": "View all",
    "performance.empty": "No track data returned from this source yet.",

    // Concept Section
    "concept.official": "Official links",
    "concept.official.title": "Official channels to follow Hearts2Hearts",
    "concept.official.desc":
      "Open links directly to official platforms to stay updated with new content, avoid re-uploads, and minimize copyright risks.",
    "concept.members": "Member profile",
    "concept.members.detail": "Tap to view detail",
    "concept.members.title": "Member Profiles",
    "concept.members.desc":
      "Display member photos, names and positions. Click on each card to open detailed profile pages.",

    // Official Profile Section
    "moments.title": "Official profile box",
    "moments.subtitle":
      "A consolidated official profile of Hearts2Hearts using wiki-based references, separated from individual member profile content.",
    "moments.fact.group": "Group",
    "moments.fact.company": "Company",
    "moments.fact.labels": "Labels",
    "moments.fact.origin": "Origin",
    "moments.fact.debut": "Debut",
    "moments.fact.members": "Members",
    "moments.fact.fandom": "Fandom",
    "moments.fact.color": "Official color",
    "moments.sources": "Wiki sources",

    "join.title": "Join the mood",
    "join.subtitle": "A more elegant landing page, softer but still distinctive and memorable.",
    "join.desc":
      "The heart of the homepage now is the image in the middle of the hero. The rest just makes the film strip and logo stand out more.",
    "join.email": "Your email",
    "join.subscribe": "Receive updates",

    // Timeline Section
    "timeline.label": "Timeline",
    "timeline.title": "Timeline",
    "timeline.eras": "eras",
    "timeline.emptyTitle": "Timeline is updating",
    "timeline.emptyDesc": "Release data will appear here when available.",
    "timeline.newestDrop": "Newest Drop",
    "timeline.openAlbum": "Open Album",
    "timeline.view": "View",
    "timeline.dragHint": "Drag horizontally to explore",
    "timeline.showingYears": "Showing",
    "timeline.latestYears": "latest years",
    "timeline.showMoreYears": "Show",
    "timeline.olderYears": "older years",
    "timeline.type.debut": "Debut",
    "timeline.type.comeback": "Comeback",
    "timeline.type.preRelease": "Pre-release",
    "timeline.type.firstEp": "1st EP",
    "timeline.type.ep": "EP",
    "timeline.type.single": "Single",
    "timeline.type.album": "Album",
    "timeline.type.release": "Release",

    // Charts Page
    "charts.title": "Track Performance",
    "charts.subtitle": "Real-time analytics for Hearts2Hearts' discography.",
    "charts.return": "Return to Hub",
    "charts.lastSynced": "Last Synced",
    "charts.spotify.title": "Spotify Charts",
    "charts.youtube.title": "YouTube Views",
    "charts.melon.title": "Melon Chart",
    "charts.bugs.title": "Bugs Chart",
    "charts.genie.title": "Genie Chart",
    "charts.vibe.title": "Vibe Chart",
    "charts.analyzed": "Tracks Analyzed",
    "charts.analyzed.video": "Videos Analyzed",
    "charts.empty": "No data available.",
    "charts.rank": "Rank",
    "charts.total": "Total",
    "charts.daily": "Daily",
    "charts.trend": "Trend",
    "charts.realtime": "Real-time Data",
    "charts.trackInfo": "Track Info",
    "charts.videoInfo": "Video Info",

    // Voting Page
    "voting.title": "Voting & Support",
    "voting.subtitle": "Official guides and tracking for Hearts2Hearts fan support.",
    "voting.hub": "Fan Support Hub",
    "voting.guide": "App Guide",
    "voting.tracking": "Live Tracking",
    "voting.quickLinks": "Quick Links",
    "voting.viewGuide": "View Guide",
    "voting.android": "Android",
    "voting.ios": "iOS",
    "voting.website": "Website",
    "voting.empty": "No apps in this category yet.",
    "voting.join": "Join our voting team",
    "voting.join.desc": "Passionate about helping Hearts2Hearts win? Join our dedicated frontline voting team!",
    "voting.join.cta": "DM us on X",
    "voting.backToTop": "Back to top",
    "voting.comingSoon": "Coming Soon",
    "voting.trackingDesc": "The live tracking dashboard for music show scores and voting progress is currently under development. Stay tuned for real-time updates on Hearts2Hearts' performance!",
    "voting.category.music_shows": "Music Shows",
    "voting.category.awards": "Awards",
    "voting.category.birthday": "Birthday / Anniv.",
    "voting.category.stream_support": "Stream Support",
    "voting.appCount": "{count} app",
    "voting.appsCount": "{count} apps",

    // Home Sections
    "home.stats.careerRecords": "Career Records",
    "home.stats.badge.debutMilestone": "Debut Milestone",
    "home.stats.desc.sinceDebut": "Since 24 Feb 2025",
    "home.stats.badge.releaseCatalog": "Release Catalog",
    "home.stats.desc.fullDiscography": "Full Discography",
    "home.stats.badge.liveTrophies": "Live Trophies",
    "home.stats.desc.broadcastWins": "Broadcast Wins",
    "home.stats.badge.globalAwards": "Global Awards",
    "home.stats.desc.industryHonors": "Industry Honors",

    "home.performance.liveAnalytics": "Live Analytics",
    "home.performance.rankings": "Rankings",
    "home.performance.officialMv": "Official MV",
    "home.performance.fullCharts": "Full Charts",
    "home.performance.insights": "Insights",
    "home.performance.dailyGlobal": "Daily Global",
    "home.performance.dailyViews": "Daily Views",
    "home.performance.topTrack": "Top track",
    "home.performance.viewAll": "View all tracks",

    "home.comeback.active": "Active Comeback Preparation",
    "home.comeback.standby": "Standby Mode",
    "home.comeback.preparing": "Preparing for next era",
    "home.comeback.preOrder": "Pre-order",
    "home.comeback.preSave": "Pre-save",
    "home.comeback.notifyMe": "Notify me",

    // Detail Pages
    "common.backToHome": "Back to home",
    "member.eyebrow": "Hearts2Hearts member",
    "member.highlights": "Highlights",
    "member.sourceAttribution": "Source & Attribution",
    "member.disclaimer": "Profile summary is fan-curated for informational use. Official trademarks, logos and artist-related assets belong to their respective owners.",
    "album.releaseDate": "Release date",
    "album.trackList": "Track list",
    "album.trackListEmpty": "Track list will be updated when wiki sources are added.",
    "album.viewSource": "View source on Wikidata",

    // Footer
    "footer.copyright": "© {year} Hearts2Hearts · Unofficial Fan Project",
    "footer.disclaimer": "This is an independent fan encyclopedia. All trademarks belong to their respective owners.",

    // Notice Board
    "notice.title": "Pin Board",
    "notice.pin": "Pinned",
    "notice.new": "New",
    "notice.close": "Close",
    "notice.open": "Open notice board",
    "notice.empty": "No important notices at this time.",
    "notice.buyAlbum": "Buy Album",
    "notice.viewDetail": "View detail",
    "notice.viewMore": "Notice Board",
    "notice.allNotices": "Important Notice Board",
    "notice.back": "Back",
  },
  vi: {
    // Header
    "header.brand": "Hearts2Hearts",
    "header.tagline": "For S2U",
    "header.nav.concept": "Tổng quan",
    "header.nav.moments": "Khoảnh khắc",
    "header.nav.join": "Tham gia",
    "header.nav.performance": "Hiệu suất",
    "header.nav.voting": "Bình chọn",
    "header.login": "Đăng nhập",

    // Hero Section
    "hero.title": "Hearts2Hearts",

    // CTA Buttons
    "cta.opening": "Xem opening",
    "cta.concept": "Khám phá concept",

    // Stats Section
    "stats.eyebrow": "Stats chuyển động",
    "stats.title": "Nhịp số liệu cho kỷ nguyên Hearts2Hearts",
    "stats.debutDays": "Số ngày từ debut",
    "stats.albums": "Dự án album",
    "stats.musicShows": "Cúp music show",
    "stats.awardCeremonies": "Giải từ lễ trao giải",
    "stats.source": "Nguồn",
    "stats.viewDetails": "Xem chi tiết",
    "stats.latestRelease": "Phát hành gần nhất",
    "stats.latestRelease.watchMv": "Xem MV",
    "stats.latestRelease.mvPending": "Sẵn chỗ để thêm link MV",
    "stats.comeback.eyebrow": "Đếm ngược",
    "stats.comeback.templateTitle": "Comeback countdown",
    "stats.comeback.templateLabel": "Đang chờ công bố chính thức",
    "stats.comeback.templateDisplay": "Màn hình đếm ngược",
    "stats.comeback.ready": "Countdown đã bật",
    "stats.comeback.pending": "Đang chờ ngày chính thức tiếp theo",
    "stats.comeback.pendingDesc":
      "Hiện chưa có lịch comeback chính thức được công bố. Panel này đã được chuẩn bị sẵn để chuyển sang countdown ngay khi có ngày xác nhận.",
    "stats.comeback.placeholder": "Chế độ chờ",
    "stats.comeback.placeholderDesc":
      "Khi SM hoặc nhóm đăng ngày chính thức, khung này sẽ chuyển sang countdown mà không phải thay layout.",
    "stats.comeback.days": "Ngày",
    "stats.comeback.hours": "Giờ",
    "stats.comeback.minutes": "Phút",
    "stats.comeback.seconds": "Giây",
    "stats.comeback.date": "Ngày phát hành:",
    "stats.comeback.realtime": "Countdown này sẽ cập nhật realtime ngay khi ngày phát hành chính thức được thêm vào.",

    // Track Performance Section
    "performance.label": "Hiệu suất track",
    "performance.title": "Hiệu suất track",
    "performance.subtitle": "Stream theo ngày từ Spotify Charts và lượt xem MV chính thức trong một bảng.",
    "performance.updatedAt": "Cập nhật",
    "performance.spotify": "Spotify",
    "performance.youtube": "YouTube",
    "performance.melon": "Melon",
    "performance.bugs": "Bugs",
    "performance.genie": "Genie",
    "performance.vibe": "Vibe",
    "performance.korea": "Hàn Quốc",
    "performance.korea.desc": "Truy cập nhanh các bảng xếp hạng nội địa chính thức tại Hàn Quốc. Nhấn để chuyển đến trang xếp hạng của từng nền tảng.",
    "performance.korea.visit": "Truy cập BXH",
    "performance.totalStreams": "Tổng stream",
    "performance.dailyStreams": "Stream mỗi ngày",
    "performance.totalViews": "Tổng views",
    "performance.dailyViews": "Views mỗi ngày",
    "performance.dailyChange": "Biến động ngày",
    "performance.totalLabel": "Tổng",
    "performance.topTracks": "Top 5 bài hát",
    "performance.topVideos": "Top 5 video",
    "performance.viewAll": "Xem tất cả",
    "performance.empty": "Chưa có dữ liệu track từ nguồn này.",

    // Concept Section
    "concept.official": "Kênh chính thức",
    "concept.official.title": "Kênh chính thức để theo dõi Hearts2Hearts",
    "concept.official.desc":
      "Mở link trực tiếp tới nền tảng chính thức để cập nhật nội dung mới, tránh reup và hạn chế rủi ro bản quyền.",
    "concept.members": "Hồ sơ thành viên",
    "concept.members.detail": "Nhấn để xem chi tiết",
    "concept.members.title": "Hồ sơ thành viên",
    "concept.members.desc":
      "Hiển thị ảnh, tên và vị trí trong nhóm. Nhấn vào từng thẻ để mở trang thông tin chi tiết.",

    // Official Profile Section
    "moments.title": "Official profile box",
    "moments.subtitle":
      "Hộp thông tin official tổng hợp của Hearts2Hearts, lấy tham chiếu từ nguồn wiki và tách biệt với dữ liệu hồ sơ từng thành viên.",
    "moments.fact.group": "Nhóm",
    "moments.fact.company": "Công ty",
    "moments.fact.labels": "Label phát hành",
    "moments.fact.origin": "Xuất xứ",
    "moments.fact.debut": "Ngày debut",
    "moments.fact.members": "Số thành viên",
    "moments.fact.fandom": "Fandom",
    "moments.fact.color": "Màu sắc official",
    "moments.sources": "Nguồn wiki",

    "join.title": "Tham gia không khí",
    "join.subtitle": "Một landing page sang trọng hơn, mềm mại hơn nhưng vẫn độc đáo để nhớ lâu.",
    "join.desc":
      "Trong tâm của homepage bây giờ là nhịp ảnh ở giữa hero. Phần còn lại chỉ làm nền để slide phim và logo remove nổi bật hơn.",
    "join.email": "Email của bạn",
    "join.subscribe": "Nhận cập nhật mới",

    // Timeline Section
    "timeline.label": "Dòng thời gian",
    "timeline.title": "Dòng thời gian",
    "timeline.eras": "giai đoạn",
    "timeline.emptyTitle": "Dòng thời gian đang được cập nhật",
    "timeline.emptyDesc": "Dữ liệu phát hành sẽ hiển thị tại đây khi sẵn sàng.",
    "timeline.newestDrop": "Mới phát hành",
    "timeline.openAlbum": "Mở Album",
    "timeline.view": "Xem",
    "timeline.dragHint": "Kéo ngang để khám phá",
    "timeline.showingYears": "Hiển thị",
    "timeline.latestYears": "năm gần nhất",
    "timeline.showMoreYears": "Hiện thêm",
    "timeline.olderYears": "năm cũ",
    "timeline.type.debut": "Debut",
    "timeline.type.comeback": "Comeback",
    "timeline.type.preRelease": "Pre-release",
    "timeline.type.firstEp": "EP đầu tay",
    "timeline.type.ep": "EP",
    "timeline.type.single": "Single",
    "timeline.type.album": "Album",
    "timeline.type.release": "Phát hành",

    // Charts Page
    "charts.title": "Hiệu suất Track",
    "charts.subtitle": "Phân tích thời gian thực cho danh sách đĩa nhạc của Hearts2Hearts.",
    "charts.return": "Quay lại Hub",
    "charts.lastSynced": "Đồng bộ lúc",
    "charts.spotify.title": "Bảng xếp hạng Spotify",
    "charts.youtube.title": "Lượt xem YouTube",
    "charts.melon.title": "Bảng xếp hạng Melon",
    "charts.bugs.title": "Bảng xếp hạng Bugs",
    "charts.genie.title": "Bảng xếp hạng Genie",
    "charts.vibe.title": "Bảng xếp hạng Vibe",
    "charts.analyzed": "Track được phân tích",
    "charts.analyzed.video": "Video được phân tích",
    "charts.empty": "Không có dữ liệu.",
    "charts.rank": "Hạng",
    "charts.total": "Tổng",
    "charts.daily": "Ngày",
    "charts.trend": "Xu hướng",
    "charts.realtime": "Dữ liệu thời gian thực",
    "charts.trackInfo": "Thông tin Track",
    "charts.videoInfo": "Thông tin Video",

    // Voting Page
    "voting.title": "Bình chọn & Hỗ trợ",
    "voting.subtitle": "Hướng dẫn chính thức và theo dõi hỗ trợ fan cho Hearts2Hearts.",
    "voting.hub": "Fan Support Hub",
    "voting.guide": "Hướng dẫn App",
    "voting.tracking": "Theo dõi trực tiếp",
    "voting.quickLinks": "Liên kết nhanh",
    "voting.viewGuide": "Xem hướng dẫn",
    "voting.android": "Android",
    "voting.ios": "iOS",
    "voting.website": "Website",
    "voting.empty": "Chưa có ứng dụng nào trong mục này.",
    "voting.join": "Tham gia đội ngũ bình chọn",
    "voting.join.desc": "Đam mê giúp Hearts2Hearts chiến thắng? Hãy tham gia đội ngũ bình chọn nòng cốt của chúng tôi!",
    "voting.join.cta": "Nhắn tin qua X",
    "voting.backToTop": "Về đầu trang",
    "voting.comingSoon": "Sắp ra mắt",
    "voting.trackingDesc": "Bảng theo dõi trực tiếp điểm số music show và tiến độ bình chọn đang được phát triển. Hãy đón chờ các cập nhật thời gian thực về hiệu suất của Hearts2Hearts!",
    "voting.category.music_shows": "Music Shows",
    "voting.category.awards": "Awards",
    "voting.category.birthday": "Birthday / Anniv.",
    "voting.category.stream_support": "Stream Support",
    "voting.appCount": "{count} ứng dụng",
    "voting.appsCount": "{count} ứng dụng",

    // Home Sections
    "home.stats.careerRecords": "Career Records",
    "home.stats.badge.debutMilestone": "Cột mốc Debut",
    "home.stats.desc.sinceDebut": "Từ 24/02/2025",
    "home.stats.badge.releaseCatalog": "Danh mục phát hành",
    "home.stats.desc.fullDiscography": "Toàn bộ đĩa nhạc",
    "home.stats.badge.liveTrophies": "Cúp Music Show",
    "home.stats.desc.broadcastWins": "Chiến thắng đài truyền hình",
    "home.stats.badge.globalAwards": "Giải thưởng quốc tế",
    "home.stats.desc.industryHonors": "Vinh danh ngành âm nhạc",

    "home.performance.liveAnalytics": "Phân tích trực tiếp",
    "home.performance.rankings": "Bảng xếp hạng",
    "home.performance.officialMv": "MV chính thức",
    "home.performance.fullCharts": "Bảng xếp hạng đầy đủ",
    "home.performance.insights": "Thông tin chi tiết",
    "home.performance.dailyGlobal": "Toàn cầu hàng ngày",
    "home.performance.dailyViews": "Lượt xem hàng ngày",
    "home.performance.topTrack": "Track hàng đầu",
    "home.performance.viewAll": "Xem tất cả track",

    "home.comeback.active": "Đang chuẩn bị Comeback",
    "home.comeback.standby": "Chế độ chờ",
    "home.comeback.preparing": "Chuẩn bị cho kỷ nguyên mới",
    "home.comeback.preOrder": "Đặt trước",
    "home.comeback.preSave": "Pre-save",
    "home.comeback.notifyMe": "Thông báo cho tôi",

    // Detail Pages
    "common.backToHome": "Quay lại trang chủ",
    "member.eyebrow": "Thành viên Hearts2Hearts",
    "member.highlights": "Đặc điểm nổi bật",
    "member.sourceAttribution": "Nguồn & Bản quyền",
    "member.disclaimer": "Thông tin tóm tắt được fan tổng hợp cho mục đích tham khảo. Các nhãn hiệu, logo và tài sản liên quan đến nghệ sĩ thuộc về chủ sở hữu tương ứng.",
    "album.releaseDate": "Ngày phát hành",
    "album.trackList": "Danh sách bài hát",
    "album.trackListEmpty": "Danh sách bài hát sẽ được cập nhật khi nguồn wiki bổ sung.",
    "album.viewSource": "Xem nguồn trên Wikidata",

    // Footer
    "footer.copyright": "© {year} Hearts2Hearts · Dự án fan không chính thức",
    "footer.disclaimer": "Đây là bách khoa toàn thư độc lập của fan. Tất cả bản quyền thuộc về chủ sở hữu tương ứng.",

    // Notice Board
    "notice.title": "Bảng ghim",
    "notice.pin": "Đã ghim",
    "notice.new": "Mới",
    "notice.close": "Đóng",
    "notice.open": "Mở bảng thông báo",
    "notice.empty": "Hiện không có thông báo quan trọng nào.",
    "notice.buyAlbum": "Mua Album",
    "notice.viewDetail": "Xem chi tiết",
    "notice.viewMore": "Bảng thông báo",
    "notice.allNotices": "Bảng thông báo quan trọng",
    "notice.back": "Quay lại",
  },
} as const

export type TranslationKey = keyof (typeof translations)["en"]
type ArrayTranslationKey = {
  [K in TranslationKey]: (typeof translations)["en"][K] extends readonly string[] ? K : never
}[TranslationKey]
type TranslationValue<K extends TranslationKey> = K extends ArrayTranslationKey ? readonly string[] : string

export function isLanguage(value: string): value is Language {
  return SUPPORTED_LANGUAGES.includes(value as Language)
}

export function normalizeLanguage(value: string | null | undefined): Language {
  if (!value) {
    return DEFAULT_LANGUAGE
  }

  const normalized = value.toLowerCase().trim()
  return isLanguage(normalized) ? normalized : DEFAULT_LANGUAGE
}

export function getTranslation<K extends TranslationKey>(
  lang: Language | string,
  key: K,
): TranslationValue<K> {
  const safeLang = normalizeLanguage(lang)
  const localized = translations[safeLang][key]
  const fallbackVi = translations[DEFAULT_LANGUAGE][key]
  const fallbackEn = translations.en[key]
  return (localized ?? fallbackVi ?? fallbackEn) as unknown as TranslationValue<K>
}
