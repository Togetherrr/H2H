create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'general' check (type in ('comeback', 'company', 'event', 'general')),
  title_en text not null check (char_length(trim(title_en)) between 1 and 160),
  content_en text not null check (char_length(trim(content_en)) between 1 and 1000),
  link text,
  link_text_en text,
  published_at date not null default current_date,
  is_pinned boolean not null default false,
  is_active boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists notices_public_display_idx
  on public.notices (is_active, is_pinned desc, sort_order asc, published_at desc);

create unique index if not exists notices_single_active_pin_idx
  on public.notices (is_pinned)
  where is_active = true and is_pinned = true;

create or replace function public.enforce_notice_display_rules()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.is_pinned and not new.is_active then
    raise exception 'A pinned notice must be active.';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_notice_display_rules on public.notices;
create trigger enforce_notice_display_rules
  before insert or update on public.notices
  for each row execute procedure public.enforce_notice_display_rules();

drop trigger if exists set_notices_updated_at on public.notices;
create trigger set_notices_updated_at
  before update on public.notices
  for each row execute procedure public.set_current_timestamp_updated_at();

alter table public.notices enable row level security;

grant select on public.notices to anon, authenticated;
grant insert, update, delete on public.notices to authenticated;

drop policy if exists "public_read_active_notices" on public.notices;
create policy "public_read_active_notices"
  on public.notices for select
  using (is_active = true);

drop policy if exists "admins_manage_notices" on public.notices;
create policy "admins_manage_notices"
  on public.notices for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

insert into public.notices (
  id,
  type,
  title_en,
  content_en,
  published_at,
  is_pinned,
  is_active,
  sort_order
) values
  (
    '00000000-0000-4000-8000-000000000101',
    'comeback',
    'Hearts2Hearts 1st Mini Album ''REBIRTH'' Official Pre-order',
    'Official album pre-order is now available! Support the girls for their upcoming comeback. All sales count towards major music charts.',
    '2024-05-10',
    true,
    true,
    0
  ),
  (
    '00000000-0000-4000-8000-000000000102',
    'company',
    'Official Fanclub Recruitment Notice',
    'The recruitment for the 1st generation of S2U will begin next week. Stay tuned for details regarding membership benefits.',
    '2024-05-01',
    false,
    true,
    1
  ),
  (
    '00000000-0000-4000-8000-000000000103',
    'event',
    'Special Video Call Event',
    'A special video call event for ''REBIRTH'' buyers. 50 lucky winners will be selected.',
    '2024-05-05',
    false,
    true,
    2
  )
on conflict (id) do nothing;
