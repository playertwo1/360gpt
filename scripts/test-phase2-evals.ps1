# Test Phase 2 - Observability & Evals (Avaliação Contínua)
$ErrorActionPreference = 'Stop'

Write-Host "Testando homologacao da Fase 2 (Observability & Evals)..." -ForegroundColor Cyan

# 1. Validar existencia dos 20 casos sinteticos
Write-Host ""
Write-Host "[1/4] Verificando suíte canônica de 20 casos sintéticos..." -ForegroundColor Yellow
$cases = Get-ChildItem "test-data/evals/cases" -Filter "*.json"
if ($cases.Count -lt 20) {
    throw "Menos de 20 casos sintéticos encontrados! Total: $($cases.Count)"
}
Write-Host "  [OK] $($cases.Count) casos sintéticos encontrados e validados." -ForegroundColor Green

# 2. Validar engine e modulos de metricas
Write-Host ""
Write-Host "[2/4] Verificando módulos de métricas e motor de avaliação..." -ForegroundColor Yellow
$engineFiles = @('evals/metrics.py', 'evals/eval_engine.py')
foreach ($ef in $engineFiles) {
    if (-not (Test-Path $ef)) { throw "Módulo $ef ausente!" }
    Write-Host "  [OK] Módulo $ef validado." -ForegroundColor Green
}

# 3. Executar o motor de avaliação nas 4 camadas (L1 a L4)
Write-Host ""
Write-Host "[3/4] Executando motor de avaliação L1 a L4..." -ForegroundColor Yellow
$evalOutput = python evals/eval_engine.py
if ($LASTEXITCODE -ne 0) {
    throw "Motor de Evals falhou na execução!"
}
Write-Host $evalOutput

# 4. Validar relatório JSON gerado
Write-Host ""
Write-Host "[4/4] Validando relatório JSON e metas atingidas..." -ForegroundColor Yellow
$reportPath = "test-data/evals/eval_report_latest.json"
if (-not (Test-Path $reportPath)) { throw "Relatório $reportPath não encontrado!" }
$report = Get-Content $reportPath -Raw | ConvertFrom-Json

if ($report.overall_status -ne "HOMOLOGATED") {
    throw "Status geral da avaliação não foi HOMOLOGATED! Status: $($report.overall_status)"
}
if ($report.l1_deterministic.math_accuracy_percent -ne 100) {
    throw "L1 Math Accuracy abaixo de 100%!"
}
if ($report.l2_extraction.avg_f1_score -lt 0.95) {
    throw "L2 F1-Score abaixo de 0.95!"
}
if ($report.l3_reasoning_lineage.evidence_coverage_percent -ne 100) {
    throw "L3 Evidence Coverage abaixo de 100%!"
}
if ($report.l4_decision_intelligence.decision_agreement_rate_percent -lt 90) {
    throw "L4 Decision Agreement Rate abaixo de 90%!"
}

Write-Host "  [OK] Todas as 4 camadas atingiram ou superaram as metas contratuais." -ForegroundColor Green
Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "   FASE 2 (OBSERVABILITY & EVALS) HOMOLOGADA COM SUCESSO!               " -ForegroundColor Green
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "H2_EVALS_SUITE_PASS" -ForegroundColor Green
exit 0
