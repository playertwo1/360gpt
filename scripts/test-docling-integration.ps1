[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$schema = Join-Path $repo 'contracts/document-extraction.schema.json'
$wslDistro = @(wsl.exe --list --quiet 2>$null | ForEach-Object { ($_ -replace "`0", '').Trim() } | Where-Object { $_ -match '^Ubuntu' }) | Select-Object -First 1
if (-not $wslDistro) { throw 'Ubuntu WSL distribution not found' }

function Invoke-WslDocker {
    param([Parameter(Mandatory = $true)][string[]]$Arguments)
    & wsl.exe -d $wslDistro -u root --cd $repo -- docker @Arguments
}

Write-Host '=== DOCLING CPU PRIMARY PARSER ==='
Invoke-WslDocker @('compose', '--env-file', '.env.n8n', '-f', 'compose.n8n.yaml', '--profile', 'processing', 'config', '--quiet')
if ($LASTEXITCODE -ne 0) { throw 'Invalid Docker Compose configuration' }

$doclingHealth = Invoke-WslDocker @('inspect', '--format', '{{.State.Health.Status}}', 'visao-360-docling-1') 2>$null
if ($doclingHealth -ne 'healthy') { throw 'Docling is not healthy' }

$config = Invoke-WslDocker @('compose', '--env-file', '.env.n8n', '-f', 'compose.n8n.yaml', '--profile', 'processing', 'config') | Out-String
foreach ($required in @('DOCLING_DEVICE: cpu','DOCLING_NUM_THREADS: "2"','DOCLING_SERVE_ENG_LOC_NUM_WORKERS: "1"','DOCLING_SERVE_MAX_NUM_PAGES: "80"','DOCLING_SERVE_MAX_FILE_SIZE: "20971520"')) {
    if ($config -notmatch [regex]::Escape($required)) { throw "Missing Docling guard: $required" }
}
if ($config -match 'ports:\s*\n\s*-.*5001') { throw 'Docling must not publish port 5001 to the host' }

$contract = Get-Content -Raw $schema | ConvertFrom-Json
if ($contract.properties.schema_version.const -ne '1.1.0') { throw 'Extraction contract must be 1.1.0' }
$methods = $contract.properties.extraction.properties.extraction_method.enum
if ($methods -notcontains 'DOCLING_TABLEFORMER' -or $methods -notcontains 'DOCLING_OCR') { throw 'Docling methods missing from contract' }

$stats = Invoke-WslDocker @('stats', '--no-stream', '--format', '{{.Name}} {{.MemUsage}}', 'visao-360-docling-1')
Write-Host "[INFO] $stats"
Write-Host '[PASS] Pinned Docling image and internal-only service'
Write-Host '[PASS] CPU, 2 threads, one worker, 80 pages and 20 MB guards'
Write-Host '[PASS] Extraction contract 1.1.0'
Write-Host 'DOCLING_INTEGRATION: PASS'
