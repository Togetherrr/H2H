-- Full schema snapshot for bootstrapping a new Supabase project.
-- Keep this file in sync with the latest applied migrations.

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('user', 'admin');
  end if;
end $$;

create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  role public.app_role not null default 'user',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.site_settings (
  id integer primary key default 1,
  group_name text not null,
  company text,
  labels text,
  origin text,
  debut_date date,
  fandom_name text,
  official_color text,
  logo_url text,
  logo_note text,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint single_site_settings_row check (id = 1)
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  stage_name text not null,
  full_name text,
  birth_date date,
  nationality text,
  position text,
  profile_image_url text,
  cover_image_url text,
  intro text,
  intro_translations jsonb,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.releases (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  release_type text not null,
  release_date date not null,
  cover_url text,
  subtitle text,
  summary text,
  spotify_url text,
  youtube_url text,
  source_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  release_id uuid not null references public.releases (id) on delete cascade,
  track_number integer not null,
  title text not null,
  is_title_track boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  unique (release_id, track_number)
);

create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  event_type text not null,
  event_date date not null,
  cover_url text,
  summary text,
  source_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  label text not null,
  url text not null,
  note text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and role = 'admin'
  );
$$;

grant usage on schema public to anon, authenticated;
grant execute on function public.is_admin(uuid) to anon, authenticated;
grant select on public.site_settings to anon, authenticated;
grant select on public.members to anon, authenticated;
grant select on public.releases to anon, authenticated;
grant select on public.tracks to anon, authenticated;
grant select on public.timeline_events to anon, authenticated;
grant select on public.social_links to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant insert, update, delete on public.site_settings to authenticated;
grant insert, update, delete on public.members to authenticated;
grant insert, update, delete on public.releases to authenticated;
grant insert, update, delete on public.tracks to authenticated;
grant insert, update, delete on public.timeline_events to authenticated;
grant insert, update, delete on public.social_links to authenticated;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_current_timestamp_updated_at();

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at
  before update on public.site_settings
  for each row execute procedure public.set_current_timestamp_updated_at();

drop trigger if exists set_members_updated_at on public.members;
create trigger set_members_updated_at
  before update on public.members
  for each row execute procedure public.set_current_timestamp_updated_at();

drop trigger if exists set_releases_updated_at on public.releases;
create trigger set_releases_updated_at
  before update on public.releases
  for each row execute procedure public.set_current_timestamp_updated_at();

drop trigger if exists set_timeline_events_updated_at on public.timeline_events;
create trigger set_timeline_events_updated_at
  before update on public.timeline_events
  for each row execute procedure public.set_current_timestamp_updated_at();

drop trigger if exists set_social_links_updated_at on public.social_links;
create trigger set_social_links_updated_at
  before update on public.social_links
  for each row execute procedure public.set_current_timestamp_updated_at();

alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.members enable row level security;
alter table public.releases enable row level security;
alter table public.tracks enable row level security;
alter table public.timeline_events enable row level security;
alter table public.social_links enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin(auth.uid()))
  with check (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "admins_manage_profiles" on public.profiles;
create policy "admins_manage_profiles"
  on public.profiles for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "public_read_site_settings" on public.site_settings;
create policy "public_read_site_settings"
  on public.site_settings for select
  using (true);

drop policy if exists "admins_manage_site_settings" on public.site_settings;
create policy "admins_manage_site_settings"
  on public.site_settings for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "public_read_members" on public.members;
create policy "public_read_members"
  on public.members for select
  using (is_active = true);

drop policy if exists "admins_manage_members" on public.members;
create policy "admins_manage_members"
  on public.members for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "public_read_releases" on public.releases;
create policy "public_read_releases"
  on public.releases for select
  using (is_published = true);

drop policy if exists "admins_manage_releases" on public.releases;
create policy "admins_manage_releases"
  on public.releases for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "public_read_tracks" on public.tracks;
create policy "public_read_tracks"
  on public.tracks for select
  using (
    exists (
      select 1
      from public.releases
      where releases.id = tracks.release_id
        and releases.is_published = true
    )
  );

drop policy if exists "admins_manage_tracks" on public.tracks;
create policy "admins_manage_tracks"
  on public.tracks for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "public_read_timeline_events" on public.timeline_events;
create policy "public_read_timeline_events"
  on public.timeline_events for select
  using (is_published = true);

drop policy if exists "admins_manage_timeline_events" on public.timeline_events;
create policy "admins_manage_timeline_events"
  on public.timeline_events for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "public_read_social_links" on public.social_links;
create policy "public_read_social_links"
  on public.social_links for select
  using (is_active = true);

drop policy if exists "admins_manage_social_links" on public.social_links;
create policy "admins_manage_social_links"
  on public.social_links for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

insert into public.site_settings (
  id,
  group_name,
  company,
  labels,
  origin,
  debut_date,
  fandom_name,
  official_color,
  logo_url,
  logo_note,
  description
)
values (
  1,
  'Hearts2Hearts',
  'SM Entertainment',
  'SM Entertainment · EMI/Universal Japan',
  'Seoul, South Korea',
  '2025-02-24',
  'S2U',
  'Sky Blue',
  '/logo-official-removebg-.png',
  'Official logo asset shown for fan-reference only. All trademarks belong to their owners.',
  'Landing-page settings for the Hearts2Hearts fan information site.'
)
on conflict (id) do nothing;
