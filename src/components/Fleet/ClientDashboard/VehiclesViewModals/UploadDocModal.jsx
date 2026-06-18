import React from "react";

export default function UploadDocModal({
  isOpen,
  vehicle,
  uploadDocType,
  setUploadDocType,
  uploadFileName,
  setUploadFileName,
  onClose,
  onSubmit,
}) {
  if (!isOpen || !vehicle) return null;

  return (
    <div className="fleet-modal-overlay">
      <div className="fleet-modal">
        <div className="fleet-modal-header">
          <h3>Unggah Dokumen Armada: {vehicle.plateNumber}</h3>
          <span className="btn-close-modal" onClick={onClose}>
            ×
          </span>
        </div>
        <form onSubmit={onSubmit}>
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
                  const randName = `${uploadDocType.toUpperCase()}_${vehicle.plateNumber.replace(
                    /\s+/g,
                    ""
                  )}_${Date.now().toString().slice(-4)}.${
                    uploadDocType === "kir" ? "pdf" : "png"
                  }`;
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
              onClick={onClose}
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
  );
}
