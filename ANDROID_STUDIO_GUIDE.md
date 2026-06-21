# Android Studio Build Guide - Sentra Fleet

## 📋 Persiapan

### 1. Install Android Studio
Download dari: https://developer.android.com/studio

### 2. Install SDK Components
Setelah Android Studio terinstall:

1. Buka **Android Studio**
2. Menu: **Tools** → **SDK Manager**
3. Di tab **SDK Platforms**, centang:
   - ✅ Android 14 (API 34) atau yang terbaru
4. Di tab **SDK Tools**, centang:
   - ✅ Android SDK Build-Tools
   - ✅ Android SDK Platform-Tools
   - ✅ Android SDK Command-line Tools
   - ✅ Android Emulator (jika ingin test di emulator)

## 🚀 Buka Project di Android Studio

### Cara 1: Via Terminal
```bash
npm run android:open
```

### Cara 2: Manual
1. Buka **Android Studio**
2. Pilih **File** → **Open**
3. Navigate ke folder: `C:\Users\MYOB\sentrakir\android`
4. Klik **OK**
5. Tunggu Gradle sync selesai (pertama kali bisa 2-5 menit)

## 🔧 Konfigurasi Awal

### Setelah Project Terbuka

1. **Tunggu Gradle Sync**
   - Lihat progress bar di bawah
   - Jika muncul "Gradle sync needed", klik **Sync Now**

2. **Set Project SDK**
   - File → Project Structure
   - Project SDK: Pilih **Android API 34** atau yang terinstall
   - Klik **OK**

3. **Build Project Pertama Kali**
   - Menu: **Build** → **Make Project** (Ctrl+F9)
   - Tunggu sampai selesai

## 📱 Jalankan di Emulator

### 1. Buat Virtual Device
1. Klik **Device Manager** icon (atau Tools → Device Manager)
2. Klik **+ Create Virtual Device**
3. Pilih device (rekomendasi: **Pixel 6** atau **Pixel 7**)
4. Klik **Next**
5. Pilih system image (Android 14 / API 34)
6. Klik **Next** → **Finish**

### 2. Run App
1. Di toolbar atas, pilih device emulator yang baru dibuat
2. Klik tombol **▶ Run** (Shift+F10)
3. Tunggu app install dan buka

## 📱 Jalankan di Physical Device

### 1. Setup Device
1. Di HP Android, buka **Settings** → **About Phone**
2. Tap **Build Number** 7x untuk enable Developer Mode
3. Kembali ke Settings → **Developer Options**
4. Enable **USB Debugging**
5. Connect HP ke komputer via USB
6. Di HP, klik **Allow** saat muncul dialog "Allow USB debugging?"

### 2. Run App
1. Di Android Studio toolbar, device HP akan muncul
2. Pilih device HP
3. Klik **▶ Run** (Shift+F10)

## 🔨 Build APK

### Debug APK (Untuk Testing)

#### Via Android Studio:
1. Menu: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Tunggu build selesai
3. Klik **locate** di notifikasi yang muncul
4. APK ada di: `android/app/build/outputs/apk/debug/`

#### Via Terminal:
```bash
npm run android:apk
```

### Release APK (Untuk Production)

#### 1. Generate Keystore (Sekali Saja)

**Via Android Studio:**
1. Menu: **Build** → **Generate Signed Bundle / APK**
2. Pilih **APK** → **Next**
3. Klik **Create new...**
4. Isi form:
   - Key store path: `C:\Users\MYOB\sentrakir\android\release-key.jks`
   - Password: [buat password kuat]
   - Confirm: [sama dengan password]
   - Alias: `sentra-key`
   - Password: [buat password]
   - Validity: `10000`
   - Certificate: isi minimal First & Last Name
5. Klik **OK**
6. **CATAT PASSWORD DI TEMPAT AMAN!**

**Via Command Line:**
```bash
keytool -genkey -v -keystore release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias sentra-key
```

#### 2. Setup keystore.properties

Buat file `android/keystore.properties`:
```properties
storeFile=release-key.jks
storePassword=your_keystore_password
keyAlias=sentra-key
keyPassword=your_key_password
```

#### 3. Build Release APK

**Via Android Studio:**
1. Menu: **Build** → **Generate Signed Bundle / APK**
2. Pilih **APK** → **Next**
3. Pilih keystore yang sudah dibuat
4. Masukkan password keystore dan key
5. Klik **Next**
6. Pilih **release**
7. Centang **V1 (Jar Signature)** dan **V2 (Full APK Signature)**
8. Klik **Finish**
9. Tunggu build selesai
10. APK ada di: `android/app/build/outputs/apk/release/`

**Via Terminal:**
```bash
npm run android:release
```

## 🎨 Update App Icon & Splash Screen

### App Icon
1. Siapkan icon 512x512 px (PNG dengan background)
2. Right-click folder **res** → **New** → **Image Asset**
3. Icon Type: **Launcher Icons**
4. Path: pilih file icon
5. Resize sesuai kebutuhan
6. Klik **Next** → **Finish**
7. Akan auto-generate semua size

