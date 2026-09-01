[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$schema = Join-Path $repo 'contracts/document-extraction.schema.json'

function Invoke-WslDocker {
    param([Parameter(Mandatory = $true)][string[]]$Arguments)
    & wsl.exe -d Ubuntu -u root --cd $repo -- docker @Arguments
}

Write-Host '=== MINERU MANUAL RESERVE ==='

Invoke-WslDocker @('compose', '--env-file', '.env.n8n', '-f', 'compose.n8n.yaml', 'config', '--quiet')
if ($LASTEXITCODE -ne 0) { throw 'Invalid Docker Compose configuration' }

$imageId = Invoke-WslDocker @('image', 'inspect', 'diretor360/mineru:3.4.5', '--format', '{{.Id}}') 2>$null
if (-not $imageId) { throw 'MinerU 3.4.5 reserve image is unavailable' }
$running = Invoke-WslDocker @('inspect', '--format', '{{.State.Running}}', 'visao-360-mineru-1') 2>$null
if ($running -eq 'true') { throw 'MinerU must remain stopped outside an audited manual contingency' }

$workerConfig = Invoke-WslDocker @('compose', '--profile', 'mineru-manual', '--env-file', '.env.n8n', '-f', 'compose.n8n.yaml', 'config') | Out-String
if ($workerConfig -notmatch 'profiles:\s*\r?\n\s*- mineru-manual') { throw 'MinerU must require the manual profile' }
if ($workerConfig -notmatch 'DOCUMENT_MINERU_ENABLED: "false"') { throw 'Automatic MinerU routing must remain disabled' }
if ($workerConfig -notmatch 'MINERU_PROCESSING_WINDOW_SIZE: "1"') { throw 'MinerU processing window must remain limited to one' }

$contract = Get-Content -Raw $schema | ConvertFrom-Json
$methods = $contract.properties.extraction.properties.extraction_method.enum
if ($methods -notcontains 'MINERU_PIPELINE' -or $methods -notcontains 'MINERU_HYBRID') {
    throw 'Document extraction contract does not include MinerU methods'
}

Write-Host '[PASS] Compose configuration'
Write-Host '[PASS] MinerU 3.4.5 image preserved'
Write-Host '[PASS] MinerU stopped and excluded from automatic routing'
Write-Host '[PASS] Single-request resource guard'
Write-Host '[PASS] Manual profile and one-item window'
Write-Host '[PASS] Extraction contract'
Write-Host 'MINERU_MANUAL_RESERVE: PASS'
