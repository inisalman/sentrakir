-- Migration: Create password_resets table for email-based password reset & registration confirmation

CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL DEFAULT 'reset', -- 'reset' | 'register'
  company_id UUID, -- for register confirmation, links to companies.id
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup by token
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);

-- Index for fast lookup by email
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);

-- Index for cleanup old tokens
CREATE INDEX IF NOT EXISTS idx_password_resets_expires ON password_resets(expires_at);

-- RLS: anyone can insert, only backend can read/update
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert password_reset" ON password_resets;
CREATE POLICY "Anyone can insert password_reset"
  ON password_resets FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read password_reset by token" ON password_resets;
CREATE POLICY "Anyone can read password_reset by token"
  ON password_resets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Backend updates used_at" ON password_resets;
CREATE POLICY "Backend updates used_at"
  ON password_resets FOR UPDATE USING (true);

COMMENT ON TABLE password_resets IS 'Stores password reset tokens and registration confirmation tokens';
