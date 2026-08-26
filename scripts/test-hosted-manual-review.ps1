[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$TelegramSecret,
  [Parameter(Mandatory = $true)][string]$BridgeSecret,
  [string]$BaseUrl = 'https://visao-360-diretor.fael360092.chatgpt.site'
)

$ErrorActionPreference = 'Stop'
if ($BaseUrl -ne 'https://visao-360-diretor.fael360092.chatgpt.site') {
  throw 'Este teste só pode executar contra a hospedagem controlada do Diretor 360.'
}

$updateId = Get-Random -Minimum 100000000 -Maximum 900000000
$messageId = Get-Random -Minimum 100000 -Maximum 900000
$telegramHeaders = @{ 'x-telegram-bot-api-secret-token' = $TelegramSecret }
$bridgeHeaders = @{ Authorization = "Bearer $BridgeSecret" }
$update = [ordered]@{
  update_id = $updateId
  message = [ordered]@{
    message_id = $messageId
    date = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    text = 'homologacao sintetica da Central de Revisao 360'
    chat = [ordered]@{ id = 360001; type = 'private' }
    from = [ordered]@{ id = 360001; username = 'synthetic_review_360'; first_name = 'Synthetic' }
  }
}

$unauthorizedIngest = Invoke-WebRequest -SkipHttpErrorCheck -Method Post -Uri "$BaseUrl/api/ingest/telegram" -ContentType 'application/json' -Body ($update | ConvertTo-Json -Depth 8 -Compress)
if ($unauthorizedIngest.StatusCode -ne 401) { throw 'A entrada hospedada não rejeitou o pedido sem segredo.' }
$ingest = Invoke-WebRequest -SkipHttpErrorCheck -Method Post -Uri "$BaseUrl/api/ingest/telegram" -Headers $telegramHeaders -ContentType 'application/json' -Body ($update | ConvertTo-Json -Depth 8 -Compress)
if ($ingest.StatusCode -ne 202) { throw "Falha ao criar entrada sintética: $($ingest.Content)" }

$claim = Invoke-WebRequest -SkipHttpErrorCheck -Method Post -Uri "$BaseUrl/api/bridge/claim" -Headers $bridgeHeaders -ContentType 'application/json' -Body '{"worker_id":"manual-review-hosted-test"}'
if ($claim.StatusCode -ne 200) { throw "Falha ao reservar entrada sintética: $($claim.Content)" }
$job = $claim.Content | ConvertFrom-Json
if ($job.empty -eq $true -or -not $job.job_id -or -not $job.lease_token) { throw 'A reserva hospedada não devolveu um trabalho válido.' }

$eventId = [Guid]::NewGuid().ToString()
$stateId = [Guid]::NewGuid().ToString()
$snapshot = [ordered]@{
  schema_version = '1.0.0'; tenant_id = 'tenant-demo'; subject_ref = 'cust-demo-review-hosted'; event_id = $eventId
  correlation_id = [Guid]::NewGuid().ToString(); input_hash = "sha256:$('c' * 64)"; generated_at = (Get-Date).ToUniversalTime().ToString('o')
  overall_status = 'MANUAL_REVIEW_REQUIRED'; domain_status = @(); findings = @(); data_gaps = @(); gates = @(); recommended_actions = @()
  manual_review = [ordered]@{
    reason_code = 'ROUTING_AMBIGUOUS'
    problem_statement = 'A finalidade da entrada sintética permaneceu ambígua após a regra determinística.'
    impact = 'Nenhuma recomendação dependente pode avançar durante a homologação.'
    required_decision = 'Confirmar a finalidade correta da solicitação exclusivamente sintética.'
    owner_queue = 'REVISAO_GESTOR_AUTORIZADO'
  }
}
$sourceJson = $snapshot | ConvertTo-Json -Depth 12 -Compress
$canonicalJson = ($sourceJson | node -e "let input='';process.stdin.on('data',chunk=>input+=chunk).on('end',()=>{const c=v=>Array.isArray(v)?v.map(c):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,e])=>[k,c(e)])):v;process.stdout.write(JSON.stringify(c(JSON.parse(input))))})")
$hashBytes = [Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($canonicalJson))
$stateHash = "sha256:$([Convert]::ToHexString($hashBytes).ToLowerInvariant())"
$result = [ordered]@{
  persisted_state = [ordered]@{ state_id = $stateId; state_version = 1; state_hash = $stateHash; snapshot = $snapshot }
  executive_assessment = [ordered]@{ summary = 'Pedido sintético encaminhado para revisão humana.' }
}
$completionBody = [ordered]@{ job_id = $job.job_id; lease_token = $job.lease_token; result = $result } | ConvertTo-Json -Depth 16 -Compress
$completed = Invoke-WebRequest -SkipHttpErrorCheck -Method Post -Uri "$BaseUrl/api/bridge/complete" -Headers $bridgeHeaders -ContentType 'application/json' -Body $completionBody
if ($completed.StatusCode -ne 200 -or ($completed.Content | ConvertFrom-Json).duplicate -ne $false) { throw "Falha ao publicar revisão sintética: $($completed.Content)" }
$duplicate = Invoke-WebRequest -SkipHttpErrorCheck -Method Post -Uri "$BaseUrl/api/bridge/complete" -Headers $bridgeHeaders -ContentType 'application/json' -Body $completionBody
if ($duplicate.StatusCode -ne 200 -or ($duplicate.Content | ConvertFrom-Json).duplicate -ne $true) { throw 'A conclusão hospedada não permaneceu idempotente.' }

$reviewInput = [ordered]@{ tenant_id = 'tenant-demo'; state_id = $stateId; state_version = 1; reason_code = 'ROUTING_AMBIGUOUS' } | ConvertTo-Json -Compress
$reviewCanonical = ($reviewInput | node -e "let input='';process.stdin.on('data',chunk=>input+=chunk).on('end',()=>{const c=v=>Array.isArray(v)?v.map(c):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,e])=>[k,c(e)])):v;process.stdout.write(JSON.stringify(c(JSON.parse(input))))})")
$reviewHash = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($reviewCanonical))).ToLowerInvariant()
$hex = $reviewHash.Substring(0, 32).ToCharArray()
$hex[12] = '5'; $hex[16] = [Convert]::ToString(([Convert]::ToInt32([string]$hex[16], 16) -band 3) -bor 8, 16)
$uuidHex = -join $hex
$reviewId = "$($uuidHex.Substring(0,8))-$($uuidHex.Substring(8,4))-$($uuidHex.Substring(12,4))-$($uuidHex.Substring(16,4))-$($uuidHex.Substring(20,12))"

$unauthorizedList = Invoke-WebRequest -SkipHttpErrorCheck -Method Get -Uri "$BaseUrl/api/reviews?tenant_id=tenant-demo"
if ($unauthorizedList.StatusCode -ne 401) { throw 'A fila hospedada não falhou fechada sem identidade.' }

[pscustomobject]@{
  ReviewRequestId = $reviewId
  IngestUnauthorized = $unauthorizedIngest.StatusCode
  IngestAccepted = $ingest.StatusCode
  Completion = $completed.StatusCode
  DuplicateCompletion = ($duplicate.Content | ConvertFrom-Json).duplicate
  ReviewListUnauthorized = $unauthorizedList.StatusCode
  ExternalEffectsAllowed = $false
} | Format-List
