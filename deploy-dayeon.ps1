# dayeon homepage (dayeon-web) - Firebase deploy
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Project = "dayeon-3856e"
$WebDir = Join-Path $Root "dayeon-web"
$FirebaseBundle = Join-Path $Root ".firebase\dayeon-3856e\functions"

function Write-Step([string]$Message) {
  Write-Host $Message -ForegroundColor Cyan
}

function Invoke-Firebase([string[]]$FirebaseArgs) {
  & firebase @FirebaseArgs 2>&1 | ForEach-Object {
    Write-Host $_
    $_
  }
  if ($LASTEXITCODE -ne 0) { throw "firebase $($FirebaseArgs -join ' ') failed ($LASTEXITCODE)" }
}

function Invoke-FirebaseSoft([string[]]$FirebaseArgs) {
  & firebase @FirebaseArgs 2>&1 | ForEach-Object { Write-Host $_ }
  return $LASTEXITCODE
}

function Sync-SsrLockFile([string]$BundleDir) {
  $pkg = Join-Path $BundleDir "package.json"
  if (-not (Test-Path $pkg)) { return }

  $json = Get-Content $pkg -Raw | ConvertFrom-Json
  if (-not $json.dependencies) {
    $json | Add-Member -NotePropertyName dependencies -NotePropertyValue ([ordered]@{})
  }
  $deps = [ordered]@{}
  foreach ($prop in $json.dependencies.PSObject.Properties) {
    $deps[$prop.Name] = $prop.Value
  }
  $deps["@emnapi/runtime"] = "1.11.2"
  $deps["@types/markdown-it"] = "14.1.2"
  $deps["acorn"] = "8.17.0"
  $deps["markdown-it"] = "14.3.0"
  $json.dependencies = $deps
  $json | ConvertTo-Json -Depth 20 | Set-Content -Encoding utf8 $pkg

  Push-Location $BundleDir
  try {
    npm install --package-lock-only @emnapi/runtime@1.11.2 @types/markdown-it@14.1.2 acorn@8.17.0 markdown-it@14.3.0
    npm install --package-lock-only
  } finally {
    Pop-Location
  }
}

Set-Location $Root

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  dayeon homepage Firebase deploy" -ForegroundColor Cyan
Write-Host "  project: $Project" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if (-not (Test-Path (Join-Path $WebDir "node_modules"))) {
  Write-Step "[1/6] npm install dayeon-web..."
  npm install --prefix $WebDir
} else {
  Write-Step "[1/6] dayeon-web node_modules OK"
}

Write-Step "[2/6] clean .firebase cache..."
if (Test-Path (Join-Path $Root ".firebase")) {
  Remove-Item -LiteralPath (Join-Path $Root ".firebase") -Recurse -Force
}

$nextDir = Join-Path $WebDir ".next"
if (Test-Path (Join-Path $nextDir "dev")) {
  Remove-Item -LiteralPath (Join-Path $nextDir "dev") -Recurse -Force
}

Write-Step "[3/6] Next.js production build..."
Push-Location $WebDir
try {
  npm run build
} finally {
  Pop-Location
}

firebase experiments:enable webframeworks 2>$null | Out-Null

Write-Step "[4/6] Firebase bundle + hosting upload..."
$prevEap = $ErrorActionPreference
$ErrorActionPreference = "Continue"
$deployExit = Invoke-FirebaseSoft @("deploy", "--only", "hosting:main", "--project", $Project)
$ErrorActionPreference = $prevEap

if (Test-Path $FirebaseBundle) {
  Write-Step "[5/6] SSR lock file sync..."
  Sync-SsrLockFile $FirebaseBundle
  Write-Step "[6/6] SSR function deploy..."
  $ErrorActionPreference = "Continue"
  Invoke-Firebase @("deploy", "--only", "functions:firebase-frameworks-dayeon-3856e:ssrdayeon3856e", "--force", "--project", $Project)
  $ErrorActionPreference = $prevEap
} elseif ($deployExit -ne 0) {
  Write-Host "Deploy failed before SSR bundle was created." -ForegroundColor Red
  exit $deployExit
}

$gcloud = @(
  "${env:ProgramFiles}\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd",
  "${env:ProgramFiles(x86)}\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd",
  "gcloud"
) | Where-Object { Test-Path $_ -ErrorAction SilentlyContinue } | Select-Object -First 1

if ($gcloud) {
  & $gcloud run services add-iam-policy-binding ssrdayeon3856e `
    --region=asia-northeast3 `
    --project=$Project `
    --member="allUsers" `
    --role="roles/run.invoker" 2>$null | Out-Null
}

Write-Host ""
Write-Host "Deploy complete!" -ForegroundColor Green
Write-Host "  https://dayeon-3856e.web.app" -ForegroundColor Yellow
Write-Host "  https://dayeonlens.com" -ForegroundColor Yellow
