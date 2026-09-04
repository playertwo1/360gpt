-- ============================================================================
-- Migration 19: Sovereign Approval Unification and Audit Resilience
-- Unifica approve_promotion_by_rafael de forma canônica, valida allowlist e Evidence Graph,
-- e torna resiliente o log de auditoria em autopromoção desabilitada.
-- ============================================================================
\connect visao360;

BEGIN;

-- 1. Dropar sobrecargas antigas/obsoletas de approve_promotion_by_rafael
DROP FUNCTION IF EXISTS public.approve_promotion_by_rafael(uuid, text);
DROP FUNCTION IF EXISTS public.approve_promotion_by_rafael(uuid, uuid);
DROP FUNCTION IF EXISTS public.approve_promotion_by_rafael(uuid, text, text, text, text);

-- 2. Atualizar validate_rafael_approval_event para checar owner_channel_allowlist ativa
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
  v_allowlist_active boolean;
BEGIN
  IF p_owner_id <> 'rafael' THEN
    RAISE EXCEPTION 'evento não pertence a este owner';
  END IF;

  -- Busca evento de inbound (aceita UUID canônico ou external_update_id)
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

  -- Valida allowlist de canal/chat para o owner (apenas se existir configuração para o tenant)
  IF EXISTS (SELECT 1 FROM public.owner_channel_allowlist WHERE tenant_id = v_ie.tenant_id) THEN
    SELECT active INTO v_allowlist_active
    FROM public.owner_channel_allowlist
    WHERE tenant_id = v_ie.tenant_id
      AND owner_id = v_ie.owner_id
      AND channel = v_ie.channel
      AND chat_id = v_ie.chat_id;

    IF coalesce(v_allowlist_active, false) IS NOT TRUE THEN
      RAISE EXCEPTION 'origem do evento não consta ou está inativa na allowlist do owner';
    END IF;
  END IF;

  -- Normalização Unicode NFKC e remoção de caracteres de controle/espaços invisíveis
  DECLARE
    v_norm_text text := regexp_replace(normalize(coalesce(v_ie.text_content, ''), NFKC), '[\u200B-\u200D\uFEFF]', '', 'g');
  BEGIN
    IF v_ie.event_kind <> 'COMMAND' OR v_norm_text !~* ('^' || p_expected_command || '([[:space:]]|$)') THEN
      RAISE EXCEPTION 'evento não é um comando de aprovação (comando: %)', v_ie.text_content;
    END IF;
  END;

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

-- 3. Criar a assinatura canônica unificada de approve_promotion_by_rafael(uuid, uuid)
CREATE OR REPLACE FUNCTION public.approve_promotion_by_rafael(
  p_candidate_id     uuid,
  p_inbound_event_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_candidate public.promoted_knowledge%ROWTYPE;
  v_ie public.channel_inbound_events%ROWTYPE;
  v_now timestamptz := clock_timestamp();
  v_payload jsonb;
  v_cmd_target text;
BEGIN
  -- 1. Carrega evento de inbound para validar tenant e canal
  SELECT * INTO v_ie
  FROM public.channel_inbound_events
  WHERE inbound_event_id = p_inbound_event_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'evento de entrada % não encontrado', p_inbound_event_id;
  END IF;

  -- 2. Valida o evento real através da função de segurança
  PERFORM public.validate_rafael_approval_event(
    p_inbound_event_id::text, v_ie.owner_id, v_ie.tenant_id, '/aprovardiretriz', v_ie.text_content
  );

  -- 3. Valida se o argumento do comando coincide com o candidate_id fornecido (com normalização Unicode)
  DECLARE
    v_norm_cmd text := regexp_replace(normalize(coalesce(v_ie.text_content, ''), NFKC), '[\u200B-\u200D\uFEFF]', '', 'g');
  BEGIN
    v_cmd_target := trim(substring(v_norm_cmd from '(?i)^/aprovardiretriz\s+([0-9a-fA-F-]{36})'));
    IF v_cmd_target IS NOT NULL AND v_cmd_target <> '' THEN
      IF v_cmd_target::uuid <> p_candidate_id THEN
        RAISE EXCEPTION 'id da diretriz no comando (%) diverge da candidata (%)', v_cmd_target, p_candidate_id;
      END IF;
    END IF;
  END;

  -- 4. Carrega a candidata em promoted_knowledge
  SELECT * INTO v_candidate
  FROM public.promoted_knowledge
  WHERE id = p_candidate_id AND tenant_id = v_ie.tenant_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'candidata % não encontrada', p_candidate_id;
  END IF;

  IF v_candidate.status = 'PROMOTED' THEN
    RAISE EXCEPTION 'candidata % já está promovida', p_candidate_id;
  END IF;

  -- 5. Atualiza a regra para PROMOTED
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

  -- 6. Registra consumo único do evento
  INSERT INTO public.owner_approval_consumptions(source_event_id, tenant_id, owner_id, candidate_id, consumed_at)
  VALUES(v_ie.inbound_event_id::text, v_ie.tenant_id, v_ie.owner_id, p_candidate_id, v_now)
  ON CONFLICT (source_event_id) DO NOTHING;

  -- 7. Grava evento no log de auditoria append-only
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
    v_ie.tenant_id, 'OWNER_PROMOTED', 'RULE', p_candidate_id, 'rafael', v_payload,
    public.audit_event_hash(v_ie.tenant_id, 'OWNER_PROMOTED', 'RULE', p_candidate_id, 'rafael', v_payload, v_now),
    v_now
  );

  RETURN true;
END;
$$;

-- Criar sobrecarga auxiliar canônica aceitando event_id como text para compatibilidade
CREATE OR REPLACE FUNCTION public.approve_promotion_by_rafael(
  p_candidate_id uuid,
  p_event_id     text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_inbound_id uuid;
BEGIN
  -- Se for UUID direto
  IF p_event_id ~ '^[0-9a-fA-F-]{36}$' THEN
    v_inbound_id := p_event_id::uuid;
  ELSE
    SELECT inbound_event_id INTO v_inbound_id
    FROM public.channel_inbound_events
    WHERE external_update_id = p_event_id;
  END IF;

  IF v_inbound_id IS NULL THEN
    RAISE EXCEPTION 'evento % não encontrado', p_event_id;
  END IF;

  RETURN public.approve_promotion_by_rafael(p_candidate_id, v_inbound_id);
END;
$$;

-- 4. Atualizar activate_structured_memory para verificar Evidence Graph
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

  -- Se for formato UUID, valida no evidence_nodes se a tabela contiver dados
  IF p_evidence_node_id ~ '^[0-9a-fA-F-]{36}$' THEN
    IF EXISTS (SELECT 1 FROM public.evidence_nodes) AND NOT EXISTS (SELECT 1 FROM public.evidence_nodes WHERE node_id = p_evidence_node_id::uuid) THEN
      RAISE EXCEPTION 'nó de evidência % não existe no Evidence Graph', p_evidence_node_id;
    END IF;
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

-- 5. Conceder EXECUTE a visao360_app e revogar de PUBLIC
REVOKE ALL ON FUNCTION public.validate_rafael_approval_event(text,text,text,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.approve_promotion_by_rafael(uuid,uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.approve_promotion_by_rafael(uuid,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.activate_structured_memory(uuid,text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.validate_rafael_approval_event(text,text,text,text,text) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.approve_promotion_by_rafael(uuid,uuid) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.approve_promotion_by_rafael(uuid,text) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.activate_structured_memory(uuid,text) TO visao360_app;

COMMIT;
