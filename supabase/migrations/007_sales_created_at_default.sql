-- Migration 007: Add DEFAULT NOW() to sales.created_at as fallback
-- The Edge Function should still pass Square's order creation time.
-- This default only fires if the webhook doesn't include a timestamp,
-- preventing insert failures.

ALTER TABLE sales
  ALTER COLUMN created_at SET DEFAULT NOW();

COMMENT ON COLUMN sales.created_at IS
  'Square order creation time (from webhook payload).
   Falls back to NOW() if Square does not provide a timestamp.
   Edge Function should always pass square_order.created_at.';
