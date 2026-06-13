import { supabase } from './supabaseClient';

// Get all active service prices
export const getAllServicePrices = async () => {
  try {
    const { data, error } = await supabase
      .from('service_prices')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true });

    if (error) {
      console.error('Error fetching service prices:', error.message);
      return [];
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
};

// Get price by service code
export const getPriceByServiceCode = async (serviceCode) => {
  try {
    const { data, error } = await supabase
      .from('service_prices')
      .select('*')
      .eq('service_code', serviceCode)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching price:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
};

// Update service price (admin only)
export const updateServicePrice = async (id, newPrice) => {
  try {
    const { data, error } = await supabase
      .from('service_prices')
      .update({ 
        base_price: newPrice,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating price:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err.message };
  }
};
