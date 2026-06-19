-- Migration: Add last_active column to companies table
-- Track when clients were last active on the portal

-- Add the column
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS last_active timestamptz DEFAULT now();

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_companies_last_active ON companies(last_active);

-- Add comment
COMMENT ON COLUMN companies.last_active IS 'Timestamp of clients last activity on the portal';

-- Grant RLS read access (already set in earlier migrations, but ensure it)
-- Note: last_active should be readable by admins for monitoring
