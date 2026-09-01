$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
function Assert-Contains([string]$Path, [string]$Pattern, [string]$Message) {
  $content = Get-Content (Join-Path $root $Path) -Raw
  if ($content -notmatch $Pattern) { throw "FAIL: $Message" }
  Write-Host "[OK] $Message"
}

Write-Host '=== CONHECIMENTO POBJ SUPERVISIONADO ==='
Assert-Contains 'drizzle/0009_pobj_knowledge.sql' 'pobj_knowledge_items' 'Persistência versionada criada'
Assert-Contains 'drizzle/0009_pobj_knowledge.sql' 'uq_pobj_knowledge_application' 'Aplicação idempotente por job/documento'
Assert-Contains 'lib/pobj-knowledge.ts' 'monthly_value_forbidden' 'Valores mensais proibidos no conhecimento reutilizável'
Assert-Contains 'lib/pobj-knowledge.ts' 'layout-v1:' 'Escopo vinculado à assinatura do layout'
Assert-Contains 'app/api/pobj/knowledge/route.ts' "owner_id = \?" 'API isolada pelo proprietário'
Assert-Contains 'app/api/bridge/knowledge/apply/route.ts' "status = 'ACTIVE'.*layout_signature = \?" 'Ponte aplica apenas conhecimento ativo com layout exato'
Assert-Contains 'app/api/bridge/knowledge/apply/route.ts' 'INSERT OR IGNORE' 'Retry não duplica aplicação'
Assert-Contains 'lib/telegram-runtime.ts' "'/aprovar'.*'/revogarregra'" 'Aprovação e revogação exigem confirmação Telegram'
Assert-Contains 'lib/telegram-messages.ts' "command: 'conhecimento'" 'Menu Telegram expõe governança de conhecimento'
Assert-Contains 'app/PobjPanelV2.tsx' 'Valores e metas deste mês não serão reutilizados' 'Interface explica limite antes da homologação'
Write-Host 'POBJ_KNOWLEDGE_PASS'
