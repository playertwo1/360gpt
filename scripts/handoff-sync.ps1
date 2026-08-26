# Script de Handoff e Sincronizacao de Sessao (Antigravity <-> Codex)
$ErrorActionPreference = 'Stop'

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "   DIRETOR 360 - SINCRONIZACAO DE SESSAO E HANDOFF MULTI-IA            " -ForegroundColor Green
Write-Host "   Autoridade: Rafael (fael@live.de) | Versao 3.1.0-confianca          " -ForegroundColor White
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Executar bateria de testes
Write-Host "[1/5] Executando bateria geral de testes automatizados..." -ForegroundColor Yellow
& powershell -File scripts/run-all-hybrid-tests.ps1
if ($LASTEXITCODE -ne 0) {
    throw "Bateria de testes falhou! Corrija os erros antes do handoff."
}
Write-Host "  [OK] Testes 100% aprovados." -ForegroundColor Green

# 2. Gerar backup compactado
Write-Host ""
Write-Host "[2/5] Gerando backup compactado e sincronizando no Google Drive..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$backupName = "backup-$timestamp-handoff-sync.zip"
$gdriveFolders = @('C:\Users\fael\Google Drive\360', 'C:\Users\fael\Meu Drive\360')

$itemsToZip = @('AGENTS.md', 'README.md', 'status.md', 'implementacao.md', 'QUICKSTART.md', 'CODEX_HANDOFF.md', 'ROADMAP.md', 'checklist.md', 'SESSION_STATE.json', 'iniciar-diretor-360.ps1', 'iniciar-diretor-360.bat', 'parar-diretor-360.ps1', 'parar-diretor-360.bat', 'package.json', 'tsconfig.json', 'vite.config.ts', 'next.config.ts', 'drizzle.config.ts', 'compose.n8n.yaml', 'app', 'compliance', 'contracts', 'db', 'docs', 'drizzle', 'evidence', 'infra', 'n8n', 'policies', 'public', 'registries', 'release', 'scripts', 'test-data')

Compress-Archive -Path $itemsToZip -DestinationPath $backupName -Force -CompressionLevel Optimal
Write-Host "  [OK] Backup local criado: $backupName" -ForegroundColor Green

foreach ($folder in $gdriveFolders) {
    if (Test-Path $folder) {
        Copy-Item $backupName -Destination $folder -Force
        Write-Host "  [OK] Backup copiado para: $folder" -ForegroundColor Green
    }
}

# 3. Commit e Push no Git
Write-Host ""
Write-Host "[3/5] Atualizando repositorio GitHub..." -ForegroundColor Yellow
git add -A
$status = git status --porcelain
if ($status) {
    git commit -m "chore(handoff): sincronizacao de sessao multi-IA ($timestamp)"
    git push origin main
    Write-Host "  [OK] Alteracoes enviadas para o GitHub." -ForegroundColor Green
} else {
    Write-Host "  [INFO] Nenhuma alteracao pendente para commit." -ForegroundColor White
}

# 4. Sincronizar Workspace Secundario
Write-Host ""
Write-Host "[4/5] Sincronizando workspace secundario (Downloads/A)..." -ForegroundColor Yellow
$workspaceA = "c:\Users\fael\Downloads\A"
if (Test-Path $workspaceA) {
    Push-Location $workspaceA
    git pull origin main
    Pop-Location
    Write-Host "  [OK] Workspace A sincronizado." -ForegroundColor Green
}

# 5. Notificacao de Email
Write-Host ""
Write-Host "[5/5] Registrando log de notificacao de handoff..." -ForegroundColor Yellow
& python scripts/send-notification-email.py "Sincronizacao de Handoff Multi-IA Concluida" "Sincronizacao concluida em $timestamp. Backup gerado: $backupName." "fael@live.de"

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "   HANDOFF CONCLUIDO COM SUCESSO! VOCE PODE ABRIR O OUTRO ASSISTENTE.   " -ForegroundColor Green
Write-Host "========================================================================" -ForegroundColor Cyan
