-- Run this SQL in your Supabase Dashboard (SQL Editor)

CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    url TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Uncategorized',
    size INTEGER,
    type TEXT,
    delete_url TEXT
);

-- Enable RLS (Row Level Security) if needed
-- ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage media
-- CREATE POLICY "Admins can manage media" ON public.media_assets
-- FOR ALL USING (auth.role() = 'authenticated');
