<#:
.SYNOPSIS
    SEOScope + opencode — Full environment setup for Psyche's new PC
.DESCRIPTION
    Installs everything needed: Node.js, Git, GitHub CLI, Vercel CLI, opencode,
    Ollama (GPU-accelerated via GTX 1080), VS Code extensions, and restores projects.
#>

$ErrorActionPreference = "Stop"
$userName = [Environment]::UserName
$desktop = [Environment]::GetFolderPath("Desktop")
$seoscopeDir = "$desktop\seoscope"
$memoryDir = "$desktop\opencode-memory"

Write-Host "================================================" -ForegroundColor Magenta
Write-Host "  SEOScope + opencode — Full Setup" -ForegroundColor Magenta
Write-Host "  Target: $env:COMPUTERNAME" -ForegroundColor Magenta
Write-Host "  User:   $userName (GTX 1080 detected)" -ForegroundColor Magenta
Write-Host "================================================" -ForegroundColor Magenta
Write-Host ""

# ─── Step 1: Install winget packages ────────────────────────────────────────
function Install-IfMissing {
    param($Name, $WingetId, $CheckCmd)
    if (Get-Command $CheckCmd -ErrorAction SilentlyContinue) {
        Write-Host "[✓] $Name already installed" -ForegroundColor Green
        return
    }
    Write-Host "[+] Installing $Name ..." -ForegroundColor Yellow
    winget install --id $WingetId --silent --accept-package-agreements 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[!] $Name install had issues, may need manual retry" -ForegroundColor Yellow
    }
}

# Prerequisites
Install-IfMissing -Name "Git"           -WingetId "Git.Git"              -CheckCmd "git"
Install-IfMissing -Name "Node.js"       -WingetId "OpenJS.NodeJS.LTS"   -CheckCmd "node"

# ─── Step 2: Install CLI tools via npm ──────────────────────────────────────
$npmGlobal = @(
    @{ Name = "GitHub CLI";     Pkg = "gh";            Check = "gh" },
    @{ Name = "Vercel CLI";     Pkg = "vercel";         Check = "vercel" },
    @{ Name = "opencode";       Pkg = "opencode-ai";    Check = "opencode" }
)

foreach ($tool in $npmGlobal) {
    if (Get-Command $tool.Check -ErrorAction SilentlyContinue) {
        Write-Host "[✓] $($tool.Name) already installed" -ForegroundColor Green
    } else {
        Write-Host "[+] Installing $($tool.Name) ..." -ForegroundColor Yellow
        npm install -g $tool.Pkg 2>$null
    }
}

# ─── Step 3: Restore project folders ────────────────────────────────────────
Write-Host ""
Write-Host "[+] Checking project folders..." -ForegroundColor Yellow

if (-not (Test-Path $seoscopeDir)) {
    Write-Host "    WARNING: $seoscopeDir not found." -ForegroundColor Red
    Write-Host "    Copy the seoscope folder to $desktop before running this script." -ForegroundColor Red
} else {
    Write-Host "[✓] seoscope found" -ForegroundColor Green
    Push-Location $seoscopeDir
    if (-not (Test-Path "node_modules")) {
        Write-Host "[+] Installing npm dependencies..." -ForegroundColor Yellow
        npm install
    } else {
        Write-Host "[✓] node_modules present" -ForegroundColor Green
    }
    Pop-Location
}

if (-not (Test-Path $memoryDir)) {
    Write-Host "    WARNING: $memoryDir not found." -ForegroundColor Red
    Write-Host "    Copy the opencode-memory folder to $desktop before running this script." -ForegroundColor Red
} else {
    Write-Host "[✓] opencode-memory found" -ForegroundColor Green
}

# ─── Step 4: Ollama (local LLM on GTX 1080) ─────────────────────────────────
Write-Host ""
Write-Host "[+] Setting up Ollama for local GPU inference (GTX 1080)..." -ForegroundColor Yellow

if (Get-Command "ollama" -ErrorAction SilentlyContinue) {
    Write-Host "[✓] Ollama already installed" -ForegroundColor Green
} else {
    Write-Host "    Downloading Ollama..." -ForegroundColor Yellow
    $ollamaUrl = "https://ollama.com/download/OllamaSetup.exe"
    $ollamaInstaller = "$env:TEMP\OllamaSetup.exe"
    try {
        Invoke-WebRequest -Uri $ollamaUrl -OutFile $ollamaInstaller -UseBasicParsing
        Start-Process -Wait -FilePath $ollamaInstaller -ArgumentList "/S"
        Write-Host "[✓] Ollama installed" -ForegroundColor Green
    } catch {
        Write-Host "[!] Ollama download failed. Install manually from https://ollama.com" -ForegroundColor Yellow
    }
}

