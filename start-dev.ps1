# Smart Campus Resource Hub Dev Launcher
$nodePath = "$env:LOCALAPPDATA\Programs\node"
if (Test-Path $nodePath) {
    $env:Path = "$nodePath;$env:Path"
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " 🎓 Starting Smart Campus Resource Hub (Backend + Frontend)" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

$backendDir = Join-Path $PSScriptRoot "backend"
$frontendDir = Join-Path $PSScriptRoot "frontend"

Write-Host "-> Launching Express Backend API on http://localhost:5000..." -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath "node.exe" -ArgumentList "server.js" -WorkingDirectory $backendDir -PassThru

Start-Sleep -Seconds 2

Write-Host "-> Launching Vite React Frontend on http://localhost:5173..." -ForegroundColor Yellow
Set-Location $frontendDir
npm run dev

# Cleanup when user stops frontend
Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
