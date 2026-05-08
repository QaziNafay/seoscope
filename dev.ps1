$desktop = [Environment]::GetFolderPath("Desktop")
$memoryDir = "$desktop\opencode-memory"
$projectDir = "$desktop\seoscope"

Write-Host "================================================" -ForegroundColor Magenta
Write-Host "     SEOScope -- Dev Environment" -ForegroundColor Magenta
Write-Host "================================================" -ForegroundColor Magenta

# ─── Sync from GitHub ───────────────────────────────────────────────────────
Write-Host ""
Write-Host "[+] Syncing from GitHub..." -ForegroundColor Yellow

function Sync-Repo($path, $name) {
    if (-not (Test-Path $path)) {
        Write-Host ("    $name: folder not found, skipping") -ForegroundColor Yellow
        return
    }
    Push-Location $path
    if (-not (Test-Path ".git")) {
        Write-Host ("    $name: not a git repo, skipping") -ForegroundColor Yellow
        Pop-Location
        return
    }
    $result = git pull 2>&1
    if ($LASTEXITCODE -eq 0) {
        $summary = ($result | Where-Object { $_ -match "Already up|Fast-forward|Updating|From " }) -join "; "
        if (-not $summary) { $summary = "up to date" }
        Write-Host ("    $name: $summary") -ForegroundColor Gray
    } else {
        Write-Host "    $name: pull failed (check network)" -ForegroundColor Red
    }
    Pop-Location
}

Sync-Repo $projectDir "seoscope"
Sync-Repo $memoryDir "opencode-memory"

# ─── Print memory summary ───────────────────────────────────────────────────
Write-Host ""
Write-Host "[+] Memory files loaded:" -ForegroundColor Yellow
Get-ChildItem $memoryDir -Filter "*.md" | ForEach-Object {
    $content = Get-Content -Raw $_.FullName
    $lineCount = $content.Split("`n").Count
    Write-Host ("    " + $_.Name + " (" + $lineCount + " lines)") -ForegroundColor Gray
}

# ─── Launch watcher ─────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[+] Launching watcher in new window..." -ForegroundColor Yellow
$watcherPath = $projectDir + "\watcher.ps1"
Start-Process powershell -ArgumentList "-NoExit -ExecutionPolicy Bypass -File `"$watcherPath`""

if (Test-Path ($projectDir + "\.next")) {
    $builtAt = (Get-Item ($projectDir + "\.next")).LastWriteTime
    Write-Host ("[+] Last build: " + $builtAt.ToString("HH:mm:ss")) -ForegroundColor Green
}

Write-Host ""
Write-Host "[+] Ready. Paste the starter prompt in opencode to begin."
Write-Host ""
