import React, { useState, useEffect, useRef } from "react";
import {
  getFleetDatabase,
  getDaysRemaining,
  getDocStatus,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  addServiceRequest,
  addDocument,
  updateCompany,
  CURRENT_DATE_STR,
  getAdminById,
} from "../../utils/fleetMockData.js";

export default function ClientDashboard({
  user,
  onLogout,
  currentPath,
  navigate,
}) {
  const [db, setDb] = useState(() => getFleetDatabase());
  const [activeTab, setActiveTab] = useState("dashboard");

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

  // Refresh local state when DB changes
  const refreshData = () => {
    setDb(getFleetDatabase());
  };

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
              vehicles={companyVehicles}
              docs={companyDocs}
              clientId={user.clientId}
              company={company}
              onUpdate={refreshData}
            />
          )}
          {activeTab === "timeline" && (
            <TimelineView vehicles={companyVehicles} />
          )}
          {activeTab === "requests" && (
            <RequestsView requests={companyRequests} />
          )}
          {activeTab === "billing" && (
            <BillingView
              company={company}
              vehiclesCount={companyVehicles.length}
            />
          )}
          {activeTab === "settings" && (
            <SettingsView company={company} onUpdate={refreshData} />
          )}
        </main>
      </div>
    </div>
  );
}

// ====================================================
// SUB-VIEW 1: CLIENT DASHBOARD
// ====================================================
function DashboardView({ vehicles, requests, navigate }) {
  // Compute compliance statistics
  let safeCount = 0;
  let warningCount = 0;
  let dangerCount = 0;

  const alerts = [];

  vehicles.forEach((v) => {
    const kirDays = getDaysRemaining(v.kirExpiry);
    const stnkDays = getDaysRemaining(v.stnkExpiry);
    const pajakDays = getDaysRemaining(v.pajakExpiry);

    const minDays = Math.min(kirDays, stnkDays, pajakDays);

    if (minDays <= 0) {
      dangerCount++;
      // Determine what's expired
      const expiredDocs = [];
      if (kirDays <= 0) expiredDocs.push("KIR");
      if (stnkDays <= 0) expiredDocs.push("STNK");
      if (pajakDays <= 0) expiredDocs.push("Pajak");
      alerts.push({
        type: "danger",
        plate: v.plateNumber,
        typeLabel: v.vehicleType,
        message: `Dokumen ${expiredDocs.join(", ")} telah JATUH TEMPO (${Math.abs(minDays)} hari yang lalu).`,
      });
    } else if (minDays <= 90) {
      warningCount++;
      const warningDocs = [];
      if (kirDays <= 90) warningDocs.push(`KIR (H-${kirDays})`);
      if (stnkDays <= 90) warningDocs.push(`STNK (H-${stnkDays})`);
      if (pajakDays <= 90) warningDocs.push(`Pajak (H-${pajakDays})`);
      alerts.push({
        type: "warning",
        plate: v.plateNumber,
        typeLabel: v.vehicleType,
        message: `Mendekati jatuh tempo: ${warningDocs.join(", ")}.`,
      });
    } else {
      safeCount++;
    }
  });

  return (
    <div>
      {/* Stat Cards */}
      <div className="fleet-stats-grid">
        <div className="fleet-stat-card info">
          <div>
            <div className="stat-val">{vehicles.length}</div>
            <div className="stat-lbl">Total Armada</div>
          </div>
          <div className="stat-icon info">🚚</div>
        </div>
        <div className="fleet-stat-card safe">
          <div>
            <div className="stat-val">{safeCount}</div>
            <div className="stat-lbl">Armada Aman</div>
          </div>
          <div className="stat-icon safe">🟢</div>
        </div>
        <div className="fleet-stat-card warning">
          <div>
            <div className="stat-val">{warningCount}</div>
            <div className="stat-lbl">Mendekati Jatuh Tempo</div>
          </div>
          <div className="stat-icon warning">🟡</div>
        </div>
        <div className="fleet-stat-card danger">
          <div>
            <div className="stat-val">{dangerCount}</div>
            <div className="stat-lbl">Jatuh Tempo (Expired)</div>
          </div>
          <div className="stat-icon danger">🔴</div>
        </div>
      </div>

      {/* Action Prompt */}
      {(warningCount > 0 || dangerCount > 0) && (
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h3
              style={{
                margin: "0 0 4px 0",
                color: "#92400e",
                fontSize: "16px",
                fontWeight: "800",
              }}
            >
              ⚠️ Butuh Tindakan Segera
            </h3>
            <p style={{ margin: 0, color: "#78350f", fontSize: "13px" }}>
              Terdapat {warningCount + dangerCount} kendaraan yang dokumennya
              akan/telah habis masa berlakunya. Klik tombol di samping untuk
              mengurus perpanjangan berkas.
            </p>
          </div>
          <button
            className="fleet-btn fleet-btn-accent"
            onClick={() => navigate("/fleet/client/vehicles")}
          >
            Urus Dokumen Sekarang
          </button>
        </div>
      )}

      {/* Alerts Banners */}
      <div className="fleet-card">
        <h2
          style={{
            fontSize: "16px",
            fontWeight: "800",
            margin: "0 0 20px 0",
            color: "#1C3967",
          }}
        >
          Notifikasi Kepatuhan Dokumen
        </h2>
        {alerts.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "30px", color: "#6b7a96" }}
          >
            <span
              style={{
                fontSize: "32px",
                display: "block",
                marginBottom: "10px",
              }}
            >
              🎉
            </span>
            <p style={{ margin: 0, fontWeight: "600" }}>
              Hebat! Semua armada kendaraan Anda dalam status Aman.
            </p>
          </div>
        ) : (
          <div className="fleet-alerts-container">
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`fleet-alert-banner ${alert.type === "danger" ? "expired" : ""}`}
              >
                <div className="alert-message-box">
                  <div className="alert-icon">
                    {alert.type === "danger" ? "🔴" : "🟡"}
                  </div>
                  <div className="alert-text">
                    <h4>
                      {alert.plate} - {alert.typeLabel}
                    </h4>
                    <p>{alert.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Action Info */}
      <div
        className="fleet-card"
        style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
      >
        <h3
          style={{ margin: "0 0 10px 0", fontSize: "15px", color: "#1C3967" }}
        >
          💡 Informasi Layanan Sentra KIR:
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            color: "#475569",
            lineHeight: "1.6",
          }}
        >
          Pengurusan melalui Sentra Fleet dijamin aman, resmi, dan berkas asli
          akan dijemput/diantar kembali oleh kurir internal kami. Status
          pengerjaan dapat Anda pantau secara langsung melalui tab{" "}
          <strong>"Status Pengurusan"</strong>. Untuk kendala teknis atau
          pengurusan khusus, hubungi PIC admin kami via WhatsApp di link kontak
          yang tersedia di landing page.
        </p>
      </div>
    </div>
  );
}

