export type RealtimeItem = {
  id: string
  type: string
  platform_id: string
  title: string | null
  cover_url: string | null
  release_date: string | null
  is_active: boolean
  source_updated_at: string | null
}

export type RealtimeSnapshot = {
  item_id: string
  ts: string
  total: number
  daily_kworb?: number | null
  source_updated_at?: string | null
}

function pickLatestBefore(snapshots: RealtimeSnapshot[], boundaryMs: number) {
  for (const s of snapshots) {
    const ms = Date.parse(s.ts)
    if (Number.isFinite(ms) && ms <= boundaryMs) return s
  }
  return null
}

export function getKstDayStart(now: Date): Date {
  const KST_OFFSET_MS = 9 * 60 * 60_000
  const nowKst = new Date(now.getTime() + KST_OFFSET_MS)
  const kstMidnight = new Date(
    Date.UTC(
      nowKst.getUTCFullYear(),
      nowKst.getUTCMonth(),
      nowKst.getUTCDate(),
      0, 0, 0, 0,
    ),
  )
  return new Date(kstMidnight.getTime() - KST_OFFSET_MS)
}

export function computeRolling24h(
  items: RealtimeItem[],
  snapshots: RealtimeSnapshot[],
  now: Date,
) {
  const endMs = now.getTime()
  const kstDayStart = getKstDayStart(now)
  const startMs = kstDayStart.getTime()
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

  function findNearestDistinctSnapshot(list: RealtimeSnapshot[], base: RealtimeSnapshot) {
    for (const snapshot of list.slice(1)) {
      const hasDistinctTotal = snapshot.total !== base.total
      const hasDistinctKworb = snapshot.daily_kworb != null && base.daily_kworb != null && snapshot.daily_kworb !== base.daily_kworb
      if (hasDistinctTotal || hasDistinctKworb) {
        return snapshot
      }
    }
    return null
  }

  function findLastNonZeroChange(list: RealtimeSnapshot[]) {
    for (let i = 0; i < list.length - 1; i += 1) {
      const newer = list[i]
      const older = list[i + 1]

      if (newer.daily_kworb != null && older.daily_kworb != null) {
        const delta = newer.daily_kworb - older.daily_kworb
        if (delta !== 0) return delta
      }

      const delta = newer.total - older.total
      if (delta !== 0) return delta
    }

    return null
  }

  const rows = items.map((item) => {
    const list = snapshotsByItem.get(item.id) ?? []

    const end = pickLatestBefore(list, endMs)
    const start = pickLatestBefore(list, startMs)
    const prevStart = pickLatestBefore(list, prevStartMs)

    const totalNow = end?.total ?? null
    const totalDayStart = start?.total ?? null
    const totalPrevDayStart = prevStart?.total ?? null

    const delta =
      totalNow !== null && totalDayStart !== null
        ? Math.max(0, totalNow - totalDayStart)
        : null

    const prevDelta =
      totalDayStart !== null && totalPrevDayStart !== null
        ? Math.max(0, totalDayStart - totalPrevDayStart)
        : null

    const oldestWithKworb = list.filter((s) => s.daily_kworb != null).at(-1)

    const effectiveDelta = (() => {
      if (end?.daily_kworb != null) {
        return end.daily_kworb
      }
      if (delta !== null && delta > 0) return delta
      if (list.length >= 2) {
        const newest = list[0]
        const oldest = list[list.length - 1]
        const rough = newest.total - oldest.total
        return rough > 0 ? rough : null
      }
      return null
    })()

    const deltaChange = (() => {
      if (
        end?.daily_kworb != null &&
        oldestWithKworb != null &&
        oldestWithKworb !== end
      ) {
        return end.daily_kworb - oldestWithKworb.daily_kworb!
      }
      if (delta !== null && prevDelta !== null) return delta - prevDelta
      if (list.length >= 2) {
        const newest = list[0]
        const previous = findNearestDistinctSnapshot(list, newest) ?? list[1]

        if (newest.daily_kworb != null && previous.daily_kworb != null) {
          const computed = newest.daily_kworb - previous.daily_kworb
          if (computed !== 0) return computed
        }

        const computed = newest.total - previous.total
        if (computed !== 0) return computed
      }

      return findLastNonZeroChange(list)
    })()

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
