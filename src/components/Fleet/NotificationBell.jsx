import React, { useState, useRef, useEffect } from "react";
import { useNotifications } from "./NotificationsContext";

const typeIcons = {
  request_new: "📋",
  membership_request: "💎",
  ai_chat: "🤖",
  vehicle_expiry: "⏰",
};

const priorityColors = {
  urgent: "#dc2626",
  high: "#ea580c",
  normal: "#2563eb",
  low: "#64748b",
};

function timeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div style={{ position: "relative" }} ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          position: "relative",
          padding: "8px",
          borderRadius: "50%",
          transition: "background 0.2s",
        }}
        aria-label="Notifikasi"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {/* Badge */}
        {unreadCount > 0 && (
          <span style={{
            position: "absolute",
            top: "2px",
            right: "2px",
            background: "#dc2626",
            color: "#fff",
            borderRadius: "50%",
            width: unreadCount > 9 ? "20px" : "18px",
            height: "18px",
            fontSize: "11px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #fff",
            animation: "notif-pulse 2s infinite",
          }}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div style={{
          position: "absolute",
          top: "48px",
          right: "0",
          width: "360px",
          maxHeight: "480px",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
          border: "1px solid #e2e8f0",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "16px 18px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>
              Notifikasi {unreadCount > 0 && <span style={{ color: "#dc2626" }}>({unreadCount})</span>}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: "none",
                  border: "none",
                  color: "#2563eb",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1, maxHeight: "400px" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔔</div>
                <p style={{ margin: 0 }}>Tidak ada notifikasi</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem key={n.id} notif={n} onMarkRead={markRead} />
              ))
            )}
          </div>
        </div>
      )}

      {/* Pulse animation */}
      <style>{`
        @keyframes notif-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

function NotificationItem({ notif, onMarkRead }) {
  return (
    <div
      onClick={() => !notif.is_read && onMarkRead(notif.id)}
      style={{
        padding: "14px 18px",
        borderBottom: "1px solid #f8fafc",
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        background: notif.is_read ? "#fff" : "#eff6ff",
        cursor: notif.is_read ? "default" : "pointer",
        transition: "background 0.2s",
      }}
    >
      <div style={{
        fontSize: "20px",
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        background: notif.is_read ? "#f1f5f9" : "#dbeafe",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        {typeIcons[notif.type] || "🔔"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
          <span style={{
            fontSize: "13px",
            fontWeight: notif.is_read ? "500" : "700",
            color: "#1e293b",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {notif.title}
          </span>
          {!notif.is_read && (
            <span style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: priorityColors[notif.priority] || "#2563eb",
              flexShrink: 0,
            }} />
          )}
        </div>
        <p style={{
          margin: "4px 0 0",
          fontSize: "12px",
          color: "#64748b",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {notif.message}
        </p>
        <span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px", display: "block" }}>
          {timeAgo(notif.created_at)}
        </span>
      </div>
    </div>
  );
}