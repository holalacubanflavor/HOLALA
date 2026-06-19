-- Migration 009: Security hardening on is_admin() and update_updated_at_column()
--
-- Applied directly to the database on 2026-05-27 (never committed as a file
-- until now). Recovered verbatim from supabase_migrations.schema_migrations
-- on the original project (oifwxosgmftdplmejhgq) so the migration history
-- in this repo matches what actually ran in production.

-- ============================================================
-- FIX 1: is_admin() — añadir SET search_path + revocar anon
-- ============================================================
-- Sin search_path fijo, un atacante podría crear objetos en un
-- schema que preceda a "public" en el search_path y hacer que
-- la función SECURITY DEFINER ejecute código malicioso.
CREATE OR REPLACE FUNCTION public.is_admin()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT auth.email() = 'digisenda@gmail.com'
$$;

-- El rol anon no necesita llamar is_admin() — solo usuarios
-- autenticados deberían poder invocarla.
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;

-- ============================================================
-- FIX 2: update_updated_at_column() — añadir SET search_path
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================
-- FIX 3: revoke_public_execute_on_is_admin
-- ============================================================
-- El grant "=X/postgres" (PUBLIC) permite que cualquiera,
-- incluyendo anon, ejecute is_admin() vía /rest/v1/rpc/is_admin.
-- Revocamos PUBLIC y dejamos sólo authenticated + service_role.

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;

-- Re-garantizar explícitamente a los roles que sí lo necesitan
-- (authenticated lo necesita para políticas RLS de admin)
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;
