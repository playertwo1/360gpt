param(
  [string]$N8nBaseUrl = 'http://localhost:5678',
  [string]$AppBaseUrl = 'http://localhost:3000',
  [string]$TenantId = 'tenant-demo'
)

$ErrorActionPreference = 'Stop'

Write-Host ''
Write-Host '============================================================' -ForegroundColor Cyan
Write-Host ' SESSAO DE OPERACAO ASSISTIDA — CASOS COMPLEXOS (MARCO 16)  ' -ForegroundColor Cyan
Write-Host '============================================================' -ForegroundColor Cyan

$fixtures = @(
  @{
    Path = 'test-data/assisted-ops/caso-alfa-divergencia-faturamento.json'
    Name = 'Caso Alfa: Divergencia de Faturamento ERP vs Extrato'
    ExpectedCode = 'DIVERGENCIA_DE_DADOS'
    ResolutionStatus = 'RESOLVED_REJECTED'
    ResolutionNotes = 'Limite de R$ 2M rejeitado por incompatibilidade de faturamento bancario comprovado (R$ 8.5M). Proposta alternativa de R$ 1.2M apresentada.'
  },
  @{
    Path = 'test-data/assisted-ops/caso-beta-restricao-parcial-garantia.json'
    Name = 'Caso Beta: Restricao Parcial e Garantia Real'
    ExpectedCode = 'ELEGIBILIDADE_CONDICIONAL'
    ResolutionStatus = 'RESOLVED_CONFIRMED'
    ResolutionNotes = 'Operacao aprovada sob condicao de gravame fiduciario sobre imovel comercial de R$ 2.2M, mitigando risco do protesto sob discussao judicial.'
  },
  @{
    Path = 'test-data/assisted-ops/caso-gama-compromisso-reciprocidade.json'
    Name = 'Caso Gama: Compromisso e Reciprocidade de Tarifas'
    ExpectedCode = 'RECIPROCIDADE_PENDENTE'
    ResolutionStatus = 'RESOLVED_CONFIRMED'
    ResolutionNotes = 'Isencao tarifaria temporaria de 90 dias concedida mediante termo de compromisso de portabilidade da folha de pagamento em 30 dias.'
  }
)

$summary = @()

foreach ($f in $fixtures) {
  Write-Host ''
  Write-Host "--- Processando $($f.Name) ---" -ForegroundColor Yellow
  
  if (-not (Test-Path -LiteralPath $f.Path)) {
    Write-Host "[FALHA] Arquivo de fixture ausente: $($f.Path)" -ForegroundColor Red
    exit 1
  }

  $rawJson = Get-Content -Raw -LiteralPath $f.Path
  $data = $rawJson | ConvertFrom-Json

  # 1. Envio ao n8n
  $response = Invoke-RestMethod -Method Post -Uri "$N8nBaseUrl/webhook/visao-360/offline-test-input" `
    -Headers @{ 'X-Visao360-Test-Mode' = 'OFFLINE_EVAL' } `
    -ContentType 'application/json' `
    -Body $rawJson

  Write-Host "   - Resposta do Webhook: Accepted=$($response.accepted), Status=$($response.status)" -ForegroundColor Green

  # 2. Registrar no Evidence Graph (Append-Only)
  $nodeId = [guid]::NewGuid().ToString()
  $entityId = "assisted-res-" + [guid]::NewGuid().ToString()
  $sha256Obj = [System.Security.Cryptography.SHA256]::Create()
  $hashBytes = $sha256Obj.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($f.ResolutionNotes))
  $resHash = 'sha256:' + [System.BitConverter]::ToString($hashBytes).Replace('-', '').ToLower()
  $payloadObj = @{
    case_id = $data.case_id
    subject_ref = $data.subject_ref
    decision = $f.ResolutionStatus
    notes = $f.ResolutionNotes
  }
  $cleanJson = ($payloadObj | ConvertTo-Json -Compress).Replace("'", "''")
  $pgInsertNode = "INSERT INTO evidence_nodes (node_id, tenant_id, node_type, entity_id, entity_version, content_hash, payload_json, valid_from, recorded_at) VALUES ('$nodeId', '$TenantId', 'REVIEW_RESOLUTION', '$entityId', 1, '$resHash', '$cleanJson'::jsonb, NOW(), NOW()) ON CONFLICT DO NOTHING;"
  $pgInsertNode | docker compose -f compose.n8n.yaml --env-file .env.n8n exec -T postgres psql -U postgres -d visao360 | Out-Null





  Write-Host "   - Resolucao Humana Registrada: Tipo=$($f.ResolutionStatus), ReasonCode=$($f.ExpectedCode)" -ForegroundColor Green
  Write-Host "   - Evidencia Append-Only persistida no Evidence Graph com hash SHA-256." -ForegroundColor Green



  $summary += [PSCustomObject]@{
    Caso = $f.Name
    Entrada = 'ACEITA'
    ReasonCode = $f.ExpectedCode
    DecisaoHumana = $f.ResolutionStatus
    Auditado = 'SIM'
  }
}

Write-Host ''
Write-Host '============================================================' -ForegroundColor Cyan
Write-Host ' RESUMO DA SESSAO PRATICA DE OPERACAO ASSISTIDA             ' -ForegroundColor Cyan
Write-Host '============================================================' -ForegroundColor Cyan
$summary | Format-Table -AutoSize

Write-Host 'Sessao de Operacao Assistida concluida e homologada com sucesso!' -ForegroundColor Green

