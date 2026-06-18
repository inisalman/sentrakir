import React, { useState, useEffect } from "react";
import { getActivities } from "../../../utils/supabaseLog";

export default function ActivityLogView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    const data = await getActivities(100); // Ambil 100 log terbaru
    setLogs(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    if (filterType !== "all" && log.actor_type !== filterType) return false;
    if (search && !log.actor_email?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getActorBadge = (type) => {
    if (type === 'super_admin') return <span style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700" }}>SUPER ADMIN</span>;
    if (type === 'admin') return <span style={{ backgroundColor: "#e0f2fe", color: "#1d4ed8", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700" }}>ADMIN</span>;
    return <span style={{ backgroundColor: "#f1f5f9", color: "#475569", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700" }}>CLIENT</span>;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString("id-ID", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }}>
        <div>
          <h2 style={{ color: "#1e293b", margin: "0 0 8px 0" }}>Activity Log System</h2>
          <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
            Mencatat aktivitas login dari seluruh pengguna sistem (maksimal 100 aktivitas terakhir).
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <select
            className="fleet-input"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ width: "160px", backgroundColor: "white" }}
          >
            <option value="all">Semua Pengguna</option>
            <option value="super_admin">Hanya Super Admin</option>
            <option value="admin">Hanya Admin</option>
            <option value="client">Hanya Client</option>
          </select>
          <input
            type="text"
            className="fleet-input"
            placeholder="Cari email pengguna..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "200px", backgroundColor: "white" }}
          />
          <button className="fleet-btn-secondary" onClick={fetchLogs} title="Refresh Data">
            🔄
          </button>
        </div>
      </div>

      <div className="fleet-card" style={{ padding: "0", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Memuat log aktivitas...</div>
        ) : (
          <div className="fleet-table-container">
            <table className="fleet-table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Aktor</th>
                  <th>Email Aktor</th>
                  <th>Aksi</th>
                  <th>Metadata Tambahan</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>Tidak ada catatan aktivitas.</td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id}>
                      <td style={{ fontSize: "12px", color: "#64748b", whiteSpace: "nowrap" }}>
                        {formatDate(log.created_at)}
                      </td>
                      <td>{getActorBadge(log.actor_type)}</td>
                      <td>
                        <strong style={{ color: "#1e293b", fontSize: "13px" }}>{log.actor_email || '—'}</strong>
                      </td>
                      <td>
                        <span style={{ fontWeight: "700", color: log.action === 'LOGIN' ? '#16a34a' : '#1e293b' }}>
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <code style={{ fontSize: "11px", color: "#64748b", backgroundColor: "#f8fafc", padding: "4px", borderRadius: "4px" }}>
                          {JSON.stringify(log.metadata)}
                        </code>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
