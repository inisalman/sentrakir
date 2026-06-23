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
  const [db, setDb] = useState({
    companies: [],
    vehicles: [],
    requests: [],
    documents: [],
  });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [servicePrices, setServicePrices] = useState({}); // { service_code: base_price }
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    agreedToTerms: false,
    membershipTier: "free",
    picName: "",
    picPhone: "",
    address: "",
  });
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [onboardingError, setOnboardingError] = useState("");

  // Get current company details
  const company = db.companies.find((c) => c.id === user.clientId) || {};

  // Check if onboarding is needed (pic_name or pic_phone is empty)
  useEffect(() => {
    if (company.pic_name || company.pic_phone) {
      setShowOnboarding(false);
    } else {
      setShowOnboarding(true);
    }
  }, [company.id]);

  const handleOnboardingSubmit = async () => {
    if (!onboardingData.agreedToTerms) {
      setOnboardingError("Anda harus menyetujui Syarat & Ketentuan.");
      return;
    }
    if (!onboardingData.picName || !onboardingData.picPhone) {
      setOnboardingError("Nama PIC dan Nomor WhatsApp wajib diisi.");
      return;
    }

    setOnboardingLoading(true);
    setOnboardingError("");

    try {
      const { updateCompany } = await import("../../utils/supabaseClientAuth.js");
      await updateCompany(user.clientId, {
        pic_name: onboardingData.picName,
        pic_phone: onboardingData.picPhone,
        address: onboardingData.address,
        membership_tier: onboardingData.membershipTier,
      });
      await refreshData();
      setShowOnboarding(false);
    } catch (err) {
      setOnboardingError("Gagal menyimpan data: " + (err.message || "Unknown error"));
    } finally {
      setOnboardingLoading(false);
    }
  };

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
      {/* Onboarding Modal — wajib isi data sebelum pakai Dashboard */}
      {showOnboarding && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(15,23, 42, 0.95)",
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(4px)",
        }}>
          <div style={{
            background: "white", borderRadius: "16px", padding: "32px",
            maxWidth: "480px", width: "90%", maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <img src="/logo-sentra-kir.png" alt="Sentra Fleet" style={{ height: "48px", objectFit: "contain", marginBottom: "12px" }} />
              <h2 style={{ color: "#1C3967", margin: "0 0 4px 0", fontSize: "18px" }}>Lengkapi Data Perusahaan</h2>
              <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>Harap lengkapi data berikut untuk mengakses Dashboard.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: "#1e40af", marginBottom: "4px" }}>
                👋 Selamat datang! Lengkapi data di bawah ini untuk melanjutkan.
              </div>

              {/* Syarat & Ketentuan */}
              <div>
                <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#374151" }}>
                  <input
                    type="checkbox"
                    checked={onboardingData.agreedToTerms}
                    onChange={(e) => setOnboardingData(d => ({ ...d, agreedToTerms: e.target.checked }))}
                    style={{ marginTop: "2px", flexShrink: 0 }}
                  />
                  <span>Saya telah membaca dan menyetujui <strong>Syarat & Ketentuan</strong> Sentra Fleet.</span>
                </label>
              </div>

              {/* Pilih Paket */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Paket Membership</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {[
                    { value: "free", label: "Free", desc: "1–10 kendaraan", price: "Gratis" },
                    { value: "starter", label: "Starter", desc: "11–30 kendaraan", price: "Rp 399.000/bln" },
                    { value: "business", label: "Business", desc: "31–50 kendaraan", price: "Rp 499.000/bln" },
                    { value: "enterprise", label: "Enterprise", desc: "50–100 kendaraan", price: "Custom" },
                  ].map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setOnboardingData(d => ({ ...d, membershipTier: t.value }))}
                      style={{
                        padding: "10px 12px", borderRadius: "8px", cursor: "pointer",
                        border: `2px solid ${onboardingData.membershipTier === t.value ? "#1C3967" : "#e2e8f0"}`,
                        background: onboardingData.membershipTier === t.value ? "#f0f4ff" : "white",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: "13px", color: "#1C3967" }}>{t.label}</div>
                      <div style={{ fontSize: "11px", color: "#6b7a96" }}>{t.desc}</div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#1C3967", marginTop: "2px" }}>{t.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nama PIC */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Nama PIC *</label>
                <input
                  type="text"
                  className="fleet-input"
                  placeholder="Nama lengkap PIC"
                  value={onboardingData.picName}
                  onChange={(e) => setOnboardingData(d => ({ ...d, picName: e.target.value }))}
                />
              </div>

              {/* No WhatsApp PIC */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>No. WhatsApp PIC *</label>
                <input
                  type="text"
                  className="fleet-input"
                  placeholder="62812xxxxxx"
                  value={onboardingData.picPhone}
                  onChange={(e) => setOnboardingData(d => ({ ...d, picPhone: e.target.value }))}
                />
              </div>

              {/* Alamat */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Alamat Kantor</label>
                <textarea
                  className="fleet-input"
                  placeholder="Jl. Raya Cakung No. 10..."
                  value={onboardingData.address}
                  onChange={(e) => setOnboardingData(d => ({ ...d, address: e.target.value }))}
                  rows="2"
                  style={{ resize: "vertical" }}
                />
              </div>

              {onboardingError && (
                <div style={{ color: "#dc2626", fontSize: "13px", fontWeight: 600 }}>⚠️ {onboardingError}</div>
              )}
            </div>

            <button
              onClick={handleOnboardingSubmit}
              disabled={onboardingLoading}
              className="fleet-btn-submit"
              style={{ marginTop: "20px", width: "100%", opacity: onboardingLoading ? 0.7 : 1 }}
            >
              {onboardingLoading ? "Menyimpan..." : "Simpan & Lanjutkan ke Dashboard"}
            </button>
          </div>
        </div>
      )}

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

      {/* Chat Widget — only for paid tiers */}
      {company && company.id && getTierConfig(company.membershipTier)?.canUseChat && (
        <ChatWidget
          companyId={company.id}
          clientName={company.name || "Client"}
        />
      )}
    </div>
  );
}
