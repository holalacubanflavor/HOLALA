-- Migration 006: Add UNIQUE constraint to customers.email
-- Without this, Square sync + catering form merging creates duplicate records.
-- Must be applied BEFORE Sprint 4 starts importing customer data.
--
-- Note: If you already have duplicate emails in the table (unlikely this early),
-- resolve them manually first:
--   SELECT email, count(*) FROM customers GROUP BY email HAVING count(*) > 1;

ALTER TABLE customers
  ADD CONSTRAINT customers_email_unique UNIQUE (email);

-- Drop the old non-unique index (now redundant — UNIQUE implies an index)
DROP INDEX IF EXISTS customers_email_idx;

COMMENT ON COLUMN customers.email IS
  'Unique customer email. Square sync and catering form submissions
   upsert on this column to avoid duplicates.';
