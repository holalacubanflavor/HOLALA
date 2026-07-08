-- Migration 012: Restore SET search_path on is_admin()
--
-- Migration 009 hardened is_admin() with SET search_path = public to stop a
-- SECURITY DEFINER search_path hijack. Migration 010 (email update) did a
-- CREATE OR REPLACE FUNCTION without that clause, silently reverting the
-- fix. Re-apply it here, keeping the current admin email and grants.

CREATE OR REPLACE FUNCTION public.is_admin()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT auth.email() = 'holalacubanflavor@gmail.com'
$$;

COMMENT ON FUNCTION public.is_admin IS
  'Returns true if the authenticated user is holalacubanflavor@gmail.com (HOLALA owner).
   To change admin: update this function. Edge Functions with service_role key bypass RLS entirely.';

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;
