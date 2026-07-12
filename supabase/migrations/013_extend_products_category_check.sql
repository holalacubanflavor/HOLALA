-- Extend products.category CHECK constraint to match the taxonomy used by
-- Sanity (sanity/schema/menuItem.ts) and the site (components/menu/MenuGrid.tsx):
-- adds appetizers, tacos, sandwiches, seafood alongside the original 5.
ALTER TABLE public.products DROP CONSTRAINT products_category_check;
ALTER TABLE public.products ADD CONSTRAINT products_category_check
  CHECK (category = ANY (ARRAY['specials'::text, 'appetizers'::text, 'tacos'::text, 'sandwiches'::text, 'mains'::text, 'seafood'::text, 'sides'::text, 'desserts'::text, 'drinks'::text]));
