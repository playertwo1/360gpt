[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$compose = Join-Path $repo 'compose.n8n.yaml'
$envFile = Join-Path $repo '.env.n8n'

function Invoke-WslDocker {
    param([Parameter(Mandatory = $true)][string[]]$Arguments)
    & wsl.exe -d Ubuntu -u root --cd $repo -- docker @Arguments
}

Invoke-WslDocker @('compose', '--profile', 'mineru-manual', '--env-file', '.env.n8n', '-f', 'compose.n8n.yaml', 'stop', 'mineru')
if ($LASTEXITCODE -ne 0) { throw 'Falha ao parar o MinerU.' }
$running = Invoke-WslDocker @('inspect', '--format', '{{.State.Running}}', 'visao-360-mineru-1') 2>$null
if ($running -eq 'true') { throw 'MinerU permaneceu ativo.' }
Write-Host 'Memória liberada: MinerU parado e preservado como contingência manual.' -ForegroundColor Green
