-- 13-n7-fifth-remediation-hardening.sql
-- Quinta remediacao — Gate N7 / N2.3
-- Objetivo: fazer o PostgreSQL ser a ultima barreira de seguranca.
\connect visao360;

BEGIN;

-- Nunca confiar em PUBLIC para funcoes SECURITY DEFINER.
REVOKE ALL ON FUNCTION public.create_learning_candidate(VARCHAR,VARCHAR,VARCHAR,VARCHAR,VARCHAR,TEXT,NUMERIC,VARCHAR,INTEGER,VARCHAR,VARCHAR,VARCHAR) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.promote_safe_preference_auto(UUID,VARCHAR,VARCHAR,VARCHAR,VARCHAR,NUMERIC) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.owner_promote_candidate(UUID,VARCHAR,VARCHAR,VARCHAR,VARCHAR,TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.suspend_learning(UUID,VARCHAR,VARCHAR,TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.revoke_learning(UUID,VARCHAR,VARCHAR,TEXT) FROM PUBLIC;

-- Remover atalhos de lifecycle da role operacional.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.promoted_knowledge FROM visao360_app;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.golden_exemplars FROM visao360_app;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.negative_memory FROM visao360_app;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.decision_outcomes FROM visao360_app;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.flywheel_audit_events FROM visao360_app;
GRANT SELECT ON public.promoted_knowledge, public.golden_exemplars, public.negative_memory, public.decision_outcomes, public.flywheel_audit_events TO visao360_app;

-- A migration 09 concedia DML amplo por default; impedir que novas tabelas repitam o bypass.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLES FROM visao360_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO visao360_app;

-- Constraint estrutural para structured_memory quando a tabela/colunas existirem.
DO $$
BEGIN
  IF to_regclass('public.structured_memory') IS NOT NULL
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='structured_memory' AND column_name='scope')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='structured_memory' AND column_name='status')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='structured_memory' AND column_name='origin') THEN
    REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.structured_memory FROM visao360_app;
    GRANT SELECT ON public.structured_memory TO visao360_app;
    ALTER TABLE public.structured_memory DROP CONSTRAINT IF EXISTS chk_no_inferred_global_active;
    ALTER TABLE public.structured_memory ADD CONSTRAINT chk_no_inferred_global_active
      CHECK (NOT (scope = 'GLOBAL' AND status = 'ACTIVE' AND origin = 'INFERRED_INTERACTION')) NOT VALID;
    ALTER TABLE public.structured_memory VALIDATE CONSTRAINT chk_no_inferred_global_active;
  END IF;
END $$;

-- Catalogo fechado de preferencias AUTO. A regra canonica vem do banco, nao do chamador.
CREATE TABLE IF NOT EXISTS public.auto_preference_catalog (
  preference_type VARCHAR(50) NOT NULL,
  preference_value VARCHAR(50) NOT NULL,
  canonical_rule_text TEXT NOT NULL,
  policy_version VARCHAR(50) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (preference_type, preference_value)
);
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.auto_preference_catalog FROM visao360_app;
GRANT SELECT ON public.auto_preference_catalog TO visao360_app;

