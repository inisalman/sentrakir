import React, { useState } from "react";
import { getTierConfig, addMembershipRequest, getMembershipRequestsForCompany, getAdminById } from "../../../utils/fleetMockData.js";
import { updateCompany as updateCompanySupabase, uploadPaymentProof } from "../../../utils/supabaseClientAuth.js";
import { notifClientUpgradeDikonfirmasi } from "../../../utils/notificationWA.js";

const formatDateLong = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
};

export default function BillingView({ company, vehiclesCount, onUpdate }) {
  const tierOrder = ["free", "kecil", "menengah", "besar"];
  const tiers = tierOrder.map((id) => getTierConfig(id));
  const currentTier = getTierConfig(company.membershipTier || "free");
  const currentLimit = currentTier.vehicleLimit;

  const myRequests = getMembershipRequestsForCompany(company.id);
  const pendingReq = myRequests.find((r) => r.status === "pending");
  const managingAdmin = getAdminById(company.adminId || "admin-1");

  // Upgrade modal state
  const [upgradeModal, setUpgradeModal] = useState(null); // { tierId, tierName, price }
  const [paymentFile, setPaymentFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const submitMembershipRequest = (requestedTierId, requestType) => {
    if (pendingReq) {
      alert("Anda masih memiliki permintaan membership yang sedang diproses. Mohon tunggu hingga selesai.");
      return;
    }
    const target = requestedTierId ? getTierConfig(requestedTierId) : null;
    const confirmMsg = requestType === "cancel"
      ? "Ajukan berhenti berlangganan? Akun Anda akan turun ke paket Starter."
      : `Ajukan pindah ke paket ${target.name}? Permintaan akan ditinjau oleh Admin.`;
    if (!confirm(confirmMsg)) return;
    addMembershipRequest({ companyId: company.id, requestedTier: requestedTierId, requestType });
    alert("Permintaan berhasil dikirim ke Admin untuk ditinjau.");
    onUpdate && onUpdate();
  };

  const handleUpgradeClick = (tierId) => {
    const target = getTierConfig(tierId);
    setUpgradeModal({ tierId, tierName: target.name, price: target.priceLabel });
    setPaymentFile(null);
    setUploadError("");
  };

  const handleUpgradeSubmit = async () => {
    if (!paymentFile) {
      setUploadError("Mohon upload bukti pembayaran.");
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const filePath = await uploadPaymentProof(paymentFile, company.email);

      await updateCompanySupabase(company.id, {
        subscription_status: `pending_payment:${upgradeModal.tierId}`,
        payment_proof_path: filePath,
      });
      // Notif WA ke client
      if (company.picPhone) {
        notifClientUpgradeDikonfirmasi(company.picPhone, company.name, upgradeModal.tierName);
      }
      setUploading(false);
      setUpgradeModal(null);
      alert("Permintaan upgrade berhasil dikirim. Menunggu konfirmasi admin.");
      onUpdate && onUpdate();
    } catch (err) {
      setUploadError(err.message);
      setUploading(false);
    }
  };

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
              {currentTier.name}
            </p>
            <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>
              Penggunaan Armada: <strong>{vehiclesCount}</strong>
              {currentLimit !== null ? ` / ${currentLimit}` : ""} kendaraan
              terdaftar. Status Langganan:{" "}
              <span
                style={{
                  color:
                    company.subscriptionStatus === "cancelled"
                      ? "#dc2626"
                      : "#16a34a",
                  fontWeight: "700",
                }}
              >
                {company.subscriptionStatus === "cancelled"
                  ? "DIBATALKAN"
                  : "AKTIF"}
              </span>
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span
              style={{ fontSize: "18px", fontWeight: "800", color: "#1C3967" }}
            >
              {currentTier.priceLabel}
              {currentTier.period}
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: "12px",
            fontSize: "12px",
            color: "#64748b",
            borderTop: "1px dashed #bfdbfe",
            paddingTop: "10px",
          }}
        >
          ℹ️ Pengaturan paket membership (upgrade, downgrade, berhenti
          berlangganan) sepenuhnya dikelola dan disetujui oleh{" "}
          <strong>Admin Sentra</strong>.
          {(company.adminId || "admin-1") !== "admin-1" && managingAdmin && (
            <>
              {" "}
              Akun Anda dikelola oleh{" "}
              <strong>Admin {managingAdmin.name}</strong>, namun permintaan
              membership akan otomatis dialihkan ke Admin Sentra.
            </>
          )}
        </div>
      </div>

      {/* Pending request banner */}
      {pendingReq && (
        <div
          className="fleet-card"
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            marginTop: "16px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: "#b45309",
              fontWeight: "600",
            }}
          >
            ⏳ Permintaan{" "}
            {pendingReq.requestType === "cancel"
              ? "berhenti berlangganan"
              : `perubahan ke paket ${getTierConfig(pendingReq.requestedTier).name}`}{" "}
            sedang menunggu persetujuan Admin Sentra.
          </p>
        </div>
      )}

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
          const isActive = (company.membershipTier || "free") === t.id;
          const currentIdx = tierOrder.indexOf(
            company.membershipTier || "free",
          );
          const thisIdx = tierOrder.indexOf(t.id);
          const isUpgrade = thisIdx > currentIdx;
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
                {t.priceLabel} <span>{t.period}</span>
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
              {!isActive && isUpgrade && (
                <button
                  className="fleet-btn fleet-btn-secondary"
                  style={{ width: "100%", marginTop: "20px", justifyContent: "center" }}
                  disabled={company.subscriptionStatus?.startsWith("pending_payment")}
                  onClick={() => handleUpgradeClick(t.id)}
                >
                  Ajukan Upgrade
                </button>
              )}
              {!isActive && !isUpgrade && t.id !== "free" && (
                <button
                  className="fleet-btn fleet-btn-secondary"
                  style={{ width: "100%", marginTop: "20px", justifyContent: "center" }}
                  disabled={!!pendingReq}
                  onClick={() => submitMembershipRequest(t.id, "downgrade")}
                >
                  Ajukan Pindah Paket
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Cancel subscription */}
      {(company.membershipTier || "free") !== "free" &&
        company.subscriptionStatus !== "cancelled" && (
          <div style={{ marginTop: "24px", textAlign: "right" }}>
            <button
              className="fleet-btn fleet-btn-danger fleet-btn-sm"
              disabled={!!pendingReq}
              onClick={() => submitMembershipRequest(null, "cancel")}
            >
              Ajukan Berhenti Berlangganan
            </button>
          </div>
        )}

      {/* Request history */}
      {myRequests.length > 0 && (
        <div className="fleet-card" style={{ marginTop: "24px" }}>
          <h3
            style={{
              fontSize: "15px",
              fontWeight: "800",
              color: "#1C3967",
              margin: "0 0 16px 0",
            }}
          >
            Riwayat Permintaan Membership
          </h3>
          <div className="fleet-table-container">
            <table className="fleet-table" style={{ fontSize: "13px" }}>
              <thead>
                <tr>
                  <th>Jenis</th>
                  <th>Paket Diminta</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                  <th>Catatan Admin</th>
                </tr>
              </thead>
              <tbody>
                {[...myRequests].reverse().map((r) => (
                  <tr key={r.id}>
                    <td style={{ textTransform: "capitalize" }}>
                      {r.requestType === "cancel" ? "Berhenti" : r.requestType}
                    </td>
                    <td>
                      {r.requestedTier
                        ? getTierConfig(r.requestedTier).name
                        : "-"}
                    </td>
                    <td>
                      <span
                        className={`badge-status ${r.status === "approved" ? "success" : r.status === "rejected" ? "danger" : "warning"}`}
                      >
                        {r.status === "approved"
                          ? "Disetujui"
                          : r.status === "rejected"
                            ? "Ditolak"
                            : "Pending"}
                      </span>
                    </td>
                    <td>{formatDateLong(r.created_at || r.createdAt)}</td>
                    <td style={{ color: "#64748b" }}>{r.adminNote || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upgrade Payment Modal */}
      {upgradeModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "16px"
        }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", maxWidth: "480px", width: "100%" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#1C3967", marginBottom: "4px" }}>
              Upgrade ke Paket {upgradeModal.tierName}
            </h3>
            <p style={{ fontSize: "13px", color: "#6b7a96", marginBottom: "20px" }}>
              Lakukan pembayaran ke rekening berikut lalu upload bukti transfer.
            </p>

            {/* Info pembayaran */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
              <p style={{ fontSize: "13px", fontWeight: "700", color: "#1C3967", marginBottom: "12px" }}>Tujuan Pembayaran</p>
              <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px", marginBottom: "10px" }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "6px" }}>🏦 Transfer Bank BCA</div>
                <div style={{ fontSize: "13px", color: "#475569" }}>
                  <div>No. Rekening: <strong style={{ color: "#1C3967", fontSize: "15px", letterSpacing: "1px" }}>2750685113</strong></div>
                  <div style={{ marginTop: "2px" }}>a.n. <strong>Akbar Al Fatih</strong></div>
                  <div style={{ marginTop: "4px" }}>Nominal: <strong style={{ color: "#1C3967" }}>{upgradeModal.price}/bln</strong></div>
                </div>
              </div>
              <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#374151" }}>📱 QRIS</span>
                  <span style={{ fontSize: "10px", background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: "20px", fontWeight: "600" }}>Segera Hadir</span>
                </div>
                <div style={{ textAlign: "center", padding: "10px", background: "#f8fafc", borderRadius: "6px", color: "#94a3b8", fontSize: "12px" }}>
                  QRIS akan tersedia segera
                </div>
              </div>
            </div>

            {/* Upload bukti */}
            <div className="fleet-form-group">
              <label className="fleet-label">Upload Bukti Pembayaran *</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.doc,.docx,.heic"
                className="fleet-input"
                style={{ padding: "8px", cursor: "pointer" }}
                onChange={(e) => setPaymentFile(e.target.files[0] || null)}
              />
              <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>Format: JPG, JPEG, PNG, DOC, HEIC</p>
            </div>

            {paymentFile && (
              <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#166534", marginBottom: "12px" }}>
                ✅ {paymentFile.name}
              </div>
            )}

            {uploadError && (
              <div style={{ color: "#dc2626", fontSize: "13px", marginBottom: "12px", fontWeight: "600" }}>
                ⚠️ {uploadError}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="fleet-btn-submit"
                onClick={handleUpgradeSubmit}
                disabled={uploading}
                style={{ flex: 1, opacity: uploading ? 0.6 : 1 }}
              >
                {uploading ? "Mengirim..." : "Kirim Bukti Bayar"}
              </button>
              <button
                type="button"
                onClick={() => setUpgradeModal(null)}
                style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", cursor: "pointer", fontWeight: "600", color: "#6b7a96" }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}