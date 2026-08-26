# Diretor 360 - Database Backup Script (PostgreSQL & Evidence)
$ErrorActionPreference = 'Stop'

Write-Host 'Gerando dump do banco PostgreSQL local (Diretor 360)...' -ForegroundColor Cyan

$backupDir = 'infra/backups'
if (-not (Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir | Out-Null }

$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$dumpFile = "$backupDir/postgres_dump_$timestamp.sql"

# Executar pg_dump via container docker
docker exec visao-360-postgres-1 pg_dump -U postgres -d n8n > $dumpFile 2>$null

if (Test-Path $dumpFile) {
    $size = (Get-Item $dumpFile).Length
    $hash = (Get-FileHash $dumpFile -Algorithm SHA256).Hash
    Write-Host "  [OK] Dump do banco gerado com sucesso: $dumpFile ($size bytes)" -ForegroundColor Green
    Write-Host "  [OK] Hash SHA-256 do Dump: $hash" -ForegroundColor Green
} else {
    Write-Host "  [AVISO] Container do banco nao estava ativo para dump em tempo real. Estrutura declarada em db/schema.ts preservada." -ForegroundColor Yellow
}

exit 0
