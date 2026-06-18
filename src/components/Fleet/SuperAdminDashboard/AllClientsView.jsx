import React, { useState, useEffect } from "react";
import { getAllCompanies, updateCompany } from "../../../utils/supabaseClientAuth";
import { getAllAdmins } from "../../../utils/supabaseAdmin";

export default function AllClientsView() {
  const [clients, setClients] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editForm, setEditForm] = useState({
    admin_id: "",
    membership_tier: "",
    status: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [companiesData, adminsData] = await Promise.all([
      getAllCompanies(),
      getAllAdmins()
    ]);
    setClients(companiesData || []);
    setAdmins(adminsData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenEdit = (client) => {
    setSelectedClient(client);
    setEditForm({
      admin_id: client.admin_id || "",
      membership_tier: client.membership_tier || "free",
      status: client.status || "active"
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    const result = await updateCompany(selectedClient.id, {
      admin_id: editForm.admin_id,
      membership_tier: editForm.membership_tier,
      status: editForm.status
    });

    if (result) {
      // Update local state
      setClients(clients.map(c => c.id === selectedClient.id ? { ...c, ...editForm } : c));
      setIsEditModalOpen(false);
    } else {
      alert("Gagal mengupdate data client.");
    }
    setIsSaving(false);
  };

  const getAdminName = (adminId) => {
    const admin = admins.find(a => a.id === adminId);
    return admin ? admin.name : "Unassigned";
  };

  const filteredClients = clients.filter(c =>
    (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.pic_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <input
            type="text"
            className="fleet-input"
            placeholder="Cari perusahaan, email, PIC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "250px", backgroundColor: "white" }}
          />
        </div>
      </div>

      <div className="fleet-card" style={{ padding: "0", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Memuat data...</div>
        ) : (
          <div className="fleet-table-container">
            <table className="fleet-table">
              <thead>
                <tr>
                  <th>Perusahaan</th>
                  <th>PIC Info</th>
                  <th>Administrator</th>
                  <th>Paket</th>
                  <th>Status Akun</th>
                  <th style={{ textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>Tidak ada data client.</td>
                  </tr>
                ) : (
                  filteredClients.map(client => (
                    <tr key={client.id}>
                      <td>
                        <strong style={{ color: "#1e293b" }}>{client.name}</strong><br />
                        <span style={{ fontSize: "12px", color: "#64748b" }}>{client.email}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: "13px" }}>{client.pic_name}</span><br />
                        <span style={{ fontSize: "12px", color: "#64748b" }}>{client.pic_phone}</span>
                      </td>
                      <td>
                        <span style={{
                          backgroundColor: "#f1f5f9",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#334155"
                        }}>
                          {getAdminName(client.admin_id)}
                        </span>
                      </td>
                      <td>
                        <span style={{ textTransform: "capitalize", fontWeight: "600", fontSize: "13px" }}>
                          {client.membership_tier}
                        </span><br />
                        <span style={{ fontSize: "11px", color: client.subscription_status === "active" ? "#16a34a" : "#ca8a04" }}>
                          {client.subscription_status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-status ${client.status === 'active' ? 'success' : 'danger'}`}>
                          {client.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          className="fleet-btn-secondary"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                          onClick={() => handleOpenEdit(client)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedClient && (
        <div className="fleet-modal-overlay">
          <div className="fleet-modal" style={{ maxWidth: "500px" }}>
            <div className="fleet-modal-header">
              <h3>Edit Client: {selectedClient.name}</h3>
              <span className="btn-close-modal" onClick={() => setIsEditModalOpen(false)}>×</span>
            </div>
            <div className="fleet-modal-body">

              <div className="fleet-form-group">
                <label className="fleet-label">Pindahkan Administrator</label>
                <select
                  className="fleet-input"
                  value={editForm.admin_id}
                  onChange={(e) => setEditForm({...editForm, admin_id: e.target.value})}
                  style={{ backgroundColor: "white" }}
                >
                  <option value="">-- Tidak Ada Admin --</option>
                  {admins.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
                  ))}
                </select>
                <p style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                  Pindahkan client ini ke admin lain. Seluruh pengurusan baru akan masuk ke admin yang dipilih.
                </p>
              </div>

              <div className="fleet-form-group">
                <label className="fleet-label">Paket Membership</label>
                <select
                  className="fleet-input"
                  value={editForm.membership_tier}
                  onChange={(e) => setEditForm({...editForm, membership_tier: e.target.value})}
                  style={{ backgroundColor: "white" }}
                >
                  <option value="free">Starter (Gratis)</option>
                  <option value="kecil">Kecil</option>
                  <option value="menengah">Menengah</option>
                  <option value="besar">Besar (Enterprise)</option>
                </select>
              </div>

              <div className="fleet-form-group">
                <label className="fleet-label">Status Akun</label>
                <select
                  className="fleet-input"
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  style={{ backgroundColor: "white" }}
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif (Suspend)</option>
                </select>
                <p style={{ fontSize: "11px", color: editForm.status === 'inactive' ? "#dc2626" : "#64748b", marginTop: "4px" }}>
                  {editForm.status === 'inactive' && "⚠️ Client tidak akan bisa login ke sistem jika diset Nonaktif."}
                </p>
              </div>

            </div>
            <div className="fleet-modal-footer">
              <button
                type="button"
                className="fleet-btn fleet-btn-secondary"
                onClick={() => setIsEditModalOpen(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="fleet-btn fleet-btn-primary"
                style={{ backgroundColor: "#b91c1c", borderColor: "#b91c1c" }}
                onClick={handleSaveEdit}
                disabled={isSaving}
              >
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
