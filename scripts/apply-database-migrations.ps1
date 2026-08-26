[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $projectRoot '.env.n8n'
$composeFile = Join-Path $projectRoot 'compose.n8n.yaml'

if (-not (Test-Path -LiteralPath $envFile)) {
  throw 'Execute scripts/start-360.ps1 primeiro.'
}

$migrationFiles = @(
  '03-ingestion-artifacts.sql'
  '04-routing-idempotency.sql'
  '05-state-publication.sql'
  '06-manual-review.sql'
)

foreach ($migrationFile in $migrationFiles) {
  docker compose --env-file $envFile -f $composeFile exec -T postgres `
    psql --set ON_ERROR_STOP=1 -U postgres -d postgres `
    -f "/docker-entrypoint-initdb.d/$migrationFile"

  if ($LASTEXITCODE -ne 0) { throw "Falha ao aplicar $migrationFile." }
}
Write-Host 'Migrações do banco visao360 aplicadas.'
