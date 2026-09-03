-- 10-flywheel-learning-upgrade.sql
-- Marco N2.3 — Segunda Remediação: Upgrade Incremental sem DROP do Flywheel de Aprendizado
-- Banco: visao360

\connect visao360;

-- 1. Tabela de Memória Bruta / Episódica de Conversas (episodic_memory)
CREATE TABLE IF NOT EXISTS episodic_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(50) NOT NULL DEFAULT 'default',
    owner_id VARCHAR(100) NOT NULL DEFAULT 'rafael',
    channel VARCHAR(20) NOT NULL DEFAULT 'TELEGRAM',
    chat_id VARCHAR(100) NOT NULL,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('INBOUND', 'OUTBOUND')),
    actor_role VARCHAR(50) NOT NULL CHECK (actor_role IN ('OWNER', 'DIRETOR_360', 'SYSTEM', 'ASSISTANT')),
    content TEXT NOT NULL,
    content_hash CHAR(64) NOT NULL CHECK (content_hash ~ '^[0-9a-f]{64}$'),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    retention_days INT NOT NULL DEFAULT 90,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_episodic_memory_tenant ON episodic_memory (tenant_id, chat_id, created_at DESC);

-- 2. Tabela de Memória Estruturada (fatos, preferências, regras, erros, estratégias)
CREATE TABLE IF NOT EXISTS structured_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(50) NOT NULL DEFAULT 'default',
    owner_id VARCHAR(100) NOT NULL DEFAULT 'rafael',
    memory_type VARCHAR(30) NOT NULL CHECK (memory_type IN ('FACT', 'PREFERENCE', 'RULE', 'ERROR', 'STRATEGY')),
    scope VARCHAR(30) NOT NULL CHECK (scope IN ('GLOBAL', 'DOMAIN', 'CLIENT', 'OPERATION')),
    target_ref VARCHAR(100) NOT NULL,
    data JSONB NOT NULL,
    confidence_score NUMERIC(3,2) NOT NULL DEFAULT 1.00 CHECK (confidence_score >= 0.00 AND confidence_score <= 1.00),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('CANDIDATE', 'ACTIVE', 'SUPERSEDED', 'REVOKED', 'EXPIRED')),
    origin VARCHAR(50) NOT NULL DEFAULT 'OWNER_PROVIDED' CHECK (origin IN ('OWNER_PROVIDED', 'INFERRED_INTERACTION', 'SUPERVISED_DECISION')),
    evidence_node_id VARCHAR(100),
    idempotency_key VARCHAR(150),
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '365 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_structured_memory_window CHECK (valid_from < valid_to),
    CONSTRAINT uq_structured_memory_tenant_idemp UNIQUE (tenant_id, idempotency_key)
);
CREATE INDEX IF NOT EXISTS idx_structured_memory_lookup ON structured_memory (tenant_id, memory_type, scope, target_ref, status);

-- 3. Upgrade de promoted_knowledge com Governança de Autopromoção e Lifecycle
ALTER TABLE promoted_knowledge 
    ADD COLUMN IF NOT EXISTS promotion_mode VARCHAR(20) CHECK (promotion_mode IN ('AUTO', 'OWNER_EXPLICIT', 'MANUAL_REVIEW')),
    ADD COLUMN IF NOT EXISTS promotion_policy_version VARCHAR(50),
    ADD COLUMN IF NOT EXISTS promotion_score NUMERIC(4,3) CHECK (promotion_score >= 0.000 AND promotion_score <= 1.000),
    ADD COLUMN IF NOT EXISTS promotion_reason TEXT,
    ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20) CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    ADD COLUMN IF NOT EXISTS risk_reason TEXT,
    ADD COLUMN IF NOT EXISTS frequency INT DEFAULT 1 CHECK (frequency >= 1),
    ADD COLUMN IF NOT EXISTS last_observed_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS learning_run_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS approval_event_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS evidence_refs JSONB DEFAULT '[]'::jsonb;

