-- 11-flywheel-permissions-and-constraints.sql
-- Marco N2.3 — Terceira Remediação: Constraints de Candidatas, Anti-TRUNCATE e Permissões Canônicas
-- Banco: visao360

\connect visao360;

-- 1. golden_exemplars adjustments (permitir status CANDIDATE e campos de aprovação nulos para candidatas)
ALTER TABLE golden_exemplars ALTER COLUMN approved_by DROP NOT NULL;
ALTER TABLE golden_exemplars ALTER COLUMN approved_at DROP NOT NULL;
ALTER TABLE golden_exemplars DROP CONSTRAINT IF EXISTS golden_exemplars_status_check;
ALTER TABLE golden_exemplars ADD CONSTRAINT golden_exemplars_status_check CHECK (status IN ('CANDIDATE', 'ACTIVE', 'RETIRED'));

-- 2. promoted_knowledge adjustments (suporte a SUSPENDED no lifecycle governado)
ALTER TABLE promoted_knowledge DROP CONSTRAINT IF EXISTS promoted_knowledge_status_check;
ALTER TABLE promoted_knowledge ADD CONSTRAINT promoted_knowledge_status_check CHECK (status IN ('CANDIDATE', 'PROMOTED', 'SUSPENDED', 'SUPERSEDED', 'REVOKED', 'EXPIRED'));

-- 3. Função e Trigger Anti-TRUNCATE para Auditoria Append-Only
CREATE OR REPLACE FUNCTION prevent_audit_tampering() RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'TABELA DE AUDITORIA É APPEND-ONLY: UPDATE, DELETE OU TRUNCATE PROIBIDOS (TABELA: %, OPERACAO: %)', TG_TABLE_NAME, TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_flywheel_audit_no_truncate ON flywheel_audit_events;
CREATE TRIGGER trg_flywheel_audit_no_truncate
BEFORE TRUNCATE ON flywheel_audit_events
FOR EACH STATEMENT EXECUTE FUNCTION prevent_audit_tampering();

-- 4. Permissões de Segurança de Menor Privilégio para visao360_app (runtime operacional n8n)
GRANT USAGE ON SCHEMA public TO visao360_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO visao360_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO visao360_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO visao360_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO visao360_app;

-- Auditoria é estritamente append-only: revogar UPDATE, DELETE e TRUNCATE
REVOKE UPDATE, DELETE, TRUNCATE ON flywheel_audit_events FROM visao360_app;
