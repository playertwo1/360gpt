-- 12-flywheel-security-and-lifecycle.sql
-- Marco N2.3 / Quarta Remediação — Governança de Ciclo de Vida, Menor Privilégio e Auditoria Transacional
-- Banco: visao360

\connect visao360;

-- 1. Idempotência de índices (Q4-DB-01)
DROP INDEX IF EXISTS idx_promoted_knowledge_lookup;
CREATE INDEX IF NOT EXISTS idx_promoted_knowledge_lookup ON promoted_knowledge (tenant_id, scope, target_ref, status);

-- 2. Constraints de integridade no banco (Q4-N23-01 e Q4-N23-03)
ALTER TABLE promoted_knowledge DROP CONSTRAINT IF EXISTS chk_no_auto_textual;
ALTER TABLE promoted_knowledge ADD CONSTRAINT chk_no_auto_textual 
    CHECK (promotion_mode IS NULL OR promotion_mode != 'AUTO' OR category = 'STRUCTURED_PREFERENCE');

ALTER TABLE promoted_knowledge DROP CONSTRAINT IF EXISTS chk_no_inferred_global_active;
ALTER TABLE promoted_knowledge ADD CONSTRAINT chk_no_inferred_global_active 
    CHECK (NOT (scope = 'GLOBAL' AND status = 'PROMOTED' AND (approved_by IS NULL OR approved_by = 'SYSTEM_LEARNING_ENGINE')));

-- Expansão de tipos de evento de auditoria
ALTER TABLE flywheel_audit_events DROP CONSTRAINT IF EXISTS flywheel_audit_events_event_type_check;
ALTER TABLE flywheel_audit_events ADD CONSTRAINT flywheel_audit_events_event_type_check 
    CHECK (event_type IN ('PROPOSAL_RECORDED', 'OUTCOME_RECORDED', 'CANDIDATE_CREATED', 'AUTO_PROMOTED', 'OWNER_PROMOTED', 'OWNER_REVOKED', 'VETO_ENFORCED', 'CONTEXT_INJECTED', 'SUSPENDED', 'REVOKED'));

-- 3. Revogação de DML direto em promoted_knowledge para role operacional (Q4-N23-02 e Q4-N23-04)
REVOKE INSERT, UPDATE, DELETE ON promoted_knowledge FROM visao360_app;
GRANT SELECT ON promoted_knowledge TO visao360_app;

GRANT SELECT, INSERT ON golden_exemplars TO visao360_app;
GRANT SELECT, INSERT ON negative_memory TO visao360_app;
GRANT SELECT, INSERT ON decision_outcomes TO visao360_app;

-- 4. Funções SECURITY DEFINER para ciclo de vida atômico com auditoria obrigatória (Q4-N23-02 e Q4-N23-05)

