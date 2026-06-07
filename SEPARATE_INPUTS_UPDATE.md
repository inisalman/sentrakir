# Separate Form Inputs for Vehicle Document Data

**Date:** 2026-06-07
**Status:** ✅ COMPLETED & VERIFIED
**Commit:** Ready to commit

---

## 📋 FEATURE OVERVIEW

Menambahkan opsi input manual yang terpisah untuk masing-masing dari 3 dokumen kendaraan di form **Tambah Kendaraan Baru** dan **Edit Data Kendaraan**. Hal ini memudahkan pengguna untuk mengisi data secara detail sesuai dengan dokumen aslinya.

---

## 🎫 3 DOCUMENT SECTIONS IN FORM

### 1. Data Kartu Kendaraan
Opsi input manual meliputi:
- **Nama Pemilik** (`kkOwnerName`)
- **Alamat Pemilik** (`kkOwnerAddress`)
- **No Pol / Nomor Plat** (`kkPlateNumber`)
- **No Uji Kendaraan** (`kkTestNumber`)
- **No Rangka** (`kkFrameNumber`)
- **No Mesin** (`kkEngineNumber`)

### 2. Data Kartu KIR
Opsi input manual meliputi:
- **Nama Pemilik** (`kirOwnerName`)
- **No Pol / Nomor Plat** (`kirPlateNumber`)
- **No Uji Kendaraan** (`kirTestNumber`)
- **Jenis Kendaraan** (`kirVehicleType` - dropdown select)
- **Merek / Tipe** (`kirBrand`)

### 3. Data STNK
Opsi input manual meliputi:
- **Nama Pemilik** (`stnkOwnerName`)
- **Alamat Pemilik** (`stnkOwnerAddress`)
- **No Pol / Nomor Plat** (`stnkPlateNumber`)
- **Merek** (`stnkBrand`)
- **Type Kendaraan** (`stnkVehicleType`)
- **Tahun Buat** (`stnkYearManufactured`)
- **Jenis Kendaraan** (`stnkVehicleJenis` - dropdown select)
- **Model Kendaraan** (`stnkModel`)
- **No Rangka** (`stnkFrameNumber`)
- **No Mesin** (`stnkEngineNumber`)

---

## 🔧 IMPLEMENTATION DETAILS

### 1. Form State (`formData`)
Menambahkan 21 property terpisah ke state form untuk membedakan input antar dokumen.

### 2. Backward Compatibility
Untuk memastikan kompatibilitas dengan sisa aplikasi dan layout yang sudah ada, field global (`ownerName`, `ownerAddress`, `frameNumber`, `engineNumber`, `brand`, `model`, `yearManufactured`) di-map secara dinamis dari data kartu-kartu di atas saat data disimpan.

### 3. Add/Edit Submission
- `handleAddSubmit` dan `handleEditSubmit` telah diperbarui untuk menyimpan 21 property dokumen ke dalam database lokal.
- `handleOpenEdit` secara otomatis me-load kembali 21 data tersebut saat modal edit dibuka.

---

## ✅ TESTING & VERIFICATION

- **test-extended-data-sections.mjs** — Lolos 100% (Memverifikasi keberadaan 21 input UI terpisah).
- **test-vehicle-detail-row-click.mjs** — Lolos 100% (Memverifikasi interaksi baris dan modal).
- **npm run build** — Sukses (0 error).

---

**Status:** 🟢 **PRODUCTION READY**
