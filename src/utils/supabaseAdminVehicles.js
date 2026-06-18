import { supabase } from './supabaseClient';

// Get all admin vehicles untuk admin tertentu
export const getAdminVehicles = async (adminId) => {
  try {
    const { data, error } = await supabase
      .from('admin_vehicles')
      .select('*')
      .eq('admin_id', adminId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin vehicles:', error.message);
      return [];
    }
    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
};

// Tambah kendaraan admin
export const addAdminVehicle = async (vehicleData) => {
  try {
    const { data, error } = await supabase
      .from('admin_vehicles')
      .insert([vehicleData])
      .select()
      .single();

    if (error) {
      console.error('Error adding admin vehicle:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
};

// Update kendaraan admin
export const updateAdminVehicle = async (vehicleId, fields) => {
  try {
    const { data, error } = await supabase
      .from('admin_vehicles')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', vehicleId)
      .select()
      .single();

    if (error) {
      console.error('Error updating admin vehicle:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
};

// Hapus kendaraan admin
export const deleteAdminVehicle = async (vehicleId) => {
  try {
    const { error } = await supabase
      .from('admin_vehicles')
      .delete()
      .eq('id', vehicleId);

    if (error) {
      console.error('Error deleting admin vehicle:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Unexpected error:', err);
    return false;
  }
};
