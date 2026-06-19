-- Create chat_messages table for storing all chat interactions
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR(255) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sender VARCHAR(20) NOT NULL CHECK (sender IN ('client', 'admin', 'ai')),
  response TEXT,
  faq_id VARCHAR(255),
  admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes untuk query performance
CREATE INDEX IF NOT EXISTS idx_chat_company_id ON chat_messages(company_id);
CREATE INDEX IF NOT EXISTS idx_chat_sender ON chat_messages(sender);
CREATE INDEX IF NOT EXISTS idx_chat_is_resolved ON chat_messages(is_resolved);
CREATE INDEX IF NOT EXISTS idx_chat_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_company_resolved ON chat_messages(company_id, is_resolved);

-- Function untuk auto-cleanup old messages
CREATE OR REPLACE FUNCTION delete_old_chat_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM chat_messages
  WHERE created_at < NOW() - INTERVAL '30 days'
  AND is_resolved = true;
END;
$$ LANGUAGE plpgsql;
