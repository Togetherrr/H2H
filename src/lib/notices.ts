export type NoticeType = "comeback" | "company" | "event" | "general"

export interface Notice {
  id: string
  type: NoticeType
  title_en: string
  title_vi: string
  content_en: string
  content_vi: string
  link?: string
  linkText_en?: string
  linkText_vi?: string
  isPinned?: boolean
  date: string
}

export const ALL_NOTICES: Notice[] = [
  {
    id: "1",
    type: "comeback",
    title_en: "Hearts2Hearts 1st Mini Album 'REBIRTH' Official Pre-order",
    title_vi: "Hearts2Hearts 1st Mini Album 'REBIRTH' chính thức mở Pre-order",
    content_en: "Official album pre-order is now available! Support the girls for their upcoming comeback. All sales count towards major music charts.",
    content_vi: "Đã có thể đặt trước Album chính thức! Hãy ủng hộ các cô gái cho lần trở lại sắp tới. Toàn bộ doanh số sẽ được tính vào các bảng xếp hạng âm nhạc.",
    link: "https://example.com/buy-album",
    linkText_en: "Buy Album",
    linkText_vi: "Mua Album",
    isPinned: true,
    date: "2024-05-10"
  },
  {
    id: "2",
    type: "company",
    title_en: "Official Fanclub Recruitment Notice",
    title_vi: "Thông báo tuyển Fanclub chính thức",
    content_en: "The recruitment for the 1st generation of S2U will begin next week. Stay tuned for details regarding membership benefits.",
    content_vi: "Việc tuyển thành viên S2U thế hệ thứ nhất sẽ bắt đầu vào tuần tới. Theo dõi để biết thêm chi tiết về quyền lợi thành viên.",
    link: "#",
    linkText_en: "View Detail",
    linkText_vi: "Xem chi tiết",
    date: "2024-05-01"
  },
  {
    id: "3",
    type: "event",
    title_en: "Special Video Call Event",
    title_vi: "Sự kiện Video Call đặc biệt",
    content_en: "A special video call event for 'REBIRTH' buyers. 50 lucky winners will be selected.",
    content_vi: "Sự kiện video call đặc biệt dành cho những người mua album 'REBIRTH'. 50 người may mắn sẽ được lựa chọn.",
    link: "#",
    date: "2024-05-05"
  },
  {
    id: "4",
    type: "general",
    title_en: "Hearts2Hearts Official Website Launch",
    title_vi: "Ra mắt website chính thức của Hearts2Hearts",
    content_en: "Welcome to our official fan home! Explore profiles, discography, and more.",
    content_vi: "Chào mừng bạn đến với ngôi nhà chung chính thức! Khám phá hồ sơ, danh sách đĩa nhạc và nhiều hơn nữa.",
    date: "2024-04-25"
  },
  {
    id: "5",
    type: "company",
    title_en: "Regarding Artist Protection and Legal Action",
    title_vi: "Về việc bảo vệ nghệ sĩ và hành động pháp lý",
    content_en: "We are committed to protecting our artists from malicious comments and false information.",
    content_vi: "Chúng tôi cam kết bảo vệ nghệ sĩ khỏi các bình luận ác ý và thông tin sai sự thật.",
    link: "#",
    date: "2024-04-20"
  }
]
