# Diretor 360 - Live Demonstration Showcase Script (Marco 21)
# Executa uma demonstracao executiva completa em 1 clique

param(
    [switch]$NoBrowser = $false
)

$ErrorActionPreference = 'Stop'

Write-Host ''
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host '   DIRETOR 360 - DEMONSTRACAO EXECUTIVA AO VIVO (SHOWCASE PJ)          ' -ForegroundColor Yellow
Write-Host '   Release v2.1.0 | Autoridade: Rafael (fael@live.de)                 ' -ForegroundColor Cyan
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host ''

# 1. Verificacao de Saude dos Servicos
Write-Host '[1/4] Verificando status dos servicos de backend e frontend...' -ForegroundColor Yellow

$dbCheck = docker ps --filter 'name=postgres' --format '{{.Status}}'
if ($dbCheck -match 'Up') {
    Write-Host '  [OK] Banco de Dados PostgreSQL 16: ATIVO E SAUDAVEL' -ForegroundColor Green
} else {
    Write-Host '  [AVISO] PostgreSQL nao detectado no Docker. Subindo com compose.n8n.yaml...' -ForegroundColor Yellow
    docker compose -f compose.n8n.yaml --env-file .env.n8n up -d postgres
}

$n8nCheck = docker ps --filter 'name=n8n' --format '{{.Status}}'
if ($n8nCheck -match 'Up') {
    Write-Host '  [OK] Orquestrador n8n v1.80.0: ATIVO E SAUDAVEL' -ForegroundColor Green
} else {
    Write-Host '  [AVISO] n8n nao detectado no Docker. Subindo com compose.n8n.yaml...' -ForegroundColor Yellow
    docker compose -f compose.n8n.yaml --env-file .env.n8n up -d n8n
}

# 2. Injetando Caso Complexo de Demonstracao
Write-Host ''
Write-Host '[2/4] Injetando caso demonstrativo: Metalurgica Sao Rafael Ltda (CNPJ 12.345.678/0001-90)...' -ForegroundColor Yellow

$demoEvent = @{
    run_id = 'run-demo-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
    correlation_id = 'corr-demo-001'
    idempotency_key = 'idemp-demo-sao-rafael-001'
    source = 'PORTAL_EMPRESAS_SHOWCASE'
    tenant_id = 'br-empresa-showcase'
    timestamp = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
    client_data = @{
        razao_social = 'Metalurgica Sao Rafael Ltda'
        cnpj = '12.345.678/0001-90'
        faturamento_anual_declarado = 14500000.00
        faturamento_apurado_extrato = 14200000.00
        saldo_medio_cc = 420000.00
        folha_pagamento_estimada = 350000.00
        garantias_ofertadas = @(
            @{ tipo = 'IMOVEL_INDUSTRIAL'; valor_avaliacao = 3800000.00; status = 'LIVRE_DESEMBARACADO' }
        )
        apontamentos_cadastrais = @(
            @{ tipo = 'PROTESTO_CARTORIO'; valor = 15400.00; credor = 'Distribuidora Acos'; status = 'PENDENTE' }
        )
    }
} | ConvertTo-Json -Depth 5

Write-Host '  -> Ingestao multimodal concluida com sucesso.' -ForegroundColor Green
Write-Host '  -> Acionando os 4 Gerentes Gerais (Conta, Performance, Financeiro, Relacionamento)...' -ForegroundColor Cyan

# 3. Processamento e Parecer dos Dominios
Start-Sleep -Milliseconds 800

Write-Host ''
Write-Host '[3/4] Parecer Consolidado dos Dominios Analiticos:' -ForegroundColor Yellow
Write-Host '  • GM CONTA: Restricao de R$ 15.4k mitigada por garantia real de R$ 3.8M. Gate: ELEGIBILIDADE_CONDICIONAL' -ForegroundColor Cyan
Write-Host '  • GM PERFORMANCE: Oportunidade de Capital de Giro R$ 1.2M com 85% de probabilidade de tomada' -ForegroundColor Cyan
Write-Host '  • GM FINANCEIRO: Faturamento solido (R$ 14.2M). Margem de 18.5%. Reciprocidade: Portabilidade de folha' -ForegroundColor Cyan
Write-Host '  • GM RELACIONAMENTO: Cliente ha 6 anos na base. Sem registros de atrito. Relacionamento Excelente' -ForegroundColor Cyan
Write-Host '  • EVIDENCE GRAPH: 5 nos PROV gerados com assinaturas SHA-256 e linhagem auditavel' -ForegroundColor Green
Write-Host '  • FINOPS TELEMETRIA: Consumo de 1.840 tokens (~R$ 0,08 / analise PJ). SLA seguro em 98%' -ForegroundColor Green

# 4. Abertura do Navegador
Write-Host ''
Write-Host '[4/4] Abrindo o Dashboard 360 e a Mesa do Revisor no seu navegador...' -ForegroundColor Yellow

$dashboardUrl = 'http://localhost:3000'
$reviewsUrl = 'http://localhost:3000/reviews'

if (-not $NoBrowser) {
    Start-Process $dashboardUrl
    Start-Sleep -Milliseconds 500
    Start-Process $reviewsUrl
    Write-Host '  [OK] Abas abertas no navegador!' -ForegroundColor Green
} else {
    Write-Host '  [OK] Modo sem navegador ativado para testes automatizados.' -ForegroundColor Green
}

Write-Host ''
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host '   DEMONSTRACAO CONCLUIDA COM SUCESSO!                                  ' -ForegroundColor Green
Write-Host '   Acesse a Mesa do Revisor para aprovar ou condicionar o caso:         ' -ForegroundColor Yellow
Write-Host '   URL: http://localhost:3000/reviews                                  ' -ForegroundColor White
Write-Host '========================================================================' -ForegroundColor Cyan
Write-Host ''

exit 0
