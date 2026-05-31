import Image from "next/image"

export const dynamic = "force-dynamic"
import Link from "next/link"
import { requireUser } from "@/lib/auth"

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "U"
  const parts = source.split(/\s+/).filter(Boolean)

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

export default async function AccountPage() {
  const { user, profile } = await requireUser("/account")
  const initials = getInitials(profile?.full_name, user.email)

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-12">
      <div className="rounded-3xl border border-sky-100 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-sky-600">H2H Account</p>
        <h1 className="mt-4 text-3xl text-slate-950">Tai khoan cua ban</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Day la trang user sau khi dang nhap. Sau nay ban co the them favorite, follow, bookmark hoac
          bat ky tinh nang nao can tai khoan.
        </p>

        <div className="mt-8 flex flex-col gap-6 rounded-3xl border border-sky-100 bg-sky-50/70 p-6 md:flex-row md:items-center">
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.full_name ?? user.email ?? "User avatar"}
              width={80}
              height={80}
              className="h-20 w-20 rounded-full border border-white/80 object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-xl font-semibold text-white shadow-sm">
              {initials}
            </div>
          )}

          <div>
            <p className="text-xl font-semibold text-slate-950">{profile?.full_name ?? "H2H User"}</p>
            <p className="mt-1 text-sm text-slate-500">{user.email}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-sky-700">Role: {profile?.role ?? "user"}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {profile?.role === "admin" ? (
            <Link
              href="/admin"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Vao admin
            </Link>
          ) : null}
          <Link
            href="/home"
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Ve trang chu
          </Link>
          <Link
            href="/auth/signout"
            className="rounded-full border border-rose-200 px-5 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            Dang xuat
          </Link>
        </div>
      </div>
    </main>
  )
}
