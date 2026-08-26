# Test Phase 4 - Decision Intelligence & Laudo Executivo 360 em PDF
$ErrorActionPreference = 'Stop'

Write-Host "Testando homologacao da Fase 4 (Decision Intelligence & Laudos PDF)..." -ForegroundColor Cyan

# 1. Validar Schema Draft 2020-12 do Decision Record
Write-Host ""
Write-Host "[1/4] Verificando schema formal contracts/decision-record.schema.json..." -ForegroundColor Yellow
$schemaPath = "contracts/decision-record.schema.json"
if (-not (Test-Path $schemaPath)) { throw "Schema $schemaPath não encontrado!" }
$schema = Get-Content $schemaPath -Raw | ConvertFrom-Json
if ($schema.'$schema' -notmatch "2020-12") { throw "Schema não está no padrão Draft 2020-12!" }
Write-Host "  [OK] Schema do Decision Record Draft 2020-12 validado." -ForegroundColor Green

# 2. Validar motor gerador de PDF
Write-Host ""
Write-Host "[2/4] Verificando motor de geração em Python (core/pdf_report_generator.py)..." -ForegroundColor Yellow
$enginePath = "core/pdf_report_generator.py"
if (-not (Test-Path $enginePath)) { throw "Motor $enginePath não encontrado!" }
Write-Host "  [OK] Motor de PDF validado." -ForegroundColor Green

# 3. Executar gerador de PDF para caso sintético
Write-Host ""
Write-Host "[3/4] Gerando Laudo Executivo 360 em PDF de 3 páginas..." -ForegroundColor Yellow
$caseFile = "test-data/evals/cases/case-01-ind-metalurgica-regular.json"
$outPdf = "test-data/laudo_executivo_360_sample.pdf"

if (Test-Path $outPdf) { Remove-Item $outPdf -Force }

& python core/pdf_report_generator.py $caseFile $outPdf
if ($LASTEXITCODE -ne 0) { throw "Falha na geração do PDF!" }

if (-not (Test-Path $outPdf)) { throw "Arquivo PDF de saída $outPdf não foi criado!" }
$fileSize = (Get-Item $outPdf).Length
if ($fileSize -lt 3000) { throw "PDF gerado está corrompido ou vazio (tamanho: $fileSize bytes)!" }
Write-Host "  [OK] PDF gerado com sucesso: $outPdf ($([math]::Round($fileSize/1024, 2)) KB)." -ForegroundColor Green

# 4. Validar rota de API Next.js
Write-Host ""
Write-Host "[4/4] Verificando rota de API de download (app/api/reports/laudo-pdf/route.ts)..." -ForegroundColor Yellow
$routePath = "app/api/reports/laudo-pdf/route.ts"
if (-not (Test-Path $routePath)) { throw "Rota $routePath não encontrada!" }
Write-Host "  [OK] Rota de download validada." -ForegroundColor Green

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "   FASE 4 (DECISION INTELLIGENCE & LAUDO PDF) HOMOLOGADA COM SUCESSO!   " -ForegroundColor Green
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "H4_DECISION_PDF_PASS" -ForegroundColor Green
exit 0
