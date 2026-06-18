import React, { useState } from "react";
import {
  getDaysRemaining,
  getDocStatus,
} from "../../../utils/fleetMockData.js";

export default function NationalVehiclesView({ db, adminId }) {
  const [search, setSearch] = useState("");
  const [filterCompany, setFilterCompany] = useState("all");

  const adminCompanies = db.companies.filter(
    (c) => c.adminId === adminId && c.ownerType !== "admin",
  );
  const companyIds = adminCompanies.map((c) => c.id);

  const filteredVehicles = db.vehicles.filter((v) => {
    if (!companyIds.includes(v.companyId)) return false;

    const company = db.companies.find((c) => c.id === v.companyId) || {};
    const matchesSearch =
      v.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.vehicleType.toLowerCase().includes(search.toLowerCase()) ||
      (company.name &&
        company.name.toLowerCase().includes(search.toLowerCase()));

    const matchesCompany =
      filterCompany === "all" || v.companyId === filterCompany;

    return matchesSearch && matchesCompany;
  });

  return (
    <div className="fleet-card">
      <div className="table-controls">
        <input
          type="text"
          className="fleet-input table-search"
          placeholder="Cari plat, jenis, atau perusahaan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="fleet-input"
          style={{ maxWidth: "240px", background: "white" }}
          value={filterCompany}
          onChange={(e) => setFilterCompany(e.target.value)}
        >
          <option value="all">Semua Perusahaan Klien</option>
          {adminCompanies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="fleet-table-container">
        <table className="fleet-table">
          <thead>
            <tr>
              <th>Plat Nomor</th>
              <th>Pemilik Perusahaan</th>
              <th>Tipe Armada</th>
              <th>Kadaluwarsa KIR</th>
              <th>Kadaluwarsa STNK</th>
              <th>Kadaluwarsa Pajak</th>
              <th>Status KIR</th>
              <th>Status STNK</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: "#6b7a96",
                  }}
                >
                  Tidak ada armada kendaraan terdaftar.
                </td>
              </tr>
            ) : (
              filteredVehicles.map((v) => {
                const owner =
                  db.companies.find((c) => c.id === v.companyId) || {};
                return (
                  <tr key={v.id}>
                    <td style={{ fontWeight: "700" }}>{v.plateNumber}</td>
                    <td style={{ fontWeight: "600", color: "#1C3967" }}>
                      {owner.name || "Unknown"}
                    </td>
                    <td>{v.vehicleType}</td>
                    <td>{v.kirExpiry}</td>
                    <td>{v.stnkExpiry}</td>
                    <td>{v.pajakExpiry}</td>
                    <td>
                      <span
                        className={`badge-status ${getDocStatus(v.kirExpiry).code}`}
                      >
                        {getDocStatus(v.kirExpiry).label}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge-status ${getDocStatus(v.stnkExpiry).code}`}
                      >
                        {getDocStatus(v.stnkExpiry).label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
