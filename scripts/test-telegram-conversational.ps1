[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot

function Assert-True([bool]$condition, [string]$message) {
  if (-not $condition) { throw $message }
  Write-Host "[PASS] $message"
}

$runtime = Get-Content (Join-Path $repo 'lib/telegram-runtime.ts') -Raw
$legacyRuntime = Get-Content (Join-Path $repo 'legacy/telegram-runtime.ts') -Raw
$clarificationAi = Get-Content (Join-Path $repo 'lib/clarification-ai.ts') -Raw
$messages = Get-Content (Join-Path $repo 'lib/telegram-messages.ts') -Raw
$telegram = Get-Content (Join-Path $repo 'app/api/ingest/telegram/route.ts') -Raw
$catalog = Get-Content (Join-Path $repo 'engines/orchestration/telegram-commands-catalog.mjs') -Raw
$wf11 = Get-Content (Join-Path $repo 'n8n/workflows/wf-11-diretor-360-orquestrador-mvp.json') -Raw
$wf13 = Get-Content (Join-Path $repo 'n8n/workflows/wf-13-gg-performance-mvp.json') -Raw
$wf101 = Get-Content (Join-Path $repo 'n8n/workflows/wf-101-local-dispatcher.json') -Raw
$wf102 = Get-Content (Join-Path $repo 'n8n/workflows/wf-102-telegram-delivery.json') -Raw
$wf103 = Get-Content (Join-Path $repo 'n8n/workflows/wf-103-local-error-contingency.json') -Raw

Write-Host '=== TELEGRAM CONVERSACIONAL E COMANDOS CANÔNICOS N8N ==='

# 1. Comandos documentados no catálogo n8n e mensagens
foreach ($command in @('/comandos','/status','/protocolo','/pendencias','/pobj','/indicador','/fontes','/evidencias','/diretrizes','/aprovardiretriz','/revogardiretriz')) {
  Assert-True ($wf101.Contains($command) -or $catalog.Contains($command)) "Comando suportado no n8n/catálogo: $command"
}

# 2. Tolerância a caixa e espaços
Assert-True ($runtime -match 'toLowerCase\(\)' -and $runtime -match 'replace\(/\\s\+\/g') 'Comandos toleram caixa e espaços extras no adaptador'

# 3. Governança de Arquitetura: lib/telegram-runtime.ts NÃO executa queries de negócio nem handlers
Assert-True ($runtime -notmatch 'documents WHERE owner_id' -and $runtime -notmatch 'handleConversationalText') 'lib/telegram-runtime.ts é estritamente adaptador de transporte neutro'
Assert-True ($legacyRuntime -match 'documents WHERE owner_id' -and $legacyRuntime -match 'handleConversationalText') 'Lógica legada devidamente arquivada em legacy/telegram-runtime.ts'

# 4. Respostas e estados n8n
Assert-True ($wf11 -match 'AWAITING_OWNER_INPUT') 'Dúvida material pausa o mesmo job'
Assert-True ($wf13 -match 'OWNER_PROVIDED') 'Resposta do Rafael preserva proveniência explícita'
Assert-True ($wf101 -match "lease_expires_at = now\(\) \+ interval '2 minutes'") 'Lease final expirado não permanece eternamente em PROCESSING'
Assert-True ($wf101 -match 'attempt_count = attempt_count \+ 1') 'Tentativas instrumentadas no n8n'
Assert-True ($wf102 -match 'part_index') 'Parecer usa partes seguras e idempotentes'

# 5. Higienização e segurança
Assert-True ($clarificationAi -match 'repairMojibake') 'Texto com mojibake é reparado antes do envio'
Assert-True ($telegram -notmatch 'Santa Rita|Agro Vale|Supermercado Central|Bebidas Paraíso|TransVale|Hospital São Lucas|Metalúrgica Forja Sul') 'Transporte não contém empresas fictícias ou hardcoded'
Assert-True ($wf101 -notmatch 'Hospital São Lucas|Metalúrgica Forja Sul|420 mil') 'WF-101 não contém fatos ou empresas codificadas'
Assert-True ($telegram -match 'telegram_inbound_events' -and $telegram -notmatch 'handleConversationalText') 'Entrada enfileira exclusivamente no n8n sem execução de negócio no edge'
Assert-True ($wf101 -match 'CONVERSATION') 'WF-101 local trata conversação sem descartar rota'

Write-Host 'TELEGRAM_CONVERSATIONAL_PASS'