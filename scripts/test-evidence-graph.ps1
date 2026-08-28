[CmdletBinding()]
#Requires -Version 7.0
param(
  [string]$BaseUrl = 'http://localhost:3000',
  [string]$BridgeSecret
)

$ErrorActionPreference = 'Stop'
$OutputEncoding = [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
$projectRoot = Split-Path -Parent $PSScriptRoot
if (-not $BaseUrl.StartsWith('http://localhost:', [StringComparison]::OrdinalIgnoreCase)) { throw 'Este teste só pode executar contra localhost.' }
if (-not $BridgeSecret) {
  $devVars = Join-Path $projectRoot '.dev.vars'
  if (Test-Path $devVars) {
    $BridgeSecret = ((Get-Content -LiteralPath $devVars | Where-Object { $_ -match '^BRIDGE_SHARED_SECRET=' }) -replace '^BRIDGE_SHARED_SECRET=', '').Trim()
  }
}
if (-not $BridgeSecret) { throw 'BRIDGE_SHARED_SECRET não configurado para o teste local do Evidence Graph.' }

function Invoke-CompatibleWebRequest {
  param(
    [Parameter(Mandatory)] [string]$Uri,
    [string]$Method = 'Get',
    [hashtable]$Headers = @{},
    [string]$ContentType,
    [string]$Body
  )

  $params = @{ Uri = $Uri; Method = $Method; Headers = $Headers; UseBasicParsing = $true; ErrorAction = 'Stop' }
  if ($ContentType) { $params.ContentType = $ContentType }
  if ($PSBoundParameters.ContainsKey('Body')) { $params.Body = $Body }
  if ($PSVersionTable.PSVersion.Major -ge 7) {
    return Invoke-WebRequest @params -SkipHttpErrorCheck
  }
  try { return Invoke-WebRequest @params }
  catch {
    $response = $_.Exception.Response
    if ($null -eq $response) { throw }
    if ($response.PSObject.Properties.Name -contains 'Content' -and $response.Content -is [System.Net.Http.HttpContent]) {
      $content = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
    } else {
      $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
      try { $content = $reader.ReadToEnd() } finally { $reader.Dispose() }
    }
    return [pscustomobject]@{ StatusCode = [int]$response.StatusCode; Content = $content }
  }
}

function Get-Sha256Hex {
  param([Parameter(Mandatory)] [byte[]]$Bytes)
  $sha256 = [Security.Cryptography.SHA256]::Create()
  try { return ([BitConverter]::ToString($sha256.ComputeHash($Bytes))).Replace('-', '').ToLowerInvariant() }
  finally { $sha256.Dispose() }
}

$schema = Get-Content -LiteralPath (Join-Path $projectRoot 'contracts\evidence-graph.schema.json') -Raw | ConvertFrom-Json
if ($schema.'$schema' -ne 'https://json-schema.org/draft/2020-12/schema' -or $schema.properties.schema_version.const -ne '1.0.0') { throw 'Contrato do Evidence Graph inválido.' }

Push-Location $projectRoot
try {
  $probe = & npx.cmd wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --command "SELECT count(*) AS count FROM sqlite_master WHERE type='table' AND name='evidence_nodes';" --json | ConvertFrom-Json
  if ([int]$probe[0].results[0].count -eq 0) {
    & npx.cmd wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file (Join-Path $projectRoot 'drizzle\0005_vengeful_the_watchers.sql') *> $null
    if ($LASTEXITCODE -ne 0) { throw 'Migração local do Evidence Graph falhou.' }
  }
} finally { Pop-Location }

$updateId = Get-Random -Minimum 10000000 -Maximum 900000000
$documentId = "evidence-document-$updateId"; $jobId = "evidence-run-$updateId"; $receivedAt = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$sql = "INSERT INTO documents (id,owner_id,source,source_message_id,raw_text,status,received_at) VALUES ('$documentId','evidence-demo','evidence-test','$updateId','entrada sintetica para linhagem','received',$receivedAt); INSERT INTO agent_runs (id,document_id,agent_role,status,input_summary,attempt_count,available_at) VALUES ('$jobId','$documentId','diretor','QUEUED','entrada sintetica para linhagem',0,$receivedAt);"
Push-Location $projectRoot
try { & npx.cmd wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --command $sql *> $null; if ($LASTEXITCODE -ne 0) { throw 'Falha ao preparar execução de evidência.' } } finally { Pop-Location }

$bridgeHeaders = @{ Authorization = "Bearer $BridgeSecret" }
$claimResponse = Invoke-CompatibleWebRequest -Method Post -Uri "$BaseUrl/api/bridge/claim" -Headers $bridgeHeaders -ContentType 'application/json' -Body '{"worker_id":"evidence-graph-test"}'
if ($claimResponse.StatusCode -ne 200) { throw "Reserva falhou: $($claimResponse.Content)" }; $claim = $claimResponse.Content | ConvertFrom-Json
$eventId = [Guid]::NewGuid().ToString(); $stateId = [Guid]::NewGuid().ToString()
$snapshot = [ordered]@{ schema_version='1.0.0'; tenant_id='tenant-demo'; subject_ref='cust-evidence-demo'; event_id=$eventId; correlation_id=[Guid]::NewGuid().ToString(); input_hash="sha256:$('d' * 64)"; generated_at=(Get-Date).ToUniversalTime().ToString('o'); overall_status='MANUAL_REVIEW_REQUIRED'; domain_status=@(); findings=@(); data_gaps=@(); gates=@(); recommended_actions=@(); manual_review=[ordered]@{reason_code='ROUTING_AMBIGUOUS';problem_statement='Entrada sintética exige confirmação de linhagem.';impact='Item sintético aguarda revisão.';required_decision='Confirmar finalidade sintética.';owner_queue='REVISAO_GESTOR_AUTORIZADO'} }
$sourceJson = $snapshot | ConvertTo-Json -Depth 12 -Compress
$sourceJsonBase64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($sourceJson))
$canonicalJson = (& node -e "const input=Buffer.from(process.argv[1],'base64').toString('utf8');const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).sort(([left],[right])=>left.localeCompare(right)).map(([key,entry])=>[key,canonical(entry)])):value;process.stdout.write(JSON.stringify(canonical(JSON.parse(input))))" $sourceJsonBase64)
$stateHash = "sha256:$(Get-Sha256Hex ([Text.Encoding]::UTF8.GetBytes($canonicalJson)))"
$result=[ordered]@{persisted_state=[ordered]@{state_id=$stateId;state_version=1;state_hash=$stateHash;snapshot=$snapshot};executive_assessment=[ordered]@{summary='Linhagem sintética.'}}
$body=[ordered]@{job_id=$claim.job_id;lease_token=$claim.lease_token;result=$result}|ConvertTo-Json -Depth 16 -Compress
$complete=Invoke-CompatibleWebRequest -Method Post -Uri "$BaseUrl/api/bridge/complete" -Headers $bridgeHeaders -ContentType 'application/json' -Body $body
if($complete.StatusCode -ne 200){throw "Conclusão falhou: $($complete.Content)"}