# ─── Step 5: VS Code extensions ─────────────────────────────────────────────
Write-Host ""
Write-Host "[+] Installing VS Code extensions..." -ForegroundColor Yellow

$codeExtensions = @(
    "anomaly.opencode-theme",
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
)

if (Get-Command "code" -ErrorAction SilentlyContinue) {
    foreach ($ext in $codeExtensions) {
        code --install-extension $ext --force 2>$null
        Write-Host "    Installed: $ext" -ForegroundColor Gray
    }
} else {
    Write-Host "    VS Code CLI not found — install VS Code first, then run code extensions manually" -ForegroundColor Yellow
}

# ─── Step 6: opencode config ────────────────────────────────────────────────
Write-Host ""
Write-Host "[+] Writing opencode config..." -ForegroundColor Yellow

$opencodeConfigDir = "$env:USERPROFILE\.config\opencode"
if (-not (Test-Path $opencodeConfigDir)) {
    New-Item -ItemType Directory -Path $opencodeConfigDir -Force | Out-Null
}

$opencodeConfig = @"
{
  "$$schema": "https://opencode.ai/config.json",
  "model": "ollama/qwen2.5-coder:7b",
  "provider": {
    "ollama": {
      "baseUrl": "http://127.0.0.1:11434/api"
    }
  },
  "theme": {
    "name": "anomaly/opencode-theme"
  }
}
"@

$opencodeConfig | Out-File -FilePath "$opencodeConfigDir\opencode.json" -Encoding utf8
Write-Host "[✓] opencode config written (default model: qwen2.5-coder via Ollama)" -ForegroundColor Green

# ─── Step 7: Pull local model ───────────────────────────────────────────────
Write-Host ""
Write-Host "[+] Pulling qwen2.5-coder model for local inference..." -ForegroundColor Yellow
Write-Host "    (This will download ~4.7 GB — runs on GTX 1080 at ~30 tok/s)" -ForegroundColor Gray

if (Get-Command "ollama" -ErrorAction SilentlyContinue) {
    try {
        ollama pull qwen2.5-coder:7b 2>$null
        Write-Host "[✓] Model ready" -ForegroundColor Green
    } catch {
        Write-Host "[!] Model pull failed. Run 'ollama pull qwen2.5-coder:7b' manually after Ollama starts." -ForegroundColor Yellow
    }
} else {
    Write-Host "[!] Skipped — Ollama not installed" -ForegroundColor Yellow
}

# ─── Step 8: Git + GitHub setup ─────────────────────────────────────────────
Write-Host ""
Write-Host "[+] Setting up Git..." -ForegroundColor Yellow
git config --global user.name "QaziNafay"
git config --global user.email "qazinafayawan@gmail.com"

if (Get-Command "gh" -ErrorAction SilentlyContinue) {
    Write-Host ""
    Write-Host "===== GitHub Authentication =====" -ForegroundColor Cyan
    Write-Host "A browser window will open. Log in to GitHub." -ForegroundColor Cyan
    Write-Host "Press Enter when ready..." -ForegroundColor Gray
    gh auth login --web -h github.com
} else {
    Write-Host "[!] gh CLI not found — install GitHub CLI and run 'gh auth login'" -ForegroundColor Yellow
}

# ─── Step 9: Vercel auth ────────────────────────────────────────────────────
if (Get-Command "vercel" -ErrorAction SilentlyContinue) {
    Write-Host ""
    Write-Host "===== Vercel Authentication =====" -ForegroundColor Cyan
    Write-Host "A browser window will open. Log in to Vercel." -ForegroundColor Cyan
    Write-Host "Press Enter when ready..." -ForegroundColor Gray
    vercel login
}

# ─── Done ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "================================================" -ForegroundColor Magenta
Write-Host "  Setup Complete!" -ForegroundColor Magenta
Write-Host "================================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "  What's next:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Start Ollama (starts as a background service)" -ForegroundColor Gray
Write-Host "  2. Open VS Code in the seoscope folder:" -ForegroundColor Gray
Write-Host "       code $desktop\seoscope" -ForegroundColor Gray
Write-Host "  3. Open a terminal in VS Code and run:" -ForegroundColor Gray
Write-Host "       opencode" -ForegroundColor Gray
Write-Host "  4. Run the dev launcher:" -ForegroundColor Gray
Write-Host "       $desktop\seoscope\dev.ps1" -ForegroundColor Gray
Write-Host "  5. Paste the starter prompt and go!" -ForegroundColor Gray
Write-Host ""
Write-Host "  Your GTX 1080 will run qwen2.5-coder:7b locally via Ollama" -ForegroundColor Green
Write-Host "  No API keys needed for local inference." -ForegroundColor Green
Write-Host "  Switch models anytime with /models inside opencode." -ForegroundColor Green
Write-Host ""
Write-Host "================================================" -ForegroundColor Magenta
