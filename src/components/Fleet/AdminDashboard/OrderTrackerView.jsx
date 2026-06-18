import React, { useState, useEffect } from "react";
import { updateRequestStatusSupabase } from "../../../utils/supabaseRequests.js";
import { getCompanyName, getPlateNumber, formatDate } from "./helpers.js";

const STANDARD_DOC_LIST = [
  "KTP Pemilik",
  "BPKB",
  "STNK",
  "Buku KIR",
  "Sertifikat KIR",
  "SIM Pemilik",
  "Surat Keterangan Cabut Berkas",
  "Surat Kuasa PT",
  "Surat Kuasa Perorangan",
];

export default function OrderTrackerView({ db, adminId, onUpdate }) {
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [serviceFee, setServiceFee] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [terms, setTerms] = useState("");
  const [docRequirements, setDocRequirements] = useState({});
  const [customDocs, setCustomDocs] = useState([]);

  useEffect(() => {
    if (selectedRequest) {
      setServiceFee(
        selectedRequest.serviceQuote?.serviceFee ||
          selectedRequest.estimatedCost ||
          "",
      );
      setEstimatedTime(selectedRequest.serviceQuote?.estimatedTime || "");
      setTerms(selectedRequest.serviceQuote?.terms || "");
      setDocRequirements(selectedRequest.serviceQuote?.docRequirements || {});
      setCustomDocs(selectedRequest.serviceQuote?.customDocs || []);
    }
  }, [selectedRequest]);

  const handleStatusChange = async (reqId, newStatus) => {
    const result = await updateRequestStatusSupabase(reqId, newStatus);
    if (!result.success) {
      alert("Gagal update status: " + result.error);
      return;
    }
    onUpdate();
    alert(
      `Status pengerjaan berhasil diubah menjadi ${newStatus.toUpperCase()}.`,
    );
  };

  const handleSendQuote = async (e) => {
    e.preventDefault();
    if (!serviceFee || !estimatedTime) {
      alert("Harap lengkapi rincian biaya dan estimasi waktu!");
      return;
    }

    const requiredDocsList = [];
    Object.entries(docRequirements).forEach(([docName, types]) => {
      const formats = [];
      if (types.asli) formats.push("Asli");
      if (types.fotocopy) formats.push("Fotocopy");
      if (formats.length > 0) {
        requiredDocsList.push(`${docName} (${formats.join(" & ")})`);
      }
    });

    customDocs.forEach((doc) => {
      const formats = [];
      if (doc.asli) formats.push("Asli");
      if (doc.fotocopy) formats.push("Fotocopy");
      if (doc.name && formats.length > 0) {
        requiredDocsList.push(`${doc.name} (${formats.join(" & ")})`);
      }
    });

    if (requiredDocsList.length === 0 && !terms.trim()) {
      alert(
        "Harap centang minimal satu dokumen syarat atau isi catatan tambahan!",
      );
      return;
    }

    let finalTerms = "";
    if (requiredDocsList.length > 0) {
      finalTerms =
        "Dokumen yang harus disiapkan:\n" +
        requiredDocsList.map((d, i) => `${i + 1}. ${d}`).join("\n");
    }
    if (terms.trim()) {
      finalTerms +=
        (finalTerms ? "\n\nCatatan Tambahan:\n" : "") + terms.trim();
    }

    const result = await updateRequestStatusSupabase(
      selectedRequest.id,
      "waiting_approval",
      {
        serviceQuote: {
          serviceFee: Number(serviceFee),
          estimatedTime,
          terms: finalTerms,
          docRequirements,
          customDocs,
          quotedAt: new Date().toISOString(),
        },
      },
    );
    if (!result.success) {
      alert("Gagal mengirim rincian: " + result.error);
      return;
    }

    alert("Rincian penawaran & syarat berhasil dikirimkan ke klien!");
    setSelectedRequest(null);
    onUpdate();
  };

  const toggleDocType = (docName, type) => {
    setDocRequirements((prev) => {
      const existing = prev[docName] || { asli: false, fotocopy: false };
      return {
        ...prev,
        [docName]: { ...existing, [type]: !existing[type] },
      };
    });
  };

  const addCustomDoc = () => {
    setCustomDocs((prev) => [
      ...prev,
      { name: "", asli: false, fotocopy: false },
    ]);
  };

  const updateCustomDoc = (idx, field, value) => {
    setCustomDocs((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d)),
    );
  };

  const removeCustomDoc = (idx) => {
    setCustomDocs((prev) => prev.filter((_, i) => i !== idx));
  };

  const adminRequests = db.requests.filter((r) => r.adminId === adminId);

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
      pending: "Perlu Penawaran",
      quoted: "Penawaran Terkirim",
      waiting_approval: "Menunggu ACC Klien",
      approved: "Disetujui Klien",
      in_progress: "Sedang Dikerjakan",
      completed: "Selesai",
      cancelled: "Dibatalkan Klien",
    };
    return map[status] || status;
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
              <th>Biaya Jasa Resmi</th>
              <th>Tanggal Masuk</th>
              <th>Status Progres</th>
              <th style={{ textAlign: "center" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {adminRequests.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
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
                const isCrossAdmin = r.originatingAdminId !== r.assignedAdminId;
                const finalFee = r.serviceQuote?.serviceFee || r.estimatedCost;

                return (
                  <tr
                    key={r.id}
                    style={isCrossAdmin ? { background: "#fffbeb" } : {}}
                  >
                    <td style={{ fontFamily: "monospace", fontSize: "12px" }}>
                      {r.id}
                    </td>
                    <td style={{ fontWeight: "600" }}>
                      {r.companyName || getCompanyName(db, r.companyId)}
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
                    <td style={{ fontWeight: "700" }}>
                      {r.plateNumber || getPlateNumber(db, r.vehicleId)}
                    </td>
                    <td>{r.serviceTypeLabel}</td>
                    <td
                      style={{
                        fontSize: "13px",
                        maxWidth: "240px",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                      }}
                    >
                      <div>
                        {r.description.length > 50
                          ? `${r.description.slice(0, 50)}...`
                          : r.description}
                      </div>
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
                          <strong>📞 Kontak Klien:</strong>{" "}
                          {r.clientPic.picName} (
                          <a
                            href={`https://wa.me/${r.clientPic.picPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#2563eb", fontWeight: "bold" }}
                          >
                            +{r.clientPic.picPhone}
                          </a>
                          )
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: "600", color: "#1e3a8a" }}>
                      {finalFee
                        ? `Rp ${finalFee.toLocaleString("id-ID")}`
                        : "Menunggu Quote"}
                    </td>
                    <td>{formatDate(r.created_at || r.createdAt)}</td>
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
                        ✏️ Kelola Order
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedRequest && (
        <div className="fleet-modal-overlay">
          <div className="fleet-modal" style={{ maxWidth: "550px" }}>
            <div className="fleet-modal-header">
              <h3>⚙️ Kelola Order — {selectedRequest.plateNumber}</h3>
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
                  background: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "14px",
                  marginBottom: "20px",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 10px 0",
                    fontSize: "13.5px",
                    color: "#1C3967",
                  }}
                >
                  Info Pengajuan Klien:
                </h4>
                <p style={{ margin: "0 0 6px 0", fontSize: "13px" }}>
                  PT/Klien:{" "}
                  <strong>
                    {selectedRequest.companyName ||
                      getCompanyName(db, selectedRequest.companyId)}
                  </strong>
                </p>
                <p style={{ margin: "0 0 6px 0", fontSize: "13px" }}>
                  Jenis Jasa: <strong>{selectedRequest.serviceTypeLabel}</strong>
                </p>
                <p style={{ margin: "0 0 6px 0", fontSize: "13px" }}>
                  Deskripsi:{" "}
                  <span style={{ color: "#475569" }}>
                    {selectedRequest.description}
                  </span>
                </p>
              </div>

              {selectedRequest.status === "pending" ? (
                <form onSubmit={handleSendQuote}>
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: "800",
                      color: "#1C3967",
                      margin: "0 0 14px 0",
                      borderBottom: "1px solid #cbd5e1",
                      paddingBottom: "6px",
                    }}
                  >
                    ✍️ Kirim Rincian Biaya & Syarat Dokumen
                  </h4>

                  <div className="fleet-form-group">
                    <label className="fleet-label">
                      Harga Jasa Resmi (Rp) *
                    </label>
                    <input
                      type="number"
                      className="fleet-input"
                      placeholder="Masukkan harga jasa..."
                      value={serviceFee}
                      onChange={(e) => setServiceFee(e.target.value)}
                      required
                    />
                  </div>

                  <div className="fleet-form-group">
                    <label className="fleet-label">
                      Estimasi Waktu Pengerjaan *
                    </label>
                    <input
                      type="text"
                      className="fleet-input"
                      placeholder="Contoh: 3 Hari Kerja"
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      required
                    />
                  </div>

                  <div className="fleet-form-group">
                    <label className="fleet-label">Syarat-syarat Dokumen</label>
                    <p
                      style={{
                        fontSize: "11.5px",
                        color: "#64748b",
                        margin: "0 0 10px 0",
                      }}
                    >
                      Centang dokumen yang harus disiapkan klien beserta
                      formatnya:
                    </p>

                    <div
                      style={{
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        padding: "10px",
                        background: "#f8fafc",
                        maxHeight: "300px",
                        overflowY: "auto",
                      }}
                    >
                      {STANDARD_DOC_LIST.map((docName) => {
                        const types = docRequirements[docName] || {
                          asli: false,
                          fotocopy: false,
                        };
                        return (
                          <div
                            key={docName}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "6px 8px",
                              borderRadius: "6px",
                              marginBottom: "4px",
                              background:
                                types.asli || types.fotocopy
                                  ? "#eff6ff"
                                  : "transparent",
                              border:
                                types.asli || types.fotocopy
                                  ? "1px solid #bfdbfe"
                                  : "1px solid transparent",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: "600",
                                color: "#1e3a8a",
                                flex: 1,
                              }}
                            >
                              {docName}
                            </span>
                            <div style={{ display: "flex", gap: "10px" }}>
                              <label
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  userSelect: "none",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={types.asli}
                                  onChange={() =>
                                    toggleDocType(docName, "asli")
                                  }
                                />
                                Asli
                              </label>
                              <label
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  userSelect: "none",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={types.fotocopy}
                                  onChange={() =>
                                    toggleDocType(docName, "fotocopy")
                                  }
                                />
                                Fotocopy
                              </label>
                            </div>
                          </div>
                        );
                      })}

                      {customDocs.map((doc, idx) => (
                        <div
                          key={`custom-${idx}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "6px 8px",
                            borderRadius: "6px",
                            marginBottom: "4px",
                            background:
                              doc.asli || doc.fotocopy ? "#fef3c7" : "#f1f5f9",
                            border:
                              doc.asli || doc.fotocopy
                                ? "1px solid #fde68a"
                                : "1px dashed #cbd5e1",
                          }}
                        >
                          <input
                            type="text"
                            placeholder="Nama dokumen custom..."
                            value={doc.name}
                            onChange={(e) =>
                              updateCustomDoc(idx, "name", e.target.value)
                            }
                            style={{
                              flex: 1,
                              fontSize: "13px",
                              fontWeight: "600",
                              padding: "4px 6px",
                              border: "1px solid #cbd5e1",
                              borderRadius: "4px",
                              background: "white",
                            }}
                          />
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "12px",
                              cursor: "pointer",
                              userSelect: "none",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={doc.asli}
                              onChange={(e) =>
                                updateCustomDoc(idx, "asli", e.target.checked)
                              }
                            />
                            Asli
                          </label>
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "12px",
                              cursor: "pointer",
                              userSelect: "none",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={doc.fotocopy}
                              onChange={(e) =>
                                updateCustomDoc(
                                  idx,
                                  "fotocopy",
                                  e.target.checked,
                                )
                              }
                            />
                            Fotocopy
                          </label>
                          <button
                            type="button"
                            onClick={() => removeCustomDoc(idx)}
                            style={{
                              background: "#fee2e2",
                              color: "#b91c1c",
                              border: "none",
                              borderRadius: "4px",
                              padding: "2px 8px",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addCustomDoc}
                        style={{
                          marginTop: "8px",
                          padding: "6px 12px",
                          fontSize: "12px",
                          background: "#dbeafe",
                          color: "#1e3a8a",
                          border: "1px dashed #60a5fa",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        + Tambah Dokumen Custom
                      </button>
                    </div>
                  </div>

                  <div className="fleet-form-group">
                    <label className="fleet-label">
                      Catatan Tambahan (opsional)
                    </label>
                    <textarea
                      className="fleet-input"
                      rows="2"
                      placeholder="Contoh: Berkas dijemput di kantor klien atau ada syarat khusus lainnya..."
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                      style={{ resize: "vertical", fontFamily: "inherit" }}
                    />
                  </div>

                  <div
                    className="fleet-modal-footer"
                    style={{
                      padding: "14px 0 0 0",
                      borderTop: "1px solid #cbd5e1",
                      marginTop: "20px",
                    }}
                  >
                    <button
                      type="button"
                      className="fleet-btn fleet-btn-secondary"
                      onClick={() => setSelectedRequest(null)}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="fleet-btn fleet-btn-primary"
                    >
                      🚀 Kirim Penawaran ke Klien
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: "800",
                      color: "#1C3967",
                      margin: "0 0 14px 0",
                      borderBottom: "1px solid #cbd5e1",
                      paddingBottom: "6px",
                    }}
                  >
                    📋 Rincian Penawaran yang Dikirimkan
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
                          color: "#64748b",
                          fontWeight: "600",
                        }}
                      >
                        Biaya Jasa Resmi
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#1C3967",
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
                          color: "#64748b",
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
                          color: "#1C3967",
                        }}
                      >
                        {selectedRequest.serviceQuote?.estimatedTime || "-"}
                      </p>
                    </div>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <p
                      style={{
                        margin: "0 0 4px 0",
                        fontSize: "11px",
                        color: "#64748b",
                        fontWeight: "600",
                      }}
                    >
                      Syarat-syarat Pengurusan
                    </p>
                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #cbd5e1",
                        padding: "10px 12px",
                        borderRadius: "6px",
                        fontSize: "12.5px",
                        color: "#334155",
                        whiteSpace: "pre-wrap",
                        lineHeight: "1.5",
                      }}
                    >
                      {selectedRequest.serviceQuote?.terms ||
                        "Tidak ada persyaratan khusus."}
                    </div>
                  </div>

                  {selectedRequest.status === "approved" ||
                  selectedRequest.status === "in_progress" ? (
                    <div
                      style={{
                        borderTop: "1px solid #cbd5e1",
                        paddingTop: "16px",
                        marginTop: "16px",
                      }}
                    >
                      <label
                        className="fleet-label"
                        style={{ fontWeight: "bold", marginBottom: "8px" }}
                      >
                        ⚙️ Ubah Status Progres Pengerjaan
                      </label>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <select
                          className="fleet-input"
                          style={{ background: "white", fontWeight: "700" }}
                          value={selectedRequest.status}
                          onChange={(e) =>
                            handleStatusChange(
                              selectedRequest.id,
                              e.target.value,
                            )
                          }
                        >
                          <option value="approved">
                            ⏳ Menunggu Diproses (Disetujui Klien)
                          </option>
                          <option value="in_progress">⚙️ Diproses</option>
                          <option value="completed">✅ Selesai (Completed)</option>
                          <option value="cancelled">❌ Batalkan Order</option>
                        </select>
                        <button
                          type="button"
                          className="fleet-btn fleet-btn-primary"
                          onClick={() => setSelectedRequest(null)}
                        >
                          Tutup
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        background:
                          selectedRequest.status === "quoted" ||
                          selectedRequest.status === "waiting_approval"
                            ? "#fffbeb"
                            : selectedRequest.status === "completed"
                              ? "#f0fdf4"
                              : "#fef2f2",
                        border: `1px solid ${
                          selectedRequest.status === "quoted" ||
                          selectedRequest.status === "waiting_approval"
                            ? "#fde68a"
                            : selectedRequest.status === "completed"
                              ? "#bbf7d0"
                              : "#fca5a5"
                        }`,
                        borderRadius: "8px",
                        padding: "12px",
                        textAlign: "center",
                        fontSize: "13px",
                        fontWeight: "600",
                        color:
                          selectedRequest.status === "quoted" ||
                          selectedRequest.status === "waiting_approval"
                            ? "#b45309"
                            : selectedRequest.status === "completed"
                              ? "#15803d"
                              : "#b91c1c",
                      }}
                    >
                      {(selectedRequest.status === "quoted" ||
                        selectedRequest.status === "waiting_approval") &&
                        "⏳ Menunggu Persetujuan Klien untuk Melanjutkan (ACC)"}
                      {selectedRequest.status === "completed" &&
                        "✅ Order ini telah selesai dikerjakan!"}
                      {selectedRequest.status === "cancelled" &&
                        "❌ Order ini telah dibatalkan klien."}
                    </div>
                  )}

                  {!(
                    selectedRequest.status === "approved" ||
                    selectedRequest.status === "in_progress"
                  ) && (
                    <div
                      className="fleet-modal-footer"
                      style={{ padding: "14px 0 0 0", marginTop: "20px" }}
                    >
                      <button
                        type="button"
                        className="fleet-btn fleet-btn-secondary"
                        onClick={() => setSelectedRequest(null)}
                      >
                        Tutup
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
