# 🧪 TESTING GUIDE - FITUR PREVIEW DOKUMEN

## 🚀 Quick Start

### 1. Setup & Run Development Server
```bash
cd C:\Users\MYOB\sentrakir
npm install
npm run dev
```

Server akan berjalan di: `http://localhost:5173`

### 2. Akses Fleet Portal
```
URL: http://localhost:5173/fleet/client/dashboard
```

---

## 👤 Login Credentials

### Client Login
```
Email: Gunakan email dari database (default sudah ada di mock data)
Password: Apapun (simulasi)
Role: Klien Perusahaan
```

### Admin Login  
```
Email: admin@sentrakir.com
Password: Apapun (simulasi)
Role: Administrator
```

---

## 📋 Manual Testing Steps

### Step 1: Login ke Portal
1. Buka `http://localhost:5173/fleet/client/dashboard`
2. Klik tab **"Klien Perusahaan"** (default)
3. Isi email: Gunakan email client yang ada di database
4. Isi password: Apapun (simulasi)
5. Klik **"Masuk ke Portal"**

### Step 2: Navigate ke Vehicle Management
1. Di sidebar, klik **"🚚 Armada Kendaraan"**
2. Halaman akan menampilkan tabel kendaraan
3. Jika tidak ada kendaraan, klik **"➕ Tambah Kendaraan"**

### Step 3: Tambah Kendaraan (Jika Perlu)
1. Klik **"➕ Tambah Kendaraan"** button
2. Isi form:
   - **Plat Nomor**: B 1234 ABC
   - **Tipe Kendaraan**: Delvan
   - **Nomor Buku KIR**: JKT-0001234
   - **Kadaluwarsa KIR**: 2026-12-31
   - **Kadaluwarsa STNK**: 2031-06-07
   - **Kadaluwarsa Pajak**: 2027-06-07

3. Scroll ke bawah untuk upload dokumen:
   - Upload **Kartu KIR**: Klik "📁 Pilih File" → file dipilih otomatis
   - Upload **Sertifikat KIR**: Klik "📁 Pilih File" → file dipilih otomatis
   - Upload **STNK**: Klik "📁 Pilih File" → file dipilih otomatis

4. Klik **"Simpan Data"** button

### Step 4: Buka Modal Dokumen
1. Setelah kendaraan ditambahkan, kembali ke tabel kendaraan
2. Di kolom **"Dokumen Diupload"**, klik tombol **"📄 Dokumen Diupload"**
3. Modal "Dokumen Diupload" akan terbuka

### Step 5: Preview Dokumen - TEST FITUR INI!
1. Di modal, Anda akan melihat 3 kartu dokumen:
   ```
   🪪 Kartu KIR
   ✓ Terbaca 92% — kartuKir_B1234ABC_xxxx.pdf
   [👁️ Lihat] [🔄 Ganti File]
   
   📜 Sertifikat KIR
   ✓ Terbaca 95% — sertifikatKir_B1234ABC_xxxx.pdf
   [👁️ Lihat] [🔄 Ganti File]
   
   📋 STNK
   ✓ Terbaca 88% — STNK_B1234ABC_xxxx.png
   [👁️ Lihat] [🔄 Ganti File]
   ```

2. **Klik tombol "👁️ Lihat"** pada salah satu dokumen

3. Modal preview akan terbuka menampilkan:
   - **Header**: 👁️ [Nama Dokumen] — [Plat Nomor]
   - **Preview area**: 
     - Untuk PDF: Ikon 📄, nama file, info OCR
     - Untuk gambar: Mockup dokumen A4
   - **Verification box**: Pesan konfirmasi verifikasi OCR
   - **Close button**: Tombol "Tutup"

### Step 6: Verifikasi Hasil Preview
Perhatikan hal-hal berikut:
- ✅ Modal preview muncul dengan benar
- ✅ Nama dokumen ditampilkan di header
- ✅ Plat nomor kendaraan ditampilkan di header
- ✅ File name ditampilkan di preview
- ✅ Format file ditampilkan (PDF/PNG/JPG)
- ✅ Score keterbacaan ditampilkan (XX%)
- ✅ Pesan verifikasi OCR ditampilkan
- ✅ Tombol "Tutup" dapat diklik
- ✅ Modal tertutup saat tombol "Tutup" diklik

### Step 7: Test Semua Dokumen
Ulangi Step 5-6 untuk setiap dokumen:
1. Kartu KIR (PDF)
2. Sertifikat KIR (PDF)
3. STNK (PNG)

---

## 🧪 Test Cases

### Test Case 1: Preview PDF Document
**Expected Result:**
- Modal menampilkan ikon 📄
- Nama file dengan extension .pdf
- Text "File PDF — Keterbacaan: XX%"
- Info box biru dengan pesan "Preview PDF tidak tersedia"
- Verification box hijau di bawah

