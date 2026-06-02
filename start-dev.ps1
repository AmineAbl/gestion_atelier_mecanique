# ==============================================================================
#  start-dev.ps1  -  AutoPro full-stack dev launcher
#
#  Starts two services in separate console windows:
#    [1]  Laravel backend   ->  http://localhost:8000  (API + CAPTCHA assets)
#    [2]  React frontend    ->  http://localhost:3000
#
#  Usage:
#    .\start-dev.ps1          start both services
#    .\start-dev.ps1 -Stop    kill both windows
# ==============================================================================

param(
    [switch]$Stop
)

$BACKEND  = Join-Path $PSScriptRoot "back_end"
$FRONTEND = Join-Path $PSScriptRoot "front_end"

$T_BACKEND  = "AutoPro - Laravel API  :8000"
$T_FRONTEND = "AutoPro - React App    :3000"

if ($Stop) {
    Write-Host ""
    Write-Host "[stop] Closing dev windows..." -ForegroundColor Yellow

    $titles = @($T_BACKEND, $T_FRONTEND)
    $procs  = Get-Process -Name "cmd","node","php" -ErrorAction SilentlyContinue

    foreach ($t in $titles) {
        $match = $procs | Where-Object { $_.MainWindowTitle -like "*$t*" }
        if ($match) {
            $match | Stop-Process -Force
            Write-Host "  Killed: $t" -ForegroundColor Red
        } else {
            Write-Host "  Not found: $t" -ForegroundColor DarkGray
        }
    }

    Write-Host ""
    Write-Host "Done." -ForegroundColor Green
    exit 0
}

function Start-DevWindow {
    param(
        [string]$Title,
        [string]$WorkDir,
        [string]$Command,
        [string]$Color = "0A"
    )
    $fullCmd = "title $Title && color $Color && cd /d `"$WorkDir`" && $Command"
    Start-Process "cmd.exe" -ArgumentList "/k", $fullCmd -WindowStyle Normal
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   AutoPro - Dev Stack Launcher                " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  [1] Laravel API  ->  http://localhost:8000   " -ForegroundColor White
Write-Host "  [2] React App    ->  http://localhost:3000   " -ForegroundColor White
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/2] Starting Laravel backend on port 8000..." -ForegroundColor Green
Start-DevWindow `
    -Title   $T_BACKEND `
    -WorkDir $BACKEND `
    -Command "php artisan serve --port=8000" `
    -Color   "0B"

Write-Host "[2/2] Starting React frontend on port 3000..." -ForegroundColor Green
Start-DevWindow `
    -Title   $T_FRONTEND `
    -WorkDir $FRONTEND `
    -Command "npm start" `
    -Color   "0D"

Write-Host ""
Write-Host "All services launched." -ForegroundColor Cyan
Write-Host ""
Write-Host "  Laravel API  ->  http://localhost:8000" -ForegroundColor White
Write-Host "  React App    ->  http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "To stop:  .\start-dev.ps1 -Stop" -ForegroundColor DarkGray
Write-Host ""
