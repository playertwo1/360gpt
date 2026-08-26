[CmdletBinding()]
param(
  [string]$BaseUrl = 'http://localhost:3000',
  [string]$BridgeSecret = 'synthetic-local-bridge-test-secret-360'
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
if (-not $BaseUrl.StartsWith('http://localhost:', [StringComparison]::OrdinalIgnoreCase)) {
  throw 'Este teste automatizado só pode executar contra localhost.'
}

$requestSchema = Get-Content -LiteralPath (Join-Path $projectRoot 'contracts\manual-review.schema.json') -Raw | ConvertFrom-Json
$resolutionSchema = Get-Content -LiteralPath (Join-Path $projectRoot 'contracts\review-resolution.schema.json') -Raw | ConvertFrom-Json
if ($requestSchema.'$schema' -ne 'https://json-schema.org/draft/2020-12/schema' -or -not $requestSchema.'$id') { throw 'Contrato de pedido de revisão sem metadados Draft 2020-12.' }
if ($resolutionSchema.'$schema' -ne 'https://json-schema.org/draft/2020-12/schema' -or -not $resolutionSchema.'$id') { throw 'Contrato de resolução sem metadados Draft 2020-12.' }

$migration = Join-Path $projectRoot 'drizzle\0004_special_steel_serpent.sql'
Push-Location $projectRoot
try {
  $tableProbe = & npx.cmd wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --command "SELECT count(*) AS count FROM sqlite_master WHERE type='table' AND name='manual_review_requests';" --json | ConvertFrom-Json
  if ([int]$tableProbe[0].results[0].count -eq 0) {
    & npx.cmd wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file $migration *> $null
    if ($LASTEXITCODE -ne 0) { throw 'Migração local da Central de Revisão falhou.' }
  }
} finally { Pop-Location }

$updateId = Get-Random -Minimum 10000000 -Maximum 900000000
$documentId = "review-document-$updateId"
$jobId = "review-run-$updateId"
$receivedAt = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$sql = "INSERT INTO documents (id,owner_id,source,source_message_id,raw_text,status,received_at) VALUES ('$documentId','reviewer-demo','manual-review-test','$updateId','entrada ambigua sintetica','received',$receivedAt); INSERT INTO agent_runs (id,document_id,agent_role,status,input_summary,attempt_count,available_at) VALUES ('$jobId','$documentId','diretor','QUEUED','entrada ambigua sintetica',0,$receivedAt);"
Push-Location $projectRoot
try {
  & npx.cmd wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --command $sql *> $null
  if ($LASTEXITCODE -ne 0) { throw 'Não foi possível preparar o pedido de revisão local.' }
} finally { Pop-Location }

$headers = @{ Authorization = "Bearer $BridgeSecret" }
$claimResponse = Invoke-WebRequest -SkipHttpErrorCheck -Method Post -Uri "$BaseUrl/api/bridge/claim" -Headers $headers -ContentType 'application/json' -Body '{"worker_id":"manual-review-test"}'
if ($claimResponse.StatusCode -ne 200) { throw "Reserva da revisão falhou: $($claimResponse.Content)" }
$claim = $claimResponse.Content | ConvertFrom-Json
$eventId = [Guid]::NewGuid().ToString()
$stateId = [Guid]::NewGuid().ToString()
$snapshot = [ordered]@{
  schema_version = '1.0.0'; tenant_id = 'tenant-demo'; subject_ref = 'cust-demo-review'; event_id = $eventId
  correlation_id = [Guid]::NewGuid().ToString(); input_hash = "sha256:$('b' * 64)"; generated_at = (Get-Date).ToUniversalTime().ToString('o')
  overall_status = 'MANUAL_REVIEW_REQUIRED'; domain_status = @(); findings = @(); data_gaps = @(); gates = @(); recommended_actions = @()
  manual_review = [ordered]@{ reason_code = 'ROUTING_AMBIGUOUS'; problem_statement = 'A intenção sintética permaneceu ambígua após o roteamento determinístico.'; impact = 'Nenhuma recomendação dependente pode avançar.'; required_decision = 'Confirmar a finalidade correta da solicitação sintética.'; owner_queue = 'REVISAO_GESTOR_AUTORIZADO' }
}
$sourceJson = $snapshot | ConvertTo-Json -Depth 12 -Compress
$canonicalJson = ($sourceJson | node -e "let input='';process.stdin.on('data',chunk=>input+=chunk).on('end',()=>{const c=v=>Array.isArray(v)?v.map(c):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,e])=>[k,c(e)])):v;process.stdout.write(JSON.stringify(c(JSON.parse(input))))})")
$hashBytes = [Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($canonicalJson))
$stateHash = "sha256:$([Convert]::ToHexString($hashBytes).ToLowerInvariant())"
$result = [ordered]@{ persisted_state = [ordered]@{ state_id = $stateId; state_version = 1; state_hash = $stateHash; snapshot = $snapshot }; executive_assessment = [ordered]@{ summary = 'Revisão manual sintética.' } }
$body = [ordered]@{ job_id = $claim.job_id; lease_token = $claim.lease_token; result = $result } | ConvertTo-Json -Depth 16 -Compress
$complete = Invoke-WebRequest -SkipHttpErrorCheck -Method Post -Uri "$BaseUrl/api/bridge/complete" -Headers $headers -ContentType 'application/json' -Body $body
if ($complete.StatusCode -ne 200) { throw "Conclusão com revisão falhou: $($complete.Content)" }

Push-Location $projectRoot
try {
  $reviewQuery = "SELECT review_request_id,status,reason_code,review_priority,owner_queue,dedupe_key,due_at FROM manual_review_requests WHERE event_id='$eventId';"
  $reviewResult = & npx.cmd wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --command $reviewQuery --json | ConvertFrom-Json
} finally { Pop-Location }
$review = $reviewResult[0].results | Select-Object -First 1
if (-not $review -or $review.status -ne 'PENDING_TRIAGE' -or $review.reason_code -ne 'ROUTING_AMBIGUOUS' -or $review.dedupe_key -notmatch '^sha256:[a-f0-9]{64}$') {
  throw 'Pedido determinístico de revisão não foi persistido conforme o contrato.'
}

$unauthorizedList = Invoke-WebRequest -SkipHttpErrorCheck -Method Get -Uri "$BaseUrl/api/reviews?tenant_id=tenant-demo"
$unauthorizedResolve = Invoke-WebRequest -SkipHttpErrorCheck -Method Post -Uri "$BaseUrl/api/reviews/$($review.review_request_id)/resolve" -ContentType 'application/json' -Body '{}'
if ($unauthorizedList.StatusCode -ne 401 -or $unauthorizedResolve.StatusCode -ne 401) { throw 'A Central de Revisão não falhou fechada sem identidade.' }

[pscustomobject]@{
  Enqueued = $true
  Status = $review.status
  ReasonCode = $review.reason_code
  Priority = $review.review_priority
  Queue = $review.owner_queue
  DueAtSet = ([long]$review.due_at -gt 0)
  UnauthorizedList = $unauthorizedList.StatusCode
  UnauthorizedResolve = $unauthorizedResolve.StatusCode
} | Format-List
Write-Host 'Central de Revisão 360 aprovada localmente com dados sintéticos.'
