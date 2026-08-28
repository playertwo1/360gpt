# Test Phase 7 - Supervised Canary Rollout
$ErrorActionPreference = 'Stop'

Write-Host "Testando simulacao sintetica supervisionada do Canary..." -ForegroundColor Cyan

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

# 4. Validar que a simulacao nao fabrica decisoes humanas
Write-Host ""
Write-Host "[4/4] Validando revisao humana pendente e ausencia de efeitos externos..." -ForegroundColor Yellow
$telemetryPath = "test-data/canary_telemetry_latest.json"
if (-not (Test-Path $telemetryPath)) { throw "Telemetria Canary $telemetryPath nao encontrada!" }
$telemetry = Get-Content $telemetryPath -Raw | ConvertFrom-Json

if ($telemetry.total_canary_cases_processed -lt 10) {
    throw "Menos de 10 casos processados na esteira Canary!"
}
if ($telemetry.pending_human_review_count -ne 10) { throw "A simulacao deve manter 10 revisoes humanas pendentes!" }
if ($null -ne $telemetry.human_override_rate_percent) { throw "A simulacao nao pode fabricar taxa de override humano!" }
if ($telemetry.external_effect_count -ne 0 -or $telemetry.state_mutation_count -ne 0) { throw "A simulacao nao pode produzir efeitos ou mutacoes!" }

Write-Host "  [OK] 10 revisoes pendentes, sem override fabricado, mutacao ou efeito externo." -ForegroundColor Green
Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "   SIMULACAO SINTETICA CANARY VALIDADA COM SUCESSO!                     " -ForegroundColor Green
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "H7_CANARY_ROLLOUT_PASS" -ForegroundColor Green
exit 0
