@echo off
echo Building Sentra Fleet Admin APK...

:: Backup current .env.local
if exist .env.local (
  copy .env.local .env.local.backup >nul
  echo Backed up .env.local
)

:: Copy admin env
copy .env.admin .env.local >nul
echo Using .env.admin

:: Build
call npm run android:build
if %errorlevel% neq 0 (
  echo Build failed!
  if exist .env.local.backup (
    copy .env.local.backup .env.local >nul
    del .env.local.backup
  )
  exit /b %errorlevel%
)

:: Restore .env.local
if exist .env.local.backup (
  copy .env.local.backup .env.local >nul
  del .env.local.backup
  echo Restored .env.local
)

echo Admin build complete!
echo APK location: android\app\build\outputs\apk\debug\app-debug.apk
