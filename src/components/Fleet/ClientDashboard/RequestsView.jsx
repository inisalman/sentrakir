import React, { useState } from "react";
import { updateRequestStatusSupabase } from "../../../utils/supabaseRequests.js";
import { printData } from "../../../utils/exportHelpers.js";

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

export default function RequestsView({ requests, onUpdate }) {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const getStatusBadgeClass = (status) => {
    if (status === "pending") return "warning";
    if (status === "quoted") return "warning";
    if (status === "waiting_approval") return "warning";
    if (status === "approved") return "success";
    if (status === "in_progress") return "neutral";
    if (status === "completed") return "success";
    if (status === "cancelled") return "danger";
    return "neutral";
  };

  const getStatusLabel = (status) => {
    const map = {
      pending: "Menunggu Penawaran",
      quoted: "Penawaran Diterima",
      waiting_approval: "Menunggu Persetujuan Anda",
      approved: "Disetujui — Sedang Diurus",
      in_progress: "Sedang Dikerjakan",
      completed: "Selesai",
      cancelled: "Dibatalkan",
    };
    return map[status] || status;
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

  const handleApproveQuote = async (reqId) => {
    if (
      confirm(
        "Apakah Anda menyetujui rincian biaya, estimasi waktu, dan persyaratan pengurusan ini?",
      )
    ) {
      const result = await updateRequestStatusSupabase(reqId, "approved", {
        clientResponse: "approved",
        respondedAt: new Date().toISOString(),
      });
      if (!result.success) {
        alert("Gagal mengirim persetujuan: " + result.error);
        return;
      }
      alert(
        "Persetujuan berhasil dikirim! Status pengurusan saat ini: Disetujui Klien.",
      );
      setSelectedRequest(null);
      onUpdate();
    }
  };

  const handleCancelQuote = async (reqId) => {
    if (
      confirm(
        "Apakah Anda yakin ingin membatalkan pengajuan pengurusan jasa ini?",
      )
    ) {
      const result = await updateRequestStatusSupabase(reqId, "cancelled", {
        clientResponse: "cancelled",
        respondedAt: new Date().toISOString(),
      });
      if (!result.success) {
        alert("Gagal membatalkan pengajuan: " + result.error);
        return;
      }
      alert("Pengajuan berhasil dibatalkan.");
      setSelectedRequest(null);
      onUpdate();
    }
  };

  const handlePrintHistory = () => {
    // Filter hanya yang completed, ditolak, atau dibatalkan untuk riwayat (History)
    const historyRequests = requests.filter(r => ['completed', 'cancelled', 'rejected'].includes(r.status));

    if (historyRequests.length === 0) {
      alert("Belum ada riwayat pengurusan yang selesai atau dibatalkan.");
      return;
    }

    const tableHeaders = [
      'ID Request', 'Plat Nomor', 'Jenis Jasa', 'Biaya Final', 'Status', 'Tanggal Selesai'
    ];
    const tableRowsHTML = historyRequests.map(r => `
      <tr>
        <td style="font-family: monospace;">${r.id}</td>
        <td><strong>${r.plateNumber || '-'}</strong></td>
        <td>${getServiceLabel(r.serviceType) || r.serviceType}</td>
        <td>Rp ${(r.estimatedCost || 0).toLocaleString('id-ID')}</td>
        <td>${getStatusLabel(r.status)}</td>
        <td>${formatDateLong(r.updated_at || r.createdAt)}</td>
      </tr>
    `).join('');

    printData(`Riwayat Pengurusan Selesai`, tableHeaders, tableRowsHTML);
  };

  return (
    <div className="fleet-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2
          style={{
            fontSize: "16px",
            fontWeight: "800",
            margin: 0,
            color: "#1C3967",
          }}
        >
          Daftar Pengajuan Perpanjangan
        </h2>
        <button
          className="fleet-btn fleet-btn-secondary"
          onClick={handlePrintHistory}
          disabled={requests.filter(r => ['completed', 'cancelled', 'rejected'].includes(r.status)).length === 0}
          title="Print Riwayat (Completed/Cancelled)"
        >
          🖨️ Cetak Riwayat
        </button>
      </div>

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
                    {r.description.length > 60
                      ? `${r.description.slice(0, 60)}...`
                      : r.description}
                  </td>
                  <td style={{ fontWeight: "600", color: "#1e3a8a" }}>
                    {r.estimatedCost
                      ? `Rp ${Number(r.estimatedCost).toLocaleString("id-ID")}`
                      : "Estimating..."}
                  </td>
                  <td>{formatDateLong(r.created_at || r.createdAt)}</td>
                  <td>
                    <span
                      className={`badge-status ${getStatusBadgeClass(r.status)}`}
                    >
                      {getStatusLabel(r.status)}
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
              <h3>
                📄 Detail Status Pengurusan — {selectedRequest.plateNumber}
              </h3>
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
                  <p
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: "11px",
                      color: "#64748b",
                      fontWeight: "600",
                    }}
                  >
                    ID Request
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      fontWeight: "700",
                      fontFamily: "monospace",
                    }}
                  >
                    {selectedRequest.id}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: "11px",
                      color: "#64748b",
                      fontWeight: "600",
                    }}
                  >
                    Plat Nomor
                  </p>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: "700" }}>
                    {selectedRequest.plateNumber}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: "11px",
                      color: "#64748b",
                      fontWeight: "600",
                    }}
                  >
                    Jenis Jasa
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "#1e3a8a",
                    }}
                  >
                    {getServiceLabel(selectedRequest.serviceType)}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: "11px",
                      color: "#64748b",
                      fontWeight: "600",
                    }}
                  >
                    Status Progres
                  </p>
                  <span
                    className={`badge-status ${getStatusBadgeClass(selectedRequest.status)}`}
                    style={{ display: "inline-block", marginTop: "2px" }}
                  >
                    {getStatusLabel(selectedRequest.status)}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h4
                  style={{
                    fontSize: "13px",
                    fontWeight: "800",
                    color: "#1C3967",
                    margin: "0 0 8px 0",
                  }}
                >
                  Deskripsi Pengajuan
                </h4>
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
                    Menunggu Admin tujuan mengkonfirmasi, memeriksa berkas, dan
                    memberikan rincian harga jasa resmi, estimasi waktu, serta
                    syarat-syarat pengurusan berkas asli.
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

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "14px",
                      marginBottom: "14px",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: "11px",
                          color: "#166534",
                          fontWeight: "600",
                        }}
                      >
                        Biaya Jasa Resmi
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "15px",
                          fontWeight: "800",
                          color: "#166534",
                        }}
                      >
                        Rp{" "}
                        {selectedRequest.serviceQuote?.serviceFee?.toLocaleString(
                          "id-ID",
                        ) ||
                          selectedRequest.estimatedCost?.toLocaleString(
                            "id-ID",
                          )}
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: "11px",
                          color: "#166534",
                          fontWeight: "600",
                        }}
                      >
                        Estimasi Waktu
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#166534",
                        }}
                      >
                        {selectedRequest.serviceQuote?.estimatedTime || "-"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p
                      style={{
                        margin: "0 0 4px 0",
                        fontSize: "11px",
                        color: "#166534",
                        fontWeight: "600",
                      }}
                    >
                      Syarat-syarat Pengurusan
                    </p>
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
                      {selectedRequest.serviceQuote?.terms ||
                        "Tidak ada persyaratan khusus."}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div
              className="fleet-modal-footer"
              style={{ justifyContent: "flex-end" }}
            >
              {selectedRequest.status === "quoted" ||
              selectedRequest.status === "waiting_approval" ? (
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