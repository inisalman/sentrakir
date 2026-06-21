# Android Client Build Guide - Sentra Fleet

## 📋 Prerequisites

Sebelum build Android app, pastikan sudah install:

1. **Node.js** (v18+)
2. **Java JDK 17** (untuk Gradle 8.x)
3. **Android Studio** dengan:
   - Android SDK (API 36)
   - Android SDK Build-Tools
   - Android NDK (optional, jika perlu native code)
4. **Gradle** (akan otomatis download via gradlew)

## 🚀 Quick Start

### Development Build (Debug)

```bash
# Build web assets dan sync ke Android
npm run android:build

# Jalankan di emulator/device
npm run android:run

# Atau buka di Android Studio
npm run android:open
```

### Release Build

#### 1. Setup Keystore (First Time Only)

Generate keystore untuk signing release build:

```bash
keytool -genkey -v -keystore release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias sentra-key
```

**PENTING:** 
- Simpan file `release-key.jks` di tempat yang aman
- Catat password keystore dan key
- JANGAN commit ke git!

#### 2. Konfigurasi Keystore

Copy `android/keystore.properties.example` ke `android/keystore.properties`:

```bash
cp android/keystore.properties.example android/keystore.properties
```

Edit `android/keystore.properties` dengan data keystore:

```properties
storeFile=release-key.jks
storePassword=your_keystore_password
keyAlias=sentra-key
keyPassword=your_key_password
```

#### 3. Build Release APK

```bash
npm run android:release
```

APK akan tersedia di:
```
android/app/build/outputs/apk/release/app-release.apk
```

## 📦 Build Scripts

| Command | Deskripsi |
|---------|-----------|
| `npm run android:build` | Build web + sync ke Android |
| `npm run android:open` | Buka project di Android Studio |
| `npm run android:run` | Build dan jalankan di device |
| `npm run android:release` | Build release APK dengan signing |
| `npm run android:apk` | Build debug APK |
| `npm run android:clean` | Clean build directory |

## 🔧 Manual Build via Gradle

Jika perlu build langsung dari folder android:

```bash
cd android

# Clean build
./gradlew clean

# Debug APK
./gradlew assembleDebug

# Release APK (butuh keystore.properties)
./gradlew assembleRelease

# Install ke device
./gradlew installDebug
```

## 📱 Testing

### Emulator
1. Buka Android Studio
2. Tools > Device Manager
3. Create Virtual Device (Pixel series recommended)
4. Run dengan: `npm run android:run`

### Physical Device
1. Enable Developer Options di device
2. Enable USB Debugging
3. Connect via USB
4. Run dengan: `npm run android:run`

## 🎯 Build Variants

### Debug
- Tidak minified
- Debuggable
- Tidak perlu signing
- File: `app-debug.apk`

### Release
- Minified dengan ProGuard
- Shrink resources
- Perlu keystore signing
- File: `app-release.apk`

## 🔍 Troubleshooting

### Gradle sync failed
```bash
cd android
./gradlew clean
./gradlew --stop
./gradlew build --refresh-dependencies
```

### Keystore error saat release build
- Pastikan `keystore.properties` ada di folder `android/`
- Verify path keystore file benar
- Cek password keystore dan key

### Web assets tidak muncul di app
```bash
npm run build
npx cap sync android
```

### Build lambat atau OOM
Edit `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx2048m
org.gradle.parallel=true
org.gradle.caching=true
```

## 📊 Version Management

Update versi app di `android/app/build.gradle`:

```gradle
defaultConfig {
    versionCode 2      // Increment untuk setiap release
    versionName "1.1.0" // Semantic versioning
}
```

## 🚀 CI/CD Build (GitHub Actions)

Untuk automated build, set environment variables:

```yaml
- name: Build Android
  env:
    KEYSTORE_PATH: ${{ secrets.KEYSTORE_PATH }}
    KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
    KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
    KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
  run: npm run android:release
```

## 📝 Checklist Sebelum Release

- [ ] Update versionCode dan versionName
- [ ] Test di emulator dan physical device
- [ ] Verify semua fitur berfungsi
- [ ] Check app icon dan splash screen
- [ ] Backup keystore file
- [ ] Build release APK
- [ ] Sign APK (jika belum auto-sign)
- [ ] Test APK di device sebelum publish

## 🔐 Security Notes

- **JANGAN** commit `keystore.properties` atau `*.jks` ke git
- Simpan keystore di tempat yang aman dan backup
- Gunakan environment variables di CI/CD
- Rotate keystore secara berkala

## 📞 Support

Untuk masalah build Android:
1. Check Android Studio log
2. Run `./gradlew build --stacktrace` di folder android
3. Verify Android SDK terinstall dengan benar

---

**Last Updated:** 2026-06-21
