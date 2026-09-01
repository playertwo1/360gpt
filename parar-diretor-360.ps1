# Diretor 360 - Desligador Seguro de 1-Clique (Fase H4)
# Encerra os servicos ordenadamente preservando 100% dos volumes e dados

$ErrorActionPreference = 'Continue'

Write-Host ''
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host '   DIRETOR 360 - DESLIGAMENTO SEGURO DE SERVICOS LOCAL                  ' -ForegroundColor Yellow
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host ''

Write-Host '[1/2] Parando todos os containers do Diretor 360 (volumes preservados)...' -ForegroundColor Yellow
& wsl.exe -d Ubuntu -u root --cd $PSScriptRoot -- docker compose -f compose.n8n.yaml --env-file .env.n8n stop 2>$null | Out-Null


Write-Host '[2/2] Verificando estado dos containers...' -ForegroundColor Yellow
$activeContainers = & wsl.exe -d Ubuntu -u root -- docker ps --filter "name=visao-360" --format "{{.Names}}" 2>$null
if (-not $activeContainers) {
    Write-Host '  [OK] Todos os servicos locais foram encerrados com seguranca!' -ForegroundColor Green
    Write-Host '  [OK] Nenhum dado foi apagado. O site hospedado continua acessivel.' -ForegroundColor Green
} else {
    Write-Host "  [!] Containers remanescentes: $activeContainers" -ForegroundColor Yellow
}

Write-Host '  [OK] Encerrando Ubuntu/WSL para devolver RAM ao Windows...' -ForegroundColor Green
& wsl.exe --terminate Ubuntu | Out-Null
$keepAlivePid = Join-Path $PSScriptRoot '.local/wsl-engine-keepalive.pid'
if (Test-Path -LiteralPath $keepAlivePid) {
    Remove-Item -LiteralPath $keepAlivePid -Force -ErrorAction SilentlyContinue
}

Write-Host ''
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host '   DESLIGAMENTO CONCLUIDO COM SUCESSO!                                  ' -ForegroundColor Green
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host ''

exit 0
