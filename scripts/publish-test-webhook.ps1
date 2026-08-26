[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $projectRoot '.env.n8n'
$composeFile = Join-Path $projectRoot 'compose.n8n.yaml'
$workflowIds = @(
  'c194ab2e-427f-47ba-a963-acde2661d816'
  '80e66c34-8eae-444d-8164-acdf51e83d42'
  '5f136a17-a768-4a90-952c-66d2ca53134a'
  '04d21695-e5ad-4bc1-a529-526dab45c0ee'
  'dc6ba586-7bd7-4b22-a55b-155bedf96328'
  'cd588c3c-d11d-4888-9db2-120172075158'
  'de5f7ddc-0744-44b7-bb2d-4d10c99a44d7'
  'd9461ba5-f5b4-4f65-9ad9-a22d530b3360'
)

if (-not (Test-Path -LiteralPath $envFile)) {
  throw 'Execute scripts/start-360.ps1 primeiro.'
}

foreach ($workflowId in $workflowIds) {
  docker compose --env-file $envFile -f $composeFile exec -T n8n `
    n8n publish:workflow --id=$workflowId

  if ($LASTEXITCODE -ne 0) {
    throw "Não foi possível publicar o workflow $workflowId."
  }
}

docker compose --env-file $envFile -f $composeFile restart n8n
if ($LASTEXITCODE -ne 0) { throw 'Não foi possível reiniciar o n8n.' }

$deadline = (Get-Date).AddMinutes(2)
$ready = $false
do {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:5678/healthz' -TimeoutSec 3
    if ($response.StatusCode -eq 200) {
      $ready = $true
      break
    }
  } catch {
    Start-Sleep -Seconds 2
  }
} while ((Get-Date) -lt $deadline)

if (-not $ready) { throw 'O n8n não ficou saudável após publicar o webhook.' }

Write-Host 'Webhook OFFLINE_EVAL publicado em http://localhost:5678/webhook/visao-360/offline-test-input'
