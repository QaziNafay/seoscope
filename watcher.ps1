$projectRoot = "C:\Users\Nafay\Desktop\seoscope"

if (-not (Test-Path $projectRoot)) {
    Write-Host "[watcher] Project folder not found at $projectRoot" -ForegroundColor Red
    Start-Sleep 3
    exit
}

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $projectRoot
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true
$changed = @{}
$debounceMs = 3000

Register-ObjectEvent $watcher "Changed" -Action {
    $path = $Event.SourceEventArgs.FullPath
    if ($path -match "\\node_modules\\.|\\.next\\.|package-lock\.json") { return }
    $changed[$path] = $true
    Start-Sleep -Milliseconds $debounceMs
    if ($changed.Remove($path)) {
        $ext = [System.IO.Path]::GetExtension($path)
        if ($ext -in ".ts", ".tsx", ".js", ".jsx", ".css", ".json", ".mjs") {
            $rel = $path.Substring($projectRoot.Length + 1)
            Write-Host ""
            Write-Host "[watcher] Changed: $rel" -ForegroundColor Cyan
            Push-Location $projectRoot
            $output = npm run build 2>&1
            $text = $output | Out-String
            if ($LASTEXITCODE -ne 0) {
                Write-Host "[watcher] BUILD FAILED" -ForegroundColor Red
                $text -split "`n" | Select-String -SimpleMatch "error" -CaseSensitive | ForEach-Object {
                    Write-Host "  $_" -ForegroundColor Red
                }
            } else {
                Write-Host "[watcher] Build OK" -ForegroundColor Green
            }
            Pop-Location
            Write-Host "[watcher] Watching..." -ForegroundColor DarkGray
        }
    }
} | Out-Null

Write-Host ""
Write-Host "+--------------------------------------------+" -ForegroundColor Cyan
Write-Host "|       SEOScope -- Watcher Active           |" -ForegroundColor Cyan
Write-Host "+--------------------------------------------+" -ForegroundColor Cyan
Write-Host "|  Watching: $($projectRoot.Split('\')[-1])" -ForegroundColor Cyan
Write-Host "|  Auto-builds on file changes              |" -ForegroundColor Cyan
Write-Host "|  Ctrl+C to stop                           |" -ForegroundColor Cyan
Write-Host "+--------------------------------------------+" -ForegroundColor Cyan
Write-Host ""

while ($true) { Start-Sleep -Seconds 5 }
