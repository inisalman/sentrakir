# 👥 MULTI-ADMINISTRATOR SYSTEM - SENTRA FLEET PORTAL

## 🎯 Ringkasan Fitur
Sistem Multi-Administrator diimplementasikan untuk membagi beban pengurusan dokumen antara dua administrator independen, memisahkan database klien untuk menghindari bentrok data, serta mengotomatisasi perutean (routing) order STNK/Pajak secara cerdas.

---

## 👥 Akun Administrator & Hak Akses

Ada 2 akun administrator yang terdaftar dalam sistem:

### 1. **Administrator Utama (Sentra)**
* **Email Login**: `admin@sentrakir.com`
* **Kode Registrasi Client**: `SENTRA-2024`
* **Layanan yang Dikelola**:
  - Perpanjangan Uji KIR (`kir_renewal`)
  - Buka Blokir Data Kendaraan KIR (`buka_blokir_kir`)
  - Layanan Bantu Laporan Kehilangan Kepolisian (`lapor_hilang`)
  - Layanan Bantu Media Nasional (`media_nasional`)
* **Batasan**: Tidak mengelola STNK 5 Tahunan atau Pajak Tahunan. Permintaan STNK/Pajak dari kliennya otomatis dialihkan ke Administrator Kedua.

### 2. **Administrator Kedua (Padajaya)**
* **Email Login**: `admin@padajaya.com`
* **Kode Registrasi Client**: `PADAJAYA-2024`
* **Layanan yang Dikelola**:
  - Perpanjangan STNK 5 Tahunan (`stnk_renewal`)
  - Perpanjangan Pajak Kendaraan Tahunan (`pajak_renewal`)
  - Semua layanan KIR/Kehilangan/Media (jika diajukan oleh client Padajaya sendiri atau di-route silang dari client Sentra)

---

## 🔒 Sistem Isolasi Database Klien

Klien diisolasi secara total berdasarkan Administrator yang mereka pilih saat pendaftaran:

* **Pendaftaran**: Klien wajib memasukkan **Kode Pendaftaran** (`SENTRA-2024` atau `PADAJAYA-2024`) untuk menentukan administrator mereka.
* **Isolasi Database**:
  - **Admin Sentra** hanya dapat melihat klien yang terdaftar di bawah kodenya, termasuk data kendaraan, order, dan dokumen mereka.
  - **Admin Padajaya** hanya dapat melihat klien yang terdaftar di bawah kodenya, **KECUALI** untuk request perutean silang (STNK/Pajak) dari client Admin Sentra (Admin Padajaya mendapat akses informasi akun client tersebut untuk komunikasi).

---

## 🔀 Otomatisasi Perutean Jasa & Info Sharing (Client Info Sharing)

Apabila klien dari **Admin Sentra** mengajukan perpanjangan STNK 5 Tahunan, Pajak Tahunan, atau Kombinasi (Multiple):

1. **Perutean Otomatis**: Request tersebut otomatis dikirim ke antrean order **Admin Padajaya** (`assignedAdminId === 'admin-2'`).
2. **Billing Tetap**: Payment dan estimasi biaya tetap tercatat di bawah client Admin Sentra.
3. **Info Sharing**: Detail request di dashboard Admin Padajaya akan menampilkan box peringatan berwarna kuning beserta informasi detail akun client:
   - **Nama PIC**
   - **No. WhatsApp PIC** (terintegrasi link langsung ke wa.me)
   - **Email B2B**
   - **Nama PT/Perusahaan**
   Hal ini memudahkan Admin Padajaya untuk melakukan komunikasi langsung ke client Administrator yang berbeda tersebut.

---

## 🛠️ Implementasi Teknis

### 1. Modifikasi Database (`fleetMockData.js`)
* Penambahan data array `ADMINS` berisi admin registry.
* Inisialisasi otomatis array `admins` pada database `localStorage` (`initFleetData`).
* Penambahan property `adminId` pada `companies` dan property `originatingAdminId`, `assignedAdminId`, `routingReason`, `clientPic` pada `requests`.
* Helper functions baru:
  - `getAdminByEmail(email)`
  - `getAdminByCode(code)`
  - `getAdminById(adminId)`
  - `getAllClientsForAdmin(adminId)`
  - `getClientsForAdminView(adminId)`
  - `getRequestsForAdmin(adminId)`
  - `getRouting(serviceType, originatingAdminId)`
  - `validateRegistrationCode(code)`

