@echo off
echo ========================================
echo Android Logcat - Google Auth Only
echo ========================================
echo.

adb logcat -c
adb logcat -v time ^
  | findstr /I "GoogleAuth GoogleSignIn GoogleApiClient chromium cap-google"
