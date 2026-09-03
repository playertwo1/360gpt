-- ============================================================================
-- Migration 16: Gate N7 Part 2 — Validação Soberana e Feature Flag Efetiva
-- Implementa:
--   Item 4: Validação de aprovação soberana de Rafael (validate_rafael_approval_event & approve_promotion_by_rafael)
--   Item 5: Flag AUTO_PROMOTION_ENABLED efetiva com log de auditoria prévio no fail-closed
-- ============================================================================
\connect visao360;

BEGIN;

-- ----------------------------------------------------------------------------
-- ITEM 5 — Tabela/View system_flags e sincronização com runtime_feature_flags
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_flags (
  key         TEXT PRIMARY KEY,
  value       BOOLEAN NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.system_flags (key, value)
VALUES ('AUTO_PROMOTION_ENABLED', false)
ON CONFLICT (key) DO UPDATE SET value = false, updated_at = now();

REVOKE ALL ON public.system_flags FROM visao360_app;
GRANT SELECT ON public.system_flags TO visao360_app;

-- ----------------------------------------------------------------------------
-- ITEM 4 — View telegram_events mapeando para channel_updates reais
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.telegram_events AS
SELECT 
  cu.external_update_id AS id,
  cu.tenant_id,
  cu.chat_id,
  cu.owner_id,
  ie.text_content AS command,
  cu.payload_hash,
  oac.consumed_at AS used_at,
  cu.received_at
FROM public.channel_updates cu
JOIN public.channel_inbound_events ie ON ie.channel = cu.channel AND ie.external_update_id = cu.external_update_id
LEFT JOIN public.owner_approval_consumptions oac ON oac.source_event_id = ie.inbound_event_id::text;

-- ----------------------------------------------------------------------------
-- ITEM 4 — Função de validação de evento real do Telegram
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_rafael_approval_event(
  p_event_id        text,
  p_owner_id        text,
  p_tenant_id       text,
  p_expected_command text,
  p_raw_payload      text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_ie RECORD;
  v_cu RECORD;
  v_recomputed text;
BEGIN
  IF p_owner_id <> 'rafael' THEN
    RAISE EXCEPTION 'evento não pertence a este owner';
  END IF;

  SELECT * INTO v_ie
  FROM public.channel_inbound_events
  WHERE (inbound_event_id::text = p_event_id OR external_update_id = p_event_id)
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'evento % não existe — não é uma aprovação real', p_event_id;
  END IF;

  IF v_ie.owner_id <> p_owner_id THEN
    RAISE EXCEPTION 'evento não pertence a este owner';
  END IF;

  IF v_ie.tenant_id <> p_tenant_id THEN
    RAISE EXCEPTION 'evento não pertence a este tenant';
  END IF;

  IF v_ie.event_kind <> 'COMMAND' OR v_ie.text_content !~* ('^' || p_expected_command || '([[:space:]]|$)') THEN
    RAISE EXCEPTION 'evento não é um comando de aprovação (comando: %)', v_ie.text_content;
  END IF;

  IF EXISTS (SELECT 1 FROM public.owner_approval_consumptions WHERE source_event_id = v_ie.inbound_event_id::text) THEN
    RAISE EXCEPTION 'evento % já foi usado — reuso bloqueado (single-use)', p_event_id;
  END IF;

  SELECT * INTO v_cu
  FROM public.channel_updates
  WHERE channel = v_ie.channel AND external_update_id = v_ie.external_update_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'registro de transporte não encontrado para o evento';
  END IF;

  IF p_raw_payload IS NOT NULL AND trim(p_raw_payload) <> '' THEN
    v_recomputed := 'sha256:' || encode(sha256(convert_to(p_raw_payload, 'UTF8')), 'hex');
    IF v_recomputed <> v_cu.payload_hash THEN
      RAISE EXCEPTION 'hash do payload não confere — evento pode ter sido adulterado';
    END IF;
  END IF;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.validate_rafael_approval_event(text,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_rafael_approval_event(text,text,text,text,text) TO visao360_app;

-- ----------------------------------------------------------------------------
-- ITEM 4 — approve_promotion_by_rafael
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.approve_promotion_by_rafael(
  p_candidate_id  uuid,
  p_event_id      text,
  p_owner_id      text,
  p_tenant_id     text,
  p_raw_payload   text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_candidate public.promoted_knowledge%ROWTYPE;
  v_ie RECORD;
  v_now timestamptz := clock_timestamp();
  v_payload jsonb;
BEGIN
  -- Valida a autenticidade real do evento
  PERFORM public.validate_rafael_approval_event(
    p_event_id, p_owner_id, p_tenant_id, '/aprovardiretriz', p_raw_payload
  );

  SELECT * INTO v_candidate
  FROM public.promoted_knowledge
  WHERE id = p_candidate_id AND tenant_id = p_tenant_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'candidata % não encontrada', p_candidate_id;
  END IF;

  SELECT inbound_event_id INTO v_ie
  FROM public.channel_inbound_events
  WHERE inbound_event_id::text = p_event_id OR external_update_id = p_event_id;

  UPDATE public.promoted_knowledge
  SET status = 'PROMOTED',
      promotion_mode = 'OWNER_EXPLICIT',
      promotion_policy_version = 'v2.3.2-db-authoritative',
      promotion_score = 1.000,
      approved_by = 'rafael',
      approved_at = v_now,
      source_event_id = v_ie.inbound_event_id::text,
      updated_at = v_now
  WHERE id = p_candidate_id;

  INSERT INTO public.owner_approval_consumptions(source_event_id, tenant_id, owner_id, candidate_id, consumed_at)
  VALUES(v_ie.inbound_event_id::text, p_tenant_id, p_owner_id, p_candidate_id, v_now)
  ON CONFLICT (source_event_id) DO NOTHING;

  v_payload := jsonb_build_object(
    'candidate_id', p_candidate_id,
    'source_event_id', v_ie.inbound_event_id::text,
    'policy_version', 'v2.3.2-db-authoritative',
    'promotion_mode', 'OWNER_EXPLICIT'
  );

  INSERT INTO public.flywheel_audit_events(
    tenant_id, event_type, entity_type, entity_id, actor, payload, evidence_hash, created_at
  )
  VALUES(
    p_tenant_id, 'OWNER_PROMOTED', 'RULE', p_candidate_id, 'rafael', v_payload,
    public.audit_event_hash(p_tenant_id, 'OWNER_PROMOTED', 'RULE', p_candidate_id, 'rafael', v_payload, v_now),
    v_now
  );

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_promotion_by_rafael(uuid,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_promotion_by_rafael(uuid,text,text,text,text) TO visao360_app;

-- ----------------------------------------------------------------------------
-- ITEM 5 — promote_safe_preference_auto com log de auditoria no fail-closed
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
  v_flag_enabled BOOLEAN := FALSE;
  v_now TIMESTAMPTZ := clock_timestamp();
  v_payload JSONB;
BEGIN
  -- 1. Consulta a flag autoritativa (fail-closed)
  SELECT value INTO v_flag_enabled FROM public.system_flags WHERE key = 'AUTO_PROMOTION_ENABLED';
  IF v_flag_enabled IS NULL THEN
    SELECT enabled INTO v_flag_enabled FROM public.runtime_feature_flags WHERE flag_key = 'AUTO_PROMOTION_ENABLED';
  END IF;

  IF coalesce(v_flag_enabled, FALSE) IS NOT TRUE THEN
    -- Registra no log append-only a tentativa bloqueada por flag antes de abortar
    INSERT INTO public.flywheel_audit_events(
      tenant_id, event_type, entity_type, entity_id, actor, payload, evidence_hash, created_at
    )
    VALUES(
      p_tenant_id, 'AUTO_PROMOTION_BLOCKED_BY_FLAG', 'RULE', p_candidate_id, 'SYSTEM_LEARNING_ENGINE',
      jsonb_build_object('candidate_id', p_candidate_id, 'flag', 'AUTO_PROMOTION_ENABLED', 'value', false),
      public.audit_event_hash(p_tenant_id, 'AUTO_PROMOTION_BLOCKED_BY_FLAG', 'RULE', p_candidate_id, 'SYSTEM_LEARNING_ENGINE', jsonb_build_object('candidate_id', p_candidate_id), v_now),
      v_now
    );
    RAISE EXCEPTION 'autopromoção desabilitada por flag — tentativa registrada em auditoria';
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

COMMIT;
