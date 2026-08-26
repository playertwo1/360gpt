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
$headers = @{ Authorization = "Bearer $BridgeSecret" }
$unauthorized = Invoke-WebRequest -SkipHttpErrorCheck -Method Post -Uri "$BaseUrl/api/bridge/claim" -ContentType 'application/json' -Body '{"worker_id":"test"}'
if ($unauthorized.StatusCode -ne 401) { throw 'A ponte não rejeitou chamada sem segredo.' }

$updateId = Get-Random -Minimum 10000000 -Maximum 900000000
$documentId = "telegram-360001-$updateId"
$jobId = "telegram-run-360001-$updateId"
$receivedAt = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$sql = "INSERT INTO documents (id,owner_id,source,source_message_id,raw_text,status,received_at) VALUES ('$documentId','360001','telegram','$updateId','visao 360 completa da empresa sintetica','received',$receivedAt); INSERT INTO agent_runs (id,document_id,agent_role,status,input_summary,attempt_count,available_at) VALUES ('$jobId','$documentId','diretor','QUEUED','visao 360 completa da empresa sintetica',0,$receivedAt);"
Push-Location $projectRoot
try {
  & npx.cmd wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --command $sql *> $null
  if ($LASTEXITCODE -ne 0) { throw 'Não foi possível preparar a fila local.' }
} finally { Pop-Location }

$claimResponse = Invoke-WebRequest -SkipHttpErrorCheck -Method Post -Uri "$BaseUrl/api/bridge/claim" -Headers $headers -ContentType 'application/json' -Body '{"worker_id":"bridge-test-a"}'
$secondClaim = Invoke-WebRequest -SkipHttpErrorCheck -Method Post -Uri "$BaseUrl/api/bridge/claim" -Headers $headers -ContentType 'application/json' -Body '{"worker_id":"bridge-test-b"}'
if ($claimResponse.StatusCode -ne 200 -or $secondClaim.StatusCode -ne 200 -or ($secondClaim.Content | ConvertFrom-Json).empty -ne $true) { throw 'A reserva exclusiva da fila falhou.' }
$claim = $claimResponse.Content | ConvertFrom-Json
if ($claim.job_id -ne $jobId -or $claim.security.external_effects_allowed -ne $false) { throw 'Contrato do trabalho reservado inválido.' }

$snapshot = [ordered]@{
  schema_version = '1.0.0'; tenant_id = 'tenant-demo'; subject_ref = 'cust-demo-001'
  event_id = [Guid]::NewGuid().ToString(); correlation_id = [Guid]::NewGuid().ToString(); input_hash = "sha256:$('a' * 64)"
  generated_at = (Get-Date).ToUniversalTime().ToString('o'); overall_status = 'READY'
  domain_status = @(); findings = @(); data_gaps = @(); gates = @(); recommended_actions = @(); manual_review = $null
}
$snapshotSourceJson = $snapshot | ConvertTo-Json -Depth 10 -Compress
$snapshotJson = ($snapshotSourceJson | node -e "let input='';process.stdin.on('data',chunk=>input+=chunk).on('end',()=>{const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).sort(([left],[right])=>left.localeCompare(right)).map(([key,entry])=>[key,canonical(entry)])):value;process.stdout.write(JSON.stringify(canonical(JSON.parse(input))))})")
$hashBytes = [Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($snapshotJson))
$stateHash = "sha256:$([Convert]::ToHexString($hashBytes).ToLowerInvariant())"
$result = [ordered]@{
  persisted_state = [ordered]@{ state_id = [Guid]::NewGuid().ToString(); state_version = 1; state_hash = $stateHash; snapshot = $snapshot }
  executive_assessment = [ordered]@{ summary = 'Estado sintético publicado pela ponte.' }
}
$completionBody = [ordered]@{ job_id = $claim.job_id; lease_token = $claim.lease_token; result = $result } | ConvertTo-Json -Depth 15 -Compress
$completed = Invoke-WebRequest -SkipHttpErrorCheck -Method Post -Uri "$BaseUrl/api/bridge/complete" -Headers $headers -ContentType 'application/json' -Body $completionBody
$duplicate = Invoke-WebRequest -SkipHttpErrorCheck -Method Post -Uri "$BaseUrl/api/bridge/complete" -Headers $headers -ContentType 'application/json' -Body $completionBody
if ($completed.StatusCode -ne 200 -or ($completed.Content | ConvertFrom-Json).duplicate -ne $false) { throw "Publicação inicial do Estado falhou: HTTP $($completed.StatusCode) $($completed.Content)" }
if ($duplicate.StatusCode -ne 200 -or ($duplicate.Content | ConvertFrom-Json).duplicate -ne $true) { throw 'Conclusão idempotente falhou.' }

$oversized = '{"worker_id":"' + ('x' * (2 * 1024 * 1024)) + '"}'
$tooLarge = Invoke-WebRequest -SkipHttpErrorCheck -Method Post -Uri "$BaseUrl/api/bridge/claim" -Headers $headers -ContentType 'application/json' -Body $oversized
if ($tooLarge.StatusCode -ne 413) { throw 'Limite do corpo da ponte não foi aplicado.' }

[pscustomobject]@{
  Unauthorized = $unauthorized.StatusCode
  FirstClaim = $claimResponse.StatusCode
  ConcurrentClaimEmpty = ($secondClaim.Content | ConvertFrom-Json).empty
  Completed = $completed.StatusCode
  DuplicateCompletion = ($duplicate.Content | ConvertFrom-Json).duplicate
  Oversized = $tooLarge.StatusCode
  StateHash = $stateHash
} | Format-List
Write-Host 'Ponte hospedada aprovada localmente com dados sintéticos.'
