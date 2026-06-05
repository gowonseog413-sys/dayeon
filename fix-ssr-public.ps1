# SSR Cloud Run 공개 접근 (403 Forbidden 해결)
# Firebase Hosting이 만든 함수: ssrdayeonshop
$Project = "dayeon-3856e"
$Region = "asia-northeast3"
$Service = "ssrdayeonshop"

$gcloud = @(
  "${env:ProgramFiles}\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd",
  "${env:ProgramFiles(x86)}\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd",
  "gcloud"
) | Where-Object { Test-Path $_ -ErrorAction SilentlyContinue } | Select-Object -First 1

if (-not $gcloud) {
  Write-Host "gcloud CLI가 없습니다. 아래를 브라우저에서 직접 해주세요:" -ForegroundColor Yellow
  Write-Host "https://console.cloud.google.com/run/detail/$Region/$Service/permissions?project=$Project"
  Write-Host "→ 권한 추가 → 주 구성원: allUsers → 역할: Cloud Run 호출자 (Cloud Run Invoker)"
  exit 1
}

& $gcloud run services add-iam-policy-binding $Service `
  --region=$Region `
  --project=$Project `
  --member="allUsers" `
  --role="roles/run.invoker"

Write-Host "완료. https://dayeon-shop.web.app 새로고침" -ForegroundColor Green
