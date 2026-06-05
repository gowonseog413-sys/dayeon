@echo off
chcp 65001 >nul
setlocal EnableExtensions
set "ROOT=%~dp0"

echo ============================================
echo   dayeon (단일 창)
echo   3600 / 3601 / 3605
echo ============================================
echo.

npx --yes concurrently ^
  --names "ShopAPI,ShopWEB,DayeonWEB" ^
  --prefix-colors "yellow,cyan,green" ^
  "cd /d \"%ROOT%shop-api\" && npm run dev" ^
  "cd /d \"%ROOT%shop-web\" && npm run dev" ^
  "cd /d \"%ROOT%dayeon-web\" && npm run dev"

pause
endlocal
