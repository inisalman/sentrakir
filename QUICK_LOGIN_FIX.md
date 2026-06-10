# Quick Login Bug Fix

## Problem
Error saat login menggunakan dev mode di client side yang tidak menampilkan halaman.

## Root Cause
Fungsi `getAdminById` tidak diimport di file `FleetPortal.jsx`, sehingga ketika Quick Login mencoba mengakses fungsi tersebut untuk menampilkan nama admin, terjadi error:
```
ReferenceError: getAdminById is not defined
```

Error ini terjadi pada line 455 di dalam Quick Login panel client:
```javascript
const admin = getAdminById(company.adminId || 'admin-1');
```

## Solution
Menambahkan `getAdminById` ke dalam import statement di `FleetPortal.jsx`:

### Before (BROKEN):
```javascript
import {
  getFleetDatabase,
  initFleetData,
  getAdminByEmail,
  getAdminByCode,
  validateRegistrationCode,
  ADMINS
} from "../../utils/fleetMockData.js";
```

### After (FIXED):
```javascript
import {
  getFleetDatabase,
  initFleetData,
  getAdminByEmail,
  getAdminByCode,
  getAdminById,  // ✅ ADDED
  validateRegistrationCode,
  ADMINS
} from "../../utils/fleetMockData.js";
```

## Files Modified
- ✅ `src/components/Fleet/FleetPortal.jsx` - Added `getAdminById` import

## Testing Steps
1. ✅ Buka halaman `/fleet/login`
2. ✅ Pastikan tab "Klien Perusahaan" aktif
3. ✅ Klik tombol "⚡ Quick Login (Dev Mode)"
4. ✅ Verify panel Quick Login muncul tanpa error
5. ✅ Verify nama admin ditampilkan dengan benar (Sentra/Padajaya)
6. ✅ Klik salah satu akun client
7. ✅ Verify berhasil login dan halaman dashboard client muncul

## Status
✅ **FIXED** - Quick Login sekarang berfungsi dengan baik di client side

---

**Issue Reported**: 2026-06-10 15:08  
**Fixed**: 2026-06-10 15:08  
**Time to Fix**: < 1 minute
