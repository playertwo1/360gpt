[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$compose = Join-Path $repo 'compose.n8n.yaml'
$envFile = Join-Path $repo '.env.n8n'

docker compose --env-file $envFile -f $compose restart mineru
if ($LASTEXITCODE -ne 0) { throw 'Falha ao reiniciar o MinerU.' }

$healthy = $false
for ($attempt = 0; $attempt -lt 30; $attempt++) {
    $status = docker inspect --format '{{.State.Health.Status}}' visao-360-mineru-1 2>$null
    if ($status -eq 'healthy') { $healthy = $true; break }
    Start-Sleep -Seconds 3
}
if (-not $healthy) { throw 'MinerU não voltou ao estado saudável.' }

Write-Host 'Memória do MinerU liberada; serviço saudável e pronto para o próximo arquivo.' -ForegroundColor Green
