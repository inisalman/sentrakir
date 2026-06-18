import { supabase } from './supabaseClient';

// Ambil semua system flags
export const getAllSystemFlags = async () => {
  try {
    const { data, error } = await supabase
      .from('system_flags')
      .select('*')
      .order('key', { ascending: true });

    if (error) {
      console.error('Error fetching system flags:', error.message);
      return [];
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
};

// Ambil status satu flag spesifik (untuk feature gating)
// Fallback ke `true` jika terjadi error agar sistem tidak lumpuh
export const getSystemFlag = async (key) => {
  try {
    const { data, error } = await supabase
      .from('system_flags')
      .select('value')
      .eq('key', key)
      .single();

    if (error) return true; // Fallback
    return data.value;
  } catch (err) {
    return true; // Fallback
  }
};

// Update status flag (Hanya Super Admin)
export const updateSystemFlag = async (key, value, userEmail) => {
  try {
    const { error } = await supabase
      .from('system_flags')
      .update({
        value,
        updated_at: new Date().toISOString(),
        updated_by: userEmail
      })
      .eq('key', key);

    if (error) {
      console.error('Error updating flag:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Unexpected error:', err);
    return false;
  }
};