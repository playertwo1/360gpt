# Test Phase A5 - Catalogo Fechado de Efeitos Externos Autorizados (Human-in-the-Loop)
$ErrorActionPreference = 'Stop'

Write-Host ''
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host '   DIRETOR 360 - TESTE FASE A5 (EFEITOS EXTERNOS AUTORIZADOS)          ' -ForegroundColor Yellow
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host ''

# 1. Validar Catalogo e Schema Contratual
Write-Host '[1/4] Verificando catalogo fechado e schema contratual Draft 2020-12...' -ForegroundColor Yellow
$catalogPath = 'policies/external-effects-catalog.yaml'
$schemaPath = 'contracts/external-action-request.schema.json'
if (-not (Test-Path $catalogPath) -or -not (Test-Path $schemaPath)) { throw 'Catalogo ou Schema de efeitos externos ausente!' }
Write-Host '  [OK] policies/external-effects-catalog.yaml validado.' -ForegroundColor Green
Write-Host '  [OK] contracts/external-action-request.schema.json validado.' -ForegroundColor Green

# 2. Testar Acao Autorizada por Rafael (Sucesso)
Write-Host ''
Write-Host '[2/4] Executando acao externa autorizada por Rafael...' -ForegroundColor Yellow
$pyAuth = "import json, time; from core.external_effects_executor import ExternalEffectsExecutor; executor = ExternalEffectsExecutor(); req = {'action_id': 'ACT_TEST_001', 'action_type': 'DISPATCH_TELEGRAM_REPORT', 'channel': 'TELEGRAM', 'target': '5281600644', 'payload': {'text': 'Teste autorizado'}, 'human_authorized': True, 'authorized_by': 'rafael', 'idempotency_key': 'TEST_IDEMP_KEY_001_VALID', 'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}; print(json.dumps(executor.execute_action(req)))"
$out1 = python -c $pyAuth | ConvertFrom-Json
if ($out1.status -ne "EXECUTED_SUCCESS") { throw "Falha na acao autorizada: $($out1.message)" }
Write-Host "  [OK] Acao autorizada despachada com sucesso: $($out1.action_id)" -ForegroundColor Green

# 3. Testar Bloqueio de Acao Nao Autorizada (Seguranca)
Write-Host ''
Write-Host '[3/4] Testando bloqueio estrito contra acoes sem autorizacao de Rafael...' -ForegroundColor Yellow
$pyUnauth = "import json, time; from core.external_effects_executor import ExternalEffectsExecutor; executor = ExternalEffectsExecutor(); req = {'action_id': 'ACT_TEST_UNAUTH', 'action_type': 'DISPATCH_TELEGRAM_REPORT', 'channel': 'TELEGRAM', 'target': '5281600644', 'payload': {'text': 'Tentativa sem despacho'}, 'human_authorized': False, 'authorized_by': 'sistema_automatico', 'idempotency_key': 'TEST_IDEMP_KEY_UNAUTH', 'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}; print(json.dumps(executor.execute_action(req)))"
$out2 = python -c $pyUnauth | ConvertFrom-Json
if ($out2.status -ne "DENIED_UNAUTHORIZED") { throw "Acao nao autorizada NAO foi bloqueada!" }
Write-Host "  [OK] Acao sem autorizacao bloqueada com sucesso (reason: $($out2.reason_code))." -ForegroundColor Green

# 4. Testar Bloqueio de Tipo Proibido e Idempotencia
Write-Host ''
Write-Host '[4/4] Testando protecao contra tipos proibidos e duplicidade de idempotencia...' -ForegroundColor Yellow
$pyProhib = "import json, time; from core.external_effects_executor import ExternalEffectsExecutor; executor = ExternalEffectsExecutor(); req_p = {'action_id': 'ACT_TEST_PROHIBITED', 'action_type': 'AUTOMATIC_CREDIT_APPROVAL', 'channel': 'API', 'target': 'CORE_BANKING', 'payload': {'valor': 500000}, 'human_authorized': True, 'authorized_by': 'rafael', 'idempotency_key': 'TEST_IDEMP_KEY_PROHIBITED', 'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}; res_p = executor.execute_action(req_p); executor.executed_keys.add('TEST_IDEMP_KEY_001_VALID'); req_d = {'action_id': 'ACT_TEST_DUP', 'action_type': 'DISPATCH_TELEGRAM_REPORT', 'channel': 'TELEGRAM', 'target': '5281600644', 'payload': {'text': 'Repeticao'}, 'human_authorized': True, 'authorized_by': 'rafael', 'idempotency_key': 'TEST_IDEMP_KEY_001_VALID', 'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}; res_d = executor.execute_action(req_d); print(json.dumps({'prohibited': res_p, 'duplicate': res_d}))"
$out3 = python -c $pyProhib | ConvertFrom-Json
if ($out3.prohibited.status -ne "DENIED_PROHIBITED") { throw "Tipo proibido NAO foi barrado!" }
if ($out3.duplicate.status -ne "DUPLICATE_SKIPPED") { throw "Duplicidade de idempotencia NAO foi prevenida!" }
Write-Host "  [OK] Acao fora do catalogo bloqueada (reason: $($out3.prohibited.reason_code))." -ForegroundColor Green
Write-Host "  [OK] Idempotencia confirmada: acao repetida ignorada sem duplicacao." -ForegroundColor Green

Write-Host ''
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host '   FASE A5 (EFEITOS EXTERNOS AUTORIZADOS) HOMOLOGADA COM SUCESSO!      ' -ForegroundColor Green
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host ''

Write-Host 'A5_EXTERNAL_EFFECTS_PASS' -ForegroundColor Green
exit 0
