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
Assert-True ($workflow.nodes.Count -ge 9) 'Pipeline possui estagios minimos'
$names = @($workflow.nodes.name)
foreach ($required in @('02 Reservar job com lease','04 Baixar original protegido','05 Leitor documental subordinado','06 Validar saída estruturada','08 Concluir e persistir','09 Registrar falha e retry')) { Assert-True ($names -contains $required) "No presente: $required" }
$raw = Get-Content $path -Raw
Assert-True ($raw -match 'external_effects_allowed') 'Efeitos externos bloqueados'
Assert-True ($raw -match 'document-worker:8787') 'Worker usa rede interna Docker'
Assert-True (($raw -match '/api/bridge/claim') -and ($raw -match 'document\.download_path') -and ($raw -match '/api/bridge/fail')) 'Ponte duravel conectada'
Write-Host 'WF11_N8N_MASTER: PASS'
