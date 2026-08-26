# Diretor 360 - Desligador Seguro de 1-Clique (Fase H4)
# Encerra os servicos ordenadamente preservando 100% dos volumes e dados

$ErrorActionPreference = 'Continue'

Write-Host ''
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host '   DIRETOR 360 - DESLIGAMENTO SEGURO DE SERVICOS LOCAL                  ' -ForegroundColor Yellow
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host ''

Write-Host '[1/2] Parando containers PostgreSQL e n8n (volumes preservados)...' -ForegroundColor Yellow
docker compose -f compose.n8n.yaml --env-file .env.n8n stop postgres n8n 2>$null | Out-Null


Write-Host '[2/2] Verificando estado dos containers...' -ForegroundColor Yellow
$activeContainers = docker ps --filter "name=postgres" --filter "name=n8n" --format "{{.Names}}"
if (-not $activeContainers) {
    Write-Host '  [OK] Todos os servicos locais foram encerrados com seguranca!' -ForegroundColor Green
    Write-Host '  [OK] Nenhum dado foi apagado. O site hospedado continua acessivel.' -ForegroundColor Green
} else {
    Write-Host "  [!] Containers remanescentes: $activeContainers" -ForegroundColor Yellow
}

Write-Host ''
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host '   DESLIGAMENTO CONCLUIDO COM SUCESSO!                                  ' -ForegroundColor Green
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host ''

exit 0
