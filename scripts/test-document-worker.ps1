[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$compose = Join-Path $repo 'compose.n8n.yaml'
$envFile = Join-Path $repo '.env.n8n'

Write-Host '=== DOCUMENT WORKER OCR ==='
python -m py_compile (Join-Path $repo 'services/document-worker/app/main.py')
if ($LASTEXITCODE -ne 0) { throw 'Python syntax validation failed' }

docker compose --env-file $envFile -f $compose up -d --build document-worker
if ($LASTEXITCODE -ne 0) { throw 'Document worker build failed' }

$healthy = $false
for ($attempt = 0; $attempt -lt 24; $attempt++) {
  $status = docker inspect --format '{{.State.Health.Status}}' visao-360-document-worker-1 2>$null
  if ($status -eq 'healthy') { $healthy = $true; break }
  Start-Sleep -Seconds 2
}
if (-not $healthy) { docker compose --env-file $envFile -f $compose logs --tail=80 document-worker; throw 'Document worker did not become healthy' }

$health = docker compose --env-file $envFile -f $compose exec -T n8n wget -qO- http://document-worker:8787/health
if ($LASTEXITCODE -ne 0 -or $health -notmatch '"status":"ok"') { throw 'n8n cannot reach document worker' }

docker compose --env-file $envFile -f $compose exec -T document-worker python -m app.smoke_test
if ($LASTEXITCODE -ne 0) { throw 'OCR or native PDF extraction smoke test failed' }

Write-Host '[PASS] Python syntax'
Write-Host '[PASS] Container healthy'
Write-Host '[PASS] n8n reaches worker over internal Docker network'
Write-Host '[PASS] OCR image and native PDF extraction'
Write-Host 'DOCUMENT_WORKER_OCR: PASS'
