import React from "react";
import { getDaysRemaining } from "../../../../utils/fleetMockData.js";
import { getExpiryCardStyle, formatDateLong } from "../../../../utils/fleetHelpers.js";
import { printData } from "../../../../utils/exportHelpers.js";

export default function VehicleDetailModal({
  vehicle,
  onClose,
  onUrusClick,
  onEditClick,
}) {
  if (!vehicle) return null;

  const handlePrintDetail = () => {
    const tableHeaders = ['Kategori', 'Informasi', 'Data'];

    // We will render sections as rows with colspan or custom layout.
    // However, our printData helper expects standard rows. Let's make a 2-column key-value format.
    const tableRowsHTML = `
      <tr style="background-color: #1e293b; color: white;"><td colspan="2" style="font-weight: bold; text-align: center;">Informasi Dasar</td></tr>
      <tr><td style="font-weight: bold; width: 40%;">Nama Pemilik Armada</td><td>${vehicle.ownerName || '-'}</td></tr>
      <tr><td style="font-weight: bold;">Plat Nomor</td><td>${vehicle.plateNumber || '-'}</td></tr>
      <tr><td style="font-weight: bold;">Tipe / Jenis Kendaraan</td><td>${vehicle.vehicleType || '-'}</td></tr>
      <tr><td style="font-weight: bold;">Nomor Buku Uji KIR</td><td>${vehicle.testNumber || '-'}</td></tr>

      <tr style="background-color: #1e293b; color: white;"><td colspan="2" style="font-weight: bold; text-align: center;">Data Kartu Kendaraan (KK)</td></tr>
      <tr><td style="font-weight: bold;">Nama Pemilik</td><td>${vehicle.kkOwnerName || '-'}</td></tr>
      <tr><td style="font-weight: bold;">Alamat Pemilik</td><td>${vehicle.kkOwnerAddress || '-'}</td></tr>
      <tr><td style="font-weight: bold;">No Pol / Plat</td><td>${vehicle.kkPlateNumber || '-'}</td></tr>
      <tr><td style="font-weight: bold;">No Rangka</td><td>${vehicle.kkFrameNumber || '-'}</td></tr>
      <tr><td style="font-weight: bold;">No Mesin</td><td>${vehicle.kkEngineNumber || '-'}</td></tr>
      <tr><td style="font-weight: bold;">No Uji Kendaraan</td><td>${vehicle.kkTestNumber || '-'}</td></tr>

      <tr style="background-color: #1e293b; color: white;"><td colspan="2" style="font-weight: bold; text-align: center;">Data Sertifikat KIR (Kendaraan)</td></tr>
      <tr><td style="font-weight: bold;">Nama Pemilik</td><td>${vehicle.kirOwnerName || '-'}</td></tr>
      <tr><td style="font-weight: bold;">No Pol / Plat</td><td>${vehicle.kirPlateNumber || '-'}</td></tr>
      <tr><td style="font-weight: bold;">No Uji Kendaraan</td><td>${vehicle.kirTestNumber || '-'}</td></tr>
      <tr><td style="font-weight: bold;">Jenis Kendaraan</td><td>${vehicle.kirVehicleType || '-'}</td></tr>
      <tr><td style="font-weight: bold;">Merek / Tipe</td><td>${vehicle.kirBrand || '-'}</td></tr>

      <tr style="background-color: #1e293b; color: white;"><td colspan="2" style="font-weight: bold; text-align: center;">Data STNK Kendaraan</td></tr>
      <tr><td style="font-weight: bold;">Nama Pemilik</td><td>${vehicle.stnkOwnerName || '-'}</td></tr>
      <tr><td style="font-weight: bold;">Alamat Pemilik</td><td>${vehicle.stnkOwnerAddress || '-'}</td></tr>
      <tr><td style="font-weight: bold;">No Pol / Plat</td><td>${vehicle.stnkPlateNumber || '-'}</td></tr>
      <tr><td style="font-weight: bold;">Merek / Tipe</td><td>${vehicle.stnkBrand ? vehicle.stnkBrand + ' ' + (vehicle.stnkVehicleType||'') : '-'}</td></tr>
      <tr><td style="font-weight: bold;">Jenis / Model</td><td>${vehicle.stnkVehicleJenis ? vehicle.stnkVehicleJenis + ' / ' + (vehicle.stnkModel||'') : '-'}</td></tr>
      <tr><td style="font-weight: bold;">Tahun Pembuatan</td><td>${vehicle.stnkYearManufactured || '-'}</td></tr>
      <tr><td style="font-weight: bold;">No Rangka</td><td>${vehicle.stnkFrameNumber || '-'}</td></tr>
      <tr><td style="font-weight: bold;">No Mesin</td><td>${vehicle.stnkEngineNumber || '-'}</td></tr>
    `;

    printData(`Data Kendaraan - ${vehicle.plateNumber}`, ['Atribut', 'Keterangan'], tableRowsHTML);
  };

  return (
    <div className="fleet-modal-overlay" style={{ zIndex: 1000 }}>
      <div className="fleet-modal" style={{ maxWidth: "700px" }}>
        <div className="fleet-modal-header">
          <h3>Data Lengkap Kendaraan — {vehicle.plateNumber}</h3>
          <span className="btn-close-modal" onClick={onClose}>
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
              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
                <p style={{ fontSize: "12px", color: "#6b7a96", margin: "0 0 4px 0" }}>Plat Nomor</p>
                <p style={{ fontSize: "14px", fontWeight: "700", color: "#1C3967", margin: 0 }}>
                  {vehicle.plateNumber}
                </p>
              </div>
              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
                <p style={{ fontSize: "12px", color: "#6b7a96", margin: "0 0 4px 0" }}>Tipe / Jenis Kendaraan</p>
                <p style={{ fontSize: "14px", fontWeight: "700", color: "#1C3967", margin: 0 }}>
                  {vehicle.vehicleType}
                </p>
              </div>
              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
                <p style={{ fontSize: "12px", color: "#6b7a96", margin: "0 0 4px 0" }}>Nomor Buku Uji KIR</p>
                <p style={{ fontSize: "14px", fontWeight: "700", color: "#1C3967", margin: 0, fontFamily: "monospace" }}>
                  {vehicle.noJktBelumAda ? "No JKT belum ada" : vehicle.testNumber || "-"}
                </p>
              </div>
              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
                <p style={{ fontSize: "12px", color: "#6b7a96", margin: "0 0 4px 0" }}>ID Kendaraan (Internal)</p>
                <p style={{ fontSize: "12px", fontWeight: "600", color: "#475569", margin: 0, fontFamily: "monospace", wordBreak: "break-all" }}>
                  {vehicle.id}
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
              {[
                { label: "Uji KIR", expiry: vehicle.kirExpiry },
                { label: "STNK (5 Tahun)", expiry: vehicle.stnkExpiry },
                { label: "Pajak (1 Tahun)", expiry: vehicle.pajakExpiry },
              ].map((item, idx) => {
                const cs = getExpiryCardStyle(item.expiry);
                const days = item.expiry ? getDaysRemaining(item.expiry) : null;

                let statusText = "";
                if (days !== null) {
                   if (days <= 0) statusText = `⚠️ Jatuh Tempo (${Math.abs(days)} hari lalu)`;
                   else if (days <= 7) statusText = `🔴 H-${days}`;
                   else if (days <= 30) statusText = `🟡 H-${days}`;
                   else statusText = `🟢 H-${days}`;
                }

                return (
                  <div key={idx} style={{ background: cs.background, padding: "12px", borderRadius: "8px", border: cs.border }}>
                    <p style={{ fontSize: "12px", color: cs.labelColor, margin: "0 0 4px 0", fontWeight: "600" }}>{item.label}</p>
                    <p style={{ fontSize: "13px", fontWeight: "700", color: cs.valueColor, margin: "0 0 4px 0" }}>{item.expiry || "Belum Ada Data"}</p>
                    {days !== null && <p style={{ fontSize: "11px", color: cs.labelColor, margin: 0 }}>{statusText}</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SIM Driver */}
          {vehicle.simDriverExpiry && (
             <div style={{ marginBottom: "24px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#1C3967", margin: "0 0 16px 0", paddingBottom: "8px", borderBottom: "2px solid #e2e8f0" }}>
                  Masa Berlaku SIM Driver
                </h4>
                {(() => {
                    const cs = getExpiryCardStyle(vehicle.simDriverExpiry);
                    const days = getDaysRemaining(vehicle.simDriverExpiry);
                    return (
                        <div style={{ background: cs.background, padding: "12px", borderRadius: "8px", border: cs.border }}>
                            <p style={{ fontSize: "12px", color: cs.labelColor, margin: "0 0 4px 0", fontWeight: "600" }}>Masa Berlaku SIM</p>
                            <p style={{ fontSize: "13px", fontWeight: "700", color: cs.valueColor, margin: "0 0 4px 0" }}>{vehicle.simDriverExpiry}</p>
                            <p style={{ fontSize: "11px", color: cs.labelColor, margin: 0 }}>
                                {days <= 0 ? `⚠️ Jatuh Tempo (${Math.abs(days)} hari lalu)` : days <= 7 ? `🔴 H-${days}` : days <= 30 ? `🟡 H-${days}` : `🟢 H-${days}`}
                            </p>
                        </div>
                    );
                })()}
             </div>
          )}

          {/* Data Sertifikat Kendaraan */}
          <div style={{ marginBottom: "24px" }}>
            <h4
              style={{
                fontSize: "14px",
                fontWeight: "800",
                color: "#1C3967",
                margin: "0 0 16px 0",
                paddingBottom: "8px",
                borderBottom: "2px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Data Sertifikat KIR (Kendaraan)</span>
              {vehicle.sertifikatKirHilang && (
                <span style={{ fontSize: "11px", background: "#fef2f2", color: "#991b1b", padding: "4px 8px", borderRadius: "4px", border: "1px solid #fca5a5" }}>Dokumen Hilang</span>
              )}
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                <p style={{ fontSize: "11px", color: "#6b7a96", margin: "0 0 2px 0" }}>Nama Pemilik</p>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#1C3967", margin: 0 }}>{vehicle.kkOwnerName || "-"}</p>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                <p style={{ fontSize: "11px", color: "#6b7a96", margin: "0 0 2px 0" }}>Alamat Pemilik</p>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#1C3967", margin: 0 }}>{vehicle.kkOwnerAddress || "-"}</p>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                <p style={{ fontSize: "11px", color: "#6b7a96", margin: "0 0 2px 0" }}>Plat Nomor</p>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#1C3967", margin: 0 }}>{vehicle.kkPlateNumber || "-"}</p>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                <p style={{ fontSize: "11px", color: "#6b7a96", margin: "0 0 2px 0" }}>Nomor Rangka</p>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#1C3967", margin: 0, fontFamily: "monospace" }}>{vehicle.kkFrameNumber || "-"}</p>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                <p style={{ fontSize: "11px", color: "#6b7a96", margin: "0 0 2px 0" }}>Nomor Mesin</p>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#1C3967", margin: 0, fontFamily: "monospace" }}>{vehicle.kkEngineNumber || "-"}</p>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                <p style={{ fontSize: "11px", color: "#6b7a96", margin: "0 0 2px 0" }}>Nomor Uji</p>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#1C3967", margin: 0, fontFamily: "monospace" }}>{vehicle.kkTestNumber || "-"}</p>
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
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Data Kartu Uji Berkala (KIR)</span>
              {vehicle.kartuKirHilang && (
                <span style={{ fontSize: "11px", background: "#fef2f2", color: "#991b1b", padding: "4px 8px", borderRadius: "4px", border: "1px solid #fca5a5" }}>Dokumen Hilang</span>
              )}
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                <p style={{ fontSize: "11px", color: "#6b7a96", margin: "0 0 2px 0" }}>Nama Pemilik</p>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#1C3967", margin: 0 }}>{vehicle.kirOwnerName || "-"}</p>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                <p style={{ fontSize: "11px", color: "#6b7a96", margin: "0 0 2px 0" }}>Plat Nomor</p>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#1C3967", margin: 0 }}>{vehicle.kirPlateNumber || "-"}</p>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                <p style={{ fontSize: "11px", color: "#6b7a96", margin: "0 0 2px 0" }}>Nomor Uji</p>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#1C3967", margin: 0, fontFamily: "monospace" }}>{vehicle.kirTestNumber || "-"}</p>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                <p style={{ fontSize: "11px", color: "#6b7a96", margin: "0 0 2px 0" }}>Sifat / Tipe Kendaraan</p>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#1C3967", margin: 0 }}>{vehicle.kirVehicleType || "-"}</p>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                <p style={{ fontSize: "11px", color: "#6b7a96", margin: "0 0 2px 0" }}>Merek</p>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#1C3967", margin: 0 }}>{vehicle.kirBrand || "-"}</p>
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
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Data STNK Kendaraan</span>
              {vehicle.stnkHilang && (
                <span style={{ fontSize: "11px", background: "#fef2f2", color: "#991b1b", padding: "4px 8px", borderRadius: "4px", border: "1px solid #fca5a5" }}>Dokumen Hilang</span>
              )}
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                <p style={{ fontSize: "11px", color: "#6b7a96", margin: "0 0 2px 0" }}>Nama Pemilik</p>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#1C3967", margin: 0 }}>{vehicle.stnkOwnerName || "-"}</p>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px", gridColumn: "span 2" }}>
                <p style={{ fontSize: "11px", color: "#6b7a96", margin: "0 0 2px 0" }}>Alamat Pemilik</p>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#1C3967", margin: 0 }}>{vehicle.stnkOwnerAddress || "-"}</p>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                <p style={{ fontSize: "11px", color: "#6b7a96", margin: "0 0 2px 0" }}>Plat Nomor</p>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#1C3967", margin: 0 }}>{vehicle.stnkPlateNumber || "-"}</p>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                <p style={{ fontSize: "11px", color: "#6b7a96", margin: "0 0 2px 0" }}>Merek / Tipe</p>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#1C3967", margin: 0 }}>
                  {vehicle.stnkBrand ? `${vehicle.stnkBrand} ${vehicle.stnkVehicleType || ""}` : "-"}
                </p>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                <p style={{ fontSize: "11px", color: "#6b7a96", margin: "0 0 2px 0" }}>Jenis / Model</p>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#1C3967", margin: 0 }}>
                  {vehicle.stnkVehicleJenis ? `${vehicle.stnkVehicleJenis} / ${vehicle.stnkModel || ""}` : "-"}
                </p>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                <p style={{ fontSize: "11px", color: "#6b7a96", margin: "0 0 2px 0" }}>Tahun Pembuatan</p>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#1C3967", margin: 0 }}>{vehicle.stnkYearManufactured || "-"}</p>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                <p style={{ fontSize: "11px", color: "#6b7a96", margin: "0 0 2px 0" }}>Nomor Rangka</p>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#1C3967", margin: 0, fontFamily: "monospace" }}>{vehicle.stnkFrameNumber || "-"}</p>
              </div>
              <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                <p style={{ fontSize: "11px", color: "#6b7a96", margin: "0 0 2px 0" }}>Nomor Mesin</p>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#1C3967", margin: 0, fontFamily: "monospace" }}>{vehicle.stnkEngineNumber || "-"}</p>
              </div>
            </div>
          </div>

          {/* Status Dokumen Uploaded */}
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
              Status Upload Dokumen
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "12px",
              }}
            >
              {[
                { label: "Sertifikat KIR", file: vehicle.sertifikatKirFile, hilang: vehicle.sertifikatKirHilang, belumAda: vehicle.sertifikatKirBelumAda },
                { label: "Kartu KIR", file: vehicle.kartuKirFile, hilang: vehicle.kartuKirHilang, belumAda: vehicle.kartuKirBelumAda },
                { label: "STNK", file: vehicle.stnkFile, hilang: vehicle.stnkHilang, belumAda: vehicle.stnkBelumAda },
              ].map((doc, idx) => {
                const bg = doc.hilang ? "#fef2f2" : doc.belumAda ? "#fffbeb" : doc.file ? "#f0fdf4" : "#f8fafc";
                const border = doc.hilang ? "1px solid #fecaca" : doc.belumAda ? "1px solid #fde68a" : doc.file ? "1px solid #bbf7d0" : "1px solid #cbd5e1";
                const icon = doc.hilang ? "❌" : doc.belumAda ? "⏳" : doc.file ? "✅" : "⚠️";
                const status = doc.hilang ? "Hilang" : doc.belumAda ? "Belum Terbit" : doc.file ? "Uploaded" : "Belum Upload";

                return (
                  <div key={idx} style={{ background: bg, border: border, padding: "10px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ fontSize: "16px" }}>{icon}</div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>{doc.label}</div>
                      <div style={{ fontSize: "12px", fontWeight: "700", color: doc.file && !doc.hilang && !doc.belumAda ? "#15803d" : "#475569" }}>
                        {status}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Catatan */}
          <div style={{ marginBottom: "8px" }}>
            <h4
              style={{
                fontSize: "14px",
                fontWeight: "800",
                color: "#1C3967",
                margin: "0 0 8px 0",
              }}
            >
              Catatan Tambahan
            </h4>
            <div
              style={{
                background: "#f1f5f9",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "13px",
                color: "#475569",
                minHeight: "60px",
              }}
            >
              {vehicle.notes || "Tidak ada catatan."}
            </div>
          </div>
        </div>
        <div
          className="fleet-modal-footer"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="fleet-btn fleet-btn-secondary"
              onClick={handlePrintDetail}
              title="Print atau Save as PDF"
            >
              🖨️ Cetak Dokumen
            </button>
            <button
              className="fleet-btn fleet-btn-secondary"
              onClick={() => onEditClick(vehicle)}
            >
              ✏️ Edit Data
            </button>
            <button
              className="fleet-btn fleet-btn-accent"
              onClick={() => onUrusClick(vehicle)}
            >
              ⚙️ Urus Sekarang
            </button>
          </div>
          <button
            className="fleet-btn fleet-btn-secondary"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
