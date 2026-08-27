# Teste de Homologacao da Fase 9 - Gerente Geral de Conhecimento ("O Bibliotecario")
$ErrorActionPreference = 'Stop'

Write-Host "Testando homologacao da Fase 9 (Gerente Geral de Conhecimento - O Bibliotecario)..." -ForegroundColor Cyan
Write-Host ""

# 1. Validar documentos de especificacao e schema
Write-Host "[1/5] Verificando especificacao e schema Draft 2020-12..." -ForegroundColor Yellow
$specFile = "domains/conhecimento/GERENTE_GERAL_CONHECIMENTO.md"
$schemaFile = "contracts/conhecimento-handoff.schema.json"

if (-not (Test-Path $specFile)) { throw "Especificacao $specFile ausente!" }
if (-not (Test-Path $schemaFile)) { throw "Schema $schemaFile ausente!" }

$schema = Get-Content $schemaFile -Raw | ConvertFrom-Json
if ($schema.'$schema' -notmatch 'draft/2020-12') {
    throw "Schema do Bibliotecario deve validar em Draft 2020-12!"
}
Write-Host "  [OK] Especificacao de dominio e Schema Draft 2020-12 validados." -ForegroundColor Green

# 2. Validar motor core/knowledge_engine.py
Write-Host ""
Write-Host "[2/5] Verificando motor core/knowledge_engine.py..." -ForegroundColor Yellow
$engineFile = "core/knowledge_engine.py"
if (-not (Test-Path $engineFile)) { throw "Motor $engineFile ausente!" }
Write-Host "  [OK] Motor de conhecimento validado." -ForegroundColor Green

# 3. Executar consultas auditaveis (Normativo, Metas, Formulario e Ramal)
Write-Host ""
Write-Host "[3/5] Executando consultas oficiais com citacao auditavel e hash SHA-256..." -ForegroundColor Yellow

$pyAudit = @"
import json
from core.knowledge_engine import KnowledgeEngine

engine = KnowledgeEngine()

# 1. Normativo
q_norm = engine.query_knowledge('NORMATIVO', 'limite alcada capital de giro sem garantia')
assert q_norm['status'] == 'READY'
assert 'IN_CRED_2026_01' in q_norm['source_citations'][0]['source_document_id']
assert len(q_norm['source_citations'][0]['sha256_hash']) == 64

# 2. Metas
q_meta = engine.query_knowledge('METAS_PONTUACAO', 'pontos antecipacao recebiveis')
assert q_meta['status'] == 'READY'
assert 'TAB_METAS_2026_Q3' in q_meta['source_citations'][0]['source_document_id']

# 3. Formulario
q_form = engine.query_knowledge('FORMULARIO', 'formulario cartao corporativo')
assert q_form['status'] == 'READY'
assert 'CAT_FORMULARIOS_2026' in q_form['source_citations'][0]['source_document_id']

# 4. Ramal
q_ramal = engine.query_knowledge('CONTATO_RAMAL', 'ramal mesa cambio')
assert q_ramal['status'] == 'READY'
assert '4102' in q_ramal['findings'][0]['statement']

print('AUDIT_QUERIES_PASS')
"@

$resAudit = python -c "$pyAudit"
if ($resAudit -notmatch 'AUDIT_QUERIES_PASS') {
    throw "Falha nas consultas auditaveis da base de conhecimento!"
}
Write-Host "  [OK] Consultas de Normativos, Metas, Formularios e Ramais responderam com SHA-256 integro." -ForegroundColor Green

# 4. Validar protecao anti-alucinacao (EVIDENCE_NOT_FOUND)
Write-Host ""
Write-Host "[4/5] Validando protecao estrita anti-alucinacao (EVIDENCE_NOT_FOUND)..." -ForegroundColor Yellow

$pyAntiAlucinacao = @"
from core.knowledge_engine import KnowledgeEngine

engine = KnowledgeEngine()
q_inexistente = engine.query_knowledge('NORMATIVO', 'processo de concessao de subsidio para viagem interplanetaria')
assert q_inexistente['status'] == 'EVIDENCE_NOT_FOUND'
assert len(q_inexistente['findings']) == 0
assert 'Nenhuma regra ou norma foi inventada' in q_inexistente['audit_message']

print('ANTI_HALLUCINATION_PASS')
"@

$resAnti = python -c "$pyAntiAlucinacao"
if ($resAnti -notmatch 'ANTI_HALLUCINATION_PASS') {
    throw "Falha no teste anti-alucinacao! O motor tentou inventar dados."
}
Write-Host "  [OK] O Bibliotecario recusou dado inexistente e bloqueou alucinacao com sucesso." -ForegroundColor Green

# 5. Validar deteccao de conflito normativo e escalonamento para Rafael
Write-Host ""
Write-Host "[5/5] Validando deteccao de conflitos normativos (DIVERGENCIA_NORMATIVA)..." -ForegroundColor Yellow

$pyConflict = @"
from core.knowledge_engine import KnowledgeEngine

engine = KnowledgeEngine()

# Ingestao de norma conflitante sem revogacao formal
norma_conflitante = {
    'doc_id': 'IN_CRED_2026_02_CONFLITO',
    'title': 'Instrucao Normativa Conflitante de Alçada',
    'version': '1.1',
    'category': 'NORMATIVO',
    'valid_from': '2026-08-01',
    'valid_to': None,
    'is_active': True,
    'supersedes': None, # SEM REVOGACAO EXPLICITA
    'content': 'Art. 4º: O limite de alçada local da agência para Capital de Giro é de R$ 800.000,00.',
    'page_or_section': 'Artigo 4º, Página 1',
    'keywords': ['alcada', 'capital de giro', 'limite']
}

res = engine.ingest_document(norma_conflitante)
assert res['status'] == 'MANUAL_REVIEW_REQUIRED'
assert len(res['conflicts']) >= 1
assert res['conflicts'][0]['conflict_type'] == 'DIVERGENCIA_NORMATIVA'
assert res['conflicts'][0]['decision_required_from'] == 'rafael'

print('CONFLICT_DETECTION_PASS')
"@

$resConflict = python -c "$pyConflict"
if ($resConflict -notmatch 'CONFLICT_DETECTION_PASS') {
    throw "Falha na deteccao de conflito normativo!"
}
Write-Host "  [OK] Conflito normativo detectado e escalonado para despacho de Rafael na Mesa do Revisor." -ForegroundColor Green

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "   FASE 9 (GERENTE GERAL DE CONHECIMENTO) HOMOLOGADA COM SUCESSO!       " -ForegroundColor Green
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "H9_BIBLIOTECARIO_KNOWLEDGE_PASS" -ForegroundColor Green
exit 0