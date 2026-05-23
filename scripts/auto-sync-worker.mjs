import { createClient } from "@supabase/supabase-js";

const appUrl = process.env.APP_URL || "http://localhost:3000";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseTimes(times) {
  return (Array.isArray(times) ? times : [])
    .map((t) => String(t).trim())
    .filter((t) => /^\d{2}:\d{2}$/.test(t));
}

function minutesSinceMidnight(date) {
  return date.getHours() * 60 + date.getMinutes();
}

function hmToMinutes(hm) {
  const [h, m] = hm.split(":").map((v) => Number(v));
  return h * 60 + m;
}

async function readAutoSyncSettings() {
  const { data, error } = await supabase
    .from("site_settings")
    .select("metadata")
    .eq("id", 1)
    .maybeSingle();

  if (error) throw error;

  const metadata = data?.metadata ?? {};
  return metadata.auto_sync ?? {};
}

async function callWinsSync() {
  const token = process.env.H2H_WINS_SYNC_TOKEN;
  if (!token) throw new Error("Missing H2H_WINS_SYNC_TOKEN.");

  const res = await fetch(new URL("/api/wins/sync", appUrl), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`wins sync failed: ${res.status} ${text}`);
  }
}

async function callTimelineSync() {
  const token = process.env.H2H_TIMELINE_SYNC_TOKEN;
  if (!token) throw new Error("Missing H2H_TIMELINE_SYNC_TOKEN.");

  const res = await fetch(new URL("/api/timeline/sync", appUrl), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`timeline sync failed: ${res.status} ${text}`);
  }
}

async function callRealtimePoll() {
  const secret = process.env.H2H_CRON_SECRET;
  if (!secret) throw new Error("Missing H2H_CRON_SECRET.");

  const url = new URL("/api/realtime/poll", appUrl);
  const res = await fetch(url, { headers: { "x-cron-secret": secret } });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`realtime poll failed: ${res.status} ${text}`);
  }
}

let lastWinsKey = null;
let lastTimelineKey = null;
let lastRealtimeAt = 0;

console.log(`[auto-sync] worker started. APP_URL=${appUrl}`);

// Poll loop: check settings every 30s, run due tasks.
for (;;) {
  try {
    const settings = await readAutoSyncSettings();

    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);
    const nowMins = minutesSinceMidnight(now);

    const winsEnabled = Boolean(settings?.wins?.enabled);
    const winsTimes = parseTimes(settings?.wins?.times);
    if (winsEnabled && winsTimes.length > 0) {
      const shouldRun = winsTimes.some((hm) => Math.abs(nowMins - hmToMinutes(hm)) <= 0);
      const runKey = `${todayKey}:${winsTimes.join(",")}:${now.getHours()}:${now.getMinutes()}`;
      if (shouldRun && lastWinsKey !== runKey) {
        lastWinsKey = runKey;
        console.log(`[auto-sync] wins sync triggered at ${now.toISOString()}`);
        await callWinsSync();
        console.log(`[auto-sync] wins sync done`);
      }
    }

    const timelineEnabled = Boolean(settings?.timeline?.enabled);
    const timelineTime = String(settings?.timeline?.time ?? "").trim();
    if (timelineEnabled && /^\d{2}:\d{2}$/.test(timelineTime)) {
      const shouldRun = nowMins === hmToMinutes(timelineTime);
      const runKey = `${todayKey}:${timelineTime}`;
      if (shouldRun && lastTimelineKey !== runKey) {
        lastTimelineKey = runKey;
        console.log(`[auto-sync] timeline sync triggered at ${now.toISOString()}`);
        await callTimelineSync();
        console.log(`[auto-sync] timeline sync done`);
      }
    }

    const realtimeEnabled = Boolean(settings?.realtime?.enabled);
    const intervalMinutes = Number(settings?.realtime?.intervalMinutes ?? 60) || 60;
    if (realtimeEnabled) {
      const intervalMs = Math.max(5, intervalMinutes) * 60_000;
      if (Date.now() - lastRealtimeAt >= intervalMs) {
        lastRealtimeAt = Date.now();
        console.log(`[auto-sync] realtime poll triggered at ${now.toISOString()}`);
        await callRealtimePoll();
        console.log(`[auto-sync] realtime poll done`);
      }
    }
  } catch (err) {
    console.error("[auto-sync] error:", err?.message ?? err);
  }

  await sleep(30_000);
}