// ====================================================
// SUB-VIEW 2: VEHICLE MANAGEMENT
// ====================================================
function VehiclesView({ vehicles, docs, clientId, company, onUpdate }) {
  const [search, setSearch] = useState("");
  const [modalType, setModalType] = useState(null); // 'add' | 'edit' | 'upload' | 'urus' | null
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [uploadDocType, setUploadDocType] = useState("kir");
  const [uploadFileName, setUploadFileName] = useState("");
  const [requestServiceType, setRequestServiceType] = useState("kir_renewal");
  const [requestDesc, setRequestDesc] = useState("");
  const [requestLaporHilang, setRequestLaporHilang] = useState(false);
  const [requestMediaNasional, setRequestMediaNasional] = useState(false);
  const [rescanDocType, setRescanDocType] = useState(null); // 'kartuKir' | 'sertifikatKir' | 'stnk' | null
  const [previewDoc, setPreviewDoc] = useState(null); // { key, label, fileName } for preview modal
  const [vehicleDetailModal, setVehicleDetailModal] = useState(null); // full vehicle data modal

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (modalType !== null) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [modalType]);

  // Form states for Add/Edit
  const [formData, setFormData] = useState({
    plateNumber: "",
    vehicleType: "Delvan",
    testNumber: "",
    kirExpiry: "",
    stnkExpiry: "",
    pajakExpiry: "",
    simDriverExpiry: "",
    notes: "",
    // Data Kartu Kendaraan
    kkOwnerName: "",
    kkOwnerAddress: "",
    kkPlateNumber: "",
    kkFrameNumber: "",
    kkEngineNumber: "",
    kkTestNumber: "",
    // Data Kartu KIR
    kirOwnerName: "",
    kirPlateNumber: "",
    kirTestNumber: "",
    kirVehicleType: "Delvan",
    kirBrand: "",
    // Data STNK
    stnkOwnerName: "",
    stnkPlateNumber: "",
    stnkOwnerAddress: "",
    stnkBrand: "",
    stnkVehicleType: "",
    stnkVehicleJenis: "Delvan",
    stnkModel: "",
    stnkYearManufactured: "",
    stnkFrameNumber: "",
    stnkEngineNumber: "",
    kartuKirFile: null,
    kartuKirHilang: false,
    sertifikatKirFile: null,
    sertifikatKirHilang: false,
    stnkFile: null,
  });

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.vehicleType.toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpenAdd = () => {
    setFormData({
      plateNumber: "",
      vehicleType: "Delvan",
      testNumber: "",
      kirExpiry: "",
      stnkExpiry: "",
      pajakExpiry: "",
      simDriverExpiry: "",
      notes: "",
      // Data Kartu Kendaraan
      kkOwnerName: "",
      kkOwnerAddress: "",
      kkPlateNumber: "",
      kkFrameNumber: "",
      kkEngineNumber: "",
      kkTestNumber: "",
      // Data Kartu KIR
      kirOwnerName: "",
      kirPlateNumber: "",
      kirTestNumber: "",
      kirVehicleType: "Delvan",
      kirBrand: "",
      // Data STNK
      stnkOwnerName: "",
      stnkPlateNumber: "",
      stnkOwnerAddress: "",
      stnkBrand: "",
      stnkVehicleType: "",
      stnkVehicleJenis: "Delvan",
      stnkModel: "",
      stnkYearManufactured: "",
      stnkFrameNumber: "",
      stnkEngineNumber: "",
      kartuKirFile: null,
      kartuKirHilang: false,
      sertifikatKirFile: null,
      sertifikatKirHilang: false,
      stnkFile: null,
    });
    setModalType("add");
  };

  const handleOpenEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      plateNumber: vehicle.plateNumber,
      vehicleType: vehicle.vehicleType,
      testNumber: vehicle.testNumber || "",
      kirExpiry: vehicle.kirExpiry,
      stnkExpiry: vehicle.stnkExpiry,
      pajakExpiry: vehicle.pajakExpiry,
      simDriverExpiry: vehicle.simDriverExpiry || "",
      notes: vehicle.notes || "",
      // Data Kartu Kendaraan
      kkOwnerName: vehicle.kkOwnerName || "",
      kkOwnerAddress: vehicle.kkOwnerAddress || "",
      kkPlateNumber: vehicle.kkPlateNumber || "",
      kkFrameNumber: vehicle.kkFrameNumber || "",
      kkEngineNumber: vehicle.kkEngineNumber || "",
      kkTestNumber: vehicle.kkTestNumber || "",
      // Data Kartu KIR
      kirOwnerName: vehicle.kirOwnerName || "",
      kirPlateNumber: vehicle.kirPlateNumber || "",
      kirTestNumber: vehicle.kirTestNumber || "",
      kirVehicleType: vehicle.kirVehicleType || "Delvan",
      kirBrand: vehicle.kirBrand || "",
      // Data STNK
      stnkOwnerName: vehicle.stnkOwnerName || "",
      stnkPlateNumber: vehicle.stnkPlateNumber || "",
      stnkOwnerAddress: vehicle.stnkOwnerAddress || "",
      stnkBrand: vehicle.stnkBrand || "",
      stnkVehicleType: vehicle.stnkVehicleType || "",
      stnkVehicleJenis: vehicle.stnkVehicleJenis || "Delvan",
      stnkModel: vehicle.stnkModel || "",
      stnkYearManufactured: vehicle.stnkYearManufactured || "",
      stnkFrameNumber: vehicle.stnkFrameNumber || "",
      stnkEngineNumber: vehicle.stnkEngineNumber || "",
      kartuKirFile: null,
      kartuKirHilang: false,
      sertifikatKirFile: null,
      sertifikatKirHilang: false,
      stnkFile: null,
    });
    setModalType("edit");
  };

  // Set selected document file (no scanning, just stores the file name)
  const setDocumentFile = (docType, fileName) => {
    setFormData((prev) => ({
      ...prev,
      [`${docType}File`]: fileName,
    }));
  };

  // Remove selected document file
  const removeDocumentFile = (docType) => {
    setFormData((prev) => ({
      ...prev,
      [`${docType}File`]: null,
    }));
  };

  const handleOpenUpload = (vehicle) => {
    setSelectedVehicle(vehicle);
    setUploadDocType("kir");
    setUploadFileName("");
    setModalType("upload");
  };

  // Helper function to get description based on service type and vehicle
  const getDescriptionForServiceType = (serviceType, vehicle) => {
    if (!vehicle) return "";

    const descriptions = {
      kir_renewal: `Pengurusan perpanjangan Uji KIR untuk kendaraan ${vehicle.plateNumber} yang habis pada tanggal ${vehicle.kirExpiry}.`,

      stnk_renewal: `Pengurusan perpanjangan STNK (Surat Tanda Nomor Kendaraan) 5 tahunan untuk kendaraan ${vehicle.plateNumber} yang habis tanggal ${vehicle.stnkExpiry}.`,

      pajak_renewal: `Pengurusan perpanjangan Pajak Kendaraan Tahunan untuk kendaraan ${vehicle.plateNumber} yang habis tanggal ${vehicle.pajakExpiry}. Proses pembayaran dan pengurusan dokumen kami tangani.`,

      buka_blokir_kir: `Pengurusan Buka Blokir Data Kendaraan KIR untuk kendaraan ${vehicle.plateNumber} karena KIR telah kadaluwarsa lebih dari 1 tahun (Habis sejak ${vehicle.kirExpiry}). Diperlukan proses khusus ke Dishub untuk membuka status terblokir.`,
    };

    return descriptions[serviceType] || "";
  };

  // Update description automatically when service type changes
  useEffect(() => {
    if (selectedVehicle && requestServiceType) {
      const newDesc = getDescriptionForServiceType(
        requestServiceType,
        selectedVehicle,
      );
      setRequestDesc(newDesc);
    }
  }, [requestServiceType, selectedVehicle]);

  const handleOpenUrus = (vehicle) => {
    setSelectedVehicle(vehicle);
    setRequestLaporHilang(false);
    setRequestMediaNasional(false);
    // Auto detect what needs renewal
    const kirDays = getDaysRemaining(vehicle.kirExpiry);
    const stnkDays = getDaysRemaining(vehicle.stnkExpiry);
    const pajakDays = getDaysRemaining(vehicle.pajakExpiry);

    let initialServiceType = "kir_renewal";

    if (kirDays <= -365) {
      initialServiceType = "buka_blokir_kir";
    } else if (kirDays <= 90 && (stnkDays <= 90 || pajakDays <= 90)) {
      initialServiceType = "multiple";
    } else if (kirDays <= 90) {
      initialServiceType = "kir_renewal";
    } else if (stnkDays <= 90) {
      initialServiceType = "stnk_renewal";
    } else {
      initialServiceType = "pajak_renewal";
    }

    setRequestServiceType(initialServiceType);
    const initialDesc = getDescriptionForServiceType(
      initialServiceType,
      vehicle,
    );
    setRequestDesc(initialDesc);
    setModalType("urus");
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.plateNumber ||
      !formData.testNumber ||
      !formData.kirExpiry ||
      !formData.stnkExpiry ||
      !formData.pajakExpiry
    )
      return;

    const isKartuKirOk = formData.kartuKirHilang || !!formData.kartuKirFile;
    const isSertifikatKirOk =
      formData.sertifikatKirHilang || !!formData.sertifikatKirFile;
    const isStnkOk = !!formData.stnkFile;

    if (!isKartuKirOk || !isSertifikatKirOk || !isStnkOk) {
      alert(
        "Harap unggah dokumen Kartu KIR, Sertifikat KIR, dan STNK terlebih dahulu (kecuali dokumen KIR yang dinyatakan Hilang).",
      );
      return;
    }

    addVehicle({
      companyId: clientId,
      plateNumber: formData.plateNumber.toUpperCase(),
      vehicleType: formData.vehicleType,
      testNumber: formData.testNumber,
      kirExpiry: formData.kirExpiry,
      stnkExpiry: formData.stnkExpiry,
      pajakExpiry: formData.pajakExpiry,
      notes: formData.notes,
      // Legacy data mappings for backward compatibility
      ownerName:
        formData.kkOwnerName ||
        formData.kirOwnerName ||
        formData.stnkOwnerName ||
        "",
      ownerAddress: formData.kkOwnerAddress || formData.stnkOwnerAddress || "",
      frameNumber: formData.kkFrameNumber || formData.stnkFrameNumber || "",
      engineNumber: formData.kkEngineNumber || formData.stnkEngineNumber || "",
      brand: formData.kirBrand || formData.stnkBrand || "",
      model: formData.stnkModel || "",
      yearManufactured: formData.stnkYearManufactured || "",
      // Data Kartu Kendaraan
      kkOwnerName: formData.kkOwnerName || "",
      kkOwnerAddress: formData.kkOwnerAddress || "",
      kkPlateNumber: formData.kkPlateNumber || "",
      kkFrameNumber: formData.kkFrameNumber || "",
      kkEngineNumber: formData.kkEngineNumber || "",
      kkTestNumber: formData.kkTestNumber || "",
      // Data Kartu KIR
      kirOwnerName: formData.kirOwnerName || "",
      kirPlateNumber: formData.kirPlateNumber || "",
      kirTestNumber: formData.kirTestNumber || "",
      kirVehicleType: formData.kirVehicleType || "Delvan",
      kirBrand: formData.kirBrand || "",
      // Data STNK
      stnkOwnerName: formData.stnkOwnerName || "",
      stnkPlateNumber: formData.stnkPlateNumber || "",
      stnkOwnerAddress: formData.stnkOwnerAddress || "",
      stnkBrand: formData.stnkBrand || "",
      stnkVehicleType: formData.stnkVehicleType || "",
      stnkVehicleJenis: formData.stnkVehicleJenis || "Delvan",
      stnkModel: formData.stnkModel || "",
      stnkYearManufactured: formData.stnkYearManufactured || "",
      stnkFrameNumber: formData.stnkFrameNumber || "",
      stnkEngineNumber: formData.stnkEngineNumber || "",
      kartuKirHilang: !!formData.kartuKirHilang,
      sertifikatKirHilang: !!formData.sertifikatKirHilang,
      kartuKirFileName: formData.kartuKirHilang ? null : formData.kartuKirFile,
      sertifikatKirFileName: formData.sertifikatKirHilang
        ? null
        : formData.sertifikatKirFile,
      stnkFileName: formData.stnkFile,
    });

    setModalType(null);
    onUpdate();
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.plateNumber ||
      !formData.testNumber ||
      !formData.kirExpiry ||
      !formData.stnkExpiry ||
      !formData.pajakExpiry
    )
      return;

    updateVehicle(selectedVehicle.id, {
      plateNumber: formData.plateNumber.toUpperCase(),
      vehicleType: formData.vehicleType,
      testNumber: formData.testNumber,
      kirExpiry: formData.kirExpiry,
      stnkExpiry: formData.stnkExpiry,
      pajakExpiry: formData.pajakExpiry,
      simDriverExpiry: formData.simDriverExpiry,
      notes: formData.notes,
      // Legacy data mappings for backward compatibility (preserve existing if empty)
      ownerName:
        formData.kkOwnerName ||
        formData.kirOwnerName ||
        formData.stnkOwnerName ||
        selectedVehicle.ownerName ||
        "",
      ownerAddress:
        formData.kkOwnerAddress ||
        formData.stnkOwnerAddress ||
        selectedVehicle.ownerAddress ||
        "",
      frameNumber:
        formData.kkFrameNumber ||
        formData.stnkFrameNumber ||
        selectedVehicle.frameNumber ||
        "",
      engineNumber:
        formData.kkEngineNumber ||
        formData.stnkEngineNumber ||
        selectedVehicle.engineNumber ||
        "",
      brand:
        formData.kirBrand || formData.stnkBrand || selectedVehicle.brand || "",
      model: formData.stnkModel || selectedVehicle.model || "",
      yearManufactured:
        formData.stnkYearManufactured || selectedVehicle.yearManufactured || "",
      // Data Kartu Kendaraan
      kkOwnerName: formData.kkOwnerName || selectedVehicle.kkOwnerName || "",
      kkOwnerAddress:
        formData.kkOwnerAddress || selectedVehicle.kkOwnerAddress || "",
      kkPlateNumber:
        formData.kkPlateNumber || selectedVehicle.kkPlateNumber || "",
      kkFrameNumber:
        formData.kkFrameNumber || selectedVehicle.kkFrameNumber || "",
      kkEngineNumber:
        formData.kkEngineNumber || selectedVehicle.kkEngineNumber || "",
      kkTestNumber: formData.kkTestNumber || selectedVehicle.kkTestNumber || "",
      // Data Kartu KIR
      kirOwnerName: formData.kirOwnerName || selectedVehicle.kirOwnerName || "",
      kirPlateNumber:
        formData.kirPlateNumber || selectedVehicle.kirPlateNumber || "",
      kirTestNumber:
        formData.kirTestNumber || selectedVehicle.kirTestNumber || "",
      kirVehicleType:
        formData.kirVehicleType || selectedVehicle.kirVehicleType || "Delvan",
      kirBrand: formData.kirBrand || selectedVehicle.kirBrand || "",
      // Data STNK
      stnkOwnerName:
        formData.stnkOwnerName || selectedVehicle.stnkOwnerName || "",
      stnkPlateNumber:
        formData.stnkPlateNumber || selectedVehicle.stnkPlateNumber || "",
      stnkOwnerAddress:
        formData.stnkOwnerAddress || selectedVehicle.stnkOwnerAddress || "",
      stnkBrand: formData.stnkBrand || selectedVehicle.stnkBrand || "",
      stnkVehicleType:
        formData.stnkVehicleType || selectedVehicle.stnkVehicleType || "",
      stnkVehicleJenis:
        formData.stnkVehicleJenis ||
        selectedVehicle.stnkVehicleJenis ||
        "Delvan",
      stnkModel: formData.stnkModel || selectedVehicle.stnkModel || "",
      stnkYearManufactured:
        formData.stnkYearManufactured ||
        selectedVehicle.stnkYearManufactured ||
        "",
      stnkFrameNumber:
        formData.stnkFrameNumber || selectedVehicle.stnkFrameNumber || "",
      stnkEngineNumber:
        formData.stnkEngineNumber || selectedVehicle.stnkEngineNumber || "",
      kartuKirHilang: !!formData.kartuKirHilang,
      sertifikatKirHilang: !!formData.sertifikatKirHilang,
      kartuKirFileName: formData.kartuKirHilang
        ? null
        : formData.kartuKirFile || selectedVehicle.kartuKirFileName,
      sertifikatKirFileName: formData.sertifikatKirHilang
        ? null
        : formData.sertifikatKirFile || selectedVehicle.sertifikatKirFileName,
      stnkFileName: formData.stnkFile || selectedVehicle.stnkFileName,
    });

    setModalType(null);
    onUpdate();
  };

  const handleDelete = (id) => {
    if (
      confirm(
        "Hapus kendaraan ini dari armada? Seluruh dokumen dan order terikat akan ikut dihapus.",
      )
    ) {
      deleteVehicle(id);
      onUpdate();
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadFileName) return;

    addDocument({
      vehicleId: selectedVehicle.id,
      docType: uploadDocType,
      fileName: uploadFileName,
    });

    alert(
      "Dokumen berhasil diunggah! Status dokumen saat ini: Menunggu Verifikasi Admin.",
    );
    setModalType(null);
    onUpdate();
  };

  // hidden file input ref for document upload
  const scanInputRef = useRef(null);

  const handleFileSelected = (e, docType) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      const update = {};
      update[`${docType}FileName`] = fileName;
      updateVehicle(selectedVehicle.id, update);
      setRescanDocType(null);
      onUpdate();
    }
  };

  const handleRescanDoc = (docType) => {
    if (scanInputRef.current) {
      scanInputRef.current.accept = ".jpeg,.jpg,.png,.pdf";
      scanInputRef.current.click();
    }
  };

  const handleUrusSubmit = (e) => {
    e.preventDefault();

    // Calculate add-on costs
    let addOnCost = 0;
    let addOnDesc = "";

    if (requestLaporHilang) {
      addOnCost += 50000;
      addOnDesc += "\n• Bantu Urus Laporan Kehilangan Kepolisian (Rp 50.000)";
    }
    if (requestMediaNasional) {
      addOnCost += 50000;
      addOnDesc += "\n• Bantu Urus Media Nasional (Rp 50.000)";
    }

    let baseCost;
    if (requestServiceType === "multiple") {
      baseCost = 750000;
    } else if (requestServiceType === "buka_blokir_kir") {
      baseCost = 1500000;
    } else {
      baseCost = 350000;
    }

    addServiceRequest({
      companyId: clientId,
      vehicleId: selectedVehicle.id,
      serviceType: requestServiceType,
      serviceTypeLabel:
        requestServiceType === "kir_renewal"
          ? "Perpanjangan KIR"
          : requestServiceType === "stnk_renewal"
            ? "Perpanjangan STNK"
            : requestServiceType === "pajak_renewal"
              ? "Perpanjangan Pajak"
              : requestServiceType === "buka_blokir_kir"
                ? "Buka Blokir KIR"
                : "Pengurusan KIR & STNK",
      description:
        requestDesc + (addOnDesc ? `\n\nLayanan Tambahan:${addOnDesc}` : ""),
      estimatedCost: baseCost + addOnCost,
    });

    alert(
      'Pengajuan pengurusan berhasil dibuat! Silakan cek menu "Status Pengurusan" secara berkala.',
    );
    setModalType(null);
    onUpdate();
  };

  // Helper to get general status flag for row highlights
  const getOverallStatus = (v) => {
    const kirDays = getDaysRemaining(v.kirExpiry);
    const stnkDays = getDaysRemaining(v.stnkExpiry);
    const pajakDays = getDaysRemaining(v.pajakExpiry);
    const minDays = Math.min(kirDays, stnkDays, pajakDays);

    if (minDays <= 0) return { code: "danger", label: "Jatuh Tempo" };
    if (minDays <= 90) return { code: "warning", label: "Warning" };
    return { code: "success", label: "Aman" };
  };

  // Returns color scheme for an expiry card based on days remaining
  const getExpiryCardStyle = (expiryStr) => {
    const days = getDaysRemaining(expiryStr);
    if (days <= 0) {
      // Jatuh tempo - merah
      return {
        background: "#fef2f2",
        border: "1px solid #fecaca",
        labelColor: "#b91c1c",
        valueColor: "#991b1b",
        statusColor: "#b91c1c",
      };
    } else if (days <= 30) {
      // Mendekati jatuh tempo - kuning
      return {
        background: "#fffbeb",
        border: "1px solid #fde68a",
        labelColor: "#b45309",
        valueColor: "#92400e",
        statusColor: "#b45309",
      };
    }
    // Aman - hijau
    return {
      background: "#f0fdf4",
      border: "1px solid #bbf7d0",
      labelColor: "#15803d",
      valueColor: "#166534",
      statusColor: "#15803d",
    };
  };

  return (
    <div className="fleet-card">
      {/* hidden file input for document upload */}
      <input
        type="file"
        ref={scanInputRef}
        accept=".jpeg,.jpg,.png,.pdf"
        style={{ display: "none" }}
        onChange={(e) => {
          if (rescanDocType) {
            handleFileSelected(e, rescanDocType);
          }
        }}
      />
      <div className="table-controls">
        <input
          type="text"
          className="fleet-input table-search"
          placeholder="Cari plat nomor atau tipe..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="fleet-btn fleet-btn-primary" onClick={handleOpenAdd}>
          ➕ Tambah Kendaraan
        </button>
      </div>

      <div className="fleet-table-container">
        <table className="fleet-table">
          <thead>
            <tr>
              <th>Plat Nomor</th>
              <th>Tipe Armada</th>
              <th>Nomor KIR</th>
              <th>Masa Berlaku KIR</th>
              <th>Masa Berlaku STNK</th>
              <th>Pajak Tahunan</th>
              <th>SIM Driver</th>
              <th>Dokumen Diupload</th>
              <th>Status</th>
              <th style={{ textAlign: "center" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length === 0 ? (
              <tr>
                <td
                  colSpan="10"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: "#6b7a96",
                  }}
                >
                  Tidak ada kendaraan armada terdaftar.
                </td>
              </tr>
            ) : (
              filteredVehicles.map((v) => {
                const overall = getOverallStatus(v);
                const vehicleDocs = docs.filter((d) => d.vehicleId === v.id);

                return (
                  <tr
                    key={v.id}
                    onClick={() => setVehicleDetailModal(v)}
                    style={{
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f0fdf4";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <td style={{ fontWeight: "700" }}>{v.plateNumber}</td>
                    <td>{v.vehicleType}</td>
                    <td style={{ fontFamily: "monospace" }}>
                      {v.testNumber || "-"}
                    </td>
                    <td>
                      <span className={getDocStatus(v.kirExpiry).textClass}>
                        {v.kirExpiry} ({getDaysRemaining(v.kirExpiry)} hari)
                      </span>
                    </td>
                    <td>
                      <span className={getDocStatus(v.stnkExpiry).textClass}>
                        {v.stnkExpiry}
                      </span>
                    </td>
                    <td>
                      <span className={getDocStatus(v.pajakExpiry).textClass}>
                        {v.pajakExpiry}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          v.simDriverExpiry
                            ? getDocStatus(v.simDriverExpiry).textClass
                            : "badge-status neutral"
                        }
                      >
                        {v.simDriverExpiry || "-"}
                      </span>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "5px",
                          alignItems: "center",
                        }}
                      >
                        <button
                          className="fleet-btn fleet-btn-secondary fleet-btn-sm"
                          style={{
                            padding: "4px 12px",
                            fontSize: "11px",
                            whiteSpace: "nowrap",
                            background: "#eff6ff",
                            color: "#1e40af",
                            border: "1px solid #bfdbfe",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVehicle(v);
                            setModalType("dokumen");
                          }}
                        >
                          📄 Dokumen Diupload
                        </button>
                        {v.kartuKirHilang && (
                          <span style={{ fontSize: "10px", color: "#dc2626" }}>
                            ⚠️ Ada dokumen hilang
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge-status ${overall.code}`}>
                        {overall.label}
                      </span>
                    </td>
                    <td
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {(overall.code === "warning" ||
                          overall.code === "danger") && (
                          <button
                            className="fleet-btn fleet-btn-accent fleet-btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenUrus(v);
                            }}
                          >
                            URUS SEKARANG
                          </button>
                        )}
                        <button
                          className="fleet-btn fleet-btn-secondary fleet-btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(v);
                          }}
                          title="Edit Kendaraan"
                        >
                          ✏️
                        </button>
                        <button
                          className="fleet-btn fleet-btn-danger fleet-btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(v.id);
                          }}
                          title="Hapus"
                          style={{ padding: "6px" }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ====================================================
          MODAL: ADD / EDIT VEHICLE
          ==================================================== */}
      {(modalType === "add" || modalType === "edit") && (
        <div className="fleet-modal-overlay">
          <div className="fleet-modal">
            <div className="fleet-modal-header">
              <h3>
                {modalType === "add"
                  ? "Tambah Kendaraan Baru"
                  : "Edit Data Kendaraan"}
              </h3>
              <span
                className="btn-close-modal"
                onClick={() => setModalType(null)}
              >
                ×
              </span>
            </div>
            <form
              onSubmit={
                modalType === "add" ? handleAddSubmit : handleEditSubmit
              }
            >
              <div className="fleet-modal-body">
                <div className="fleet-form-group">
                  <label className="fleet-label">Plat Nomor Kendaraan *</label>
                  <input
                    type="text"
                    className="fleet-input"
                    placeholder="B 1234 ABC"
                    value={formData.plateNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, plateNumber: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="fleet-form-group">
                  <label className="fleet-label">
                    Tipe / Jenis Kendaraan *
                  </label>
                  <div
                    style={{
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      borderRadius: "8px",
                      padding: "12px",
                      fontSize: "12.5px",
                      color: "#1e40af",
                      marginBottom: "12px",
                      lineHeight: "1.5",
                      textAlign: "left",
                    }}
                  >
                    ℹ️ <strong></strong> Sesuaikan jenis / type kendaraan
                    berdasarkan dokumen KIR dan STNK. Apabila ada ketidaksamaan
                    jenis / type kendaraan antara STNK dan Buku serta kartu KIR,
                    Harap disesuaikan terlebih dahulu.
                  </div>
                  <select
                    className="fleet-input"
                    value={formData.vehicleType}
                    onChange={(e) =>
                      setFormData({ ...formData, vehicleType: e.target.value })
                    }
                    style={{ background: "white" }}
                  >
                    <option value="Delvan">Delvan</option>
                    <option value="Blindvan">Blindvan</option>
                    <option value="Pick Up">Pick Up</option>
                    <option value="Double Cabin">Double Cabin</option>
                    <option value="Minibus">Minibus</option>
                    <option value="Travel">Travel</option>
                    <option value="Bus">Bus</option>
                    <option value="Truck CDE">Truck CDE</option>
                    <option value="Truck CDD">Truck CDD</option>
                    <option value="Light Truck">Light Truck</option>
                    <option value="Box">Box</option>
                    <option value="Truck">Truck</option>
                    <option value="Truck Wingbox">Truck Wingbox</option>
                    <option value="Truk Gandeng">Truk Gandeng</option>
                    <option value="Kereta Tempelan">Kereta Tempelan</option>
                    <option value="Trailer">Trailer</option>
                  </select>
                </div>

                <div className="fleet-form-group">
                  <label className="fleet-label">Nomor Buku Uji KIR *</label>
                  <input
                    type="text"
                    className="fleet-input"
                    placeholder="JKT-xxxxxxx"
                    value={formData.testNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, testNumber: e.target.value })
                    }
                    required
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div className="fleet-form-group">
                    <label className="fleet-label">Kadaluwarsa KIR *</label>
                    <input
                      type="date"
                      className="fleet-input"
                      value={formData.kirExpiry}
                      onChange={(e) =>
                        setFormData({ ...formData, kirExpiry: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="fleet-form-group">
                    <label className="fleet-label">
                      Kadaluwarsa STNK (5 Tahunan) *
                    </label>
                    <input
                      type="date"
                      className="fleet-input"
                      value={formData.stnkExpiry}
                      onChange={(e) =>
                        setFormData({ ...formData, stnkExpiry: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="fleet-form-group">
                  <label className="fleet-label">
                    Kadaluwarsa Pajak (Tahunan) *
                  </label>
                  <input
                    type="date"
                    className="fleet-input"
                    value={formData.pajakExpiry}
                    onChange={(e) =>
                      setFormData({ ...formData, pajakExpiry: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="fleet-form-group">
                  <label className="fleet-label">
                    Masa Berlaku SIM Driver (Opsional)
                  </label>
                  <div
                    style={{
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      fontSize: "12px",
                      color: "#1e40af",
                      marginBottom: "10px",
                      lineHeight: "1.4",
                      textAlign: "left",
                    }}
                  >
                    ℹ️ Surat Izin Mengemudi (SIM) berlaku di seluruh wilayah
                    Indonesia. Tanggal kedaluwarsa yang tercatat akan membantu
                    Anda memantau masa berlaku SIM driver armada perusahaan.
                  </div>
                  <input
                    type="date"
                    className="fleet-input"
                    value={formData.simDriverExpiry}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        simDriverExpiry: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Data Dokumen Kendaraan (manual input per dokumen) */}

                {/* 1. Data Kartu Kendaraan */}
                <div
                  style={{
                    borderTop: "2px solid #e2e8f0",
                    paddingTop: "20px",
                    marginTop: "8px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: "800",
                      color: "#1C3967",
                      margin: "0 0 16px 0",
                    }}
                  >
                    Data Sertifikat KIR
                  </h4>
                  <div className="fleet-form-group">
                    <label className="fleet-label">Nama Pemilik</label>
                    <input
                      type="text"
                      className="fleet-input"
                      placeholder="Nama pemilik pada Kartu Kendaraan"
                      value={formData.kkOwnerName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          kkOwnerName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="fleet-form-group">
                    <label className="fleet-label">Alamat Pemilik</label>
                    <input
                      type="text"
                      className="fleet-input"
                      placeholder="Alamat pemilik pada Kartu Kendaraan"
                      value={formData.kkOwnerAddress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          kkOwnerAddress: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <div className="fleet-form-group">
                      <label className="fleet-label">No Pol / Nomor Plat</label>
                      <input
                        type="text"
                        className="fleet-input"
                        placeholder="B 1234 ABC"
                        value={formData.kkPlateNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            kkPlateNumber: e.target.value.toUpperCase(),
                          })
                        }
                      />
                    </div>
                    <div className="fleet-form-group">
                      <label className="fleet-label">No Uji Kendaraan</label>
                      <input
                        type="text"
                        className="fleet-input"
                        placeholder="No Uji"
                        value={formData.kkTestNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            kkTestNumber: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <div className="fleet-form-group">
                      <label className="fleet-label">No Rangka</label>
                      <input
                        type="text"
                        className="fleet-input"
                        placeholder="Nomor rangka"
                        value={formData.kkFrameNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            kkFrameNumber: e.target.value.toUpperCase(),
                          })
                        }
                      />
                    </div>
                    <div className="fleet-form-group">
                      <label className="fleet-label">No Mesin</label>
                      <input
                        type="text"
                        className="fleet-input"
                        placeholder="Nomor mesin"
                        value={formData.kkEngineNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            kkEngineNumber: e.target.value.toUpperCase(),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Data Kartu KIR */}
                <div
                  style={{
                    borderTop: "2px solid #e2e8f0",
                    paddingTop: "20px",
                    marginTop: "8px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: "800",
                      color: "#1C3967",
                      margin: "0 0 16px 0",
                    }}
                  >
                    Data Kartu KIR
                  </h4>
                  <div className="fleet-form-group">
                    <label className="fleet-label">Nama Pemilik</label>
                    <input
                      type="text"
                      className="fleet-input"
                      placeholder="Nama pemilik pada Kartu KIR"
                      value={formData.kirOwnerName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          kirOwnerName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <div className="fleet-form-group">
                      <label className="fleet-label">No Pol / Nomor Plat</label>
                      <input
                        type="text"
                        className="fleet-input"
                        placeholder="B 1234 ABC"
                        value={formData.kirPlateNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            kirPlateNumber: e.target.value.toUpperCase(),
                          })
                        }
                      />
                    </div>
                    <div className="fleet-form-group">
                      <label className="fleet-label">No Uji Kendaraan</label>
                      <input
                        type="text"
                        className="fleet-input"
                        placeholder="No Uji"
                        value={formData.kirTestNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            kirTestNumber: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <div className="fleet-form-group">
                      <label className="fleet-label">Jenis Kendaraan</label>
                      <select
                        className="fleet-input"
                        value={formData.kirVehicleType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            kirVehicleType: e.target.value,
                          })
                        }
                        style={{ background: "white" }}
                      >
                        <option value="Delvan">Delvan</option>
                        <option value="Blindvan">Blindvan</option>
                        <option value="Pick Up">Pick Up</option>
                        <option value="Double Cabin">Double Cabin</option>
                        <option value="Minibus">Minibus</option>
                        <option value="Travel">Travel</option>
                        <option value="Bus">Bus</option>
                        <option value="Truck CDE">Truck CDE</option>
                        <option value="Truck CDD">Truck CDD</option>
                        <option value="Light Truck">Light Truck</option>
                        <option value="Box">Box</option>
                        <option value="Truck">Truck</option>
                        <option value="Truck Wingbox">Truck Wingbox</option>
                        <option value="Truk Gandeng">Truk Gandeng</option>
                        <option value="Kereta Tempelan">Kereta Tempelan</option>
                        <option value="Trailer">Trailer</option>
                      </select>
                    </div>
                    <div className="fleet-form-group">
                      <label className="fleet-label">Merek / Tipe</label>
                      <input
                        type="text"
                        className="fleet-input"
                        placeholder="Contoh: Mitsubishi/Colt Diesel"
                        value={formData.kirBrand}
                        onChange={(e) =>
                          setFormData({ ...formData, kirBrand: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Data STNK */}
                <div
                  style={{
                    borderTop: "2px solid #e2e8f0",
                    paddingTop: "20px",
                    marginTop: "8px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: "800",
                      color: "#1C3967",
                      margin: "0 0 16px 0",
                    }}
                  >
                    Data STNK
                  </h4>
                  <div className="fleet-form-group">
                    <label className="fleet-label">Nama Pemilik</label>
                    <input
                      type="text"
                      className="fleet-input"
                      placeholder="Nama pemilik pada STNK"
                      value={formData.stnkOwnerName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stnkOwnerName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="fleet-form-group">
                    <label className="fleet-label">Alamat Pemilik</label>
                    <input
                      type="text"
                      className="fleet-input"
                      placeholder="Alamat pemilik pada STNK"
                      value={formData.stnkOwnerAddress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stnkOwnerAddress: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <div className="fleet-form-group">
                      <label className="fleet-label">No Pol / Nomor Plat</label>
                      <input
                        type="text"
                        className="fleet-input"
                        placeholder="B 1234 ABC"
                        value={formData.stnkPlateNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stnkPlateNumber: e.target.value.toUpperCase(),
                          })
                        }
                      />
                    </div>
                    <div className="fleet-form-group">
                      <label className="fleet-label">Merek</label>
                      <input
                        type="text"
                        className="fleet-input"
                        placeholder="Merek"
                        value={formData.stnkBrand}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stnkBrand: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.5fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <div className="fleet-form-group">
                      <label className="fleet-label">Type Kendaraan</label>
                      <input
                        type="text"
                        className="fleet-input"
                        placeholder="Contoh: FE 74 HD"
                        value={formData.stnkVehicleType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stnkVehicleType: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="fleet-form-group">
                      <label className="fleet-label">Tahun Buat</label>
                      <input
                        type="text"
                        className="fleet-input"
                        placeholder="Contoh: 2021"
                        value={formData.stnkYearManufactured}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stnkYearManufactured: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <div className="fleet-form-group">
                      <label className="fleet-label">Jenis Kendaraan</label>
                      <select
                        className="fleet-input"
                        value={formData.stnkVehicleJenis}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stnkVehicleJenis: e.target.value,
                          })
                        }
                        style={{ background: "white" }}
                      >
                        <option value="Delvan">Delvan</option>
                        <option value="Blindvan">Blindvan</option>
                        <option value="Pick Up">Pick Up</option>
                        <option value="Double Cabin">Double Cabin</option>
                        <option value="Minibus">Minibus</option>
                        <option value="Travel">Travel</option>
                        <option value="Bus">Bus</option>
                        <option value="Truck CDE">Truck CDE</option>
                        <option value="Truck CDD">Truck CDD</option>
                        <option value="Light Truck">Light Truck</option>
                        <option value="Box">Box</option>
                        <option value="Truck">Truck</option>
                        <option value="Truck Wingbox">Truck Wingbox</option>
                        <option value="Truk Gandeng">Truk Gandeng</option>
                        <option value="Kereta Tempelan">Kereta Tempelan</option>
                        <option value="Trailer">Trailer</option>
                      </select>
                    </div>
                    <div className="fleet-form-group">
                      <label className="fleet-label">Model Kendaraan</label>
                      <input
                        type="text"
                        className="fleet-input"
                        placeholder="Contoh: Truk Box"
                        value={formData.stnkModel}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stnkModel: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <div className="fleet-form-group">
                      <label className="fleet-label">No Rangka</label>
                      <input
                        type="text"
                        className="fleet-input"
                        placeholder="Nomor rangka"
                        value={formData.stnkFrameNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stnkFrameNumber: e.target.value.toUpperCase(),
                          })
                        }
                      />
                    </div>
                    <div className="fleet-form-group">
                      <label className="fleet-label">No Mesin</label>
                      <input
                        type="text"
                        className="fleet-input"
                        placeholder="Nomor mesin"
                        value={formData.stnkEngineNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stnkEngineNumber: e.target.value.toUpperCase(),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {(modalType === "add" || modalType === "edit") && (
                  <div
                    className="fleet-docs-upload-section"
                    style={{
                      borderTop: "2px solid #e2e8f0",
                      paddingTop: "20px",
                      marginTop: "8px",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: "800",
                        color: "#1C3967",
                        margin: "0 0 16px 0",
                      }}
                    >
                      Unggah Dokumen Kendaraan (Wajib)
                    </h4>
                    <div
                      style={{
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        borderRadius: "8px",
                        padding: "10px 12px",
                        fontSize: "12px",
                        color: "#1e40af",
                        marginBottom: "16px",
                      }}
                    >
                      ℹ️ Unggah file dokumen Kartu KIR, Sertifikat KIR, dan STNK
                      (format PDF/PNG/JPG). Centang opsi "Hilang" apabila
                      dokumen KIR tidak tersedia.
                    </div>

                    {[
                      { docType: "kartuKir", label: "Kartu KIR" },
                      { docType: "sertifikatKir", label: "Sertifikat KIR" },
                      { docType: "stnk", label: "STNK" },
                    ].map(({ docType, label }) => {
                      const file = formData[`${docType}File`];
                      const isLost = formData[`${docType}Hilang`];

                      return (
                        <div
                          key={docType}
                          className="fleet-form-group"
                          style={{
                            border: "1px solid #cbd5e1",
                            padding: "12px",
                            borderRadius: "8px",
                            background: "#f8fafc",
                            marginBottom: "12px",
                          }}
                        >
                          <label
                            className="fleet-label"
                            style={{
                              fontWeight: "bold",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span>{label} *</span>
                            {isLost ? (
                              <span
                                style={{ color: "#c2410c", fontSize: "12px" }}
                              >
                                ⚠️ Dinyatakan Hilang
                              </span>
                            ) : file ? (
                              <span
                                style={{ color: "#16a34a", fontSize: "12px" }}
                              >
                                ✓ Terunggah
                              </span>
                            ) : (
                              <span
                                style={{
                                  color: "#6b7a96",
                                  fontSize: "12px",
                                  fontWeight: "normal",
                                }}
                              >
                                Belum diunggah
                              </span>
                            )}
                          </label>

                          {(docType === "kartuKir" ||
                            docType === "sertifikatKir") && (
                            <label
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontSize: "12px",
                                color: "#c2410c",
                                margin: "4px 0 8px 0",
                                cursor: "pointer",
                                userSelect: "none",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={!!isLost}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    [`${docType}Hilang`]: e.target.checked,
                                    ...(e.target.checked
                                      ? { [`${docType}File`]: null }
                                      : {}),
                                  })
                                }
                              />
                              <strong>
                                {docType === "kartuKir"
                                  ? "Buku KIR Hilang"
                                  : "Sertifikat KIR Hilang"}
                              </strong>
                            </label>
                          )}

                          {isLost ? (
                            <div
                              style={{
                                marginTop: "8px",
                                fontSize: "11px",
                                color: "#b91c1c",
                                background: "#fef2f2",
                                padding: "8px 12px",
                                borderRadius: "6px",
                                border: "1px solid #fecaca",
                                lineHeight: "1.4",
                              }}
                            >
                              ⚠️ <strong>Dokumen Dinyatakan Hilang:</strong>{" "}
                              Kendaraan tetap dapat didaftarkan ke armada. Kelak
                              saat proses pengurusan perpanjangan, Anda wajib
                              menyertakan dokumen pendukung berupa Surat
                              Kehilangan Resmi dari Kepolisian.
                            </div>
                          ) : (
                            <div style={{ marginTop: "10px" }}>
                              <input
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                style={{ display: "none" }}
                                id={`file-input-${docType}`}
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    setDocumentFile(
                                      docType,
                                      e.target.files[0].name,
                                    );
                                  }
                                }}
                              />

                              {file ? (
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    background: "#f0fdf4",
                                    border: "1px solid #bbf7d0",
                                    padding: "10px 14px",
                                    borderRadius: "8px",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      overflow: "hidden",
                                    }}
                                  >
                                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                      <span
                                        style={{
                                          fontSize: "13px",
                                          fontWeight: "600",
                                          color: "#166534",
                                          display: "block",
                                        }}
                                      >
                                        {file}
                                      </span>
                                      <span style={{ fontSize: "11px", color: "#15803d" }}>
                                        Terpilih (PDF/Gambar)
                                      </span>
                                    </div>
                                  </div>
                                  <div style={{ display: "flex", gap: "8px" }}>
                                    <label
                                      htmlFor={`file-input-${docType}`}
                                      style={{
                                        fontSize: "11px",
                                        fontWeight: "600",
                                        color: "#166534",
                                        cursor: "pointer",
                                        background: "#ffffff",
                                        border: "1px solid #bbf7d0",
                                        padding: "4px 8px",
                                        borderRadius: "6px",
                                      }}
                                    >
                                      Ganti
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => removeDocumentFile(docType)}
                                      style={{
                                        fontSize: "11px",
                                        fontWeight: "600",
                                        color: "#b91c1c",
                                        cursor: "pointer",
                                        background: "#ffffff",
                                        border: "1px solid #fecaca",
                                        padding: "4px 8px",
                                        borderRadius: "6px",
                                      }}
                                    >
                                      Hapus
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <label
                                  htmlFor={`file-input-${docType}`}
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "2px dashed #cbd5e1",
                                    borderRadius: "8px",
                                    padding: "20px 16px",
                                    background: "#ffffff",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    textAlign: "center",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = "#3b82f6";
                                    e.currentTarget.style.background = "#f8fafc";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = "#cbd5e1";
                                    e.currentTarget.style.background = "#ffffff";
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: "13px",
                                      fontWeight: "600",
                                      color: "#1c3967",
                                      marginBottom: "2px",
                                    }}
                                  >
                                    Pilih Berkas Dokumen
                                  </span>
                                  <span style={{ fontSize: "11px", color: "#6b7a96" }}>
                                    Klik untuk mengunggah file (PDF, PNG, JPG, JPEG)
                                  </span>
                                </label>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="fleet-form-group" style={{ marginBottom: 0 }}>
                  <label className="fleet-label">Catatan Tambahan</label>
                  <textarea
                    className="fleet-input"
                    placeholder="Nama driver, Dll... "
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows="2"
                    style={{ resize: "vertical", fontFamily: "inherit" }}
                  />
                </div>
              </div>
              <div className="fleet-modal-footer">
                <button
                  type="button"
                  className="fleet-btn fleet-btn-secondary"
                  onClick={() => setModalType(null)}
                >
                  Batal
                </button>
                <button type="submit" className="fleet-btn fleet-btn-primary">
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL: UPLOAD SCAN DOKUMEN
          ==================================================== */}
      {modalType === "upload" && selectedVehicle && (
        <div className="fleet-modal-overlay">
          <div className="fleet-modal">
            <div className="fleet-modal-header">
              <h3>Unggah Dokumen Armada: {selectedVehicle.plateNumber}</h3>
              <span
                className="btn-close-modal"
                onClick={() => setModalType(null)}
              >
                ×
              </span>
            </div>
            <form onSubmit={handleUploadSubmit}>
              <div className="fleet-modal-body">
                <div className="fleet-form-group">
                  <label className="fleet-label">Jenis Dokumen</label>
                  <select
                    className="fleet-input"
                    value={uploadDocType}
                    onChange={(e) => setUploadDocType(e.target.value)}
                    style={{ background: "white" }}
                  >
                    <option value="kir">Buku Uji KIR</option>
                    <option value="stnk">STNK</option>
                    <option value="other">Dokumen Pendukung Lainnya</option>
                  </select>
                </div>

                <div className="fleet-form-group">
                  <label className="fleet-label">
                    File Pendukung (Simulasi File)
                  </label>
                  <div
                    className="upload-zone"
                    onClick={() => {
                      const randName = `${uploadDocType.toUpperCase()}_${selectedVehicle.plateNumber.replace(/\s+/g, "")}_${Date.now().toString().slice(-4)}.${uploadDocType === "kir" ? "pdf" : "png"}`;
                      setUploadFileName(randName);
                    }}
                  >
                    <div className="upload-zone-icon">📁</div>
                    <div className="upload-zone-text">
                      {uploadFileName ? (
                        <span style={{ color: "#16a34a", fontWeight: "bold" }}>
                          File Terpilih: {uploadFileName}
                        </span>
                      ) : (
                        <span>
                          Klik di sini untuk mensimulasikan upload dokumen
                          (PDF/PNG/JPG)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="fleet-modal-footer">
                <button
                  type="button"
                  className="fleet-btn fleet-btn-secondary"
                  onClick={() => setModalType(null)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="fleet-btn fleet-btn-primary"
                  disabled={!uploadFileName}
                >
                  Kirim Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL: REQUEST PERPANJANGAN (URUS SEKARANG)
          ==================================================== */}
      {modalType === "urus" && selectedVehicle && (
        <div className="fleet-modal-overlay">
          <div className="fleet-modal">
            <div className="fleet-modal-header">
              <h3>Pengajuan Pengurusan Jasa: {selectedVehicle.plateNumber}</h3>
              <span
                className="btn-close-modal"
                onClick={() => setModalType(null)}
              >
                ×
              </span>
            </div>
            <form onSubmit={handleUrusSubmit}>
              {(() => {
                const isKirBlocked = selectedVehicle
                  ? getDaysRemaining(selectedVehicle.kirExpiry) <= -365
                  : false;
                const kartuHilang = selectedVehicle?.kartuKirHilang;
                const sertifikatHilang = selectedVehicle?.sertifikatKirHilang;
                const adaDokumenHilang = kartuHilang || sertifikatHilang;
                return (
                  <div className="fleet-modal-body">
                    {isKirBlocked && (
                      <div
                        style={{
                          background: "#fef2f2",
                          border: "1px solid #fca5a5",
                          borderRadius: "8px",
                          padding: "12px",
                          fontSize: "12.5px",
                          color: "#991b1b",
                          marginBottom: "16px",
                          lineHeight: "1.5",
                          textAlign: "left",
                        }}
                      >
                        ⚠️ <strong>KIR Terblokir (&gt; 1 Tahun):</strong> Data
                        Kendaraan sudah terblokir dari sistem Dishub karena masa
                        berlaku sudah habis melebihi 1 tahun, Harap melakukan
                        pengurusan buka blokir terlebih dahulu!
                      </div>
                    )}

                    {adaDokumenHilang && (
                      <div
                        style={{
                          background: "#fff7ed",
                          border: "1px solid #fed7aa",
                          borderRadius: "8px",
                          padding: "12px",
                          fontSize: "12.5px",
                          color: "#9a3412",
                          marginBottom: "16px",
                          lineHeight: "1.5",
                          textAlign: "left",
                        }}
                      >
                        ⚠️ <strong>Dokumen KIR Hilang Terdeteksi:</strong>{" "}
                        Kendaraan ini tercatat memiliki dokumen KIR yang hilang:
                        <ul
                          style={{ margin: "6px 0 0 0", paddingLeft: "20px" }}
                        >
                          {kartuHilang && <li>Buku/Kartu KIR — Hilang</li>}
                          {sertifikatHilang && <li>Sertifikat KIR — Hilang</li>}
                        </ul>
                        <p style={{ margin: "8px 0 0 0", fontSize: "12px" }}>
                          Untuk pengurusan perpanjangan, Anda wajib menyertakan
                          Surat Kehilangan dari Kepolisian dan pengumuman di
                          Media Nasional. Kami dapat membantu pengurusannya.
                        </p>
                      </div>
                    )}

                    {adaDokumenHilang && (
                      <div
                        style={{
                          background: "#f0fdf4",
                          border: "1px solid #bbf7d0",
                          borderRadius: "8px",
                          padding: "14px",
                          marginBottom: "16px",
                        }}
                      >
                        <h4
                          style={{
                            margin: "0 0 10px 0",
                            fontSize: "13px",
                            color: "#166534",
                            fontWeight: "800",
                          }}
                        >
                          🛠️ Layanan Bantu Pengurusan Kelengkapan Dokumen Hilang
                        </h4>
                        <p
                          style={{
                            fontSize: "11.5px",
                            color: "#15803d",
                            margin: "0 0 12px 0",
                            lineHeight: "1.4",
                          }}
                        >
                          Dokumen KIR yang hilang memerlukan pengurusan
                          tambahan. Centang layanan bantuan yang Anda perlukan:
                        </p>
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "8px 10px",
                            background: "#fafafa",
                            borderRadius: "6px",
                            border: `1px solid ${requestLaporHilang ? "#22c55e" : "#e5e7eb"}`,
                            cursor: "pointer",
                            marginBottom: "8px",
                            userSelect: "none",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={requestLaporHilang}
                            onChange={(e) =>
                              setRequestLaporHilang(e.target.checked)
                            }
                          />
                          <div>
                            <strong style={{ fontSize: "13px" }}>
                              Bantu Urus Laporan Kehilangan Kepolisian
                            </strong>
                            <div style={{ fontSize: "12px", color: "#6b7a96" }}>
                              Rp 50.000 — Pembuatan surat laporan kehilangan
                              resmi di kantor polisi
                            </div>
                          </div>
                        </label>
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "8px 10px",
                            background: "#fafafa",
                            borderRadius: "6px",
                            border: `1px solid ${requestMediaNasional ? "#22c55e" : "#e5e7eb"}`,
                            cursor: "pointer",
                            userSelect: "none",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={requestMediaNasional}
                            onChange={(e) =>
                              setRequestMediaNasional(e.target.checked)
                            }
                          />
                          <div>
                            <strong style={{ fontSize: "13px" }}>
                              Bantu Urus Media Nasional
                            </strong>
                            <div style={{ fontSize: "12px", color: "#6b7a96" }}>
                              Rp 50.000 — Publikasi pengumuman kehilangan di
                              media nasional
                            </div>
                          </div>
                        </label>
                      </div>
                    )}

                    <div className="fleet-form-group">
                      <label className="fleet-label">Jenis Pengurusan</label>
                      <select
                        className="fleet-input"
                        value={requestServiceType}
                        onChange={(e) => setRequestServiceType(e.target.value)}
                        style={{ background: "white" }}
                      >
                        {isKirBlocked ? (
                          <>
                            <option value="buka_blokir_kir">
                              Buka Blokir Data Kendaraan KIR
                            </option>
                            <option value="stnk_renewal">
                              Perpanjangan STNK 5 Tahunan
                            </option>
                            <option value="pajak_renewal">
                              Perpanjangan Pajak Kendaraan Tahunan
                            </option>
                          </>
                        ) : (
                          <>
                            <option value="kir_renewal">
                              Perpanjangan Uji KIR
                            </option>
                            <option value="stnk_renewal">
                              Perpanjangan STNK 5 Tahunan
                            </option>
                            <option value="pajak_renewal">
                              Perpanjangan Pajak Kendaraan Tahunan
                            </option>
                            <option value="buka_blokir_kir">
                              Buka Blokir Data Kendaraan KIR
                            </option>
                          </>
                        )}
                      </select>
                    </div>

                    {(() => {
                      const isStnkPajak = [
                        "stnk_renewal",
                        "pajak_renewal",
                      ].includes(requestServiceType);
                      const isClientOfAdmin1 =
                        (company.adminId || "admin-1") === "admin-1";
                      if (isStnkPajak && isClientOfAdmin1) {
                        return (
                          <div
                            style={{
                              background: "#fffbe6",
                              border: "1px solid #ffe58f",
                              borderRadius: "8px",
                              padding: "12px",
                              fontSize: "12.5px",
                              color: "#d46b08",
                              marginBottom: "16px",
                              lineHeight: "1.5",
                              textAlign: "left",
                            }}
                          >
                            ℹ️ <strong>Rute Administrator Berbeda:</strong>{" "}
                            Pengurusan STNK 5 Tahunan & Pajak Tahunan dari
                            client Admin Sentra akan dialihkan secara otomatis
                            ke <strong>Administrator Padajaya</strong>. Admin
                            Padajaya akan dapat melihat info PIC Anda untuk
                            berkomunikasi langsung.
                          </div>
                        );
                      }
                      return null;
                    })()}

                    <div
                      className="fleet-form-group"
                      style={{ marginBottom: 0 }}
                    >
                      <label className="fleet-label">
                        Deskripsi & Instruksi Tambahan
                      </label>
                      <textarea
                        className="fleet-input"
                        value={requestDesc}
                        onChange={(e) => setRequestDesc(e.target.value)}
                        rows="4"
                        placeholder="Instruksi tambahan (misal: jemput berkas di kantor Cakung)..."
                        required
                        style={{ resize: "vertical", fontFamily: "inherit" }}
                      />
                    </div>
                  </div>
                );
              })()}
              <div className="fleet-modal-footer">
                <div
                  style={{
                    flex: 1,
                    textAlign: "left",
                    fontSize: "13px",
                    color: "#1e3a8a",
                    fontWeight: "700",
                  }}
                >
                  {(() => {
                    let total = (() => {
                      const st = requestServiceType;
                      if (st === "multiple") return 750000;
                      if (st === "buka_blokir_kir") return 1500000;
                      return 350000;
                    })();
                    if (requestLaporHilang) total += 50000;
                    if (requestMediaNasional) total += 50000;
                    return (
                      <span>
                        💰 Estimasi Total:{" "}
                        <span style={{ fontSize: "15px" }}>
                          Rp {total.toLocaleString("id-ID")}
                        </span>
                      </span>
                    );
                  })()}
                </div>
                <button
                  type="button"
                  className="fleet-btn fleet-btn-secondary"
                  onClick={() => setModalType(null)}
                >
                  Batal
                </button>
                <button type="submit" className="fleet-btn fleet-btn-accent">
                  Kirim Pengajuan Jasa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DOKUMEN DIUPLOAD */}
      {modalType === "dokumen" && selectedVehicle && (
        <div className="fleet-modal-overlay">
          <div className="fleet-modal" style={{ maxWidth: "520px" }}>
            <div className="fleet-modal-header">
              <h3>📄 Dokumen Diupload — {selectedVehicle.plateNumber}</h3>
              <span
                className="btn-close-modal"
                onClick={() => setModalType(null)}
              >
                ×
              </span>
            </div>
            <div className="fleet-modal-body">
              <p
                style={{
                  fontSize: "13px",
                  color: "#475569",
                  margin: "0 0 16px 0",
                }}
              >
                Kelola dokumen untuk kendaraan ini. Klik tombol{" "}
                <strong>Unggah</strong> untuk mengunggah atau mengganti file
                dokumen.
              </p>

              {[
                { key: "kartuKir", label: "Kartu KIR", icon: "🪪" },
                { key: "sertifikatKir", label: "Sertifikat KIR", icon: "📜" },
                { key: "stnk", label: "STNK", icon: "📋" },
              ].map(({ key, label, icon }) => {
                const isHilang = selectedVehicle[`${key}Hilang`];
                const fileName = selectedVehicle[`${key}FileName`];

                return (
                  <div
                    key={key}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      padding: "14px",
                      marginBottom: "12px",
                      background: isHilang
                        ? "#fef2f2"
                        : fileName
                          ? "#f0fdf4"
                          : "#f8fafc",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span style={{ fontSize: "20px" }}>{icon}</span>
                        <div>
                          <strong
                            style={{ fontSize: "14px", color: "#1C3967" }}
                          >
                            {label}
                          </strong>
                          {isHilang ? (
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#dc2626",
                                marginTop: "2px",
                              }}
                            >
                              ⚠️ Dokumen hilang / belum ada
                            </div>
                          ) : fileName ? (
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#16a34a",
                                marginTop: "2px",
                              }}
                            >
                              ✓ {fileName}
                            </div>
                          ) : (
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#94a3b8",
                                marginTop: "2px",
                              }}
                            >
                              Belum diunggah
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {fileName && (
                          <button
                            type="button"
                            className="fleet-btn fleet-btn-sm"
                            style={{
                              padding: "4px 8px",
                              fontSize: "11px",
                              background: "#f0fdf4",
                              color: "#16a34a",
                              border: "1px solid #bbf7d0",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              setPreviewDoc({ key, label, fileName })
                            }
                          >
                            👁️ Lihat
                          </button>
                        )}
                        <button
                          type="button"
                          className="fleet-btn fleet-btn-sm"
                          style={{
                            padding: "4px 12px",
                            fontSize: "11px",
                            background: "#eff6ff",
                            color: "#1e40af",
                            border: "1px solid #bfdbfe",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setRescanDocType(key);
                            handleRescanDoc(key);
                          }}
                          disabled={isHilang}
                        >
                          {fileName ? "🔄 Ganti File" : "📤 Unggah"}
                        </button>
                      </div>
                    </div>
                    {isHilang && (
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#b91c1c",
                          background: "#fff5f5",
                          padding: "6px 10px",
                          borderRadius: "4px",
                          border: "1px solid #fecaca",
                          lineHeight: "1.4",
                        }}
                      >
                        Silahkan unggah dokumen apabila dokumen sudah dimiliki.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div
              className="fleet-modal-footer"
              style={{ justifyContent: "flex-end" }}
            >
              <button
                type="button"
                className="fleet-btn fleet-btn-secondary"
                onClick={() => setModalType(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DATA LENGKAP KENDARAAN */}
      {vehicleDetailModal && (
        <div className="fleet-modal-overlay">
          <div className="fleet-modal" style={{ maxWidth: "700px" }}>
            <div className="fleet-modal-header">
              <h3>
                Data Lengkap Kendaraan — {vehicleDetailModal.plateNumber}
              </h3>
              <span
                className="btn-close-modal"
                onClick={() => setVehicleDetailModal(null)}
              >
                ×
              </span>
            </div>
            <div className="fleet-modal-body">
              {/* Informasi Dasar */}
              <div style={{ marginBottom: "24px" }}>
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: "800",
                    color: "#1C3967",
                    margin: "0 0 16px 0",
                    paddingBottom: "8px",
                    borderBottom: "2px solid #e2e8f0",
                  }}
                >
                  Informasi Dasar Kendaraan
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7a96",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Plat Nomor
                    </p>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#1C3967",
                        margin: 0,
                      }}
                    >
                      {vehicleDetailModal.plateNumber}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7a96",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Tipe / Jenis Kendaraan
                    </p>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#1C3967",
                        margin: 0,
                      }}
                    >
                      {vehicleDetailModal.vehicleType}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7a96",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Nomor Buku Uji KIR
                    </p>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#1C3967",
                        margin: 0,
                        fontFamily: "monospace",
                      }}
                    >
                      {vehicleDetailModal.testNumber || "-"}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7a96",
                        margin: "0 0 4px 0",
                      }}
                    >
                      ID Kendaraan (Internal)
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#475569",
                        margin: 0,
                        fontFamily: "monospace",
                        wordBreak: "break-all",
                      }}
                    >
                      {vehicleDetailModal.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Masa Berlaku Dokumen */}
              <div style={{ marginBottom: "24px" }}>
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: "800",
                    color: "#1C3967",
                    margin: "0 0 16px 0",
                    paddingBottom: "8px",
                    borderBottom: "2px solid #e2e8f0",
                  }}
                >
                  Masa Berlaku Dokumen
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "12px",
                  }}
                >
                  {(() => {
                    const cs = getExpiryCardStyle(vehicleDetailModal.kirExpiry);
                    return (
                  <div
                    style={{
                      background: cs.background,
                      padding: "12px",
                      borderRadius: "8px",
                      border: cs.border,
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: cs.labelColor,
                        margin: "0 0 4px 0",
                        fontWeight: "600",
                      }}
                    >
                      Uji KIR
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color: cs.valueColor,
                        margin: "0 0 4px 0",
                      }}
                    >
                      {vehicleDetailModal.kirExpiry}
                    </p>
                    <p
                      style={{
                        fontSize: "11px",
                        color: cs.statusColor,
                        margin: 0,
                      }}
                    >
                      {(() => {
                        const days = getDaysRemaining(
                          vehicleDetailModal.kirExpiry,
                        );
                        if (days <= 0) {
                          return `⚠️ Jatuh Tempo (${Math.abs(days)} hari lalu)`;
                        } else if (days <= 7) {
                          return `🔴 H-${days}`;
                        } else if (days <= 30) {
                          return `🟡 H-${days}`;
                        }
                        return `🟢 H-${days}`;
                      })()}
                    </p>
                  </div>
                    );
                  })()}
                  {(() => {
                    const cs = getExpiryCardStyle(vehicleDetailModal.stnkExpiry);
                    return (
                  <div
                    style={{
                      background: cs.background,
                      padding: "12px",
                      borderRadius: "8px",
                      border: cs.border,
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: cs.labelColor,
                        margin: "0 0 4px 0",
                        fontWeight: "600",
                      }}
                    >
                      STNK (5 Tahun)
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color: cs.valueColor,
                        margin: "0 0 4px 0",
                      }}
                    >
                      {vehicleDetailModal.stnkExpiry}
                    </p>
                    <p
                      style={{
                        fontSize: "11px",
                        color: cs.statusColor,
                        margin: 0,
                      }}
                    >
                      {(() => {
                        const days = getDaysRemaining(
                          vehicleDetailModal.stnkExpiry,
                        );
                        if (days <= 0) {
                          return `⚠️ Jatuh Tempo (${Math.abs(days)} hari lalu)`;
                        } else if (days <= 7) {
                          return `🔴 H-${days}`;
                        } else if (days <= 30) {
                          return `🟡 H-${days}`;
                        }
                        return `🟢 H-${days}`;
                      })()}
                    </p>
                  </div>
                    );
                  })()}
                  {(() => {
                    const cs = getExpiryCardStyle(vehicleDetailModal.pajakExpiry);
                    return (
                  <div
                    style={{
                      background: cs.background,
                      padding: "12px",
                      borderRadius: "8px",
                      border: cs.border,
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: cs.labelColor,
                        margin: "0 0 4px 0",
                        fontWeight: "600",
                      }}
                    >
                      Pajak (1 Tahun)
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color: cs.valueColor,
                        margin: "0 0 4px 0",
                      }}
                    >
                      {vehicleDetailModal.pajakExpiry}
                    </p>
                    <p
                      style={{
                        fontSize: "11px",
                        color: cs.statusColor,
                        margin: 0,
                      }}
                    >
                      {(() => {
                        const days = getDaysRemaining(
                          vehicleDetailModal.pajakExpiry,
                        );
                        if (days <= 0) {
                          return `⚠️ Jatuh Tempo (${Math.abs(days)} hari lalu)`;
                        } else if (days <= 7) {
                          return `🔴 H-${days}`;
                        } else if (days <= 30) {
                          return `🟡 H-${days}`;
                        }
                        return `🟢 H-${days}`;
                      })()}
                    </p>
                  </div>
                    );
                  })()}
                </div>
              </div>

              {/* SIM Driver */}
              {vehicleDetailModal.simDriverExpiry && (
                <div style={{ marginBottom: "24px" }}>
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: "800",
                      color: "#1C3967",
                      margin: "0 0 16px 0",
                      paddingBottom: "8px",
                      borderBottom: "2px solid #e2e8f0",
                    }}
                  >
                    SIM Driver
                  </h4>
                  {(() => {
                    const cs = getExpiryCardStyle(
                      vehicleDetailModal.simDriverExpiry,
                    );
                    return (
                  <div
                    style={{
                      background: cs.background,
                      padding: "12px",
                      borderRadius: "8px",
                      border: cs.border,
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: cs.labelColor,
                        margin: "0 0 4px 0",
                        fontWeight: "600",
                      }}
                    >
                      Masa Berlaku SIM
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color: cs.valueColor,
                        margin: "0 0 4px 0",
                      }}
                    >
                      {vehicleDetailModal.simDriverExpiry}
                    </p>
                    <p
                      style={{
                        fontSize: "11px",
                        color: cs.statusColor,
                        margin: 0,
                      }}
                    >
                      {(() => {
                        const days = getDaysRemaining(
                          vehicleDetailModal.simDriverExpiry,
                        );
                        if (days <= 0) {
                          return `⚠️ Jatuh Tempo (${Math.abs(days)} hari lalu)`;
                        } else if (days <= 7) {
                          return `🔴 H-${days}`;
                        } else if (days <= 30) {
                          return `🟡 H-${days}`;
                        }
                        return `🟢 H-${days}`;
                      })()}
                    </p>
                  </div>
                    );
                  })()}
                </div>
              )}

              {/* Data Kartu Kendaraan */}
              <div style={{ marginBottom: "24px" }}>
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: "800",
                    color: "#1C3967",
                    margin: "0 0 16px 0",
                    paddingBottom: "8px",
                    borderBottom: "2px solid #e2e8f0",
                  }}
                >
                  Data Sertifikat Kendaraan
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7a96",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Nama Pemilik
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1C3967",
                        margin: 0,
                      }}
                    >
                      {vehicleDetailModal.ownerName || "-"}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7a96",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Alamat Pemilik
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1C3967",
                        margin: 0,
                      }}
                    >
                      {vehicleDetailModal.ownerAddress || "-"}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7a96",
                        margin: "0 0 4px 0",
                      }}
                    >
                      No Pol / Nomor Plat
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1C3967",
                        margin: 0,
                        fontFamily: "monospace",
                      }}
                    >
                      {vehicleDetailModal.plateNumber}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7a96",
                        margin: "0 0 4px 0",
                      }}
                    >
                      No Rangka
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1C3967",
                        margin: 0,
                        fontFamily: "monospace",
                      }}
                    >
                      {vehicleDetailModal.frameNumber || "-"}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7a96",
                        margin: "0 0 4px 0",
                      }}
                    >
                      No Mesin
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1C3967",
                        margin: 0,
                        fontFamily: "monospace",
                      }}
                    >
                      {vehicleDetailModal.engineNumber || "-"}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7a96",
                        margin: "0 0 4px 0",
                      }}
                    >
                      No Uji Kendaraan
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1C3967",
                        margin: 0,
                        fontFamily: "monospace",
                      }}
                    >
                      {vehicleDetailModal.testNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Kartu KIR */}
              <div style={{ marginBottom: "24px" }}>
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: "800",
                    color: "#1C3967",
                    margin: "0 0 16px 0",
                    paddingBottom: "8px",
                    borderBottom: "2px solid #e2e8f0",
                  }}
                >
                  Data Kartu KIR
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7a96",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Nama Pemilik
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1C3967",
                        margin: 0,
                      }}
                    >
                      {vehicleDetailModal.ownerName || "-"}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7a96",
                        margin: "0 0 4px 0",
                      }}
                    >
                      No Pol / Nomor Plat
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1C3967",
                        margin: 0,
                        fontFamily: "monospace",
                      }}
                    >
                      {vehicleDetailModal.plateNumber}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7a96",
                        margin: "0 0 4px 0",
                      }}
                    >
                      No Uji Kendaraan
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1C3967",
                        margin: 0,
                        fontFamily: "monospace",
                      }}
                    >
                      {vehicleDetailModal.testNumber}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7a96",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Jenis Kendaraan
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1C3967",
                        margin: 0,
                      }}
                    >
                      {vehicleDetailModal.vehicleType}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                      gridColumn: "1 / -1",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7a96",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Merek / Tipe
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1C3967",
                        margin: 0,
                      }}
                    >
                      {vehicleDetailModal.brand || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Data STNK */}
              <div style={{ marginBottom: "24px" }}>
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: "800",
                    color: "#1C3967",
                    margin: "0 0 16px 0",
                    paddingBottom: "8px",
                    borderBottom: "2px solid #e2e8f0",
                  }}
                >
                  Data STNK
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7a96",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Nama Pemilik
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1C3967",
                        margin: 0,
                      }}
                    >
                      {vehicleDetailModal.ownerName || "-"}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7a96",
                        margin: "0 0 4px 0",
                      }}
                    >
                      No Pol / Nomor Plat
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1C3967",
                        margin: 0,
                        fontFamily: "monospace",
                      }}
                    >
                      {vehicleDetailModal.plateNumber}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                      gridColumn: "1 / -1",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7a96",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Alamat Pemilik
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1C3967",
                        margin: 0,
                      }}
                    >
                      {vehicleDetailModal.ownerAddress || "-"}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7a96",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Merek
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1C3967",
                        margin: 0,
                      }}
                    >
                      {vehicleDetailModal.brand || "-"}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7a96",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Type Kendaraan
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1C3967",
                        margin: 0,
                      }}
                    >
                      {vehicleDetailModal.vehicleType}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7a96",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Jenis Kendaraan
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1C3967",
                        margin: 0,
                      }}
                    >
                      {vehicleDetailModal.vehicleType}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7a96",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Model Kendaraan
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1C3967",
                        margin: 0,
                      }}
                    >
                      {vehicleDetailModal.model || "-"}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7a96",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Tahun Buat
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1C3967",
                        margin: 0,
                      }}
                    >
                      {vehicleDetailModal.yearManufactured || "-"}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7a96",
                        margin: "0 0 4px 0",
                      }}
                    >
                      No Rangka
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1C3967",
                        margin: 0,
                        fontFamily: "monospace",
                      }}
                    >
                      {vehicleDetailModal.frameNumber || "-"}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7a96",
                        margin: "0 0 4px 0",
                      }}
                    >
                      No Mesin
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1C3967",
                        margin: 0,
                        fontFamily: "monospace",
                      }}
                    >
                      {vehicleDetailModal.engineNumber || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Dokumen */}
              <div style={{ marginBottom: "24px" }}>
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: "800",
                    color: "#1C3967",
                    margin: "0 0 16px 0",
                    paddingBottom: "8px",
                    borderBottom: "2px solid #e2e8f0",
                  }}
                >
                  Status Dokumen
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "12px",
                  }}
                >
                  {[
                    { key: "kartuKir", label: "Kartu KIR", icon: "🪪" },
                    {
                      key: "sertifikatKir",
                      label: "Sertifikat KIR",
                      icon: "📜",
                    },
                    { key: "stnk", label: "STNK", icon: "📋" },
                  ].map(({ key, label, icon }) => {
                    const isHilang = vehicleDetailModal[`${key}Hilang`];
                    const fileName = vehicleDetailModal[`${key}FileName`];

                    return (
                      <div
                        key={key}
                        style={{
                          background: isHilang
                            ? "#fef2f2"
                            : fileName
                              ? "#f0fdf4"
                              : "#f8fafc",
                          padding: "12px",
                          borderRadius: "8px",
                          border: isHilang
                            ? "1px solid #fecaca"
                            : fileName
                              ? "1px solid #bbf7d0"
                              : "1px solid #cbd5e1",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span style={{ fontSize: "18px", display: "none" }}>{icon}</span>
                            <div>
                              <strong
                                style={{ fontSize: "13px", color: "#1C3967" }}
                              >
                                {label}
                              </strong>
                              {isHilang ? (
                                <div
                                  style={{
                                    fontSize: "11px",
                                    color: "#dc2626",
                                    marginTop: "2px",
                                  }}
                                >
                                  ⚠️ Hilang / Belum Ada
                                </div>
                              ) : fileName ? (
                                <div
                                  style={{
                                    fontSize: "11px",
                                    color: "#16a34a",
                                    marginTop: "2px",
                                  }}
                                >
                                  ✓ {fileName}
                                </div>
                              ) : (
                                <div
                                  style={{
                                    fontSize: "11px",
                                    color: "#94a3b8",
                                    marginTop: "2px",
                                  }}
                                >
                                  Belum diunggah
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Catatan */}
              {vehicleDetailModal.notes && (
                <div style={{ marginBottom: "0" }}>
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: "800",
                      color: "#1C3967",
                      margin: "0 0 16px 0",
                      paddingBottom: "8px",
                      borderBottom: "2px solid #e2e8f0",
                    }}
                  >
                    Catatan Tambahan
                  </h4>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      color: "#1C3967",
                      fontSize: "13px",
                      lineHeight: "1.6",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {vehicleDetailModal.notes}
                  </div>
                </div>
              )}
            </div>
            <div
              className="fleet-modal-footer"
              style={{ justifyContent: "flex-end" }}
            >
              <button
                type="button"
                className="fleet-btn fleet-btn-secondary"
                onClick={() => setVehicleDetailModal(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PREVIEW DOKUMEN */}
      {previewDoc && selectedVehicle && (
        <div className="fleet-modal-overlay">
          <div className="fleet-modal" style={{ maxWidth: "600px" }}>
            <div className="fleet-modal-header">
              <h3>
                👁️ {previewDoc.label} — {selectedVehicle.plateNumber}
              </h3>
              <span
                className="btn-close-modal"
                onClick={() => setPreviewDoc(null)}
              >
                ×
              </span>
            </div>
            <div className="fleet-modal-body" style={{ textAlign: "center" }}>
              <div
                style={{
                  background: "#f8fafc",
                  border: "2px solid #cbd5e1",
                  borderRadius: "12px",
                  padding: "20px",
                  marginBottom: "16px",
                  minHeight: "300px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "auto",
                  maxHeight: "500px",
                }}
              >
                {previewDoc.fileName?.toLowerCase().endsWith(".pdf") ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div style={{ fontSize: "72px" }}>📄</div>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#1C3967",
                        margin: "0",
                      }}
                    >
                      {previewDoc.fileName}
                    </p>
                    <p
                      style={{ fontSize: "12px", color: "#6b7a96", margin: 0 }}
                    >
                      File PDF
                    </p>
                    <div
                      style={{
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        borderRadius: "8px",
                        padding: "12px",
                        fontSize: "12px",
                        color: "#1e40af",
                        marginTop: "12px",
                        textAlign: "left",
                      }}
                    >
                      💡 Preview PDF tidak tersedia. File PDF berisi dokumen
                      asli yang telah diunggah.
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    {/* Simulasi gambar dokumen */}
                    <div
                      style={{
                        background: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        padding: "16px",
                        width: "100%",
                        maxWidth: "400px",
                        aspectRatio: "8.5 / 11",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "12px",
                        color: "#6b7a96",
                        textAlign: "center",
                        gap: "8px",
                      }}
                    >
                      <div style={{ fontSize: "40px" }}>🖼️</div>
                      <div>
                        <strong
                          style={{
                            display: "block",
                            color: "#1C3967",
                            marginBottom: "4px",
                          }}
                        >
                          {previewDoc.label}
                        </strong>
                        <span>File: {previewDoc.fileName}</span>
                      </div>
                      <div
                        style={{
                          marginTop: "8px",
                          fontSize: "10px",
                          color: "#94a3b8",
                          fontStyle: "italic",
                        }}
                      >
                        Gambar asli tersimpan dalam sistem
                      </div>
                    </div>
                    <p
                      style={{ fontSize: "12px", color: "#6b7a96", margin: 0 }}
                    >
                      Format:{" "}
                      {previewDoc.fileName?.includes(".")
                        ? previewDoc.fileName.split(".").pop().toUpperCase()
                        : "-"}
                    </p>
                  </div>
                )}
              </div>
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "8px",
                  padding: "12px",
                  fontSize: "12px",
                  color: "#15803d",
                  lineHeight: "1.5",
                }}
              >
                ✓ Dokumen ini telah diunggah ke dalam sistem dan akan
                diverifikasi oleh admin.
              </div>
            </div>
            <div
              className="fleet-modal-footer"
              style={{ justifyContent: "flex-end" }}
            >
              <button
                type="button"
                className="fleet-btn fleet-btn-secondary"
                onClick={() => setPreviewDoc(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ====================================================
// SUB-VIEW 3: EXPIRY TIMELINE
// ====================================================
function TimelineView({ vehicles }) {
  // Generate calendar months for simulation starting from June 2026 to November 2026 (6 months range)
  const baseDate = new Date(CURRENT_DATE_STR);

  const monthsList = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(baseDate);
    d.setMonth(baseDate.getMonth() + i);
    monthsList.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: d.toLocaleString("id-ID", { month: "long", year: "numeric" }),
    });
  }

  // Populate timeline items
  const timelineData = monthsList.map((month) => {
    const items = [];

    vehicles.forEach((v) => {
      const checkExpiry = (expiryStr, typeLabel, typeKey) => {
        if (!expiryStr) return;
        const exp = new Date(expiryStr);
        if (
          exp.getFullYear() === month.year &&
          exp.getMonth() === month.month
        ) {
          const days = getDaysRemaining(expiryStr);
          items.push({
            id: `${v.id}-${typeKey}`,
            plate: v.plateNumber,
            type: v.vehicleType,
            docType: typeLabel,
            docKey: typeKey,
            daysRemaining: days,
          });
        }
      };

      checkExpiry(v.kirExpiry, "KIR", "kir");
      checkExpiry(v.stnkExpiry, "STNK", "stnk");
      checkExpiry(v.pajakExpiry, "Pajak", "pajak");
    });

    return {
      ...month,
      items,
    };
  });

  return (
    <div className="timeline-section-card">
      <h2
        style={{
          fontSize: "16px",
          fontWeight: "800",
          margin: "0 0 8px 0",
          color: "#1C3967",
        }}
      >
        Jadwal Kadaluwarsa Bulanan
      </h2>
      <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "#6b7a96" }}>
        Berikut adalah daftar dokumen armada yang akan habis masa berlakunya
        dalam 6 bulan ke depan.
      </p>

      <div className="timeline-months-grid">
        {timelineData.map((month, idx) => (
          <div key={idx} className="timeline-month-box">
            <div className="month-name">{month.label}</div>
            <div className="timeline-items">
              {month.items.length === 0 ? (
                <div className="no-expiry-text">
                  Tidak ada berkas jatuh tempo
                </div>
              ) : (
                month.items.map((item) => {
                  const isPast = item.daysRemaining <= 0;
                  return (
                    <div key={item.id} className="timeline-item-card">
                      <div className="timeline-item-left">
                        <span className="timeline-plate">{item.plate}</span>
                        <span className="timeline-type">{item.type}</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: "4px",
                        }}
                      >
                        <span className={`timeline-doc-tag ${item.docKey}`}>
                          {item.docType}
                        </span>
                        <span
                          className={`timeline-days-badge ${isPast ? "danger" : "warning"}`}
                        >
                          {isPast ? "EXPIRED" : `H-${item.daysRemaining}`}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ====================================================
// SUB-VIEW 4: SERVICE REQUESTS
// ====================================================
function RequestsView({ requests }) {
  const getStatusBadgeClass = (status) => {
    if (status === "pending") return "warning";
    if (status === "in_progress") return "neutral";
    if (status === "completed") return "success";
    return "neutral";
  };

  const getServiceLabel = (type) => {
    if (type === "kir_renewal") return "Perpanjangan KIR";
    if (type === "stnk_renewal") return "Perpanjangan STNK";
    if (type === "pajak_renewal") return "Perpanjangan Pajak";
    if (type === "buka_blokir_kir") return "Buka Blokir KIR";
    return "Pengurusan KIR & STNK";
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
        Daftar Pengajuan Perpanjangan
      </h2>

      <div className="fleet-table-container">
        <table className="fleet-table">
          <thead>
            <tr>
              <th>ID Request</th>
              <th>Plat Nomor</th>
              <th>Jenis Jasa</th>
              <th>Deskripsi Pengajuan</th>
              <th>Estimasi Biaya</th>
              <th>Tanggal Pengajuan</th>
              <th>Status Progres</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: "#6b7a96",
                  }}
                >
                  Belum ada pengajuan pengurusan jasa.
                </td>
              </tr>
            ) : (
              [...requests].reverse().map((r) => (
                <tr key={r.id}>
                  <td style={{ fontFamily: "monospace", fontSize: "12px" }}>
                    {r.id}
                  </td>
                  <td style={{ fontWeight: "700" }}>{r.plateNumber}</td>
                  <td style={{ fontWeight: "600" }}>
                    {getServiceLabel(r.serviceType)}
                  </td>
                  <td
                    style={{
                      fontSize: "13px",
                      maxWidth: "300px",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                    }}
                  >
                    {r.description}
                  </td>
                  <td style={{ fontWeight: "600", color: "#1e3a8a" }}>
                    {r.estimatedCost
                      ? `Rp ${Number(r.estimatedCost).toLocaleString("id-ID")}`
                      : "Estimating..."}
                  </td>
                  <td>
                    {new Date(r.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <span
                      className={`badge-status ${getStatusBadgeClass(r.status)}`}
                    >
                      {r.statusLabel || r.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ====================================================
// SUB-VIEW 5: MEMBERSHIP & BILLING
// ====================================================
function BillingView({ company, vehiclesCount }) {
  const tiers = [
    {
      id: "kecil",
      name: "Sentra Fleet Kecil",
      price: "Rp 499.000",
      period: "/ bulan",
      quota: "1 - 30 Kendaraan",
      features: [
        "Hingga 30 data armada kendaraan",
        "Notifikasi warning jatuh tempo H-90 s/d H-7",
        "Upload pindaian berkas (KIR / STNK)",
        "Tombol Urus Sekarang (Layanan Premium)",
        "CS support WhatsApp bisnis standard",
      ],
    },
    {
      id: "menengah",
      name: "Sentra Fleet Menengah",
      price: "Rp 999.000",
      period: "/ bulan",
      quota: "31 - 100 Kendaraan",
      features: [
        "Hingga 100 data armada kendaraan",
        "Semua fitur paket Fleet Kecil",
        "Prioritas pelayanan verifikasi dokumen",
        "Diskon potongan biaya jasa perpanjangan",
        "PIC CRM Dedicated dari Sentra KIR",
      ],
    },
    {
      id: "besar",
      name: "Sentra Fleet Besar (Enterprise)",
      price: "Custom Pricing",
      period: "",
      quota: "100+ Kendaraan",
      features: [
        "Kuota kendaraan tanpa batas (Custom)",
        "Semua fitur paket Fleet Menengah",
        "Integrasi API database internal logistik",
        "Layanan kurir jemput-antar berkas VIP gratis",
        "Syarat pembayaran berjangka (Term of Payment)",
      ],
    },
  ];

  return (
    <div>
      {/* Current Active Plan Widget */}
      <div
        className="fleet-card"
        style={{
          borderLeft: "6px solid var(--fleet-primary)",
          background: "#eff6ff",
        }}
      >
        <h3
          style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#1c3967" }}
        >
          Paket Membership Aktif Anda
        </h3>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 4px 0",
                fontWeight: "bold",
                fontSize: "15px",
              }}
            >
              {company.membershipTier === "kecil" && "Sentra Fleet Kecil"}
              {company.membershipTier === "menengah" && "Sentra Fleet Menengah"}
              {company.membershipTier === "besar" && "Sentra Fleet Besar"}
            </p>
            <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>
              Penggunaan Armada: <strong>{vehiclesCount}</strong> kendaraan
              terdaftar. Status Langganan:{" "}
              <span style={{ color: "#16a34a", fontWeight: "700" }}>AKTIF</span>
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span
              style={{ fontSize: "18px", fontWeight: "800", color: "#1C3967" }}
            >
              {company.membershipTier === "kecil" && "Rp 499.000 / bln"}
              {company.membershipTier === "menengah" && "Rp 999.000 / bln"}
              {company.membershipTier === "besar" && "Custom Pricing"}
            </span>
          </div>
        </div>
      </div>

      {/* Tiers Grid */}
      <h2
        style={{
          fontSize: "16px",
          fontWeight: "800",
          margin: "28px 0 20px 0",
          color: "#1C3967",
        }}
      >
        Pilihan Paket Layanan B2B
      </h2>
      <div className="membership-grid">
        {tiers.map((t) => {
          const isActive = company.membershipTier === t.id;
          return (
            <div
              key={t.id}
              className={`membership-card ${isActive ? "active" : ""}`}
            >
              {isActive && (
                <span className="membership-badge">Paket Aktif</span>
              )}
              <h3>{t.name}</h3>
              <div className="membership-price">
                {t.price} <span>{t.period}</span>
              </div>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#6b7a96",
                  marginBottom: "20px",
                }}
              >
                Kuota: {t.quota}
              </p>
              <ul className="membership-features">
                {t.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
              {!isActive && (
                <button
                  className="fleet-btn fleet-btn-secondary"
                  style={{
                    width: "100%",
                    marginTop: "20px",
                    justifyContent: "center",
                  }}
                  onClick={() =>
                    alert(
                      "Fitur upgrade paket dapat dilakukan dengan menghubungi tim Sales Sentra KIR.",
                    )
                  }
                >
                  Ajukan Upgrade
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ====================================================
// SUB-VIEW: ACCOUNT SETTINGS
// ====================================================
function SettingsView({ company, onUpdate }) {
  const [formData, setFormData] = useState({
    picName: company.picName || "",
    picPhone: company.picPhone || "",
    email: company.email || "",
    address: company.address || "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateCompany(company.id, {
      picName: formData.picName,
      picPhone: formData.picPhone,
      email: formData.email,
      address: formData.address,
    });
    onUpdate();
    alert("Data akun berhasil diperbarui!");
  };

  return (
    <div className="fleet-card">
      <h2
        style={{
          fontSize: "16px",
          fontWeight: "800",
          margin: "0 0 24px 0",
          color: "#1C3967",
        }}
      >
        ⚙️ Pengaturan Akun & Profil Perusahaan
      </h2>

      <form onSubmit={handleSave}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <div className="fleet-form-group">
            <label className="fleet-label">Nama PIC (Penanggung Jawab) *</label>
            <input
              type="text"
              className="fleet-input"
              placeholder="Masukkan nama lengkap PIC"
              value={formData.picName}
              onChange={(e) => handleChange("picName", e.target.value)}
              required
            />
          </div>
          <div className="fleet-form-group">
            <label className="fleet-label">Nomor WhatsApp PIC *</label>
            <input
              type="text"
              className="fleet-input"
              placeholder="62812xxxxxxxxx"
              value={formData.picPhone}
              onChange={(e) => handleChange("picPhone", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="fleet-form-group">
          <label className="fleet-label">Email Perusahaan / Login *</label>
          <input
            type="email"
            className="fleet-input"
            placeholder="pic@perusahaan.com"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
          />
        </div>

        <div className="fleet-form-group">
          <label className="fleet-label">Alamat Perusahaan / Kantor</label>
          <textarea
            className="fleet-input"
            placeholder="Jl. Raya Kantor No. 1, Kota, Provinsi"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            rows="3"
            style={{ resize: "vertical", fontFamily: "inherit" }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "24px",
            paddingTop: "16px",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <button type="submit" className="fleet-btn fleet-btn-primary">
            💾 Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
