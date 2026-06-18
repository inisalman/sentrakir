import React from "react";

export default function VerificationsView({ db, adminId, onUpdate }) {
  const adminCompanies = (db.companies || []).filter(
    (c) => c.adminId === adminId && c.ownerType !== "admin",
  );
  const companyIds = adminCompanies.map((c) => c.id);

  // NOTE: Documents table belum ada di Supabase — dokumen disimpan per-vehicle di meta_data
  // Fitur verifikasi akan aktif setelah documents table dibuat
  const pendingDocs = (db.documents || []).filter((d) => {
    if (d.verificationStatus !== "pending") return false;
    const vehicle = (db.vehicles || []).find((v) => v.id === d.vehicleId);
    return vehicle && companyIds.includes(vehicle.companyId);
  });

  const handleVerify = (docId) => {
    alert("Fitur verifikasi dokumen belum tersedia — tabel documents belum dibuat di Supabase.");
  };

  const handleReject = (docId) => {
    alert("Fitur verifikasi dokumen belum tersedia — tabel documents belum dibuat di Supabase.");
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
        Antrean Verifikasi Berkas Scan Klien
      </h2>

      {pendingDocs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7a96" }}>
          <span
            style={{ fontSize: "36px", display: "block", marginBottom: "10px" }}
          >
            📦
          </span>
          <p style={{ margin: 0, fontWeight: "600" }}>
            Antrean bersih! Tidak ada dokumen baru yang membutuhkan verifikasi.
          </p>
        </div>
      ) : (
        <div className="verification-card-grid">
          {pendingDocs.map((doc) => (
            <div key={doc.id} className="verification-card">
              <div className="verification-card-header">
                <span
                  className="badge-status neutral"
                  style={{ fontWeight: "700", fontSize: "11px" }}
                >
                  {doc.docTypeLabel}
                </span>
                <span style={{ fontSize: "11px", color: "#6b7a96" }}>
                  {new Date(doc.uploadedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="verification-card-body">
                <p style={{ margin: "0 0 4px 0" }}>
                  Perusahaan: <strong>{doc.companyName}</strong>
                </p>
                <p style={{ margin: "0 0 10px 0" }}>
                  Kendaraan: <strong>{doc.plateNumber}</strong>
                </p>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Membuka pindaian berkas: ${doc.fileName}`);
                  }}
                  className="verification-file-link"
                >
                  📄 {doc.fileName}
                </a>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  className="fleet-btn fleet-btn-danger fleet-btn-sm"
                  onClick={() => handleReject(doc.id)}
                >
                  Tolak Berkas
                </button>
                <button
                  className="fleet-btn fleet-btn-success fleet-btn-sm"
                  onClick={() => handleVerify(doc.id)}
                >
                  Verifikasi Berkas
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
