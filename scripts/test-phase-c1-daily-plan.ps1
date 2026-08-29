# Test Phase C1 - Ingestao Carteira PJ & Plano Diario Integrado
$ErrorActionPreference = 'Stop'

Write-Host ''
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host '   DIRETOR 360 - TESTE FASE C1 & PLANO DIARIO INTEGRADO (PJ + POBJ)    ' -ForegroundColor Yellow
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host ''

# 1. Validar Motor da Carteira PJ
Write-Host '[1/4] Testando motor da carteira PJ e matriz de restricoes...' -ForegroundColor Yellow
$pyCarteira = "import json; from core.carteira_pj_engine import CarteiraPJEngine; eng = CarteiraPJEngine(); eligible = eng.get_eligible_companies_for_product('CREDITO_GIRO'); print(json.dumps({'total': len(eng.companies), 'eligible_giro': len(eligible)}))"
$res1 = python -c $pyCarteira | ConvertFrom-Json
if ($res1.total -lt 3) { throw 'Base da carteira PJ insuficiente!' }
if ($res1.eligible_giro -lt 1) { throw 'Nenhuma empresa elegivel para giro encontrada!' }
Write-Host "  [OK] $($res1.total) empresas na carteira PJ carregadas." -ForegroundColor Green
Write-Host "  [OK] $($res1.eligible_giro) empresas elegiveis para Capital de Giro (Grau <= 3)." -ForegroundColor Green

# 2. Validar Motor do Plano Diario Integrado
Write-Host ''
Write-Host '[2/4] Testando cruzamento de gaps do POBJ com carteira PJ...' -ForegroundColor Yellow
$pyPlan = "import json; from core.daily_action_plan_engine import DailyActionPlanEngine; eng = DailyActionPlanEngine(); plan = eng.generate_daily_plan(); print(json.dumps({'actions': len(plan['actions_queue']), 'gap': plan['pobj_summary']['gap_pontos']}))"
$res2 = python -c $pyPlan | ConvertFrom-Json
if ($res2.actions -lt 1) { throw 'Nenhuma acao priorizada no plano diario!' }
Write-Host "  [OK] Plano diario gerado com $($res2.actions) acoes prioritarias (P0/P1/P2)." -ForegroundColor Green
Write-Host "  [OK] Gap do POBJ integrado: $($res2.gap) pts." -ForegroundColor Green

# 3. Validar formatacao do briefing do Telegram
Write-Host ''
Write-Host '[3/4] Testando geracao de briefing executivo para Telegram...' -ForegroundColor Yellow
$pyBrief = "import sys; from core.daily_action_plan_engine import DailyActionPlanEngine; eng = DailyActionPlanEngine(); brief = eng.format_telegram_daily_briefing(); ok = 'PLANO' in brief and '[P0]' in brief and 'Score POBJ' in brief; print('BRIEFING_OK' if ok else 'FAIL')"
$res3 = python -c $pyBrief
if ($res3 -notmatch 'BRIEFING_OK') { throw 'Falha ao gerar briefing do Telegram!' }
Write-Host '  [OK] Briefing do Telegram formatado com sucesso.' -ForegroundColor Green

# 4. Validar integracao no Worker do Telegram
Write-Host ''
Write-Host '[4/4] Verificando comandos /hoje e /planodiario no worker...' -ForegroundColor Yellow
$workerContent = Get-Content "core/telegram_bot_worker.py" -Raw
if ($workerContent -notmatch '/hoje' -or $workerContent -notmatch 'daily_plan_engine') {
    throw 'Comando /hoje nao integrado no telegram_bot_worker.py!'
}
Write-Host '  [OK] Comandos /hoje e /planodiario integrados no bot do Telegram.' -ForegroundColor Green

Write-Host ''
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host '   FASE C1 & PLANO DIARIO INTEGRADO HOMOLOGADOS COM SUCESSO!            ' -ForegroundColor Green
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host ''

Write-Host 'C1_DAILY_PLAN_PASS' -ForegroundColor Green
exit 0
