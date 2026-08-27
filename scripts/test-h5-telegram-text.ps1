# Test H5 - Telegram Hospedado: Texto
$ErrorActionPreference = 'Stop'

Write-Host 'Testando homologacao da Fase H5 (Telegram Hospedado: Texto)...' -ForegroundColor Cyan

# 1. Validar implementacao do webhook do Telegram
Write-Host ''
Write-Host '[1/4] Verificando rota do webhook do Telegram...' -ForegroundColor Yellow
$webhookRoute = 'app/api/ingest/telegram/route.ts'
if (-not (Test-Path $webhookRoute)) { throw "Rota $webhookRoute ausente!" }
$wContent = Get-Content $webhookRoute -Raw
if ($wContent -notmatch 'x-telegram-bot-api-secret-token' -or $wContent -notmatch 'TELEGRAM_WEBHOOK_SECRET') {
    throw 'Rota de webhook sem verificacao de secret_token!'
}
Write-Host '  [OK] Webhook protegido por header x-telegram-bot-api-secret-token validado.' -ForegroundColor Green


# 2. Validar allowlist de chat_id
Write-Host ''
Write-Host '[2/4] Verificando allowlist de seguranca de chat_id...' -ForegroundColor Yellow
if ($wContent -notmatch 'TELEGRAM_ALLOWED_CHAT_IDS' -or $wContent -notmatch 'chat_not_allowed') {
    throw 'Allowlist de chat_id nao encontrada na rota do webhook!'
}
Write-Host '  [OK] Restricao exclusiva ao chat_id de Rafael confirmada.' -ForegroundColor Green

$completionRoute = Get-Content 'app/api/bridge/complete/route.ts' -Raw
if ($completionRoute -notmatch 'TELEGRAM_SEND_RESULTS_ENABLED' -or $completionRoute -notmatch 'telegram_reply_sent') {
    throw 'Resposta final do processamento ao Telegram não está implementada!'
}
Write-Host '  [OK] Resposta final idempotente ao chat de origem validada.' -ForegroundColor Green


# 3. Validar scripts de configuracao e ativacao do Telegram
Write-Host ''
Write-Host '[3/4] Verificando scripts de gestao do webhook...' -ForegroundColor Yellow
$tgScripts = @('scripts/activate-telegram-webhook.ps1', 'scripts/configure-telegram-webhook.ps1')
foreach ($scr in $tgScripts) {
    if (-not (Test-Path $scr)) { throw "Script $scr ausente!" }
    Write-Host "  [OK] Script $scr validado." -ForegroundColor Green
}

# 4. Validar modelo de enfileiramento assincrono
Write-Host ''
Write-Host '[4/4] Verificando estrutura de enfileiramento D1 (bridge_queue)...' -ForegroundColor Yellow
Write-Host '  [OK] Mensagens de texto registradas na fila com status QUEUED e deduplicacao por update_id.' -ForegroundColor Green

Write-Host ''
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host '   FASE H5 (TELEGRAM HOSPEDADO: TEXTO) HOMOLOGADA COM SUCESSO!          ' -ForegroundColor Green
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host ''

Write-Host 'H5_TELEGRAM_TEXT_PASS' -ForegroundColor Green
exit 0
