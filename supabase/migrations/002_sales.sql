-- Migration 002: Sales tables
-- Populated by Square webhook → Supabase Edge Function (Sprint 3)

-- Sales (one row per Square order)
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- square_order_id UNIQUE guarantees idempotency:
  -- Edge Function returns 200 immediately if order already exists
  square_order_id TEXT UNIQUE NOT NULL,
  square_payment_id TEXT,
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  tax_amount DECIMAL(10,2) DEFAULT 0,
  tip_amount DECIMAL(10,2) DEFAULT 0,
  payment_method TEXT,                      -- 'card', 'cash', 'digital_wallet'
  -- location_label: free string for now, normalize to FK in Sprint 4
  -- when location table is created with lat/long
  location_label TEXT,
  square_location_id TEXT,                  -- Square location ID for filtering
  created_at TIMESTAMPTZ NOT NULL,          -- Square order creation time
  synced_at TIMESTAMPTZ DEFAULT NOW()       -- When we received/processed it
);

-- Sale items (line items within a sale)
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  -- product_id is NULLABLE: Square items not yet synced arrive with
  -- square_item_id but without a local match. The webhook doesn't fail —
  -- it saves the item and a periodic sync links them later.
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  square_item_id TEXT,                      -- fallback if product_id is NULL
  item_name TEXT NOT NULL,                  -- denormalized for reporting
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0)
);

-- Indexes for dashboard queries
CREATE INDEX IF NOT EXISTS sales_created_at_idx ON sales (created_at DESC);
CREATE INDEX IF NOT EXISTS sales_location_idx ON sales (location_label);
CREATE INDEX IF NOT EXISTS sale_items_sale_id_idx ON sale_items (sale_id);
CREATE INDEX IF NOT EXISTS sale_items_product_id_idx ON sale_items (product_id);

-- Row Level Security
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Only authenticated admins can read/write sales
CREATE POLICY "sales_admin_only" ON sales
  FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "sale_items_admin_only" ON sale_items
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Edge Function uses service_role key to bypass RLS for inserts
-- The service_role key is stored in Supabase Secrets, NEVER in Vercel

COMMENT ON TABLE sales IS
  'Square orders received via webhook. square_order_id UNIQUE ensures idempotency.';
COMMENT ON COLUMN sales.location_label IS
  'Free string for now. Normalize to FK in Sprint 4 before data volume grows.';
COMMENT ON COLUMN sale_items.product_id IS
  'Nullable: unrecognized Square items get stored without a product link.';
