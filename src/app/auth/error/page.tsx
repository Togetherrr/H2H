import Link from "next/link"

const messages: Record<string, { title: string; description: string }> = {
  "admin-only": {
    title: "Admin access only",
    description: "Tai khoan nay da dang nhap nhung chua duoc cap quyen admin.",
  },
  default: {
    title: "Authentication error",
    description: "Da co loi xay ra trong qua trinh dang nhap. Ban co the thu lai sau.",
  },
}

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  const params = await searchParams
  const message = messages[params.reason ?? ""] ?? messages.default

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center px-6 py-16">
      <div className="w-full rounded-3xl border border-sky-100 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-sky-600">H2H Auth</p>
        <h1 className="mt-4 text-3xl text-slate-950">{message.title}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">{message.description}</p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/login"
            className="rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
          >
            Quay lai dang nhap
          </Link>
          <Link
            href="/home"
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Ve trang chu
          </Link>
        </div>
      </div>
    </main>
  )
}
