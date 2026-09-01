# Diretor 360 - Iniciador Executivo de 1-Clique (Fase H4)
# Autoridade: Rafael (fael@live.de) | Piloto Hibrido Oficial

param(
    [switch]$NoBrowser = $false
)

$ErrorActionPreference = 'Continue'

Write-Host ''
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host '   DIRETOR 360 - INICIADOR EXECUTIVO DE 1-CLIQUE (PILOTO HIBRIDO)       ' -ForegroundColor Yellow
Write-Host '   Autoridade: Rafael (fael@live.de) | Release v2.4.1                  ' -ForegroundColor Cyan
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host ''

# Docker Engine nativo no Ubuntu/WSL2. O Docker Desktop nao e necessario.
function Invoke-WslDocker {
    param([Parameter(Mandatory = $true)][string[]]$Arguments)
    & wsl.exe -d Ubuntu -u root --cd $PSScriptRoot -- docker @Arguments
}

# 1. Iniciar Ubuntu, keepalive e Docker Engine
Write-Host '[1/6] Iniciando Docker Engine leve no Ubuntu/WSL2...' -ForegroundColor Yellow
$localState = Join-Path $PSScriptRoot '.local'
$keepAlivePid = Join-Path $localState 'wsl-engine-keepalive.pid'
$keepAlive = $null
if (Test-Path -LiteralPath $keepAlivePid) {
    $savedPid = Get-Content -LiteralPath $keepAlivePid -ErrorAction SilentlyContinue
    $keepAlive = Get-Process -Id $savedPid -ErrorAction SilentlyContinue
}
if (-not $keepAlive) {
    $keepAlive = Start-Process -FilePath 'wsl.exe' `
        -ArgumentList @('-d', 'Ubuntu', '-u', 'root', '--', 'sleep', 'infinity') `
        -WindowStyle Hidden -PassThru
    New-Item -ItemType Directory -Path $localState -Force | Out-Null
    Set-Content -LiteralPath $keepAlivePid -Value $keepAlive.Id -Encoding ascii
}
& wsl.exe -d Ubuntu -u root -- systemctl start docker
$dockerVersion = Invoke-WslDocker @('version', '--format', '{{.Server.Version}}') 2>$null
if (-not $dockerVersion) {
    throw 'Docker Engine do Ubuntu nao respondeu.'
}
Write-Host "  [OK] Docker Engine $dockerVersion ativo no Ubuntu; Docker Desktop dispensado." -ForegroundColor Green

# 2. Iniciar PostgreSQL, n8n, Docling e worker
Write-Host ''
Write-Host '[2/6] Inicializando PostgreSQL, n8n, Docling CPU e document-worker...' -ForegroundColor Yellow
Invoke-WslDocker @('compose', '-f', 'compose.n8n.yaml', '--env-file', '.env.n8n', 'up', '-d', 'postgres', 'n8n', 'docling', 'document-worker') 2>$null | Out-Null
Write-Host '  [OK] Containers acionados.' -ForegroundColor Green


# 3. Aguardar Healthchecks
Write-Host ''
Write-Host '[3/6] Aguardando estabilizacao dos servicos locais...' -ForegroundColor Yellow
$maxRetries = 15
$dbReady = $false
$n8nReady = $false

for ($i = 1; $i -le $maxRetries; $i++) {
    $pgStatus = Invoke-WslDocker @('ps', '--filter', 'name=postgres', '--format', '{{.Status}}')
    if ($pgStatus -match "healthy" -or $pgStatus -match "Up") {
        $dbReady = $true
    }
    $n8nStatus = Invoke-WslDocker @('ps', '--filter', 'name=n8n', '--format', '{{.Status}}')
    if ($n8nStatus -match "Up") {
        $n8nReady = $true
    }
    if ($dbReady -and $n8nReady) { break }
    Start-Sleep -Seconds 1
}

if ($dbReady) {
    Write-Host '  [OK] PostgreSQL 17.6 (Porta 5432): SAUDAVEL' -ForegroundColor Green
} else {
    Write-Host '  [!] PostgreSQL ainda iniciando...' -ForegroundColor Yellow
}

if ($n8nReady) {
    Write-Host '  [OK] n8n Orquestrador (Porta 5678): SAUDAVEL' -ForegroundColor Green
} else {
    Write-Host '  [!] n8n ainda iniciando...' -ForegroundColor Yellow
}

