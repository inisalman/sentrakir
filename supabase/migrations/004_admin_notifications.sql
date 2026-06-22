-- Migration: admin_notifications table for real-time notification system
-- Triggered by: new requests, membership upgrades, AI chat, vehicle expiry reminders

CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('request_new', 'membership_request', 'ai_chat', 'vehicle_expiry')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  reference_id TEXT,
  reference_type TEXT CHECK (reference_type IN ('request', 'company', 'vehicle', 'chat')),
  is_read BOOLEAN DEFAULT FALSE,
  meta_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk query per admin + unread
CREATE INDEX IF NOT EXISTS idx_notifications_admin_unread ON admin_notifications(admin_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON admin_notifications(created_at DESC);

-- Enable realtime for live push notifications (safe handling if already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'admin_notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE admin_notifications;
  END IF;
END $$;

-- RLS (optional — skip jika pakai service role key dari frontend)
-- ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Admins read own" ON admin_notifications FOR SELECT USING (admin_id = current_setting('request.jwt.claim.sub', true));
