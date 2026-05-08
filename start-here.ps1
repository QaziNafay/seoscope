<#:
.SYNOPSIS
    Step 1 on the new PC — installs VS Code, then shows next steps.
#>

$ErrorActionPreference = "Stop"
$userName = [Environment]::UserName
$desktop = [Environment]::GetFolderPath("Desktop")

Write-Host "================================================" -ForegroundColor Magenta
Write-Host "  Welcome to the new PC, $userName!" -ForegroundColor Magenta
Write-Host "  This script will install VS Code first." -ForegroundColor Magenta
Write-Host "================================================" -ForegroundColor Magenta
Write-Host ""

# ─── Check winget ───────────────────────────────────────────────────────────
if (-not (Get-Command "winget" -ErrorAction SilentlyContinue)) {
    Write-Host "[!] winget not found. Install the App Installer from the Microsoft Store first." -ForegroundColor Red
    Write-Host "    https://www.microsoft.com/p/app-installer/9nblggh4nns1" -ForegroundColor Red
    pause
    exit
}

# ─── Install VS Code ────────────────────────────────────────────────────────
if (Get-Command "code" -ErrorAction SilentlyContinue) {
    Write-Host "[✓] VS Code already installed" -ForegroundColor Green
} else {
    Write-Host "[+] Installing VS Code via winget..." -ForegroundColor Yellow
    winget install --id Microsoft.VisualStudioCode --silent --accept-package-agreements
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[✓] VS Code installed" -ForegroundColor Green
    } else {
        Write-Host "[!] VS Code install may have failed. Install manually from https://code.visualstudio.com" -ForegroundColor Yellow
    }
}

# ─── Check for project folders ──────────────────────────────────────────────
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  NEXT STEPS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$seoscopeDir = "$desktop\seoscope"
$memoryDir = "$desktop\opencode-memory"

if ((Test-Path $seoscopeDir) -and (Test-Path $memoryDir)) {
    Write-Host "[✓] Both project folders found on desktop" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Run the full setup now:" -ForegroundColor Gray
    Write-Host "    powershell -ExecutionPolicy Bypass -File `"$seoscopeDir\setup-new-pc.ps1`"" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "[!] Project folders not found on desktop." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  1. Copy these two folders to your desktop:" -ForegroundColor Gray
    Write-Host "       seoscope/" -ForegroundColor Cyan
    Write-Host "       opencode-memory/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  2. Then run the setup:" -ForegroundColor Gray
    Write-Host "       powershell -ExecutionPolicy Bypass -File `"$desktop\seoscope\setup-new-pc.ps1`"" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "  What setup-new-pc.ps1 will do:" -ForegroundColor Gray
Write-Host "    - Install Git, Node.js, GitHub CLI, Vercel CLI" -ForegroundColor Gray
Write-Host "    - Install opencode (AI coding agent)" -ForegroundColor Gray
Write-Host "    - Install Ollama + qwen2.5-coder (runs on your GTX 1080)" -ForegroundColor Gray
Write-Host "    - Install VS Code extensions (opencode theme, ESLint, etc.)" -ForegroundColor Gray
Write-Host "    - Authenticate GitHub and Vercel (browser popups)" -ForegroundColor Gray
Write-Host "    - Configure opencode with local Ollama as default model" -ForegroundColor Gray
Write-Host ""

pause
