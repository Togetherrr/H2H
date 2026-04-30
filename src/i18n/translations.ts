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

    // Hero Section
    "hero.badge": "All About Hearts2Hearts",
    "hero.title": "Hearts2Hearts",
    "hero.subtitle":
      "This is a space for S2U to get closer to Hearts2Hearts and fully experience the spirit of the group through every moment. Every detail on this page has been carefully selected so you can follow that journey naturally and emotionally.",
    "hero.tags": ["S2U Fan Space", "Hearts2Hearts Profile", "Member Stories", "Updates & Moments"],

    // Feature Cards
    "features.card1.label": "For S2U",
    "features.card1.title": "Easy-to-understand content about Hearts2Hearts",
    "features.card1.desc":
      "This section helps you quickly grasp the spirit of the page: enter and immediately understand this is the place for S2U to follow and learn about Hearts2Hearts clearly and smoothly.",
    "features.card2.label": "What you'll see",
    "features.card2.title": "Member stories and standout moments",
    "features.card2.desc":
      "From member profiles to visuals and key highlights, everything is organized logically so you can browse quickly while still appreciating the depth.",
    "features.card3.label": "Why this page exists",
    "features.card3.title": "Easy to follow, emotions remain whole",
    "features.card3.desc":
      "You don't need to look in many places - you can still stay updated on important information and feel the true colors of Hearts2Hearts right here on one landing page.",

    // CTA Buttons
    "cta.opening": "Watch opening",
    "cta.concept": "Explore concept",

    // Stats Section
    "stats.eyebrow": "Live stats",
    "stats.title": "A quick look at the Hearts2Hearts era",
    "stats.desc":
      "A lightweight stat bar that keeps the homepage feeling alive, while staying grounded in public debut, discography, and awards references.",
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
  },
  vi: {
    // Header
    "header.brand": "Hearts2Hearts",
    "header.tagline": "For S2U",
    "header.nav.concept": "Khái niệm",
    "header.nav.moments": "Khoảnh khắc",
    "header.nav.join": "Tham gia",

    // Hero Section
    "hero.badge": "Tất cả về Hearts2Hearts",
    "hero.title": "Hearts2Hearts",
    "hero.subtitle":
      "Đây là không gian để S2U đến gần hơn với Hearts2Hearts và cảm nhận trọn vẹn tinh thần của nhóm qua từng khoảnh khắc. Mọi chi tiết trên trang đều được chọn lọc để bạn theo dõi hành trình ấy một cách tự nhiên và cảm xúc.",
    "hero.tags": ["Không gian fan S2U", "Hồ sơ Hearts2Hearts", "Câu chuyện thành viên", "Cập nhật & Khoảnh khắc"],

    // Feature Cards
    "features.card1.label": "Dành cho S2U",
    "features.card1.title": "Nội dung dễ hiểu về Hearts2Hearts",
    "features.card1.desc":
      "Phần này giúp bạn nắm nhanh tinh thần của trang: vào là hiểu ngay đây là nơi để S2U theo dõi và tìm hiểu Hearts2Hearts một cách rõ ràng, không rối.",
    "features.card2.label": "Bạn sẽ thấy gì",
    "features.card2.title": "Câu chuyện thành viên và khoảnh khắc nổi bật",
    "features.card2.desc":
      "Từ profile thành viên đến visual và những điểm nhấn quan trọng, mọi thứ được sắp xếp mạch lạc để bạn xem nhanh nhưng vẫn cảm nhận đủ chiều sâu.",
    "features.card3.label": "Vì sao có trang này",
    "features.card3.title": "Theo dõi dễ dàng, cảm xúc vẫn trọn",
    "features.card3.desc":
      "Bạn không cần tìm nhiều nơi vẫn có thể cập nhật thông tin quan trọng và cảm nhận rõ màu sắc của Hearts2Hearts ngay trên một landing page.",

    // CTA Buttons
    "cta.opening": "Xem opening",
    "cta.concept": "Khám phá concept",

    // Stats Section
    "stats.eyebrow": "Stats chuyển động",
    "stats.title": "Nhịp số liệu cho kỷ nguyên Hearts2Hearts",
    "stats.desc":
      "Thanh stats nhẹ, ấn tượng khi scroll và vẫn bám theo các nguồn công khai về debut, discography và giải thưởng.",
    "stats.debutDays": "Số ngày từ debut",
    "stats.albums": "Dự án album",
    "stats.musicShows": "Cúp music show",
    "stats.awardCeremonies": "Giải từ lễ trao giải",
    "stats.source": "Nguồn",
    "stats.viewDetails": "Xem chi tiết",
    "stats.latestRelease": "Phát hành gần nhất",
    "stats.latestRelease.watchMv": "Xem MV",
    "stats.latestRelease.mvPending": "Sẵn chỗ để thêm link MV",
    "stats.comeback.eyebrow": "Comeback watch",
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
  return (localized ?? fallbackVi ?? fallbackEn) as TranslationValue<K>
}
