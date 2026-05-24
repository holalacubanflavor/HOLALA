-- Migration 004: Catering leads pipeline
-- Receives data from /api/catering (web form) immediately in Sprint 1

CREATE TABLE IF NOT EXISTS catering_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Event details
  event_type TEXT NOT NULL CHECK (
    event_type IN ('birthday', 'corporate', 'wedding', 'quinces', 'graduation', 'other')
  ),
  event_date DATE NOT NULL,
  guest_count INT NOT NULL CHECK (guest_count > 0),
  -- Contact
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  -- Quote details
  budget_range TEXT NOT NULL CHECK (
    budget_range IN ('under_500', '500_1000', '1000_2500', '2500_5000', 'over_5000')
  ),
  notes TEXT,
  -- Pipeline status (managed in /admin/catering)
  status TEXT NOT NULL DEFAULT 'new' CHECK (
    status IN ('new', 'contacted', 'quoted', 'confirmed', 'completed', 'lost')
  ),
  -- Quote amount (filled in by admin when quoted)
  quoted_amount DECIMAL(10,2),
  -- Internal notes by admin
  admin_notes TEXT,
  -- Optional: link to customer record if they become repeat client
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  -- Source
  locale TEXT DEFAULT 'es',                 -- which language the form was submitted in
  source TEXT DEFAULT 'web_form',           -- 'web_form', 'phone', 'instagram', 'referral'
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS catering_leads_status_idx ON catering_leads (status);
CREATE INDEX IF NOT EXISTS catering_leads_event_date_idx ON catering_leads (event_date);
CREATE INDEX IF NOT EXISTS catering_leads_created_at_idx ON catering_leads (created_at DESC);

CREATE TRIGGER catering_leads_updated_at
  BEFORE UPDATE ON catering_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE catering_leads ENABLE ROW LEVEL SECURITY;

-- Public can INSERT (form submissions) but NOT read
CREATE POLICY "catering_leads_public_insert" ON catering_leads
  FOR INSERT
  WITH CHECK (true);

-- Only authenticated admins can read and update
CREATE POLICY "catering_leads_admin_read" ON catering_leads
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "catering_leads_admin_update" ON catering_leads
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

COMMENT ON TABLE catering_leads IS
  'Catering inquiries from web form. Public INSERT, admin-only read. Pipeline managed in /admin/catering.';
COMMENT ON COLUMN catering_leads.status IS
  'Pipeline stages: new → contacted → quoted → confirmed → completed | lost';
