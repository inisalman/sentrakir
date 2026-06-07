import React, { useState, useEffect } from "react";
import {
  getFleetDatabase,
  getDaysRemaining,
  getDocStatus,
  updateRequestStatus,
  verifyDocument,
  CURRENT_DATE_STR,
  getAdminById,
  getRequestsForAdmin,
  getClientsForAdminView,
  ADMINS,
} from "../../utils/fleetMockData.js";

export default function AdminDashboard({
  user,
  onLogout,
  currentPath,
  navigate,
}) {
  const [db, setDb] = useState(() => getFleetDatabase());
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
      ].includes(subPath)
    ) {
      setActiveTab(subPath);
    } else {
      // default redirection
      navigate("/fleet/admin/dashboard");
    }
  }, [currentPath]);

  // Refresh local state when DB changes
  const refreshData = () => {
    setDb(getFleetDatabase());
  };

  const sidebarNavItems = [
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
      label: "Tracker Order",
      path: "/fleet/admin/requests",
    },
    {
      id: "verifications",
      label: "Verifikasi Dokumen",
      path: "/fleet/admin/verifications",
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
                {activeTab === "dashboard" && "Dasbor Bisnis Admin"}
                {activeTab === "clients" && "Database Klien B2B"}
                {activeTab === "vehicles" && "Pusat Data Armada Nasional"}
                {activeTab === "requests" && "Tracker Order & Jasa KIR/STNK"}
                {activeTab === "verifications" &&
                  "Antrean Verifikasi Dokumen Klien"}
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
              </p>
            </div>
            {(() => {
              const adminInfo = getAdminById(user.adminId) || {
                name: "Sentra",
                tier: "primary",
              };
              const adminName =
                adminInfo.name === "Sentra"
                  ? "Admin Sentra KIR"
                  : "Admin Padajaya";
              const adminRole =
                adminInfo.tier === "primary"
                  ? "Administrator"
                  : "Administrator";
              return (
                <div className="user-profile-widget">
                  <div className="user-avatar">{adminInfo.name[0]}</div>
                  <div className="user-info">
                    <p className="user-name">{adminName}</p>
                    <p className="user-role">{adminRole}</p>
                  </div>
                </div>
              );
            })()}
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
        </main>
      </div>
    </div>
  );
}

