[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$path = Join-Path $repo 'n8n/workflows/wf-11-diretor-360-orquestrador-mvp.json'
$workflow = Get-Content $path -Raw | ConvertFrom-Json
function Assert-True([bool]$condition, [string]$message) { if (-not $condition) { throw $message }; Write-Host "[PASS] $message" }
Write-Host '=== WF-11 N8N MASTER ==='
Assert-True ($workflow.name -match 'Orquestrador Mestre') 'Workflow mestre identificado'
Assert-True ($workflow.active -eq $false) 'Workflow inativo ate homologacao manual'
Assert-True ($workflow.nodes.Count -ge 12) 'Pipeline possui estágios mínimos até o Diretor'
$names = @($workflow.nodes.name)
foreach ($required in @('00 Executar manualmente','02 Reservar job com lease','04 Baixar original protegido','05 Leitor documental subordinado','06 Validar saída estruturada','10 Acionar Diretor mínimo','11 Validar handoff Performance','12 Roteamento Performance válido?','08 Concluir e persistir','09 Registrar falha e retry')) { Assert-True ($names -contains $required) "No presente: $required" }
$raw = Get-Content $path -Raw
Assert-True ($raw -match 'external_effects_allowed') 'Efeitos externos bloqueados'
Assert-True ($raw -match 'document-worker:8787') 'Worker usa rede interna Docker'
Assert-True (($raw -match '/api/bridge/claim') -and ($raw -match 'document\.download_path') -and ($raw -match '/api/bridge/fail')) 'Ponte duravel conectada'
Assert-True (($raw -match '360000000012') -and ($raw -match 'GERENTE_GERAL_PERFORMANCE')) 'Diretor mínimo e handoff Performance conectados'
Write-Host 'WF11_N8N_MASTER: PASS'
