import React from "react";

export default function PreviewDokumenModal({ doc, vehicle, onClose }) {
  if (!doc || !vehicle) return null;

  return (
    <div className="fleet-modal-overlay" style={{ zIndex: 1100 }}>
      <div
        className="fleet-modal"
        style={{
          maxWidth: "800px",
          width: "90%",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="fleet-modal-header" style={{ padding: "16px 24px" }}>
          <h3 style={{ margin: 0 }}>
            👁️ Preview: {doc.label} ({vehicle.plateNumber})
          </h3>
          <span className="btn-close-modal" onClick={onClose}>
            ×
          </span>
        </div>
        <div
          className="fleet-modal-body"
          style={{
            flex: 1,
            padding: 0,
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#f1f5f9",
          }}
        >
          {doc.fileName && doc.fileName.toLowerCase().endsWith(".pdf") ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "#525659",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
              <div style={{ fontSize: "16px", marginBottom: "8px" }}>
                Preview PDF Simulasi
              </div>
              <div style={{ fontSize: "14px", color: "#9ca3af" }}>
                {doc.fileName}
              </div>
              <div
                style={{
                  marginTop: "32px",
                  padding: "16px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                (Dalam aplikasi nyata, ini akan menampilkan viewer PDF dari
                Supabase Storage)
              </div>
            </div>
          ) : (
            <div
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "400px",
                  height: "300px",
                  background: "white",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px dashed #cbd5e1",
                }}
              >
                <div style={{ fontSize: "64px", marginBottom: "16px" }}>
                  🖼️
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: "#334155",
                  }}
                >
                  Simulasi Gambar {doc.label}
                </div>
                <div style={{ fontSize: "13px", color: "#64748b" }}>
                  {doc.fileName}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
