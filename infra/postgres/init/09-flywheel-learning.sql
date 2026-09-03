-- 09-flywheel-learning.sql
-- Marco N2.3 — Arquitetura de Aprendizado Contínuo em Contexto e Flywheel Multiagente
-- Banco: visao360

\connect visao360;

DROP TABLE IF EXISTS flywheel_audit_events CASCADE;
DROP TABLE IF EXISTS negative_memory CASCADE;
DROP TABLE IF EXISTS decision_outcomes CASCADE;
DROP TABLE IF EXISTS golden_exemplars CASCADE;
DROP TABLE IF EXISTS promoted_knowledge CASCADE;

-- 1. Tabela de Conhecimento Semântico Promovido (promoted_knowledge)
CREATE TABLE promoted_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(50) NOT NULL DEFAULT 'default',
    owner_id VARCHAR(100) NOT NULL DEFAULT 'rafael',
    category VARCHAR(50) NOT NULL,
    scope VARCHAR(20) NOT NULL CHECK (scope IN ('GLOBAL', 'ACCOUNT', 'INDICATOR')),
    target_ref VARCHAR(100) NOT NULL DEFAULT 'GLOBAL',
    learned_rule TEXT NOT NULL,
    source_observation TEXT,
    confidence_score NUMERIC(3,2) NOT NULL DEFAULT 1.00 CHECK (confidence_score >= 0.00 AND confidence_score <= 1.00),
    status VARCHAR(20) NOT NULL DEFAULT 'CANDIDATE' CHECK (status IN ('CANDIDATE', 'PROMOTED', 'SUPERSEDED', 'REVOKED', 'EXPIRED')),
    created_by VARCHAR(50) NOT NULL DEFAULT 'system',
    approved_by VARCHAR(50),
    approved_at TIMESTAMPTZ,
    revoked_by VARCHAR(50),
    revoked_at TIMESTAMPTZ,
    source_event_id VARCHAR(100),
    evidence_node_id VARCHAR(100),
    idempotency_key VARCHAR(150) UNIQUE,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '180 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_knowledge_valid_window CHECK (valid_from < valid_to)
);
CREATE INDEX idx_promoted_knowledge_lookup ON promoted_knowledge (tenant_id, scope, target_ref, status);

-- 2. Tabela de Exemplares Dourados Dinâmicos (golden_exemplars)
CREATE TABLE golden_exemplars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(50) NOT NULL DEFAULT 'default',
    sector VARCHAR(50) NOT NULL,
    objective VARCHAR(50) NOT NULL,
    client_name VARCHAR(150),
    channel VARCHAR(20) NOT NULL DEFAULT 'WHATSAPP',
    approved_text TEXT NOT NULL,
    author VARCHAR(50) NOT NULL DEFAULT 'RAFAEL',
    rating INT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RETIRED')),
    approved_by VARCHAR(50) NOT NULL DEFAULT 'RAFAEL',
    approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    idempotency_key VARCHAR(150) UNIQUE,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_golden_exemplars_lookup ON golden_exemplars (tenant_id, sector, objective, channel, status);

-- 3. Tabela de Desfechos de Decisão (decision_outcomes)
CREATE TABLE decision_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(50) NOT NULL DEFAULT 'default',
    recommendation_id VARCHAR(100) NOT NULL,
    domain VARCHAR(50) NOT NULL CHECK (domain IN ('PERFORMANCE', 'CONTA', 'RELACIONAMENTO', 'FINANCEIRO', 'GERAL')),
    proposed_payload JSONB NOT NULL,
    outcome_type VARCHAR(50) NOT NULL CHECK (outcome_type IN ('ACEITO_INTEGRAL', 'EDITADO_POR_RAFAEL', 'RECUSADO_COM_MOTIVO')),
    final_payload JSONB,
    feedback_note TEXT,
    delta_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
    evidence_node_id VARCHAR(100),
    idempotency_key VARCHAR(150) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_decision_outcomes_domain ON decision_outcomes (tenant_id, domain, outcome_type);

-- 4. Tabela de Memória Negativa e Anti-Padrões (negative_memory)
CREATE TABLE negative_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(50) NOT NULL DEFAULT 'default',
    target_entity VARCHAR(100) NOT NULL,
    vetoed_topic VARCHAR(50) NOT NULL CHECK (vetoed_topic IN ('PRODUCT', 'CHANNEL', 'SCHEDULE', 'ARGUMENT')),
    forbidden_action TEXT NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('CANDIDATE', 'ACTIVE', 'SUPERSEDED', 'REVOKED', 'EXPIRED')),
    created_by VARCHAR(50) NOT NULL DEFAULT 'system',
    approved_by VARCHAR(50),
    approved_at TIMESTAMPTZ,
    evidence_node_id VARCHAR(100),
    idempotency_key VARCHAR(150) UNIQUE,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '365 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_negative_valid_window CHECK (valid_from < valid_to)
);
CREATE INDEX idx_negative_memory_entity ON negative_memory (tenant_id, target_entity, vetoed_topic, status);

-- 5. Trilha de Auditoria Append-Only do Flywheel (flywheel_audit_events)
CREATE TABLE flywheel_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(50) NOT NULL DEFAULT 'default',
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('PROPOSAL_RECORDED', 'OUTCOME_RECORDED', 'CANDIDATE_CREATED', 'OWNER_PROMOTED', 'OWNER_REVOKED', 'VETO_ENFORCED', 'CONTEXT_INJECTED')),
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('RULE', 'EXEMPLAR', 'OUTCOME', 'NEGATIVE_MEMORY')),
    entity_id UUID NOT NULL,
    actor VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    evidence_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_flywheel_audit_events_entity ON flywheel_audit_events (tenant_id, entity_type, entity_id);