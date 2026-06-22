import { supabase } from './supabaseClient';

// Get company by auth_user_id — excludes password field
export const getCompanyByAuthUserId = async (authUserId) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        id, name, pic_name, pic_phone, email, address,
        membership_tier, membership_price,
        subscription_status, status,
        admin_id, payment_proof_path,
        last_active, created_at
      `)
      .eq('auth_user_id', authUserId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching company by auth_user_id:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
};

// Get company by email — excludes password field from response
export const getCompanyByEmail = async (email) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        id, name, pic_name, pic_phone, email, address,
        membership_tier, membership_price,
        subscription_status, status,
        admin_id, payment_proof_path,
        last_active, created_at
      `)
      .ilike('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      console.error('Error fetching company by email:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
};


// Create new company — returns the created company object directly (or null on error)
export const createCompany = async (companyData) => {
  try {
    // Jika id dikirim, pakai itu (misal dari google auth), jika tidak hapus id agar auto-generate
    const payload = { ...companyData };
    if (!payload.id) {
      delete payload.id;
    }

    const { data, error } = await supabase
      .from('companies')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Error creating company:', error.message);
      return null;
    }

    return data; // langsung return object company
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
};

// Security: Whitelist fields yang boleh diupdate oleh client
const CLIENT_UPDATABLE_FIELDS = [
  'pic_name',
  'pic_phone',
  'address',
  'payment_proof_path', // untuk upload bukti pembayaran
  'name', // nama perusahaan
];

// Update company fields by ID (with security validation)
export const updateCompany = async (companyId, fields) => {
  try {
    // Security: Filter hanya field yang aman untuk diupdate
    const safeFields = {};
    Object.keys(fields).forEach(key => {
      if (CLIENT_UPDATABLE_FIELDS.includes(key)) {
        safeFields[key] = fields[key];
      } else {
        console.warn(`[SECURITY] Blocked update to restricted field: ${key}`);
      }
    });

    // Jangan update jika tidak ada field yang valid
    if (Object.keys(safeFields).length === 0) {
      console.warn('[SECURITY] No valid fields to update');
      return null;
    }

    const { data, error } = await supabase
      .from('companies')
      .update(safeFields)
      .eq('id', companyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating company:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
};

// Admin-only: Update company dengan semua fields (termasuk membership)
export const updateCompanyByAdmin = async (companyId, fields) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .update(fields)
      .eq('id', companyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating company:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
};

// Upload payment proof to Supabase Storage
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'doc', 'docx', 'pdf', 'heic'];
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/heic',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const uploadPaymentProof = async (file, companyEmail) => {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Ukuran file maksimal 5MB');
  }

  // Validate file extension
  const ext = file.name.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error('Format file tidak didukung');
  }

  // Validate mime type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Format file tidak didukung');
  }

  try {
    const fileName = `${companyEmail.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.${ext}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('Payment Prove')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error('Error uploading payment proof:', error.message);
      throw new Error('Gagal mengunggah bukti bayar. Silakan coba lagi.');
    }

    return filePath;
  } catch (err) {
    console.error('Unexpected error uploading file:', err);
    // Re-throw validation errors from above; wrap unexpected ones
    if (err.message === 'Ukuran file maksimal 5MB' || err.message === 'Format file tidak didukung' || err.message === 'Gagal mengunggah bukti bayar. Silakan coba lagi.') {
      throw err;
    }
    throw new Error('Gagal mengunggah bukti bayar. Silakan coba lagi.');
  }
};

// Get public URL for a payment proof file
export const getPaymentProofUrl = (filePath) => {
  if (!filePath) return null;
  const { data } = supabase.storage
    .from('Payment Prove')
    .getPublicUrl(filePath);
  return data?.publicUrl || null;
};

// Get all companies (includes last_active for online status) — no password
export const getAllCompanies = async () => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        id, name, pic_name, pic_phone, email, address,
        membership_tier, membership_price,
        subscription_status, status,
        admin_id, payment_proof_path,
        last_active, created_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching companies:', error.message);
      return [];
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
};

// Get companies with pending payment (butuh konfirmasi pembayaran admin) — no password
export const getPendingRegistrations = async (adminId) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        id, name, pic_name, pic_phone, email, address,
        membership_tier, membership_price,
        subscription_status, status,
        admin_id, payment_proof_path,
        last_active, created_at
      `)
      .eq('admin_id', adminId)
      .like('subscription_status', 'pending_payment:%')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending registrations:', error.message);
      return [];
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
};

// Get ALL registrations untuk admin (semua status) — no password
export const getAllRegistrationsForAdmin = async (adminId) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        id, name, pic_name, pic_phone, email, address,
        membership_tier, membership_price,
        subscription_status, status,
        admin_id, payment_proof_path,
        last_active, created_at
      `)
      .eq('admin_id', adminId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching registrations:', error.message);
      return [];
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
};

// Helper: Log payment approval action to audit trail
const logPaymentApprovalAction = async (companyId, adminId, action, targetTier, paymentProofPath, notes = null) => {
  try {
    const { error } = await supabase
      .from('payment_approval_history')
      .insert({
        company_id: companyId,
        admin_id: adminId,
        action,
        target_tier: targetTier,
        payment_proof_path: paymentProofPath,
        notes
      });

    if (error) {
      console.error('Failed to log payment approval action:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Unexpected error logging payment approval:', err);
    return false;
  }
};

// Get payment approval history for a company
export const getPaymentApprovalHistory = async (companyId) => {
  try {
    const { data, error } = await supabase
      .from('payment_approval_history')
      .select(`
        id,
        action,
        target_tier,
        payment_proof_path,
        notes,
        created_at,
        admins!inner (
          id,
          name,
          email
        )
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payment approval history:', error.message);
      return [];
    }
    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
};

// Admin-only: Konfirmasi pembayaran client
export const confirmPayment = async (companyId, membershipTier, adminId, paymentProofPath, notes = null) => {
  // Update company status
  const result = await updateCompanyByAdmin(companyId, {
    subscription_status: 'active',
    membership_tier: membershipTier,
    payment_proof_path: null, // reset setelah dikonfirmasi
  });

  // Log to audit trail
  if (result) {
    await logPaymentApprovalAction(companyId, adminId, 'approve', membershipTier, paymentProofPath, notes);
  }

  return result;
};

// Admin-only: Tolak pembayaran client
export const rejectPayment = async (companyId, adminId, targetTier, paymentProofPath, notes = null) => {
  // Update company status
  const result = await updateCompanyByAdmin(companyId, {
    subscription_status: 'rejected',
    payment_proof_path: null, // reset setelah ditolak
  });

  // Log to audit trail
  if (result) {
    await logPaymentApprovalAction(companyId, adminId, 'reject', targetTier, paymentProofPath, notes);
  }

  return result;
};

// Get pending payment registrations untuk admin — no password
export const getPendingPayments = async (adminId) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        id, name, pic_name, pic_phone, email, address,
        membership_tier, membership_price,
        subscription_status, status,
        admin_id, payment_proof_path,
        last_active, created_at
      `)
      .eq('admin_id', adminId)
      .like('subscription_status', 'pending_payment:%')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending payments:', error.message);
      return [];
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
};

// Update client last_active timestamp — called on client activity
export const updateClientLastActive = async (companyId) => {
  try {
    const { error } = await supabase
      .from('companies')
      .update({ last_active: new Date().toISOString() })
      .eq('id', companyId);

    if (error) {
      console.error('Error updating last_active:', error.message);
    }
  } catch (err) {
    console.error('Unexpected error updating last_active:', err);
  }
};
