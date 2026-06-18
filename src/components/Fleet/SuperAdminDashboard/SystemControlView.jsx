import React, { useState, useEffect } from "react";
import { getAllSystemFlags, updateSystemFlag } from "../../../utils/supabaseSystem";

export default function SystemControlView() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // track key being updated

  const fetchFlags = async () => {
    setLoading(true);
    const data = await getAllSystemFlags();
    setFlags(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const handleToggle = async (flag) => {
    const newValue = !flag.value;
    const confirmMsg = newValue
      ? `Apakah Anda yakin ingin MENGAKTIFKAN fitur: ${flag.description}?`
      : `PERINGATAN: Menonaktifkan fitur ${flag.description} akan menghentikan akses pengguna ke fitur ini. Lanjutkan?`;

    if (!window.confirm(confirmMsg)) return;

    setUpdating(flag.key);

    // Asumsi kita dapat email Super Admin dari session. Untuk mock/simplifikasi, kita hardcode "Super Admin" sementara
    // Di produksi nyata, passing user.email via props.
    const success = await updateSystemFlag(flag.key, newValue, "Super Admin");

    if (success) {
      setFlags(flags.map(f => f.key === flag.key ? { ...f, value: newValue } : f));
    } else {
      alert("Gagal mengubah status sistem.");
    }
    setUpdating(null);
  };

  return (
    <div>
      <div className="fleet-card" style={{ padding: "0", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Memuat konfigurasi sistem...</div>
        ) : (
          <table className="fleet-table">
            <thead>
              <tr>
                <th>Nama Fitur / Modul</th>
                <th>System Key</th>
                <th>Status Saat Ini</th>
                <th style={{ textAlign: "center", width: "150px" }}>Tindakan (Toggle)</th>
              </tr>
            </thead>
            <tbody>
              {flags.map((flag) => (
                <tr key={flag.key}>
                  <td>
                    <strong style={{ color: "#1e293b" }}>{flag.description}</strong>
                  </td>
                  <td>
                    <code style={{ fontSize: "12px", color: "#64748b", backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>
                      {flag.key}
                    </code>
                  </td>
                  <td>
                    {flag.value ? (
                      <span style={{ color: "#16a34a", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "8px", height: "8px", backgroundColor: "#16a34a", borderRadius: "50%", display: "inline-block" }}></span>
                        AKTIF
                      </span>
                    ) : (
                      <span style={{ color: "#dc2626", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "8px", height: "8px", backgroundColor: "#dc2626", borderRadius: "50%", display: "inline-block" }}></span>
                        NONAKTIF
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      onClick={() => handleToggle(flag)}
                      disabled={updating === flag.key}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "20px",
                        border: "none",
                        fontWeight: "700",
                        fontSize: "12px",
                        cursor: updating === flag.key ? "not-allowed" : "pointer",
                        backgroundColor: flag.value ? "#fee2e2" : "#dcfce3",
                        color: flag.value ? "#b91c1c" : "#16a34a",
                        width: "100%",
                        opacity: updating === flag.key ? 0.6 : 1
                      }}
                    >
                      {updating === flag.key ? "..." : flag.value ? "MATIKAN" : "HIDUPKAN"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: "20px", padding: "16px", backgroundColor: "#fffbeb", borderRadius: "8px", border: "1px solid #fde68a" }}>
        <h4 style={{ margin: "0 0 8px 0", color: "#b45309", fontSize: "14px" }}>⚠️ Panduan Keamanan System Control</h4>
        <ul style={{ margin: 0, paddingLeft: "20px", color: "#92400e", fontSize: "13px", lineHeight: "1.6" }}>
          <li>Mematikan <strong>Pendaftaran Client Baru</strong> akan menutup akses form registrasi untuk umum.</li>
          <li>Mematikan <strong>Armada Khusus Sentra/Padajaya</strong> akan menyembunyikan layanan admin yang bersangkutan dari Client Dashboard.</li>
          <li>Efek penonaktifan bersifat seketika (real-time).</li>
        </ul>
      </div>
    </div>
  );
}
