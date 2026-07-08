-- Migration 011: Revoke direct EXECUTE on rls_auto_enable()
--
-- rls_auto_enable() is an event-trigger function (fires on CREATE TABLE to
-- auto-enable RLS on new tables). It has no legitimate use as a directly
-- callable RPC, but PostgREST exposes every public-schema function by
-- default, so anon and authenticated could call it via
-- /rest/v1/rpc/rls_auto_enable. Flagged by Supabase security advisor.

REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated;
