# Google OAuth setup for EYESIGHT shop
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvFile = Join-Path $Root "shop-api\.env"
$Example = Join-Path $Root "shop-api\.env.example"
$GoogleUrl = "https://console.cloud.google.com/apis/credentials"

Write-Host ""
Write-Host "========================================"
Write-Host "  Google OAuth Setup"
Write-Host "========================================"
Write-Host ""
Write-Host "1. Open Google Cloud Console (browser will open)"
Write-Host "2. Create OAuth Client ID -> Web application"
Write-Host "3. Redirect URI (required):"
Write-Host "   http://localhost:4010/api/auth/google/callback" -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Path $EnvFile)) {
  Copy-Item $Example $EnvFile
  Write-Host "[OK] Created shop-api\.env"
}

Write-Host ""
Write-Host "Paste Client ID (press Enter to skip):"
$clientId = Read-Host "GOOGLE_CLIENT_ID"

if ($clientId -and $clientId.Trim()) {
  $clientId = $clientId.Trim()
  Write-Host "Paste Client Secret:"
  $clientSecret = Read-Host "GOOGLE_CLIENT_SECRET"

  $lines = Get-Content $EnvFile -Encoding UTF8
  $newLines = foreach ($line in $lines) {
    if ($line -match '^\s*GOOGLE_CLIENT_ID=') {
      "GOOGLE_CLIENT_ID=$clientId"
    } elseif ($clientSecret -and $line -match '^\s*GOOGLE_CLIENT_SECRET=') {
      "GOOGLE_CLIENT_SECRET=$($clientSecret.Trim())"
    } else {
      $line
    }
  }
  Set-Content -Path $EnvFile -Value $newLines -Encoding UTF8
  Write-Host ""
  Write-Host "[OK] Saved shop-api\.env" -ForegroundColor Green
  Write-Host "     Restart with start-shop.bat" -ForegroundColor Yellow
} else {
  Write-Host ""
  Write-Host "Skipped. Edit shop-api\.env manually." -ForegroundColor Yellow
}

Write-Host ""
Start-Process $GoogleUrl