### 2. Modifikasi Login & Registrasi (`FleetPortal.jsx`)
* Pendaftaran (`RegisterPage`) mewajibkan input kode registrasi dan memvalidasinya menggunakan helper `validateRegistrationCode`.
* Login Admin (`LoginPage`) memeriksa email terhadap registry `ADMINS` dinamis (bukan hardcoded string).
* Session token mencatat `adminId` di state dan localStorage (`fleet_admin_id`).

### 3. Modifikasi Dashboard Admin (`AdminDashboard.jsx`)
* User profile widget di header menampilkan Nama Admin (Admin Sentra KIR vs Admin Padajaya) dan Perannya (Administrator Utama vs Administrator Kedua) secara dinamis.
* Dashboard tabs (Dasbor, Klien, Armada, Order Tracker, Verifikasi) difilter agar admin hanya melihat data milik client yang terasosiasi dengan mereka.
* Order Tracker menampilkan badge warning `🔀 Routed dari Admin Sentra` dan box informasi klien untuk komunikasi WhatsApp jika order tersebut adalah perutean silang.
* Menolak pemrosesan order STNK/Pajak bagi Admin Sentra (`admin-1`) dengan mendisable select dropdown status.

### 4. Modifikasi Dashboard Klien (`ClientDashboard.jsx`)
* Header user profile menampilkan admin asosiasi klien (`Admin: Sentra` vs `Admin: Padajaya`).
* Modal "Urus Sekarang" mendeteksi jenis pengurusan dan menampilkan warning info box jika request STNK/Pajak dari client Sentra akan di-route ke Admin Padajaya.

---

## 🧪 Panduan Testing Sistem Multi-Admin

### 1. Login Administrator
* **Test Case 1.1**: Login dengan email `admin@sentrakir.com` (password bebas).
  - *Expected*: Masuk ke Dashboard Admin Sentra KIR dengan role "Administrator Utama".
* **Test Case 1.2**: Login dengan email `admin@padajaya.com` (password bebas).
  - *Expected*: Masuk ke Dashboard Admin Padajaya dengan role "Administrator Kedua".

### 2. Registrasi Klien Baru
* **Test Case 2.1**: Daftar client dengan kode `SENTRA-2024`.
  - *Expected*: Registrasi berhasil, client terafiliasi dengan Admin Sentra.
* **Test Case 2.2**: Daftar client dengan kode `PADAJAYA-2024`.
  - *Expected*: Registrasi berhasil, client terafiliasi dengan Admin Padajaya.
* **Test Case 2.3**: Daftar client dengan kode invalid (misal: `TEST-123`).
  - *Expected*: Muncul pesan error "Kode Pendaftaran tidak valid. Gunakan 'SENTRA-2024' atau 'PADAJAYA-2024'".

### 3. Perutean Request & Client Info Sharing
* **Test Case 3.1**: Login sebagai client Admin Sentra, lalu buka tab "Armada Kendaraan" -> klik "URUS SEKARANG" pada kendaraan -> pilih "Perpanjangan Uji KIR".
  - *Expected*: Deskripsi terisi otomatis, tidak ada warning pengalihan admin. Setelah submit, request masuk ke antrean Admin Sentra.
* **Test Case 3.2**: Login sebagai client Admin Sentra, pilih "Perpanjangan STNK 5 Tahunan" atau "Perpanjangan Pajak Tahunan".
  - *Expected*: Muncul warning info box kuning: *"Pengurusan STNK & Pajak dari client Admin Sentra akan dialihkan secara otomatis ke Administrator Padajaya..."*.
  - Setelah submit, login sebagai Admin Padajaya (`admin@padajaya.com`), buka "Tracker Order".
  - *Expected*: Request tersebut masuk ke antrean Admin Padajaya dengan badge `🔀 Routed dari Admin Sentra` dan box detail informasi client (Nama PIC, No. WA, Email, Nama PT) serta tombol WhatsApp Remind untuk komunikasi langsung.
  - Login sebagai Admin Sentra (`admin@sentrakir.com`), buka "Tracker Order".
  - *Expected*: Request tersebut TIDAK MUNCUL di antrean Admin Sentra (isolasi data berhasil).

---

## 🟢 Status
* **Kode Implementasi**: Selesai
* **Keamanan Data**: Terjamin melalui filtering dynamic query di local DB helper
* **Build Status**: Verified (no syntax/TypeScript errors)
