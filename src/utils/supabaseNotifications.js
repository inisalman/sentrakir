import { supabase } from './supabaseClient';

// Fetch notifications for admin (unread + last 7 days)
export const getNotificationsByAdmin = async (adminId) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .eq('admin_id', adminId)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error.message);
      return [];
    }
    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
};

// Get unread count for badge
export const getUnreadCount = async (adminId) => {
  try {
    const { count, error } = await supabase
      .from('admin_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('admin_id', adminId)
      .eq('is_read', false);

    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
};

// Mark single notification as read
export const markNotificationRead = async (notificationId) => {
  try {
    const { error } = await supabase
      .from('admin_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    return !error;
  } catch {
    return false;
  }
};

// Mark all notifications as read for admin
export const markAllNotificationsRead = async (adminId) => {
  try {
    const { error } = await supabase
      .from('admin_notifications')
      .update({ is_read: true })
      .eq('admin_id', adminId)
      .eq('is_read', false);

    return !error;
  } catch {
    return false;
  }
};

// Create a new notification (insert into table)
export const createNotification = async ({ adminId, type, title, message, priority = 'normal', referenceId, referenceType, metaData = {} }) => {
  try {
    const { data, error } = await supabase
      .from('admin_notifications')
      .insert([{
        admin_id: adminId,
        type,
        title,
        message,
        priority,
        reference_id: referenceId,
        reference_type: referenceType,
        meta_data: metaData,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// Subscribe to real-time notifications via Supabase Realtime
export const subscribeToNotifications = (adminId, onNewNotification) => {
  const channel = supabase
    .channel(`admin-notifications-${adminId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'admin_notifications',
        filter: `admin_id=eq.${adminId}`,
      },
      (payload) => {
        onNewNotification(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Trigger vehicle expiry reminder check (calls Edge Function)
export const triggerVehicleExpiryReminder = async (adminId = 'all') => {
  try {
    const { data, error } = await supabase.functions.invoke('vehicle-expiry-reminder', {
      body: { adminId },
    });
    if (error) {
      console.warn('Vehicle expiry reminder failed:', error.message);
      return false;
    }
    return data?.success ?? false;
  } catch (err) {
    console.warn('Vehicle expiry reminder error:', err);
    return false;
  }
};

// Trigger new request notification to assigned admin
export const triggerRequestNotification = async ({ adminId, companyName, serviceType, requestId }) => {
  try {
    const { data, error } = await supabase.functions.invoke('admin-notification-trigger', {
      body: {
        type: 'request_new',
        adminId,
        companyName,
        serviceType,
        referenceId: requestId,
      },
    });
    if (error) {
      console.warn('Request notification trigger failed:', error.message);
      return false;
    }
    return data?.success ?? false;
  } catch {
    return false;
  }
};

// Trigger membership request notification
export const triggerMembershipNotification = async ({ adminId, companyName, fromTier, toTier, companyId }) => {
  try {
    const { data, error } = await supabase.functions.invoke('admin-notification-trigger', {
      body: {
        type: 'membership_request',
        adminId,
        companyName,
        fromTier,
        toTier,
        referenceId: companyId,
      },
    });
    if (error) {
      console.warn('Membership notification trigger failed:', error.message);
      return false;
    }
    return data?.success ?? false;
  } catch {
    return false;
  }
};

// Trigger AI chat notification
export const triggerAIChatNotification = async ({ adminId, companyName, chatId }) => {
  try {
    const { data, error } = await supabase.functions.invoke('admin-notification-trigger', {
      body: {
        type: 'ai_chat',
        adminId,
        companyName,
        referenceId: chatId,
      },
    });
    if (error) {
      console.warn('AI chat notification trigger failed:', error.message);
      return false;
    }
    return data?.success ?? false;
  } catch {
    return false;
  }
};
