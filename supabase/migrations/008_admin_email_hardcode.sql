-- Migration 008: Hardcode admin email in is_admin() function
-- ALTER DATABASE SET requires superuser — not available via MCP SQL API.
-- For a single-owner business, embedding the email directly is cleaner.

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT auth.email() = 'digisenda@gmail.com'
$$ LANGUAGE sql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION is_admin IS
  'Returns true if the authenticated user is digisenda@gmail.com (HOLALA owner).
   To change admin: update this function or replace with JWT custom claims in Sprint 2.
   Edge Functions with service_role key bypass RLS entirely — no policy needed there.';
