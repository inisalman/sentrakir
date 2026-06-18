import React, { useRef, useEffect, useState } from "react";

// Wrapper: guard lives here (no hooks) so hooks order is always stable
export default function AddEditVehicleModal(props) {
  if (!props.isOpen) return null;
  return <AddEditVehicleModalInner {...props} />;
}

// Inner: all hooks — called only when isOpen is true
function AddEditVehicleModalInner({ mode, formData, setFormData, onClose, onSubmit }) {
  const [step, setStep] = useState(1);

  const setDocumentFile = (docType, fileName) => {
    setFormData({ ...formData, [`${docType}File`]: fileName, [`${docType}Hilang`]: false, [`${docType}BelumAda`]: false });
  };

  const removeDocumentFile = (docType) => {
    setFormData({ ...formData, [`${docType}File`]: null });
  };

  const requiredDocs = [
    { docType: "kartuKir", label: "Kartu KIR" },
    { docType: "sertifikatKir", label: "Sertifikat KIR" },
    { docType: "stnk", label: "STNK" },
  ];

  const renderDocumentUpload = ({ docType, label }) => {
    const file = formData[`${docType}File`];
    const isLost = formData[`${docType}Hilang`];
    const isBelumAda = formData[`${docType}BelumAda`];
    const isFilled = !!(file || isLost || isBelumAda);
    return (
      <div key={docType} style={{ border: `1px solid ${isFilled ? "#bbf7d0" : "#cbd5e1"}`, padding: "12px", borderRadius: "8px", background: isFilled ? "#f0fdf4" : "#f8fafc", marginBottom: "12px" }}>
        <label className="fleet-label" style={{ fontWeight: "bold", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{label}</span>
          {isLost ? <span style={{ color: "#c2410c", fontSize: "12px" }}>⚠️ Dinyatakan Hilang</span>
            : isBelumAda ? <span style={{ color: "#b45309", fontSize: "12px" }}>📭 Belum Ada</span>
            : file ? <span style={{ color: "#16a34a", fontSize: "12px" }}>✓ Terunggah</span>
            : <span style={{ color: "#ef4444", fontSize: "12px", fontWeight: "normal" }}>Belum diunggah</span>}
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#c2410c", margin: "4px 0 8px 0", cursor: "pointer" }}>
          <input type="checkbox" checked={!!isLost} onChange={(e) => setFormData({ ...formData, [`${docType}Hilang`]: e.target.checked, ...(e.target.checked ? { [`${docType}File`]: null, [`${docType}BelumAda`]: false } : {}) })} />
          <strong>{docType === "kartuKir" ? "Buku KIR Hilang" : docType === "sertifikatKir" ? "Sertifikat KIR Hilang" : "STNK Hilang"}</strong>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#b45309", margin: "0 0 8px 0", cursor: "pointer" }}>
          <input type="checkbox" checked={!!isBelumAda} onChange={(e) => setFormData({ ...formData, [`${docType}BelumAda`]: e.target.checked, ...(e.target.checked ? { [`${docType}File`]: null, [`${docType}Hilang`]: false } : {}) })} />
          <strong>{docType === "kartuKir" ? "Buku KIR Belum Ada" : docType === "sertifikatKir" ? "Sertifikat KIR Belum Ada" : "STNK Belum Ada"}</strong>
        </label>
        {isLost ? (
          <div style={{ marginTop: "8px", fontSize: "11px", color: "#b91c1c", background: "#fef2f2", padding: "8px 12px", borderRadius: "6px", border: "1px solid #fecaca" }}>⚠️ <strong>Dokumen Dinyatakan Hilang:</strong> Saat pengurusan, wajib sertakan Surat Kehilangan Resmi dari Kepolisian.</div>
        ) : isBelumAda ? (
          <div style={{ marginTop: "8px", fontSize: "11px", color: "#b45309", background: "#fffbeb", padding: "8px 12px", borderRadius: "6px", border: "1px solid #fde68a" }}>📭 <strong>Dokumen Belum Ada:</strong> Silakan unggah setelah dokumen tersedia.</div>
        ) : (
          <div style={{ marginTop: "10px" }}>
            <input type="file" accept=".pdf,.png,.jpg,.jpeg" style={{ display: "none" }} id={`file-input-${docType}`} onChange={(e) => { if (e.target.files && e.target.files[0]) setDocumentFile(docType, e.target.files[0].name); }} />
            {file ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff", border: "1px solid #bbf7d0", padding: "10px 14px", borderRadius: "8px" }}>
                <div><span style={{ fontSize: "13px", fontWeight: "600", color: "#166534" }}>{file}</span><br /><span style={{ fontSize: "11px", color: "#15803d" }}>Terpilih</span></div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <label htmlFor={`file-input-${docType}`} style={{ fontSize: "11px", fontWeight: "600", color: "#166534", cursor: "pointer", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "4px 8px", borderRadius: "6px" }}>Ganti</label>
                  <button type="button" onClick={() => removeDocumentFile(docType)} style={{ fontSize: "11px", fontWeight: "600", color: "#b91c1c", cursor: "pointer", background: "#fef2f2", border: "1px solid #fecaca", padding: "4px 8px", borderRadius: "6px" }}>Hapus</button>
                </div>
              </div>
            ) : (
              <label htmlFor={`file-input-${docType}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#ffffff", border: "2px dashed #cbd5e1", borderRadius: "8px", padding: "16px", cursor: "pointer" }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>📁</div>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#3b82f6", marginBottom: "2px" }}>Pilih Berkas</span>
                <span style={{ fontSize: "11px", color: "#6b7a96" }}>PDF, PNG, JPG, JPEG</span>
              </label>
            )}
          </div>
        )}
      </div>
    );
  };

  const StepIndicator = () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: step >= 1 ? "#1e40af" : "#e2e8f0", color: step >= 1 ? "white" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "13px" }}>1</div>
        <span style={{ fontSize: "11px", fontWeight: "700", color: step >= 1 ? "#1e40af" : "#94a3b8" }}>Wajib</span>
      </div>
      <div style={{ width: "60px", height: "2px", background: step >= 2 ? "#1e40af" : "#e2e8f0", margin: "0 8px", marginBottom: "20px" }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: step >= 2 ? "#1e40af" : "#e2e8f0", color: step >= 2 ? "white" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "13px" }}>2</div>
        <span style={{ fontSize: "11px", fontWeight: "700", color: step >= 2 ? "#1e40af" : "#94a3b8" }}>Opsional</span>
      </div>
    </div>
  );

  const renderForm1 = () => (
    <>
      <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#1C3967", margin: "0 0 14px 0", paddingBottom: "4px", borderBottom: "1px solid #e2e8f0" }}>📋 Data Kendaraan — Wajib Diisi</h4>

      <div className="fleet-form-group">
        <label className="fleet-label">Nama Pemilik Armada *</label>
        <input type="text" className="fleet-input" placeholder="Nama Pemilik" value={formData.ownerName} onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })} required />
      </div>

      <div className="fleet-form-group">
        <label className="fleet-label">Plat Nomor Kendaraan *</label>
        <input type="text" className="fleet-input" placeholder="B 1234 ABC" value={formData.plateNumber} onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })} required />
      </div>

      <div className="fleet-form-group">
        <label className="fleet-label">Tipe / Jenis Kendaraan *</label>
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "10px 12px", fontSize: "12px", color: "#1e40af", marginBottom: "10px" }}>ℹ️ Sesuaikan jenis/type kendaraan berdasarkan dokumen KIR dan STNK.</div>
        {(() => {
          const vehicleTypes = ["Delvan","Blindvan","Pick Up","Double Cabin","Minibus","Travel","Bus","Truck CDE","Truck CDD","Light Truck","Box","Truck","Truck Wingbox","Truk Gandeng","Kereta Tempelan","Trailer"];
          const isValidType = vehicleTypes.includes(formData.vehicleType);
          return (
            <>
              <select className="fleet-input" value={isValidType ? formData.vehicleType : "Delvan"} onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })} style={{ background: "white" }}>
                {vehicleTypes.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              {!isValidType && (
                <div style={{ marginTop: "6px", fontSize: "11.5px", color: "#b45309", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "6px", padding: "6px 10px" }}>
                  ⚠️ Jenis kendaraan sebelumnya (<strong>{formData.vehicleType}</strong>) tidak ditemukan dalam daftar. Sudah otomatis diset ke <strong>Delvan</strong>. Silakan pilih ulang.
                </div>
              )}
            </>
          );
        })()}
      </div>

      <div className="fleet-form-group">
        <label className="fleet-label">Nomor Buku Uji KIR {formData.noJktBelumAda ? "" : "*"}</label>
        <input type="text" className="fleet-input" placeholder="JKT-xxxxxxx" value={formData.noJktBelumAda ? "" : formData.testNumber} onChange={(e) => setFormData({ ...formData, testNumber: e.target.value })} disabled={formData.noJktBelumAda} required={!formData.noJktBelumAda} />
        <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", fontSize: "13px", color: "#475569", cursor: "pointer" }}>
          <input type="checkbox" checked={!!formData.noJktBelumAda} onChange={(e) => setFormData({ ...formData, noJktBelumAda: e.target.checked, testNumber: e.target.checked ? "" : formData.testNumber })} />
          No JKT belum ada
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div className="fleet-form-group">
          <label className="fleet-label">Kadaluarsa KIR *</label>
          <input type="date" className="fleet-input" value={formData.kirExpiry} onChange={(e) => setFormData({ ...formData, kirExpiry: e.target.value })} required />
        </div>
        <div className="fleet-form-group">
          <label className="fleet-label">Kadaluarsa STNK (5 Tahunan) *</label>
          <input type="date" className="fleet-input" value={formData.stnkExpiry} onChange={(e) => setFormData({ ...formData, stnkExpiry: e.target.value })} required />
        </div>
      </div>

      <div className="fleet-form-group">
        <label className="fleet-label">Kadaluarsa Pajak (Tahunan) *</label>
        <input type="date" className="fleet-input" value={formData.pajakExpiry} onChange={(e) => setFormData({ ...formData, pajakExpiry: e.target.value })} required />
      </div>

      <div style={{ borderTop: "2px solid #e2e8f0", paddingTop: "16px", marginTop: "8px" }}>
        <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#1C3967", margin: "0 0 6px 0" }}>📁 Unggah Dokumen Kendaraan — Wajib *</h4>
        <p style={{ fontSize: "12px", color: "#6b7a96", margin: "0 0 14px 0" }}>Unggah file Kartu KIR, Sertifikat KIR, dan STNK (format PDF/PNG/JPG).</p>
        {requiredDocs.map(renderDocumentUpload)}
      </div>
    </>
  );

  const renderForm2 = () => (
    <>
      <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#1C3967", margin: "0 0 10px 0", paddingBottom: "4px", borderBottom: "1px solid #e2e8f0" }}>📋 Data Tambahan — Opsional</h4>

      <div className="fleet-form-group">
        <label className="fleet-label">Masa Berlaku SIM Driver</label>
        <input type="date" className="fleet-input" value={formData.simDriverExpiry} onChange={(e) => setFormData({ ...formData, simDriverExpiry: e.target.value })} />
      </div>

      <div style={{ borderTop: "2px solid #e2e8f0", paddingTop: "16px", marginTop: "8px" }}>
        <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#1C3967", margin: "0 0 12px 0" }}>🪪 Data Kartu Kendaraan (KK)</h4>
        {[["kkOwnerName","Nama Pemilik"],["kkOwnerAddress","Alamat Pemilik"]].map(([k,l]) => (
          <div key={k} className="fleet-form-group"><label className="fleet-label">{l}</label><input type="text" className="fleet-input" value={formData[k]} onChange={(e) => setFormData({...formData, [k]: e.target.value})} /></div>
        ))}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[["kkPlateNumber","No Pol / Plat"],["kkTestNumber","No Uji Kendaraan"]].map(([k,l]) => (
            <div key={k} className="fleet-form-group"><label className="fleet-label">{l}</label><input type="text" className="fleet-input" value={formData[k]} onChange={(e) => setFormData({...formData, [k]: e.target.value})} /></div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[["kkFrameNumber","No Rangka"],["kkEngineNumber","No Mesin"]].map(([k,l]) => (
            <div key={k} className="fleet-form-group"><label className="fleet-label">{l}</label><input type="text" className="fleet-input" value={formData[k]} onChange={(e) => setFormData({...formData, [k]: e.target.value.toUpperCase()})} /></div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: "2px solid #e2e8f0", paddingTop: "16px", marginTop: "8px" }}>
        <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#1C3967", margin: "0 0 12px 0" }}>📄 Data Kartu KIR</h4>
        {[["kirOwnerName","Nama Pemilik"]].map(([k,l]) => (
          <div key={k} className="fleet-form-group"><label className="fleet-label">{l}</label><input type="text" className="fleet-input" value={formData[k]} onChange={(e) => setFormData({...formData, [k]: e.target.value})} /></div>
        ))}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[["kirPlateNumber","No Pol / Plat"],["kirTestNumber","No Uji Kendaraan"]].map(([k,l]) => (
            <div key={k} className="fleet-form-group"><label className="fleet-label">{l}</label><input type="text" className="fleet-input" value={formData[k]} onChange={(e) => setFormData({...formData, [k]: e.target.value.toUpperCase()})} /></div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="fleet-form-group">
            <label className="fleet-label">Jenis Kendaraan</label>
            <select className="fleet-input" value={formData.kirVehicleType} onChange={(e) => setFormData({...formData, kirVehicleType: e.target.value})} style={{ background: "white" }}>
              {["Delvan","Blindvan","Pick Up","Double Cabin","Minibus","Travel","Bus","Truck CDE","Truck CDD","Light Truck","Box","Truck","Truck Wingbox","Truk Gandeng","Kereta Tempelan","Trailer"].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="fleet-form-group"><label className="fleet-label">Merek / Tipe</label><input type="text" className="fleet-input" value={formData.kirBrand} onChange={(e) => setFormData({...formData, kirBrand: e.target.value})} /></div>
        </div>
      </div>

      <div style={{ borderTop: "2px solid #e2e8f0", paddingTop: "16px", marginTop: "8px" }}>
        <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#1C3967", margin: "0 0 12px 0" }}>🚗 Data STNK</h4>
        {[["stnkOwnerName","Nama Pemilik"],["stnkOwnerAddress","Alamat Pemilik"]].map(([k,l]) => (
          <div key={k} className="fleet-form-group"><label className="fleet-label">{l}</label><input type="text" className="fleet-input" value={formData[k]} onChange={(e) => setFormData({...formData, [k]: e.target.value})} /></div>
        ))}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[["stnkPlateNumber","No Pol / Plat"],["stnkBrand","Merek"]].map(([k,l]) => (
            <div key={k} className="fleet-form-group"><label className="fleet-label">{l}</label><input type="text" className="fleet-input" value={formData[k]} onChange={(e) => setFormData({...formData, [k]: e.target.value})} /></div>
          ))}
        </div>
        <div className="fleet-form-group"><label className="fleet-label">Tahun Buat</label><input type="text" className="fleet-input" value={formData.stnkYearManufactured} onChange={(e) => setFormData({...formData, stnkYearManufactured: e.target.value})} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="fleet-form-group"><label className="fleet-label">No Rangka</label><input type="text" className="fleet-input" value={formData.stnkFrameNumber} onChange={(e) => setFormData({...formData, stnkFrameNumber: e.target.value.toUpperCase()})} /></div>
          <div className="fleet-form-group"><label className="fleet-label">No Mesin</label><input type="text" className="fleet-input" value={formData.stnkEngineNumber} onChange={(e) => setFormData({...formData, stnkEngineNumber: e.target.value.toUpperCase()})} /></div>
        </div>
      </div>

      <div style={{ borderTop: "2px solid #e2e8f0", paddingTop: "16px", marginTop: "8px" }}>
        <div className="fleet-form-group" style={{ marginBottom: 0 }}>
          <label className="fleet-label">Catatan Tambahan</label>
          <textarea className="fleet-input" placeholder="Nama driver, info tambahan..." value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows="2" style={{ resize: "vertical" }} />
        </div>
      </div>
    </>
  );

  return (
    <div className="fleet-modal-overlay">
      <div className="fleet-modal" style={{ maxWidth: step === 1 ? "620px" : "680px" }}>
        <div className="fleet-modal-header">
          <h3>{mode === "add" ? "Tambah Kendaraan Baru" : "Edit Data Kendaraan"}</h3>
          <span className="btn-close-modal" onClick={onClose}>×</span>
        </div>
        <div style={{ padding: "12px 20px 8px" }}>
          <StepIndicator />
        </div>
        <form id="vehicle-form">
          <div style={{ padding: "0 20px 16px", overflowY: "auto", flex: 1 }}>
            {step === 1 ? renderForm1() : renderForm2()}
          </div>
        </form>
        <div className="fleet-modal-footer">
          {step === 1 ? (
            <>
              <button type="button" className="fleet-btn fleet-btn-secondary" onClick={onClose}>Batal</button>
              <button type="button" className="fleet-btn fleet-btn-primary" onClick={() => setStep(2)}>Lanjut ke Data Opsional →</button>
            </>
          ) : (
            <>
              <button type="button" className="fleet-btn fleet-btn-secondary" onClick={() => setStep(1)}>← Kembali</button>
              <button type="button" className="fleet-btn fleet-btn-primary" onClick={() => onSubmit()}>💾 Simpan Data Kendaraan</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