-- Ajustar constraints de unicidade por tenant em promoted_knowledge
ALTER TABLE promoted_knowledge DROP CONSTRAINT IF EXISTS promoted_knowledge_idempotency_key_key;
ALTER TABLE promoted_knowledge DROP CONSTRAINT IF EXISTS uq_promoted_knowledge_tenant_idemp;
ALTER TABLE promoted_knowledge ADD CONSTRAINT uq_promoted_knowledge_tenant_idemp UNIQUE (tenant_id, idempotency_key);

-- Enforçar que PROMOTED exige base de promoção válida
ALTER TABLE promoted_knowledge DROP CONSTRAINT IF EXISTS chk_promoted_knowledge_promotion_base;
ALTER TABLE promoted_knowledge ADD CONSTRAINT chk_promoted_knowledge_promotion_base CHECK (
    status <> 'PROMOTED' OR (
        promotion_mode IS NOT NULL AND
        promotion_policy_version IS NOT NULL AND
        promotion_score IS NOT NULL AND
        (
            (promotion_mode = 'OWNER_EXPLICIT' AND approved_by IS NOT NULL AND approved_at IS NOT NULL) OR
            (promotion_mode = 'AUTO' AND learning_run_id IS NOT NULL) OR
            (promotion_mode = 'MANUAL_REVIEW' AND approved_by IS NOT NULL AND approval_event_id IS NOT NULL)
        )
    )
);

-- 4. Upgrade de golden_exemplars
ALTER TABLE golden_exemplars ALTER COLUMN status SET DEFAULT 'CANDIDATE';
ALTER TABLE golden_exemplars ALTER COLUMN approved_by DROP DEFAULT;
ALTER TABLE golden_exemplars ALTER COLUMN approved_at DROP DEFAULT;
ALTER TABLE golden_exemplars 
    ADD COLUMN IF NOT EXISTS promotion_mode VARCHAR(20) CHECK (promotion_mode IN ('AUTO', 'OWNER_EXPLICIT', 'MANUAL_REVIEW')),
    ADD COLUMN IF NOT EXISTS promotion_score NUMERIC(4,3) CHECK (promotion_score >= 0.000 AND promotion_score <= 1.000),
    ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20) CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    ADD COLUMN IF NOT EXISTS learning_run_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS evidence_refs JSONB DEFAULT '[]'::jsonb;

ALTER TABLE golden_exemplars DROP CONSTRAINT IF EXISTS golden_exemplars_idempotency_key_key;
ALTER TABLE golden_exemplars DROP CONSTRAINT IF EXISTS uq_golden_exemplars_tenant_idemp;
ALTER TABLE golden_exemplars ADD CONSTRAINT uq_golden_exemplars_tenant_idemp UNIQUE (tenant_id, idempotency_key);

-- Enforçar que exemplar ACTIVE exige base válida
ALTER TABLE golden_exemplars DROP CONSTRAINT IF EXISTS chk_golden_exemplar_active_base;
ALTER TABLE golden_exemplars ADD CONSTRAINT chk_golden_exemplar_active_base CHECK (
    status <> 'ACTIVE' OR (
        promotion_mode IS NOT NULL AND
        (
            (promotion_mode = 'OWNER_EXPLICIT' AND approved_by IS NOT NULL) OR
            (promotion_mode = 'AUTO' AND learning_run_id IS NOT NULL)
        )
    )
);

-- 5. Upgrade de negative_memory
ALTER TABLE negative_memory ALTER COLUMN status SET DEFAULT 'CANDIDATE';
ALTER TABLE negative_memory 
    ADD COLUMN IF NOT EXISTS entity_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS entity_type VARCHAR(50) DEFAULT 'CLIENT',
    ADD COLUMN IF NOT EXISTS promotion_mode VARCHAR(20) CHECK (promotion_mode IN ('AUTO', 'OWNER_EXPLICIT', 'MANUAL_REVIEW')),
    ADD COLUMN IF NOT EXISTS promotion_score NUMERIC(4,3) CHECK (promotion_score >= 0.000 AND promotion_score <= 1.000),
    ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20) CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    ADD COLUMN IF NOT EXISTS learning_run_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS evidence_refs JSONB DEFAULT '[]'::jsonb;

