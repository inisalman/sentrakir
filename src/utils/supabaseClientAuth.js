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

// Update company fields by ID
export const updateCompany = async (companyId, fields) => {
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

// Admin konfirmasi pembayaran — upgrade tier, set subscription_status active
export const confirmPayment = async (companyId, targetTier) => {
  return updateCompany(companyId, {
    subscription_status: 'active',
    membership_tier: targetTier,
  });
};

// Admin tolak pembayaran — set subscription_status rejected
export const rejectPayment = async (companyId) => {
  return updateCompany(companyId, {
    subscription_status: 'payment_rejected',
    membership_tier: 'free',
  });
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
