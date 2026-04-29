import { requireAdmin } from "@/lib/auth"
import { AdminDashboard } from "@/components/admin/AdminDashboard"

export default async function AdminPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { profile } = await requireAdmin()
  const searchParams = await props.searchParams
  const initialTab = typeof searchParams.tab === "string" ? searchParams.tab : "overview"

  return (
    <AdminDashboard
      initialTab={initialTab}
      profile={profile}
    />
  )
}
