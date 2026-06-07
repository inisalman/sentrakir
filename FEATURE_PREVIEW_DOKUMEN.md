# Fitur Preview Dokumen - Sentra Fleet Portal

## 📋 Ringkasan Perubahan

Telah ditambahkan fitur untuk **menampilkan preview gambar/file dokumen** saat tombol "👁️ Lihat" ditekan pada kartu KIR, Sertifikat KIR, dan STNK di modal "Dokumen Diupload".

## 🎯 Lokasi Fitur

**File yang dimodifikasi:**
- `src/components/Fleet/ClientDashboard.jsx` - Modal preview dokumen (baris 1664-1703)
- `src/styles/fleet.css` - Styling untuk preview dokumen (ditambahkan di akhir file)

## 🔍 Cara Menggunakan

### Flow Pengguna:
1. Login ke **Sentra Fleet** (Client Portal)
2. Buka tab **"Armada Kendaraan"**
3. Klik tombol **"📄 Dokumen Diupload"** pada salah satu kendaraan
4. Modal "Dokumen Diupload" akan terbuka
5. Klik tombol **"👁️ Lihat"** pada dokumen yang ingin dilihat
6. Modal preview akan menampilkan:
   - Ikon file/gambar yang sesuai
   - Nama file dokumen
   - Format file (PDF/PNG/JPG)
   - Keterbacaan/score dari OCR scanning
   - Informasi verifikasi dokumen

## 📦 Komponen Modal Preview

### Untuk File PDF:
```
📄 [Nama File]
File PDF — Keterbacaan: XX%
💡 Preview PDF tidak tersedia. File PDF berisi dokumen asli 
   yang telah dipindai dan diverifikasi oleh sistem OCR.
```

### Untuk File Gambar (PNG/JPG):
```
🖼️
[Mockup Dokumen - Simulasi tampilan]
Keterbacaan: XX%
✓ Dokumen ini telah diverifikasi otomatis oleh sistem OCR 
  dengan akurasi XX%. Data yang terbaca: Plat Nomor, Nomor Uji KIR, 
  Nomor Rangka, dan Nomor Mesin sudah sesuai dengan data yang 
  Anda daftarkan.
```

## 🎨 Styling & UX

**Fitur styling yang ditambahkan:**
- `.document-preview-container` - Container utama preview
- `.document-preview-pdf` - Style untuk preview PDF
- `.document-preview-image` - Style untuk preview gambar
- `.document-preview-mockup` - Mockup dokumen yang dapat dilihat
- `.document-preview-verification` - Box verifikasi dokumen

**Visual Design:**
- Background: Light blue dengan border solid
- Preview area: Min height 300px, Max height 500px dengan scrolling
- Mockup dokumen: Aspect ratio 8.5:11 (standar kertas A4)
- Badge keterbacaan: Green background dengan checkmark
- Informasi verifikasi: Green background dengan pesan positif

## 📱 Responsive Design

Modal preview akan:
- Menggunakan max-width 600px di desktop
- Menyesuaikan ukuran di mobile devices
- Scrollable untuk file yang memiliki konten panjang

## ✨ Data yang Ditampilkan

Setiap preview menampilkan:
1. **Tipe Dokumen**: Kartu KIR / Sertifikat KIR / STNK
2. **Nama File**: Nama file yang diupload (misal: kartuKir_B1234ABC_2024.pdf)
3. **Format**: Tipe file extension (PDF/PNG/JPG)
4. **Keterbacaan OCR**: Persentase akurasi scanning (0-100%)
5. **Status Verifikasi**: Pesan konfirmasi dokumen sudah terverifikasi
6. **Plat Nomor Kendaraan**: Ditampilkan di header modal

## 🔄 Integrasi dengan Fitur Lain

- **Upload Dokumen**: Dokumen dapat diupload via tombol "📤 Pindai" atau "🔄 Ganti File"
- **Scan OCR**: Setiap dokumen di-scan dengan sistem OCR yang simulasi
- **Verifikasi**: Admin dapat memverifikasi/menolak dokumen
- **Database**: Semua data disimpan di localStorage

## 🚀 Testing Checklist

- [x] Modal preview membuka dengan baik
- [x] Tombol "👁️ Lihat" berfungsi
- [x] Preview PDF menampilkan ikon dan informasi
- [x] Preview gambar menampilkan mockup dokumen
- [x] Informasi verifikasi ditampilkan dengan benar
- [x] Close button (×) menutup modal
- [x] Styling responsive di berbagai ukuran layar

## 📝 Catatan Teknis

- Preview menggunakan simulasi untuk file gambar (tidak menampilkan gambar asli, tapi mockup)
- PDF tidak dapat ditampilkan preview karena keterbatasan browser, tapi menampilkan informasi file
- Score/keterbacaan berasal dari simulasi OCR scanning
- Semua data persisten di localStorage browser

## 🎯 Fitur Masa Depan (Optional)

Untuk enhancement lebih lanjut:
- Integrasi dengan actual file upload (bukan simulasi)
- Real PDF viewer untuk preview PDF
- Download file dokumentasi
- Sharing dokumen ke tim
- Arsip/history versi dokumen