### Splash Screen
File sudah ada di: `android/app/src/main/res/drawable/splash.png`

Untuk ganti:
1. Siapkan splash image (rekomendasi: 1920x1080 px)
2. Replace file `splash.png` di semua folder:
   - `drawable-port-mdpi` sampai `drawable-port-xxxhdpi`
   - `drawable-land-mdpi` sampai `drawable-land-xxxhdpi`

## 🐛 Troubleshooting

### Gradle Sync Failed
```
1. File → Invalidate Caches → Invalidate and Restart
2. Setelah restart, klik Sync Now
3. Jika masih error:
   - Close Android Studio
   - Delete folder: android/.gradle
   - Buka lagi Android Studio
```

### Build Error: SDK Location Not Found
```
1. Buka file: android/local.properties
2. Edit baris:
   sdk.dir=C\\:\\Users\\MYOB\\AppData\\Local\\Android\\Sdk
3. Save dan Sync Project
```

### App Crash Saat Buka
```
1. Buka Logcat (View → Tool Windows → Logcat)
2. Filter: Error level
3. Lihat error message
4. Common fix:
   - Clean project: Build → Clean Project
   - Rebuild: Build → Rebuild Project
   - Reinstall app: Uninstall dari device, lalu run lagi
```

### Emulator Tidak Jalan
```
1. Cek BIOS: Enable VT-x / AMD-V
2. Delete emulator, buat baru
3. Update Android Emulator di SDK Manager
```

### APK Size Terlalu Besar
```
1. Enable ProGuard di release build (sudah enabled)
2. Hapus resource yang tidak dipakai
3. Gunakan Android App Bundle (.aab) untuk Play Store
```

## 📊 Build Variants

### Switch Build Type
1. View → Tool Windows → **Build Variants**
2. Pilih module: **app**
3. Active Build Variant:
   - **debug**: Untuk development/testing
   - **release**: Untuk production (butuh signing)
4. Sync project setelah ganti

## 🔍 Debugging

### 1. Logcat
- View → Tool Windows → **Logcat**
- Filter by app: `com.sentrakir.fleet`
- Filter by level: Error/Warn/Info/Debug

### 2. Breakpoint
1. Buka file Java/Kotlin
2. Klik di kiri line number (muncul red dot)
3. Run app dalam **Debug Mode** (Ctrl+Shift+F9)
4. App akan pause di breakpoint

### 3. Database Inspector
- View → Tool Windows → **App Inspection**
- Pilih tab **Database Inspector**
- Pilih app: `com.sentrakir.fleet`

## 📦 Build untuk Play Store

### Android App Bundle (.aab)
Untuk upload ke Google Play Store:

1. **Build** → **Generate Signed Bundle / APK**
2. Pilih **Android App Bundle**
3. Pilih keystore
4. Masukkan password
5. Klik **Next**
6. Pilih **release**
7. Klik **Finish**
8. File .aab ada di: `android/app/build/outputs/bundle/release/`

### Play Store Console
1. Upload .aab ke: https://play.google.com/console
2. Isi store listing
3. Set pricing & distribution
4. Submit for review

## 🚀 Tips & Shortcuts

### Keyboard Shortcuts
- **Shift+F10**: Run app
- **Shift+F9**: Debug app
- **Ctrl+F9**: Build project
- **Ctrl+Shift+F9**: Build module
- **Alt+Shift+F10**: Select run configuration
- **Ctrl+F2**: Stop app

### Speed Up Build
1. **File** → **Settings** → **Build, Execution, Deployment**
2. **Compiler**:
   - ✅ Compile independent modules in parallel
   - ✅ Build project automatically (untuk auto-build on save)
3. **Gradle**:
   - ✅ Offline work (jika tidak perlu download dependencies)
   - Configure on demand: ✅

### Memory Settings
Jika build lambat atau OOM:
1. **Help** → **Edit Custom VM Options**
2. Tambah:
   ```
   -Xmx2048m
   -XX:MaxPermSize=512m
   ```
3. Restart Android Studio

## 📝 Checklist Sebelum Release

- [ ] Update versionCode dan versionName di `build.gradle`
- [ ] Test di emulator (minimal Android 7.0 / API 24)
- [ ] Test di physical device
- [ ] Verify semua fitur berfungsi
- [ ] Check app icon dan splash screen
- [ ] Build release APK/AAB
- [ ] Test signed APK di device
- [ ] Backup keystore file
- [ ] Prepare screenshots untuk Play Store
- [ ] Write app description

## 🎯 Next Steps

1. **Test app** di berbagai device
2. **Optimize** performance (Lighthouse score)
3. **Add analytics** (Firebase Analytics)
4. **Setup CI/CD** untuk automated builds
5. **Publish** ke Play Store

---

**Butuh bantuan?** Check `ANDROID_BUILD.md` untuk command line build.
