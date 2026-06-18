import React from "react";
import { getDocStatus } from "../../../../utils/fleetMockData.js";

export default function DokumenModal({
  isOpen,
  vehicle,
  onClose,
  onPreviewClick,
  onRescanClick,
}) {
  if (!isOpen || !vehicle) return null;

  return (
    <div className="fleet-modal-overlay">
      <div className="fleet-modal" style={{ maxWidth: "520px" }}>
        <div className="fleet-modal-header">
          <h3>📄 Dokumen Diupload — {vehicle.plateNumber}</h3>
          <span className="btn-close-modal" onClick={onClose}>
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
            const isHilang = vehicle[`${key}Hilang`];
            const isBelumAda = vehicle[`${key}BelumAda`];
            const fileName = vehicle[`${key}File`];

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
                  <strong style={{ fontSize: "14px" }}>
                    {icon} {label}
                  </strong>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      background: isHilang
                        ? "#fecaca"
                        : isBelumAda
                          ? "#fde68a"
                          : fileName
                            ? "#bbf7d0"
                            : "#e2e8f0",
                      color: isHilang
                        ? "#991b1b"
                        : isBelumAda
                          ? "#b45309"
                          : fileName
                            ? "#166534"
                            : "#475569",
                    }}
                  >
                    {isHilang
                      ? "Dokumen Hilang"
                      : isBelumAda
                        ? "Belum Diterbitkan"
                        : fileName
                          ? "Sudah Diupload"
                          : "Belum Ada File"}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "12.5px",
                    color: "#64748b",
                    marginBottom: "12px",
                    wordBreak: "break-all",
                  }}
                >
                  {isHilang
                    ? "Status ditandai sebagai hilang."
                    : isBelumAda
                      ? "Dokumen masih dalam proses di instansi (belum terbit)."
                      : fileName
                        ? `File: ${fileName}`
                        : "Tidak ada file scan/foto."}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    justifyContent: "flex-end",
                  }}
                >
                  {fileName && !isHilang && !isBelumAda && (
                    <button
                      className="fleet-btn fleet-btn-secondary"
                      style={{ padding: "6px 12px", fontSize: "12px" }}
                      onClick={() => onPreviewClick({ key, label, fileName })}
                    >
                      👁️ Lihat
                    </button>
                  )}
                  <button
                    className="fleet-btn fleet-btn-primary"
                    style={{ padding: "6px 12px", fontSize: "12px" }}
                    onClick={() => onRescanClick(key)}
                  >
                    📤 Unggah/Ganti File
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
