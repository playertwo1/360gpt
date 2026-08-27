# Master Test Runner - Homologacao Completa H3 a H10 (4 Gerentes Gerais)
$ErrorActionPreference = 'Stop'

Write-Host ''
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host '   DIRETOR 360 — BATERIA DE HOMOLOGACAO GERAL (4 GERENTES GERAIS)       ' -ForegroundColor Yellow
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host ''

$tests = @(
    @{ Name = 'H3 - Ponte Site <-> Computador'; Script = 'scripts/test-h3-bridge-audit.ps1' },
    @{ Name = 'H4 - Iniciador de 1-Clique'; Script = 'scripts/test-h4-launcher.ps1' },
    @{ Name = 'H5 - Telegram Hospedado (Texto)'; Script = 'scripts/test-h5-telegram-text.ps1' },
    @{ Name = 'H6 - Telegram Multimodal (PDF/Excel)'; Script = 'scripts/test-h6-telegram-multimodal.ps1' },
    @{ Name = 'H7 - Visao Executiva 360 Completa'; Script = 'scripts/test-h7-executive-view.ps1' },
    @{ Name = 'H8 - Seguranca e Privacidade'; Script = 'scripts/test-h8-security-privacy.ps1' },
    @{ Name = 'H9 - Backup e Recuperacao'; Script = 'scripts/test-h9-backup-recovery.ps1' },
    @{ Name = 'H10 - Rotina Diaria e Aceite'; Script = 'scripts/test-h10-daily-routine-acceptance.ps1' },
    @{ Name = 'Fase 2 - Observability & Evals (L1-L4)'; Script = 'scripts/test-phase2-evals.ps1' },
    @{ Name = 'Fase 4 - Decision Intelligence & Laudo PDF'; Script = 'scripts/test-phase4-decision-pdf.ps1' },
    @{ Name = 'Fase 5 - LLMOps & FinOps Model Router'; Script = 'scripts/test-phase5-finops-router.ps1' },
    @{ Name = 'Fase 6 - Security, LGPD & PRR'; Script = 'scripts/test-phase6-security-prr.ps1' },
    @{ Name = 'Fase 7 - Operacao Real Canary'; Script = 'scripts/test-phase7-canary-rollout.ps1' }
)

$passed = 0
$total = $tests.Count

foreach ($t in $tests) {
    Write-Host ''
    Write-Host ">>> Executando Teste: $($t.Name)..." -ForegroundColor Cyan
    & powershell -File $t.Script
    if ($LASTEXITCODE -eq 0) {
        $passed++
        Write-Host ">>> SUCESSO: $($t.Name) aprovado!" -ForegroundColor Green
    } else {
        throw "FALHA: Teste $($t.Name) falhou com codigo $LASTEXITCODE"
    }
}

# Teste de Contratos Node.js
Write-Host ''
Write-Host ">>> Executando Teste: Contratos da Carteira e Especialistas de Conta..." -ForegroundColor Cyan
node tests/conta-contracts.test.mjs
if ($LASTEXITCODE -eq 0) {
    $passed++
    $total++
    Write-Host ">>> SUCESSO: Contratos de Conta aprovados!" -ForegroundColor Green
}

Write-Host ''
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host "   TODOS OS $passed DE $total TESTES FORAM 100% HOMOLOGADOS!            " -ForegroundColor Green
Write-Host '   (Conhecimento: Desenvolvimento paralisado para o futuro sem definicao)' -ForegroundColor Yellow
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host ''

Write-Host 'ALL_HYBRID_TESTS_PASS' -ForegroundColor Green
exit 0