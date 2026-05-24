-- Migration 001: Products table
-- Synchronized with Square catalog via /admin/menu sync button (Sprint 2)

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  square_catalog_id TEXT UNIQUE,            -- Square catalog item ID for sync
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_es TEXT,
  description_en TEXT,
  category TEXT NOT NULL CHECK (
    category IN ('mains', 'sides', 'drinks', 'desserts', 'specials')
  ),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  -- food_cost is DERIVED — calculated by compute_food_cost() function
  -- when recipes or ingredient costs change. NOT editable directly.
  food_cost DECIMAL(10,2) CHECK (food_cost >= 0),
  -- margin = (price - food_cost) / price * 100
  -- Computed column, not stored (calculated in queries)
  is_active BOOLEAN DEFAULT true NOT NULL,
  is_vegetarian BOOLEAN DEFAULT false NOT NULL,
  is_popular BOOLEAN DEFAULT false NOT NULL,
  image_url TEXT,                            -- Sanity image URL or Square image
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for category filtering (menu page)
CREATE INDEX IF NOT EXISTS products_category_idx ON products (category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS products_square_idx ON products (square_catalog_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public can read active products (menu display)
CREATE POLICY "products_public_read" ON products
  FOR SELECT
  USING (is_active = true);

-- Only authenticated admins can write
CREATE POLICY "products_admin_write" ON products
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

COMMENT ON TABLE products IS
  'HOLALA menu items — synced with Square catalog. food_cost is computed, not manually entered.';
