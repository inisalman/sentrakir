import React from "react";
import { getDaysRemaining } from "../../../../utils/fleetMockData.js";
import { getPlateRegion, isDataMismatch } from "../../../../utils/fleetHelpers.js";

export default function UrusSuratModal({
  isOpen,
  vehicle,
  company,
  servicePrices,
  requestServiceType,
  setRequestServiceType,
  requestDesc,
  setRequestDesc,
  requestLaporHilang,
  setRequestLaporHilang,
  requestMediaNasional,
  setRequestMediaNasional,
  requestSimService,
  setRequestSimService,
  onClose,
  onSubmit,
}) {
  if (!isOpen || !vehicle) return null;

  // Helper for SIM requirements mapping based on vehicle type & expiry
  const getSimRequirement = (v) => {
    if (!v || !v.simDriverExpiry) return null;
    const simDays = getDaysRemaining(v.simDriverExpiry);
    const type = (v.vehicleType || "").toLowerCase();
    const heavyTypes = [
      "bus", "truck", "truck cde", "truck cdd", "light truck", "box",
      "trailer", "tronton", "tangki", "dump truck", "crane", "mixer", "towing"
    ];
    if (heavyTypes.some((t) => type.includes(t))) {
      return "sim_konsultasi";
    }
    if (simDays < 0) return "sim_baru";
    if (simDays <= 60) return "sim_perpanjang";
    return null;
  };

  const isKirBlocked = getDaysRemaining(vehicle.kirExpiry) <= -365;
  const kartuHilang = vehicle.kartuKirHilang;
  const sertifikatHilang = vehicle.sertifikatKirHilang;
  const adaDokumenHilang = kartuHilang || sertifikatHilang;
  const dataMismatch = isDataMismatch(vehicle);
  const region = getPlateRegion(vehicle);
  const isBelumAda = vehicle.noJktBelumAda;

  // Options restriction logic
  const allowedForOutside = ["kir_mutasi_masuk", "kir_numpang_uji", "mutasi_masuk_stnk"];
  const blockedWhenKirBlocked = ["kir_uji_baru", "kir_numpang_uji", "kir_balik_nama", "kir_ganti_nopol"];

  const isRegionDisabled = (val) => {
    if (isKirBlocked && blockedWhenKirBlocked.includes(val)) return true;
    if (region === "outside") return !allowedForOutside.includes(val);
    if (region === "bodetabek") return val === "kir_numpang_uji";
    return false;
  };

  // STNK options — outside vehicles hanya boleh pilih mutasi
  const isStnkOutsideDisabled = (val) => {
    if (region !== "outside") return false;
    const allowedStnkOutside = ["mutasi", "mutasi_masuk_stnk"];
    return !allowedStnkOutside.includes(val);
  };

  const kirJakartaGroup = ({ kirRenewalDisabled = false, bukaBlokirDisabled = false } = {}) => (
    <>
      <option disabled style={{ opacity: 0.5 }}>─── Pengurusan KIR (Jakarta) ───</option>
      {isBelumAda ? (
        <option value="kir_uji_baru" disabled={isRegionDisabled("kir_uji_baru")}>Uji Baru</option>
      ) : (
        <>
          <option value="kir_renewal" disabled={isRegionDisabled("kir_renewal") || kirRenewalDisabled}>Perpanjang Uji KIR</option>
          <option value="buka_blokir_kir" disabled={isRegionDisabled("buka_blokir_kir") || bukaBlokirDisabled}>Buka Blokir Data</option>
          <option value="kir_uji_baru" disabled={isRegionDisabled("kir_uji_baru")}>Uji Baru</option>
          <option value="kir_numpang_uji" disabled={isRegionDisabled("kir_numpang_uji")}>Numpang Uji</option>
          <option value="kir_mutasi_masuk" disabled={isRegionDisabled("kir_mutasi_masuk")}>Mutasi Masuk (Ke-Jakarta)</option>
          <option value="kir_mutasi_keluar" disabled={isRegionDisabled("kir_mutasi_keluar")}>Mutasi Keluar (Cabut Berkas)</option>
          <option value="kir_balik_nama" disabled={isRegionDisabled("kir_balik_nama")}>Balik Nama</option>
          <option value="kir_ganti_nopol" disabled={isRegionDisabled("kir_ganti_nopol")}>Ganti Nopol</option>
        </>
      )}
    </>
  );

  const stnkJakartaGroup = () => (
    <>
      <option disabled style={{ opacity: 0.5 }}>─── Pengurusan STNK (Jakarta) ───</option>
      <option value="stnk_renewal" disabled={isRegionDisabled("stnk_renewal") || isStnkOutsideDisabled("stnk_renewal")}>Perpanjangan STNK 5 Tahunan</option>
      <option value="pajak_renewal" disabled={isRegionDisabled("pajak_renewal") || isStnkOutsideDisabled("pajak_renewal")}>Perpanjangan Pajak Kendaraan Tahunan</option>
      <option value="balik_nama_stnk" disabled={isRegionDisabled("balik_nama_stnk") || isStnkOutsideDisabled("balik_nama_stnk")}>Balik Nama STNK</option>
      <option value="mutasi" disabled={isRegionDisabled("mutasi")}>Mutasi</option>
      <option value="mutasi_masuk_stnk" disabled={isRegionDisabled("mutasi_masuk_stnk")}>Mutasi Masuk STNK</option>
      <option value="stnk_hilang" disabled={isRegionDisabled("stnk_hilang") || isStnkOutsideDisabled("stnk_hilang")}>STNK Hilang</option>
      <option value="ganti_alamat" disabled={isRegionDisabled("ganti_alamat") || isStnkOutsideDisabled("ganti_alamat")}>Ganti Alamat</option>
      <option value="blokir_progresif" disabled={isRegionDisabled("blokir_progresif") || isStnkOutsideDisabled("blokir_progresif")}>Blokir Progresif Pajak</option>
      <option value="cek_fisik_bantuan" disabled={isRegionDisabled("cek_fisik_bantuan") || isStnkOutsideDisabled("cek_fisik_bantuan")}>Cek Fisik Bantuan</option>
      <option value="urus_e_tilang" disabled={isRegionDisabled("urus_e_tilang") || isStnkOutsideDisabled("urus_e_tilang")}>Urus E-Tilang</option>
      <option value="cabut_berkas_stnk" disabled={isRegionDisabled("cabut_berkas_stnk") || isStnkOutsideDisabled("cabut_berkas_stnk")}>Cabut Berkas STNK</option>
    </>
  );

  const simGroup = () => (
    <>
      <option disabled style={{ opacity: 0.5 }}>─── Pengurusan SIM ───</option>
      <option value="bikin_sim_a">Bikin SIM A</option>
      <option value="bikin_sim_c">Bikin SIM C</option>
      <option value="perpanjang_sim_a">Perpanjang SIM A</option>
      <option value="perpanjang_sim_c">Perpanjang SIM C</option>
    </>
  );

  return (
    <div className="fleet-modal-overlay">
      <div className="fleet-modal">
        <div className="fleet-modal-header">
          <h3>Pengajuan Pengurusan Jasa: {vehicle.plateNumber}</h3>
          <span className="btn-close-modal" onClick={onClose}>×</span>
        </div>
        <form onSubmit={onSubmit}>
          <div className="fleet-modal-body">
            {isKirBlocked && (
              <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "12px", fontSize: "12.5px", color: "#991b1b", marginBottom: "16px", lineHeight: "1.5", textAlign: "left" }}>
                ⚠️ <strong>KIR Terblokir (&gt; 1 Tahun):</strong> Data Kendaraan sudah terblokir dari sistem Dishub karena masa berlaku sudah habis melebihi 1 tahun, Harap melakukan pengurusan buka blokir terlebih dahulu!
              </div>
            )}

            {dataMismatch && (
              <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "12px", fontSize: "12.5px", color: "#991b1b", marginBottom: "16px", lineHeight: "1.5", textAlign: "left" }}>
                ⚠️ <strong>Data Tidak Sesuai:</strong> Data pemilik dan/atau NOPOL pada STNK tidak sesuai dengan data pada Sertifikat KIR. Perpanjangan KIR tidak dapat diproses sebelum dilakukan <strong>Balik Nama Kendaraan (BBN-KB)</strong>.
              </div>
            )}

            {adaDokumenHilang && (
              <>
                <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "8px", padding: "12px", fontSize: "12.5px", color: "#9a3412", marginBottom: "16px", lineHeight: "1.5", textAlign: "left" }}>
                  ⚠️ <strong>Dokumen KIR Hilang Terdeteksi:</strong> Kendaraan ini tercatat memiliki dokumen KIR yang hilang:
                  <ul style={{ margin: "6px 0 0 0", paddingLeft: "20px" }}>
                    {kartuHilang && <li>Buku/Kartu KIR — Hilang</li>}
                    {sertifikatHilang && <li>Sertifikat KIR — Hilang</li>}
                  </ul>
                  <p style={{ margin: "8px 0 0 0", fontSize: "12px" }}>Untuk pengurusan perpanjangan, Anda wajib menyertakan Surat Kehilangan dari Kepolisian dan pengumuman di Media Nasional. Kami dapat membantu pengurusannya.</p>
                </div>
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "14px", marginBottom: "16px" }}>
                  <h4 style={{ margin: "0 0 10px 0", fontSize: "13px", color: "#166534", fontWeight: "800" }}>🛠️ Layanan Bantu Pengurusan Kelengkapan Dokumen Hilang</h4>
                  <p style={{ fontSize: "11.5px", color: "#15803d", margin: "0 0 12px 0", lineHeight: "1.4" }}>Dokumen KIR yang hilang memerlukan pengurusan tambahan. Centang layanan bantuan yang Anda perlukan:</p>

                  <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", background: "#fafafa", borderRadius: "6px", border: `1px solid ${requestLaporHilang ? "#22c55e" : "#e5e7eb"}`, cursor: "pointer", marginBottom: "8px", userSelect: "none" }}>
                    <input type="checkbox" checked={requestLaporHilang} onChange={(e) => setRequestLaporHilang(e.target.checked)} />
                    <div>
                      <strong style={{ fontSize: "13px" }}>Bantu Urus Laporan Kehilangan Kepolisian</strong>
                      <div style={{ fontSize: "12px", color: "#6b7a96" }}>Rp 50.000 — Pembuatan surat laporan kehilangan resmi di kantor polisi</div>
                    </div>
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", background: "#fafafa", borderRadius: "6px", border: `1px solid ${requestMediaNasional ? "#22c55e" : "#e5e7eb"}`, cursor: "pointer", userSelect: "none" }}>
                    <input type="checkbox" checked={requestMediaNasional} onChange={(e) => setRequestMediaNasional(e.target.checked)} />
                    <div>
                      <strong style={{ fontSize: "13px" }}>Bantu Urus Media Nasional</strong>
                      <div style={{ fontSize: "12px", color: "#6b7a96" }}>Rp 50.000 — Publikasi pengumuman kehilangan di media nasional</div>
                    </div>
                  </label>
                </div>
              </>
            )}

            {vehicle?.simDriverExpiry && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "14px", marginBottom: "16px" }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: "13px", color: "#166534", fontWeight: "800" }}>🪪 Layanan Pengurusan SIM</h4>
                <p style={{ fontSize: "11.5px", color: "#15803d", margin: "0 0 12px 0", lineHeight: "1.4" }}>
                  {(() => {
                    const req = getSimRequirement(vehicle);
                    if (req === "sim_baru") return "Masa berlaku SIM driver sudah habis. Kami dapat membantu pembuatan SIM A baru.";
                    if (req === "sim_perpanjang") return "Masa berlaku SIM driver akan segera habis. Kami dapat membantu perpanjangan SIM A.";
                    if (req === "sim_konsultasi") return "Kendaraan ini memerlukan SIM khusus (B1/B2). Hubungi kami untuk konsultasi pengurusan SIM.";
                    return null;
                  })()}
                </p>
                {(() => {
                  const req = getSimRequirement(vehicle);
                  if (req === "sim_baru" || req === "sim_perpanjang" || req === "sim_konsultasi") {
                    return (
                      <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", background: "#fafafa", borderRadius: "6px", border: `1px solid ${requestSimService === req ? "#22c55e" : "#e5e7eb"}`, cursor: "pointer", userSelect: "none" }}>
                        <input type="checkbox" checked={requestSimService === req} onChange={(e) => setRequestSimService(e.target.checked ? req : null)} />
                        <div>
                          <strong style={{ fontSize: "13px" }}>
                            {req === "sim_baru" && "Bantu Pembuatan SIM A Baru"}
                            {req === "sim_perpanjang" && "Bantu Perpanjangan SIM A"}
                            {req === "sim_konsultasi" && "Konsultasi Pengurusan SIM Khusus"}
                          </strong>
                          <div style={{ fontSize: "12px", color: "#6b7a96" }}>
                            {req === "sim_baru" && "Rp 500.000 — Pembuatan SIM A baru"}
                            {req === "sim_perpanjang" && "Rp 350.000 — Perpanjangan SIM A"}
                            {req === "sim_konsultasi" && "Rp 100.000 — Konsultasi persyaratan & proses SIM B1/B2"}
                          </div>
                        </div>
                      </label>
                    );
                  }
                  if (req === null && vehicle.simDriverExpiry) {
                    return (
                      <div style={{ padding: "8px 10px", fontSize: "12px", color: "#15803d", background: "#f0fdf4", borderRadius: "6px", border: "1px solid #bbf7d0" }}>
                        ✓ Masa berlaku SIM driver masih panjang ({getDaysRemaining(vehicle.simDriverExpiry)} hari).
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}

            <div className="fleet-form-group">
              <label className="fleet-label">Jenis Pengurusan</label>
              <select className="fleet-input" value={requestServiceType} onChange={(e) => setRequestServiceType(e.target.value)} style={{ background: "white" }}>
                <option value="" disabled>-- Harap pilih jenis pengurusan --</option>
                {dataMismatch ? (
                  <>
                    {!isBelumAda && <option value="balik_nama">Balik Nama Kendaraan (BBN-KB)</option>}
                    {kirJakartaGroup({ kirRenewalDisabled: true, bukaBlokirDisabled: true })}
                    {stnkJakartaGroup()}
                    {simGroup()}
                  </>
                ) : isKirBlocked ? (
                  <>
                    {kirJakartaGroup({ kirRenewalDisabled: true })}
                    {stnkJakartaGroup()}
                    {simGroup()}
                  </>
                ) : (
                  <>
                    {kirJakartaGroup()}
                    {stnkJakartaGroup()}
                    {simGroup()}
                  </>
                )}
              </select>
            </div>

            {region === "outside" && (
              <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "10px 12px", fontSize: "12px", color: "#b91c1c", marginBottom: "16px", lineHeight: "1.5", textAlign: "left" }}>
                ⚠️ <strong>Layanan Terbatas:</strong> Kendaraan yang tidak terdaftar di Jakarta (Sertifikat KIR, Kartu KIR, STNK). Hanya bisa mengajukan pengurusan pada opsi yang diberikan: <strong>Mutasi Masuk KIR</strong>, <strong>Numpang Uji KIR</strong>, dan <strong>Mutasi Masuk STNK</strong>.
              </div>
            )}

            {region === "bodetabek" && (
              <div style={{ background: "#fffbe6", border: "1px solid #ffe58f", borderRadius: "8px", padding: "10px 12px", fontSize: "12px", color: "#d46b08", marginBottom: "16px", lineHeight: "1.5", textAlign: "left" }}>
                ⚠️ <strong>Layanan Terbatas:</strong> Kendaraan terdaftar di area BODETABEK. Opsi <strong>Numpang Uji KIR</strong> dinonaktifkan karena tidak berlaku untuk kendaraan area BODETABEK.
              </div>
            )}

            {/* Routing Info */}
            {(() => {
              const isJakartaStnkService = ["stnk_renewal", "pajak_renewal", "balik_nama_stnk", "mutasi", "mutasi_masuk_stnk", "stnk_hilang", "ganti_alamat", "blokir_progresif", "cek_fisik_bantuan", "urus_e_tilang", "cabut_berkas_stnk"].includes(requestServiceType);
              const isClientOfAdmin1 = (company?.adminId || "admin-1") === "admin-1";
              if (isJakartaStnkService && isClientOfAdmin1) {
                return (
                  <div style={{ background: "#fffbe6", border: "1px solid #ffe58f", borderRadius: "8px", padding: "12px", fontSize: "12.5px", color: "#d46b08", marginBottom: "16px", lineHeight: "1.5", textAlign: "left" }}>
                    ℹ️ <strong>Rute Administrator Berbeda:</strong> Pengurusan STNK/Pajak wilayah Jakarta dari client Admin Sentra akan dialihkan secara otomatis ke <strong>Administrator Padajaya</strong>. Admin Padajaya akan dapat melihat info PIC Anda untuk berkomunikasi langsung.
                  </div>
                );
              }
              return null;
            })()}

            {requestServiceType === "kir_balik_nama" && (
              <div style={{ background: "#fffbe6", border: "1px solid #ffe58f", borderRadius: "8px", padding: "12px", fontSize: "12.5px", color: "#d46b08", marginBottom: "16px", lineHeight: "1.5", textAlign: "left" }}>
                📌 <strong>Catatan Penting:</strong> Pengurusan <strong>Balik Nama</strong> hanya dapat dilakukan bersamaan dengan proses <strong>Perpanjang Uji KIR</strong> atau <strong>Buka Blokir Data</strong>. Pastikan Anda juga memilih salah satu dari kedua layanan tersebut.
              </div>
            )}

            {requestServiceType === "kir_ganti_nopol" && (
              <div style={{ background: "#fffbe6", border: "1px solid #ffe58f", borderRadius: "8px", padding: "12px", fontSize: "12.5px", color: "#d46b08", marginBottom: "16px", lineHeight: "1.5", textAlign: "left" }}>
                📌 <strong>Catatan Penting:</strong> Pengurusan <strong>Ganti Nopol</strong> hanya dapat dilakukan bersamaan dengan proses <strong>Perpanjang Uji KIR</strong> atau <strong>Buka Blokir Data</strong>. Pastikan Anda juga memilih salah satu dari kedua layanan tersebut.
              </div>
            )}

            {["bikin_sim_a", "bikin_sim_c", "perpanjang_sim_a", "perpanjang_sim_c"].includes(requestServiceType) && (
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "12px", fontSize: "12.5px", color: "#1e40af", marginBottom: "16px", lineHeight: "1.5", textAlign: "left" }}>
                ℹ️ Permohonan {requestServiceType === "bikin_sim_a" || requestServiceType === "bikin_sim_c" ? "pembuatan" : "perpanjangan"} SIM akan diproses oleh <strong>{company?.adminId === "admin-2" ? "Administrator Padajaya" : "Administrator Sentra"}</strong> sesuai administrator akun Anda.
              </div>
            )}

            <div className="fleet-form-group" style={{ marginBottom: 0 }}>
              <label className="fleet-label">Deskripsi & Instruksi Tambahan</label>
              <textarea className="fleet-input" value={requestDesc} onChange={(e) => setRequestDesc(e.target.value)} rows="4" placeholder="Instruksi tambahan (misal: jemput berkas di kantor Cakung)..." required style={{ resize: "vertical", fontFamily: "inherit" }} />
            </div>
          </div>

          <div className="fleet-modal-footer">
            <div style={{ flex: 1, textAlign: "left", fontSize: "13px", color: "#1e3a8a", fontWeight: "700" }}>
              {(() => {
                let total = (() => {
                  const st = requestServiceType;
                  if (!st) return 0;
                  if (servicePrices && servicePrices[st]) return servicePrices[st];
                  if (st === "multiple") return 750000;
                  if (st === "buka_blokir_kir") return 1500000;
                  if (st === "balik_nama") return 2000000;
                  return 350000;
                })();
                if (requestLaporHilang) total += 50000;
                if (requestMediaNasional) total += 50000;
                if (requestSimService === "sim_baru") total += 500000;
                if (requestSimService === "sim_perpanjang") total += 350000;
                if (requestSimService === "sim_konsultasi") total += 100000;
                return (
                  <span>
                    💰 Estimasi Total: <span style={{ fontSize: "15px" }}>Rp {total.toLocaleString("id-ID")}</span>
                  </span>
                );
              })()}
            </div>
            <button type="button" className="fleet-btn fleet-btn-secondary" onClick={onClose}>Batal</button>
            <button type="submit" className="fleet-btn fleet-btn-accent">Kirim Pengajuan Jasa</button>
          </div>
        </form>
      </div>
    </div>
  );
}
