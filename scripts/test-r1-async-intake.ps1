[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$siteRoute = Get-Content (Join-Path $repo 'app/api/pobj/import/route.ts') -Raw
$telegramRoute = Get-Content (Join-Path $repo 'app/api/ingest/telegram/route.ts') -Raw
$statusModule = Get-Content (Join-Path $repo 'lib/processing-status.ts') -Raw
$statusSchema = Get-Content (Join-Path $repo 'contracts/async-processing-status.schema.json') -Raw | ConvertFrom-Json

function Assert-True([bool]$condition, [string]$message) {
  if (-not $condition) { throw $message }
  Write-Host "[PASS] $message"
}

Write-Host '=== R1 - INTAKE ASSINCRONO ==='
Assert-True ($siteRoute -notmatch 'analyzeWithDirector|extractContent|getDocumentProxy|extractText') 'Upload do site nao executa IA ou extracao sincrona'
Assert-True ($siteRoute -match "'QUEUED'") 'Upload cria trabalho assíncrono QUEUED'
Assert-True ($siteRoute -match "status: 'RECEIVED'") 'Upload retorna confirmacao RECEIVED'
Assert-True ($siteRoute -match 'duplicate_ingest_ignored') 'Upload registra deduplicacao por hash'
Assert-True ($siteRoute -match "source IN \('pobj_mobile', 'telegram'\)") 'Deduplicacao e consulta abrangem site e Telegram'
Assert-True ($telegramRoute -match 'duplicateByHash') 'Telegram deduplica conteudo por hash'
Assert-True ($telegramRoute -notmatch 'Processando no GG Performance') 'Telegram nao afirma processamento de Gerentes antes da hora'
Assert-True ($telegramRoute -match 'DOCUMENTO RECEBIDO E ENFILEIRADO') 'Telegram confirma somente recebimento e fila'

$states = @('RECEIVED', 'PROCESSING', 'AWAITING_RETRY', 'READY_FOR_REVIEW', 'COMPLETED', 'ERROR')
foreach ($state in $states) {
  Assert-True ($statusModule.Contains("'$state'")) "Estado $state implementado"
  Assert-True ($statusSchema.properties.state.enum -contains $state) "Estado $state documentado no schema"
}
Assert-True ($statusSchema.'$schema' -eq 'https://json-schema.org/draft/2020-12/schema') 'Contrato usa JSON Schema Draft 2020-12'

Write-Host 'R1_ASYNC_INTAKE: PASS'
