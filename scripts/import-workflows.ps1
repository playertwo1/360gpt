[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $projectRoot '.env.n8n'
$composeFile = Join-Path $projectRoot 'compose.n8n.yaml'

if (-not (Test-Path -LiteralPath $envFile)) {
  throw 'Execute scripts/start-360.ps1 primeiro.'
}

$workflowFiles = @(
  'wf-00-offline-entrada-diretor.json'
  'wf-02-registro-idempotente.json'
  'wf-03-registro-roteamento.json'
  'wf-05-gerente-geral-simulado.json'
  'wf-04-orquestracao-gerentes.json'
  'wf-06-motor-estado-360.json'
  'wf-07-assessor-executivo.json'
  'wf-08-consulta-estado-360.json'
  'wf-01-webhook-entrada-teste.json'
)

foreach ($workflowFile in $workflowFiles) {
  docker compose --env-file $envFile -f $composeFile exec -T n8n `
    n8n import:workflow --input="/files/workflows/$workflowFile"

  if ($LASTEXITCODE -ne 0) {
    throw "Falha na importação de $workflowFile. Consulte os logs do n8n e confirme que a conta proprietária local já foi criada."
  }
}

Write-Host 'Workflows OFFLINE_EVAL importados.'
