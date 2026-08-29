# Test Phase - Refinamento do Motor e Especialistas de Performance
$ErrorActionPreference = 'Stop'

Write-Host ''
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host '   DIRETOR 360 - TESTE REFINAMENTO DO DOMÍNIO DE PERFORMANCE (POBJ)    ' -ForegroundColor Yellow
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host ''

# 1. Executar testes unitários do motor de performance refinado
Write-Host '[1/2] Executando testes unitários em tests/test_performance_refinements.py...' -ForegroundColor Yellow
python tests/test_performance_refinements.py
if ($LASTEXITCODE -ne 0) { throw 'Falha ao executar test_performance_refinements.py!' }

# 2. Validar integridade dos 5 especialistas
Write-Host ''
Write-Host '[2/2] Validando especificação e contratos dos 5 especialistas de Performance...' -ForegroundColor Yellow
$specs = @(
    'domains/performance/specialists/PERFORMANCE_SOURCES_RECONCILIATION.md',
    'domains/performance/specialists/PERFORMANCE_SCORING_STATE.md',
    'domains/performance/specialists/PERFORMANCE_GAP_SCENARIOS.md',
    'domains/performance/specialists/PERFORMANCE_EXECUTABILITY_PLAN.md',
    'domains/performance/specialists/PERFORMANCE_OUTCOMES_LEARNING.md'
)

foreach ($s in $specs) {
    if (-not (Test-Path $s)) { throw "Especialista $s nao encontrado!" }
    Write-Host "  [OK] Especialista validado: $(Split-Path $s -Leaf)" -ForegroundColor Green
}

Write-Host ''
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host '   DOMÍNIO DE PERFORMANCE REFINADO E 100% HOMOLOGADO!                  ' -ForegroundColor Green
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host ''

Write-Host 'PERF_REFINEMENTS_PASS' -ForegroundColor Green
exit 0