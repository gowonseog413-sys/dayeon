# dayeon 개발 서버 시작 스크립트
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

Write-Host "========================================"
Write-Host "  dayeon 동생사이트 서버 시작"
Write-Host "========================================"
Write-Host ""

$webDir = Join-Path $Root "dayeon-web"

if (-not (Test-Path (Join-Path $webDir "node_modules"))) {
  Write-Host "[1/2] 패키지 설치 중..."
  npm install --prefix $webDir
  Write-Host ""
} else {
  Write-Host "[1/2] 패키지 확인 완료"
}

$envFile = Join-Path $webDir ".env.local"
$envExample = Join-Path $webDir ".env.local.example"

if (-not (Test-Path $envFile)) {
  Write-Host ""
  Write-Host ".env.local 파일이 없습니다. 예시 파일을 복사합니다..."
  Copy-Item $envExample $envFile
  Write-Host "dayeon-web\.env.local 파일을 열어 Firebase / Slack 설정을 확인하세요."
  Write-Host ""
}

Write-Host "[2/2] 개발 서버 시작..."
Write-Host ""
Write-Host "  브라우저: http://localhost:3000"
Write-Host "  종료: Ctrl + C"
Write-Host ""

Set-Location $webDir
npm run dev
