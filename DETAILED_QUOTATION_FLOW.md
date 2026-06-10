# Alur Penawaran Detail Layanan Jasa, Syarat Dokumen & Acc Klien

Fitur ini mengimplementasikan alur negosiasi dan persetujuan (Acc) antara Klien (Client) dan Admin (Sentra/Padajaya) untuk pengurusan jasa KIR, STNK, Pajak, dan SIM.

## Alur Workflow Pengajuan Jasa

```
  [ Klien ]                        [ Admin ]                       [ Klien ]
   Ajukan  ───────────────>      Terima Order     ──────────────>  Tinjau Rincian
  Layanan                     (Status: pending)                    & Pilih Aksi
(Estimasi awal)                                                  (Status: quoted)
                                      │                                 │
                                      ▼                                 │ (Lanjut Urus)
                              Beri Harga Jasa Resmi                     ▼
                             + Estimasi Waktu + Syarat           [ Status: approved ]
                                                                   (Siap Diproses)
```

---

## 1. Sisi Klien (Client Portal)
Klien sekarang dapat melihat detail rincian status pengurusan jasa secara transparan.

* **Tombol "Detail Status"**: Ditambahkan pada tabel **Daftar Pengajuan Perpanjangan** (tab *Status Pengurusan*).
* **Modal Detail Status**:
  * **Status `pending`**: Menampilkan keterangan `"Sedang Diajukan. Menunggu Admin tujuan mengkonfirmasi, memeriksa berkas, dan memberikan rincian harga jasa resmi, estimasi waktu, serta syarat-syarat pengurusan berkas asli."`
  * **Status `quoted` (Penawaran Masuk)**:
    * Menampilkan rincian penawaran resmi dari Admin:
      * **Biaya Jasa Resmi** (Rp)
      * **Estimasi Waktu Pengerjaan** (misal: "3 Hari Kerja")
      * **Syarat-syarat Pengurusan** (misal: penyerahan Buku KIR asli & KTP Pemilik)
    * Menyediakan **Tombol Aksi**:
      * **Lanjut Urus (ACC)**: Klien menyetujui total biaya dan syarat pengurusan. Status berubah menjadi **"Disetujui Klien"** (`approved`).
      * **Batalkan Pengurusan**: Membatalkan pengajuan. Status berubah menjadi **"Dibatalkan"** (`cancelled`).
  * **Status `approved` / `in_progress` / `completed`**: Menampilkan arsip rincian biaya, waktu, dan syarat yang disepakati secara read-only.

---

## 2. Sisi Administrator (Admin Portal)
Admin dapat memeriksa pengajuan, menghitung biaya jasa, menentukan estimasi waktu, dan menetapkan persyaratan berkas fisik.

* **Tombol "Kelola Order"**: Ditambahkan pada tabel **Daftar Permintaan Layanan Dokumen** (tab *Tracker Order*).
* **Modal Kelola Order**:
  * **Status `pending`**: Admin dapat mengisi form penawaran resmi:
    * **Harga Jasa Resmi (Rp)** (default diisi dari estimasi awal)
    * **Estimasi Waktu Pengerjaan** (contoh: "3 Hari Kerja")
    * **Syarat-syarat Dokumen Asli** (contoh: "Buku KIR Asli, STNK Asli, Fotokopi KTP Pemilik")
    * Tombol **"Kirim Penawaran ke Klien"**: Mengubah status menjadi **"Menunggu Persetujuan Klien"** (`quoted`).
  * **Status `quoted`**: Menampilkan rincian penawaran yang sudah dikirim secara read-only (menunggu tanggapan klien).
  * **Status `approved` (Disetujui Klien) / `in_progress`**:
    * Menampilkan rincian penawaran yang disepakati.
    * Mengaktifkan dropdown status pengerjaan bagi admin untuk memproses order (**Diproses** -> **Selesai (Completed)**).

---

## Perubahan Kode & File

### 1. `src/components/Fleet/ClientDashboard.jsx`
* Menambahkan state `selectedRequest` pada komponen `RequestsView`.
* Menambahkan render modal dialog detail status pengurusan (`RequestDetailModal`).
* Menambahkan tombol **"Detail Status"** pada setiap baris tabel.
* Mengintegrasikan fungsi handler `handleApproveQuote` dan `handleCancelQuote` yang berinteraksi langsung dengan backend helper `clientRespondToQuote`.

### 2. `src/components/Fleet/AdminDashboard.jsx`
* Mengimport helper `submitServiceQuote` dari utils.
* Menambahkan state `selectedRequest`, `serviceFee`, `estimatedTime`, dan `terms` pada komponen `OrderTrackerView`.
* Mengganti form edit inline biaya jasa di tabel tracker order menjadi modal terpusat **"Kelola Order"** (`AdminRequestDetailModal`).
* Menyediakan form pembuatan quote/penawaran bagi pengajuan yang berstatus `pending`.
* Mengontrol dropdown status pengerjaan utama agar hanya dapat diubah ketika klien sudah memberikan persetujuan ACC (status `approved` atau `in_progress`).

---

**Tanggal Implementasi**: 2026-06-10  
**Status**: ✅ Selesai, Terverifikasi, dan Siap Digunakan!
