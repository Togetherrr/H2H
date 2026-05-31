import { NextResponse } from "next/server";
import { getTrackPerformanceSnapshot } from "@/lib/track-performance";
import { getSocialStatsSnapshotFromDb, refreshSocialStatsSnapshot } from "@/lib/realtime/social-stats";
import { createServiceClient } from "@/lib/supabase/service";
import { floorToMinutes, parseSpotifyTrackId } from "@/lib/realtime/utils";
import { fetchKworbYoutubeDaily } from "@/lib/realtime/kworb-youtube";

export const runtime = "nodejs";
export const revalidate = 0;

const isDebug = process.env.NODE_ENV !== "production";
const logDebug = (...args: unknown[]) => {
  if (isDebug) console.log(...args);
};

function requireCronSecret(req: Request) {
  const configured = process.env.H2H_CRON_SECRET;
  if (!configured) throw new Error("Missing H2H_CRON_SECRET.");

  const url = new URL(req.url);
  const querySecret = url.searchParams.get("secret");
  const headerSecret = req.headers.get("x-cron-secret");
  const vercelCronSecret = req.headers.get("authorization")?.replace("Bearer ", "");

  return (
    querySecret === configured ||
    headerSecret === configured ||
    vercelCronSecret === configured
  );
}
export async function GET(req: Request) {
  try {
    if (!requireCronSecret(req)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    logDebug("POLL ROUTE HIT");

    const url = new URL(req.url);
    const dryRun =
      url.searchParams.get("dryRun") === "1" ||
      url.searchParams.get("dryRun") === "true";

    const bucketTs = floorToMinutes(new Date(), 5).toISOString();

    const socialStatsSnapshot = dryRun
      ? await getSocialStatsSnapshotFromDb({ allowLiveFallback: false })
      : await refreshSocialStatsSnapshot();
    const snapshot = await getTrackPerformanceSnapshot();
    const spotifySource = snapshot.sources?.spotify ?? null;

    // =========================
    // SPOTIFY
    // =========================

    const spotifyRows = snapshot.spotify.items
      .map((item) => {
        logDebug("RAW SPOTIFY ITEM:", item);

        const parsedId =
          parseSpotifyTrackId(item.href) ??
          item.id ??
          parseSpotifyTrackId(item.meta);

        logDebug("PARSED SPOTIFY ID:", parsedId);

        const total = typeof item.total === "number" ? item.total : null;

        if (!parsedId || total === null) {
          logDebug("INVALID SPOTIFY ITEM:", item);
          return null;
        }

        return {
          type: "spotify_track" as const,
          platform_id: parsedId,
          title: item.title ?? "",
          cover_url: item.imageUrl ?? null,
          is_active: true,
          total,
          daily: item.daily ?? null,
        };
      })
      .filter(Boolean) as Array<{
        type: "spotify_track";
        platform_id: string;
        title: string;
        cover_url: string | null;
        is_active: boolean;
        total: number;
        daily: number | null;
      }>;

    const needsSpotifyFallback =
      spotifyRows.length === 0 &&
      typeof spotifySource === "string" &&
      (spotifySource.includes("429") ||
        spotifySource.includes("rate") ||
        spotifySource.includes("blocked"));

    // =========================
    // YOUTUBE
    // =========================

    const youtubeRows = snapshot.youtube.items
      .map((item) => {
        const platformId = item.id;
        const total = typeof item.total === "number" ? item.total : null;

        if (!platformId || total === null) {
          logDebug("INVALID YOUTUBE ITEM:", item);
          return null;
        }

        return {
          type: "youtube_video" as const,
          platform_id: platformId,
          title: item.title ?? "",
          cover_url: item.imageUrl ?? null,
          is_active: true,
          total,
        };
      })
      .filter(Boolean) as Array<{
        type: "youtube_video";
        platform_id: string;
        title: string;
        cover_url: string | null;
        is_active: boolean;
        total: number;
      }>;

    // ── Fetch daily views từ Kworb cho YouTube ───────────────────────────────
    // Map: platform_id (video ID) → daily views ngày mới nhất
    const youtubeVideoIds = youtubeRows.map((r) => r.platform_id);
    const youtubeDailyMap = youtubeVideoIds.length > 0
      ? await fetchKworbYoutubeDaily(youtubeVideoIds)
      : new Map<string, number>();

    logDebug("YOUTUBE DAILY MAP FROM KWORB:", Object.fromEntries(youtubeDailyMap));

    logDebug("SPOTIFY ROWS:", spotifyRows);
    logDebug("YOUTUBE ROWS:", youtubeRows);

    const supabase = createServiceClient();

    let finalSpotifyRows = spotifyRows;

    if (needsSpotifyFallback) {
      const { data: existingItems, error: existingItemsError } = await supabase
        .from("h2h_items")
        .select("id,type,platform_id,title,cover_url,is_active")
        .eq("type", "spotify_track")
        .eq("is_active", true)
        .limit(100);

      if (existingItemsError) {
        logDebug("SPOTIFY FALLBACK ITEMS ERROR:", existingItemsError);
      } else {
        const itemIds = (existingItems ?? [])
          .map((row) => row.id)
          .filter(Boolean) as string[];
        if (itemIds.length > 0) {
          const oldestIso = new Date(Date.now() - 7 * 24 * 60 * 60_000).toISOString();
          const { data: snapshotRows } = await supabase
            .from("h2h_item_snapshots")
            .select("item_id,ts,total")
            .in("item_id", itemIds)
            .gte("ts", oldestIso)
            .lte("ts", bucketTs)
            .order("ts", { ascending: false })
            .limit(1000);

          const lastTotalByItemId = new Map<string, number>();
          for (const row of snapshotRows ?? []) {
            if (!lastTotalByItemId.has(row.item_id)) {
              lastTotalByItemId.set(row.item_id, Number(row.total));
            }
          }

          finalSpotifyRows = (existingItems ?? [])
            .map((row) => {
              const total = lastTotalByItemId.get(row.id);
              if (typeof total !== "number" || Number.isNaN(total)) return null;
              return {
                type: "spotify_track" as const,
                platform_id: row.platform_id as string,
                title: row.title as string,
                cover_url: (row.cover_url as string | null) ?? null,
                is_active: true,
                total,
                daily: null,
              };
            })
            .filter(Boolean) as typeof spotifyRows;

          logDebug("SPOTIFY FALLBACK ROWS:", finalSpotifyRows);
        }
      }
    }

    // =========================
    // UPSERT ITEMS
    // =========================

    const itemsToUpsert = [...finalSpotifyRows, ...youtubeRows].map((row) => ({
      type: row.type,
      platform_id: row.platform_id,
      title: row.title,
      cover_url: row.cover_url,
      is_active: row.is_active,
      source_updated_at:
        row.type === "spotify_track"
          ? (snapshot.spotify.note
            ?.match(/(\d{4}\/\d{2}\/\d{2})/)?.[1]
            ?.replace(/\//g, "-") ?? null)
          : null,
    }));

    const snapshotRows = [...finalSpotifyRows, ...youtubeRows];

    logDebug("ITEMS TO UPSERT:", itemsToUpsert);

    if (itemsToUpsert.length === 0) {
      return NextResponse.json({ ok: false, bucketTs, reason: "no_items" }, { status: 424 });
    }

    if (dryRun) {
      return NextResponse.json({
        ok: true,
        dryRun: true,
        bucketTs,
        counts: { items: itemsToUpsert.length, snapshots: snapshotRows.length },
        updatedAt: snapshot.updatedAt,
        sources: snapshot.sources,
        socialStatsUpdatedAt: socialStatsSnapshot?.updatedAt ?? null,
        sampleItems: itemsToUpsert.slice(0, 3),
        youtubeDailySample: Object.fromEntries(
          [...youtubeDailyMap.entries()].slice(0, 3)
        ),
      });
    }

    const { data: upsertedItems, error: upsertError } = await supabase
      .from("h2h_items")
      .upsert(itemsToUpsert as any[], { onConflict: "type,platform_id" })
      .select("id,type,platform_id");

    logDebug("UPSERTED ITEMS:", upsertedItems);
    logDebug("UPSERT ERROR:", upsertError);

    if (upsertError) {
      return NextResponse.json(
        { ok: false, bucketTs, step: "upsert_items", error: upsertError.message },
        { status: 502 },
      );
    }

    // =========================
    // MAP IDS
    // =========================

    const idByKey = new Map<string, string>();
    for (const row of upsertedItems ?? []) {
      idByKey.set(`${row.type}:${row.platform_id}`, row.id);
    }

    // =========================
    // SNAPSHOTS
    // =========================

    // Spotify: fallback daily_kworb từ DB nếu null
    const spotifyItemIds = finalSpotifyRows
      .map((row) => idByKey.get(`spotify_track:${row.platform_id}`))
      .filter(Boolean) as string[];

    const lastKworbByItemId = new Map<string, number>();

    if (spotifyItemIds.length > 0) {
      const { data: lastSnapshots } = await supabase
        .from("h2h_item_snapshots")
        .select("item_id,daily_kworb")
        .in("item_id", spotifyItemIds)
        .not("daily_kworb", "is", null)
        .order("ts", { ascending: false })
        .limit(1000);

      for (const row of lastSnapshots ?? []) {
        if (!lastKworbByItemId.has(row.item_id)) {
          lastKworbByItemId.set(row.item_id, row.daily_kworb);
        }
      }
    }

    const snapshotsToUpsert = snapshotRows
      .map((row) => {
        const itemId = idByKey.get(`${row.type}:${row.platform_id}`);
        if (!itemId) return null;

        let dailyKworb: number | null = null;

        if (row.type === "spotify_track") {
          // Spotify: lấy từ kworb scrape, fallback DB
          dailyKworb =
            (row as any).daily ?? lastKworbByItemId.get(itemId) ?? null;
        } else if (row.type === "youtube_video") {
          // ── YouTube: lấy từ Kworb scrape ──────────────────────────────
          dailyKworb = youtubeDailyMap.get(row.platform_id) ?? null;
          logDebug(`YT daily_kworb [${row.platform_id}]:`, dailyKworb);
        }

        return {
          item_id: itemId,
          ts: bucketTs,
          total: row.total,
          daily_kworb: dailyKworb,
        };
      })
      .filter(Boolean) as Array<{
        item_id: string;
        ts: string;
        total: number;
        daily_kworb: number | null;
      }>;

    logDebug("SNAPSHOTS TO UPSERT:", snapshotsToUpsert);

    const { error: snapshotError } = await supabase
      .from("h2h_item_snapshots")
      .upsert(snapshotsToUpsert, { onConflict: "item_id,ts" });

    logDebug("SNAPSHOT ERROR:", snapshotError);

    if (snapshotError) {
      return NextResponse.json(
        { ok: false, bucketTs, step: "upsert_snapshots", error: snapshotError.message },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      bucketTs,
      counts: {
        items: itemsToUpsert.length,
        snapshots: snapshotsToUpsert.length,
        youtubeDailyFetched: youtubeDailyMap.size,
      },
      updatedAt: snapshot.updatedAt,
      socialStatsUpdatedAt: socialStatsSnapshot?.updatedAt ?? null,
    });
  } catch (error) {
    console.error("POLL ROUTE ERROR:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}