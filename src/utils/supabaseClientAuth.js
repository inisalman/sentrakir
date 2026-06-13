import { supabase } from './supabaseClient';

// Get company by email
export const getCompanyByEmail = async (email) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
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
    // Biarkan Supabase generate UUID lewat default gen_random_uuid()
    // jangan kirim field id sama sekali
    const { id: _ignored, ...payload } = companyData;

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

// Get all companies
export const getAllCompanies = async () => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
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
