@echo off
echo ========================================
echo Android Logcat - Sentra Fleet Debug
echo ========================================
echo.
echo Pastikan HP terkoneksi via USB dan USB Debugging enabled
echo.

adb logcat -c
echo Clearing old logs...
echo.

echo Filtering for Google Auth, Supabase, and app logs...
echo Press Ctrl+C to stop
echo.

adb logcat -v time ^
  | findstr /I "chromium CapGoogleAuth GoogleAuth supabase AuthError capacitor Console"
