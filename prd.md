# Product Requirement Document (PRD): Sentra Fleet V1

## 1. PENDAHULUAN & POSITIONING PRODUK
**Sentra Fleet** adalah portal administrasi kepatuhan (*compliance*) armada kendaraan yang terhubung secara hybrid dengan bisnis biro jasa KIR **Sentra KIR**. 

Tujuan utama dari platform ini adalah membantu perusahaan (klien B2B) memonitor masa berlaku dokumen penting armada mereka (KIR, STNK, Pajak Kendaraan), mendeteksi dini tanggal jatuh tempo, serta memberikan saluran langsung dan strategis (*Call to Action*) untuk melakukan pengurusan perpanjangan melalui biro jasa Sentra KIR.

### Positioning Produk
* **SENTRA FLEET BUKAN:**
  * GPS Tracking & Real-Time Monitoring
  * Fleet Operations / Dispatching System
  * Fuel Management / Maintenance Scheduler
  * Driver Behavior Tracker
* **SENTRA FLEET ADALAH:**
  * Fleet Compliance & Document Administration Platform
  * Customer Retention & Acquisition Channel untuk Sentra KIR

---

## 2. USER FLOW & PERILAKU PENGGUNA
Sistem menggunakan model **Hybrid** dengan dua peran utama:

### A. Role 1: Client Perusahaan (Enterprise Client)
1. **Login & Autentikasi**: Pengguna masuk dengan email dan sandi perusahaan.
2. **Dashboard Ringkasan**: Klien melihat ringkasan status kepatuhan armadanya:
   * **Total Kendaraan**
   * **Aman** (Hijau): Masa berlaku dokumen > 90 hari.
   * **Mendekati Jatuh Tempo** (Kuning): Ada dokumen yang habis dalam ≤ 90 hari (visual alert untuk H-90, H-60, H-30, dan H-7).
   * **Jatuh Tempo** (Merah): Masa berlaku dokumen telah lewat (≤ 0 hari).
3. **Timeline Jatuh Tempo**: Klien melihat visualisasi bulanan (misal: Juni 2026, Juli 2026, dst.) yang menunjukkan kendaraan mana yang dokumennya (KIR/STNK/Pajak) akan habis.
4. **Data Kendaraan**:
   * Klien melihat daftar seluruh armada miliknya (Plat Nomor, Jenis, Nomor Uji KIR, Tanggal KIR, STNK, Pajak, dan Catatan).
   * Menambah data kendaraan baru.
   * Mengedit data kendaraan yang ada.
   * Mengunggah pindaian dokumen (STNK, KIR, file pendukung) dalam format PDF, PNG, atau JPG.
5. **Tombol "URUS SEKARANG" (CTA Utama)**:
   * Tombol ini muncul secara mencolok di baris kendaraan yang berada dalam status Kuning (Warning) atau Merah (Expired).
   * Klik tombol akan membuka form Pengajuan Perpanjangan Dokumen langsung ke pihak Sentra KIR.
6. **Laporan & Status**:
   * Mengunduh laporan kepatuhan armada (format CSV/PDF).
   * Memantau status pengajuan perpanjangan (Pending, Diproses, Selesai).

### B. Role 2: Admin Sentra KIR (System Owner & Operator)
1. **Login Internal**: Admin masuk ke dasbor internal Sentra KIR.
2. **Dasbor Utama Bisnis**:
   * Statistik Global: Total Perusahaan, Total Armada.
   * Dokumen Jatuh Tempo dalam 30 Hari: Total KIR, STNK, dan Pajak yang habis bulan depan.
   * **Analisis Peluang Bisnis (Revenue Opportunities)**: Sistem otomatis menghitung jumlah dokumen mendekati jatuh tempo dari seluruh klien sebagai prospek penjualan (contoh: "27 KIR habis bulan depan = 27 peluang pengurusan").
3. **Manajemen Klien**: Melihat profil seluruh perusahaan terdaftar, PIC, nomor WhatsApp, dan jumlah armada mereka.
4. **Manajemen Armada Global**: Melihat dan menyaring seluruh kendaraan yang ada di sistem dari semua perusahaan.
5. **Antrean Verifikasi**: Meninjau dokumen pindaian (KIR/STNK) yang diunggah klien, lalu mengubah statusnya menjadi "Terverifikasi" atau "Ditolak".
6. **Manajemen Permintaan Layanan**: Memproses order pengurusan dokumen, mengubah status pengerjaan, dan mencantumkan estimasi biaya.
7. **WhatsApp Follow-up**: Fitur satu-klik untuk menghubungi PIC Klien via WhatsApp Web dengan template pesan otomatis pengingat jatuh tempo.

