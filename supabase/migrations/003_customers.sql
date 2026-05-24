-- Migration 003: Customers (CRM data)
-- Built from Square customer data + catering form submissions
-- Sprint 4+ feature — table created now to avoid schema debt

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  square_customer_id TEXT UNIQUE,           -- Square customer ID for linking
  -- Contact info
  name TEXT,
  email TEXT,
  phone TEXT,
  -- Behavioral metrics (computed/updated by functions in Sprint 4)
  total_visits INT DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  first_visit_at TIMESTAMPTZ,
  last_visit_at TIMESTAMPTZ,
  -- Segmentation tags
  tags TEXT[] DEFAULT '{}',                 -- e.g. ['catering', 'regular', 'vip']
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS customers_email_idx ON customers (email);
CREATE INDEX IF NOT EXISTS customers_square_id_idx ON customers (square_customer_id);
CREATE INDEX IF NOT EXISTS customers_last_visit_idx ON customers (last_visit_at DESC);

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Customers are private business data — admin only
CREATE POLICY "customers_admin_only" ON customers
  FOR ALL
  USING (auth.role() = 'authenticated');

COMMENT ON TABLE customers IS
  'CRM — built from Square data + catering submissions. Sprint 4+ enrichment.';
