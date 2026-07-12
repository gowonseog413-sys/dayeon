# dayeon shop - Firebase deploy (dayeon-3856e)
# dev 캐시(.next/dev) 제외 후 프로덕션 빌드만 배포 — SSR 패키지 수백 MB 수준 유지
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Project = "dayeon-3856e"
$ShopWeb = Join-Path $Root "shop-web"
$ShopApi = Join-Path $Root "shop-api"
$NextDir = Join-Path $ShopWeb ".next"
$FirebaseDir = Join-Path $Root ".firebase"
$MaxNextBundleGb = 1.5

function Get-FolderSizeGb([string]$Path) {
  if (-not (Test-Path $Path)) { return 0 }
  $bytes = (Get-ChildItem -LiteralPath $Path -Recurse -Force -ErrorAction SilentlyContinue |
    Measure-Object -Property Length -Sum).Sum
  if (-not $bytes) { return 0 }
  return [math]::Round($bytes / 1GB, 2)
}

function Write-Step([string]$Message) {
  Write-Host $Message -ForegroundColor Cyan
}

Set-Location $Root

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  dayeon shop Firebase deploy" -ForegroundColor Cyan
Write-Host "  project: $Project" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$sites = firebase hosting:sites:list --project $Project 2>&1 | Out-String
if ($sites -notmatch "dayeon-shop") {
  Write-Step "[1/9] Hosting site dayeon-shop 생성..."
  firebase hosting:sites:create dayeon-shop --project $Project
} else {
  Write-Step "[1/9] Hosting site dayeon-shop OK"
}

if (-not (Test-Path (Join-Path $ShopApi "node_modules"))) {
  Write-Step "[2/9] npm install shop-api..."
  npm install --prefix $ShopApi
} else {
  Write-Step "[2/9] shop-api node_modules OK"
}

if (-not (Test-Path (Join-Path $ShopWeb "node_modules"))) {
  Write-Step "[3/9] npm install shop-web..."
  npm install --prefix $ShopWeb
} else {
  Write-Step "[3/9] shop-web node_modules OK"
}

Write-Step "[4/9] 개발 캐시 정리 (.next/dev 제거)..."
$beforeNextGb = Get-FolderSizeGb $NextDir
if (Test-Path $NextDir) {
  $devCache = Join-Path $NextDir "dev"
  if (Test-Path $devCache) {
    Remove-Item -LiteralPath $devCache -Recurse -Force
    Write-Host "    removed shop-web\.next\dev (was bloating SSR deploy)" -ForegroundColor DarkGray
  }
  Remove-Item -LiteralPath $NextDir -Recurse -Force
  Write-Host "    removed shop-web\.next ($beforeNextGb GB) for clean production build" -ForegroundColor DarkGray
}
if (Test-Path $FirebaseDir) {
  Remove-Item -LiteralPath $FirebaseDir -Recurse -Force
  Write-Host "    removed .firebase cache" -ForegroundColor DarkGray
}

Write-Step "[5/9] 프로덕션 env + Next.js build..."
@(
  "NEXT_PUBLIC_API_URL=",
  "API_SERVER_URL=https://dayeon-shop.web.app"
) | Set-Content -Encoding utf8 (Join-Path $ShopWeb ".env.production.local")

firebase experiments:enable webframeworks 2>$null | Out-Null

Push-Location $ShopWeb
try {
  npm run build
} finally {
  Pop-Location
}

$afterNextGb = Get-FolderSizeGb $NextDir
$devLeft = Test-Path (Join-Path $NextDir "dev")
Write-Host "    .next size after build: $afterNextGb GB" -ForegroundColor DarkGray
if ($devLeft) {
  Write-Host "    WARN: .next\dev still exists — close 'npm run dev' and re-run deploy." -ForegroundColor Yellow
}
if ($afterNextGb -gt $MaxNextBundleGb) {
  Write-Host "    WARN: .next is larger than ${MaxNextBundleGb}GB. Deploy may be slow." -ForegroundColor Yellow
}

Write-Step "[6/9] shop-api (Cloud Functions) deploy... ETA ~2-5 min"
firebase deploy --only "functions:shop-api:shopApi" --force --project $Project

Write-Step "[7/9] shop-web (Hosting + SSR) deploy... ETA ~5-15 min"
Write-Host "    (dev cache excluded — package should be ~hundreds of MB, not GB)" -ForegroundColor DarkGray
Push-Location $ShopWeb
try {
  firebase deploy --only hosting:shop --force --project $Project
} finally {
  Pop-Location
}

if (Test-Path (Join-Path $Root "fix-ssr-public.ps1")) {
  Write-Step "[8/9] SSR public access check..."
  & (Join-Path $Root "fix-ssr-public.ps1") 2>$null | Out-Host
} else {
  Write-Step "[8/9] fix-ssr-public.ps1 skip"
}

Write-Step "[9/9] Done"
Write-Host ""
Write-Host "Deploy complete!" -ForegroundColor Green
Write-Host "  https://dayeon-shop.web.app" -ForegroundColor Yellow
Write-Host "  https://dayeon-shop.web.app/erp" -ForegroundColor Yellow
