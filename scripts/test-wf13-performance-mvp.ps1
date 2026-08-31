[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$path = Join-Path $repo 'n8n/workflows/wf-13-gg-performance-mvp.json'
$workflow = Get-Content $path -Raw | ConvertFrom-Json
$raw = Get-Content $path -Raw

if ($workflow.id -ne '9eb8e86a-84b8-4aa9-97e4-360000000013') { throw 'ID canônico do WF-13 inválido.' }
if ($workflow.nodes.Count -ne 5) { throw 'WF-13 deve possuir cinco estágios mínimos.' }
if ($workflow.active -ne $true) { throw 'WF-13 deve estar ativo como subworkflow interno.' }
if (($workflow.nodes | Where-Object { $_.type -match 'webhook|scheduleTrigger|telegramTrigger' }).Count -ne 0) { throw 'WF-13 não pode expor gatilho externo.' }
if ($raw -match 'binary\.data|PDF_BINARY') { throw 'WF-13 não pode receber PDF bruto.' }
foreach ($capability in @('PERFORMANCE_SOURCES_RECONCILIATION','PERFORMANCE_SCORING_STATE','PERFORMANCE_GAP_SCENARIOS')) {
    if ($raw -notmatch $capability) { throw "Capacidade ausente: $capability" }
}
if ($raw -notmatch 'recalculated_points: false') { throw 'Proteção contra pontuação inventada ausente.' }
if ($raw -notmatch 'external_effects_allowed: false') { throw 'Bloqueio de efeitos externos ausente.' }
if ($raw -notmatch 'DOCUMENT_REPORTED') { throw 'Proveniência dos valores reportados ausente.' }
if ($raw -notmatch 'GOAL_DIRECTION_NOT_HOMOLOGATED') { throw 'Governança da direção de metas ausente.' }

Write-Host '[PASS] WF-13 recebe somente handoff estruturado'
Write-Host '[PASS] Fonte, indicadores, gaps e parecer separados'
Write-Host '[PASS] Pontos da fonte preservados sem recálculo inventado'
Write-Host '[PASS] Sem gatilhos ou efeitos externos'

& node (Join-Path $repo 'scripts/test-wf13-performance-runtime.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Execução determinística do WF-13 falhou.' }
Write-Host 'WF13_PERFORMANCE_MVP_PASS'