INSERT INTO public.auto_preference_catalog(preference_type, preference_value, canonical_rule_text, policy_version) VALUES
('RESPONSE_LENGTH','COMPACT','Apresentar respostas e pareceres em formato compacto e direto ao ponto.','v2.3.2-db-authoritative'),
('RESPONSE_LENGTH','BALANCED','Apresentar respostas em formato equilibrado com resumo executivo e metricas principais.','v2.3.2-db-authoritative'),
('RESPONSE_LENGTH','DETAILED','Apresentar respostas detalhadas com todas as evidencias e tabelas completas.','v2.3.2-db-authoritative'),
('TABLE_PREFERENCE','TABLE_FIRST','Exibir dados quantitativos e tabelas antes de explicacoes textuais.','v2.3.2-db-authoritative'),
('TABLE_PREFERENCE','TEXT_FIRST','Exibir sintese executiva textual antes das tabelas de apoio.','v2.3.2-db-authoritative'),
('TONE','DIRECT','Utilizar tom executivo direto, claro e sem rodeios.','v2.3.2-db-authoritative'),
('TONE','EXECUTIVE','Utilizar tom formal executivo focado em decisoes de gestao.','v2.3.2-db-authoritative'),
('TONE','EXPLANATORY','Utilizar tom didatico e explicativo com fundamentacao analitica.','v2.3.2-db-authoritative'),
('SECTION_ORDER','PERFORMANCE_FIRST','Organizar parecer destacando indicadores e metas de Performance primeiro.','v2.3.2-db-authoritative'),
('SECTION_ORDER','ACCOUNT_FIRST','Organizar parecer destacando contas e oportunidades prioritarias primeiro.','v2.3.2-db-authoritative'),
('SECTION_ORDER','GAPS_FIRST','Organizar parecer destacando lacunas criticas e pontos a recuperar primeiro.','v2.3.2-db-authoritative')
ON CONFLICT (preference_type, preference_value) DO UPDATE
SET canonical_rule_text=EXCLUDED.canonical_rule_text, policy_version=EXCLUDED.policy_version;

-- Feature flags autoritativas no DB: fail-closed por padrao.
CREATE TABLE IF NOT EXISTS public.runtime_feature_flags (
  flag_key VARCHAR(100) PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by VARCHAR(100) NOT NULL DEFAULT 'migration'
);
INSERT INTO public.runtime_feature_flags(flag_key, enabled, updated_by)
VALUES ('AUTO_PROMOTION_ENABLED', FALSE, 'migration-13')
ON CONFLICT(flag_key) DO UPDATE SET enabled=FALSE, updated_at=NOW(), updated_by='migration-13';
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.runtime_feature_flags FROM visao360_app;
GRANT SELECT ON public.runtime_feature_flags TO visao360_app;

-- Eventos soberanos verificaveis. A allowlist e administrada fora da role operacional.
CREATE TABLE IF NOT EXISTS public.owner_channel_allowlist (
  tenant_id VARCHAR(50) NOT NULL,
  owner_id VARCHAR(100) NOT NULL,
  channel VARCHAR(20) NOT NULL,
  chat_id VARCHAR(100) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (tenant_id, owner_id, channel, chat_id)
);
REVOKE ALL ON public.owner_channel_allowlist FROM visao360_app;
GRANT SELECT ON public.owner_channel_allowlist TO visao360_app;

