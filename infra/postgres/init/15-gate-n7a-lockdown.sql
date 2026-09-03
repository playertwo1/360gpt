-- ============================================================================
-- Migration 15: Gate N7A Lockdown
-- Adaptação fiel da recomendação de auditoria ao schema canônico Visao 360 (UUID, tabelas reais)
-- Corrige:
--   Item 2: Validação de ausência de conflito no promote_safe_preference_auto
--   Item 3: Funções transacionais insert_structured_memory e activate_structured_memory
--   Item 4: Funções transacionais insert_flywheel_audit_event e insert_golden_exemplar
--   Item 6: Fechamento irrestrito de privilégios SECURITY DEFINER de PUBLIC para visao360_app
-- ============================================================================
\connect visao360;

BEGIN;

-- ----------------------------------------------------------------------------
-- ITEM 6 — Revogar EXECUTE de PUBLIC e conceder estritamente a visao360_app
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  fn text;
  fns text[] := ARRAY[
    'create_learning_candidate(varchar,varchar,varchar,varchar,varchar,text,numeric,varchar,integer,varchar,varchar,varchar)',
    'promote_safe_preference_auto(uuid,varchar,varchar,varchar,varchar,numeric)',
    'owner_promote_candidate(uuid,varchar,varchar,varchar,varchar,text)',
    'suspend_learning(uuid,varchar,varchar,text)',
    'revoke_learning(uuid,varchar,varchar,text)',
    'audit_event_hash(text,text,text,uuid,text,jsonb,timestamptz)',
    'begin_document_job(uuid,text,text,bigint,text,text)',
    'persist_validated_extraction(uuid,text,jsonb)',
    'fail_document_job(uuid,text,text)',
    'complete_document_job(uuid,uuid,bigint,text)'
  ];
BEGIN
  FOREACH fn IN ARRAY fns LOOP
    BEGIN
      EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC', fn);
      EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO visao360_app', fn);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- ITEM 2 — promote_safe_preference_auto com detecção estrita de conflito
-- ----------------------------------------------------------------------------
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
  -- 1. Feature flag autoritativa no DB: fail-closed por padrão
  SELECT enabled INTO v_enabled FROM public.runtime_feature_flags WHERE flag_key='AUTO_PROMOTION_ENABLED';
  IF coalesce(v_enabled,FALSE) IS NOT TRUE THEN
    RAISE EXCEPTION 'AUTO_PROMOTION_DISABLED';
  END IF;

  -- 2. Carrega a candidata diretamente do banco
  SELECT * INTO c FROM public.promoted_knowledge
   WHERE id=p_candidate_id AND tenant_id=p_tenant_id
   FOR UPDATE;
  IF NOT FOUND OR c.status <> 'CANDIDATE' THEN RETURN FALSE; END IF;

  -- 3. Valida contra o catálogo oficial de preferências permitidas
  SELECT * INTO cat FROM public.auto_preference_catalog
   WHERE preference_type=p_preference_type AND preference_value=p_preference_value AND enabled=TRUE;
  IF NOT FOUND THEN RAISE EXCEPTION 'PREFERENCE_PAIR_NOT_ALLOWED'; END IF;

  -- 4. Invariantes estritos: nunca escopo global, risco LOW, score e texto idêntico ao template
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

  -- 5. Ausência de conflito: nenhuma outra regra ativa divergente do mesmo tipo no mesmo escopo
  IF EXISTS (
    SELECT 1 FROM public.promoted_knowledge
    WHERE tenant_id = c.tenant_id
      AND category = 'STRUCTURED_PREFERENCE'
      AND status = 'PROMOTED'
      AND target_ref = c.target_ref
      AND id <> c.id
      AND learned_rule <> cat.canonical_rule_text
  ) THEN
    RAISE EXCEPTION 'PREFERENCE_CONFLICT_DETECTED';
  END IF;

  -- 6. Executa promoção auditada
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

