[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$Protocol,
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$Reason
)

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$auditDir = Join-Path $repo '.local'
$auditPath = Join-Path $auditDir 'mineru-manual-audit.jsonl'
New-Item -ItemType Directory -Path $auditDir -Force | Out-Null
$entry = [ordered]@{ timestamp=(Get-Date).ToUniversalTime().ToString('o'); protocol=$Protocol; reason=$Reason; actor=$env:USERNAME; action='START_MINERU_MANUAL' }
Add-Content -LiteralPath $auditPath -Value ($entry | ConvertTo-Json -Compress) -Encoding utf8
& wsl.exe -d Ubuntu -u root --cd $repo -- docker compose --profile mineru-manual --env-file .env.n8n -f compose.n8n.yaml up -d mineru
if ($LASTEXITCODE -ne 0) { throw 'Falha ao iniciar a contingência MinerU.' }
Write-Host "MinerU iniciado manualmente para $Protocol. Ao terminar, execute scripts/release-mineru-memory.ps1." -ForegroundColor Yellow
