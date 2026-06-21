import { supabase } from './supabaseClient';
import { getAdminByEmail } from './supabaseAdmin';
import { getCompanyByEmail } from './supabaseClientAuth';

// Tarik data pengajuan berdasarkan ID perusahaan
export const getRequestsByCompanyId = async (companyId) => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select(`
        id, company_id, vehicle_id, service_type,
        status, admin_id, meta_data,
        created_at, updated_at
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching requests by company:', error.message);
      return [];
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
};

// Tarik data pengajuan berdasarkan ID admin
export const getRequestsByAdminId = async (adminId) => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select(`
        id, company_id, vehicle_id, service_type,
        status, admin_id, meta_data,
        created_at, updated_at
      `)
      .eq('admin_id', adminId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching requests by admin:', error.message);
      return [];
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
};

// Fungsi krusial: Routing dan Bikin Request
export const createRequest = async (requestData) => {
  try {
    // ---- LOGIC ROUTING ----
    let assignedAdminId = requestData.adminId;

    // Ambil data admin asalnya dari Supabase
    const { data: sourceAdmin } = await supabase
      .from('admins')
      .select('name')
      .eq('id', assignedAdminId)
      .single();

    // Kalau admin bawaannya adalah Sentra DAN yang diurus berbau STNK/Pajak (BUKAN SIM),
    // maka oper ke Padajaya
    const isSentra = sourceAdmin && sourceAdmin.name.toLowerCase().includes('sentra');
    const isStnkOrPajak =
      requestData.serviceType.includes("stnk") ||
      requestData.serviceType.includes("pajak") ||
      requestData.serviceType === "cabut_berkas_stnk";

    if (isSentra && isStnkOrPajak) {
      // Cari ID admin Padajaya secara dinamis
      const { data: padajayaAdmin } = await supabase
        .from('admins')
        .select('id')
        .ilike('name', '%padajaya%')
        .single();

      if (padajayaAdmin) {
        assignedAdminId = padajayaAdmin.id;
      }
    }

    // Mapping untuk database
    const dbPayload = {
      id: requestData.id || `req-${Date.now()}`,
      company_id: requestData.companyId,
      vehicle_id: requestData.vehicleId,
      service_type: requestData.serviceType,
      status: requestData.status || 'pending',
      admin_id: assignedAdminId,
      meta_data: requestData // simpen semua (termasuk notes, missing docs, biaya, dll)
    };

    const { data, error } = await supabase
      .from('requests')
      .insert([dbPayload])
      .select()
      .single();

    if (error) {
      console.error('Error creating request:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err.message };
  }
};

// Admin update status & kirim quotation harga
export const updateRequestStatusSupabase = async (requestId, status, updateData = {}) => {
  try {
    // Ambil data meta_data yang lama dulu biar gak ketimpa hilang
    const { data: oldReq } = await supabase
      .from('requests')
      .select('meta_data')
      .eq('id', requestId)
      .single();

    const newMetaData = {
      ...(oldReq?.meta_data || {}),
      ...updateData
    };

    const dbPayload = {
      status: status,
      meta_data: newMetaData,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('requests')
      .update(dbPayload)
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('Error updating request:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err.message };
  }
};