-- 4.1 Criação de Candidata
CREATE OR REPLACE FUNCTION create_learning_candidate(
    p_tenant_id VARCHAR(50),
    p_owner_id VARCHAR(100),
    p_category VARCHAR(50),
    p_scope VARCHAR(20),
    p_target_ref VARCHAR(100),
    p_learned_rule TEXT,
    p_confidence_score NUMERIC(3,2),
    p_risk_level VARCHAR(20),
    p_frequency INTEGER,
    p_learning_run_id VARCHAR(100),
    p_idempotency_key VARCHAR(150),
    p_source_event_id VARCHAR(100) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_id UUID;
    v_audit_hash VARCHAR(64);
BEGIN
    INSERT INTO promoted_knowledge (
        tenant_id, owner_id, category, scope, target_ref, learned_rule,
        confidence_score, status, promotion_mode, risk_level, frequency,
        learning_run_id, idempotency_key, source_event_id, created_at, updated_at
    ) VALUES (
        p_tenant_id, p_owner_id, p_category, p_scope, p_target_ref, p_learned_rule,
        p_confidence_score, 'CANDIDATE', 'MANUAL_REVIEW', p_risk_level, p_frequency,
        p_learning_run_id, p_idempotency_key, p_source_event_id, NOW(), NOW()
    )
    ON CONFLICT (tenant_id, idempotency_key) DO UPDATE
        SET frequency = promoted_knowledge.frequency + 1, updated_at = NOW()
    RETURNING id INTO v_id;

    v_audit_hash := encode(sha256(convert_to(v_id::text || '|CANDIDATE_CREATED|' || p_tenant_id || '|' || NOW()::text, 'UTF8')), 'hex');

    INSERT INTO flywheel_audit_events (
        tenant_id, event_type, entity_type, entity_id, actor,
        payload, evidence_hash, created_at
    ) VALUES (
        p_tenant_id, 'CANDIDATE_CREATED', 'RULE', v_id, 'LEARNING_ENGINE',
        jsonb_build_object('policy_version', 'v2.3.1', 'justification', 'Criação de nova regra candidata para avaliação governada', 'risk_level', p_risk_level),
        v_audit_hash, NOW()
    );

    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 4.2 Autopromoção Exclusiva de Preferência Estruturada (Q4-N23-01)
CREATE OR REPLACE FUNCTION promote_safe_preference_auto(
    p_candidate_id UUID,
    p_tenant_id VARCHAR(50),
    p_preference_type VARCHAR(50),
    p_preference_value VARCHAR(50),
    p_policy_version VARCHAR(50),
    p_promotion_score NUMERIC(3,2)
) RETURNS BOOLEAN AS $$
DECLARE
    v_audit_hash VARCHAR(64);
BEGIN
    IF p_preference_type NOT IN ('RESPONSE_LENGTH', 'TABLE_PREFERENCE', 'TONE', 'SECTION_ORDER') THEN
        RAISE EXCEPTION 'PREFERENCIA_ESTRUTURADA_INVALIDA: % nao autorizada para modo AUTO', p_preference_type;
    END IF;

    UPDATE promoted_knowledge
    SET status = 'PROMOTED',
        category = 'STRUCTURED_PREFERENCE',
        promotion_mode = 'AUTO',
        promotion_policy_version = p_policy_version,
        promotion_score = p_promotion_score,
        approved_by = 'SYSTEM_LEARNING_ENGINE',
        approved_at = NOW(),
        updated_at = NOW()
    WHERE id = p_candidate_id AND tenant_id = p_tenant_id AND status = 'CANDIDATE';

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    v_audit_hash := encode(sha256(convert_to(p_candidate_id::text || '|AUTO_PROMOTED|' || p_tenant_id || '|' || NOW()::text, 'UTF8')), 'hex');

    INSERT INTO flywheel_audit_events (
        tenant_id, event_type, entity_type, entity_id, actor,
        payload, evidence_hash, created_at
    ) VALUES (
        p_tenant_id, 'AUTO_PROMOTED', 'RULE', p_candidate_id, 'SYSTEM_LEARNING_ENGINE',
        jsonb_build_object('policy_version', p_policy_version, 'justification', 'Autopromoção de preferência estruturada segura e determinística', 'preference_type', p_preference_type, 'preference_value', p_preference_value),
        v_audit_hash, NOW()
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 4.3 Promoção Soberana por Rafael (Q4-N23-07)
CREATE OR REPLACE FUNCTION owner_promote_candidate(
    p_candidate_id UUID,
    p_tenant_id VARCHAR(50),
    p_owner_id VARCHAR(100),
    p_source_event_id VARCHAR(100),
    p_event_hash VARCHAR(64),
    p_justification TEXT DEFAULT 'Aprovação soberana explícita por Rafael'
) RETURNS BOOLEAN AS $$
DECLARE
    v_audit_hash VARCHAR(64);
BEGIN
    IF p_source_event_id IS NULL OR p_event_hash IS NULL OR length(p_event_hash) < 64 THEN
        RAISE EXCEPTION 'PROVA_SOBERANA_OBRIGATORIA: source_event_id e event_hash de Rafael sao mandatorios';
    END IF;

    UPDATE promoted_knowledge
    SET status = 'PROMOTED',
        promotion_mode = 'OWNER_EXPLICIT',
        approved_by = p_owner_id,
        approved_at = NOW(),
        updated_at = NOW()
    WHERE id = p_candidate_id AND tenant_id = p_tenant_id AND status IN ('CANDIDATE', 'SUSPENDED');

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    v_audit_hash := encode(sha256(convert_to(p_candidate_id::text || '|OWNER_PROMOTED|' || p_tenant_id || '|' || p_event_hash, 'UTF8')), 'hex');

    INSERT INTO flywheel_audit_events (
        tenant_id, event_type, entity_type, entity_id, actor,
        payload, evidence_hash, created_at
    ) VALUES (
        p_tenant_id, 'OWNER_PROMOTED', 'RULE', p_candidate_id, p_owner_id,
        jsonb_build_object('policy_version', 'v2.3.1', 'justification', p_justification, 'source_event_id', p_source_event_id, 'event_hash', p_event_hash),
        v_audit_hash, NOW()
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 4.4 Suspensão de Diretriz
CREATE OR REPLACE FUNCTION suspend_learning(
    p_id UUID,
    p_tenant_id VARCHAR(50),
    p_actor VARCHAR(100),
    p_reason TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_audit_hash VARCHAR(64);
BEGIN
    UPDATE promoted_knowledge
    SET status = 'SUSPENDED',
        updated_at = NOW()
    WHERE id = p_id AND tenant_id = p_tenant_id AND status = 'PROMOTED';

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    v_audit_hash := encode(sha256(convert_to(p_id::text || '|SUSPENDED|' || p_tenant_id || '|' || NOW()::text, 'UTF8')), 'hex');

    INSERT INTO flywheel_audit_events (
        tenant_id, event_type, entity_type, entity_id, actor,
        payload, evidence_hash, created_at
    ) VALUES (
        p_tenant_id, 'SUSPENDED', 'RULE', p_id, p_actor,
        jsonb_build_object('policy_version', 'v2.3.1', 'justification', p_reason),
        v_audit_hash, NOW()
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 4.5 Revogação Imediata de Diretriz
CREATE OR REPLACE FUNCTION revoke_learning(
    p_id UUID,
    p_tenant_id VARCHAR(50),
    p_actor VARCHAR(100),
    p_reason TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_audit_hash VARCHAR(64);
BEGIN
    UPDATE promoted_knowledge
    SET status = 'REVOKED',
        revoked_by = p_actor,
        revoked_at = NOW(),
        updated_at = NOW()
    WHERE id = p_id AND tenant_id = p_tenant_id AND status != 'REVOKED';

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    v_audit_hash := encode(sha256(convert_to(p_id::text || '|REVOKED|' || p_tenant_id || '|' || NOW()::text, 'UTF8')), 'hex');

    INSERT INTO flywheel_audit_events (
        tenant_id, event_type, entity_type, entity_id, actor,
        payload, evidence_hash, created_at
    ) VALUES (
        p_tenant_id, 'REVOKED', 'RULE', p_id, p_actor,
        jsonb_build_object('policy_version', 'v2.3.1', 'justification', p_reason),
        v_audit_hash, NOW()
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 5. Conceder execução das funções seguras à role de aplicação
GRANT EXECUTE ON FUNCTION create_learning_candidate TO visao360_app;
GRANT EXECUTE ON FUNCTION promote_safe_preference_auto TO visao360_app;
GRANT EXECUTE ON FUNCTION owner_promote_candidate TO visao360_app;
GRANT EXECUTE ON FUNCTION suspend_learning TO visao360_app;
GRANT EXECUTE ON FUNCTION revoke_learning TO visao360_app;
