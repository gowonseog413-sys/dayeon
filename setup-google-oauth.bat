@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Google OAuth setup starting...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-google-oauth.ps1"
if errorlevel 1 (
  echo.
  echo  [ERROR] Script failed. See message above.
  echo.
)
pause
