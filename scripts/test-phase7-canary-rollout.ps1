# Test Phase 7 - Supervised Canary Rollout
$ErrorActionPreference = 'Stop'

Write-Host "Testando homologacao da Fase 7 (Operacao Real Supervisionada Canary)..." -ForegroundColor Cyan

# 1. Validar protocolo operacional
Write-Host ""
Write-Host "[1/4] Verificando documento formal docs/PROTOCOLO_CANARY_SUPERVISIONADO.md..." -ForegroundColor Yellow
$docPath = "docs/PROTOCOLO_CANARY_SUPERVISIONADO.md"
if (-not (Test-Path $docPath)) { throw "Documento $docPath nao encontrado!" }
Write-Host "  [OK] Protocolo operacional Canary validado." -ForegroundColor Green

# 2. Validar motor Python de monitoramento Canary
Write-Host ""
Write-Host "[2/4] Verificando motor core/canary_monitor.py..." -ForegroundColor Yellow
$monitorPath = "core/canary_monitor.py"
if (-not (Test-Path $monitorPath)) { throw "Motor $monitorPath nao encontrado!" }
Write-Host "  [OK] Motor de monitoramento Canary validado." -ForegroundColor Green

# 3. Executar esteira Canary de 3 ondas (10 casos)
Write-Host ""
Write-Host "[3/4] Executando esteira Canary de 3 ondas (1-3 -> 5 -> 10 casos)..." -ForegroundColor Yellow
$output = python core/canary_monitor.py
if ($LASTEXITCODE -ne 0) { throw "Falha na execucao do CanaryMonitor!" }
Write-Host $output

# 4. Validar metas de override rate (Meta <= 10%)
Write-Host ""
Write-Host "[4/4] Validando taxa de override de Rafael (Meta <= 10%)..." -ForegroundColor Yellow
$telemetryPath = "test-data/canary_telemetry_latest.json"
if (-not (Test-Path $telemetryPath)) { throw "Telemetria Canary $telemetryPath nao encontrada!" }
$telemetry = Get-Content $telemetryPath -Raw | ConvertFrom-Json

if ($telemetry.human_override_rate_percent -gt 10.0) {
    throw "Taxa de override ($($telemetry.human_override_rate_percent)%) acima da meta de 10%!"
}
if ($telemetry.total_canary_cases_processed -lt 10) {
    throw "Menos de 10 casos processados na esteira Canary!"
}

Write-Host "  [OK] Taxa de Override de $($telemetry.human_override_rate_percent)% comprovada com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "   FASE 7 (OPERACAO REAL CANARY) HOMOLOGADA COM SUCESSO!                " -ForegroundColor Green
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "H7_CANARY_ROLLOUT_PASS" -ForegroundColor Green
exit 0