// ====================================================
// SUB-VIEW 1: BUSINESS DASHBOARD (ADMIN)
// ====================================================
function BusinessDashboardView({ db, adminId, navigate }) {
  const filteredCompanies = getClientsForAdminView(adminId);
  const companyIds = filteredCompanies.map((c) => c.id);
  const filteredVehicles = db.vehicles.filter((v) =>
    companyIds.includes(v.companyId),
  );

  const totalCompanies = filteredCompanies.length;
  const totalVehicles = filteredVehicles.length;

  // Documents falling due within 30 days
  let kir30 = 0;
  let stnk30 = 0;
  let pajak30 = 0;

  // Revenue Opportunity calculations
  let kirOpportunities = 0;
  let stnkPajakOpportunities = 0;

  filteredVehicles.forEach((v) => {
    const kirDays = getDaysRemaining(v.kirExpiry);
    const stnkDays = getDaysRemaining(v.stnkExpiry);
    const pajakDays = getDaysRemaining(v.pajakExpiry);

    // Expiring in 30 days (including expired ones ≤ 30 days ago, or H-30 to expired)
    if (kirDays <= 30) {
      kir30++;
      kirOpportunities++;
    }
    if (stnkDays <= 30) {
      stnk30++;
      stnkPajakOpportunities++;
    }
    if (pajakDays <= 30) {
      pajak30++;
      stnkPajakOpportunities++;
    }
  });

  const estimatedPricePerDoc = 350000; // Standard agency fee
  const potentialRevenue =
    (kirOpportunities + stnkPajakOpportunities) * estimatedPricePerDoc;

  return (
    <div>
      {/* Statistics */}
      <div className="fleet-stats-grid">
        <div className="fleet-stat-card info">
          <div>
            <div className="stat-val">{totalCompanies}</div>
            <div className="stat-lbl">Total Perusahaan Klien</div>
          </div>
          <div className="stat-icon info">🏢</div>
        </div>
        <div className="fleet-stat-card info">
          <div>
            <div className="stat-val">{totalVehicles}</div>
            <div className="stat-lbl">Total Armada Nasional</div>
          </div>
          <div className="stat-icon info">🚚</div>
        </div>
        <div className="fleet-stat-card warning">
          <div>
            <div className="stat-val">{kir30}</div>
            <div className="stat-lbl">KIR Kadaluwarsa (≤ 30 hari)</div>
          </div>
          <div className="stat-icon warning">📜</div>
        </div>
        <div className="fleet-stat-card danger">
          <div>
            <div className="stat-val">{stnk30 + pajak30}</div>
            <div className="stat-lbl">STNK/Pajak Expired (≤ 30 hari)</div>
          </div>
          <div className="stat-icon danger">🚨</div>
        </div>
      </div>

      {/* Revenue Opportunities Card */}
      <div className="business-opportunities-card">
        <div className="opportunity-header">
          <h2 className="opportunity-title">
            Analisis Peluang Bisnis (Revenue Opportunities)
          </h2>
          <p className="opportunity-subtitle">
            Estimasi potensi pendapatan jasa pengurusan KIR & STNK dari seluruh
            dokumen jatuh tempo (Kuning & Merah) klien.
          </p>
        </div>
        <div className="opportunity-stats-row">
          <div className="opportunity-stat">
            <div className="opportunity-stat-val">{kirOpportunities}</div>
            <div className="opportunity-stat-lbl">Peluang Perpanjangan KIR</div>
          </div>
          <div className="opportunity-stat">
            <div className="opportunity-stat-val">{stnkPajakOpportunities}</div>
            <div className="opportunity-stat-lbl">Peluang STNK / Pajak</div>
          </div>
          <div
            className="opportunity-stat"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            <div className="opportunity-stat-val" style={{ color: "#fef08a" }}>
              Rp {potentialRevenue.toLocaleString("id-ID")}
            </div>
            <div
              className="opportunity-stat-lbl"
              style={{ color: "#fef9c3", fontWeight: "bold" }}
            >
              Total Estimasi Potensi Omset
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            className="fleet-btn fleet-btn-secondary fleet-btn-sm"
            style={{ background: "white", color: "#1e3a8a", border: "none" }}
            onClick={() => navigate("/fleet/admin/clients")}
          >
            Lakukan Follow-up Klien →
          </button>
        </div>
      </div>

      {/* Bottom info section */}
      <div
        style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}
      >
        {/* Pending Requests summary */}
        <div className="fleet-card" style={{ marginBottom: 0 }}>
          <h3
            style={{
              fontSize: "15px",
              fontWeight: "800",
              margin: "0 0 16px 0",
              color: "#1C3967",
            }}
          >
            Antrean Permintaan Jasa Terbaru
          </h3>
          <div className="fleet-table-container">
            <table className="fleet-table" style={{ fontSize: "13px" }}>
              <thead>
                <tr>
                  <th>Klien</th>
                  <th>Plat Nomor</th>
                  <th>Layanan</th>
                  <th>Estimasi Biaya</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {getRequestsForAdmin(adminId)
                  .filter((r) => r.status === "pending")
                  .slice(0, 5).length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        color: "#6b7a96",
                      }}
                    >
                      Tidak ada antrean request pending.
                    </td>
                  </tr>
                ) : (
                  getRequestsForAdmin(adminId)
                    .filter((r) => r.status === "pending")
                    .slice(0, 5)
                    .map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: "600" }}>{r.companyName}</td>
                        <td>{r.plateNumber}</td>
                        <td>{r.serviceTypeLabel}</td>
                        <td>Rp {r.estimatedCost?.toLocaleString("id-ID")}</td>
                        <td>
                          <span
                            className="badge-status warning"
                            style={{ padding: "2px 8px", fontSize: "11px" }}
                          >
                            Pending
                          </span>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: "14px", textAlign: "right" }}>
            <button
              className="fleet-btn fleet-btn-secondary fleet-btn-sm"
              onClick={() => navigate("/fleet/admin/requests")}
            >
              Lihat Semua Order →
            </button>
          </div>
        </div>

        {/* Quick Help Admin */}
        <div
          className="fleet-card"
          style={{ marginBottom: 0, background: "#f8fafc" }}
        >
          <h3
            style={{
              fontSize: "15px",
              fontWeight: "800",
              margin: "0 0 12px 0",
              color: "#1C3967",
            }}
          >
            Panduan Admin
          </h3>
          <ul
            style={{
              paddingLeft: "20px",
              margin: 0,
              fontSize: "13px",
              color: "#475569",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              lineHeight: "1.5",
            }}
          >
            <li>
              Lakukan verifikasi dokumen unggahan klien pada tab{" "}
              <strong>Verifikasi</strong>. Dokumen yang tidak valid/buram harus
              segera di-Reject dengan alasan jelas.
            </li>
            <li>
              Saat request perpanjangan selesai dikerjakan, ubah status order
              menjadi <strong>Selesai (Completed)</strong> di tab{" "}
              <strong>Tracker Order</strong>. Tanggal berlaku dokumen armada
              klien akan otomatis terperpanjang secara dinamis.
            </li>
            <li>
              Gunakan tombol <strong>WhatsApp Follow-up</strong> di database
              klien untuk mengirimkan template pesan pengingat jatuh tempo
              secara cepat.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ====================================================
