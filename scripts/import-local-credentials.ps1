[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $projectRoot '.env.n8n'
$composeFile = Join-Path $projectRoot 'compose.n8n.yaml'
$localDir = Join-Path $projectRoot '.local'
$credentialFile = Join-Path $localDir 'visao360-postgres-credential.json'
$credentialId = '3db02591-5cd1-47ef-ac68-3cdb4b213602'

if (-not (Test-Path -LiteralPath $envFile)) {
  throw 'Execute scripts/start-360.ps1 primeiro.'
}

$settings = Get-Content -LiteralPath $envFile -Raw | ConvertFrom-StringData
$password = $settings['APP_DB_PASSWORD']
if ([string]::IsNullOrWhiteSpace($password)) { throw 'APP_DB_PASSWORD não encontrado.' }

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
)
[IO.File]::WriteAllText(
  $credentialFile,
  ($credential | ConvertTo-Json -Depth 6 -AsArray),
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
    n8n import:credentials --input=/files/local/visao360-postgres-credential.json --projectId=$projectId
  if ($LASTEXITCODE -ne 0) { throw 'Falha ao importar a credencial PostgreSQL.' }
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

Write-Host 'Credencial Visao 360 App DB importada e arquivo temporário removido.'
