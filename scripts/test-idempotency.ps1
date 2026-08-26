[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$endpoint = 'http://localhost:5678/webhook/visao-360/offline-test-input'
$headers = @{ 'X-Visao360-Test-Mode' = 'OFFLINE_EVAL' }
$sourceEventId = "idempotency-$([guid]::NewGuid().ToString('N'))"
$body = @{
  tenant_id = 'tenant-demo'
  source_event_id = $sourceEventId
  actor_id = 'rafael-demo'
  subject_ref = 'cust-demo-001'
  purpose = 'offline_evaluation'
  data_classification = 'INTERNAL'
  text = 'Teste sintético repetido para validar registro idempotente da visão 360.'
} | ConvertTo-Json

$responses = 1..3 | ForEach-Object {
  Invoke-RestMethod -Method Post -Uri $endpoint -Headers $headers `
    -ContentType 'application/json' -Body $body
}

$statuses = @($responses | ForEach-Object { $_.execution_status })
if ($statuses[0] -ne 'SUCCEEDED') {
  throw "A primeira chamada deveria ser SUCCEEDED, mas retornou $($statuses[0])."
}
if ($statuses[1] -ne 'DUPLICATE_IGNORED' -or $statuses[2] -ne 'DUPLICATE_IGNORED') {
  throw "As repetições deveriam ser DUPLICATE_IGNORED: $($statuses -join ', ')."
}
if (@($responses.event_id | Select-Object -Unique).Count -ne 1) {
  throw 'As chamadas repetidas não retornaram o mesmo event_id persistido.'
}
if (@($responses.idempotency_key | Select-Object -Unique).Count -ne 1) {
  throw 'As chamadas repetidas não produziram a mesma idempotency_key.'
}
if (@($responses.routing_registration.routing_id | Select-Object -Unique).Count -ne 1) {
  throw 'As chamadas repetidas não retornaram a mesma decisão de roteamento persistida.'
}

$responses | ForEach-Object {
  [pscustomobject]@{
    Status = $_.execution_status
    Duplicate = $_.duplicate
    EventId = $_.event_id
    IdempotencyKey = $_.idempotency_key
    AuditId = $_.registration.audit_id
    RoutingId = $_.routing_registration.routing_id
  }
} | Format-Table -AutoSize

Write-Host 'Idempotência validada: um evento e um roteamento persistidos; duas repetições ignoradas.'
