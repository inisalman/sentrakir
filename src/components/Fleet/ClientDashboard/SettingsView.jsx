import React, { useState } from "react";
import { updateCompany } from "../../../utils/fleetMockData.js";

export default function SettingsView({ company, onUpdate }) {
  const [formData, setFormData] = useState({
    picName: company.picName || "",
    picPhone: company.picPhone || "",
    email: company.email || "",
    address: company.address || "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateCompany(company.id, {
      picName: formData.picName,
      picPhone: formData.picPhone,
      email: formData.email,
      address: formData.address,
    });
    onUpdate();
    alert("Data akun berhasil diperbarui!");
  };

  return (
    <div className="fleet-card">
      <h2
        style={{
          fontSize: "16px",
          fontWeight: "800",
          margin: "0 0 24px 0",
          color: "#1C3967",
        }}
      >
        ⚙️ Pengaturan Akun & Profil Perusahaan
      </h2>

      <form onSubmit={handleSave}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <div className="fleet-form-group">
            <label className="fleet-label">Nama PIC (Penanggung Jawab) *</label>
            <input
              type="text"
              className="fleet-input"
              placeholder="Masukkan nama lengkap PIC"
              value={formData.picName}
              onChange={(e) => handleChange("picName", e.target.value)}
              required
            />
          </div>
          <div className="fleet-form-group">
            <label className="fleet-label">Nomor WhatsApp PIC *</label>
            <input
              type="text"
              className="fleet-input"
              placeholder="62812xxxxxxxxx"
              value={formData.picPhone}
              onChange={(e) => handleChange("picPhone", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="fleet-form-group">
          <label className="fleet-label">Email Perusahaan / Login *</label>
          <input
            type="email"
            className="fleet-input"
            placeholder="pic@perusahaan.com"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
          />
        </div>

        <div className="fleet-form-group">
          <label className="fleet-label">Alamat Perusahaan / Kantor</label>
          <textarea
            className="fleet-input"
            placeholder="Jl. Raya Kantor No. 1, Kota, Provinsi"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            rows="3"
            style={{ resize: "vertical", fontFamily: "inherit" }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "24px",
            paddingTop: "16px",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <button type="submit" className="fleet-btn fleet-btn-primary">
            💾 Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
