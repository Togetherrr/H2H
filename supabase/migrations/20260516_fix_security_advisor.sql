-- =============================================================================
-- Migration: 20260516_fix_security_advisor.sql
-- Mục đích: Fix toàn bộ Supabase Security Advisor errors & warnings
-- An toàn: Không thay đổi logic, chỉ tăng cường bảo mật
-- =============================================================================


-- ===== [ERROR 1 & 2] RLS Disabled: voting_apps =====
-- voting_apps đã có policy từ migration 20260510 nhưng RLS có thể chưa được
-- enable trên Supabase thực tế. Dùng IF để tránh lỗi nếu đã enable rồi.
ALTER TABLE public.voting_apps ENABLE ROW LEVEL SECURITY;


-- ===== [ERROR 3] RLS Disabled: media_assets =====
-- media_assets chỉ được dùng trong admin panel (requireAdmin() bắt buộc).
-- Không ai ngoài admin được phép đọc/ghi bảng này.
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- Policy: Chỉ admin được SELECT (đọc)
DROP POLICY IF EXISTS "admins_select_media_assets" ON public.media_assets;
CREATE POLICY "admins_select_media_assets"
  ON public.media_assets
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Policy: Chỉ admin được INSERT (thêm)
DROP POLICY IF EXISTS "admins_insert_media_assets" ON public.media_assets;
CREATE POLICY "admins_insert_media_assets"
  ON public.media_assets
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- Policy: Chỉ admin được UPDATE (sửa)
DROP POLICY IF EXISTS "admins_update_media_assets" ON public.media_assets;
CREATE POLICY "admins_update_media_assets"
  ON public.media_assets
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Policy: Chỉ admin được DELETE (xóa)
DROP POLICY IF EXISTS "admins_delete_media_assets" ON public.media_assets;
CREATE POLICY "admins_delete_media_assets"
  ON public.media_assets
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));


-- ===== [WARNING 1] Function Search Path Mutable: set_updated_at =====
-- Thêm SET search_path = public để chặn schema poisoning attack.
-- Logic hoàn toàn giống cũ, chỉ thêm dòng security.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- ===== [WARNING 2] Function Search Path Mutable: set_current_timestamp_updated_at =====
-- Tương tự, thêm SET search_path = public.
-- Logic hoàn toàn giống cũ.
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;


-- ===== [WARNING 3 & 4] RLS Policy Always True: h2h_items, h2h_item_snapshots =====
-- Đây là WARNING, không phải lỗi. USING (true) là đúng vì:
-- - Data này là public read-only (Spotify/YouTube stats)
-- - Service role bypass RLS để write (không cần policy write)
-- Không cần thay đổi gì. Ghi chú để rõ ràng:
-- "Public read h2h_items" và "Public read h2h_item_snapshots" là intentional.


-- ===== [WARNING 5, 6, 7] Public Can Execute SECURITY DEFINER Function =====
-- rls_auto_enable() không được dùng ở bất kỳ đâu trong codebase.
-- Revoke khỏi public/anon để an toàn.
-- Giữ lại cho authenticated vì admin có thể cần.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'rls_auto_enable'
  ) THEN
    REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
    REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;
  END IF;
END $$;

-- handle_new_user() chỉ được gọi bởi trigger (auth.users INSERT),
-- không cần anon/public gọi trực tiếp.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;

-- is_admin() được grant cho anon trong 001_init.sql (dòng 167).
-- Giữ lại grant này vì RLS policies của các bảng khác dùng is_admin(auth.uid()).
-- Chỉ revoke khỏi PUBLIC (role mặc định không xác định), giữ anon + authenticated.
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
-- Đảm bảo anon và authenticated vẫn có quyền (cần cho RLS policies):
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon, authenticated;


-- ===== [WARNING: Leaked Password Protection] =====
-- Không thể fix qua SQL — phải làm thủ công:
-- Vào Dashboard → Authentication → Settings → Password
-- → Bật "Enable leaked password protection"
-- (Đây là tính năng Supabase Auth, không có SQL tương ứng)


-- =============================================================================
-- PHẦN 2: Fix các Warnings còn lại
-- =============================================================================


-- ===== [WARNING] Public/Signed-In Can Execute SECURITY DEFINER: set_updated_at =====
-- Đây là trigger function — chỉ PostgreSQL trigger system được gọi, không phải user.
-- Trigger execution KHÔNG cần EXECUTE privilege → REVOKE hoàn toàn an toàn.
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM authenticated;


-- ===== [WARNING] Public/Signed-In Can Execute SECURITY DEFINER: set_current_timestamp_updated_at =====
-- Tương tự, trigger function thuần túy → REVOKE an toàn.
REVOKE EXECUTE ON FUNCTION public.set_current_timestamp_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_current_timestamp_updated_at() FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_current_timestamp_updated_at() FROM authenticated;


-- ===== [WARNING] Signed-In Can Execute SECURITY DEFINER: rls_auto_enable =====
-- Không dùng trong codebase, revoke khỏi authenticated luôn.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'rls_auto_enable'
  ) THEN
    REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated;
  END IF;
END $$;


-- =============================================================================
-- WARNINGS KHÔNG THỂ FIX (intentional / cần cho logic):
-- =============================================================================
--
-- [1] RLS Policy Always True - h2h_items, h2h_item_snapshots, voting_apps:
--     USING (true) là đúng vì đây là bảng public read-only.
--     Service role bypass RLS để write — không cần policy write.
--     Đây là thiết kế có chủ ý, không thể thay đổi.
--
-- [2] Public/Signed-In Can Execute is_admin(uuid):
--     KHÔNG THỂ REVOKE — toàn bộ RLS policies trên các bảng (members, releases,
--     social_links, profiles, v.v.) đang dùng public.is_admin(auth.uid())
--     bên trong USING clause. Nếu revoke, tất cả RLS sẽ fail → dữ liệu
--     hoặc bị block hoàn toàn hoặc không được bảo vệ đúng cách.
--
-- [3] Leaked Password Protection:
--     Vào Dashboard → Authentication → Settings → Bật thủ công.
-- =============================================================================

