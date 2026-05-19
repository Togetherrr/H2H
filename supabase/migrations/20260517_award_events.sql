-- ============================================================
-- Migration: 20260517_award_events
-- Thêm: guide_url, award_events, award_event_apps, event_id on rounds
-- Chạy file này trong Supabase SQL Editor
-- ============================================================

-- 1. Thêm guide_url vào voting_apps
--    Nếu app có guide_url → mở link ngoài thay vì show modal step-by-step
ALTER TABLE voting_apps
  ADD COLUMN IF NOT EXISTS guide_url text;

-- 2. Bảng award_events — mỗi row = 1 giải thưởng (KM Chart Awards 2026)
CREATE TABLE IF NOT EXISTS award_events (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text          NOT NULL,
  nominations     jsonb         NOT NULL DEFAULT '[]'::jsonb,
  ceremony_at     timestamptz,
  reflection_rate jsonb         NOT NULL DEFAULT '[]'::jsonb,
  is_active       boolean       NOT NULL DEFAULT true,
  sort_order      integer       NOT NULL DEFAULT 0,
  created_at      timestamptz   NOT NULL DEFAULT now()
);

-- 3. Junction: 1 event có nhiều app (UPICK, My1Pick, IdolChamp...)
CREATE TABLE IF NOT EXISTS award_event_apps (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    uuid    NOT NULL REFERENCES award_events(id)  ON DELETE CASCADE,
  app_id      uuid    NOT NULL REFERENCES voting_apps(id)   ON DELETE CASCADE,
  description text,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, app_id)
);

-- 4. Thêm event_id vào voting_rounds
--    Round giờ thuộc về 1 event + 1 app cụ thể
ALTER TABLE voting_rounds
  ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES award_events(id) ON DELETE SET NULL;

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_award_event_apps_event ON award_event_apps(event_id);
CREATE INDEX IF NOT EXISTS idx_award_event_apps_app   ON award_event_apps(app_id);
CREATE INDEX IF NOT EXISTS idx_voting_rounds_event    ON voting_rounds(event_id);
CREATE INDEX IF NOT EXISTS idx_voting_rounds_event_app ON voting_rounds(event_id, app_id);

-- 6. RLS
ALTER TABLE award_events     ENABLE ROW LEVEL SECURITY;
ALTER TABLE award_event_apps ENABLE ROW LEVEL SECURITY;

-- 7. Public read
CREATE POLICY "enable read access for all users" ON award_events
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "enable read access for all users" ON award_event_apps
  FOR SELECT TO anon, authenticated USING (true);

-- 8. Service role write
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.award_events     TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.award_event_apps TO service_role;

CREATE POLICY "service_role full access award_events"
  ON public.award_events AS permissive FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "service_role full access award_event_apps"
  ON public.award_event_apps AS permissive FOR ALL TO service_role
  USING (true) WITH CHECK (true);
