import React from "react";
import { getDaysRemaining } from "../../../utils/fleetMockData.js";
import { getCompanyName, getPlateNumber } from "./helpers.js";

export default function BusinessDashboardView({ db, adminId, navigate }) {
  const filteredCompanies = db.companies.filter(
    (c) => c.adminId === adminId && c.ownerType !== "admin",
  );
  const companyIds = filteredCompanies.map((c) => c.id);
  const filteredVehicles = db.vehicles.filter((v) =>
    companyIds.includes(v.companyId),
  );

  const totalCompanies = filteredCompanies.length;
  const totalVehicles = filteredVehicles.length;

  let kir30 = 0;
  let stnk30 = 0;
  let pajak30 = 0;

  let kirOpportunities = 0;
  let stnkPajakOpportunities = 0;

  filteredVehicles.forEach((v) => {
    const kirDays = getDaysRemaining(v.kirExpiry);
    const stnkDays = getDaysRemaining(v.stnkExpiry);
    const pajakDays = getDaysRemaining(v.pajakExpiry);

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

  const estimatedPricePerDoc = 350000;
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
                {db.requests
                  .filter((r) => r.adminId === adminId)
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
                  db.requests
                    .filter((r) => r.adminId === adminId)
                    .filter((r) => r.status === "pending")
                    .slice(0, 5)
                    .map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: "600" }}>
                          {r.companyName || getCompanyName(db, r.companyId)}
                        </td>
                        <td>
                          {r.plateNumber || getPlateNumber(db, r.vehicleId)}
                        </td>
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
