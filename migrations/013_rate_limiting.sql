-- Migration: Rate limiting helper for Edge Functions
--
-- Tracks request counts per identifier (IP, user ID) in a sliding window.
-- CREATE EXTENSION IF NOT EXISTS pgcrypto; -- already enabled in 012

CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier TEXT,
  p_max_requests INTEGER DEFAULT 30,
  p_window_seconds INTEGER DEFAULT 60
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_current_count INTEGER;
  v_window_start TIMESTAMPTZ;
BEGIN
  v_window_start := now() - (p_window_seconds || ' seconds')::INTERVAL;

  -- Clean old entries
  DELETE FROM rate_limits WHERE created_at < v_window_start;

  -- Get current count
  SELECT COUNT(*) INTO v_current_count
  FROM rate_limits
  WHERE identifier = p_identifier
    AND created_at > v_window_start;

  IF v_current_count >= p_max_requests THEN
    RETURN jsonb_build_object('allowed', false, 'remaining', 0, 'reset_after', p_window_seconds);
  END IF;

  -- Log this request
  INSERT INTO rate_limits (identifier, created_at) VALUES (p_identifier, now());

  RETURN jsonb_build_object(
    'allowed', true,
    'remaining', p_max_requests - v_current_count - 1,
    'limit', p_max_requests
  );
END;
$$;

-- Create rate_limits table
CREATE TABLE IF NOT EXISTS rate_limits (
  id BIGSERIAL PRIMARY KEY,
  identifier TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast cleanup/queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_created_at ON rate_limits(created_at);

-- Auto-clean old entries (older than 1 hour)
CREATE INDEX IF NOT EXISTS idx_rate_limits_cleanup ON rate_limits(created_at) WHERE created_at < now() - INTERVAL '1 hour';

-- Grant execution
GRANT EXECUTE ON FUNCTION check_rate_limit TO anon, authenticated;
