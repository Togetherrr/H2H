export type RealtimeItem = {
  id: string
  type: string
  platform_id: string
  title: string | null
  cover_url: string | null
  release_date: string | null
  is_active: boolean
  source_updated_at: string | null  // ✅ thêm dòng này
}

export type RealtimeSnapshot = {
  item_id: string
  ts: string
  total: number
  daily_kworb?: number | null
  source_updated_at?: string | null
}

// Lấy snapshot mới nhất trước hoặc bằng boundary
function pickLatestBefore(snapshots: RealtimeSnapshot[], boundaryMs: number) {
  for (const s of snapshots) {
    const ms = Date.parse(s.ts)
    if (Number.isFinite(ms) && ms <= boundaryMs) return s
  }
  return null
}

// Trả về thời điểm 00:00 KST hôm nay (UTC+9) tính theo UTC
export function getKstDayStart(now: Date): Date {
  const KST_OFFSET_MS = 9 * 60 * 60_000
  const nowKst = new Date(now.getTime() + KST_OFFSET_MS)
  // Floor về 00:00:00 theo KST
  const kstMidnight = new Date(
    Date.UTC(
      nowKst.getUTCFullYear(),
      nowKst.getUTCMonth(),
      nowKst.getUTCDate(),
      0, 0, 0, 0
    )
  )
  // Convert ngược về UTC
  return new Date(kstMidnight.getTime() - KST_OFFSET_MS)
}

export function computeRolling24h(
  items: RealtimeItem[],
  snapshots: RealtimeSnapshot[],
  now: Date
) {
  const endMs = now.getTime()

  // Boundary = 00:00 KST hôm nay
  const kstDayStart = getKstDayStart(now)
  const startMs = kstDayStart.getTime()

  // Để tính dailyChange, cần ngày hôm qua 00:00 KST
  const prevStartMs = startMs - 24 * 60 * 60_000

  const snapshotsByItem = new Map<string, RealtimeSnapshot[]>()
  for (const s of snapshots) {
    const list = snapshotsByItem.get(s.item_id) ?? []
    list.push(s)
    snapshotsByItem.set(s.item_id, list)
  }

  for (const list of snapshotsByItem.values()) {
    list.sort((a, b) => Date.parse(b.ts) - Date.parse(a.ts))
  }

  const rows = items.map((item) => {
    const list = snapshotsByItem.get(item.id) ?? []

    // Snapshot mới nhất (hiện tại)
    const end = pickLatestBefore(list, endMs)
    // Snapshot gần nhất trước 00:00 KST hôm nay = total đầu ngày
    const start = pickLatestBefore(list, startMs)
    // Snapshot gần nhất trước 00:00 KST hôm qua = total đầu ngày hôm qua
    const prevStart = pickLatestBefore(list, prevStartMs)

    const totalNow = end?.total ?? null
    const totalDayStart = start?.total ?? null
    const totalPrevDayStart = prevStart?.total ?? null

    // Daily = streams từ 00:00 KST đến bây giờ
    const delta =
      totalNow !== null && totalDayStart !== null
        ? Math.max(0, totalNow - totalDayStart)
        : null

    // Daily hôm qua (để tính change)
    const prevDelta =
      totalDayStart !== null && totalPrevDayStart !== null
        ? Math.max(0, totalDayStart - totalPrevDayStart)
        : null

    // Change = daily hôm nay - daily hôm qua
    const deltaChange =
      delta !== null && prevDelta !== null ? delta - prevDelta : null
    const effectiveDelta = delta ?? (end?.daily_kworb ?? null)
    return {
      item,
      total: totalNow,
      delta24h: effectiveDelta,
      delta24hChange: deltaChange,
      lastTs: end?.ts ?? null,
    }
  })

  const total = rows.reduce((sum, r) => sum + (r.total ?? 0), 0)
  const delta24h = rows.reduce((sum, r) => sum + (r.delta24h ?? 0), 0)
  const delta24hChange = rows.reduce((sum, r) => sum + (r.delta24hChange ?? 0), 0)

  const updatedAt = rows
    .map((r) => r.lastTs)
    .filter(Boolean)
    .sort()
    .at(-1) as string | undefined

  return {
    window: {
      kind: "kst_day",
      kstDayStart: kstDayStart.toISOString(),
      endMs,
      startMs,
    },
    updatedAt: updatedAt ?? null,
    total,
    delta24h,
    delta24hChange,
    rows,
  }
}