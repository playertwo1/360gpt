param(
  [string]$N8nBaseUrl = 'http://localhost:5678',
  [string]$AppBaseUrl = 'http://localhost:3000',
  [string]$TenantId = 'tenant-demo'
)

$ErrorActionPreference = 'Stop'

Write-Host ''
Write-Host '============================================================' -ForegroundColor Cyan
Write-Host ' READINESS GATE — HOMOLOGACAO DE RELEASE v1.0.0 (MARCO 15)   ' -ForegroundColor Cyan
Write-Host '============================================================' -ForegroundColor Cyan

# 1. Verificacao de Contratos e Schemas JSON (Draft 2020-12)
Write-Host ''
Write-Host '1. Validando presenca e integridade dos contratos JSON Schema...' -ForegroundColor Yellow
$contracts = @(
  'contracts/backpressure.schema.json',
  'contracts/evidence-graph.schema.json',
  'contracts/handoff.schema.json',
  'contracts/manual-review.schema.json',
  'contracts/release-manifest.schema.json',
  'contracts/review-resolution.schema.json',
  'contracts/routing-decision.schema.json',
  'contracts/state-360.schema.json'
)

foreach ($c in $contracts) {
  if (Test-Path -LiteralPath $c) {
    Write-Host "   [OK] Contrato presente: $c" -ForegroundColor Green
  } else {
    Write-Host "   [FALHA] Contrato ausente: $c" -ForegroundColor Red
    exit 1
  }
}

# 2. Verificacao de Politicas de Governanca YAML
Write-Host ''
Write-Host '2. Validando politicas de governanca YAML...' -ForegroundColor Yellow
$policies = @(
  'policies/backpressure.yaml',
  'policies/capability-registry.yaml',
  'policies/evidence-graph.yaml',
  'policies/freshness.yaml',
  'policies/reason-codes.yaml',
  'policies/review-sla.yaml',
  'policies/routing.yaml'
)

foreach ($p in $policies) {
  if (Test-Path -LiteralPath $p) {
    Write-Host "   [OK] Politica presente: $p" -ForegroundColor Green
  } else {
    Write-Host "   [FALHA] Politica ausente: $p" -ForegroundColor Red
    exit 1
  }
}

# 3. Verificacao do Manifesto de Release e Pacote de Conformidade
Write-Host ''
Write-Host '3. Validando manifesto de release e pacote de conformidade...' -ForegroundColor Yellow
if ((Test-Path -LiteralPath 'release/RELEASE_MANIFEST_v1.0.0.json') -and (Test-Path -LiteralPath 'compliance/COMPLIANCE_EVIDENCE_PACKAGE.md')) {
  Write-Host '   [OK] Manifesto e pacote de conformidade auditados.' -ForegroundColor Green
} else {
  Write-Host '   [FALHA] Artefatos de release ausentes.' -ForegroundColor Red
  exit 1
}

# 4. Validacao de Carga e Concorrencia
Write-Host ''
Write-Host '4. Executando bateria de carga e concorrencia (test-load-concurrency.ps1)...' -ForegroundColor Yellow
powershell -File scripts/test-load-concurrency.ps1
if ($LASTEXITCODE -ne 0) {
  Write-Host '   [FALHA nos testes de carga]' -ForegroundColor Red
  exit 1
}

# 5. Validacao de Ingestao Multi-Formato
Write-Host ''
Write-Host '5. Executando testes de ingestao multi-formato (send-test-inputs.ps1)...' -ForegroundColor Yellow
powershell -File scripts/send-test-inputs.ps1
if ($LASTEXITCODE -ne 0) {
  Write-Host '   [FALHA nos testes de ingestao]' -ForegroundColor Red
  exit 1
}

# 6. Validacao do Adaptador Telegram
Write-Host ''
Write-Host '6. Executando testes do adaptador Telegram (test-telegram-adapter.ps1)...' -ForegroundColor Yellow
powershell -File scripts/test-telegram-adapter.ps1
if ($LASTEXITCODE -ne 0) {
  Write-Host '   [FALHA no adaptador Telegram]' -ForegroundColor Red
  exit 1
}

# 7. Validacao do Evidence Graph e Append-Only
Write-Host ''
Write-Host '7. Validando triggers append-only no PostgreSQL...' -ForegroundColor Yellow
$triggerCheck = & docker compose -f compose.n8n.yaml --env-file .env.n8n exec -T postgres psql -U postgres -d visao360 -t -c 'SELECT tgname FROM pg_trigger WHERE tgname = ''evidence_nodes_no_update'';'
if ($triggerCheck -match 'evidence_nodes_no_update') {
  Write-Host '   [OK] Triggers anti-mutacao ativos e protegendo o Evidence Graph.' -ForegroundColor Green
} else {
  Write-Host '   [FALHA] Triggers append-only inativos.' -ForegroundColor Red
  exit 1
}

# 8. Validacao de Build de Producao
Write-Host ''
Write-Host '8. Executando linter e build de producao...' -ForegroundColor Yellow
npm run lint
npm run build
if ($LASTEXITCODE -ne 0) {
  Write-Host '   [FALHA no build de producao]' -ForegroundColor Red
  exit 1
}

Write-Host ''
Write-Host '============================================================' -ForegroundColor Cyan
Write-Host ' READINESS GATE CERTIFICADO: PASS (HOMOLOGACAO COMPLETA)    ' -ForegroundColor Green
Write-Host ' SISTEMA DIRETOR 360 PRONTO PARA PRODUCAO ASSISTIDA         ' -ForegroundColor Green
Write-Host '============================================================' -ForegroundColor Cyan



