export const dynamic = "force-dynamic"
import { requireAdmin } from "@/lib/auth"
import { getAdminTabData } from "@/app/admin/actions"
import { AdminDashboard } from "@/components/admin/AdminDashboard"

const VALID_TABS = new Set([
  "overview",
  "sync",
  "users",
  "members",
  "themes",
  "socials",
  "settings",
  "media",
  "voting",
  "award-events",
  "lineup-reveal",
  "career-records",
  "youtube-items",
  "comeback",
  "notices",
  "feedback",
])

function normalizeTab(tab: string) {
  return VALID_TABS.has(tab) ? tab : "overview"
}

export default async function AdminPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { user, profile } = await requireAdmin()
  const searchParams = await props.searchParams
  const initialTab = normalizeTab(typeof searchParams.tab === "string" ? searchParams.tab : "overview")
  const initialData = await getAdminTabData(initialTab, {
    id: user.id,
    email: user.email,
  })

  return (
    <AdminDashboard
      initialTab={initialTab}
      initialData={initialData}
      profile={profile}
    />
  )
}
