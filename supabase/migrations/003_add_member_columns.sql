-- Add explicit columns to match hearts2hearts (2.0).json
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS short_name text,
  ADD COLUMN IF NOT EXISTS mascot text,
  ADD COLUMN IF NOT EXISTS official_greeting text,
  ADD COLUMN IF NOT EXISTS sns jsonb,
  ADD COLUMN IF NOT EXISTS dorms jsonb,
  ADD COLUMN IF NOT EXISTS source_url text;

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS stage_name_kr text,
  ADD COLUMN IF NOT EXISTS full_name_kr text,
  ADD COLUMN IF NOT EXISTS english_name text,
  ADD COLUMN IF NOT EXISTS zodiac text,
  ADD COLUMN IF NOT EXISTS birthplace text,
  ADD COLUMN IF NOT EXISTS height_cm integer,
  ADD COLUMN IF NOT EXISTS blood_type text,
  ADD COLUMN IF NOT EXISTS mbti text,
  ADD COLUMN IF NOT EXISTS emoji text,
  ADD COLUMN IF NOT EXISTS training_years numeric,
  ADD COLUMN IF NOT EXISTS nicknames text[],
  ADD COLUMN IF NOT EXISTS hakyuha_character text,
  ADD COLUMN IF NOT EXISTS role_model text,
  ADD COLUMN IF NOT EXISTS bio_short text,
  ADD COLUMN IF NOT EXISTS bio_short_en text,
  ADD COLUMN IF NOT EXISTS favorites jsonb,
  ADD COLUMN IF NOT EXISTS fun_facts_vi text[],
  ADD COLUMN IF NOT EXISTS fun_facts_en text[],
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS card jsonb,
  ADD COLUMN IF NOT EXISTS detail jsonb;
