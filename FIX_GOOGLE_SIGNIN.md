# Fix Google Sign-In Error di Android Debug APK

## 🔴 Masalah
Saat login/daftar dengan Google di APK debug, muncul error:
```
"Daftar dengan Google gagal. Something went wrong"
```

## ✅ Solusi

### 1. Tambahkan SHA-1 Fingerprint ke Google Cloud Console

SHA-1 fingerprint debug keystore Anda:
```
FC:7A:73:F7:45:65:E2:45:72:07:12:5C:CD:4C:4D:E6:35:80:2B:7E
```

**Langkah-langkah:**

1. Buka **Google Cloud Console**: https://console.cloud.google.com/
2. Pilih project Anda (atau buat project baru)
3. Menu kiri: **APIs & Services** → **Credentials**
4. Cari **OAuth 2.0 Client IDs**
5. Klik pada **Android client** (atau buat baru):
   - **Name**: `Sentra Fleet Android Debug`
   - **Application type**: Android
   - **Package name**: `com.sentrakir.fleet`
   - **SHA-1 certificate fingerprint**: `FC:7A:73:F7:45:65:E2:45:72:07:12:5C:CD:4C:4D:E6:35:80:2B:7E`
6. Klik **Save**

### 2. Download google-services.json

1. Buka **Firebase Console**: https://console.firebase.google.com/
2. Pilih project Anda (atau buat baru dan hubungkan ke Google Cloud project)
3. Klik **Android** untuk tambahkan app
4. Isi form:
   - **Android package name**: `com.sentrakir.fleet`
   - **App nickname**: `Sentra Fleet`
   - **Debug signing certificate SHA-1**: `FC:7A:73:F7:45:65:E2:45:72:07:12:5C:CD:4C:4D:E6:35:80:2B:7E`
5. Klik **Register app**
6. Download **google-services.json**
7. Pindahkan file ke: `android/app/google-services.json`

### 3. Verifikasi OAuth Client ID

Pastikan di Google Cloud Console ada **2 OAuth client IDs**:

1. **Web client** (sudah ada):
   - Client ID: `105550504783-39924gg3a754dh8u6re7858id2qg0es8.apps.googleusercontent.com`
   - Digunakan untuk `serverClientId` di capacitor.config.ts

2. **Android client** (tambahkan jika belum ada):
   - Package name: `com.sentrakir.fleet`
   - SHA-1: `FC:7A:73:F7:45:65:E2:45:72:07:12:5C:CD:4C:4D:E6:35:80:2B:7E`

### 4. Enable Google Sign-In API

1. Buka: https://console.cloud.google.com/apis/library
2. Search: **Google Identity** atau **Google Sign-In**
3. Klik **Google Identity Toolkit API**
4. Klik **ENABLE**

### 5. Rebuild APK

Setelah setup Google Cloud Console:

```bash
# Clean dan rebuild
cd android
./gradlew clean
cd ..

# Rebuild
npm run android:apk
```

## 📋 Checklist Verifikasi

Pastikan semua item berikut sudah benar:

- [ ] SHA-1 fingerprint sudah didaftarkan di Google Cloud Console
- [ ] Package name: `com.sentrakir.fleet` (sama persis)
- [ ] google-services.json sudah ada di `android/app/`
- [ ] Google Identity API sudah enabled
- [ ] OAuth client ID Android sudah dibuat
- [ ] Web client ID ada di capacitor.config.ts (sudah benar)

## 🔍 Troubleshooting

### Masih error setelah setup?

**1. Cek Logcat untuk error detail:**
```bash
cd android
./gradlew installDebug
adb logcat | grep -i "google\|auth\|oauth"
```

**2. Verifikasi SHA-1 di APK:**
```bash
# Extract signature dari APK
unzip -p app-debug.apk META-INF/CERT.RSA | keytool -printcert
```

**3. Cek google-services.json:**
```bash
cat android/app/google-services.json | grep package_name
# Harus: "com.sentrakir.fleet"
```

**4. Clear app data di device:**
- Settings → Apps → Sentra Fleet → Storage → Clear Data
- Uninstall dan install ulang

### Error: "10: Developer error"

Ini berarti konfigurasi OAuth client ID salah:
- Package name tidak match
- SHA-1 tidak match
- OAuth client ID belum dibuat

**Fix:** Ulangi langkah 1 dengan teliti

### Error: "12500" atau "12501"

Ini berarti Google Play Services tidak tersedia atau outdated:
- Update Google Play Services di device
- Pastikan device terkoneksi internet
- Coba device/emulator lain

### Error: "Network error"

- Cek koneksi internet device
- Cek firewall/proxy
- Pastikan Google APIs tidak diblokir

## 🧪 Testing

Setelah setup, test login:

1. Install APK debug:
   ```bash
   npm run android:run
   ```

2. Buka app dan klik **Login dengan Google**

3. Pilih akun Google

4. Jika berhasil, akan redirect ke dashboard

## 📱 Untuk Release Build

Saat build release APK, perlu SHA-1 dari **release keystore**:

```bash
# Get SHA-1 dari release keystore
keytool -list -v -keystore release-key.jks -alias sentra-key
```

Tambahkan SHA-1 release keystore ke Google Cloud Console sebagai **OAuth client ID** terpisah.

## 🔗 Links

- Google Cloud Console: https://console.cloud.google.com/
- Firebase Console: https://console.firebase.google.com/
- OAuth 2.0 Credentials: https://console.cloud.google.com/apis/credentials
- Google Identity API: https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com

## 💡 Tips

1. **Simpan SHA-1 fingerprint** di tempat aman untuk referensi
2. **Buat 2 OAuth client IDs**: satu untuk debug, satu untuk release
3. **Test di physical device** jika emulator bermasalah
4. **Update Google Play Services** di device sebelum testing
5. **Clear app data** jika masih error setelah fix

---

**Last Updated:** 2026-06-21
