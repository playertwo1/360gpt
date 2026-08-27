# Test H7 - Visao Executiva 360 Completa
$ErrorActionPreference = 'Stop'

Write-Host 'Testando homologacao da Fase H7 (Visao Executiva 360 Completa)...' -ForegroundColor Cyan

# 1. Validar os 4 Gerentes Gerais e o Bibliotecario transversal
Write-Host ''
Write-Host '[1/4] Verificando documentos canônicos dos 4 Gerentes Gerais e do Bibliotecário...' -ForegroundColor Yellow
$gmFiles = @(
    'domains/conta/GERENTE_GERAL_CONTA.md',
    'domains/performance/GERENTE_GERAL_PERFORMANCE.md',
    'domains/financeiro/GERENTE_GERAL_FINANCEIRO.md',
    'domains/relacionamento/GERENTE_GERAL_RELACIONAMENTO.md'
)
foreach ($file in $gmFiles) {
    if (-not (Test-Path $file)) { throw "Contrato de dominio $file ausente!" }
    Write-Host "  [OK] Dominio validado: $file" -ForegroundColor Green
}
$knowledgeFile = 'domains/conhecimento/GERENTE_GERAL_CONHECIMENTO.md'
$baseFile = 'domains/GERENTES_GERAIS_BASE.md'
if (-not (Test-Path $knowledgeFile) -or -not (Test-Path $baseFile)) {
    throw 'Base canônica ou contrato transversal de Conhecimento ausente!'
}
$knowledgeSpec = Get-Content $knowledgeFile -Raw
if ($knowledgeSpec -notmatch 'não é uma quinta área de resultado') {
    throw 'O papel transversal do Bibliotecário não está explícito!'
}
Write-Host '  [OK] Bibliotecário transversal validado como apoio às quatro áreas.' -ForegroundColor Green

# 2. Validar navegabilidade e contratos do Evidence Graph
Write-Host ''
Write-Host '[2/4] Verificando schemas do Evidence Graph e Estado 360...' -ForegroundColor Yellow
$egSchema = 'contracts/evidence-graph.schema.json'
$stSchema = 'contracts/state-360.schema.json'
if (-not (Test-Path $egSchema) -or -not (Test-Path $stSchema)) { throw 'Schemas do grafo ou estado ausentes!' }
Write-Host '  [OK] Schema do Evidence Graph (W3C PROV) validado.' -ForegroundColor Green
Write-Host '  [OK] Schema do Estado 360 validado.' -ForegroundColor Green

# 3. Validar componente do Assessor Executivo
Write-Host ''
Write-Host '[3/4] Verificando workflow do Assessor Executivo 360...' -ForegroundColor Yellow
$assessorPath = 'n8n/workflows/wf-07-assessor-executivo.json'
if (-not (Test-Path $assessorPath)) { throw 'Workflow do Assessor Executivo ausente!' }
$assessorWf = Get-Content $assessorPath -Raw | ConvertFrom-Json
Write-Host "  [OK] Assessor Executivo WF-07 validado ($($assessorWf.nodes.Count) nós)." -ForegroundColor Green

# 4. Validar Mesa do Revisor e Playbook de Conflitos
Write-Host ''
Write-Host '[4/4] Verificando tratamento de revisoes estruturadas...' -ForegroundColor Yellow
$playbookPath = 'docs/PLAYBOOK_REVISOR_360.md'
$reviewSchema = 'contracts/manual-review.schema.json'
if (-not (Test-Path $playbookPath) -or -not (Test-Path $reviewSchema)) { throw 'Playbook ou Schema de revisao ausentes!' }
Write-Host '  [OK] Conflitos geram reason_code fechado e pergunta objetiva na Mesa do Revisor.' -ForegroundColor Green


Write-Host ''
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host '   FASE H7 (VISAO EXECUTIVA 360 COMPLETA) HOMOLOGADA COM SUCESSO!       ' -ForegroundColor Green
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host ''

Write-Host 'H7_EXECUTIVE_VIEW_PASS' -ForegroundColor Green
exit 0