ALTER TABLE negative_memory DROP CONSTRAINT IF EXISTS negative_memory_idempotency_key_key;
ALTER TABLE negative_memory DROP CONSTRAINT IF EXISTS uq_negative_memory_tenant_idemp;
ALTER TABLE negative_memory ADD CONSTRAINT uq_negative_memory_tenant_idemp UNIQUE (tenant_id, idempotency_key);

-- Enforçar que negative_memory ACTIVE exige base válida
ALTER TABLE negative_memory DROP CONSTRAINT IF EXISTS chk_negative_memory_active_base;
ALTER TABLE negative_memory ADD CONSTRAINT chk_negative_memory_active_base CHECK (
    status <> 'ACTIVE' OR (
        promotion_mode IS NOT NULL AND
        (
            (promotion_mode = 'OWNER_EXPLICIT' AND approved_by IS NOT NULL) OR
            (promotion_mode = 'AUTO' AND learning_run_id IS NOT NULL)
        )
    )
);

-- 6. Upgrade de decision_outcomes com unicidade por tenant
ALTER TABLE decision_outcomes DROP CONSTRAINT IF EXISTS decision_outcomes_idempotency_key_key;
ALTER TABLE decision_outcomes DROP CONSTRAINT IF EXISTS uq_decision_outcomes_tenant_idemp;
ALTER TABLE decision_outcomes ADD CONSTRAINT uq_decision_outcomes_tenant_idemp UNIQUE (tenant_id, idempotency_key);

-- 7. Imutabilidade e Integridade Criptográfica de flywheel_audit_events
ALTER TABLE flywheel_audit_events 
    ADD COLUMN IF NOT EXISTS previous_event_hash VARCHAR(64) CHECK (previous_event_hash IS NULL OR previous_event_hash ~ '^[0-9a-f]{64}$');

-- Validação estrita de SHA-256 (64 hex lowercase)
ALTER TABLE flywheel_audit_events DROP CONSTRAINT IF EXISTS chk_audit_hash_sha256;
ALTER TABLE flywheel_audit_events ADD CONSTRAINT chk_audit_hash_sha256 CHECK (evidence_hash ~ '^[0-9a-f]{64}$');

-- Trigger de Imutabilidade Append-Only: Impede qualquer UPDATE ou DELETE
CREATE OR REPLACE FUNCTION prevent_audit_tampering() RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'TABELA DE AUDITORIA É APPEND-ONLY: UPDATE OU DELETE PROIBIDOS (TABELA: %, OPERACAO: %)', TG_TABLE_NAME, TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_flywheel_audit_no_update_delete ON flywheel_audit_events;
CREATE TRIGGER trg_flywheel_audit_no_update_delete
BEFORE UPDATE OR DELETE ON flywheel_audit_events
FOR EACH ROW EXECUTE FUNCTION prevent_audit_tampering();

-- 8. Função Determinística de Similaridade Semântica Cosseno
CREATE OR REPLACE FUNCTION cosine_similarity(a float8[], b float8[]) RETURNS float8 AS $$
DECLARE
    dot float8 := 0;
    norm_a float8 := 0;
    norm_b float8 := 0;
    i int;
BEGIN
    IF a IS NULL OR b IS NULL THEN
        RETURN NULL;
    END IF;
    IF array_length(a, 1) <> array_length(b, 1) THEN
        RETURN NULL;
    END IF;
    FOR i IN 1..array_length(a, 1) LOOP
        dot := dot + (a[i] * b[i]);
        norm_a := norm_a + (a[i] * a[i]);
        norm_b := norm_b + (b[i] * b[i]);
    END LOOP;
    IF norm_a = 0 OR norm_b = 0 THEN
        RETURN 0;
    END IF;
    RETURN dot / (sqrt(norm_a) * sqrt(norm_b));
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT;