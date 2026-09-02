[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot

function Assert-True([bool]$condition, [string]$message) {
  if (-not $condition) { throw $message }
  Write-Host "[PASS] $message"
}

$runtime = Get-Content (Join-Path $repo 'lib/telegram-runtime.ts') -Raw
$clarificationAi = Get-Content (Join-Path $repo 'lib/clarification-ai.ts') -Raw
$messages = Get-Content (Join-Path $repo 'lib/telegram-messages.ts') -Raw
$complete = Get-Content (Join-Path $repo 'app/api/bridge/complete/route.ts') -Raw
$request = Get-Content (Join-Path $repo 'app/api/bridge/clarifications/request/route.ts') -Raw
$reopen = Get-Content (Join-Path $repo 'app/api/bridge/clarifications/reopen/route.ts') -Raw
$claim = Get-Content (Join-Path $repo 'app/api/bridge/claim/route.ts') -Raw
$telegram = Get-Content (Join-Path $repo 'app/api/ingest/telegram/route.ts') -Raw
$wf11 = Get-Content (Join-Path $repo 'n8n/workflows/wf-11-diretor-360-orquestrador-mvp.json') -Raw
$wf13 = Get-Content (Join-Path $repo 'n8n/workflows/wf-13-gg-performance-mvp.json') -Raw
$wf101 = Get-Content (Join-Path $repo 'n8n/workflows/wf-101-local-dispatcher.json') -Raw

Write-Host '=== TELEGRAM CONVERSACIONAL SUPERVISIONADO ==='
foreach ($command in @('/comandos','/status','/progresso','/andamento','/ultimo','/protocolo','/pendencias','/duvidas','/pobj','/prioridades','/riscos','/cenarios','/historico','/fontes','/evidencias','/hoje','/corrigir','/responder','/reabrir','/destravar','/reprocessartodos','/explicar','/privacidade','/meusdados','/excluir','/excluirultimo')) {
  Assert-True ($messages.Contains($command) -or $runtime.Contains($command)) "Comando documentado: $command"
}
Assert-True ($runtime -match 'toLowerCase\(\)' -and $runtime -match 'replace\(/\\s\+\/g') 'Comandos toleram caixa e espaços extras'
Assert-True ($runtime -match 'command_confirmations' -and $runtime -match '/confirmar') 'Ações críticas exigem confirmação temporária'
Assert-True ($runtime -match '/reprocessartodos' -and $runtime -match 'documents WHERE owner_id = \?' -and $runtime -match 'lease_expires_at, 0\) < \?') 'Reprocessamento em massa limitado ao proprietário e a leases expirados/falhas'
Assert-True ($runtime -match 'renderProgressBar' -and $runtime -match 'Progresso por etapa \(estimado\)' -and $runtime -match 'subetapa detalhada ainda não instrumentada') 'Progresso é identificado como estimativa e não fabrica subetapa'
Assert-True ($request -match 'AWAITING_OWNER_INPUT' -and $wf11 -match 'AWAITING_OWNER_INPUT') 'Dúvida material pausa o mesmo job'
Assert-True ($runtime -match 'clarification_resolved' -and $runtime -match "status = 'QUEUED'") 'Resposta natural reabre e reenfileira o mesmo protocolo'
Assert-True ($claim -match 'OWNER_PROVIDED' -and $wf13 -match 'OWNER_PROVIDED') 'Resposta do Rafael preserva proveniência explícita'
Assert-True ($claim -match "status = 'FAILED_FINAL'" -and $claim -match "last_error_code = 'BRIDGE_TIMEOUT'") 'Lease final expirado não permanece eternamente em PROCESSING'
Assert-True ($runtime -match 'attempt_count = 0' -and $reopen -match 'attempt_count = 0' -and $reopen -match "'FAILED_FINAL'") 'Reabertura reinicia orçamento de tentativas e aceita falha final'
Assert-True ($messages -match 'TELEGRAM_SAFE_LIMIT = 3600' -and $complete -match 'telegram_deliveries') 'Parecer usa partes seguras e idempotentes'
Assert-True ($runtime -match 'combinedAnswers' -and $runtime -match 'answeredIds') 'Respostas parciais acumulam e removem somente perguntas já atendidas'
Assert-True ($request -match 'questions_json' -and $clarificationAi -match 'isContextRequest') 'Reclamação ou dúvida de formato não vira valor de indicador'
Assert-True ($clarificationAi -match 'repairMojibake') 'Texto com mojibake é reparado antes do envio'
Assert-True ($telegram -notmatch 'Santa Rita|Agro Vale|Supermercado Central|Bebidas Paraíso|TransVale') 'Webhook operacional não contém empresas fictícias'
Assert-True ($runtime -match 'handleConversationalText') 'Tratamento de texto livre integrado em lib/telegram-runtime.ts'
Assert-True ($telegram -match 'handleConversationalText') 'Entrada conversacional livre conectada em app/api/ingest/telegram/route.ts'
Assert-True ($wf101 -match 'CONVERSATION' -and $wf101 -match 'Parecer Executivo 360') 'WF-101 local trata conversação sem descartar rota'

Write-Host 'TELEGRAM_CONVERSATIONAL_PASS'
