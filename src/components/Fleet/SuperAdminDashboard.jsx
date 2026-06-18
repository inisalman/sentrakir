import React, { useState, useEffect } from "react";

import SystemControlView from "./SuperAdminDashboard/SystemControlView";
import AllClientsView from "./SuperAdminDashboard/AllClientsView";
import AllAdminsView from "./SuperAdminDashboard/AllAdminsView";
import ActivityLogView from "./SuperAdminDashboard/ActivityLogView";

export default function SuperAdminDashboard({
  user,
  onLogout,
  currentPath,
  navigate,
}) {
  const [activeTab, setActiveTab] = useState("system");

  // Sync active tab with currentPath
  useEffect(() => {
    const subPath = currentPath.replace("/fleet/superadmin/", "");
    if (["system", "clients", "admins", "activity"].includes(subPath)) {
      setActiveTab(subPath);
    } else {
      navigate("/fleet/superadmin/system");
    }
  }, [currentPath, navigate]);

  const sidebarNavItems = [
    { id: "system", label: "System Control", icon: "⚙️" },
    { id: "clients", label: "Semua Client", icon: "🏢" },
    { id: "admins", label: "Data Admin", icon: "👮" },
    { id: "activity", label: "Activity Log", icon: "📜" },
  ];

  return (
    <div className="fleet-portal-wrapper">
      <div className="fleet-layout">
        {/* SIDEBAR */}
        <aside className="fleet-sidebar" style={{ backgroundColor: "#0f172a" }}>
          <div className="sidebar-logo">
            <img
              src="/logo-sentra-kir.png"
              alt="Sentra KIR Logo"
              style={{ objectFit: "contain", cursor: "pointer", filter: "brightness(0) invert(1)" }}
              onClick={() => navigate("/")}
            />
          </div>
          <nav className="sidebar-nav">
            {sidebarNavItems.map((item) => (
              <button
                key={item.id}
                className={`sidebar-link ${activeTab === item.id ? "active" : ""}`}
                onClick={() => navigate(`/fleet/superadmin/${item.id}`)}
                style={
                  activeTab === item.id
                    ? { backgroundColor: "#b91c1c", color: "white" }
                    : { color: "#cbd5e1" }
                }
              >
                <span style={{ marginRight: "10px" }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <button
              className="sidebar-link"
              onClick={onLogout}
              style={{ color: "#fca5a5" }}
            >
              <span>Keluar</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="fleet-main">
          {/* Header */}
          <header className="fleet-page-header">
            <div className="fleet-page-title">
              <h1>
                {activeTab === "system" && "System Control Panel"}
                {activeTab === "clients" && "Manajemen Semua Client"}
                {activeTab === "admins" && "Manajemen Administrator"}
                {activeTab === "activity" && "Activity Log System"}
              </h1>
              <p>
                {activeTab === "system" && "Matikan atau hidupkan fungsi inti sistem secara real-time."}
                {activeTab === "clients" && "Kelola dan pindahkan data seluruh klien terdaftar."}
                {activeTab === "admins" && "Atur status dan hak akses Super Admin."}
                {activeTab === "activity" && "Pantau log login dan aktivitas krusial dalam aplikasi."}
              </p>
            </div>
            <div className="user-profile-widget" style={{ borderColor: "#fca5a5" }}>
              <div className="user-avatar" style={{ backgroundColor: "#b91c1c", color: "white" }}>
                SA
              </div>
              <div className="user-info">
                <p className="user-name">
                  Super Administrator
                </p>
                <p className="user-role" style={{ color: "#b91c1c", fontWeight: "bold" }}>
                  System Control
                </p>
              </div>
            </div>
          </header>

          {/* Tab Views */}
          <div className="fleet-tab-content">
            {activeTab === "system" && <SystemControlView />}
            {activeTab === "clients" && <AllClientsView />}
            {activeTab === "admins" && <AllAdminsView />}
            {activeTab === "activity" && <ActivityLogView />}
          </div>
        </main>
      </div>
    </div>
  );
}