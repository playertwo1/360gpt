[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$schema = Join-Path $repo 'contracts/document-extraction.schema.json'

function Invoke-WslDocker {
    param([Parameter(Mandatory = $true)][string[]]$Arguments)
    & wsl.exe -d Ubuntu -u root --cd $repo -- docker @Arguments
}

Write-Host '=== MINERU INTERNAL PARSER ==='

Invoke-WslDocker @('compose', '--env-file', '.env.n8n', '-f', 'compose.n8n.yaml', 'config', '--quiet')
if ($LASTEXITCODE -ne 0) { throw 'Invalid Docker Compose configuration' }

$imageVersion = Invoke-WslDocker @('exec', 'visao-360-mineru-1', 'mineru', '--version')
if ($LASTEXITCODE -ne 0 -or $imageVersion -notmatch '3\.4\.5') {
    throw 'MinerU 3.4.5 container is unavailable'
}

$healthRaw = Invoke-WslDocker @('compose', '--env-file', '.env.n8n', '-f', 'compose.n8n.yaml', 'exec', '-T', 'n8n', 'wget', '-qO-', 'http://mineru:8000/health')
if ($LASTEXITCODE -ne 0) { throw 'n8n cannot reach MinerU over the internal network' }
$health = $healthRaw | ConvertFrom-Json
if ($health.status -ne 'healthy' -or $health.version -ne '3.4.5') { throw 'MinerU health contract failed' }
if ($health.max_concurrent_requests -ne 1) { throw 'MinerU concurrency must remain limited to one request' }

$workerConfig = Invoke-WslDocker @('compose', '--env-file', '.env.n8n', '-f', 'compose.n8n.yaml', 'config') | Out-String
if ($workerConfig -notmatch 'MINERU_PDF_PRIMARY_BACKEND: pipeline') { throw 'PDF must start with the economical pipeline backend' }
if ($workerConfig -notmatch 'MINERU_HYBRID_ESCALATION_ENABLED: "true"') { throw 'Hybrid escalation must remain enabled' }
if ($workerConfig -notmatch 'MINERU_PROCESSING_WINDOW_SIZE: "1"') { throw 'MinerU processing window must remain limited to one' }

$contract = Get-Content -Raw $schema | ConvertFrom-Json
$methods = $contract.properties.extraction.properties.extraction_method.enum
if ($methods -notcontains 'MINERU_PIPELINE' -or $methods -notcontains 'MINERU_HYBRID') {
    throw 'Document extraction contract does not include MinerU methods'
}

Write-Host '[PASS] Compose configuration'
Write-Host '[PASS] MinerU 3.4.5 image and all local models'
Write-Host '[PASS] Internal n8n to MinerU connectivity'
Write-Host '[PASS] Single-request resource guard'
Write-Host '[PASS] Adaptive pipeline-to-hybrid routing and one-item window'
Write-Host '[PASS] Extraction contract'
Write-Host 'MINERU_INTEGRATION: PASS'
