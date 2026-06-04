# Eyesight 쇼핑몰 초안 — API + Web 동시 실행
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EYESIGHT 쇼핑몰 1차 초안" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$apiDir = Join-Path $Root "shop-api"
$webDir = Join-Path $Root "shop-web"

if (-not (Test-Path (Join-Path $apiDir "node_modules"))) {
  Write-Host "[1/4] shop-api 패키지 설치..."
  npm install --prefix $apiDir
}

if (-not (Test-Path (Join-Path $webDir "node_modules"))) {
  Write-Host "[2/4] shop-web 패키지 설치..."
  npm install --prefix $webDir
}

$dbFile = Join-Path $apiDir "data\db.json"
if (-not (Test-Path $dbFile)) {
  Write-Host "[3/4] DB 시드..."
  npm run seed --prefix $apiDir
} else {
  Write-Host "[3/4] DB 확인 완료"
}

$envExample = Join-Path $webDir ".env.local.example"
$envFile = Join-Path $webDir ".env.local"
if (-not (Test-Path $envFile)) {
  Copy-Item $envExample $envFile
}

Write-Host "[4/4] 서버 시작..."
Write-Host ""
Write-Host "  쇼핑몰:  http://localhost:3001" -ForegroundColor Green
Write-Host "  API:     http://localhost:4000" -ForegroundColor Green
Write-Host "  ERP:     http://localhost:3001/erp (admin@eyesight.local / admin1234)" -ForegroundColor Yellow
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$apiDir'; npm run dev"
Start-Sleep -Seconds 2
Set-Location $webDir
npm run dev
