import { supabase } from './supabaseClient';

export const logActivity = async ({
  actorType, // 'super_admin', 'admin', 'client'
  actorId,
  actorEmail,
  action, // 'LOGIN', 'LOGOUT', 'UPDATE_TIER', dll
  targetType = null,
  targetId = null,
  metadata = {}
}) => {
  try {
    await supabase.rpc('log_activity', {
      p_actor_type: actorType,
      p_actor_id: actorId,
      p_actor_email: actorEmail,
      p_action: action,
      p_target_type: targetType,
      p_target_id: targetId,
      p_metadata: metadata
    });
  } catch (err) {
    // Kita silent catch error log agar tidak mengganggu flow aplikasi utama
    console.error("Gagal mencatat log aktivitas:", err);
  }
};

export const getActivities = async (limit = 100) => {
  try {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching logs:', error.message);
      return [];
    }
    return data;
  } catch (err) {
    console.error('Unexpected error fetching logs:', err);
    return [];
  }
};