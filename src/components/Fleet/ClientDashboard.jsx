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
  clientRespondToQuote,
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
            <RequestsView requests={companyRequests} onUpdate={refreshData} />
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
  const [requestSimService, setRequestSimService] = useState(null); // null | 'sim_baru' | 'sim_perpanjang' | 'sim_konsultasi'
  const [chosenAdminId, setChosenAdminId] = useState(null); // for SIM services where client chooses admin
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
    ownerName: "",
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
    kartuKirMobilBaru: false,
    kartuKirBelumAda: false,
    sertifikatKirFile: null,
    sertifikatKirHilang: false,
    sertifikatKirMobilBaru: false,
    sertifikatKirBelumAda: false,
    stnkFile: null,
    stnkHilang: false,
    stnkBelumAda: false,
  });

  const prevValuesRef = useRef({
    ownerName: "",
    plateNumber: "",
    testNumber: "",
    vehicleType: "Delvan",
  });

  useEffect(() => {
    const prev = prevValuesRef.current;
    setFormData((curr) => {
      const updated = { ...curr };

      // Sync kkOwnerName if it matches previous ownerName (or is empty)
      if (curr.kkOwnerName === prev.ownerName || curr.kkOwnerName === "") {
        updated.kkOwnerName = curr.ownerName;
      }
      // Sync kkPlateNumber
      if (
        curr.kkPlateNumber === prev.plateNumber ||
        curr.kkPlateNumber === ""
      ) {
        updated.kkPlateNumber = curr.plateNumber;
      }
      // Sync kkTestNumber
      if (curr.kkTestNumber === prev.testNumber || curr.kkTestNumber === "") {
        updated.kkTestNumber = curr.testNumber;
      }

      // Sync kirOwnerName
      if (curr.kirOwnerName === prev.ownerName || curr.kirOwnerName === "") {
        updated.kirOwnerName = curr.ownerName;
      }
      // Sync kirPlateNumber
      if (
        curr.kirPlateNumber === prev.plateNumber ||
        curr.kirPlateNumber === ""
      ) {
        updated.kirPlateNumber = curr.plateNumber;
      }
      // Sync kirTestNumber
      if (curr.kirTestNumber === prev.testNumber || curr.kirTestNumber === "") {
        updated.kirTestNumber = curr.testNumber;
      }
      // Sync kirVehicleType
      if (
        curr.kirVehicleType === prev.vehicleType ||
        curr.kirVehicleType === "Delvan"
      ) {
        updated.kirVehicleType = curr.vehicleType;
      }

      return updated;
    });

    // Update refs
    prevValuesRef.current = {
      ownerName: formData.ownerName,
      plateNumber: formData.plateNumber,
      testNumber: formData.testNumber,
      vehicleType: formData.vehicleType,
    };
  }, [
    formData.ownerName,
    formData.plateNumber,
    formData.vehicleType,
    formData.testNumber,
  ]);

  // Keep vehicleDetailModal in sync with latest props
  useEffect(() => {
    if (vehicleDetailModal) {
      const updated = vehicles.find((v) => v.id === vehicleDetailModal.id);
      if (updated) {
        setVehicleDetailModal(updated);
      } else {
        setVehicleDetailModal(null); // closed if deleted
      }
    }
  }, [vehicles, vehicleDetailModal?.id]);

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.vehicleType.toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpenAdd = () => {
    setFormData({
      ownerName: "",
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
      kartuKirMobilBaru: false,
      kartuKirBelumAda: false,
      sertifikatKirFile: null,
      sertifikatKirHilang: false,
      sertifikatKirMobilBaru: false,
      sertifikatKirBelumAda: false,
      stnkFile: null,
      stnkHilang: false,
      stnkBelumAda: false,
    });
    setModalType("add");
  };

  const handleOpenEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      ownerName: vehicle.ownerName || "",
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
      kartuKirFile: vehicle.kartuKirFileName || null,
      kartuKirHilang: !!vehicle.kartuKirHilang,
      kartuKirMobilBaru: !!vehicle.kartuKirMobilBaru,
      kartuKirBelumAda: !!vehicle.kartuKirBelumAda,
      sertifikatKirFile: vehicle.sertifikatKirFileName || null,
      sertifikatKirHilang: !!vehicle.sertifikatKirHilang,
      sertifikatKirMobilBaru: !!vehicle.sertifikatKirMobilBaru,
      sertifikatKirBelumAda: !!vehicle.sertifikatKirBelumAda,
      stnkFile: vehicle.stnkFileName || null,
      stnkHilang: !!vehicle.stnkHilang,
      stnkBelumAda: !!vehicle.stnkBelumAda,
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

      balik_nama: `Pengurusan Balik Nama Kendaraan (BBN-KB) untuk kendaraan ${vehicle.plateNumber} karena data pemilik/NOPOL pada STNK tidak sesuai dengan data pada Sertifikat KIR. Wajib menyesuaikan data saat perpanjangan KIR.`,

      // New Jakarta-area STNK services (routed to Padajaya)
      balik_nama_stnk: `Pengurusan Balik Nama STNK untuk kendaraan ${vehicle.plateNumber}. Proses administrasi perubahan nama pemilik pada STNK.`,
      mutasi: `Pengurusan Mutasi Kendaraan untuk kendaraan ${vehicle.plateNumber}. Proses administrasi perpindahan kepemilikan atau domisili kendaraan.`,
      mutasi_masuk_stnk: `Pengurusan Mutasi Masuk STNK (Ke-Jakarta) untuk kendaraan ${vehicle.plateNumber}. Proses memasukkan data STNK kendaraan dari luar wilayah Jakarta ke wilayah Jakarta.`,
      stnk_hilang: `Pengurusan penggantian STNK Hilang untuk kendaraan ${vehicle.plateNumber}. Proses permohonan penerbitan STNK baru karena kehilangan.`,
      ganti_alamat: `Pengurusan perubahan alamat pada STNK untuk kendaraan ${vehicle.plateNumber}. Penyesuaian data alamat pemilik kendaraan.`,
      blokir_progresif: `Pengurusan Blokir Progresif Pajak Kendaraan untuk ${vehicle.plateNumber}. Pemblokiran STNK sementara untuk menghindari akumulasi pajak.`,
      cek_fisik_bantuan: `Pengurusan Cek Fisik Bantuan kendaraan untuk ${vehicle.plateNumber}. Pendampingan proses pemeriksaan fisik kendaraan.`,
      urus_e_tilang: `Pengurusan E-Tilang untuk kendaraan ${vehicle.plateNumber}. Bantuan penanganan dan penyelesaian tilang elektronik.`,
      cabut_berkas_stnk: `Pengurusan Cabut Berkas STNK untuk kendaraan ${vehicle.plateNumber}. Proses pengambilan berkas STNK dari kepolisian/Samsat.`,

      // New SIM services (client chooses admin)
      bikin_sim_a: `Pembuatan SIM A baru untuk ${vehicle.plateNumber}. Proses pembuatan Surat Izin Mengemudi golongan A (kendaraan penumpang < 3000kg).`,
      bikin_sim_c: `Pembuatan SIM C baru untuk ${vehicle.plateNumber}. Proses pembuatan Surat Izin Mengemudi golongan C (sepeda motor).`,
      perpanjang_sim_a: `Perpanjangan SIM A untuk ${vehicle.plateNumber}. Proses perpanjangan masa berlaku Surat Izin Mengemudi golongan A yang akan habis.`,
      perpanjang_sim_c: `Perpanjangan SIM C untuk ${vehicle.plateNumber}. Proses perpanjangan masa berlaku Surat Izin Mengemudi golongan C yang akan habis.`,

      // New Jakarta-area KIR services
      kir_uji_baru: `Pengurusan Uji KIR Baru (pertama kali) untuk kendaraan ${vehicle.plateNumber}. Proses pendaftaran dan pengujian KIR untuk kendaraan yang belum pernah diuji.`,
      kir_numpang_uji: `Pengurusan Numpang Uji KIR untuk kendaraan ${vehicle.plateNumber}. Pengujian KIR di wilayah Jakarta untuk kendaraan dengan domisili luar Jakarta.`,
      kir_mutasi_masuk: `Pengurusan Mutasi Masuk (Ke-Jakarta) data KIR untuk kendaraan ${vehicle.plateNumber}. Proses perpindahan data uji KIR ke wilayah Jakarta.`,
      kir_mutasi_keluar: `Pengurusan Mutasi Keluar (Cabut Berkas) data KIR untuk kendaraan ${vehicle.plateNumber}. Proses pencabutan berkas uji KIR dari wilayah Jakarta.`,
      kir_balik_nama: `Pengurusan Balik Nama data KIR untuk kendaraan ${vehicle.plateNumber}. ⚠️ Catatan: Pengurusan balik nama KIR hanya dapat dilakukan bersamaan dengan proses Perpanjang Uji KIR atau Buka Blokir Data.`,
      kir_ganti_nopol: `Pengurusan Ganti Nopol data KIR untuk kendaraan ${vehicle.plateNumber}. ⚠️ Catatan: Pengurusan ganti nopol KIR hanya dapat dilakukan bersamaan dengan proses Perpanjang Uji KIR atau Buka Blokir Data.`,
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

  // Auto-set chosen admin for SIM services based on company admin
  // DISABLED - Let automatic routing handle this
  /*
  useEffect(() => {
    if (
      ["bikin_sim_a", "bikin_sim_c", "perpanjang_sim_a", "perpanjang_sim_c"].includes(requestServiceType) &&
      !chosenAdminId
    ) {
      setChosenAdminId(company.adminId || "admin-1");
    }
  }, [requestServiceType, company.adminId]);
  */

  const handleOpenUrus = (vehicle) => {
    setSelectedVehicle(vehicle);
    setRequestLaporHilang(false);
    setRequestMediaNasional(false);
    setRequestSimService(null);
    setChosenAdminId(null);
    setRequestServiceType("");
    setRequestDesc("");
    setModalType("urus");
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.ownerName ||
      !formData.plateNumber ||
      !formData.testNumber ||
      !formData.kirExpiry ||
      !formData.stnkExpiry ||
      !formData.pajakExpiry
    )
      return;

    const isKartuKirOk =
      formData.kartuKirHilang ||
      formData.kartuKirMobilBaru ||
      formData.kartuKirBelumAda ||
      !!formData.kartuKirFile;
    const isSertifikatKirOk =
      formData.sertifikatKirHilang ||
      formData.sertifikatKirMobilBaru ||
      formData.sertifikatKirBelumAda ||
      !!formData.sertifikatKirFile;
    const isStnkOk =
      formData.stnkHilang ||
      formData.stnkBelumAda ||
      !!formData.stnkFile;

    if (!isKartuKirOk || !isSertifikatKirOk || !isStnkOk) {
      alert(
        "Harap unggah dokumen Kartu KIR, Sertifikat KIR, dan STNK terlebih dahulu (kecuali dinyatakan Mobil Baru / Hilang / Belum Ada).",
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
        formData.ownerName ||
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
      kartuKirMobilBaru: !!formData.kartuKirMobilBaru,
      kartuKirBelumAda: !!formData.kartuKirBelumAda,
      sertifikatKirHilang: !!formData.sertifikatKirHilang,
      sertifikatKirMobilBaru: !!formData.sertifikatKirMobilBaru,
      sertifikatKirBelumAda: !!formData.sertifikatKirBelumAda,
      kartuKirFileName:
        formData.kartuKirHilang || formData.kartuKirMobilBaru || formData.kartuKirBelumAda
          ? null
          : formData.kartuKirFile,
      sertifikatKirFileName:
        formData.sertifikatKirHilang || formData.sertifikatKirMobilBaru || formData.sertifikatKirBelumAda
          ? null
          : formData.sertifikatKirFile,
      stnkFileName: formData.stnkHilang || formData.stnkBelumAda ? null : formData.stnkFile,
      stnkHilang: !!formData.stnkHilang,
      stnkBelumAda: !!formData.stnkBelumAda,
    });

    setModalType(null);
    onUpdate();
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.ownerName ||
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
      // Legacy data mappings — use formData directly (user may have cleared a field)
      ownerName:
        formData.ownerName ||
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
      // Data Kartu Kendaraan (use formData directly, not || with selectedVehicle)
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
      kartuKirMobilBaru: !!formData.kartuKirMobilBaru,
      kartuKirBelumAda: !!formData.kartuKirBelumAda,
      sertifikatKirHilang: !!formData.sertifikatKirHilang,
      sertifikatKirMobilBaru: !!formData.sertifikatKirMobilBaru,
      sertifikatKirBelumAda: !!formData.sertifikatKirBelumAda,
      stnkHilang: !!formData.stnkHilang,
      stnkBelumAda: !!formData.stnkBelumAda,
      kartuKirFileName:
        formData.kartuKirHilang || formData.kartuKirMobilBaru || formData.kartuKirBelumAda
          ? null
          : formData.kartuKirFile,
      sertifikatKirFileName:
        formData.sertifikatKirHilang || formData.sertifikatKirMobilBaru || formData.sertifikatKirBelumAda
          ? null
          : formData.sertifikatKirFile,
      stnkFileName: formData.stnkHilang || formData.stnkBelumAda ? null : formData.stnkFile,
    });

    // Jika modal Data Lengkap terbuka untuk kendaraan ini, refresh datanya
    if (vehicleDetailModal && vehicleDetailModal.id === selectedVehicle.id) {
      const db = getFleetDatabase();
      const updated = db.vehicles.find((v) => v.id === selectedVehicle.id);
      if (updated) setVehicleDetailModal(updated);
    }

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

    if (!requestServiceType) {
      alert("Harap pilih jenis pengurusan yang ingin diajukan!");
      return;
    }

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
    if (requestSimService === "sim_baru") {
      addOnCost += 500000;
      addOnDesc += "\n• Pembuatan SIM A Baru (Rp 500.000)";
    }
    if (requestSimService === "sim_perpanjang") {
      addOnCost += 350000;
      addOnDesc += "\n• Perpanjangan SIM A (Rp 350.000)";
    }
    if (requestSimService === "sim_konsultasi") {
      addOnCost += 100000;
      addOnDesc += "\n• Konsultasi Pengurusan SIM Khusus (Rp 100.000)";
    }

    const costMap = {
      kir_renewal: 350000,
      buka_blokir_kir: 1500000,
      balik_nama: 2000000,
      kir_uji_baru: 450000,
      kir_numpang_uji: 500000,
      kir_mutasi_masuk: 1800000,
      kir_mutasi_keluar: 1800000,
      kir_balik_nama: 1500000,
      kir_ganti_nopol: 1200000,
      balik_nama_stnk: 2250000,
      mutasi: 2500000,
      mutasi_masuk_stnk: 2500000,
      stnk_hilang: 600000,
      ganti_alamat: 800000,
      blokir_progresif: 250000,
      cek_fisik_bantuan: 400000,
      urus_e_tilang: 500000,
      cabut_berkas_stnk: 1800000,
      bikin_sim_a: 800000,
      bikin_sim_c: 600000,
      perpanjang_sim_a: 350000,
      perpanjang_sim_c: 300000,
    };
    let baseCost = costMap[requestServiceType] || 350000;

    const serviceLabels = {
      kir_renewal: "Perpanjangan Uji KIR",
      kir_uji_baru: "Uji Baru KIR",
      kir_numpang_uji: "Numpang Uji KIR",
      kir_mutasi_masuk: "Mutasi Masuk (Ke-Jakarta)",
      kir_mutasi_keluar: "Mutasi Keluar (Cabut Berkas)",
      kir_balik_nama: "Balik Nama KIR",
      kir_ganti_nopol: "Ganti Nopol KIR",
      stnk_renewal: "Perpanjangan STNK",
      pajak_renewal: "Perpanjangan Pajak",
      buka_blokir_kir: "Buka Blokir KIR",
      balik_nama: "Balik Nama Kendaraan",
      multiple: "Pengurusan KIR & STNK",
      balik_nama_stnk: "Balik Nama STNK",
      mutasi: "Mutasi Kendaraan",
      mutasi_masuk_stnk: "Mutasi Masuk STNK",
      stnk_hilang: "STNK Hilang",
      ganti_alamat: "Ganti Alamat STNK",
      blokir_progresif: "Blokir Progresif Pajak",
      cek_fisik_bantuan: "Cek Fisik Bantuan",
      urus_e_tilang: "Urus E-Tilang",
      cabut_berkas_stnk: "Cabut Berkas STNK",
      bikin_sim_a: "Bikin SIM A",
      bikin_sim_c: "Bikin SIM C",
      perpanjang_sim_a: "Perpanjang SIM A",
      perpanjang_sim_c: "Perpanjang SIM C",
    };

    const requestPayload = {
      companyId: clientId,
      vehicleId: selectedVehicle.id,
      serviceType: requestServiceType,
      serviceTypeLabel: serviceLabels[requestServiceType] || "Pengurusan Jasa",
      description:
        requestDesc + (addOnDesc ? `\n\nLayanan Tambahan:${addOnDesc}` : ""),
      estimatedCost: baseCost + addOnCost,
    };

    // REMOVED: Let automatic routing handle admin assignment
    // No longer override with chosenAdminId - routing logic in fleetMockData.js will handle this

    addServiceRequest(requestPayload);

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

  // Check if STNK data (owner name, plate) doesn't match Sertifikat KIR data
  // If mismatch, disable KIR renewal/block-unblock and show "balik nama" instead
  const isDataMismatch = (vehicle) => {
    if (!vehicle) return false;
    // Compare STNK owner name vs Sertifikat KIR owner name
    const stnkOwner = (vehicle.stnkOwnerName || "").toLowerCase().trim();
    const kkOwner = (vehicle.kkOwnerName || "").toLowerCase().trim();
    const ownerMatch = !stnkOwner || !kkOwner || stnkOwner === kkOwner;

    // Compare STNK plate vs Sertifikat KIR plate
    const stnkPlate = (vehicle.stnkPlateNumber || "")
      .toLowerCase()
      .replace(/\s+/g, "");
    const kkPlate = (vehicle.kkPlateNumber || "")
      .toLowerCase()
      .replace(/\s+/g, "");
    const plateMatch = !stnkPlate || !kkPlate || stnkPlate === kkPlate;

    // Mismatch happens only when both fields are filled AND they differ
    return (
      stnkOwner && kkOwner && !ownerMatch && stnkPlate && kkPlate && !plateMatch
    );
  };

  // Determine SIM requirements based on vehicle type and SIM expiry
  // Returns: null (not applicable) | 'sim_baru' | 'sim_perpanjang' | 'sim_konsultasi'
  const getSimRequirement = (vehicle) => {
    if (!vehicle || !vehicle.simDriverExpiry) return null;

    const simDays = getDaysRemaining(vehicle.simDriverExpiry);
    const type = (vehicle.vehicleType || "").toLowerCase();

    // Vehicle types that require SIM beyond A & C (heavy vehicles, buses, trailers)
    const heavyTypes = [
      "bus",
      "truck",
      "truck cde",
      "truck cdd",
      "light truck",
      "box",
      "truck wingbox",
      "truk gandeng",
      "kereta tempelan",
      "trailer",
    ];
    const isHeavy = heavyTypes.some((t) => type.includes(t) || type === t);

    if (isHeavy) {
      // These vehicles need SIM B1 or B2 - tidak bisa diproses otomatis
      return "sim_konsultasi";
    }

    // SIM A is for passenger vehicles < 3000kg (suitable for mobil/SUV/sedan)
    if (simDays <= 0) {
      // SIM sudah habis → perlu bikin baru
      return "sim_baru";
    } else if (simDays <= 90) {
      // SIM hampir habis → bisa diperpanjang
      return "sim_perpanjang";
    }

    return null;
  };

  // Detect plate region from plate number prefix
  // Jakarta = "B", BODETABEK proper = "F" (Bogor) or "T" (Tangerang/Karawang)
  // Note: Depok/Tangerang/Bekasi share "B" prefix with Jakarta in real Indonesia,
  // so we treat all "B" plates as Jakarta for routing purposes.
  // Returns: 'jakarta' | 'bodetabek' | 'outside'
  const getPlateRegion = (vehicle) => {
    if (!vehicle) return "outside";
    const plate = (vehicle.plateNumber || "").trim().toUpperCase();
    const firstChar = plate.charAt(0);
    if (firstChar === "B") return "jakarta";
    if (firstChar === "F" || firstChar === "T") return "bodetabek";
    return "outside";
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
                  <label className="fleet-label">
                    Nama Pemilik Kendaraan *
                  </label>
                  <input
                    type="text"
                    className="fleet-input"
                    placeholder="Nama Pemilik"
                    value={formData.ownerName}
                    onChange={(e) =>
                      setFormData({ ...formData, ownerName: e.target.value })
                    }
                    required
                  />
                </div>

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
                      dokumen telah hilang, atau "Belum Ada" apabila dokumen
                      belum tersedia.
                    </div>

                    {[
                      { docType: "kartuKir", label: "Kartu KIR" },
                      { docType: "sertifikatKir", label: "Sertifikat KIR" },
                      { docType: "stnk", label: "STNK" },
                    ].map(({ docType, label }) => {
                      const file = formData[`${docType}File`];
                      const isLost = formData[`${docType}Hilang`];
                      const isBelumAda = formData[`${docType}BelumAda`];

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
                            ) : isBelumAda ? (
                              <span
                                style={{ color: "#b45309", fontSize: "12px" }}
                              >
                                📭 Belum Ada
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
                            docType === "sertifikatKir" ||
                            docType === "stnk") && (
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
                                      ? {
                                          [`${docType}File`]: null,
                                          [`${docType}BelumAda`]: false,
                                        }
                                      : {}),
                                  })
                                }
                              />
                              <strong>
                                {docType === "kartuKir" && "Buku KIR Hilang"}
                                {docType === "sertifikatKir" &&
                                  "Sertifikat KIR Hilang"}
                                {docType === "stnk" && "STNK Hilang"}
                              </strong>
                            </label>
                          )}

                          {(docType === "kartuKir" ||
                            docType === "sertifikatKir" ||
                            docType === "stnk") && (
                            <label
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontSize: "12px",
                                color: "#b45309",
                                margin: "0 0 8px 0",
                                cursor: "pointer",
                                userSelect: "none",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={!!isBelumAda}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    [`${docType}BelumAda`]: e.target.checked,
                                    ...(e.target.checked
                                      ? {
                                          [`${docType}File`]: null,
                                          [`${docType}Hilang`]: false,
                                        }
                                      : {}),
                                  })
                                }
                              />
                              <strong>
                                {docType === "kartuKir" && "Buku KIR Belum Ada"}
                                {docType === "sertifikatKir" &&
                                  "Sertifikat KIR Belum Ada"}
                                {docType === "stnk" && "STNK Belum Ada"}
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
                          ) : isBelumAda ? (
                            <div
                              style={{
                                marginTop: "8px",
                                fontSize: "11px",
                                color: "#b45309",
                                background: "#fffbeb",
                                padding: "8px 12px",
                                borderRadius: "6px",
                                border: "1px solid #fde68a",
                                lineHeight: "1.4",
                              }}
                            >
                              📭 <strong>Dokumen Belum Ada:</strong> Kendaraan
                              tetap dapat didaftarkan ke armada. Silakan unggah
                              dokumen ini di kemudian hari setelah dokumen
                              tersedia.
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
                                    <div
                                      style={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
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
                                      <span
                                        style={{
                                          fontSize: "11px",
                                          color: "#15803d",
                                        }}
                                      >
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
                                      onClick={() =>
                                        removeDocumentFile(docType)
                                      }
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
                                    e.currentTarget.style.borderColor =
                                      "#3b82f6";
                                    e.currentTarget.style.background =
                                      "#f8fafc";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor =
                                      "#cbd5e1";
                                    e.currentTarget.style.background =
                                      "#ffffff";
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
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      color: "#6b7a96",
                                    }}
                                  >
                                    Klik untuk mengunggah file (PDF, PNG, JPG,
                                    JPEG)
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

                    {selectedVehicle && isDataMismatch(selectedVehicle) && (
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
                        ⚠️ <strong>Data Tidak Sesuai:</strong> Data pemilik
                        dan/atau NOPOL pada STNK tidak sesuai dengan data pada
                        Sertifikat KIR. Perpanjangan KIR tidak dapat diproses
                        sebelum dilakukan{" "}
                        <strong>Balik Nama Kendaraan (BBN-KB)</strong>.
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

                    {/* Layanan SIM Driver */}
                    {selectedVehicle?.simDriverExpiry && (
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
                          🪪 Layanan Pengurusan SIM
                        </h4>
                        <p
                          style={{
                            fontSize: "11.5px",
                            color: "#15803d",
                            margin: "0 0 12px 0",
                            lineHeight: "1.4",
                          }}
                        >
                          {(() => {
                            const req = getSimRequirement(selectedVehicle);
                            if (req === "sim_baru")
                              return "Masa berlaku SIM driver sudah habis. Kami dapat membantu pembuatan SIM A baru.";
                            if (req === "sim_perpanjang")
                              return "Masa berlaku SIM driver akan segera habis. Kami dapat membantu perpanjangan SIM A.";
                            if (req === "sim_konsultasi")
                              return "Kendaraan ini memerlukan SIM khusus (B1/B2). Hubungi kami untuk konsultasi pengurusan SIM.";
                            return null;
                          })()}
                        </p>
                        {(() => {
                          const req = getSimRequirement(selectedVehicle);
                          if (
                            req === "sim_baru" ||
                            req === "sim_perpanjang" ||
                            req === "sim_konsultasi"
                          ) {
                            return (
                              <label
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  padding: "8px 10px",
                                  background: "#fafafa",
                                  borderRadius: "6px",
                                  border: `1px solid ${requestSimService === req ? "#22c55e" : "#e5e7eb"}`,
                                  cursor: "pointer",
                                  userSelect: "none",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={requestSimService === req}
                                  onChange={(e) =>
                                    setRequestSimService(
                                      e.target.checked ? req : null,
                                    )
                                  }
                                />
                                <div>
                                  <strong style={{ fontSize: "13px" }}>
                                    {req === "sim_baru" &&
                                      "Bantu Pembuatan SIM A Baru"}
                                    {req === "sim_perpanjang" &&
                                      "Bantu Perpanjangan SIM A"}
                                    {req === "sim_konsultasi" &&
                                      "Konsultasi Pengurusan SIM Khusus"}
                                  </strong>
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      color: "#6b7a96",
                                    }}
                                  >
                                    {req === "sim_baru" &&
                                      "Rp 500.000 — Pembuatan SIM A baru"}
                                    {req === "sim_perpanjang" &&
                                      "Rp 350.000 — Perpanjangan SIM A"}
                                    {req === "sim_konsultasi" &&
                                      "Rp 100.000 — Konsultasi persyaratan & proses SIM B1/B2"}
                                  </div>
                                </div>
                              </label>
                            );
                          }
                          if (req === null && selectedVehicle.simDriverExpiry) {
                            return (
                              <div
                                style={{
                                  padding: "8px 10px",
                                  fontSize: "12px",
                                  color: "#15803d",
                                  background: "#f0fdf4",
                                  borderRadius: "6px",
                                  border: "1px solid #bbf7d0",
                                }}
                              >
                                ✓ Masa berlaku SIM driver masih panjang (
                                {getDaysRemaining(
                                  selectedVehicle.simDriverExpiry,
                                )}{" "}
                                hari).
                              </div>
                            );
                          }
                          return null;
                        })()}
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
                        <option value="" disabled>
                          -- Harap pilih jenis pengurusan --
                        </option>
                        {(() => {
                          const region = getPlateRegion(selectedVehicle);
                          const dataMismatch =
                            selectedVehicle && isDataMismatch(selectedVehicle);

                          // Outside-Jakarta-and-BODETABEK plates may only use
                          // these 3 services
                          const allowedForOutside = [
                            "kir_mutasi_masuk",
                            "kir_numpang_uji",
                            "mutasi_masuk_stnk",
                          ];

                          // Returns true when the option must be disabled
                          // because of plate-region rules (outside: only the
                          // 3 allowed; bodetabek: disables only kir_numpang_uji)
                          const isRegionDisabled = (val) => {
                            if (region === "outside") {
                              return !allowedForOutside.includes(val);
                            }
                            if (region === "bodetabek") {
                              return val === "kir_numpang_uji";
                            }
                            return false;
                          };

                          // Reusable "Pengurusan KIR (Jakarta)" options group
                          const kirJakartaGroup = ({
                            kirRenewalDisabled = false,
                            bukaBlokirDisabled = false,
                          } = {}) => (
                            <>
                              <option disabled style={{ opacity: 0.5 }}>
                                ─── Pengurusan KIR (Jakarta) ───
                              </option>
                              <option
                                value="kir_renewal"
                                disabled={
                                  isRegionDisabled("kir_renewal") ||
                                  kirRenewalDisabled
                                }
                              >
                                Perpanjang Uji KIR
                              </option>
                              <option
                                value="buka_blokir_kir"
                                disabled={
                                  isRegionDisabled("buka_blokir_kir") ||
                                  bukaBlokirDisabled
                                }
                              >
                                Buka Blokir Data
                              </option>
                              <option
                                value="kir_uji_baru"
                                disabled={isRegionDisabled("kir_uji_baru")}
                              >
                                Uji Baru
                              </option>
                              <option
                                value="kir_numpang_uji"
                                disabled={isRegionDisabled("kir_numpang_uji")}
                              >
                                Numpang Uji
                              </option>
                              <option
                                value="kir_mutasi_masuk"
                                disabled={isRegionDisabled("kir_mutasi_masuk")}
                              >
                                Mutasi Masuk (Ke-Jakarta)
                              </option>
                              <option
                                value="kir_mutasi_keluar"
                                disabled={isRegionDisabled("kir_mutasi_keluar")}
                              >
                                Mutasi Keluar (Cabut Berkas)
                              </option>
                              <option
                                value="kir_balik_nama"
                                disabled={isRegionDisabled("kir_balik_nama")}
                              >
                                Balik Nama
                              </option>
                              <option
                                value="kir_ganti_nopol"
                                disabled={isRegionDisabled("kir_ganti_nopol")}
                              >
                                Ganti Nopol
                              </option>
                            </>
                          );

                          // Reusable "Pengurusan STNK (Jakarta)" options group
                          const stnkJakartaGroup = () => (
                            <>
                              <option disabled style={{ opacity: 0.5 }}>
                                ─── Pengurusan STNK (Jakarta) ───
                              </option>
                              <option
                                value="stnk_renewal"
                                disabled={isRegionDisabled("stnk_renewal")}
                              >
                                Perpanjangan STNK 5 Tahunan
                              </option>
                              <option
                                value="pajak_renewal"
                                disabled={isRegionDisabled("pajak_renewal")}
                              >
                                Perpanjangan Pajak Kendaraan Tahunan
                              </option>
                              <option
                                value="balik_nama_stnk"
                                disabled={isRegionDisabled("balik_nama_stnk")}
                              >
                                Balik Nama STNK
                              </option>
                              <option
                                value="mutasi"
                                disabled={isRegionDisabled("mutasi")}
                              >
                                Mutasi
                              </option>
                              <option
                                value="mutasi_masuk_stnk"
                                disabled={isRegionDisabled("mutasi_masuk_stnk")}
                              >
                                Mutasi Masuk STNK
                              </option>
                              <option
                                value="stnk_hilang"
                                disabled={isRegionDisabled("stnk_hilang")}
                              >
                                STNK Hilang
                              </option>
                              <option
                                value="ganti_alamat"
                                disabled={isRegionDisabled("ganti_alamat")}
                              >
                                Ganti Alamat
                              </option>
                              <option
                                value="blokir_progresif"
                                disabled={isRegionDisabled("blokir_progresif")}
                              >
                                Blokir Progresif Pajak
                              </option>
                              <option
                                value="cek_fisik_bantuan"
                                disabled={isRegionDisabled("cek_fisik_bantuan")}
                              >
                                Cek Fisik Bantuan
                              </option>
                              <option
                                value="urus_e_tilang"
                                disabled={isRegionDisabled("urus_e_tilang")}
                              >
                                Urus E-Tilang
                              </option>
                              <option
                                value="cabut_berkas_stnk"
                                disabled={isRegionDisabled("cabut_berkas_stnk")}
                              >
                                Cabut Berkas STNK
                              </option>
                            </>
                          );

                          // Reusable "Pengurusan SIM" options group
                          const simGroup = () => (
                            <>
                              <option disabled style={{ opacity: 0.5 }}>
                                ─── Pengurusan SIM ───
                              </option>
                              <option value="bikin_sim_a">Bikin SIM A</option>
                              <option value="bikin_sim_c">Bikin SIM C</option>
                              <option value="perpanjang_sim_a">Perpanjang SIM A</option>
                              <option value="perpanjang_sim_c">Perpanjang SIM C</option>
                            </>
                          );

                          if (dataMismatch) {
                            return (
                              <>
                                <option value="balik_nama">
                                  Balik Nama Kendaraan (BBN-KB)
                                </option>
                                {kirJakartaGroup({
                                  kirRenewalDisabled: true,
                                  bukaBlokirDisabled: true,
                                })}
                                {stnkJakartaGroup()}
                                {simGroup()}
                              </>
                            );
                          }
                          if (isKirBlocked) {
                            return (
                              <>
                                {kirJakartaGroup({ kirRenewalDisabled: true })}
                                {stnkJakartaGroup()}
                                {simGroup()}
                              </>
                            );
                          }
                          return (
                            <>
                              {kirJakartaGroup()}
                              {stnkJakartaGroup()}
                              {simGroup()}
                            </>
                          );
                        })()}
                      </select>
                    </div>

                    {(() => {
                      const region = getPlateRegion(selectedVehicle);
                      if (selectedVehicle && region === "outside") {
                        return (
                          <div
                            style={{
                              background: "#fef2f2",
                              border: "1px solid #fca5a5",
                              borderRadius: "8px",
                              padding: "10px 12px",
                              fontSize: "12px",
                              color: "#b91c1c",
                              marginBottom: "16px",
                              lineHeight: "1.5",
                              textAlign: "left",
                            }}
                          >
                            ⚠️ <strong>Layanan Terbatas:</strong> Kendaraan yang
                            tidak terdaftar di Jakarta (Sertifikat KIR, Kartu
                            KIR, STNK). Hanya bisa mengajukan pengurusan pada
                            opsi yang diberikan:{" "}
                            <strong>Mutasi Masuk KIR</strong>,{" "}
                            <strong>Numpang Uji KIR</strong>, dan{" "}
                            <strong>Mutasi Masuk STNK</strong>.
                          </div>
                        );
                      }
                      if (selectedVehicle && region === "bodetabek") {
                        return (
                          <div
                            style={{
                              background: "#fffbe6",
                              border: "1px solid #ffe58f",
                              borderRadius: "8px",
                              padding: "10px 12px",
                              fontSize: "12px",
                              color: "#d46b08",
                              marginBottom: "16px",
                              lineHeight: "1.5",
                              textAlign: "left",
                            }}
                          >
                            ⚠️ <strong>Layanan Terbatas:</strong> Kendaraan
                            terdaftar di area BODETABEK. Opsi{" "}
                            <strong>Numpang Uji KIR</strong> dinonaktifkan
                            karena tidak berlaku untuk kendaraan area BODETABEK.
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Routing info for Jakarta STNK services → Padajaya */}
                    {(() => {
                      const isJakartaStnkService = [
                        "stnk_renewal",
                        "pajak_renewal",
                        "balik_nama_stnk",
                        "mutasi",
                        "mutasi_masuk_stnk",
                        "stnk_hilang",
                        "ganti_alamat",
                        "blokir_progresif",
                        "cek_fisik_bantuan",
                        "urus_e_tilang",
                        "cabut_berkas_stnk",
                      ].includes(requestServiceType);
                      const isClientOfAdmin1 =
                        (company.adminId || "admin-1") === "admin-1";
                      if (isJakartaStnkService && isClientOfAdmin1) {
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
                            Pengurusan STNK/Pajak wilayah Jakarta dari client
                            Admin Sentra akan dialihkan secara otomatis ke{" "}
                            <strong>Administrator Padajaya</strong>. Admin
                            Padajaya akan dapat melihat info PIC Anda untuk
                            berkomunikasi langsung.
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Catatan untuk Balik Nama KIR — wajib bersamaan dengan Perpanjang Uji KIR / Buka Blokir */}
                    {requestServiceType === "kir_balik_nama" && (
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
                        📌 <strong>Catatan Penting:</strong> Pengurusan{" "}
                        <strong>Balik Nama</strong> hanya dapat dilakukan
                        bersamaan dengan proses{" "}
                        <strong>Perpanjang Uji KIR</strong> atau{" "}
                        <strong>Buka Blokir Data</strong>. Pastikan Anda juga
                        memilih salah satu dari kedua layanan tersebut.
                      </div>
                    )}

                    {/* Catatan untuk Ganti Nopol KIR — wajib bersamaan dengan Perpanjang Uji KIR / Buka Blokir */}
                    {requestServiceType === "kir_ganti_nopol" && (
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
                        📌 <strong>Catatan Penting:</strong> Pengurusan{" "}
                        <strong>Ganti Nopol</strong> hanya dapat dilakukan
                        bersamaan dengan proses{" "}
                        <strong>Perpanjang Uji KIR</strong> atau{" "}
                        <strong>Buka Blokir Data</strong>. Pastikan Anda juga
                        memilih salah satu dari kedua layanan tersebut.
                      </div>
                    )}

                    {["bikin_sim_a", "bikin_sim_c", "perpanjang_sim_a", "perpanjang_sim_c"].includes(
                      requestServiceType,
                    ) && (
                      <div
                        style={{
                          background: "#eff6ff",
                          border: "1px solid #bfdbfe",
                          borderRadius: "8px",
                          padding: "12px",
                          fontSize: "12.5px",
                          color: "#1e40af",
                          marginBottom: "16px",
                          lineHeight: "1.5",
                          textAlign: "left",
                        }}
                      >
                        ℹ️ Permohonan {requestServiceType === "bikin_sim_a" || requestServiceType === "bikin_sim_c" ? "pembuatan" : "perpanjangan"} SIM akan diproses oleh{" "}
                        <strong>
                          {company.adminId === "admin-2"
                            ? "Administrator Padajaya"
                            : "Administrator Sentra"}
                        </strong>{" "}
                        sesuai administrator akun Anda.
                      </div>
                    )}

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
                      if (!st) return 0;
                      if (st === "multiple") return 750000;
                      if (st === "buka_blokir_kir") return 1500000;
                      if (st === "balik_nama") return 2000000;
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
                const isBelumAda = selectedVehicle[`${key}BelumAda`];
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
                        : isBelumAda
                          ? "#fffbeb"
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
                              ⚠️ Dokumen hilang
                            </div>
                          ) : isBelumAda ? (
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#b45309",
                                marginTop: "2px",
                              }}
                            >
                              📭 Dokumen belum ada
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
                    {isBelumAda && (
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#b45309",
                          background: "#fffbeb",
                          padding: "6px 10px",
                          borderRadius: "4px",
                          border: "1px solid #fde68a",
                          lineHeight: "1.4",
                        }}
                      >
                        Dokumen belum ada. Silakan unggah apabila dokumen sudah
                        tersedia.
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
              <h3>Data Lengkap Kendaraan — {vehicleDetailModal.plateNumber}</h3>
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
                    const cs = getExpiryCardStyle(
                      vehicleDetailModal.stnkExpiry,
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
                    const cs = getExpiryCardStyle(
                      vehicleDetailModal.pajakExpiry,
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
                      {vehicleDetailModal.kkOwnerName || "-"}
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
                      {vehicleDetailModal.kkOwnerAddress || "-"}
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
                      {vehicleDetailModal.kkPlateNumber || "-"}
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
                      {vehicleDetailModal.kkFrameNumber || "-"}
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
                      {vehicleDetailModal.kkEngineNumber || "-"}
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
                      {vehicleDetailModal.kkTestNumber || "-"}
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
                      {vehicleDetailModal.kirOwnerName || "-"}
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
                      {vehicleDetailModal.kirPlateNumber || "-"}
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
                      {vehicleDetailModal.kirTestNumber || "-"}
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
                      {vehicleDetailModal.kirVehicleType || "-"}
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
                      {vehicleDetailModal.kirBrand || "-"}
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
                      {vehicleDetailModal.stnkOwnerName || "-"}
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
                      {vehicleDetailModal.stnkPlateNumber || "-"}
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
                      {vehicleDetailModal.stnkOwnerAddress || "-"}
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
                      {vehicleDetailModal.stnkBrand || "-"}
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
                      {vehicleDetailModal.stnkVehicleJenis || "-"}
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
                      {vehicleDetailModal.stnkModel || "-"}
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
                      {vehicleDetailModal.stnkYearManufactured || "-"}
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
                      {vehicleDetailModal.stnkFrameNumber || "-"}
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
                      {vehicleDetailModal.stnkEngineNumber || "-"}
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
                    const isBelumAda = vehicleDetailModal[`${key}BelumAda`];
                    const fileName = vehicleDetailModal[`${key}FileName`];

                    return (
                      <div
                        key={key}
                        style={{
                          background: isHilang
                            ? "#fef2f2"
                            : isBelumAda
                              ? "#fffbeb"
                              : fileName
                                ? "#f0fdf4"
                                : "#f8fafc",
                          padding: "12px",
                          borderRadius: "8px",
                          border: isHilang
                            ? "1px solid #fecaca"
                            : isBelumAda
                              ? "1px solid #fde68a"
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
                            <span style={{ fontSize: "18px", display: "none" }}>
                              {icon}
                            </span>
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
                                  ⚠️ Hilang
                                </div>
                              ) : isBelumAda ? (
                                <div
                                  style={{
                                    fontSize: "11px",
                                    color: "#b45309",
                                    marginTop: "2px",
                                  }}
                                >
                                  📭 Belum Ada
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
function RequestsView({ requests, onUpdate }) {
  const [selectedRequest, setSelectedRequest] = useState(null);

  const getStatusBadgeClass = (status) => {
    if (status === "pending") return "warning";
    if (status === "quoted") return "warning";
    if (status === "approved") return "success";
    if (status === "in_progress") return "neutral";
    if (status === "completed") return "success";
    if (status === "cancelled") return "danger";
    return "neutral";
  };

  const getServiceLabel = (type) => {
    const labels = {
      kir_renewal: "Perpanjangan Uji KIR",
      kir_uji_baru: "Uji Baru KIR",
      kir_numpang_uji: "Numpang Uji KIR",
      kir_mutasi_masuk: "Mutasi Masuk (Ke-Jakarta)",
      kir_mutasi_keluar: "Mutasi Keluar (Cabut Berkas)",
      kir_balik_nama: "Balik Nama KIR",
      kir_ganti_nopol: "Ganti Nopol KIR",
      stnk_renewal: "Perpanjangan STNK",
      pajak_renewal: "Perpanjangan Pajak",
      buka_blokir_kir: "Buka Blokir KIR",
      balik_nama: "Balik Nama Kendaraan",
      multiple: "Pengurusan KIR & STNK",
      balik_nama_stnk: "Balik Nama STNK",
      mutasi: "Mutasi Kendaraan",
      mutasi_masuk_stnk: "Mutasi Masuk STNK",
      stnk_hilang: "STNK Hilang",
      ganti_alamat: "Ganti Alamat STNK",
      blokir_progresif: "Blokir Progresif Pajak",
      cek_fisik_bantuan: "Cek Fisik Bantuan",
      urus_e_tilang: "Urus E-Tilang",
      cabut_berkas_stnk: "Cabut Berkas STNK",
      bikin_sim_a: "Bikin SIM A",
      bikin_sim_c: "Bikin SIM C",
      perpanjang_sim_a: "Perpanjang SIM A",
      perpanjang_sim_c: "Perpanjang SIM C",
    };
    return labels[type] || "Pengurusan Jasa";
  };

  const handleApproveQuote = (reqId) => {
    if (confirm("Apakah Anda menyetujui rincian biaya, estimasi waktu, dan persyaratan pengurusan ini?")) {
      clientRespondToQuote(reqId, "approve");
      alert("Persetujuan berhasil dikirim! Status pengurusan saat ini: Disetujui Klien.");
      setSelectedRequest(null);
      onUpdate();
    }
  };

  const handleCancelQuote = (reqId) => {
    if (confirm("Apakah Anda yakin ingin membatalkan pengajuan pengurusan jasa ini?")) {
      clientRespondToQuote(reqId, "cancel");
      alert("Pengajuan berhasil dibatalkan.");
      setSelectedRequest(null);
      onUpdate();
    }
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
              <th style={{ textAlign: "center" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
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
                      maxWidth: "240px",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                    }}
                  >
                    {r.description.length > 60 ? `${r.description.slice(0, 60)}...` : r.description}
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
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="fleet-btn fleet-btn-secondary fleet-btn-sm"
                      onClick={() => setSelectedRequest(r)}
                      style={{ padding: "4px 10px", fontSize: "11px" }}
                    >
                      👁️ Detail Status
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: DETAIL STATUS PENGURUSAN */}
      {selectedRequest && (
        <div className="fleet-modal-overlay">
          <div className="fleet-modal" style={{ maxWidth: "550px" }}>
            <div className="fleet-modal-header">
              <h3>📄 Detail Status Pengurusan — {selectedRequest.plateNumber}</h3>
              <span
                className="btn-close-modal"
                onClick={() => setSelectedRequest(null)}
              >
                ×
              </span>
            </div>
            <div className="fleet-modal-body">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                  marginBottom: "20px",
                  background: "#f8fafc",
                  padding: "14px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div>
                  <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "#64748b", fontWeight: "600" }}>ID Request</p>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", fontFamily: "monospace" }}>{selectedRequest.id}</p>
                </div>
                <div>
                  <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Plat Nomor</p>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: "700" }}>{selectedRequest.plateNumber}</p>
                </div>
                <div>
                  <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Jenis Jasa</p>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: "#1e3a8a" }}>{getServiceLabel(selectedRequest.serviceType)}</p>
                </div>
                <div>
                  <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Status Progres</p>
                  <span className={`badge-status ${getStatusBadgeClass(selectedRequest.status)}`} style={{ display: "inline-block", marginTop: "2px" }}>
                    {selectedRequest.statusLabel || selectedRequest.status}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#1C3967", margin: "0 0 8px 0" }}>Deskripsi Pengajuan</h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    color: "#334155",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {selectedRequest.description}
                </p>
              </div>

              {/* TAMPILAN JIKA BELUM ADA QUOTE (STATUS PENDING) */}
              {selectedRequest.status === "pending" ? (
                <div
                  style={{
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    borderRadius: "8px",
                    padding: "16px",
                    textAlign: "center",
                    color: "#92400e",
                    fontSize: "13.5px",
                    lineHeight: "1.5",
                  }}
                >
                  ⏳ <strong>Sedang Diajukan</strong>
                  <p style={{ margin: "8px 0 0 0", fontSize: "12.5px" }}>
                    Menunggu Admin tujuan mengkonfirmasi, memeriksa berkas, dan memberikan rincian harga jasa resmi, estimasi waktu, serta syarat-syarat pengurusan berkas asli.
                  </p>
                </div>
              ) : (
                /* TAMPILAN JIKA SUDAH ADA QUOTE DARI ADMIN */
                <div
                  style={{
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    padding: "16px",
                    background: "#f0fdf4",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "13.5px",
                      fontWeight: "800",
                      color: "#166534",
                      margin: "0 0 14px 0",
                      borderBottom: "1px solid #bbf7d0",
                      paddingBottom: "6px",
                    }}
                  >
                    📋 Rincian Penawaran & Syarat dari Admin
                  </h4>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                    <div>
                      <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "#166534", fontWeight: "600" }}>Biaya Jasa Resmi</p>
                      <p style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#166534" }}>
                        Rp {selectedRequest.serviceQuote?.serviceFee?.toLocaleString("id-ID") || selectedRequest.estimatedCost?.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "#166534", fontWeight: "600" }}>Estimasi Waktu</p>
                      <p style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#166534" }}>
                        {selectedRequest.serviceQuote?.estimatedTime || "-"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "#166534", fontWeight: "600" }}>Syarat-syarat Pengurusan</p>
                    <div
                      style={{
                        background: "#ffffff",
                        border: "1px solid #bbf7d0",
                        padding: "10px 12px",
                        borderRadius: "6px",
                        fontSize: "12.5px",
                        color: "#166534",
                        whiteSpace: "pre-wrap",
                        lineHeight: "1.5",
                      }}
                    >
                      {selectedRequest.serviceQuote?.terms || "Tidak ada persyaratan khusus."}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="fleet-modal-footer" style={{ justifyContent: "flex-end" }}>
              {selectedRequest.status === "quoted" ? (
                <>
                  <button
                    type="button"
                    className="fleet-btn fleet-btn-danger"
                    onClick={() => handleCancelQuote(selectedRequest.id)}
                  >
                    ❌ Batalkan Pengurusan
                  </button>
                  <button
                    type="button"
                    className="fleet-btn fleet-btn-accent"
                    onClick={() => handleApproveQuote(selectedRequest.id)}
                  >
                    ✅ Lanjut Urus (ACC)
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="fleet-btn fleet-btn-secondary"
                  onClick={() => setSelectedRequest(null)}
                >
                  Tutup
                </button>
              )}
            </div>
          </div>
        </div>
      )}
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
