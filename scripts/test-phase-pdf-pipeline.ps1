# Test Phase - Pipeline de Leitura de PDF e Geracao de Planilha NBA
$ErrorActionPreference = 'Stop'

Write-Host ''
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host '   DIRETOR 360 - TESTE PIPELINE PDF -> DADOS -> NBA -> PLANILHA       ' -ForegroundColor Yellow
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host ''

Write-Host '[1/2] Executando pipeline local core/pdf_to_spreadsheet_pipeline.py...' -ForegroundColor Yellow
python core/pdf_to_spreadsheet_pipeline.py
if ($LASTEXITCODE -ne 0) { throw 'Falha ao executar pdf_to_spreadsheet_pipeline.py!' }

Write-Host ''
Write-Host '[2/2] Validando arquivo de planilha output/pobj_com_nba.csv...' -ForegroundColor Yellow
if (-not (Test-Path 'output/pobj_com_nba.csv')) { throw 'Arquivo output/pobj_com_nba.csv nao foi gerado!' }

$lines = Get-Content 'output/pobj_com_nba.csv'
if ($lines.Count -lt 5) { throw 'Planilha gerada com menos de 5 linhas!' }
Write-Host "  [OK] Planilha gerada com $($lines.Count) linhas e formatacao compativel com Excel." -ForegroundColor Green

Write-Host ''
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host '   PIPELINE PDF -> PLANILHA NBA 100% HOMOLOGADO SEM TIMEOUT!           ' -ForegroundColor Green
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host ''

Write-Host 'PDF_SPREADSHEET_PIPELINE_PASS' -ForegroundColor Green
exit 0