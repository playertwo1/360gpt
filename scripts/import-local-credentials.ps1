[CmdletBinding()]
param([string]$BridgeSecretOverride)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $projectRoot '.env.n8n'
$composeFile = Join-Path $projectRoot 'compose.n8n.yaml'
$localDir = Join-Path $projectRoot '.local'
$credentialFile = Join-Path $localDir 'visao360-local-credentials.json'
$credentialId = '3db02591-5cd1-47ef-ac68-3cdb4b213602'
$bridgeCredentialId = '865fb0bd-dbd8-4352-9718-4eac7f89a382'

if (-not (Test-Path -LiteralPath $envFile)) {
  throw 'Execute scripts/start-360.ps1 primeiro.'
}

$settings = Get-Content -LiteralPath $envFile -Raw | ConvertFrom-StringData
$password = $settings['APP_DB_PASSWORD']
if ([string]::IsNullOrWhiteSpace($password)) { throw 'APP_DB_PASSWORD não encontrado.' }
$bridgeSecret = $settings['BRIDGE_SHARED_SECRET']
if (-not [string]::IsNullOrWhiteSpace($BridgeSecretOverride)) { $bridgeSecret = $BridgeSecretOverride }
if ([string]::IsNullOrWhiteSpace($bridgeSecret)) { throw 'BRIDGE_SHARED_SECRET não encontrado. Execute scripts/start-360.ps1 novamente.' }

New-Item -ItemType Directory -Force -Path $localDir | Out-Null
$credential = @(
  @{
    id = $credentialId
    name = 'Visao 360 App DB'
    type = 'postgres'
    data = @{
      host = 'postgres'
      database = 'visao360'
      user = 'visao360_app'
      password = $password
      maxConnections = 5
      allowUnauthorizedCerts = $false
      ssl = 'disable'
      port = 5432
    }
  }
  @{
    id = $bridgeCredentialId
    name = 'Visao 360 Bridge'
    type = 'httpHeaderAuth'
    data = @{
      name = 'Authorization'
      value = "Bearer $bridgeSecret"
    }
  }
)
[IO.File]::WriteAllText(
  $credentialFile,
  (ConvertTo-Json -InputObject @($credential) -Depth 6),
  [Text.UTF8Encoding]::new($false)
)

try {
  $projectId = docker compose --env-file $envFile -f $composeFile exec -T postgres `
    psql -U postgres -d n8n -Atc "SELECT id FROM project WHERE type='personal' LIMIT 1;"
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($projectId)) {
    throw 'Projeto pessoal do n8n não encontrado.'
  }
  $projectId = ($projectId | Select-Object -Last 1).Trim()

  docker compose --env-file $envFile -f $composeFile exec -T n8n `
    n8n import:credentials --input=/files/local/visao360-local-credentials.json --projectId=$projectId
  if ($LASTEXITCODE -ne 0) { throw 'Falha ao importar as credenciais locais.' }
} finally {
  $resolvedLocal = [IO.Path]::GetFullPath($localDir)
  $resolvedCredential = [IO.Path]::GetFullPath($credentialFile)
  if (-not $resolvedCredential.StartsWith($resolvedLocal, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Caminho temporário da credencial saiu do diretório local esperado.'
  }
  if (Test-Path -LiteralPath $resolvedCredential) {
    Remove-Item -LiteralPath $resolvedCredential -Force
  }
}

Write-Host 'Credenciais do banco e da ponte importadas; arquivo temporário removido.'
