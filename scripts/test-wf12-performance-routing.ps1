[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$path = Join-Path $repo 'n8n/workflows/wf-12-diretor-roteamento-performance-mvp.json'
$schemaPath = Join-Path $repo 'contracts/routing-decision.schema.json'

$workflow = Get-Content $path -Raw | ConvertFrom-Json
$schema = Get-Content $schemaPath -Raw | ConvertFrom-Json
$raw = Get-Content $path -Raw

if ($workflow.name -notmatch 'Roteamento Performance') { throw 'WF-12 não identificado.' }
if ($workflow.nodes.Count -ne 2) { throw 'WF-12 deve conter somente entrada e roteamento mínimo.' }
if ($workflow.active -ne $true) { throw 'WF-12 deve estar ativo para ser chamado internamente pelo WF-11.' }
if (($workflow.nodes | Where-Object { $_.type -match 'webhook|scheduleTrigger|telegramTrigger' }).Count -ne 0) {
    throw 'WF-12 interno não pode expor webhook, agenda ou gatilho Telegram.'
}
if ($schema.'$schema' -ne 'https://json-schema.org/draft/2020-12/schema') { throw 'Contrato de roteamento não usa Draft 2020-12.' }
if ($raw -notmatch 'GERENTE_GERAL_PERFORMANCE') { throw 'Handoff para Performance ausente.' }
if ($raw -notmatch 'PERFORMANCE_SOURCES_RECONCILIATION' -or $raw -notmatch 'PERFORMANCE_SCORING_STATE') { throw 'Especialistas mínimos ausentes.' }
if ($raw -notmatch "\['conta','financeiro','relacionamento'\]") { throw 'Exclusão dos demais Gerentes não está explícita.' }
if ($raw -notmatch 'external_effects_allowed: false') { throw 'Efeitos externos não estão bloqueados.' }
if ($raw -notmatch 'MANUAL_REVIEW_REQUIRED') { throw 'Fallback de revisão manual ausente.' }
if ($raw -match 'PDF_BINARY|binary\.data') { throw 'WF-12 não pode receber PDF bruto.' }

Write-Host '[PASS] WF-12 recebe apenas extração estruturada'
Write-Host '[PASS] WF-12 ativo somente como subworkflow interno'
Write-Host '[PASS] POBJ/metas roteiam exclusivamente para Performance'
Write-Host '[PASS] Especialistas mínimos e revisão de ambiguidade definidos'
Write-Host '[PASS] Efeitos externos bloqueados'
Write-Host 'WF12_PERFORMANCE_ROUTING_PASS'
