# Verdec - start lokaal (Windows)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$ForceSeed = $args -contains "-seed"

Write-Host ""
Write-Host "  Verdec - opstarten..." -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Path ".env")) {
  if (Test-Path ".env.example") {
    Copy-Item ".env.example" ".env"
    Write-Host "  .env aangemaakt vanuit .env.example" -ForegroundColor Green
  } else {
    Write-Host "  FOUT: geen .env en geen .env.example" -ForegroundColor Red
    exit 1
  }
}

# Zorg dat DATABASE_URL naar prisma/dev.db wijst (niet per ongeluk project root)
$envContent = Get-Content ".env" -Raw
if ($envContent -match 'DATABASE_URL="file:\./dev\.db"') {
  Write-Host "  DATABASE_URL ok (prisma/dev.db)" -ForegroundColor DarkGray
} elseif ($envContent -notmatch "DATABASE_URL") {
  Add-Content ".env" "`nDATABASE_URL=`"file:./dev.db`""
  Write-Host "  DATABASE_URL toegevoegd aan .env" -ForegroundColor Green
}

if (-not (Test-Path "node_modules")) {
  Write-Host "  npm install (eerste keer)..." -ForegroundColor Cyan
  npm install
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

# Eerst poorten vrijmaken (voorkomt EPERM bij prisma generate)
Get-NetTCPConnection -LocalPort 3000,3001 -ErrorAction SilentlyContinue |
  ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
  }

$dbPath = Join-Path $Root "prisma\dev.db"
$needsSeed = $ForceSeed -or (-not (Test-Path $dbPath))

Write-Host "  Database voorbereiden (schema + client)..." -ForegroundColor Cyan
npm run db:prepare
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "  FOUT bij database. Probeer handmatig:" -ForegroundColor Red
  Write-Host "    npm run db:generate" -ForegroundColor Yellow
  Write-Host "    npm run db:push" -ForegroundColor Yellow
  Write-Host "  Sluit alle andere terminals met npm run dev." -ForegroundColor Yellow
  exit $LASTEXITCODE
}

if ($needsSeed) {
  Write-Host "  Demo-data laden (seed)..." -ForegroundColor Cyan
  npm run db:seed
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  Write-Host "  Database klaar met demo-menu en admin-login" -ForegroundColor Green
} else {
  Write-Host "  Database ok: prisma\dev.db" -ForegroundColor Green
  Write-Host "  (Demo opnieuw laden: npm run go -- -seed)" -ForegroundColor DarkGray
}

if (Test-Path ".next") {
  Remove-Item -Recurse -Force ".next"
  Write-Host "  .next cache gewist" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "  Shop:  http://localhost:3000/menu" -ForegroundColor Green
Write-Host "  Admin: http://localhost:3000/admin/login" -ForegroundColor Green
Write-Host '  Login: owner@verdec.be / admin123' -ForegroundColor DarkGray
Write-Host ""
Write-Host '  Stoppen: Ctrl+C' -ForegroundColor DarkGray
Write-Host ""

npm run dev
