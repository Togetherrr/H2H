-- Remove legacy manual YouTube seed field.
-- Realtime values now come from YouTube API + Kworb snapshots.

alter table if exists public.h2h_items
  drop column if exists initial_views;
