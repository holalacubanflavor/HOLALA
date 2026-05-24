-- Migration 005: Harden admin RLS policies
-- Replace auth.role() = 'authenticated' (any signed-up user)
-- with a check tied to the owner's email.
--
-- HOW TO USE:
--   1. Create a user in Supabase Dashboard → Authentication → Users
--      with the email you use for admin (e.g. digisenda@gmail.com)
--   2. Set ADMIN_EMAIL below to that email
--   3. Apply this migration via: supabase db push
--
-- Why not auth.role() = 'service_role'?
--   service_role bypasses RLS entirely (no policy needed).
--   This policy governs the anon/authenticated paths.

-- Helper function: is the current user the admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT auth.email() = current_setting('app.admin_email', true)
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Set the admin email at the database level
-- Run once after applying migration:
--   SELECT set_config('app.admin_email', 'digisenda@gmail.com', false);
-- Or set it as a Supabase db setting.

-- ── products ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "products_admin_write" ON products;
CREATE POLICY "products_admin_write" ON products
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── sales ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "sales_admin_only" ON sales;
CREATE POLICY "sales_admin_only" ON sales
  FOR ALL
  USING (is_admin());

DROP POLICY IF EXISTS "sale_items_admin_only" ON sale_items;
CREATE POLICY "sale_items_admin_only" ON sale_items
  FOR ALL
  USING (is_admin());

-- ── customers ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "customers_admin_only" ON customers;
CREATE POLICY "customers_admin_only" ON customers
  FOR ALL
  USING (is_admin());

-- ── catering_leads ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "catering_leads_admin_read" ON catering_leads;
CREATE POLICY "catering_leads_admin_read" ON catering_leads
  FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "catering_leads_admin_update" ON catering_leads;
CREATE POLICY "catering_leads_admin_update" ON catering_leads
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

COMMENT ON FUNCTION is_admin IS
  'Returns true if the current authenticated user is the HOLALA admin.
   Controlled by app.admin_email database setting.
   Edge Functions use service_role key which bypasses RLS entirely.';
