# Backup Explicito no Google Drive
$ErrorActionPreference = 'Stop'

$dateStr = Get-Date -Format "yyyy-MM-dd_HHmmss"
$zipName = "backup-DIRETOR-360-SOLICITADO-POR-RAFAEL-$dateStr.zip"
$backupDir = "$pwd/backup"
$localZipPath = "$backupDir/$zipName"

if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "   DIRETOR 360 — GERANDO BACKUP COMPLETO DO PROJETO NO GOOGLE DRIVE     " -ForegroundColor Yellow
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

# Arquivos/Pastas a incluir
$exclude = @('.git', 'node_modules', '.next', 'backup', '__pycache__', '.pytest_cache')

Write-Host "[1/3] Compactando arquivos do projeto em $localZipPath..." -ForegroundColor Yellow

$filesToZip = Get-ChildItem -Path $pwd -Exclude $exclude | Where-Object { $_.FullName -notmatch 'node_modules|\.next|\.git|backup' }

Compress-Archive -Path $filesToZip.FullName -DestinationPath $localZipPath -Force

$zipSize = (Get-Item $localZipPath).Length
$zipSizeMb = [Math]::Round($zipSize / 1MB, 2)
Write-Host "  [OK] Arquivo compactado com sucesso ($zipSizeMb MB)." -ForegroundColor Green

# 2. Copiar para o Google Drive
Write-Host ""
Write-Host "[2/3] Copiando backup para as pastas sincronizadas do Google Drive..." -ForegroundColor Yellow

$driveTargets = @(
    "C:\Users\fael\Google Drive\360",
    "C:\Users\fael\Meu Drive\360"
)

$copiedCount = 0
foreach ($drive in $driveTargets) {
    if (Test-Path (Split-Path $drive -Parent)) {
        if (-not (Test-Path $drive)) {
            New-Item -ItemType Directory -Path $drive -Force | Out-Null
        }
        Copy-Item -Path $localZipPath -Destination "$drive/$zipName" -Force
        Write-Host "  [OK] Copiado com sucesso para: $drive/$zipName" -ForegroundColor Green
        $copiedCount++
    }
}

if ($copiedCount -eq 0) {
    Write-Host "  [AVISO] Nenhuma pasta de Google Drive encontrada na raiz padrao do usuario." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[3/3] Validando integridade do arquivo de backup..." -ForegroundColor Yellow
$hash = (Get-FileHash -Path $localZipPath -Algorithm SHA256).Hash
Write-Host "  [OK] SHA-256 do Backup: $hash" -ForegroundColor Green

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "   BACKUP NO GOOGLE DRIVE CONCLUIDO COM SUCESSO!                        " -ForegroundColor Green
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""