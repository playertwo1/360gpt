# Setup Interativo do Telegram Bot
$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "   DIRETOR 360 - CONFIGURADOR DO BOT DO TELEGRAM                       " -ForegroundColor Yellow
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para conectar seu bot no Telegram, siga estes 2 passos rapidos:" -ForegroundColor Gray
Write-Host "1. Abra o Telegram, pesquise por @BotFather e mande /newbot para criar seu bot." -ForegroundColor Gray
Write-Host "2. Copie o Token HTTP API gerado pelo BotFather." -ForegroundColor Gray
Write-Host ""

$token = Read-Host "Cole o seu TELEGRAM_BOT_TOKEN (ex: 123456789:ABCdef...)"
if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "Token em branco. Mantendo configuracao atual." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Consultando informacoes do bot no Telegram..." -ForegroundColor Yellow
try {
    $botInfo = Invoke-RestMethod -Uri "https://api.telegram.org/bot$token/getMe" -Method Get
    if ($botInfo.ok) {
        Write-Host "  [OK] Bot Conectado com Sucesso: @$($botInfo.result.username) ($($botInfo.result.first_name))" -ForegroundColor Green
    }
} catch {
    Write-Host "  [AVISO] Nao foi possivel validar o token na API do Telegram. Verifique sua conexao ou se o token esta correto." -ForegroundColor Red
}

Write-Host ""
$chatId = Read-Host "Digite o seu TELEGRAM_ALLOWED_CHAT_IDS (deixe em branco se ainda nao souber)"

$envPath = ".env.local"
$envLines = @()
if (Test-Path $envPath) {
    $envLines = Get-Content $envPath | Where-Object { 
        $_ -notmatch '^TELEGRAM_BOT_TOKEN=' -and 
        $_ -notmatch '^TELEGRAM_ALLOWED_CHAT_IDS=' -and
        $_ -notmatch '^TELEGRAM_WEBHOOK_SECRET=' -and
        $_ -notmatch '^TELEGRAM_INGEST_ENABLED='
    }
}

$secret = [System.Guid]::NewGuid().ToString("N")
$envLines += "TELEGRAM_INGEST_ENABLED=true"
$envLines += "TELEGRAM_BOT_TOKEN=$token"
$envLines += "TELEGRAM_WEBHOOK_SECRET=$secret"
if (-not [string]::IsNullOrWhiteSpace($chatId)) {
    $envLines += "TELEGRAM_ALLOWED_CHAT_IDS=$chatId"
} else {
    $envLines += "TELEGRAM_ALLOWED_CHAT_IDS="
}

$envLines | Set-Content $envPath -Encoding UTF8

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "   CONFIGURACAO DO TELEGRAM SALVA COM SUCESSO EM .env.local!            " -ForegroundColor Green
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para iniciar o bot em tempo real, execute: .\iniciar-telegram-bot.bat" -ForegroundColor Yellow
Write-Host ""