Push-Location $projectRoot
try { $q=& npx.cmd wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --command "SELECT review_request_id FROM manual_review_requests WHERE event_id='$eventId';" --json|ConvertFrom-Json } finally { Pop-Location }
$reviewId=[string]$q[0].results[0].review_request_id; if(-not $reviewId){throw 'Pedido de revisão não encontrado.'}
$unauthorized=Invoke-CompatibleWebRequest -Method Get -Uri "$BaseUrl/api/audit/reviews/${reviewId}?tenant_id=tenant-demo"
if($unauthorized.StatusCode -ne 401){throw 'Consulta de auditoria não falhou fechada.'}

Push-Location $projectRoot
try {
  $entityFilter="'$reviewId','$stateId','bridge:n8n-local','central-review:deterministic'"
  $nodes=& npx.cmd wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --command "SELECT node_id,node_type,content_hash FROM evidence_nodes WHERE tenant_id='tenant-demo' AND entity_id IN ($entityFilter) ORDER BY created_at;" --json|ConvertFrom-Json
  $edges=& npx.cmd wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --command "SELECT relationship_type FROM evidence_edges WHERE tenant_id='tenant-demo' AND from_node_id IN (SELECT node_id FROM evidence_nodes WHERE entity_id IN ($entityFilter)) AND to_node_id IN (SELECT node_id FROM evidence_nodes WHERE entity_id IN ($entityFilter)) ORDER BY created_at;" --json|ConvertFrom-Json
  $nodeRows=@($nodes[0].results); $edgeRows=@($edges[0].results); $types=@($nodeRows|ForEach-Object{$_.node_type}); $relations=@($edgeRows|ForEach-Object{$_.relationship_type})
  foreach($required in @('STATE_SNAPSHOT','MANUAL_REVIEW_REQUEST','ACTOR')){if($required -notin $types){throw "Nó obrigatório ausente: $required"}}
  foreach($required in @('DERIVED_FROM','GENERATED_BY')){if($required -notin $relations){throw "Relação obrigatória ausente: $required"}}
  $nodeId=[string]$nodeRows[0].node_id
  & npx.cmd wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --command "UPDATE evidence_nodes SET payload_json='{}' WHERE node_id='$nodeId';" *> $null
  $appendOnlyBlocked=($LASTEXITCODE -ne 0)
} finally { Pop-Location }
if(-not $appendOnlyBlocked){throw 'Proteção append-only não bloqueou UPDATE.'}

[pscustomobject]@{InitialGraph='COMPLETE';Nodes=$nodeRows.Count;Edges=$edgeRows.Count;AppendOnlyBlocked=$appendOnlyBlocked;Unauthorized=$unauthorized.StatusCode}|Format-List
