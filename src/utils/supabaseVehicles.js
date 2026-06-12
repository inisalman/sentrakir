import { supabase } from './supabaseClient';

// Get all vehicles for a specific company
export const getVehiclesByCompanyId = async (companyId) => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vehicles:', error.message);
      return [];
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
};

// Add a new vehicle
export const createVehicle = async (vehicleData) => {
  try {
    // Mapping format React (camelCase) ke Supabase (snake_case)
    const dbPayload = {
      id: vehicleData.id || `veh-${Date.now()}`,
      company_id: vehicleData.companyId,
      plate_number: vehicleData.plateNumber,
      jenis_kendaraan: vehicleData.jenisKendaraan || vehicleData.vehicleType || 'Unknown',
      merk: vehicleData.merk || vehicleData.brand || 'Unknown',
      tipe: vehicleData.tipe || vehicleData.model || 'Unknown',
      tahun: vehicleData.tahun || vehicleData.yearManufactured || new Date().getFullYear(),
      status_kir: vehicleData.kirStatus || 'valid',
      status_stnk: vehicleData.stnkStatus || 'valid',
      // Simpan semua sisa datanya (kayak nama owner, no mesin, expiry dates, status hilang, dll) di meta_data
      meta_data: vehicleData
    };

    const { data, error } = await supabase
      .from('vehicles')
      .insert([dbPayload])
      .select()
      .single();

    if (error) {
      console.error('Error creating vehicle:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err.message };
  }
};

// Update an existing vehicle
export const updateVehicleSupabase = async (vehicleId, updateData) => {
  try {
    const dbPayload = {};
    if (updateData.plateNumber) dbPayload.plate_number = updateData.plateNumber;
    if (updateData.jenisKendaraan || updateData.vehicleType) dbPayload.jenis_kendaraan = updateData.jenisKendaraan || updateData.vehicleType;
    if (updateData.merk || updateData.brand) dbPayload.merk = updateData.merk || updateData.brand;
    if (updateData.tipe || updateData.model) dbPayload.tipe = updateData.tipe || updateData.model;
    if (updateData.tahun || updateData.yearManufactured) dbPayload.tahun = updateData.tahun || updateData.yearManufactured;
    
    // Update meta_data with the new data
    dbPayload.meta_data = updateData;

    const { data, error } = await supabase
      .from('vehicles')
      .update(dbPayload)
      .eq('id', vehicleId)
      .select()
      .single();

    if (error) {
      console.error('Error updating vehicle:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err.message };
  }
};

// Delete a vehicle
export const deleteVehicleSupabase = async (vehicleId) => {
  try {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicleId);

    if (error) {
      console.error('Error deleting vehicle:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err.message };
  }
};

// Get all vehicles across the platform (for admin views)
export const getAllVehicles = async () => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all vehicles:', error.message);
      return [];
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
};
