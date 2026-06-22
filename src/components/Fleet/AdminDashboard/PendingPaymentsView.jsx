import React, { useState, useEffect } from "react";
import {
  getPendingPayments,
  confirmPayment,
  rejectPayment,
  getPaymentProofUrl,
} from "../../../utils/supabaseClientAuth.js";
import {
  sendPaymentApprovedEmail,
  sendPaymentRejectedEmail,
} from "../../../utils/supabaseEmail.js";
import {
  notifClientPembayaranDikonfirmasi,
  notifClientPembayaranDitolak,
} from "../../../utils/notificationWA.js";
import { getTierConfig } from "../../../utils/fleetMockData.js";

export default function PendingPaymentsView({ adminId, onUpdate }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [selectedPayments, setSelectedPayments] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null); // { payment, isBulk }
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    const data = await getPendingPayments(adminId);
    setPayments(data);
    setLoading(false);
  };

  const handleSelectPayment = (paymentId) => {
    const newSelected = new Set(selectedPayments);
    if (newSelected.has(paymentId)) {
      newSelected.delete(paymentId);
    } else {
      newSelected.add(paymentId);
    }
    setSelectedPayments(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPayments.size === payments.length) {
      setSelectedPayments(new Set());
    } else {
      setSelectedPayments(new Set(payments.map((p) => p.id)));
    }
  };

  const handleApprove = async (payment) => {
    const targetTier = payment.subscription_status.split(":")[1];
    if (
      !confirm(
        `Konfirmasi pembayaran dari ${payment.name}? Paket akan diupgrade ke ${targetTier}.`,
      )
    )
      return;

    setProcessing(payment.id);

    // Confirm payment in DB
    const result = await confirmPayment(
      payment.id,
      targetTier,
      adminId,
      payment.payment_proof_path,
      null
    );

    if (result) {
      // Send email notification
      await sendPaymentApprovedEmail({
        email: payment.email,
        companyName: payment.name,
        tier: targetTier,
      });

      // Send WA notification
      if (payment.pic_phone) {
        notifClientPembayaranDikonfirmasi(
          payment.pic_phone,
          payment.name,
          targetTier
        );
      }

      setPayments((prev) => prev.filter((c) => c.id !== payment.id));
      alert("Pembayaran dikonfirmasi. Paket klien telah diupgrade.");
      onUpdate?.();
    } else {
      alert("Gagal mengkonfirmasi pembayaran.");
    }
    setProcessing(null);
  };

  const openRejectModal = (payment) => {
    setRejectTarget({ payment, isBulk: false });
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const openBulkRejectModal = () => {
    if (selectedPayments.size === 0) {
      alert("Pilih setidaknya satu pembayaran!");
      return;
    }
    setRejectTarget({ payment: null, isBulk: true });
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      alert("Alasan penolakan harus diisi!");
      return;
    }

    setProcessing("reject");
    setRejectModalOpen(false);

    if (rejectTarget.isBulk) {
      // Bulk reject
      let successCount = 0;
      let failCount = 0;

      for (const paymentId of selectedPayments) {
        const payment = payments.find((p) => p.id === paymentId);
        if (!payment) continue;

        const targetTier = payment.subscription_status.split(":")[1];
        const result = await rejectPayment(
          paymentId,
          adminId,
          targetTier,
          payment.payment_proof_path,
          rejectReason
        );

        if (result) {
          await sendPaymentRejectedEmail({
            email: payment.email,
            companyName: payment.name,
            reason: rejectReason,
          });

          if (payment.pic_phone) {
            notifClientPembayaranDitolak(payment.pic_phone, payment.name);
          }

          successCount++;
        } else {
          failCount++;
        }
      }

      alert(`Bulk reject selesai: ${successCount} berhasil, ${failCount} gagal`);
      setSelectedPayments(new Set());
      loadPayments();
      onUpdate?.();
    } else {
      // Single reject
      const payment = rejectTarget.payment;
      const targetTier = payment.subscription_status.split(":")[1];

      const result = await rejectPayment(
        payment.id,
        adminId,
        targetTier,
        payment.payment_proof_path,
        rejectReason
      );

      if (result) {
        await sendPaymentRejectedEmail({
          email: payment.email,
          companyName: payment.name,
          reason: rejectReason,
        });

        if (payment.pic_phone) {
          notifClientPembayaranDitolak(payment.pic_phone, payment.name);
        }

        setPayments((prev) => prev.filter((c) => c.id !== payment.id));
        alert("Pembayaran ditolak.");
        onUpdate?.();
      } else {
        alert("Gagal menolak pembayaran.");
      }
    }

    setProcessing(null);
  };

  const handleBulkApprove = async () => {
    if (selectedPayments.size === 0) {
      alert("Pilih setidaknya satu pembayaran!");
      return;
    }

    if (
      !confirm(
        `Konfirmasi ${selectedPayments.size} pembayaran yang dipilih?`,
      )
    )
      return;

    setProcessing("bulk");
    let successCount = 0;
    let failCount = 0;

    for (const paymentId of selectedPayments) {
      const payment = payments.find((p) => p.id === paymentId);
      if (!payment) continue;

      const targetTier = payment.subscription_status.split(":")[1];
      const result = await confirmPayment(
        paymentId,
        targetTier,
        adminId,
        payment.payment_proof_path,
        null
      );

      if (result) {
        await sendPaymentApprovedEmail({
          email: payment.email,
          companyName: payment.name,
          tier: targetTier,
        });

        if (payment.pic_phone) {
          notifClientPembayaranDikonfirmasi(
            payment.pic_phone,
            payment.name,
            targetTier
          );
        }

        successCount++;
      } else {
        failCount++;
      }
    }

    alert(`Bulk approve selesai: ${successCount} berhasil, ${failCount} gagal`);
    setSelectedPayments(new Set());
    loadPayments();
    onUpdate?.();
    setProcessing(null);
  };

  const openProofModal = async (payment) => {
    if (!payment.payment_proof_path) {
      alert("Bukti pembayaran belum diupload");
      return;
    }

    const url = getPaymentProofUrl(payment.payment_proof_path);
    if (url) {
      setModalImage(url);
      setModalOpen(true);
    } else {
      alert("Gagal memuat bukti pembayaran");
    }
  };

  return (
    <>
      <div className="fleet-card" style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "12px",
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

          {selectedPayments.size > 0 && (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="fleet-btn fleet-btn-sm fleet-btn-primary"
                onClick={handleBulkApprove}
                disabled={processing === "bulk"}
              >
                {processing === "bulk" ? "..." : `✓ Approve (${selectedPayments.size})`}
              </button>
              <button
                className="fleet-btn fleet-btn-sm fleet-btn-danger"
                onClick={openBulkRejectModal}
                disabled={processing === "bulk"}
              >
                {processing === "bulk" ? "..." : `✗ Reject (${selectedPayments.size})`}
              </button>
            </div>
          )}
        </div>

        {/* Select All */}
        {payments.length > 0 && (
          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                fontSize: "13px",
                color: "#6b7a96",
              }}
            >
              <input
                type="checkbox"
                checked={
                  selectedPayments.size === payments.length && payments.length > 0
                }
                onChange={handleSelectAll}
                style={{ width: "16px", height: "16px", cursor: "pointer" }}
              />
              Pilih Semua ({payments.length})
            </label>
          </div>
        )}

        {loading ? (
          <div
            style={{ textAlign: "center", padding: "24px", color: "#94a3b8" }}
          >
            Memuat...
          </div>
        ) : payments.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "40px", color: "#6b7a96" }}
          >
            <span
              style={{
                fontSize: "36px",
                display: "block",
                marginBottom: "10px",
              }}
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
                  <th style={{ width: "40px" }}>
                    <input
                      type="checkbox"
                      checked={
                        selectedPayments.size === payments.length &&
                        payments.length > 0
                      }
                      onChange={handleSelectAll}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                  </th>
                  <th>Perusahaan</th>
                  <th>Email</th>
                  <th>PIC</th>
                  <th>Paket Diminta</th>
                  <th>Harga</th>
                  <th>Bukti Bayar</th>
                  <th>Tanggal Daftar</th>
                  <th style={{ textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((company) => {
                  const targetTier =
                    company.subscription_status.split(":")[1] || "-";
                  const isSelected = selectedPayments.has(company.id);
                  const isProcessing =
                    processing === company.id || processing === "bulk" || processing === "reject";

                  return (
                    <tr
                      key={company.id}
                      style={{
                        background: isSelected ? "#eff6ff" : "transparent",
                      }}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectPayment(company.id)}
                          style={{
                            width: "16px",
                            height: "16px",
                            cursor: "pointer",
                          }}
                        />
                      </td>
                      <td
                        style={{
                          fontWeight: "700",
                          color: "#1C3967",
                        }}
                      >
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
                      <td style={{ fontWeight: "700", color: "#1C3967" }}>
                        {(() => {
                          if (targetTier === "-") return "-";
                          const tierConfig = getTierConfig(targetTier);
                          return tierConfig?.priceLabel
                            ? `${tierConfig.priceLabel}/bln`
                            : targetTier === "enterprise"
                              ? "Custom"
                              : "-";
                        })()}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {company.payment_proof_path ? (
                          <button
                            onClick={() => openProofModal(company)}
                            style={{
                              color: "#1C3967",
                              fontWeight: "600",
                              fontSize: "12px",
                              background: "#eff6ff",
                              border: "1px solid #bfdbfe",
                              borderRadius: "6px",
                              padding: "4px 10px",
                              cursor: "pointer",
                            }}
                          >
                            🖼️ Lihat Bukti
                          </button>
                        ) : (
                          <span
                            style={{ color: "#94a3b8", fontSize: "12px" }}
                          >
                            Belum ada
                          </span>
                        )}
                      </td>
                      <td>
                        {new Date(company.created_at).toLocaleDateString(
                          "id-ID",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
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
                            onClick={() => handleApprove(company)}
                            disabled={isProcessing}
                          >
                            ✓ Konfirmasi
                          </button>
                          <button
                            className="fleet-btn fleet-btn-sm fleet-btn-danger"
                            onClick={() => openRejectModal(company)}
                            disabled={isProcessing}
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

      {/* Payment Proof Modal */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflow: "auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                position: "sticky",
                top: 0,
                background: "white",
                borderBottom: "1px solid #e2e8f0",
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                zIndex: 1,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: "800",
                  color: "#1C3967",
                }}
              >
                Bukti Pembayaran
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  color: "#6b7a96",
                  cursor: "pointer",
                  padding: "0 4px",
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: "20px", textAlign: "center" }}>
              {modalImage && (
                <img
                  src={modalImage}
                  alt="Bukti Pembayaran"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "70vh",
                    objectFit: "contain",
                    borderRadius: "8px",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "480px",
              width: "100%",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "800",
                color: "#1C3967",
                marginBottom: "4px",
              }}
            >
              Tolak Pembayaran
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "#6b7a96",
                marginBottom: "20px",
              }}
            >
              {rejectTarget?.isBulk
                ? `Anda akan menolak ${selectedPayments.size} pembayaran sekaligus.`
                : `Tolak pembayaran dari ${rejectTarget?.payment?.name}?`}
            </p>

            <div className="fleet-form-group">
              <label className="fleet-label">Alasan Penolakan *</label>
              <textarea
                className="fleet-input"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Bukti transfer tidak jelas, nominal tidak sesuai, dll..."
                rows="4"
                style={{ resize: "vertical", fontFamily: "inherit" }}
              />
              <p
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  marginTop: "4px",
                }}
              >
                Alasan akan dikirim ke klien via email dan WA
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button
                type="button"
                className="fleet-btn-submit"
                onClick={handleRejectConfirm}
                disabled={!rejectReason.trim()}
                style={{
                  flex: 1,
                  background: "#dc2626",
                  opacity: rejectReason.trim() ? 1 : 0.5,
                }}
              >
                Tolak Pembayaran
              </button>
              <button
                type="button"
                onClick={() => {
                  setRejectModalOpen(false);
                  setRejectReason("");
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  background: "white",
                  cursor: "pointer",
                  fontWeight: "600",
                  color: "#6b7a96",
                }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
