[CmdletBinding(SupportsShouldProcess)]
param(
  [Parameter(Mandatory)] [ValidatePattern('^https://')] [string]$WebhookUrl,
  [switch]$DropPendingUpdates
)

$ErrorActionPreference = 'Stop'
if (-not $WebhookUrl.EndsWith('/api/ingest/telegram', [StringComparison]::OrdinalIgnoreCase)) {
  throw 'WebhookUrl precisa terminar em /api/ingest/telegram.'
}

$token = [Environment]::GetEnvironmentVariable('TELEGRAM_BOT_TOKEN')
$secret = [Environment]::GetEnvironmentVariable('TELEGRAM_WEBHOOK_SECRET')
if ([string]::IsNullOrWhiteSpace($token)) { throw 'Defina TELEGRAM_BOT_TOKEN no ambiente.' }
if ([string]::IsNullOrWhiteSpace($secret) -or $secret.Length -gt 256 -or $secret -notmatch '^[A-Za-z0-9_-]+$') {
  throw 'TELEGRAM_WEBHOOK_SECRET deve ter 1 a 256 caracteres A-Z, a-z, 0-9, _ ou -.'
}

if (-not $PSCmdlet.ShouldProcess($WebhookUrl, 'Ativar webhook oficial do Telegram')) { return }
$apiBase = "https://api.telegram.org/bot$token"
$body = @{
  url = $WebhookUrl
  secret_token = $secret
  allowed_updates = @('message')
  max_connections = 4
  drop_pending_updates = [bool]$DropPendingUpdates
} | ConvertTo-Json -Depth 4

$result = Invoke-RestMethod -Method Post -Uri "$apiBase/setWebhook" -ContentType 'application/json' -Body $body
if (-not $result.ok) { throw "Telegram recusou o webhook: $($result.description)" }
$info = Invoke-RestMethod -Method Get -Uri "$apiBase/getWebhookInfo"
if (-not $info.ok -or $info.result.url -ne $WebhookUrl) { throw 'Nao foi possivel confirmar a URL cadastrada.' }

[pscustomobject]@{
  Activated = $true
  Url = $info.result.url
  PendingUpdates = $info.result.pending_update_count
  LastError = $info.result.last_error_message
  SecretConfigured = $info.result.has_custom_certificate -eq $false
} | Format-List
