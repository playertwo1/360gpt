[CmdletBinding()]
param(
  [Parameter(Mandatory)] [string]$WebhookUrl,
  [switch]$Apply
)

$ErrorActionPreference = 'Stop'
if (-not [Uri]::IsWellFormedUriString($WebhookUrl, [UriKind]::Absolute) -or -not $WebhookUrl.StartsWith('https://', [StringComparison]::OrdinalIgnoreCase)) {
  throw 'A URL do webhook precisa ser HTTPS e absoluta.'
}
if (-not $WebhookUrl.EndsWith('/api/ingest/telegram', [StringComparison]::OrdinalIgnoreCase)) {
  throw 'A URL precisa terminar em /api/ingest/telegram.'
}

$token = [Environment]::GetEnvironmentVariable('TELEGRAM_BOT_TOKEN')
$secret = [Environment]::GetEnvironmentVariable('TELEGRAM_WEBHOOK_SECRET')
$allowedChats = [Environment]::GetEnvironmentVariable('TELEGRAM_ALLOWED_CHAT_IDS')
if ([string]::IsNullOrWhiteSpace($token)) { throw 'TELEGRAM_BOT_TOKEN não está definido no ambiente.' }
if ([string]::IsNullOrWhiteSpace($secret) -or $secret.Length -gt 256 -or $secret -notmatch '^[A-Za-z0-9_-]+$') {
  throw 'TELEGRAM_WEBHOOK_SECRET precisa ter 1–256 caracteres A-Z, a-z, 0-9, _ ou -.'
}
if ([string]::IsNullOrWhiteSpace($allowedChats)) { throw 'TELEGRAM_ALLOWED_CHAT_IDS não está definido.' }

if (-not $Apply) {
  Write-Host 'Pré-requisitos locais validados. Nenhuma alteração foi enviada ao Telegram.'
  Write-Host 'Execute novamente com -Apply somente após aprovar a URL e habilitar o piloto no ambiente hospedado.'
  exit 0
}

$apiBase = "https://api.telegram.org/bot$token"
$payload = @{
  url = $WebhookUrl
  secret_token = $secret
  allowed_updates = @('message')
  max_connections = 4
  drop_pending_updates = $false
} | ConvertTo-Json -Depth 4

$result = Invoke-RestMethod -Method Post -Uri "$apiBase/setWebhook" -ContentType 'application/json' -Body $payload
if (-not $result.ok) { throw 'O Telegram recusou o cadastro do webhook.' }

$info = Invoke-RestMethod -Method Get -Uri "$apiBase/getWebhookInfo"
if (-not $info.ok) { throw 'O Telegram não retornou o estado do webhook.' }
[pscustomobject]@{
  Configured = $true
  Url = $info.result.url
  PendingUpdates = $info.result.pending_update_count
  LastErrorDate = $info.result.last_error_date
  LastErrorMessage = $info.result.last_error_message
  AllowedUpdates = ($info.result.allowed_updates -join ',')
} | Format-List
