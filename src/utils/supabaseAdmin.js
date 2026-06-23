import { supabase } from './supabaseClient';

// Get admin by email
export const getAdminByEmail = async (email) => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .ilike('email', email)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching admin by email:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
};

// Get admin by registration code
export const getAdminByCode = async (code) => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('registration_code', code)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching admin by code:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
};

// Get admin by ID
export const getAdminById = async (adminId) => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id', adminId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching admin by id:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
};

// Validate registration code
export const validateRegistrationCode = async (code) => {
  const admin = await getAdminByCode(code);
  return admin ? { valid: true, admin } : { valid: false, admin: null };
};

// Check if admin can handle service type
export const canAdminHandleService = async (adminId, serviceType) => {
  const admin = await getAdminById(adminId);
  if (!admin || !admin.allowed_services) return false;
  return admin.allowed_services.includes(serviceType);
};

// Get all admins
export const getAllAdmins = async () => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching all admins:', error.message);
      return [];
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
};

// Update admin by ID
export const updateAdmin = async (adminId, fields) => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .update(fields)
      .eq('id', adminId)
      .select()
      .single();

    if (error) {
      console.error('Error updating admin:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error updating admin:', err);
    return null;
  }
};
