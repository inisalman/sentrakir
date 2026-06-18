import React, { useState, useEffect } from "react";
import {
  getDaysRemaining,
  getAdminById,
} from "../../../utils/fleetMockData.js";

const ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

const getOnlineStatus = (lastActive) => {
  if (!lastActive) return { online: false, label: "Offline" };
  const elapsed = Date.now() - new Date(lastActive).getTime();
  if (elapsed < ONLINE_THRESHOLD_MS) {
    return { online: true, label: "Online" };
  }
  return { online: false, label: "Offline" };
};

const formatLastActive = (lastActive) => {
  if (!lastActive) return "—";
  const d = new Date(lastActive);
  const now = Date.now();
  const diff = now - d.getTime();

  if (diff < ONLINE_THRESHOLD_MS) {
    return "Baru saja";
  }
  if (diff < 3600000) {
    const min = Math.floor(diff / 60000);
    return `${min} menit lalu`;
  }
  if (diff < 86400000) {
    const hr = Math.floor(diff / 3600000);
    return `${hr} jam lalu`;
  }
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ClientsView({ db, adminId, onUpdate }) {
  const [search, setSearch] = useState("");
  const [now, setNow] = useState(Date.now());

  // Poll setiap 15 detik untuk update status online/offline
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(interval);
  }, []);

  const adminCompanies = db.companies.filter(
    (c) => c.adminId === adminId && c.ownerType !== "admin",
  );

  const filteredCompanies = adminCompanies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.picName.toLowerCase().includes(search.toLowerCase()),
  );

  const onlineCount = adminCompanies.filter(
    (c) => getOnlineStatus(c.last_active || c.lastActive).online,
  ).length;

  const getWhatsAppLink = (c) => {
    const compVehicles = db.vehicles.filter((v) => v.companyId === c.id);
    const warningOrExpired = [];

    compVehicles.forEach((v) => {
      const kirDays = getDaysRemaining(v.kirExpiry);
      const stnkDays = getDaysRemaining(v.stnkExpiry);
      const pajakDays = getDaysRemaining(v.pajakExpiry);
      const minDays = Math.min(kirDays, stnkDays, pajakDays);

      if (minDays <= 90) {
        warningOrExpired.push(`${v.plateNumber} (KIR/STNK)`);
      }
    });

    let message = `Halo Bapak/Ibu ${c.picName} dari ${c.name}. Kami dari Sentra KIR ingin mengingatkan masa berlaku dokumen armada Anda. `;
    if (warningOrExpired.length > 0) {
      message += `Terdapat kendaraan yang mendekati jatuh tempo: ${warningOrExpired.slice(0, 2).join(", ")}. `;
    }
    message += `Apakah ingin kami bantu untuk proses perpanjangannya? Anda dapat meninjau detailnya di portal Sentra Fleet. Terima kasih.`;

    return `https://wa.me/${c.picPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div>
      {/* Online Summary Bar */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <div
          className="fleet-stat-card info"
          style={{ padding: "12px 20px", minWidth: "180px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#22c55e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                color: "white",
                fontWeight: "bold",
              }}
            >
              {onlineCount}
            </div>
            <div>
              <div className="stat-val" style={{ fontSize: "13px" }}>
                Client Online
              </div>
              <div
                className="stat-lbl"
                style={{ fontSize: "11px", color: "#64748b" }}
              >
                dari {adminCompanies.length} total
              </div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            color: "#94a3b8",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#22c55e",
              display: "inline-block",
            }}
          />
          Online (&lt;5 menit)
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#94a3b8",
              display: "inline-block",
              marginLeft: "10px",
            }}
          />
          Offline
        </div>
      </div>

      <div className="fleet-card">
        <div className="table-controls">
          <input
            type="text"
            className="fleet-input table-search"
            placeholder="Cari perusahaan atau nama PIC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="fleet-table-container">
          <table className="fleet-table">
            <thead>
              <tr>
                <th style={{ width: "90px" }}>Status</th>
                <th>Nama Perusahaan</th>
                <th>PIC</th>
                <th>No. WhatsApp</th>
                <th>Email B2B</th>
                <th>Membership</th>
                <th>Administrator</th>
                <th>Armada</th>
                <th>Akun</th>
                <th style={{ textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                      color: "#6b7a96",
                    }}
                  >
                    Tidak ada perusahaan klien terdaftar.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((c) => {
                  const count = db.vehicles.filter(
                    (v) => v.companyId === c.id,
                  ).length;
                  const clientAdmin = getAdminById(c.adminId) || {
                    name: "Sentra",
                  };
                  const status = getOnlineStatus(c.last_active || c.lastActive);

                  return (
                    <tr key={c.id}>
                      {/* Online/Offline Indicator */}

                      <td style={{ textAlign: "center" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: "700",
                            background: status.online
                              ? "#f0fdf4"
                              : "#f1f5f9",
                            color: status.online ? "#16a34a" : "#64748b",
                            border: `1px solid ${
                              status.online ? "#bbf7d0" : "#e2e8f0"
                            }`,
                          }}
                        >
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: status.online
                                ? "#22c55e"
                                : "#94a3b8",
                              display: "inline-block",
                              flexShrink: 0,
                              boxShadow: status.online
                                ? "0 0 4px rgba(34,197,94,0.5)"
                                : "none",
                            }}
                          />
                          {status.label}
                        </div>
                        <div
                          style={{
                            fontSize: "10px",
                            color: "#94a3b8",
                            marginTop: "2px",
                          }}
                        >
                          {formatLastActive(c.last_active || c.lastActive)}
                        </div>
                      </td>
                      <td style={{ fontWeight: "700", color: "#1C3967" }}>
                        {c.name}
                      </td>
                      <td>{c.picName}</td>
                      <td style={{ fontFamily: "monospace" }}>+{c.picPhone}</td>
                      <td>{c.email}</td>
                      <td>
                        <span
                          className="badge-status neutral"
                          style={{
                            fontWeight: "700",
                            textTransform: "capitalize",
                          }}
                        >
                          {c.membershipTier}
                        </span>
                      </td>
                      <td>
                        <span
                          className="badge-status info"
                          style={{
                            fontWeight: "700",
                            background: "#eff6ff",
                            color: "#1e40af",
                            border: "1px solid #bfdbfe",
                          }}
                        >
                          {clientAdmin.name}
                        </span>
                      </td>
                      <td style={{ fontWeight: "700", paddingLeft: "30px" }}>
                        {count}
                      </td>
                      <td>
                        <span
                          className={`badge-status ${c.status === "active" ? "success" : "danger"}`}
                        >
                          {c.status === "active" ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <a
                          href={getWhatsAppLink(c)}
                          target="_blank"
                          rel="noreferrer"
                          className="fleet-btn fleet-btn-success fleet-btn-sm"
                          style={{
                            display: "inline-flex",
                            textDecoration: "none",
                          }}
                        >
                          💬 Hubungi PIC
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
