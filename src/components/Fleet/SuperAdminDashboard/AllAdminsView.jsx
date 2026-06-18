import React, { useState, useEffect } from "react";
import { getAllAdmins, updateAdmin } from "../../../utils/supabaseAdmin";

export default function AllAdminsView() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [editForm, setEditForm] = useState({
    is_super: false
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const data = await getAllAdmins();
    setAdmins(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenEdit = (admin) => {
    setSelectedAdmin(admin);
    setEditForm({
      is_super: !!admin.is_super
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    const result = await updateAdmin(selectedAdmin.id, {
      is_super: editForm.is_super
    });

    if (result) {
      setAdmins(admins.map(a => a.id === selectedAdmin.id ? { ...a, ...editForm } : a));
      setIsEditModalOpen(false);
    } else {
      alert("Gagal mengupdate data administrator.");
    }
    setIsSaving(false);
  };

  return (
    <div>
      <div className="fleet-card" style={{ padding: "0", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Memuat data...</div>
        ) : (
          <div className="fleet-table-container">
            <table className="fleet-table">
              <thead>
                <tr>
                  <th>Nama / Perusahaan</th>
                  <th>Kontak</th>
                  <th>Kode Registrasi</th>
                  <th>Hak Akses</th>
                  <th style={{ textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>Tidak ada data admin.</td>
                  </tr>
                ) : (
                  admins.map(admin => (
                    <tr key={admin.id}>
                      <td>
                        <strong style={{ color: "#1e293b", fontSize: "14px" }}>{admin.name}</strong>
                      </td>
                      <td>
                        <span style={{ fontSize: "13px" }}>{admin.email}</span><br />
                        <span style={{ fontSize: "12px", color: "#64748b" }}>{admin.phone || "—"}</span>
                      </td>
                      <td>
                        <span style={{ fontFamily: "monospace", backgroundColor: "#f1f5f9", padding: "4px 6px", borderRadius: "4px" }}>
                          {admin.registration_code || "—"}
                        </span>
                      </td>
                      <td>
                        {admin.is_super ? (
                          <span style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "4px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: "700" }}>
                            SUPER ADMIN
                          </span>
                        ) : (
                          <span style={{ backgroundColor: "#e0f2fe", color: "#1d4ed8", padding: "4px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: "700" }}>
                            STANDARD ADMIN
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          className="fleet-btn-secondary"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                          onClick={() => handleOpenEdit(admin)}
                        >
                          Ubah Akses
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
      {isEditModalOpen && selectedAdmin && (
        <div className="fleet-modal-overlay">
          <div className="fleet-modal" style={{ maxWidth: "450px" }}>
            <div className="fleet-modal-header">
              <h3>Ubah Hak Akses: {selectedAdmin.name}</h3>
              <span className="btn-close-modal" onClick={() => setIsEditModalOpen(false)}>×</span>
            </div>
            <div className="fleet-modal-body">
              <div style={{ padding: "10px", backgroundColor: "#f8fafc", borderRadius: "8px", marginBottom: "16px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={editForm.is_super}
                    onChange={(e) => setEditForm({ ...editForm, is_super: e.target.checked })}
                    style={{ width: "18px", height: "18px" }}
                  />
                  <div>
                    <strong style={{ display: "block", color: "#1e293b", fontSize: "14px" }}>Jadikan Super Admin</strong>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>Memberikan akses penuh ke System Control dan seluruh data client.</span>
                  </div>
                </label>
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
                {isSaving ? "Menyimpan..." : "Simpan Hak Akses"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
