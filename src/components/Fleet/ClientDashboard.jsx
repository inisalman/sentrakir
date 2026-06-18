import React, { useState, useEffect, useRef } from "react";
import {
  getAdminById,
  getTierConfig,
} from "../../utils/fleetMockData.js";
import {
  getAllVehicles,
} from "../../utils/supabaseVehicles.js";
import {
  getRequestsByCompanyId,
} from "../../utils/supabaseRequests.js";
import { getAllCompanies, updateClientLastActive } from "../../utils/supabaseClientAuth.js";
import { getAllServicePrices } from "../../utils/supabasePricing.js";
import { useSystemFlags } from "../../utils/SystemFlagsContext";
import ChatWidget from "../Chat/ChatWidget";

import BillingView from "./ClientDashboard/BillingView";
import DashboardView from "./ClientDashboard/DashboardView";
import SettingsView from "./ClientDashboard/SettingsView";
import VehiclesView from "./ClientDashboard/VehiclesView";
import TimelineView from "./ClientDashboard/TimelineView";
import RequestsView from "./ClientDashboard/RequestsView";

const formatDateLong = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "-";
  }
};

export default function ClientDashboard({
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
  const [servicePrices, setServicePrices] = useState({}); // { service_code: base_price }

  // Sync active tab with currentPath
  useEffect(() => {
    const subPath = currentPath.replace("/fleet/client/", "");
    if (
      [
        "dashboard",
        "vehicles",
        "timeline",
        "requests",
        "billing",
        "settings",
      ].includes(subPath)
    ) {
      setActiveTab(subPath);
    } else {
      // default redirection
      navigate("/fleet/client/dashboard");
    }
  }, [currentPath]);

  // Refresh local state when DB changes — all data from Supabase
  const refreshData = async () => {
    try {
      // 1. Fetch updated companies from Supabase
      const supabaseCompanies = await getAllCompanies();
      const mappedCompanies = supabaseCompanies.map((c) => ({
        ...c,
        adminId: c.admin_id,
        picName: c.pic_name,
        picPhone: c.pic_phone,
        membershipTier: c.membership_tier,
        membershipPrice: c.membership_price,
        subscriptionStatus: c.subscription_status,
      }));

      // 2. Fetch updated vehicles from Supabase
      const supabaseVehicles = await getAllVehicles();
      const mappedVehicles = supabaseVehicles.map((v) => ({
        ...v,
        ...(v.meta_data || {}),
        companyId: v.company_id,
        plateNumber: v.plate_number,
        vehicleType: v.jenis_kendaraan,
        kirStatus: v.status_kir,
        stnkStatus: v.status_stnk,
        kirExpiry: v.meta_data?.kirExpiry || "2026-12-31",
        stnkExpiry: v.meta_data?.stnkExpiry || "2031-12-31",
        pajakExpiry: v.meta_data?.pajakExpiry || "2026-12-31",
      }));

      // 3. Fetch updated requests from Supabase
      const supabaseRequests = await getRequestsByCompanyId(user.clientId);
      const mappedRequests = supabaseRequests.map((r) => ({
        ...r,
        ...(r.meta_data || {}),
        companyId: r.company_id,
        vehicleId: r.vehicle_id,
        serviceType: r.service_type,
        adminId: r.admin_id,
      }));

      setDb({
        companies: mappedCompanies,
        vehicles: mappedVehicles,
        requests: mappedRequests,
        documents: [],
      });
    } catch (e) {
      console.error("Failed to sync DB with Supabase", e);
    }
  };

  // Fetch service prices from Supabase
  const loadServicePrices = async () => {
    try {
      const prices = await getAllServicePrices();
      const priceMap = {};
      prices.forEach((p) => {
        priceMap[p.service_code] = p.base_price;
      });
      setServicePrices(priceMap);
    } catch (e) {
      console.error("Failed to load service prices", e);
    }
  };

  useEffect(() => {
    refreshData();
    loadServicePrices();
  }, []);

  // Heartbeat — update last_active to Supabase every 30s while client is logged in
  useEffect(() => {
    if (!user?.clientId) return;

    const ping = () => updateClientLastActive(user.clientId);
    ping(); // immediate ping on mount
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, [user?.clientId]);

  // Get current company details
  const company = db.companies.find((c) => c.id === user.clientId) || {};
  // Get vehicles for this company
  const companyVehicles = db.vehicles.filter(
    (v) => v.companyId === user.clientId,
  );
  // Get requests for this company
  const companyRequests = db.requests.filter(
    (r) => r.companyId === user.clientId,
  );
  // Get documents for this company's vehicles
  const vehicleIds = companyVehicles.map((v) => v.id);
  const companyDocs = db.documents.filter((d) =>
    vehicleIds.includes(d.vehicleId),
  );

  const clientAdmin = getAdminById(company.adminId) || { name: "Sentra" };
  const isSentraAdmin = clientAdmin.name.toLowerCase().includes("sentra");

  if (
    (isSentraAdmin && !flags.armada_sentra_enabled) ||
    (!isSentraAdmin && !flags.armada_padajaya_enabled)
  ) {
    return (
      <div className="fleet-portal-wrapper" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div className="fleet-card" style={{ textAlign: "center", maxWidth: "400px" }}>
          <h2 style={{ color: "#dc2626", marginBottom: "16px" }}>Akses Ditangguhkan</h2>
          <p style={{ color: "#64748b", marginBottom: "24px" }}>
            Layanan administrator untuk akun Anda sedang ditutup sementara (Maintenance) oleh Super Admin. Silakan hubungi Customer Service.
          </p>
          <button className="fleet-btn-secondary" onClick={onLogout}>Keluar</button>
        </div>
      </div>
    );
  }

  // Sidebar Links
  const sidebarNavItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      path: "/fleet/client/dashboard",
    },
    {
      id: "vehicles",
      label: "Armada Kendaraan",
      path: "/fleet/client/vehicles",
    },
    {
      id: "timeline",
      label: "Timeline Expiry",
      path: "/fleet/client/timeline",
    },
    {
      id: "requests",
      label: "Status Pengurusan",
      path: "/fleet/client/requests",
    },
    {
      id: "billing",
      label: "Membership & Billing",
      path: "/fleet/client/billing",
    },
    {
      id: "settings",
      label: "Pengaturan Akun",
      path: "/fleet/client/settings",
    },
  ];

  return (
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
                {activeTab === "dashboard" && "Dasbor Kepatuhan Armada"}
                {activeTab === "vehicles" && "Pengelolaan Armada Kendaraan"}
                {activeTab === "timeline" && "Kalender Jatuh Tempo Dokumen"}
                {activeTab === "requests" && "Status Pengurusan Jasa"}
                {activeTab === "billing" && "Layanan Membership & Billing"}
              </h1>
              <p>
                {activeTab === "dashboard" &&
                  "Pantau masa berlaku KIR, STNK, dan Pajak kendaraan Anda."}
                {activeTab === "vehicles" &&
                  "Tambahkan, edit, dan unggah dokumen armada perusahaan."}
                {activeTab === "timeline" &&
                  "Visualisasi kadaluwarsa dokumen bulanan armada perusahaan."}
                {activeTab === "requests" &&
                  "Pantau antrean dan proses pengerjaan perpanjangan berkas."}
                {activeTab === "billing" &&
                  "Info membership tier, kuota armada, dan tagihan biro jasa."}
              </p>
            </div>
            <div className="user-profile-widget">
              <div className="user-avatar">
                {company.picName ? company.picName[0] : "C"}
              </div>
              <div className="user-info">
                <p className="user-name">{company.picName || "PIC Name"}</p>
                <p
                  className="user-role"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  <span>{company.name || "Company Name"} (B2B Klien)</span>
                  {(() => {
                    const clientAdmin = getAdminById(company.adminId) || {
                      name: "Sentra",
                    };
                    return (
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: "bold",
                          color: "#1e40af",
                          background: "#eff6ff",
                          padding: "1px 6px",
                          borderRadius: "4px",
                          border: "1px solid #bfdbfe",
                          alignSelf: "flex-start",
                          marginTop: "2px",
                        }}
                      >
                        Admin: {clientAdmin.name}
                      </span>
                    );
                  })()}
                </p>
              </div>
            </div>
          </header>

          {/* Tab Views */}
          {activeTab === "dashboard" && (
            <DashboardView
              vehicles={companyVehicles}
              requests={companyRequests}
              navigate={navigate}
            />
          )}
          {activeTab === "vehicles" && (
            <VehiclesView
              key={activeTab}
              vehicles={companyVehicles}
              docs={companyDocs}
              clientId={user.clientId}
              company={company}
              onUpdate={refreshData}
              servicePrices={servicePrices}
            />
          )}
          {activeTab === "timeline" && (
            <TimelineView vehicles={companyVehicles} />
          )}
          {activeTab === "requests" && (
            <RequestsView requests={companyRequests} onUpdate={refreshData} />
          )}
          {activeTab === "billing" && (
            <BillingView
              company={company}
              vehiclesCount={companyVehicles.length}
              onUpdate={refreshData}
            />
          )}
          {activeTab === "settings" && (
            <SettingsView company={company} onUpdate={refreshData} />
          )}
        </main>
      </div>

      {/* Chat Widget — only for paid tiers and if globally enabled */}
      {flags.ai_chat_enabled && company && company.id && getTierConfig(company.membershipTier)?.canUseChat && (
        <ChatWidget
          companyId={company.id}
          clientName={company.name || "Client"}
        />
      )}
    </div>
  );
}
