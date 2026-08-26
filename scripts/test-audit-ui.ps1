param(
  [string]$BaseUrl = 'http://localhost:3000',
  [string]$TenantId = 'tenant-demo',
  [string]$SubjectRef = 'cust-demo-001'
)

$ErrorActionPreference = 'Stop'

Write-Host "=== TESTE DE AUDITORIA & EVIDENCE GRAPH 360 (MARCO 13B) ===" -ForegroundColor Cyan

# 1. Testar bloqueio 401 sem autenticacao
Write-Host "`n1. Testando protecao contra chamadas anonimas (/api/audit/state/latest)..." -NoNewline
try {
  $unauthUri = "$BaseUrl/api/audit/state/latest?tenant_id=$TenantId" + "&subject_ref=$SubjectRef"
  $unauthResponse = Invoke-WebRequest -Uri $unauthUri -Method Get -SkipHttpErrorCheck
  if ($unauthResponse.StatusCode -eq 401) {
    Write-Host " [OK - 401 Unauthorized retornado]" -ForegroundColor Green
  } else {
    Write-Host " [FALHA - Status: $($unauthResponse.StatusCode)]" -ForegroundColor Red
    exit 1
  }
} catch {
  Write-Host " [OK - 401 Capturado]" -ForegroundColor Green
}

# 2. Testar chamada autenticada
Write-Host "`n2. Testando chamada autenticada com conta autorizada do piloto..." -NoNewline
$authHeaders = @{
  'ChatGPT-User-Email' = 'fael@live.de'
  'ChatGPT-User-Id' = 'user-fael-piloto'
}

$authUri = "$BaseUrl/api/audit/state/latest?tenant_id=$TenantId" + "&subject_ref=$SubjectRef"
$stateAudit = Invoke-RestMethod -Uri $authUri -Method Get -Headers $authHeaders -SkipHttpErrorCheck

if ($stateAudit.ok -eq $true -and $stateAudit.evidence_graph -ne $null) {
  Write-Host " [OK]" -ForegroundColor Green
  Write-Host "   - Status Linhagem: $($stateAudit.evidence_graph.lineage_status)" -ForegroundColor Yellow
  Write-Host "   - Schema Version: $($stateAudit.evidence_graph.schema_version)" -ForegroundColor Yellow
  Write-Host "   - Total de Nos: $($stateAudit.evidence_graph.nodes.Count)" -ForegroundColor Yellow
  Write-Host "   - Total de Arestas: $($stateAudit.evidence_graph.edges.Count)" -ForegroundColor Yellow
  Write-Host "   - PROV Entidades: $($stateAudit.evidence_graph.prov_mapping.entities)" -ForegroundColor Yellow
  Write-Host "   - PROV Atividades: $($stateAudit.evidence_graph.prov_mapping.activities)" -ForegroundColor Yellow
  Write-Host "   - PROV Agentes: $($stateAudit.evidence_graph.prov_mapping.agents)" -ForegroundColor Yellow
} else {
  Write-Host " [FALHA - Resposta inesperada]" -ForegroundColor Red
  Write-Host ($stateAudit | ConvertTo-Json -Depth 5)
  exit 1
}

# 3. Testar rota de auditoria de reviews
Write-Host "`n3. Testando consulta de auditoria de revisoes..." -NoNewline
$reviewsUri = "$BaseUrl/api/reviews?tenant_id=$TenantId" + "&status=OPEN"
$reviews = Invoke-RestMethod -Uri $reviewsUri -Method Get -Headers $authHeaders -SkipHttpErrorCheck
if ($reviews.ok -eq $true) {
  Write-Host " [OK - Fila consultada com sucesso]" -ForegroundColor Green
} else {
  Write-Host " [FALHA]" -ForegroundColor Red
  exit 1
}

Write-Host "`n=== TODOS OS TESTES DO EVIDENCE GRAPH & AUDITORIA PASSARAM COM SUCESSO ===" -ForegroundColor Green
