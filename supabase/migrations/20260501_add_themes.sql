-- Create Themes table
create table if not exists public.themes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Ensure only one active theme is allowed at a time
create unique index if not exists only_one_active_theme 
on public.themes (is_active) 
where (is_active = true);

-- Add trigger for updated_at
drop trigger if exists set_themes_updated_at on public.themes;
create trigger set_themes_updated_at
  before update on public.themes
  for each row execute procedure public.set_current_timestamp_updated_at();

-- Enable Row Level Security
alter table public.themes enable row level security;

-- Admin can manage all themes
create policy "admins_manage_themes"
  on public.themes for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Public can read active theme
create policy "public_read_active_theme"
  on public.themes for select
  using (is_active = true);

-- Grant permissions
grant select on public.themes to anon, authenticated;
grant insert, update, delete on public.themes to authenticated;

-- Insert the default "Sky Blue Premium" theme
insert into public.themes (name, is_active, config)
values (
  'Sky Blue Premium',
  true,
  '{
    "colors": {
      "primary": "206 78% 60%",
      "secondary": "206 100% 97%",
      "background": "206 100% 99%",
      "accent": "341 100% 71%"
    },
    "assets": {
      "logo": "/logo-official-removebg-.png",
      "background_image": null
    },
    "effects": {
      "film_grain": true,
      "glow_orbs": true,
      "floating_hearts": true
    }
  }'::jsonb
)
on conflict (name) do nothing;