**Steps:**
1. Buka modal dokumen
2. Klik "👁️ Lihat" pada Kartu KIR atau Sertifikat KIR
3. Verifikasi hasil

**Status:** ✅ PASS / ❌ FAIL

---

### Test Case 2: Preview Image Document
**Expected Result:**
- Modal menampilkan mockup dokumen A4
- Ikon 🖼️ di tengah mockup
- Badge hijau "✓ Keterbacaan: XX%"
- Verification box hijau di bawah

**Steps:**
1. Buka modal dokumen
2. Klik "👁️ Lihat" pada STNK
3. Verifikasi hasil

**Status:** ✅ PASS / ❌ FAIL

---

### Test Case 3: Close Preview Modal
**Expected Result:**
- Modal preview tertutup
- Kembali ke modal "Dokumen Diupload"

**Steps:**
1. Buka preview modal
2. Klik tombol "Tutup"
3. Verifikasi modal tertutup

**Status:** ✅ PASS / ❌ FAIL

---

### Test Case 4: Responsive Design
**Expected Result:**
- Modal tetap terlihat dengan baik
- Text tetap readable
- Buttons dapat diklik dengan mudah

**Steps:**
1. Resize browser ke ukuran mobile (375px)
2. Buka preview modal
3. Verifikasi layout responsive

**Status:** ✅ PASS / ❌ FAIL

---

### Test Case 5: Multiple Document Preview
**Expected Result:**
- Dapat membuka preview untuk dokumen berbeda
- Tidak ada memory leak atau issue saat switch antar dokumen

**Steps:**
1. Preview Kartu KIR, tutup
2. Preview Sertifikat KIR, tutup
3. Preview STNK, tutup
4. Repeat 2-3 kali
5. Check browser console untuk errors

**Status:** ✅ PASS / ❌ FAIL

---

## 🔍 Browser Console Checks

### Buka Developer Tools
```
Press: F12 or Ctrl+Shift+I
```

### Check Console Tab
- ✅ Tidak ada error messages (red)
- ✅ Tidak ada warning messages (orange) tentang preview
- ✅ Tidak ada undefined variables

### Check Network Tab
- ✅ Semua resources loaded successfully
- ✅ Tidak ada failed requests

### Check Elements Tab
- ✅ Modal DOM elements terstruktur dengan baik
- ✅ Classes diterapkan dengan benar
- ✅ Styling visible di Styles panel

---

## 📱 Responsive Testing

### Desktop (1920px)
```
npm run dev
Open: http://localhost:5173
✅ Test preview modal
```

### Tablet (768px)
```
Press F12 → Device toolbar
Select: iPad
✅ Test preview modal
```

### Mobile (375px)
```
Press F12 → Device toolbar
Select: iPhone SE
✅ Test preview modal
```

---

## 🐛 Bug Reporting Template

Jika menemukan bug, gunakan template berikut:

```
### Bug Title
[Deskripsi singkat bug]

### Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

### Expected Behavior
Apa yang seharusnya terjadi

### Actual Behavior
Apa yang benar-benar terjadi

### Screenshots
[Attach screenshot jika diperlukan]

### Browser & OS
- Browser: Chrome/Firefox/Safari
- OS: Windows/Mac/Linux
- Resolution: 1920x1080 / Mobile / etc

### Console Errors
[Paste console error jika ada]
```

---

## ✅ Final Verification Checklist

Before going to production, verify:

- [ ] Preview modal membuka saat "👁️ Lihat" diklik
- [ ] PDF preview menampilkan ikon dan info dengan benar
- [ ] Image preview menampilkan mockup dokumen
- [ ] Score keterbacaan ditampilkan
- [ ] Verification message ditampilkan
- [ ] Close button berfungsi
- [ ] Modal responsive di mobile
- [ ] Tidak ada console errors
- [ ] Tidak ada console warnings
- [ ] Browser devtools Elements tab terlihat baik
- [ ] CSS styling konsisten
- [ ] Font rendering bagus
- [ ] Icons ditampilkan dengan benar
- [ ] Colors sesuai dengan design system
- [ ] Spacing konsisten
- [ ] Hover effects bekerja
- [ ] Accessibility dapat diakses (tab navigation)
- [ ] Performance good (no lag)

---

## 🚀 Production Deployment

Setelah semua test pass:

```bash
# Build production
npm run build

# Output tersedia di folder: dist/

# Deploy ke GitHub Pages / Vercel / Netlify
# atau hosting provider lainnya
```

---

## 📞 Support

Jika ada pertanyaan atau issues:
1. Check console untuk error messages
2. Verify localStorage data: `sentra_fleet_database`
3. Check network requests di DevTools
4. Restart dev server: `npm run dev`
5. Clear browser cache dan reload

---

**Happy Testing! 🎉**