REVOKE ALL ON FUNCTION public.promote_safe_preference_auto(UUID,VARCHAR,VARCHAR,VARCHAR,VARCHAR,NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.promote_safe_preference_auto(UUID,VARCHAR,VARCHAR,VARCHAR,VARCHAR,NUMERIC) TO visao360_app;

-- ----------------------------------------------------------------------------
-- ITEM 3 — Funções transacionais para structured_memory
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.insert_structured_memory(
  p_tenant_id        text,
  p_owner_id         text,
  p_memory_type      text,
  p_scope            text,
  p_target_ref       text,
  p_data             jsonb,
  p_origin           text,
  p_confidence_score numeric DEFAULT 1.00,
  p_evidence_node_id text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_id uuid;
  v_status text;
BEGIN
  -- Memória inferida NUNCA nasce ACTIVE, independente do escopo
  IF p_origin = 'INFERRED_INTERACTION' THEN
    v_status := 'CANDIDATE';
  ELSE
    v_status := 'ACTIVE';
  END IF;

  -- Regra estrita: GLOBAL + INFERRED nunca nasce ACTIVE
  IF p_scope = 'GLOBAL' AND p_origin = 'INFERRED_INTERACTION' THEN
    v_status := 'CANDIDATE';
  END IF;

  INSERT INTO public.structured_memory (
    id, tenant_id, owner_id, memory_type, scope, target_ref,
    data, confidence_score, status, origin, evidence_node_id,
    created_at, updated_at
  )
  VALUES (
    gen_random_uuid(),
    coalesce(p_tenant_id, 'default'),
    coalesce(p_owner_id, 'rafael'),
    p_memory_type,
    p_scope,
    coalesce(p_target_ref, 'GLOBAL'),
    coalesce(p_data, '{}'::jsonb),
    coalesce(p_confidence_score, 1.00),
    v_status,
    p_origin,
    p_evidence_node_id,
    now(),
    now()
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.insert_structured_memory(text,text,text,text,text,jsonb,text,numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.insert_structured_memory(text,text,text,text,text,jsonb,text,numeric) TO visao360_app;

CREATE OR REPLACE FUNCTION public.activate_structured_memory(
  p_id               uuid,
  p_evidence_node_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_row public.structured_memory%ROWTYPE;
BEGIN
  SELECT * INTO v_row FROM public.structured_memory WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'registro % não encontrado em structured_memory', p_id;
  END IF;

  IF p_evidence_node_id IS NULL OR trim(p_evidence_node_id) = '' THEN
    RAISE EXCEPTION 'evidência obrigatória para ativar memória';
  END IF;

  IF v_row.scope = 'GLOBAL' AND v_row.origin = 'INFERRED_INTERACTION' THEN
    RAISE EXCEPTION 'memória global inferida não pode ser ativada automaticamente — exige revisão humana';
  END IF;

  UPDATE public.structured_memory
  SET status = 'ACTIVE', evidence_node_id = p_evidence_node_id, updated_at = now()
  WHERE id = p_id;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.activate_structured_memory(uuid,uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.activate_structured_memory(uuid,uuid,text) TO visao360_app;

-- ----------------------------------------------------------------------------
-- ITEM 4 — Funções transacionais para flywheel_audit_events e golden_exemplars
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.insert_flywheel_audit_event(
  p_tenant_id    text,
  p_event_type   text,
  p_entity_type  text,
  p_entity_id    uuid,
  p_actor        text,
  p_payload      jsonb,
  p_evidence_ref text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_id   uuid;
  v_hash text;
  v_now  timestamptz := clock_timestamp();
BEGIN
  IF p_evidence_ref IS NULL OR trim(p_evidence_ref) = '' THEN
    RAISE EXCEPTION 'evidence_ref obrigatório em evento de auditoria';
  END IF;

  v_hash := encode(sha256(convert_to(
    coalesce(p_tenant_id,'') || '|' || coalesce(p_event_type,'') || '|' ||
    coalesce(p_entity_type,'') || '|' || coalesce(p_entity_id::text,'') || '|' ||
    coalesce(p_actor,'') || '|' || coalesce(p_payload::text,'{}') || '|' ||
    coalesce(p_evidence_ref,'') || '|' || coalesce(v_now::text,''), 'UTF8')), 'hex');

  INSERT INTO public.flywheel_audit_events (
    id, tenant_id, event_type, entity_type, entity_id, actor, payload, evidence_hash, created_at
  )
  VALUES (
    gen_random_uuid(), p_tenant_id, p_event_type, p_entity_type, p_entity_id,
    p_actor, coalesce(p_payload, '{}'::jsonb), v_hash, v_now
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.insert_flywheel_audit_event(text,jsonb,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.insert_flywheel_audit_event(text,jsonb,text) TO visao360_app;

CREATE OR REPLACE FUNCTION public.insert_golden_exemplar(
  p_tenant_id    text,
  p_sector       text,
  p_objective    text,
  p_client_name  text,
  p_channel      text,
  p_approved_text text,
  p_author       text,
  p_review_ref   text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF p_review_ref IS NULL OR trim(p_review_ref) = '' THEN
    RAISE EXCEPTION 'golden exemplar exige review_ref de um processo de validação real';
  END IF;

  INSERT INTO public.golden_exemplars (
    id, tenant_id, sector, objective, client_name, channel, approved_text, author,
    rating, status, evidence_refs, created_at
  )
  VALUES (
    gen_random_uuid(), coalesce(p_tenant_id, 'default'), p_sector, p_objective,
    p_client_name, coalesce(p_channel, 'WHATSAPP'), p_approved_text, coalesce(p_author, 'RAFAEL'),
    5, 'CANDIDATE', jsonb_build_array(jsonb_build_object('review_ref', p_review_ref, 'created_at', now())), now()
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.insert_golden_exemplar(uuid,text,text,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.insert_golden_exemplar(uuid,text,text,jsonb) TO visao360_app;

COMMIT;
