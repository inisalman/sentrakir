import React, { useState } from "react";

export default function MembershipRequestsView({ db, adminId, onUpdate }) {
  const [filter, setFilter] = useState("pending");

  // NOTE: membership_requests table belum ada di Supabase
  // Fitur akan aktif setelah tabel dibuat dan Supabase helpers diimplementasi
  const requests = [];

  const sorted = [...requests].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  );

  const pendingCount = 0;

  const requestTypeLabel = (t) =>
    t === "cancel"
      ? "Berhenti Berlangganan"
      : t === "upgrade"
        ? "Upgrade"
        : "Pindah Paket";

  const handleResolve = (req, decision) => {
    alert(
      "Fitur membership requests belum tersedia — tabel membership_requests belum dibuat di Supabase.",
    );
  };

  return (
    <div className="fleet-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
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
          Antrean Permintaan Membership
        </h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className={`fleet-btn fleet-btn-sm ${filter === "pending" ? "fleet-btn-primary" : "fleet-btn-secondary"}`}
            onClick={() => setFilter("pending")}
          >
            Menunggu Tinjauan
          </button>
          <button
            className={`fleet-btn fleet-btn-sm ${filter === "all" ? "fleet-btn-primary" : "fleet-btn-secondary"}`}
            onClick={() => setFilter("all")}
          >
            Semua Riwayat
          </button>
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          padding: "40px",
          color: "#6b7a96",
        }}
      >
        <span style={{ fontSize: "36px", display: "block", marginBottom: "10px" }}>
          📋
        </span>
        <p style={{ margin: 0, fontWeight: "600" }}>
          Fitur Membership Requests belum tersedia.
        </p>
        <p style={{ margin: "8px 0 0 0", fontSize: "13px" }}>
          Tabel <code>membership_requests</code> belum dibuat di Supabase. Silakan buat tabel dan implementasikan Supabase helpers untuk mengaktifkan fitur ini.
        </p>
      </div>
    </div>
  );
}
