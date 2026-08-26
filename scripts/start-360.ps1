[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $projectRoot '.env.n8n'
$composeFile = Join-Path $projectRoot 'compose.n8n.yaml'
$localDir = Join-Path $projectRoot '.local'

function New-HexSecret([int]$Bytes) {
  return [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes($Bytes)).ToLowerInvariant()
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw 'Docker não foi encontrado no PATH.'
}

docker info *> $null
if ($LASTEXITCODE -ne 0) {
  throw 'Docker Desktop não está pronto. Aguarde o status Running e tente novamente.'
}

if (-not (Test-Path -LiteralPath $envFile)) {
  $values = @(
    "POSTGRES_ADMIN_PASSWORD=$(New-HexSecret 24)"
    "N8N_DB_PASSWORD=$(New-HexSecret 24)"
    "APP_DB_PASSWORD=$(New-HexSecret 24)"
    "N8N_ENCRYPTION_KEY=$(New-HexSecret 48)"
  )
  [IO.File]::WriteAllLines($envFile, $values, [Text.UTF8Encoding]::new($false))
  Write-Host 'Credenciais locais criadas em .env.n8n (arquivo ignorado pelo Git).'
}

New-Item -ItemType Directory -Force -Path $localDir | Out-Null

docker compose --env-file $envFile -f $composeFile up -d
if ($LASTEXITCODE -ne 0) { throw 'Não foi possível iniciar os containers.' }

$deadline = (Get-Date).AddMinutes(4)
do {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:5678/healthz' -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
      Write-Host 'Visão 360 local está pronta em http://localhost:5678'
      exit 0
    }
  } catch {
    Start-Sleep -Seconds 3
  }
} while ((Get-Date) -lt $deadline)

docker compose --env-file $envFile -f $composeFile ps
throw 'O n8n não ficou saudável dentro do tempo esperado. Consulte os logs do container.'
