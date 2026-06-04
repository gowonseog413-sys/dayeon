# Slack push 알림: GitHub Actions secret + dayeon-web/.env.local
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvFile = Join-Path $Root "dayeon-web\.env.local"
$SecretsUrl = "https://github.com/gowonseog413-sys/dayeon/settings/secrets/actions"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  dayeon · Slack push 알림 설정" -ForegroundColor Cyan
Write-Host "  채널: # dayeon-동생사이트" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$webhook = $env:SLACK_WEBHOOK_URL
if (-not $webhook -and (Test-Path $EnvFile)) {
  foreach ($line in Get-Content $EnvFile -Encoding UTF8) {
    if ($line -match '^\s*SLACK_WEBHOOK_URL=(.+)\s*$') {
      $webhook = $Matches[1].Trim()
      break
    }
  }
}

if (-not $webhook) {
  Write-Host "Slack 채널에 올라온 Incoming Webhook URL을 붙여 넣으세요." -ForegroundColor Yellow
  Write-Host "(예: https://hooks.slack.com/services/T.../B.../...)" -ForegroundColor DarkGray
  Write-Host ""
  $webhook = Read-Host "SLACK_WEBHOOK_URL"
  $webhook = $webhook.Trim()
}

if (-not $webhook.StartsWith("https://hooks.slack.com/")) {
  Write-Host "올바른 Slack Webhook URL이 아닙니다." -ForegroundColor Red
  exit 1
}

# .env.local 업데이트 (사이트 문의 알림과 동일 웹훅)
if (Test-Path $EnvFile) {
  $lines = Get-Content $EnvFile -Encoding UTF8
  $found = $false
  $newLines = foreach ($line in $lines) {
    if ($line -match '^\s*SLACK_WEBHOOK_URL=') {
      $found = $true
      "SLACK_WEBHOOK_URL=$webhook"
    } else {
      $line
    }
  }
  if (-not $found) {
    $newLines += "SLACK_WEBHOOK_URL=$webhook"
  }
  Set-Content -Path $EnvFile -Value $newLines -Encoding UTF8
  Write-Host "[OK] dayeon-web\.env.local 에 웹훅 저장" -ForegroundColor Green
}

Write-Host ""
Write-Host "GitHub에 Secret 등록 (이름은 정확히 SLACK_WEBHOOK_URL):" -ForegroundColor Yellow
Write-Host "  1. 브라우저에서 Secrets 페이지가 열립니다"
Write-Host "  2. New repository secret"
Write-Host "  3. Name: SLACK_WEBHOOK_URL"
Write-Host "  4. Secret: (아래 URL 전체 복사)"
Write-Host ""
Write-Host $webhook -ForegroundColor White
Write-Host ""
Write-Host "Secret 등록 후 아무 커밋을 push 하면 # dayeon-동생사이트 로 알림이 갑니다."
Write-Host ""

Start-Process $SecretsUrl
Set-Clipboard -Value $webhook
Write-Host "[OK] 웹훅 URL이 클립보드에 복사되었습니다." -ForegroundColor Green
