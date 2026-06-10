# Quick Login Mode - Development Feature

## Overview
Fitur **Quick Login** telah diaktifkan untuk memudahkan development dan testing. Fitur ini memungkinkan developer untuk login dengan 1 klik tanpa perlu memasukkan email dan password.

## Fitur yang Ditambahkan

### 1. Quick Login untuk Client
- **Lokasi**: Halaman Login Fleet Portal (Tab "Klien Perusahaan")
- **Tombol**: "⚡ Quick Login (Dev Mode)"
- **Fungsi**: Menampilkan daftar semua akun client yang terdaftar di localStorage
- **Informasi yang ditampilkan**:
  - Nama Perusahaan
  - Email
  - Status Akun (Aktif/Non-aktif)
  - Administrator yang mengelola (Sentra/Padajaya)

### 2. Quick Login untuk Admin
- **Lokasi**: Halaman Login Fleet Portal (Tab "Administrator")
- **Tombol**: "⚡ Quick Login (Dev Mode)"
- **Fungsi**: Menampilkan daftar akun admin yang tersedia
- **Informasi yang ditampilkan**:
  - Nama Admin
  - Email
  - Status (Aktif/Non-aktif)
  - Tier (Primary/Secondary)

## Cara Menggunakan

### Login sebagai Client:
1. Buka halaman `/fleet/login`
2. Pastikan tab **"Klien Perusahaan"** aktif
3. Klik tombol **"⚡ Quick Login (Dev Mode)"**
4. Pilih akun client dari daftar yang muncul
5. Otomatis login ke dashboard client

### Login sebagai Admin:
1. Buka halaman `/fleet/login`
2. Klik tab **"Administrator"**
3. Klik tombol **"⚡ Quick Login (Dev Mode)"**
4. Pilih akun admin (Sentra atau Padajaya)
5. Otomatis login ke dashboard admin

## Daftar Admin yang Tersedia

### Admin 1 - Sentra
- **Email**: admin@sentrakir.com
- **Nama**: Sentra
- **Kode Registrasi**: SENTRA-2024
- **Tier**: Primary
- **Services**: KIR services (renewal, buka blokir, uji baru, dll) + SIM services

### Admin 2 - Padajaya
- **Email**: admin@padajaya.com
- **Nama**: Padajaya
- **Kode Registrasi**: PADAJAYA-2024
- **Tier**: Secondary
- **Services**: All KIR + All STNK/Pajak services + SIM services

## Tampilan UI

### Quick Login Button (Collapsed)
```
┌─────────────────────────────────────┐
│  ⚡ Quick Login (Dev Mode)          │
└─────────────────────────────────────┘
```

### Quick Login Panel (Expanded) - Client View
```
┌─────────────────────────────────────────────┐
│ 📋 Daftar Akun Client Tersedia:            │
│                                             │
│ ┌─────────────────────────────────────────┐│
│ │ PT Maju Bersama Logistik                ││
│ │ client@majubersama.com                  ││
│ │                          ✓ Aktif Sentra ││
│ └─────────────────────────────────────────┘│
│                                             │
│ ┌─────────────────────────────────────────┐│
│ │ PT Angkasa Jaya Transport               ││
│ │ admin@angkasa.com                       ││
│ │                       ✓ Aktif Padajaya  ││
│ └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

### Quick Login Panel (Expanded) - Admin View
```
┌─────────────────────────────────────────────┐
│ 👤 Daftar Akun Admin:                       │
│                                             │
│ ┌─────────────────────────────────────────┐│
│ │ Sentra Admin                            ││
│ │ admin@sentrakir.com                     ││
│ │                    ✓ Aktif     Primary  ││
│ └─────────────────────────────────────────┘│
│                                             │
│ ┌─────────────────────────────────────────┐│
│ │ Padajaya Admin                          ││
│ │ admin@padajaya.com                      ││
│ │                    ✓ Aktif   Secondary  ││
│ └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

## Keamanan & Catatan Penting

⚠️ **PERHATIAN**: Fitur ini **HANYA untuk development/testing**!