---

## 3. SITEMAP WEBSITE
Berikut struktur halaman Sentra Fleet (Portal `/fleet`):
* `/fleet` - Halaman Portal Utama
  * `/fleet/login` - Form Login Terpadu (Klien & Admin)
  * `/fleet/register` - Form Registrasi Klien Baru (dengan pilihan membership tier)
  * **Area Klien (Client Space)**:
    * `/fleet/client/dashboard` - Dasbor Kepatuhan & Widget Alerts
    * `/fleet/client/vehicles` - Pengelolaan Armada (Tambah, Edit, Unggah Dokumen)
    * `/fleet/client/timeline` - Kalender Expiry Bulanan
    * `/fleet/client/requests` - Status Pengurusan Jasa
    * `/fleet/client/billing` - Info Membership & Tagihan
  * **Area Admin (Admin Space)**:
    * `/fleet/admin/dashboard` - Dasbor Bisnis & Peluang Sales
    * `/fleet/admin/clients` - Database Perusahaan Klien
    * `/fleet/admin/vehicles` - Database Armada Nasional
    * `/fleet/admin/requests` - Tracker Order Pengurusan KIR & STNK
    * `/fleet/admin/verifications` - Antrean Dokumen Klien

---

## 4. ARSITEKTUR DATA (SKEMA DATABASE YANG SCALABLE)

```sql
-- 1. Tabel Perusahaan (Klien B2B)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    pic_name VARCHAR(100) NOT NULL,
    pic_phone VARCHAR(20) NOT NULL, -- Nomor WhatsApp utama
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    address TEXT,
    membership_tier VARCHAR(20) DEFAULT 'kecil', -- 'kecil' (1-30), 'menengah' (31-100), 'besar' (100+), 'custom'
    membership_status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'trial'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Armada Kendaraan
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    plate_number VARCHAR(15) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL, -- Truk Box, Tronton, CDE, Wingbox, dll.
    test_number VARCHAR(30), -- Nomor Uji KIR
    kir_expiry DATE NOT NULL,
    stnk_expiry DATE NOT NULL,
    pajak_expiry DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Arsip Dokumen (Pindaian STNK/KIR)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    doc_type VARCHAR(20) NOT NULL, -- 'kir', 'stnk', 'other'
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(555) NOT NULL, -- S3 Bucket URL
    file_size INT, -- Dalam Byte
    mime_type VARCHAR(50),
    verification_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    rejection_reason TEXT,
    verified_by VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel Pengajuan Pengurusan Jasa (Sentra KIR Link)
CREATE TABLE service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    service_type VARCHAR(50) NOT NULL, -- 'kir_renewal', 'stnk_renewal', 'pajak_renewal'
    status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'confirmed', 'docs_collected', 'in_progress', 'completed', 'cancelled'
    description TEXT,
    estimated_cost DECIMAL(12, 2) DEFAULT 0.00,
    invoice_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. REKOMENDASI TAHAPAN ROADMAP (V2 & V3)

### Tahap V2: Otomatisasi & Ekspansi Dokumen
* **Notifikasi WhatsApp Bot**: Mengirimkan pengingat jatuh tempo otomatis secara terjadwal (H-90, H-60, H-30, H-7) ke nomor WhatsApp PIC dengan tautan instan untuk konfirmasi perpanjangan ("Klik untuk Urus").
* **Manajemen SIM Pengemudi (SIM Driver)**: Menambahkan modul pencatatan SIM pengemudi perusahaan untuk mendeteksi SIM yang akan habis, melengkapi aspek kepatuhan legal di jalan raya.
* **Integrasi Payment Gateway**: Pembayaran biaya jasa pengurusan dan pajak secara langsung via aplikasi menggunakan VA, e-Wallet, atau transfer bank (Xendit/Midtrans).

### Tahap V3: Integrasi Sistem & Regional
* **Integrasi API Booking Dishub**: Memungkinkan pemesanan antrean slot uji KIR fisik secara langsung melalui Dishub e-KIR nasional jika armada diharuskan hadir secara fisik.
* **Dasbor Multi-Cabang**: Mendukung perusahaan berskala nasional dengan pengelolaan armada per daerah/cabang operasional, dan merutekan dokumen ke cabang Sentra KIR terdekat.
* **Branded Client Portal (White-label)**: Menyediakan portal berlabel nama perusahaan klien untuk armada besar yang ingin mendistribusikan hak akses monitoring ke manajer logistik regional mereka sendiri.
