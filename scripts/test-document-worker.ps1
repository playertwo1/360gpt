[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot

function Invoke-WslDocker {
    param([Parameter(Mandatory = $true)][string[]]$Arguments)
    & wsl.exe -d Ubuntu -u root --cd $repo -- docker @Arguments
}

Write-Host '=== DOCUMENT WORKER OCR ==='
python -m py_compile (Join-Path $repo 'services/document-worker/app/main.py')
if ($LASTEXITCODE -ne 0) { throw 'Python syntax validation failed' }

Invoke-WslDocker @('compose', '--env-file', '.env.n8n', '-f', 'compose.n8n.yaml', 'up', '-d', '--no-build', 'document-worker')
if ($LASTEXITCODE -ne 0) { throw 'Document worker start failed' }

$healthy = $false
for ($attempt = 0; $attempt -lt 24; $attempt++) {
  $status = Invoke-WslDocker @('inspect', '--format', '{{.State.Health.Status}}', 'visao-360-document-worker-1') 2>$null
  if ($status -eq 'healthy') { $healthy = $true; break }
  Start-Sleep -Seconds 2
}
if (-not $healthy) { Invoke-WslDocker @('compose', '--env-file', '.env.n8n', '-f', 'compose.n8n.yaml', 'logs', '--tail=80', 'document-worker'); throw 'Document worker did not become healthy' }

$health = Invoke-WslDocker @('compose', '--env-file', '.env.n8n', '-f', 'compose.n8n.yaml', 'exec', '-T', 'n8n', 'wget', '-qO-', 'http://document-worker:8787/health')
if ($LASTEXITCODE -ne 0 -or $health -notmatch '"status":"ok"') { throw 'n8n cannot reach document worker' }

Invoke-WslDocker @('compose', '--env-file', '.env.n8n', '-f', 'compose.n8n.yaml', 'exec', '-T', 'document-worker', 'python', '-m', 'app.smoke_test')
if ($LASTEXITCODE -ne 0) { throw 'OCR or native PDF extraction smoke test failed' }

Write-Host '[PASS] Python syntax'
Write-Host '[PASS] Container healthy'
Write-Host '[PASS] n8n reaches worker over internal Docker network'
Write-Host '[PASS] OCR image and native PDF extraction'
Write-Host 'DOCUMENT_WORKER_OCR: PASS'
