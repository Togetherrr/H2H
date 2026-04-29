-- Thêm cột tính năng JSONB và cập nhật mảng chức vụ cho bảng members
ALTER TABLE public.members RENAME COLUMN position TO positions;
ALTER TABLE public.members ALTER COLUMN positions TYPE text[] USING array[positions];

-- Thêm cột metadata để lưu trữ các thông tin linh hoạt (emoji, mbti, fun_facts,...)
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Thêm cột metadata cho site_settings để lưu sns, dorms, mascot,...
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
