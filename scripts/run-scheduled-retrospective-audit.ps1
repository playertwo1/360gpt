$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$promptPath = Join-Path $PSScriptRoot 'scheduled-retrospective-audit-prompt.txt'
$auditDirectory = Join-Path $projectRoot 'docs\audits'
$reportPath = Join-Path $auditDirectory 'AUDITORIA_RETROSPECTIVA_AGENDADA_2026-08-26.md'
$logPath = Join-Path $auditDirectory 'AUDITORIA_RETROSPECTIVA_AGENDADA_2026-08-26.log'
$codexCommand = Join-Path ([Environment]::GetFolderPath('ApplicationData')) 'npm\codex.cmd'

New-Item -ItemType Directory -Path $auditDirectory -Force | Out-Null

if (-not (Test-Path -LiteralPath $codexCommand)) {
    throw "Codex CLI nao encontrado em $codexCommand"
}

if (-not (Test-Path -LiteralPath $promptPath)) {
    throw "Prompt da auditoria nao encontrado em $promptPath"
}

$startedAt = Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz'
"Inicio: $startedAt" | Set-Content -LiteralPath $logPath -Encoding UTF8

Get-Content -LiteralPath $promptPath -Raw |
    & $codexCommand exec - `
        --cd $projectRoot `
        --sandbox workspace-write `
        --approve-for-me `
        --color never `
        --output-last-message $reportPath *>> $logPath

$exitCode = $LASTEXITCODE
$finishedAt = Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz'
"Fim: $finishedAt" | Add-Content -LiteralPath $logPath -Encoding UTF8
"Codigo de saida: $exitCode" | Add-Content -LiteralPath $logPath -Encoding UTF8

exit $exitCode
