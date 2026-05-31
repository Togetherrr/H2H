-- Cached Spotify / YouTube social stats refreshed by cron.
-- Keeps public UI reads cheap and avoids live API calls on every request.

create table if not exists public.h2h_social_stats_snapshots (
  platform text primary key check (platform in ('spotify', 'youtube')),
  followers bigint,
  monthly_listeners bigint,
  subscribers bigint,
  video_count bigint,
  source text not null default '',
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists h2h_social_stats_snapshots_fetched_at_idx
  on public.h2h_social_stats_snapshots (fetched_at desc);

drop trigger if exists h2h_social_stats_snapshots_set_updated_at on public.h2h_social_stats_snapshots;
create trigger h2h_social_stats_snapshots_set_updated_at
before update on public.h2h_social_stats_snapshots
for each row
execute procedure public.set_updated_at();

alter table public.h2h_social_stats_snapshots enable row level security;

grant select on public.h2h_social_stats_snapshots to anon, authenticated;
grant select on public.h2h_social_stats_snapshots to service_role;
grant insert, update, delete on public.h2h_social_stats_snapshots to service_role;

drop policy if exists "Public read h2h_social_stats_snapshots" on public.h2h_social_stats_snapshots;
create policy "Public read h2h_social_stats_snapshots"
on public.h2h_social_stats_snapshots
for select
to anon, authenticated
using (true);

-- Writes must use the service role from server-side cron / API routes.
