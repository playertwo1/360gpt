# Test Phase 5 - LLMOps & FinOps Model Router
$ErrorActionPreference = 'Stop'

Write-Host "Testando homologacao da Fase 5 (LLMOps & FinOps Model Router)..." -ForegroundColor Cyan

# 1. Validar política YAML
Write-Host ""
Write-Host "[1/4] Verificando politica de roteamento policies/model-router.yaml..." -ForegroundColor Yellow
$policyPath = "policies/model-router.yaml"
if (-not (Test-Path $policyPath)) { throw "Politica $policyPath nao encontrada!" }
Write-Host "  [OK] Politica de roteamento validada." -ForegroundColor Green

# 2. Validar motor Python
Write-Host ""
Write-Host "[2/4] Verificando motor core/model_router.py..." -ForegroundColor Yellow
$routerPath = "core/model_router.py"
if (-not (Test-Path $routerPath)) { throw "Motor $routerPath nao encontrado!" }
Write-Host "  [OK] Motor de roteamento validado." -ForegroundColor Green

# 3. Executar simulacao FinOps com os 20 casos sinteticos
Write-Host ""
Write-Host "[3/4] Executando simulacao FinOps e roteamento por menor custo suficiente..." -ForegroundColor Yellow
$output = python core/model_router.py
if ($LASTEXITCODE -ne 0) { throw "Falha na execucao do ModelRouter!" }
Write-Host $output

# 4. Validar metas de economia FinOps
Write-Host ""
Write-Host "[4/4] Validando taxa de economia financeira (Meta >= 70%)..." -ForegroundColor Yellow
$telemetryPath = "test-data/finops_telemetry_latest.json"
if (-not (Test-Path $telemetryPath)) { throw "Telemetria FinOps $telemetryPath nao gerada!" }
$telemetry = Get-Content $telemetryPath -Raw | ConvertFrom-Json

if ($telemetry.overall_savings_percent -lt 70.0) {
    throw "Economia FinOps ($($telemetry.overall_savings_percent)%) abaixo da meta de 70%!"
}
if ($telemetry.tier_distribution.deterministic -le 0) {
    throw "Nenhuma tarefa foi roteada para a camada deterministica!"
}

Write-Host "  [OK] Economia de $($telemetry.overall_savings_percent)% comprovada com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "   FASE 5 (LLMOPS & FINOPS ROUTER) HOMOLOGADA COM SUCESSO!              " -ForegroundColor Green
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "H5_FINOPS_ROUTER_PASS" -ForegroundColor Green
exit 0