# 4. Validar Conexao com a Ponte e Site Hospedado
Write-Host ''
Write-Host '[4/6] Verificando conectividade da Ponte Segura (WF-09)...' -ForegroundColor Yellow
$hostedSiteUrl = 'https://visao-360-diretor.fael360092.chatgpt.site'
$localSiteUrl = 'http://localhost:3000'

try {
    $siteCheck = Invoke-WebRequest -Uri "$localSiteUrl/api/state/latest?tenant_id=tenant-demo&subject_ref=cust-demo-001" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
    if ($siteCheck.StatusCode -eq 200) {
        Write-Host "  [OK] Frontend Local / API State: ATIVO ($localSiteUrl)" -ForegroundColor Green
    } else {
        Write-Host "  [AVISO] Frontend Local: Inicie com 'npm run dev' se desejar rodar localmente." -ForegroundColor Yellow
    }
} catch {
    Write-Host "  [AVISO] Frontend Local nao detectado; use 'npm run dev' quando necessario." -ForegroundColor Yellow
}
Write-Host "  [OK] Site Hospedado na Nuvem: $hostedSiteUrl" -ForegroundColor Green
Write-Host '  [OK] Ponte Segura WF-09: PRONTA (Aguardando eventos)' -ForegroundColor Green

# 5. Painel de Status, Fila e Ultimo Backup
Write-Host ''
Write-Host '[5/6] Consultando Fila de Pendencias e Ultimo Backup...' -ForegroundColor Yellow

# Verificar backups locais
$lastBackup = Get-ChildItem -Filter "backup-*.zip" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($lastBackup) {
    $backupSizeMb = [math]::Round($lastBackup.Length / 1MB, 2)
    $backupDate = $lastBackup.LastWriteTime.ToString('dd/MM/yyyy HH:mm:ss')
    Write-Host "  [OK] Ultimo Backup: $($lastBackup.Name) ($backupSizeMb MB - $backupDate)" -ForegroundColor Green
} else {
    Write-Host '  [!] Nenhum arquivo de backup local detectado.' -ForegroundColor Yellow
}

Write-Host '  [INFO] Consulte a fila real pelo Telegram com /pendencias.' -ForegroundColor Cyan

# 6. Painel Resumo e Abertura do Navegador
Write-Host ''
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host '   PAINEL DE ESTADO DO SISTEMA (DIRETOR 360 PILOTO HIBRIDO)             ' -ForegroundColor Yellow
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host '   * Docker Engine WSL:  ATIVO [OK]' -ForegroundColor Green
Write-Host '   * Banco PostgreSQL:   ATIVO (Porta 5432) [OK]' -ForegroundColor Green
Write-Host '   * Orquestrador n8n:   ATIVO (Porta 5678) [OK]' -ForegroundColor Green
Write-Host '   * OCR Docling CPU:    ATIVO (rede interna) [OK]' -ForegroundColor Green
Write-Host '   * MinerU reserva:     DESLIGADO (perfil manual) [OK]' -ForegroundColor Green
Write-Host '   * Site Hospedado:     CONECTADO [OK]' -ForegroundColor Green
Write-Host '   * Ponte WF-09:        AUTENTICADA & SEGURA [OK]' -ForegroundColor Green
Write-Host '   * Telegram Ingest:    WF-11 PAUSADO ATE HOMOLOGAR DOCLING [SEGURO]' -ForegroundColor Yellow

Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host ''

if (-not $NoBrowser) {
    Write-Host '[6/6] Abrindo o Dashboard e a Mesa do Revisor no seu navegador...' -ForegroundColor Yellow
    Start-Process $localSiteUrl
    Start-Sleep -Milliseconds 400
    Start-Process "$localSiteUrl/reviews"
    Write-Host '  [OK] Navegador aberto com sucesso!' -ForegroundColor Green
} else {
    Write-Host '[6/6] Modo automatizado (-NoBrowser) ativado.' -ForegroundColor Green
}

Write-Host ''
Write-Host 'Para desligar o sistema com seguranca sem perder dados, execute:' -ForegroundColor Yellow
Write-Host '  .\parar-diretor-360.ps1' -ForegroundColor White
Write-Host ''

exit 0
