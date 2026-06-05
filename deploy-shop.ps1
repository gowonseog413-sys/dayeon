# dayeon shop - Firebase deploy (dayeon-3856e)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  dayeon shop Firebase deploy" -ForegroundColor Cyan
Write-Host "  project: dayeon-3856e" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$sites = firebase hosting:sites:list --project dayeon-3856e 2>&1 | Out-String
if ($sites -notmatch "dayeon-shop") {
  Write-Host "[1] Creating hosting site dayeon-shop..."
  firebase hosting:sites:create dayeon-shop --project dayeon-3856e
} else {
  Write-Host "[1] Hosting site dayeon-shop OK"
}

if (-not (Test-Path "shop-api\node_modules")) {
  Write-Host "[2] npm install shop-api..."
  npm install --prefix shop-api
}
if (-not (Test-Path "shop-web\node_modules")) {
  Write-Host "[3] npm install shop-web..."
  npm install --prefix shop-web
}

Write-Host "[4] Enable webframeworks experiment..."
firebase experiments:enable webframeworks 2>$null | Out-Host

Write-Host "[5] Write .env.production.local..."
@(
  "NEXT_PUBLIC_API_URL=",
  "API_SERVER_URL=https://dayeon-shop.web.app"
) | Set-Content -Encoding utf8 (Join-Path $Root "shop-web\.env.production.local")

Write-Host "[6] Firebase deploy hosting:shop..."
Write-Host "    ETA 5-15 min" -ForegroundColor Yellow
if (Test-Path (Join-Path $Root ".firebase")) {
  Remove-Item -Recurse -Force (Join-Path $Root ".firebase")
}
Set-Location (Join-Path $Root "shop-web")
firebase deploy --only hosting:shop --force --project dayeon-3856e
Set-Location $Root

if (Test-Path (Join-Path $Root "fix-ssr-public.ps1")) {
  Write-Host "[7] SSR public access check..."
  & (Join-Path $Root "fix-ssr-public.ps1") 2>$null | Out-Host
}

Write-Host ""
Write-Host "Deploy done!" -ForegroundColor Green
Write-Host "  https://dayeon-shop.web.app" -ForegroundColor Yellow
Write-Host "  https://dayeon-shop.web.app/erp" -ForegroundColor Yellow