// SUB-VIEW 2: CLIENTS DATABASE
// ====================================================
function ClientsView({ db, adminId, onUpdate }) {
  const [search, setSearch] = useState("");

  const adminCompanies = getClientsForAdminView(adminId);

  const filteredCompanies = adminCompanies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.picName.toLowerCase().includes(search.toLowerCase()),
  );

  const getWhatsAppLink = (c) => {
    // Check which vehicles are warning/expired for this company
    const compVehicles = db.vehicles.filter((v) => v.companyId === c.id);
    const warningOrExpired = [];

    compVehicles.forEach((v) => {
      const kirDays = getDaysRemaining(v.kirExpiry);
      const stnkDays = getDaysRemaining(v.stnkExpiry);
      const pajakDays = getDaysRemaining(v.pajakExpiry);
      const minDays = Math.min(kirDays, stnkDays, pajakDays);

      if (minDays <= 90) {
        warningOrExpired.push(`${v.plateNumber} (KIR/STNK)`);
      }
    });

    let message = `Halo Bapak/Ibu ${c.picName} dari ${c.name}. Kami dari Sentra KIR ingin mengingatkan masa berlaku dokumen armada Anda. `;
    if (warningOrExpired.length > 0) {
      message += `Terdapat kendaraan yang mendekati jatuh tempo: ${warningOrExpired.slice(0, 2).join(", ")}. `;
    }
    message += `Apakah ingin kami bantu untuk proses perpanjangannya? Anda dapat meninjau detailnya di portal Sentra Fleet. Terima kasih.`;

    return `https://wa.me/${c.picPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="fleet-card">
      <div className="table-controls">
        <input
          type="text"
          className="fleet-input table-search"
          placeholder="Cari perusahaan atau nama PIC..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="fleet-table-container">
        <table className="fleet-table">
          <thead>
            <tr>
              <th>Nama Perusahaan</th>
              <th>Nama PIC</th>
              <th>No. WhatsApp PIC</th>
              <th>Email B2B</th>
              <th>Membership Tier</th>
              <th>Administrator</th>
              <th>Jumlah Armada</th>
              <th>Status</th>
              <th style={{ textAlign: "center" }}>WhatsApp Remind</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: "#6b7a96",
                  }}
                >
                  Tidak ada perusahaan klien terdaftar.
                </td>
              </tr>
            ) : (
              filteredCompanies.map((c) => {
                const count = db.vehicles.filter(
                  (v) => v.companyId === c.id,
                ).length;
                const clientAdmin = getAdminById(c.adminId) || {
                  name: "Sentra",
                };
                return (
                  <tr key={c.id}>
                    <td style={{ fontWeight: "700", color: "#1C3967" }}>
                      {c.name}
                    </td>
                    <td>{c.picName}</td>
                    <td style={{ fontFamily: "monospace" }}>+{c.picPhone}</td>
                    <td>{c.email}</td>
                    <td>
                      <span
                        className="badge-status neutral"
                        style={{
                          fontWeight: "700",
                          textTransform: "capitalize",
                        }}
                      >
                        {c.membershipTier}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge-status info"
                        style={{
                          fontWeight: "700",
                          background: "#eff6ff",
                          color: "#1e40af",
                          border: "1px solid #bfdbfe",
                        }}
                      >
                        {clientAdmin.name}
                      </span>
                    </td>
                    <td style={{ fontWeight: "700", paddingLeft: "30px" }}>
                      {count}
                    </td>
                    <td>
                      <span
                        className={`badge-status ${c.status === "active" ? "success" : "danger"}`}
                      >
                        {c.status === "active" ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <a
                        href={getWhatsAppLink(c)}
                        target="_blank"
                        rel="noreferrer"
                        className="fleet-btn fleet-btn-success fleet-btn-sm"
                        style={{
                          display: "inline-flex",
                          textDecoration: "none",
                        }}
                      >
                        💬 Hubungi PIC
                      </a>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ====================================================
// SUB-VIEW 3: NATIONAL VEHICLES
// ====================================================
function NationalVehiclesView({ db, adminId }) {
  const [search, setSearch] = useState("");
  const [filterCompany, setFilterCompany] = useState("all");

  const adminCompanies = getClientsForAdminView(adminId);
  const companyIds = adminCompanies.map((c) => c.id);

  const filteredVehicles = db.vehicles.filter((v) => {
    // Ensure vehicle belongs to admin's clients
    if (!companyIds.includes(v.companyId)) return false;

    const company = db.companies.find((c) => c.id === v.companyId) || {};
    const matchesSearch =
      v.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.vehicleType.toLowerCase().includes(search.toLowerCase()) ||
      (company.name &&
        company.name.toLowerCase().includes(search.toLowerCase()));

    const matchesCompany =
      filterCompany === "all" || v.companyId === filterCompany;

    return matchesSearch && matchesCompany;
  });

  return (
    <div className="fleet-card">
      <div className="table-controls">
        <input
          type="text"
          className="fleet-input table-search"
          placeholder="Cari plat, jenis, atau perusahaan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="fleet-input"
          style={{ maxWidth: "240px", background: "white" }}
          value={filterCompany}
          onChange={(e) => setFilterCompany(e.target.value)}
        >
          <option value="all">Semua Perusahaan Klien</option>
          {adminCompanies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="fleet-table-container">
        <table className="fleet-table">
          <thead>
            <tr>
              <th>Plat Nomor</th>
              <th>Pemilik Perusahaan</th>
              <th>Tipe Armada</th>
              <th>Kadaluwarsa KIR</th>
              <th>Kadaluwarsa STNK</th>
              <th>Kadaluwarsa Pajak</th>
              <th>Status KIR</th>
              <th>Status STNK</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: "#6b7a96",
                  }}
                >
                  Tidak ada armada kendaraan terdaftar.
                </td>
              </tr>
            ) : (
              filteredVehicles.map((v) => {
                const owner =
                  db.companies.find((c) => c.id === v.companyId) || {};
                const kirDays = getDaysRemaining(v.kirExpiry);
                const stnkDays = getDaysRemaining(v.stnkExpiry);

                return (
                  <tr key={v.id}>
                    <td style={{ fontWeight: "700" }}>{v.plateNumber}</td>
                    <td style={{ fontWeight: "600", color: "#1C3967" }}>
                      {owner.name || "Unknown"}
                    </td>
                    <td>{v.vehicleType}</td>
                    <td>{v.kirExpiry}</td>
                    <td>{v.stnkExpiry}</td>
                    <td>{v.pajakExpiry}</td>
                    <td>
                      <span
                        className={`badge-status ${getDocStatus(v.kirExpiry).code}`}
                      >
                        {getDocStatus(v.kirExpiry).label}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge-status ${getDocStatus(v.stnkExpiry).code}`}
                      >
                        {getDocStatus(v.stnkExpiry).label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ====================================================
// SUB-VIEW 4: ORDER TRACKER (ADMIN)
// ====================================================
function OrderTrackerView({ db, adminId, onUpdate }) {
  const [costs, setCosts] = useState({});

  const handleStatusChange = (reqId, newStatus) => {
    const cost = costs[reqId] !== undefined ? costs[reqId] : undefined;
    updateRequestStatus(reqId, newStatus, cost);
    onUpdate();
    alert(`Status order berhasil diubah menjadi ${newStatus.toUpperCase()}.`);
  };

  const handleCostChange = (reqId, value) => {
    setCosts({
      ...costs,
      [reqId]: value,
    });
  };

  const handleSaveCost = (req, costVal) => {
    updateRequestStatus(req.id, req.status, costVal);
    onUpdate();
    alert("Biaya estimasi berhasil diperbarui.");
  };

  const adminRequests = getRequestsForAdmin(adminId);

  return (
    <div className="fleet-card">
      <h2
        style={{
          fontSize: "16px",
          fontWeight: "800",
          margin: "0 0 20px 0",
          color: "#1C3967",
        }}
      >
        Daftar Permintaan Layanan Dokumen
      </h2>

      <div className="fleet-table-container">
        <table className="fleet-table">
          <thead>
            <tr>
              <th>ID Request</th>
              <th>Nama Perusahaan</th>
              <th>Plat Nomor</th>
              <th>Jenis Jasa</th>
              <th>Deskripsi Pengajuan</th>
              <th>Estimasi Biaya (Rp)</th>
              <th>Tanggal Masuk</th>
              <th>Status Pengerjaan</th>
            </tr>
          </thead>
          <tbody>
            {adminRequests.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: "#6b7a96",
                  }}
                >
                  Tidak ada data request pengurusan masuk.
                </td>
              </tr>
            ) : (
              [...adminRequests].reverse().map((r) => {
                const currentCost = r.estimatedCost || 0;
                const editingCost =
                  costs[r.id] !== undefined ? costs[r.id] : currentCost;
                const isCrossAdmin = r.originatingAdminId !== r.assignedAdminId;

                return (
                  <tr
                    key={r.id}
                    style={isCrossAdmin ? { background: "#fffbeb" } : {}}
                  >
                    <td style={{ fontFamily: "monospace", fontSize: "12px" }}>
                      {r.id}
                    </td>
                    <td style={{ fontWeight: "600" }}>
                      {r.companyName}
                      {isCrossAdmin && (
                        <span
                          style={{
                            display: "block",
                            fontSize: "10px",
                            color: "#b45309",
                            background: "#fef3c7",
                            border: "1px solid #fde68a",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            marginTop: "4px",
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          🔀 Routed dari Admin Sentra
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight: "700" }}>{r.plateNumber}</td>
                    <td>{r.serviceTypeLabel}</td>
                    <td
                      style={{
                        fontSize: "13px",
                        maxWidth: "240px",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                      }}
                    >
                      <div>{r.description}</div>
                      {isCrossAdmin && r.clientPic && (
                        <div
                          style={{
                            marginTop: "10px",
                            borderTop: "1px dashed #fcd34d",
                            paddingTop: "6px",
                            fontSize: "11.5px",
                            color: "#92400e",
                            lineHeight: "1.4",
                          }}
                        >
                          <strong>📞 Informasi Akun Klien (Admin Lain):</strong>
                          <br />• PIC: {r.clientPic.picName}
                          <br />• WA:{" "}
                          <a
                            href={`https://wa.me/${r.clientPic.picPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#2563eb", fontWeight: "bold" }}
                          >
                            +{r.clientPic.picPhone}
                          </a>
                          <br />• Email: {r.clientPic.email}
                          <br />• PT: {r.clientPic.companyName}
                        </div>
                      )}
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="number"
                          className="fleet-input"
                          style={{
                            width: "100px",
                            padding: "4px 8px",
                            fontSize: "13px",
                          }}
                          value={editingCost}
                          disabled={
                            r.status === "completed" || r.status === "cancelled"
                          }
                          onChange={(e) =>
                            handleCostChange(r.id, e.target.value)
                          }
                        />
                        {r.status !== "completed" &&
                          r.status !== "cancelled" && (
                            <button
                              className="fleet-btn fleet-btn-secondary fleet-btn-sm"
                              style={{ padding: "4px 8px" }}
                              onClick={() => handleSaveCost(r, editingCost)}
                            >
                              💾
                            </button>
                          )}
                      </div>
                    </td>
                    <td>
                      {new Date(r.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      {(() => {
                        const isRestricted =
                          adminId === "admin-1" &&
                          [
                            "stnk_renewal",
                            "pajak_renewal",
                            "multiple",
                          ].includes(r.serviceType);
                        if (isRestricted) {
                          return (
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#b91c1c",
                                fontWeight: "bold",
                                background: "#fef2f2",
                                border: "1px solid #fca5a5",
                                padding: "6px 10px",
                                borderRadius: "6px",
                                textAlign: "center",
                              }}
                            >
                              ⚠️ Di-routing ke Admin Padajaya
                            </div>
                          );
                        }
                        return (
                          <select
                            className="fleet-input"
                            style={{
                              width: "150px",
                              padding: "6px 10px",
                              fontSize: "13px",
                              background: "white",
                              fontWeight: "700",
                            }}
                            value={r.status}
                            onChange={(e) =>
                              handleStatusChange(r.id, e.target.value)
                            }
                          >
                            <option value="pending">⏳ Pending</option>
                            <option value="in_progress">⚙️ Diproses</option>
                            <option value="completed">
                              ✅ Selesai (Completed)
                            </option>
                            <option value="cancelled">❌ Dibatalkan</option>
                          </select>
                        );
                      })()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ====================================================
// SUB-VIEW 5: DOCUMENT VERIFICATION
// ====================================================
function VerificationsView({ db, adminId, onUpdate }) {
  const adminCompanies = getClientsForAdminView(adminId);
  const companyIds = adminCompanies.map((c) => c.id);

  const pendingDocs = db.documents.filter((d) => {
    if (d.verificationStatus !== "pending") return false;
    const vehicle = db.vehicles.find((v) => v.id === d.vehicleId);
    return vehicle && companyIds.includes(vehicle.companyId);
  });

  const handleVerify = (docId) => {
    verifyDocument(docId, "verified");
    onUpdate();
    alert("Dokumen berhasil dikonfirmasi (Verified).");
  };

  const handleReject = (docId) => {
    const reason = prompt("Masukkan alasan penolakan berkas:");
    if (reason === null) return; // cancel
    if (!reason.trim()) {
      alert("Alasan penolakan harus diisi.");
      return;
    }
    verifyDocument(docId, "rejected", reason);
    onUpdate();
    alert("Dokumen telah ditolak (Rejected).");
  };

  return (
    <div className="fleet-card">
      <h2
        style={{
          fontSize: "16px",
          fontWeight: "800",
          margin: "0 0 20px 0",
          color: "#1C3967",
        }}
      >
        Antrean Verifikasi Berkas Scan Klien
      </h2>

      {pendingDocs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7a96" }}>
          <span
            style={{ fontSize: "36px", display: "block", marginBottom: "10px" }}
          >
            📦
          </span>
          <p style={{ margin: 0, fontWeight: "600" }}>
            Antrean bersih! Tidak ada dokumen baru yang membutuhkan verifikasi.
          </p>
        </div>
      ) : (
        <div className="verification-card-grid">
          {pendingDocs.map((doc) => (
            <div key={doc.id} className="verification-card">
              <div className="verification-card-header">
                <span
                  className="badge-status neutral"
                  style={{ fontWeight: "700", fontSize: "11px" }}
                >
                  {doc.docTypeLabel}
                </span>
                <span style={{ fontSize: "11px", color: "#6b7a96" }}>
                  {new Date(doc.uploadedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="verification-card-body">
                <p style={{ margin: "0 0 4px 0" }}>
                  Perusahaan: <strong>{doc.companyName}</strong>
                </p>
                <p style={{ margin: "0 0 10px 0" }}>
                  Kendaraan: <strong>{doc.plateNumber}</strong>
                </p>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Membuka pindaian berkas: ${doc.fileName}`);
                  }}
                  className="verification-file-link"
                >
                  📄 {doc.fileName}
                </a>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  className="fleet-btn fleet-btn-danger fleet-btn-sm"
                  onClick={() => handleReject(doc.id)}
                >
                  Tolak Berkas
                </button>
                <button
                  className="fleet-btn fleet-btn-success fleet-btn-sm"
                  onClick={() => handleVerify(doc.id)}
                >
                  Verifikasi Berkas
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
