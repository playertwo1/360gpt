# Test H4 - One-Click Launcher
$ErrorActionPreference = 'Stop'

Write-Host 'Testando homologacao da Fase H4 (Iniciador de 1-Clique)...' -ForegroundColor Cyan

# 1. Testar se os arquivos existem
Write-Host ''
Write-Host '[1/3] Verificando arquivos de inicializacao e parada...' -ForegroundColor Yellow
$files = @('iniciar-diretor-360.ps1', 'iniciar-diretor-360.bat', 'parar-diretor-360.ps1', 'parar-diretor-360.bat')
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  [OK] Arquivo presente: $file" -ForegroundColor Green
    } else {
        throw "Arquivo obrigatorio ausente: $file"
    }
}

# 2. Validar sintaxe e integridade dos scripts
Write-Host ''
Write-Host '[2/3] Verificando comandos internos dos iniciadores...' -ForegroundColor Yellow
$initContent = Get-Content 'iniciar-diretor-360.ps1' -Raw
if ($initContent -notmatch 'compose.n8n.yaml' -or $initContent -notmatch 'localhost:3000') {
    throw 'Script iniciar-diretor-360.ps1 sem referencias aos containers ou dashboard!'
}
Write-Host '  [OK] Scripts de inicializacao verificados.' -ForegroundColor Green

# 3. Executar o iniciador em modo -NoBrowser
Write-Host ''
Write-Host '[3/3] Executando iniciador em modo automatizado (-NoBrowser)...' -ForegroundColor Yellow
& powershell -File iniciar-diretor-360.ps1 -NoBrowser

if ($LASTEXITCODE -eq 0) {
    Write-Host '  [OK] Iniciador executado com sucesso e codigo 0!' -ForegroundColor Green
} else {
    throw "Falha na execucao do iniciador. Codigo: $LASTEXITCODE"
}

Write-Host ''
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host '   FASE H4 (INICIADOR DE 1-CLIQUE) HOMOLOGADA COM SUCESSO!              ' -ForegroundColor Green
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host ''

Write-Host 'H4_ONE_CLICK_LAUNCHER_PASS' -ForegroundColor Green
exit 0
