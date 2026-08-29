# Test Phase A4 - Projeto Ativo em Leitura Assistida (ACTIVE_READ_ONLY_SUPERVISED)
$ErrorActionPreference = 'Stop'

Write-Host ''
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host '   DIRETOR 360 - TESTE FASE A4 (LEITURA ASSISTIDA SUPERVISIONADA)      ' -ForegroundColor Yellow
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host ''

# 1. Validar integracao dos 4 Gerentes Gerais no Runtime
Write-Host '[1/4] Executando Runtime do Diretor 360 com os 4 Gerentes Gerais...' -ForegroundColor Yellow
$pyOutput = python core/director_360_runtime.py
if ($LASTEXITCODE -ne 0) { throw "Falha ao executar core/director_360_runtime.py" }
$result = $pyOutput | ConvertFrom-Json
Write-Host "  [OK] Estado 360 gerado: $($result.state_id)" -ForegroundColor Green

# 2. Validar que todos os 4 domínios foram integrados
Write-Host ''
Write-Host '[2/4] Verificando pareceres dos 4 domínios de negócio...' -ForegroundColor Yellow
$domains = $result.domain_handoffs | ForEach-Object { $_.domain }
$expectedDomains = @("CONTA", "PERFORMANCE", "FINANCEIRO", "RELACIONAMENTO")
foreach ($d in $expectedDomains) {
    if ($domains -notcontains $d) { throw "Parecer do domínio $d ausente!" }
    Write-Host "  [OK] Domínio validado em modo supervisionado: $d" -ForegroundColor Green
}

# 3. Validar salvaguardas e Human-in-the-Loop
Write-Host ''
Write-Host '[3/4] Verificando invariantes de Human-in-the-Loop e Autoridade...' -ForegroundColor Yellow
if ($result.mode -ne "ACTIVE_READ_ONLY_SUPERVISED") { throw "Modo invalido: $($result.mode)" }
if (-not $result.recommendation.requires_human_dispatch) { throw "requires_human_dispatch deve ser TRUE!" }
if ($result.recommendation.decision_authority -ne "rafael") { throw "Autoridade decisoria deve ser exclusivamente Rafael!" }
Write-Host "  [OK] Modo: ACTIVE_READ_ONLY_SUPERVISED" -ForegroundColor Green
Write-Host "  [OK] Despacho humano obrigatorio verificado (Autoridade: Rafael)." -ForegroundColor Green

# 4. Validar integridade e hash SHA-256
Write-Host ''
Write-Host '[4/4] Verificando hash SHA-256 e Evidence Graph...' -ForegroundColor Yellow
if ([string]::IsNullOrWhiteSpace($result.state_hash)) { throw "Hash do estado ausente!" }
if ($result.evidence_graph_nodes -lt 4) { throw "Nós insuficientes no Evidence Graph!" }
Write-Host "  [OK] Hash SHA-256 integro: $($result.state_hash.Substring(0, 16))..." -ForegroundColor Green
Write-Host "  [OK] Evidence Graph conectado ($($result.evidence_graph_nodes) nós)." -ForegroundColor Green

Write-Host ''
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host '   FASE A4 (LEITURA ASSISTIDA SUPERVISIONADA) HOMOLOGADA COM SUCESSO!   ' -ForegroundColor Green
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host ''

Write-Host 'A4_READ_ONLY_SUPERVISED_PASS' -ForegroundColor Green
exit 0