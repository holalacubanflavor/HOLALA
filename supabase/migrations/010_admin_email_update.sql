-- Migration 010: Update admin email from digisenda@gmail.com to holalacubanflavor@gmail.com
-- Project fully migrated to client account in session 11.

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT auth.email() = 'holalacubanflavor@gmail.com'
$$ LANGUAGE sql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION is_admin IS
  'Returns true if the authenticated user is holalacubanflavor@gmail.com (HOLALA owner).
   To change admin: update this function. Edge Functions with service_role key bypass RLS entirely.';
