import React, { useState, useEffect } from "react";
import {
  getPendingPayments,
  confirmPayment,
  rejectPayment,
  getPaymentProofUrl,
} from "../../../utils/supabaseClientAuth.js";
import {
  notifClientPembayaranDikonfirmasi,
  notifClientPembayaranDitolak,
} from "../../../utils/notificationWA.js";

export default function PendingPaymentsView({ adminId, onUpdate }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPendingPayments(adminId).then((data) => {
      setPayments(data);
      setLoading(false);
    });
  }, [adminId]);

  const handleConfirm = async (company) => {
    const targetTier = company.subscription_status.split(":")[1];
    if (
      !confirm(
        `Konfirmasi pembayaran dari ${company.name}? Paket akan diupgrade ke ${targetTier}.`,
      )
    )
      return;
    await confirmPayment(company.id, targetTier);
    if (company.pic_phone)
      notifClientPembayaranDikonfirmasi(
        company.pic_phone,
        company.name,
        targetTier,
      );
    setPayments((prev) => prev.filter((c) => c.id !== company.id));
    alert("Pembayaran dikonfirmasi. Paket klien telah diupgrade.");
    onUpdate();
  };

  const handleReject = async (company) => {
    if (!confirm(`Tolak pembayaran dari ${company.name}?`)) return;
    await rejectPayment(company.id);
    if (company.pic_phone)
      notifClientPembayaranDitolak(company.pic_phone, company.name);
    setPayments((prev) => prev.filter((c) => c.id !== company.id));
    alert("Pembayaran ditolak.");
    onUpdate();
  };

  return (
    <div className="fleet-card" style={{ marginBottom: "24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <h2
          style={{
            fontSize: "16px",
            fontWeight: "800",
            margin: 0,
            color: "#1C3967",
          }}
        >
          Konfirmasi Pembayaran Pendaftaran
          {payments.length > 0 && (
            <span
              className="badge-status warning"
              style={{ marginLeft: "10px", fontWeight: "700" }}
            >
              {payments.length} menunggu
            </span>
          )}
        </h2>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "24px", color: "#94a3b8" }}>
          Memuat...
        </div>
      ) : payments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7a96" }}>
          <span
            style={{ fontSize: "36px", display: "block", marginBottom: "10px" }}
          >
            ✅
          </span>
          <p style={{ margin: 0, fontWeight: "600" }}>
            Tidak ada pembayaran yang menunggu konfirmasi.
          </p>
        </div>
      ) : (
        <div className="fleet-table-container">
          <table className="fleet-table">
            <thead>
              <tr>
                <th>Perusahaan</th>
                <th>Email</th>
                <th>PIC</th>
                <th>Paket Diminta</th>
                <th>Bukti Bayar</th>
                <th>Tanggal Daftar</th>
                <th style={{ textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((company) => {
                const targetTier =
                  company.subscription_status.split(":")[1] || "-";
                return (
                  <tr key={company.id}>
                    <td style={{ fontWeight: "700", color: "#1C3967" }}>
                      {company.name}
                    </td>
                    <td>{company.email}</td>
                    <td>{company.pic_name}</td>
                    <td>
                      <span
                        className="badge-status warning"
                        style={{ textTransform: "capitalize" }}
                      >
                        {targetTier}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {company.payment_proof_path ? (
                        <a
                          href={getPaymentProofUrl(company.payment_proof_path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#1C3967",
                            fontWeight: "600",
                            fontSize: "12px",
                            textDecoration: "underline",
                          }}
                        >
                          🖼️ Lihat Bukti
                        </a>
                      ) : (
                        <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                          Belum ada
                        </span>
                      )}
                    </td>
                    <td>
                      {new Date(company.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          justifyContent: "center",
                        }}
                      >
                        <button
                          className="fleet-btn fleet-btn-sm fleet-btn-primary"
                          onClick={() => handleConfirm(company)}
                        >
                          ✓ Konfirmasi
                        </button>
                        <button
                          className="fleet-btn fleet-btn-sm fleet-btn-danger"
                          onClick={() => handleReject(company)}
                        >
                          ✗ Tolak
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
