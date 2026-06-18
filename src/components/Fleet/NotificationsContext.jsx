import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  getNotificationsByAdmin,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  subscribeToNotifications,
} from "../../utils/supabaseNotifications";

const NotificationsContext = createContext(null);

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be inside NotificationsProvider");
  return ctx;
}

export function NotificationsProvider({ adminId, children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const unsubRef = useRef(null);

  // Initial fetch
  const refreshNotifications = useCallback(async () => {
    if (!adminId) return;
    const [notifs, count] = await Promise.all([
      getNotificationsByAdmin(adminId),
      getUnreadCount(adminId),
    ]);
    setNotifications(notifs);
    setUnreadCount(count);
  }, [adminId]);

  // Subscribe to realtime
  useEffect(() => {
    if (!adminId) return;
    refreshNotifications();

    // Realtime subscription — WhatsApp-style instant push
    unsubRef.current = subscribeToNotifications(adminId, (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, [adminId, refreshNotifications]);

  const markRead = useCallback(async (id) => {
    const ok = await markNotificationRead(id);
    if (ok) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  }, []);

  const markAllRead = useCallback(async () => {
    const ok = await markAllNotificationsRead(adminId);
    if (ok) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  }, [adminId]);

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, markRead, markAllRead, refreshNotifications }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
