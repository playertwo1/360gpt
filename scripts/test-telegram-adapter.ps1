[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$endpoint = 'http://localhost:5678/webhook/visao-360/offline-test-input'
$allowedChatIds = @('360001')
$fixtureFiles = @(
  'test-data/telegram-update-text.json'
  'test-data/telegram-update-document.json'
  'test-data/telegram-update-spreadsheet.json'
)
$results = @()

foreach ($fixtureRelativePath in $fixtureFiles) {
  $fixturePath = Join-Path $projectRoot $fixtureRelativePath
  $update = Get-Content -LiteralPath $fixturePath -Raw | ConvertFrom-Json
  $update.update_id = Get-Random -Minimum 1000000 -Maximum 900000000
  $message = $update.message
  if (-not $message -or -not $allowedChatIds.Contains([string]$message.chat.id)) {
    throw "Fixture sem mensagem ou chat autorizado: $fixtureRelativePath"
  }

  $sourceEventId = "telegram-update-$($update.update_id)"
  $text = if ($message.text) { [string]$message.text } else { [string]$message.caption }
  $responses = @()

  foreach ($attempt in 1..2) {
    if ($message.document) {
      $filePath = Join-Path $projectRoot ([string]$update.offline_eval.local_path)
      if (-not (Test-Path -LiteralPath $filePath)) { throw "Arquivo sintético ausente: $filePath" }
      $raw = & curl.exe --silent --show-error --fail-with-body -X POST $endpoint `
        -H 'X-Visao360-Test-Mode: OFFLINE_EVAL' `
        -F 'tenant_id=tenant-demo' `
        -F "source_event_id=$sourceEventId" `
        -F "actor_id=telegram:$($message.from.id)" `
        -F 'subject_ref=cust-demo-001' `
        -F 'purpose=offline_evaluation' `
        -F 'data_classification=INTERNAL' `
        -F "text=$text" `
        -F "file=@$filePath;type=$($message.document.mime_type)"
      if ($LASTEXITCODE -ne 0) { throw "Falha no adaptador de documento: $fixtureRelativePath" }
      $responses += $raw | ConvertFrom-Json
    } else {
      $body = @{
        tenant_id = 'tenant-demo'; source_event_id = $sourceEventId; actor_id = "telegram:$($message.from.id)"
        subject_ref = 'cust-demo-001'; purpose = 'offline_evaluation'; data_classification = 'INTERNAL'; text = $text
      } | ConvertTo-Json
      $responses += Invoke-RestMethod -Method Post -Uri $endpoint -Headers @{ 'X-Visao360-Test-Mode' = 'OFFLINE_EVAL' } -ContentType 'application/json' -Body $body
    }
  }

  if ($responses[0].execution_status -ne 'SUCCEEDED' -or $responses[1].execution_status -ne 'DUPLICATE_IGNORED') {
    throw "Idempotência Telegram falhou em $fixtureRelativePath."
  }
  if ($responses[0].event_id -ne $responses[1].event_id) {
    throw "O update repetido não retornou o mesmo event_id em $fixtureRelativePath."
  }

  $results += [pscustomobject]@{
    Fixture = Split-Path -Leaf $fixtureRelativePath
    UpdateId = $update.update_id
    First = $responses[0].execution_status
    Repeated = $responses[1].execution_status
    Files = $responses[0].input_summary.file_count
    State = $responses[0].state_status
  }
}

$results | Format-Table -AutoSize
Write-Host 'Adaptador Telegram simulado aprovado sem conexão externa.'
