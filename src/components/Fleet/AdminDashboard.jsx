import React, { useState, useEffect } from "react";
import { getAllCompanies } from "../../utils/supabaseClientAuth.js";
import { getRequestsByAdminId } from "../../utils/supabaseRequests.js";
import { getAllVehicles } from "../../utils/supabaseVehicles.js";
import AdminChatPanel from "../Chat/AdminChatPanel";

import BusinessDashboardView from "./AdminDashboard/BusinessDashboardView";
import ClientsView from "./AdminDashboard/ClientsView";
import NationalVehiclesView from "./AdminDashboard/NationalVehiclesView";
import OrderTrackerView from "./AdminDashboard/OrderTrackerView";
import VerificationsView from "./AdminDashboard/VerificationsView";
import AdminVehiclesView from "./AdminDashboard/AdminVehiclesView";
import PendingPaymentsView from "./AdminDashboard/PendingPaymentsView";
import MembershipRequestsView from "./AdminDashboard/MembershipRequestsView";
import { useSystemFlags } from "../../utils/SystemFlagsContext";
import { NotificationsProvider } from "./NotificationsContext";
import NotificationBell from "./NotificationBell";

export default function AdminDashboard({
  user,
  onLogout,
  currentPath,
  navigate,
}) {
  const { flags } = useSystemFlags();
  const [db, setDb] = useState({
    companies: [],
    vehicles: [],
    requests: [],
    documents: [],
  });
  const [activeTab, setActiveTab] = useState("dashboard");

  // Sync active tab with currentPath
  useEffect(() => {
    const subPath = currentPath.replace("/fleet/admin/", "");
    if (
      [
        "dashboard",
        "clients",
        "vehicles",
        "requests",
        "verifications",
        "membership",
        "chat",
        "admin-vehicles",
      ].includes(subPath)
    ) {
      setActiveTab(subPath);
    } else {
      navigate("/fleet/admin/dashboard");
    }
  }, [currentPath]);

  // Refresh local state — all data from Supabase
  const refreshData = async () => {
    try {
      const supabaseCompanies = await getAllCompanies();
      const supabaseRequests = await getRequestsByAdminId(user.adminId);
      const supabaseVehicles = await getAllVehicles();

      setDb({
        companies: supabaseCompanies.map((c) => ({
          ...c,
          adminId: c.admin_id,
          picName: c.pic_name,
          picPhone: c.pic_phone,
          membershipTier: c.membership_tier,
          membershipPrice: c.membership_price,
          subscriptionStatus: c.subscription_status,
        })),
        vehicles: supabaseVehicles.map((v) => ({
          ...v,
          ...(v.meta_data || {}),
          companyId: v.company_id,
          plateNumber: v.plate_number,
          vehicleType: v.jenis_kendaraan,
        })),
        requests: supabaseRequests.map((r) => ({
          ...r,
          ...(r.meta_data || {}),
          companyId: r.company_id,
          vehicleId: r.vehicle_id,
          serviceType: r.service_type,
          adminId: r.admin_id,
        })),
        documents: [],
      });
    } catch (e) {
      console.error("Failed to load data from Supabase", e);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user.adminId]);

  // Cek apakah admin ini Sentra
  const isSentra =
    user.adminId === "584a2442-41eb-40ab-8854-3433cf7a2818" ||
    (user.companyName || "").toLowerCase().includes("sentra");

  // If this admin's access is globally disabled by Super Admin, block them
  if (
    (isSentra && !flags.armada_sentra_enabled) ||
    (!isSentra && !flags.armada_padajaya_enabled)
  ) {
    return (
      <div className="fleet-portal-wrapper" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div className="fleet-card" style={{ textAlign: "center", maxWidth: "400px" }}>
          <h2 style={{ color: "#dc2626", marginBottom: "16px" }}>Akses Ditangguhkan</h2>
          <p style={{ color: "#64748b", marginBottom: "24px" }}>
            Akses sistem untuk wilayah Administrator Anda saat ini sedang dinonaktifkan oleh Super Admin (Maintenance).
          </p>
          <button className="fleet-btn-secondary" onClick={onLogout}>Keluar</button>
        </div>
      </div>
    );
  }

  const sidebarNavItems = [
    ...((isSentra && flags.armada_sentra_enabled) || (!isSentra && flags.armada_padajaya_enabled) ? [
      {
        id: "admin-vehicles",
        label: "Armada Khusus Admin",
        path: "/fleet/admin/admin-vehicles",
      }
    ] : []),
    {
      id: "dashboard",
      label: "Dasbor Bisnis",
      path: "/fleet/admin/dashboard",
    },
    {
      id: "clients",
      label: "Database Klien",
      path: "/fleet/admin/clients",
    },
    {
      id: "vehicles",
      label: "Armada Nasional",
      path: "/fleet/admin/vehicles",
    },
    {
      id: "requests",
      label: "Tracker Order Dokumen",
      path: "/fleet/admin/requests",
    },
    {
      id: "verifications",
      label: "Verifikasi Dokumen",
      path: "/fleet/admin/verifications",
    },
    ...(flags.ai_chat_enabled ? [{
      id: "chat",
      label: "Chat Support AI",
      path: "/fleet/admin/chat",
    }] : []),
    ...(isSentra
      ? [
          {
            id: "membership",
            label: "Request Membership",
            path: "/fleet/admin/membership",
          },
        ]
      : []),
  ];

  return (
    <NotificationsProvider adminId={user.adminId}>
    <div className="fleet-portal-wrapper">
      <div className="fleet-layout">
        {/* Sidebar */}
        <aside className="fleet-sidebar">
          <div className="sidebar-logo">
            <img
              src="/logo-sentra-kir.png"
              alt="Sentra KIR Logo"
              style={{ objectFit: "contain", cursor: "pointer" }}
              onClick={() => navigate("/")}
            />
          </div>
          <nav className="sidebar-nav">
            {sidebarNavItems.map((item) => (
              <button
                key={item.id}
                className={`sidebar-link ${activeTab === item.id ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
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

        {/* Main Content Area */}
        <main className="fleet-main">
          {/* Header */}
          <header className="fleet-page-header">
            <div className="fleet-page-title">
              <h1>
                {activeTab === "dashboard" && "Dasbor Bisnis Admin"}
                {activeTab === "clients" && "Database Klien B2B"}
                {activeTab === "vehicles" && "Pusat Data Armada Nasional"}
                {activeTab === "requests" && "Tracker Order Dokumen KIR/STNK"}
                {activeTab === "verifications" &&
                  "Antrean Verifikasi Dokumen Klien"}
                {activeTab === "chat" && "Manajemen Chat Support AI"}
                {activeTab === "membership" &&
                  "Request Membership & Langganan"}
              </h1>
              <p>
                {activeTab === "dashboard" &&
                  "Analisis peluang bisnis dari seluruh dokumen kepatuhan klien."}
                {activeTab === "clients" &&
                  "Kelola profil perusahaan B2B dan hubungi PIC via WhatsApp."}
                {activeTab === "vehicles" &&
                  "Pantau seluruh armada kendaraan terdaftar dari semua klien."}
                {activeTab === "requests" &&
                  "Kelola antrean dan proses pengerjaan perpanjangan berkas."}
                {activeTab === "verifications" &&
                  "Tinjau dan verifikasi file pindaian dokumen KIR/STNK yang diunggah."}
                {activeTab === "chat" &&
                  "Tinjau dan override respons AI untuk pertanyaan klien yang kompleks."}
                {activeTab === "membership" &&
                  "Tinjau dan setujui permintaan perubahan paket membership dari klien (hanya Admin Sentra)."}
              </p>
            </div>
            <div className="user-profile-widget" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <NotificationBell />
              <div className="user-avatar">{isSentra ? "S" : "P"}</div>
              <div className="user-info">
                <p className="user-name">
                  {isSentra ? "Admin Sentra KIR" : "Admin Padajaya"}
                </p>
                <p className="user-role">Administrator</p>
              </div>
            </div>
          </header>

          {/* Tab Views */}
          {activeTab === "dashboard" && (
            <BusinessDashboardView
              db={db}
              adminId={user.adminId}
              navigate={navigate}
            />
          )}
          {activeTab === "clients" && (
            <ClientsView
              db={db}
              adminId={user.adminId}
              onUpdate={refreshData}
            />
          )}
          {activeTab === "vehicles" && (
            <NationalVehiclesView db={db} adminId={user.adminId} />
          )}
          {activeTab === "requests" && (
            <OrderTrackerView
              db={db}
              adminId={user.adminId}
              onUpdate={refreshData}
            />
          )}
          {activeTab === "verifications" && (
            <VerificationsView
              db={db}
              adminId={user.adminId}
              onUpdate={refreshData}
            />
          )}
          {activeTab === "membership" && (
            <div>
              <PendingPaymentsView
                adminId={user.adminId}
                onUpdate={refreshData}
              />
              <MembershipRequestsView
                db={db}
                adminId={user.adminId}
                onUpdate={refreshData}
              />
            </div>
          )}
          {activeTab === "admin-vehicles" && (isSentra ? flags.armada_sentra_enabled : flags.armada_padajaya_enabled) && (
            <AdminVehiclesView adminId={user.adminId} />
          )}
          {activeTab === "chat" && flags.ai_chat_enabled && (
            <AdminChatPanel adminId={user.adminId} />
          )}
        </main>
      </div>
    </div>
    </NotificationsProvider>
  );
}
