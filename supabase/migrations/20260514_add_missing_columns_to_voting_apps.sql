-- Migration: Add missing columns to voting_apps table
-- This includes columns that were previously added manually via SQL Editor

ALTER TABLE voting_apps 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS reflection_rate TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ceremony_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Ghi chú: Sử dụng IF NOT EXISTS để tránh lỗi nếu bạn đã chạy lệnh này trực tiếp trong SQL Editor trước đó.
