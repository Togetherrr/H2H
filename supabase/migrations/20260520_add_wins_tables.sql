-- ============================================================
-- Migration: 20260520_add_wins_tables
-- Thêm bảng: music_show_wins, award_ceremony_wins
-- Chạy file này trong Supabase SQL Editor
-- ============================================================

-- 1. Bảng music_show_wins — lưu cúp show âm nhạc hàng tuần
CREATE TABLE IF NOT EXISTS public.music_show_wins (
  id          text          PRIMARY KEY,
  date        date          NOT NULL,
  song        text          NOT NULL,
  program     text          NOT NULL,
  headline    text          NOT NULL,
  href        text,
  created_at  timestamptz   NOT NULL DEFAULT now()
);

-- 2. Bảng award_ceremony_wins — lưu giải thưởng cúp lễ trao giải
CREATE TABLE IF NOT EXISTS public.award_ceremony_wins (
  id          text          PRIMARY KEY,
  ceremony    text          NOT NULL,
  year        text          NOT NULL,
  category    text          NOT NULL,
  href        text,
  created_at  timestamptz   NOT NULL DEFAULT now()
);

-- 3. Bật RLS
ALTER TABLE public.music_show_wins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.award_ceremony_wins ENABLE ROW LEVEL SECURITY;

-- 4. Tạo Policy cho phép SELECT công khai cho tất cả mọi người
CREATE POLICY "Allow public read access on music_show_wins" ON public.music_show_wins
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public read access on award_ceremony_wins" ON public.award_ceremony_wins
  FOR SELECT TO anon, authenticated USING (true);

-- 5. Cho phép service_role toàn quyền (Insert, Update, Delete) để Sync hoạt động
CREATE POLICY "Allow service_role full access on music_show_wins" ON public.music_show_wins
  AS permissive FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow service_role full access on award_ceremony_wins" ON public.award_ceremony_wins
  AS permissive FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6. Cấp quyền cho service_role và các role công khai
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.music_show_wins TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.award_ceremony_wins TO service_role;
GRANT SELECT ON TABLE public.music_show_wins TO anon, authenticated;
GRANT SELECT ON TABLE public.award_ceremony_wins TO anon, authenticated;
