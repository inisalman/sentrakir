import React, { useState, useEffect } from "react";
import {
  getAdminVehicles,
  addAdminVehicle,
  updateAdminVehicle,
  deleteAdminVehicle,
} from "../../../utils/supabaseAdminVehicles.js";

export default function AdminVehiclesView({ adminId }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [form, setForm] = useState({
    plate_number: "",
    owner_name: "",
    vehicle_type: "",
    brand: "",
    model: "",
    year: "",
    kir_expiry: "",
    stnk_expiry: "",
    pajak_expiry: "",
    sim_expiry: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const fetchVehicles = async () => {
    setLoading(true);
    const data = await getAdminVehicles(adminId);
    setVehicles(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchVehicles();
  }, [adminId]);

  const handleOpenForm = (vehicle = null) => {
    if (vehicle) {
      setEditVehicle(vehicle);
      setForm({
        plate_number: vehicle.plate_number || "",
        owner_name: vehicle.owner_name || "",
        vehicle_type: vehicle.vehicle_type || "",
        brand: vehicle.brand || "",
        model: vehicle.model || "",
        year: vehicle.year || "",
        kir_expiry: vehicle.kir_expiry || "",
        stnk_expiry: vehicle.stnk_expiry || "",
        pajak_expiry: vehicle.pajak_expiry || "",
        sim_expiry: vehicle.sim_expiry || "",
        notes: vehicle.notes || "",
      });
    } else {
      setEditVehicle(null);
      setForm({
        plate_number: "",
        owner_name: "",
        vehicle_type: "",
        brand: "",
        model: "",
        year: "",
        kir_expiry: "",
        stnk_expiry: "",
        pajak_expiry: "",
        sim_expiry: "",
        notes: "",
      });
    }
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.plate_number) {
      alert("Nomor plat wajib diisi.");
      return;
    }
    setSaving(true);
    const clean = {
      ...form,
      year: form.year ? parseInt(form.year) : null,
      kir_expiry: form.kir_expiry || null,
      stnk_expiry: form.stnk_expiry || null,
      pajak_expiry: form.pajak_expiry || null,
      sim_expiry: form.sim_expiry || null,
    };
    if (editVehicle) {
      await updateAdminVehicle(editVehicle.id, clean);
    } else {
      await addAdminVehicle({ ...clean, admin_id: adminId });
    }
    setSaving(false);
    setShowForm(false);
    fetchVehicles();
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus kendaraan ini?")) return;
    await deleteAdminVehicle(id);
    fetchVehicles();
  };

  const getDaysRemaining = (dateStr) => {
    if (!dateStr) return null;
    const diff = Math.ceil(
      (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24),
    );
    return diff;
  };

  const getStatusBadge = (days) => {
    if (days === null) return <span style={{ color: "#94a3b8" }}>-</span>;
    if (days < 0) return <span className="badge-status danger">Expired</span>;
    if (days <= 30)
      return <span className="badge-status warning">H-{days}</span>;
    return <span className="badge-status success">H-{days}</span>;
  };

  const filtered = vehicles.filter(
    (v) =>
      v.plate_number?.toLowerCase().includes(search.toLowerCase()) ||
      v.owner_name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="fleet-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
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
          Armada Khusus Admin
          <span
            style={{
              fontSize: "13px",
              fontWeight: "400",
              color: "#94a3b8",
              marginLeft: "8px",
            }}
          >
            {vehicles.length} kendaraan
          </span>
        </h2>
        <button
          className="fleet-btn fleet-btn-primary fleet-btn-sm"
          onClick={() => handleOpenForm()}
        >
          + Tambah Kendaraan
        </button>
      </div>

      <input
        type="text"
        className="fleet-input"
        placeholder="Cari plat atau nama pemilik..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "16px", maxWidth: "300px" }}
      />

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
          Memuat...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7a96" }}>
          <span
            style={{ fontSize: "36px", display: "block", marginBottom: "10px" }}
          >
            🚗
          </span>
          <p style={{ margin: 0, fontWeight: "600" }}>
            Belum ada kendaraan. Klik "+ Tambah Kendaraan" untuk mulai.
          </p>
        </div>
      ) : (
        <div className="fleet-table-container">
          <table className="fleet-table">
            <thead>
              <tr>
                <th>Plat</th>
                <th>Pemilik</th>
                <th>Jenis</th>
                <th>Merk/Model</th>
                <th>KIR</th>
                <th>STNK</th>
                <th>Pajak</th>
                <th>SIM</th>
                <th style={{ textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id}>
                  <td style={{ fontWeight: "700", color: "#1C3967" }}>
                    {v.plate_number}
                  </td>
                  <td>{v.owner_name || "-"}</td>
                  <td>{v.vehicle_type || "-"}</td>
                  <td>{[v.brand, v.model, v.year].filter(Boolean).join(" ")}</td>
                  <td>{getStatusBadge(getDaysRemaining(v.kir_expiry))}</td>
                  <td>{getStatusBadge(getDaysRemaining(v.stnk_expiry))}</td>
                  <td>{getStatusBadge(getDaysRemaining(v.pajak_expiry))}</td>
                  <td>{getStatusBadge(getDaysRemaining(v.sim_expiry))}</td>
                  <td style={{ textAlign: "center" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        className="fleet-btn fleet-btn-sm fleet-btn-secondary"
                        onClick={() => handleOpenForm(v)}
                      >
                        Edit
                      </button>
                      <button
                        className="fleet-btn fleet-btn-sm fleet-btn-danger"
                        onClick={() => handleDelete(v.id)}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "560px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "800",
                color: "#1C3967",
                marginBottom: "20px",
              }}
            >
              {editVehicle ? "Edit Kendaraan" : "Tambah Kendaraan"}
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div className="fleet-form-group">
                <label className="fleet-label">No. Plat *</label>
                <input
                  type="text"
                  className="fleet-input"
                  value={form.plate_number}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      plate_number: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="fleet-form-group">
                <label className="fleet-label">Nama Pemilik</label>
                <input
                  type="text"
                  className="fleet-input"
                  value={form.owner_name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, owner_name: e.target.value }))
                  }
                />
              </div>
              <div className="fleet-form-group">
                <label className="fleet-label">Jenis Kendaraan</label>
                <select
                  className="fleet-input"
                  style={{ background: "white" }}
                  value={form.vehicle_type}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      vehicle_type: e.target.value,
                    }))
                  }
                >
                  <option value="">-- Pilih --</option>
                  <option value="Delvan">Delvan</option>
                  <option value="Blindvan">Blindvan</option>
                  <option value="Pick Up">Pick Up</option>
                  <option value="Double Cabin">Double Cabin</option>
                  <option value="Minibus">Minibus</option>
                  <option value="Travel">Travel</option>
                  <option value="Bus">Bus</option>
                  <option value="Truck CDE">Truck CDE</option>
                  <option value="Truck CDD">Truck CDD</option>
                  <option value="Light Truck">Light Truck</option>
                  <option value="Box">Box</option>
                  <option value="Truck">Truck</option>
                  <option value="Truck Wingbox">Truck Wingbox</option>
                  <option value="Truk Gandeng">Truk Gandeng</option>
                  <option value="Kereta Tempelan">Kereta Tempelan</option>
                  <option value="Trailer">Trailer</option>
                </select>
              </div>
              <div className="fleet-form-group">
                <label className="fleet-label">Merk</label>
                <select
                  className="fleet-input"
                  style={{ background: "white" }}
                  value={form.brand}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, brand: e.target.value }))
                  }
                >
                  <option value="">-- Pilih --</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Honda">Honda</option>
                  <option value="Suzuki">Suzuki</option>
                  <option value="Daihatsu">Daihatsu</option>
                  <option value="Mitsubishi">Mitsubishi</option>
                  <option value="Isuzu">Isuzu</option>
                  <option value="Hino">Hino</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="Wuling">Wuling</option>
                  <option value="DFSK">DFSK</option>
                  <option value="Nissan">Nissan</option>
                  <option value="Yamaha">Yamaha</option>
                  <option value="Kawasaki">Kawasaki</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div className="fleet-form-group">
                <label className="fleet-label">Model</label>
                <input
                  type="text"
                  className="fleet-input"
                  placeholder="Avanza, Innova, dll"
                  value={form.model}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, model: e.target.value }))
                  }
                />
              </div>
              <div className="fleet-form-group">
                <label className="fleet-label">Tahun</label>
                <input
                  type="number"
                  className="fleet-input"
                  placeholder="2020"
                  value={form.year}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, year: e.target.value }))
                  }
                />
              </div>
              <div className="fleet-form-group">
                <label className="fleet-label">Exp. KIR</label>
                <input
                  type="date"
                  className="fleet-input"
                  value={form.kir_expiry}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, kir_expiry: e.target.value }))
                  }
                />
              </div>
              <div className="fleet-form-group">
                <label className="fleet-label">Exp. STNK</label>
                <input
                  type="date"
                  className="fleet-input"
                  value={form.stnk_expiry}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, stnk_expiry: e.target.value }))
                  }
                />
              </div>
              <div className="fleet-form-group">
                <label className="fleet-label">Exp. Pajak</label>
                <input
                  type="date"
                  className="fleet-input"
                  value={form.pajak_expiry}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      pajak_expiry: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="fleet-form-group">
                <label className="fleet-label">Exp. SIM</label>
                <input
                  type="date"
                  className="fleet-input"
                  value={form.sim_expiry}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, sim_expiry: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="fleet-form-group" style={{ marginTop: "4px" }}>
              <label className="fleet-label">Catatan</label>
              <textarea
                className="fleet-input"
                rows="2"
                value={form.notes}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                style={{ resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button
                className="fleet-btn-submit"
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{ flex: 1, opacity: saving ? 0.6 : 1 }}
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  background: "white",
                  cursor: "pointer",
                  fontWeight: "600",
                  color: "#6b7a96",
                }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