### Untuk Production:
1. **HAPUS** atau **NONAKTIFKAN** fitur Quick Login sebelum deploy ke production
2. Tambahkan environment variable untuk mengontrol visibilitas:
   ```javascript
   const ENABLE_QUICK_LOGIN = process.env.NODE_ENV === 'development';
   ```
3. Implementasikan autentikasi yang proper (password hashing, session management, dll)

## Implementasi Teknis

### File yang Dimodifikasi:
- `src/components/Fleet/FleetPortal.jsx`

### Functions yang Ditambahkan:
```javascript
// State untuk toggle Quick Login panel
const [showQuickLogin, setShowQuickLogin] = useState(false);

// Handler untuk Quick Login Client
const handleQuickLogin = (company) => {
  if (company.status !== "active") {
    setError("Akun perusahaan ini sedang tidak aktif.");
    return;
  }
  onLogin("client", company.id, company.email, company.name);
};

// Handler untuk Quick Login Admin
const handleQuickAdminLogin = (admin) => {
  onLogin("admin", admin.id, admin.email, `${admin.name} Admin`);
};

// Get semua client accounts dari localStorage
const getClientAccounts = () => {
  const db = getFleetDatabase();
  return db.companies || [];
};

// Get semua admin accounts
const getAdminAccounts = () => {
  return ADMINS || [];
};
```

## Testing Workflow

### Skenario 1: Login sebagai Client Sentra
1. Klik Quick Login
2. Pilih client dengan admin "Sentra"
3. Verify masuk ke dashboard client
4. Verify admin badge menampilkan "Admin: Sentra"

### Skenario 2: Login sebagai Client Padajaya
1. Klik Quick Login
2. Pilih client dengan admin "Padajaya"
3. Verify masuk ke dashboard client
4. Verify admin badge menampilkan "Admin: Padajaya"

### Skenario 3: Login sebagai Admin Sentra
1. Switch ke tab Administrator
2. Klik Quick Login
3. Pilih "Sentra Admin"
4. Verify masuk ke admin dashboard
5. Verify hanya melihat client sendiri

### Skenario 4: Login sebagai Admin Padajaya
1. Switch ke tab Administrator
2. Klik Quick Login
3. Pilih "Padajaya Admin"
4. Verify masuk ke admin dashboard
5. Verify melihat semua client (termasuk cross-routed)

## Data Storage

**Storage Key**: `sentra_fleet_database`  
**Location**: Browser localStorage

**Structure**:
```json
{
  "admins": [...],
  "companies": [
    {
      "id": "comp-1234567890",
      "name": "PT Maju Bersama",
      "email": "client@company.com",
      "picName": "John Doe",
      "picPhone": "628123456789",
      "adminId": "admin-1",
      "status": "active",
      "membershipTier": "kecil"
    }
  ],
  "vehicles": [...],
  "requests": [...],
  "documents": [...]
}
```

## Routing Logic Summary

Ketika client submit request melalui modal "Kirim Pengajuan Jasa":

1. **System menentukan admin yang menangani** berdasarkan:
   - Service type yang dipilih
   - Admin yang mengelola client (originatingAdminId)
   - Routing rules di `getRouting()` function

2. **Request dikirim ke admin yang tepat** dengan field:
   - `originatingAdminId`: Admin yang mengelola client ini
   - `assignedAdminId`: Admin yang akan menangani request ini
   - `routingReason`: Alasan kenapa di-route ke admin tertentu
   - `clientPic`: Info kontak client (untuk admin-2 yang handle cross-routed requests)

## Next Steps

Untuk production readiness:
1. [ ] Tambahkan environment variable `ENABLE_QUICK_LOGIN`
2. [ ] Implementasi proper authentication (JWT, OAuth, dll)
3. [ ] Hash passwords di database
4. [ ] Implementasi rate limiting untuk login attempts
5. [ ] Add CAPTCHA untuk mencegah brute force
6. [ ] Implementasi session timeout
7. [ ] Add audit logging untuk security events

---

**Created**: 2026-06-10  
**Last Updated**: 2026-06-10  
**Status**: ✅ Implemented & Active
