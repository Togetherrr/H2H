export type RealtimeItem = {
  id: string;
  type: string;
  platform_id: string;
  title: string | null;
  cover_url: string | null;
  release_date: string | null;
  is_active: boolean;
  source_updated_at: string | null;
};

export type RealtimeSnapshot = {
  item_id: string;
  ts: string;
  total: number;
  daily_kworb?: number | null;
  source_updated_at?: string | null;
};

// Lấy snapshot mới nhất trước hoặc bằng boundary
function pickLatestBefore(snapshots: RealtimeSnapshot[], boundaryMs: number) {
  for (const s of snapshots) {
    const ms = Date.parse(s.ts);
    if (Number.isFinite(ms) && ms <= boundaryMs) return s;
  }
  return null;
}

// Trả về thời điểm 00:00 KST hôm nay (UTC+9) tính theo UTC
export function getKstDayStart(now: Date): Date {
  const KST_OFFSET_MS = 9 * 60 * 60_000;
  const nowKst = new Date(now.getTime() + KST_OFFSET_MS);
  const kstMidnight = new Date(
    Date.UTC(
      nowKst.getUTCFullYear(),
      nowKst.getUTCMonth(),
      nowKst.getUTCDate(),
      0, 0, 0, 0,
    ),
  );
  return new Date(kstMidnight.getTime() - KST_OFFSET_MS);
}

export function computeRolling24h(
  items: RealtimeItem[],
  snapshots: RealtimeSnapshot[],
  now: Date,
) {
  const endMs = now.getTime();
  const kstDayStart = getKstDayStart(now);
  const startMs = kstDayStart.getTime();
  const prevStartMs = startMs - 24 * 60 * 60_000;

  const snapshotsByItem = new Map<string, RealtimeSnapshot[]>();
  for (const s of snapshots) {
    const list = snapshotsByItem.get(s.item_id) ?? [];
    list.push(s);
    snapshotsByItem.set(s.item_id, list);
  }
  for (const list of snapshotsByItem.values()) {
    list.sort((a, b) => Date.parse(b.ts) - Date.parse(a.ts));
  }

  const rows = items.map((item) => {
    const list = snapshotsByItem.get(item.id) ?? [];

    const end = pickLatestBefore(list, endMs);
    const start = pickLatestBefore(list, startMs);
    const prevStart = pickLatestBefore(list, prevStartMs);

    const totalNow = end?.total ?? null;
    const totalDayStart = start?.total ?? null;
    const totalPrevDayStart = prevStart?.total ?? null;

    const delta =
      totalNow !== null && totalDayStart !== null
        ? Math.max(0, totalNow - totalDayStart)
        : null;

    const prevDelta =
      totalDayStart !== null && totalPrevDayStart !== null
        ? Math.max(0, totalDayStart - totalPrevDayStart)
        : null;

    // Snapshot cũ nhất có daily_kworb (list sort desc → at(-1) là cũ nhất)
    const oldestWithKworb = list.filter((s) => s.daily_kworb != null).at(-1);

    // ── Daily ──────────────────────────────────────────────────────────────
    const effectiveDelta = (() => {
      // Spotify: ưu tiên daily_kworb từ Kworb
      if (item.type === "spotify_track" && end?.daily_kworb != null) {
        return end.daily_kworb;
      }
      // YouTube: nếu snapshot mới nhất có daily_kworb từ Kworb thì dùng luôn
      if (item.type === "youtube_video" && end?.daily_kworb != null) {
        return end.daily_kworb;
      }
      // YouTube/fallback: dùng delta qua midnight KST nếu dương
      if (delta !== null && delta > 0) return delta;
      // YouTube rough: tính từ oldest → newest snapshot hiện có
      if (list.length >= 2) {
        const newest = list[0];
        const oldest = list[list.length - 1];
        const rough = newest.total - oldest.total;
        return rough > 0 ? rough : null;
      }
      return null;
    })();

    // ── Change ─────────────────────────────────────────────────────────────
    const deltaChange = (() => {
      // Spotify: so sánh daily_kworb giữa 2 snapshot khác nhau
      if (
        item.type === "spotify_track" &&
        end?.daily_kworb != null &&
        oldestWithKworb != null &&
        oldestWithKworb !== end
      ) {
        return end.daily_kworb - oldestWithKworb.daily_kworb!;
      }
      // YouTube: nếu đã có daily_kworb thì dùng delta của Kworb snapshots,
      // còn snapshot đầu tiên thì trả 0 để UI có số ngay sau khi add.
      if (item.type === "youtube_video" && end?.daily_kworb != null) {
        if (oldestWithKworb != null && oldestWithKworb !== end) {
          return end.daily_kworb - oldestWithKworb.daily_kworb!;
        }
        return 0;
      }
      // YouTube/fallback: tính từ snapshot qua midnight KST
      if (delta !== null && prevDelta !== null) return delta - prevDelta;
      return null;
    })();

    return {
      item,
      total: totalNow,
      delta24h: effectiveDelta,
      delta24hChange: deltaChange,
      lastTs: end?.ts ?? null,
    };
  });

  const total = rows.reduce((sum, r) => sum + (r.total ?? 0), 0);
  const delta24h = rows.reduce((sum, r) => sum + (r.delta24h ?? 0), 0);
  const delta24hChange = rows.reduce((sum, r) => sum + (r.delta24hChange ?? 0), 0);

  const updatedAt = rows
    .map((r) => r.lastTs)
    .filter(Boolean)
    .sort()
    .at(-1) as string | undefined;

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
  };
}