CREATE TABLE IF NOT EXISTS public.owner_approval_consumptions (
  source_event_id VARCHAR(100) PRIMARY KEY,
  tenant_id VARCHAR(50) NOT NULL,
  owner_id VARCHAR(100) NOT NULL,
  candidate_id UUID NOT NULL REFERENCES public.promoted_knowledge(id),
  consumed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
REVOKE ALL ON public.owner_approval_consumptions FROM visao360_app;
GRANT SELECT ON public.owner_approval_consumptions TO visao360_app;

-- Hash de auditoria inclui payload completo e identificadores estaveis.
CREATE OR REPLACE FUNCTION public.audit_event_hash(
  p_tenant_id TEXT, p_event_type TEXT, p_entity_type TEXT, p_entity_id UUID,
  p_actor TEXT, p_payload JSONB, p_created_at TIMESTAMPTZ
) RETURNS VARCHAR(64)
LANGUAGE sql IMMUTABLE SET search_path = pg_catalog
AS $$
  SELECT encode(sha256(convert_to(
    coalesce(p_tenant_id,'') || '|' || coalesce(p_event_type,'') || '|' ||
    coalesce(p_entity_type,'') || '|' || coalesce(p_entity_id::text,'') || '|' ||
    coalesce(p_actor,'') || '|' || coalesce(p_payload::text,'{}') || '|' ||
    coalesce(p_created_at::text,''), 'UTF8')), 'hex');
$$;
REVOKE ALL ON FUNCTION public.audit_event_hash(TEXT,TEXT,TEXT,UUID,TEXT,JSONB,TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.audit_event_hash(TEXT,TEXT,TEXT,UUID,TEXT,JSONB,TIMESTAMPTZ) TO visao360_app;

-- AUTO: nenhum parametro do chamador define classificacao, regra, risco, frequencia ou score.
CREATE OR REPLACE FUNCTION public.promote_safe_preference_auto(
  p_candidate_id UUID,
  p_tenant_id VARCHAR(50),
  p_preference_type VARCHAR(50),
  p_preference_value VARCHAR(50),
  p_policy_version VARCHAR(50),
  p_promotion_score NUMERIC(3,2)
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  c public.promoted_knowledge%ROWTYPE;
  cat public.auto_preference_catalog%ROWTYPE;
  v_enabled BOOLEAN := FALSE;
  v_now TIMESTAMPTZ := clock_timestamp();
  v_payload JSONB;
BEGIN
  SELECT enabled INTO v_enabled FROM public.runtime_feature_flags WHERE flag_key='AUTO_PROMOTION_ENABLED';
  IF coalesce(v_enabled,FALSE) IS NOT TRUE THEN
    RAISE EXCEPTION 'AUTO_PROMOTION_DISABLED';
  END IF;

  SELECT * INTO c FROM public.promoted_knowledge
   WHERE id=p_candidate_id AND tenant_id=p_tenant_id
   FOR UPDATE;
  IF NOT FOUND OR c.status <> 'CANDIDATE' THEN RETURN FALSE; END IF;

  SELECT * INTO cat FROM public.auto_preference_catalog
   WHERE preference_type=p_preference_type AND preference_value=p_preference_value AND enabled=TRUE;
  IF NOT FOUND THEN RAISE EXCEPTION 'PREFERENCE_PAIR_NOT_ALLOWED'; END IF;

  IF c.category <> 'STRUCTURED_PREFERENCE'
     OR c.risk_level <> 'LOW'
     OR c.scope = 'GLOBAL'
     OR c.frequency < 2
     OR c.confidence_score < 0.75
     OR c.learned_rule <> cat.canonical_rule_text
     OR p_policy_version <> cat.policy_version
     OR p_promotion_score < 0.75 THEN
    RAISE EXCEPTION 'AUTO_PROMOTION_CANDIDATE_INVARIANT_FAILED';
  END IF;

  UPDATE public.promoted_knowledge SET
    status='PROMOTED', promotion_mode='AUTO', promotion_policy_version=cat.policy_version,
    promotion_score=p_promotion_score, approved_by='SYSTEM_LEARNING_ENGINE', approved_at=v_now, updated_at=v_now
  WHERE id=c.id;

  v_payload := jsonb_build_object(
    'candidate_id',c.id,'preference_type',p_preference_type,'preference_value',p_preference_value,
    'canonical_rule_text',cat.canonical_rule_text,'risk_level',c.risk_level,'frequency',c.frequency,
    'confidence_score',c.confidence_score,'scope',c.scope,'policy_version',cat.policy_version,
    'promotion_score',p_promotion_score);
  INSERT INTO public.flywheel_audit_events(tenant_id,event_type,entity_type,entity_id,actor,payload,evidence_hash,created_at)
  VALUES(c.tenant_id,'AUTO_PROMOTED','RULE',c.id,'SYSTEM_LEARNING_ENGINE',v_payload,
    public.audit_event_hash(c.tenant_id,'AUTO_PROMOTED','RULE',c.id,'SYSTEM_LEARNING_ENGINE',v_payload,v_now),v_now);
  RETURN TRUE;
END $$;

-- OWNER_EXPLICIT: prova vem de evento real e imutavel; hash e comando sao recomputados no banco.
CREATE OR REPLACE FUNCTION public.owner_promote_candidate(
  p_candidate_id UUID,
  p_tenant_id VARCHAR(50),
  p_owner_id VARCHAR(100),
  p_source_event_id VARCHAR(100),
  p_event_hash VARCHAR(64),
  p_justification TEXT DEFAULT 'Aprovacao soberana explicita'
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  c public.promoted_knowledge%ROWTYPE;
  e RECORD;
  v_expected_hash TEXT;
  v_now TIMESTAMPTZ := clock_timestamp();
  v_payload JSONB;
BEGIN
  IF p_owner_id <> 'rafael' THEN RAISE EXCEPTION 'OWNER_NOT_AUTHORIZED'; END IF;
  IF EXISTS (SELECT 1 FROM public.owner_approval_consumptions WHERE source_event_id=p_source_event_id) THEN
    RAISE EXCEPTION 'OWNER_EVENT_ALREADY_USED';
  END IF;

  SELECT ie.inbound_event_id::text AS source_event_id, ie.tenant_id, ie.owner_id, ie.channel, ie.chat_id,
         ie.event_kind, ie.text_content, cu.payload, cu.payload_hash
    INTO e
    FROM public.channel_inbound_events ie
    JOIN public.channel_updates cu ON cu.channel=ie.channel AND cu.external_update_id=ie.external_update_id
    JOIN public.owner_channel_allowlist al ON al.tenant_id=ie.tenant_id AND al.owner_id=ie.owner_id
      AND al.channel=ie.channel AND al.chat_id=ie.chat_id AND al.active=TRUE
   WHERE ie.inbound_event_id::text=p_source_event_id AND ie.tenant_id=p_tenant_id AND ie.owner_id=p_owner_id
   FOR UPDATE OF ie;
  IF NOT FOUND THEN RAISE EXCEPTION 'OWNER_EVENT_NOT_FOUND_OR_NOT_AUTHORIZED'; END IF;
  IF e.event_kind <> 'COMMAND' OR e.text_content !~* '^/aprovardiretriz([[:space:]]|$)' THEN
    RAISE EXCEPTION 'OWNER_EVENT_NOT_APPROVAL_COMMAND';
  END IF;

  v_expected_hash := replace(coalesce(e.payload_hash,''),'sha256:','');
  IF v_expected_hash = '' OR lower(v_expected_hash) <> lower(coalesce(p_event_hash,'')) THEN
    RAISE EXCEPTION 'OWNER_EVENT_HASH_MISMATCH';
  END IF;

  SELECT * INTO c FROM public.promoted_knowledge
   WHERE id=p_candidate_id AND tenant_id=p_tenant_id AND status IN ('CANDIDATE','SUSPENDED') FOR UPDATE;
  IF NOT FOUND THEN RETURN FALSE; END IF;

  UPDATE public.promoted_knowledge SET status='PROMOTED',promotion_mode='OWNER_EXPLICIT',
    promotion_policy_version='v2.3.2-db-authoritative',promotion_score=1.00,
    approved_by='rafael',approved_at=v_now,source_event_id=p_source_event_id,updated_at=v_now
  WHERE id=c.id;
  INSERT INTO public.owner_approval_consumptions(source_event_id,tenant_id,owner_id,candidate_id)
  VALUES(p_source_event_id,p_tenant_id,p_owner_id,c.id);

  v_payload := jsonb_build_object('candidate_id',c.id,'source_event_id',p_source_event_id,
    'event_hash',v_expected_hash,'command',e.text_content,'justification',p_justification,
    'policy_version','v2.3.2-db-authoritative');
  INSERT INTO public.flywheel_audit_events(tenant_id,event_type,entity_type,entity_id,actor,payload,evidence_hash,created_at)
  VALUES(c.tenant_id,'OWNER_PROMOTED','RULE',c.id,'rafael',v_payload,
    public.audit_event_hash(c.tenant_id,'OWNER_PROMOTED','RULE',c.id,'rafael',v_payload,v_now),v_now);
  RETURN TRUE;
END $$;

-- PUBLIC nunca executa funcoes privilegiadas; somente runtime explicitamente autorizado.
REVOKE ALL ON FUNCTION public.promote_safe_preference_auto(UUID,VARCHAR,VARCHAR,VARCHAR,VARCHAR,NUMERIC) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.owner_promote_candidate(UUID,VARCHAR,VARCHAR,VARCHAR,VARCHAR,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.promote_safe_preference_auto(UUID,VARCHAR,VARCHAR,VARCHAR,VARCHAR,NUMERIC) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.owner_promote_candidate(UUID,VARCHAR,VARCHAR,VARCHAR,VARCHAR,TEXT) TO visao360_app;

COMMIT;
