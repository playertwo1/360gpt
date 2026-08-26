[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $projectRoot '.env.n8n'
$composeFile = Join-Path $projectRoot 'compose.n8n.yaml'
$workflowId = '0d1a2f30-7e35-4b2c-8dd5-b6efc8b4c360'

if (-not (Test-Path -LiteralPath $envFile)) {
  throw 'Execute scripts/start-360.ps1 primeiro.'
}

docker compose --env-file $envFile -f $composeFile run --rm --no-deps --no-TTY `
  n8n execute --id=$workflowId

if ($LASTEXITCODE -ne 0) {
  throw 'O workflow OFFLINE_EVAL falhou.'
}

Write-Host 'Workflow OFFLINE_EVAL executado com sucesso.'
