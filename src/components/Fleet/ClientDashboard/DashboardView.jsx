import React from "react";
import { getDaysRemaining } from "../../../utils/fleetMockData.js";

export default function DashboardView({ vehicles, requests, navigate }) {
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