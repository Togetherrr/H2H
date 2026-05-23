-- ============================================================
-- Migration: 2026051701_award_event_apps_ext
-- Thêm fields per-event-per-app:
--   - guide_url: link guide riêng cho event trên app đó (ưu tiên hơn voting_apps.guide_url)
--   - award_name: tên award/event theo naming trong app (optional)
--   - awards: danh sách các hạng mục/giải mà app này có thể vote cho event này (có thể khác nhau theo app)
-- Chạy file này trong Supabase SQL Editor
-- ============================================================

ALTER TABLE public.award_event_apps
  ADD COLUMN IF NOT EXISTS guide_url text,
  ADD COLUMN IF NOT EXISTS award_name text,
  ADD COLUMN IF NOT EXISTS awards jsonb NOT NULL DEFAULT '[]'::jsonb;
