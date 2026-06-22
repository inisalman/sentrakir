-- Create payment approval history table for audit trail
CREATE TABLE IF NOT EXISTS payment_approval_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE RESTRICT,
    action TEXT NOT NULL CHECK (action IN ('approve', 'reject')),
    target_tier TEXT NOT NULL,
    payment_proof_path TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for faster queries by company
CREATE INDEX IF NOT EXISTS idx_payment_approval_history_company_id
    ON payment_approval_history(company_id);

-- Index for faster queries by admin
CREATE INDEX IF NOT EXISTS idx_payment_approval_history_admin_id
    ON payment_approval_history(admin_id);

-- Index for faster queries by date
CREATE INDEX IF NOT EXISTS idx_payment_approval_history_created_at
    ON payment_approval_history(created_at DESC);

-- Grant permissions
GRANT SELECT, INSERT ON payment_approval_history TO authenticated;
GRANT SELECT ON payment_approval_history TO anon;

-- Add RLS (Row Level Security) policies
ALTER TABLE payment_approval_history ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all records
CREATE POLICY "Admins can read payment approval history"
    ON payment_approval_history
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.auth_user_id = auth.uid() OR admins.id = auth.uid()
        )
    );

-- Allow admins to insert records
CREATE POLICY "Admins can insert payment approval history"
    ON payment_approval_history
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.auth_user_id = auth.uid() OR admins.id = auth.uid()
        )
    );

-- Comment
COMMENT ON TABLE payment_approval_history IS 'Audit trail untuk mencatat setiap approval/rejection pembayaran membership';
COMMENT ON COLUMN payment_approval_history.company_id IS 'ID perusahaan yang melakukan pembayaran';
COMMENT ON COLUMN payment_approval_history.admin_id IS 'ID admin yang melakukan approval/rejection';
COMMENT ON COLUMN payment_approval_history.action IS 'Action yang dilakukan: approve atau reject';
COMMENT ON COLUMN payment_approval_history.target_tier IS 'Paket membership yang diminta';
COMMENT ON COLUMN payment_approval_history.payment_proof_path IS 'Path bukti pembayaran saat action dilakukan';
COMMENT ON COLUMN payment_approval_history.notes IS 'Catatan dari admin (opsional)';
COMMENT ON COLUMN payment_approval_history.created_at IS 'Waktu action dilakukan';
