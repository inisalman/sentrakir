import React, { useState, useEffect, useCallback, createContext, useContext } from "react";

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = "success", duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <div style={{
      position: "fixed",
      top: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 99999,
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      width: "90%",
      maxWidth: "400px",
      pointerEvents: "none",
    }}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration);
    return () => clearTimeout(timer);
  }, []);

  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  const bgColors = {
    success: "#065f46",
    error: "#991b1b",
    warning: "#92400e",
    info: "#1e40af",
  };

  return (
    <div style={{
      background: bgColors[toast.type] || bgColors.info,
      color: "#fff",
      padding: "14px 18px",
      borderRadius: "12px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "14px",
      fontWeight: "500",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(-20px)",
      transition: "all 0.3s ease",
      pointerEvents: "auto",
    }}>
      <span style={{ fontSize: "18px" }}>{icons[toast.type]}</span>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300); }}
        style={{
          background: "none",
          border: "none",
          color: "#fff",
          fontSize: "18px",
          cursor: "pointer",
          opacity: 0.7,
          padding: "0 4px",
        }}
      >×</button>
    </div>
  );
}
