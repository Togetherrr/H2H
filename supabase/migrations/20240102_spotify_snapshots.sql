-- Spotify daily stream snapshots for dailyChange calculation
create table if not exists spotify_snapshots (
  id             bigserial primary key,
  track_id       text      not null,
  daily_streams  bigint    not null,
  total_streams  bigint    not null,
  recorded_at    timestamptz not null default now()
);

create index if not exists spotify_snapshots_track_time
  on spotify_snapshots (track_id, recorded_at desc);