-- Realtime-ish snapshots for Hearts2Hearts Spotify/YouTube totals (5-minute polling).
-- Supports rolling-window deltas (e.g. 24h rolling) by comparing snapshots.

create table if not exists public.h2h_items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('spotify_track', 'youtube_video')),
  platform_id text not null,
  title text not null default '',
  cover_url text,
  release_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (type, platform_id)
);

create index if not exists h2h_items_type_active_idx on public.h2h_items (type, is_active);

create table if not exists public.h2h_item_snapshots (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.h2h_items(id) on delete cascade,
  ts timestamptz not null,
  total bigint not null check (total >= 0),
  created_at timestamptz not null default now(),
  unique (item_id, ts)
);

create index if not exists h2h_item_snapshots_item_ts_desc_idx on public.h2h_item_snapshots (item_id, ts desc);
create index if not exists h2h_item_snapshots_ts_desc_idx on public.h2h_item_snapshots (ts desc);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists h2h_items_set_updated_at on public.h2h_items;
create trigger h2h_items_set_updated_at
before update on public.h2h_items
for each row
execute procedure public.set_updated_at();

-- RLS: public read, server-only writes via service role.
alter table public.h2h_items enable row level security;
alter table public.h2h_item_snapshots enable row level security;

grant select on public.h2h_items to anon, authenticated;
grant select on public.h2h_item_snapshots to anon, authenticated;

-- Allow the server-side poller to write using the service role key.
grant select on public.h2h_items to service_role;
grant select on public.h2h_item_snapshots to service_role;
grant insert, update, delete on public.h2h_items to service_role;
grant insert, update, delete on public.h2h_item_snapshots to service_role;

drop policy if exists "Public read h2h_items" on public.h2h_items;
create policy "Public read h2h_items"
on public.h2h_items
for select
to anon, authenticated
using (true);

drop policy if exists "Public read h2h_item_snapshots" on public.h2h_item_snapshots;
create policy "Public read h2h_item_snapshots"
on public.h2h_item_snapshots
for select
to anon, authenticated
using (true);

-- No insert/update/delete policies on purpose.
-- Writes must go through server code using SUPABASE_SERVICE_ROLE_KEY (bypasses RLS).
