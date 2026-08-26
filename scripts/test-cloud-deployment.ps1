[CmdletBinding()]
param(
  [string]$FrontendBaseUrl,
  [string]$N8nBaseUrl,
  [switch]$Live
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$required = @(
  'scripts/provision-vps-server.sh',
  'scripts/activate-telegram-webhook.ps1',
  'infra/cloud/docker-compose.prod.yaml',
  'infra/cloud/Caddyfile',
  'infra/cloud/.env.prod.example'
)
foreach ($file in $required) {
  if (-not (Test-Path -LiteralPath $file)) { throw "Artefato ausente: $file" }
}

$provision = Get-Content -Raw scripts/provision-vps-server.sh
$compose = Get-Content -Raw infra/cloud/docker-compose.prod.yaml
$caddy = Get-Content -Raw infra/cloud/Caddyfile
$telegram = Get-Content -Raw scripts/activate-telegram-webhook.ps1
foreach ($pattern in @('ufw allow OpenSSH','ufw allow 80/tcp','ufw allow 443/tcp','docker compose','Ubuntu 24.04')) {
  if ($provision -notmatch [regex]::Escape($pattern)) { throw "Provisionamento sem requisito: $pattern" }
}
foreach ($pattern in @('POSTGRES_PASSWORD:?','N8N_ENCRYPTION_KEY:?','healthcheck:')) {
  if ($compose -notmatch [regex]::Escape($pattern)) { throw "Compose sem protecao: $pattern" }
}
if ($caddy -notmatch 'Strict-Transport-Security' -or $caddy -notmatch 'reverse_proxy n8n:5678') { throw 'Caddy sem TLS/proxy esperado.' }
if ($telegram -notmatch 'secret_token' -or $telegram -notmatch 'ShouldProcess') { throw 'Ativador Telegram sem segredo ou modo seguro.' }

$env:DOMAIN_NAME = 'n8n.example.test'
$env:ACME_EMAIL = 'ops@example.test'
$env:POSTGRES_PASSWORD = 'test-only-not-a-secret'
$env:N8N_PASSWORD = 'test-only-not-a-secret'
$env:N8N_ENCRYPTION_KEY = ('x' * 64)
try {
  docker compose --env-file infra/cloud/.env.prod.example -f infra/cloud/docker-compose.prod.yaml config --quiet
  if ($LASTEXITCODE -ne 0) { throw 'docker compose config falhou.' }
} finally {
  'DOMAIN_NAME','ACME_EMAIL','POSTGRES_PASSWORD','N8N_PASSWORD','N8N_ENCRYPTION_KEY' | ForEach-Object { Remove-Item "Env:$_" -ErrorAction SilentlyContinue }
}

if ($Live) {
  if ([string]::IsNullOrWhiteSpace($FrontendBaseUrl) -or [string]::IsNullOrWhiteSpace($N8nBaseUrl)) { throw 'Use -FrontendBaseUrl e -N8nBaseUrl com -Live.' }
  foreach ($target in @(
    @{ Name = 'Frontend'; Uri = $FrontendBaseUrl.TrimEnd('/') },
    @{ Name = 'n8n'; Uri = "$($N8nBaseUrl.TrimEnd('/'))/healthz" }
  )) {
    if (-not $target.Uri.StartsWith('https://')) { throw "$($target.Name) precisa usar HTTPS." }
    $response = Invoke-WebRequest -UseBasicParsing -Uri $target.Uri -TimeoutSec 20
    if ($response.StatusCode -lt 200 -or $response.StatusCode -ge 400) { throw "$($target.Name) respondeu HTTP $($response.StatusCode)." }
  }
}

Write-Host '[PASS] Marco 24: artefatos cloud, Compose, Caddy e Telegram validados.' -ForegroundColor Green
if (-not $Live) { Write-Host '[INFO] Testes remotos nao executados; use -Live com as duas URLs publicadas.' -ForegroundColor Yellow }
