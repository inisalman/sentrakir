import { supabase } from './supabaseClient';

// Supabase chat messages functions

export const createChatMessage = async (companyId, message, sender = 'client', response = null, faqId = null) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([
        {
          company_id: companyId,
          message,
          sender, // 'client' or 'admin' or 'ai'
          response,
          faq_id: faqId,
          is_resolved: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Error creating chat message:', error.message);
      return null;
    }

    return data?.[0] || null;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
};

export const getChatHistory = async (companyId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching chat history:', error.message);
      return [];
    }

    return data?.reverse() || [];
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
};

export const updateChatMessage = async (messageId, updates) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .select();

    if (error) {
      console.error('Error updating chat message:', error.message);
      return null;
    }

    return data?.[0] || null;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
};

// Delete old chat history (auto-cleanup after 30 days)
export const deleteOldChatMessages = async (daysOld = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      console.error('Error deleting old messages:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error:', err);
    return false;
  }
};

// Get unresolved chats (untuk admin)
export const getUnresolvedChats = async () => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('is_resolved', false)
      .eq('sender', 'ai')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching unresolved chats:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
};

// Get list of unique clients yang punya chat (untuk admin)
export const getClientChatList = async () => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('company_id, message, created_at, is_resolved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching client chat list:', error.message);
      return [];
    }

    // Deduplicate by company_id, ambil pesan terakhir tiap company
    const map = {};
    (data || []).forEach((msg) => {
      if (!map[msg.company_id]) {
        map[msg.company_id] = msg;
      }
    });

    return Object.values(map);
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
};

// Admin add override response
export const addAdminOverride = async (messageId, adminResponse, adminId) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .update({
        response: adminResponse,
        sender: 'admin',
        admin_id: adminId,
        is_resolved: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .select();

    if (error) {
      console.error('Error adding admin override:', error.message);
      return null;
    }

    return data?.[0] || null;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
};
