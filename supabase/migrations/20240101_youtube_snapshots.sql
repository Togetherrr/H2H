-- YouTube view count snapshots for daily change calculation
create table if not exists youtube_snapshots (
  id          bigserial primary key,
  video_id    text        not null,
  view_count  bigint      not null,
  recorded_at timestamptz not null default now()
);

-- Index for fast lookups by video + time
create index if not exists youtube_snapshots_video_time
  on youtube_snapshots (video_id, recorded_at desc);

-- Auto-delete snapshots older than 7 days (optional, keeps table small)
-- You can run this manually or set up pg_cron if available
-- delete from youtube_snapshots where recorded_at < now() - interval '7 days';