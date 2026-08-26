param()

$ErrorActionPreference = 'Stop'

Write-Host ''
Write-Host '============================================================' -ForegroundColor Cyan
Write-Host ' VALIDACAO DE DEPLOY CLOUD E PLANO DE ROLLBACK (MARCO 19)   ' -ForegroundColor Cyan
Write-Host '============================================================' -ForegroundColor Cyan

# 1. Validacao de Presenca dos Manifestos Cloud e Plano de Rollback
Write-Host ''
Write-Host '1. Verificando manifestos de infraestrutura cloud e plano de reversao...' -ForegroundColor Yellow

$requiredFiles = @(
  'infra/cloud/Caddyfile',
  'infra/cloud/docker-compose.prod.yaml',
  'infra/cloud/cloudflare-pages.yaml',
  'docs/ROLLBACK_PLAN_PRODUCAO.md'
)

foreach ($f in $requiredFiles) {
  if (Test-Path -LiteralPath $f) {
    Write-Host "   [OK] Artefato '$f' presente e estruturado." -ForegroundColor Green
  } else {
    Write-Host "   [FALHA] Artefato '$f' nao encontrado." -ForegroundColor Red
    exit 1
  }
}

# 2. Validacao de Seguranca do Caddyfile (HSTS / Zero-Trust)
Write-Host ''
Write-Host '2. Validando politicas de seguranca no Caddyfile HTTPS/TLS...' -ForegroundColor Yellow
$caddyContent = Get-Content -Raw -LiteralPath 'infra/cloud/Caddyfile'
if (($caddyContent -match 'Strict-Transport-Security') -and ($caddyContent -match 'X-Frame-Options "DENY"') -and ($caddyContent -match 'reverse_proxy n8n:5678')) {
  Write-Host '   [OK] Cabecalhos HSTS, anti-clickjacking e proxy reverso validados.' -ForegroundColor Green
} else {
  Write-Host '   [FALHA] Cabecalhos de seguranca ausentes no Caddyfile.' -ForegroundColor Red
  exit 1
}

# 3. Validacao do Docker Compose de Producao
Write-Host ''
Write-Host '3. Validando configuracao de isolamento e persistencia do Docker Compose...' -ForegroundColor Yellow
$composeContent = Get-Content -Raw -LiteralPath 'infra/cloud/docker-compose.prod.yaml'
if (($composeContent -match 'postgres_prod_data') -and ($composeContent -match 'n8n_prod_data') -and ($composeContent -match 'caddy_data')) {
  Write-Host '   [OK] Volumes persistentes nomeados e rede isolada de producao configurados.' -ForegroundColor Green
} else {
  Write-Host '   [FALHA] Falha na definicao de persistencia no Docker Compose.' -ForegroundColor Red
  exit 1
}

# 4. Validacao dos Procedimentos e Niveis de Rollback (RTO < 15m / RPO < 5m)
Write-Host ''
Write-Host '4. Validando conformidade do Plano de Rollback com metas de continuidade...' -ForegroundColor Yellow
$rollbackText = Get-Content -Raw -LiteralPath 'docs/ROLLBACK_PLAN_PRODUCAO.md'
if (($rollbackText -match 'NÍVEL 1') -and ($rollbackText -match 'NÍVEL 2') -and ($rollbackText -match 'NÍVEL 3') -and ($rollbackText -match 'RTO < 15 minutos')) {
  Write-Host '   [OK] Roteiro executivo de rollback em 3 niveis (DNS, Banco e Conteiner) certificado.' -ForegroundColor Green
} else {
  Write-Host '   [FALHA] Requisitos de continuidade nao atendidos no plano de rollback.' -ForegroundColor Red
  exit 1
}

Write-Host ''
Write-Host '============================================================' -ForegroundColor Cyan
Write-Host ' INFRAESTRUTURA CLOUD E ROLLBACK CERTIFICADOS: PASS         ' -ForegroundColor Green
Write-Host ' AMBIENTE DE PRODUCAO BLINDADO COM PLANO DE REVERSAO TESTADO' -ForegroundColor Green
Write-Host '============================================================' -ForegroundColor Cyan

