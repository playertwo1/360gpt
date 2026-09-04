-- ============================================================================
-- Migration 20: Governança Estrita, Integridade de Ingestão e Validação Soberana
-- Elimina as 9 não conformidades do Gate N2.3 / A0 / N7:
--   1. Allowlist Fail-Closed Obrigatória (SQLSTATE P0001)
--   2. Target Mandatório no /aprovardiretriz com UUID canônico (SQLSTATE P0002)
--   3. Validação de Hash Canônico de Ingestão com detecção de adulteração
--   4. Validação Estrita de Evidência com tipagem UUID e verificação no Evidence Graph (SQLSTATE P0003)
--   5. Views simétricas de governança (sovereign_approval_allowlist, sovereign_evidence_nodes)
-- ============================================================================
\connect visao360;

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. Views de Governança e Simetria de Contrato
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.sovereign_approval_allowlist AS
SELECT 
  tenant_id,
  owner_id,
  lower(channel) AS channel_type,
  channel,
  chat_id AS external_chat_id,
  chat_id,
  active AS is_active,
  active
FROM public.owner_channel_allowlist;

CREATE OR REPLACE VIEW public.sovereign_evidence_nodes AS
SELECT 
  node_id AS id,
  node_id,
  tenant_id,
  node_type,
  entity_id,
  content_hash,
  payload_json,
  created_at
FROM public.evidence_nodes;

-- ----------------------------------------------------------------------------
-- 2. Função validate_rafael_approval_event com Fail-Closed Estrito e P0001
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_rafael_approval_event(
  p_event_id         text,
  p_owner_id         text,
  p_tenant_id        text,
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
  v_norm_text text;
BEGIN
  IF p_owner_id <> 'rafael' THEN
    RAISE EXCEPTION 'evento não pertence a este owner';
  END IF;

  -- Busca evento de inbound (aceita UUID canônico ou external_update_id) com lock pessimista
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

  -- 1. Allowlist Fail-Closed Obrigatória: NUNCA permitir se não houver match ativo
  IF NOT EXISTS (
    SELECT 1 FROM public.owner_channel_allowlist
    WHERE tenant_id = v_ie.tenant_id
      AND owner_id = v_ie.owner_id
      AND upper(channel) = upper(v_ie.channel)
      AND chat_id = v_ie.chat_id
      AND active IS TRUE
  ) THEN
    RAISE EXCEPTION 'Acesso negado: chat % não autorizado para aprovação soberana no tenant %', v_ie.chat_id, v_ie.tenant_id
      USING ERRCODE = 'P0001';
  END IF;

  -- 2. Normalização Unicode NFKC e eliminação de caracteres invisíveis/controle
  v_norm_text := regexp_replace(normalize(coalesce(v_ie.text_content, ''), NFKC), '[\u200B-\u200D\uFEFF]', '', 'g');

  IF v_ie.event_kind <> 'COMMAND' OR v_norm_text !~* ('^' || p_expected_command || '([[:space:]]|$)') THEN
    RAISE EXCEPTION 'evento não é um comando de aprovação (comando: %)', v_ie.text_content;
  END IF;

  -- 3. Verificação de reuso (Single-use)
  IF EXISTS (SELECT 1 FROM public.owner_approval_consumptions WHERE source_event_id = v_ie.inbound_event_id::text) THEN
    RAISE EXCEPTION 'evento % já foi usado — reuso bloqueado (single-use)', p_event_id;
  END IF;

  -- 4. Verificação de integridade contra channel_updates
  SELECT * INTO v_cu
  FROM public.channel_updates
  WHERE channel = v_ie.channel AND external_update_id = v_ie.external_update_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'registro de transporte não encontrado para o evento';
  END IF;

  IF p_raw_payload IS NOT NULL AND trim(p_raw_payload) <> '' THEN
    IF p_raw_payload ~ '^sha256:[a-f0-9]{64}$' THEN
      v_recomputed := p_raw_payload;
    ELSE
      v_recomputed := 'sha256:' || encode(sha256(convert_to(p_raw_payload, 'UTF8')), 'hex');
    END IF;

    IF v_recomputed <> v_cu.payload_hash THEN
      RAISE EXCEPTION 'hash do payload não confere — evento pode ter sido adulterado';
    END IF;
  END IF;

  RETURN true;
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. Função approve_promotion_by_rafael com Target Mandatório (P0002)
-- ----------------------------------------------------------------------------
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
  v_norm_cmd text;
  v_extracted_str text;
  v_extracted_candidate_id uuid;
BEGIN
  -- 1. Carrega evento de inbound com lock pessimista
  SELECT * INTO v_ie
  FROM public.channel_inbound_events
  WHERE inbound_event_id = p_inbound_event_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'evento de entrada % não encontrado', p_inbound_event_id;
  END IF;

  -- 2. Valida o evento real através da função de segurança soberana
  PERFORM public.validate_rafael_approval_event(
    p_inbound_event_id::text, v_ie.owner_id, v_ie.tenant_id, '/aprovardiretriz', v_ie.text_content
  );

  -- 3. Target Mandatório no /aprovardiretriz: extração e validação do UUID com normalização
  v_norm_cmd := regexp_replace(normalize(coalesce(v_ie.text_content, ''), NFKC), '[\u200B-\u200D\uFEFF]', '', 'g');
  v_extracted_str := trim(substring(v_norm_cmd from '(?i)^/aprovardiretriz\s+([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})'));

  IF v_extracted_str IS NULL OR v_extracted_str = '' THEN
    RAISE EXCEPTION 'Comando inválido: o identificador da diretriz deve ser explicitamente fornecido e coincidir com a candidata em trânsito'
      USING ERRCODE = 'P0002';
  END IF;

  v_extracted_candidate_id := v_extracted_str::uuid;
  IF v_extracted_candidate_id <> p_candidate_id THEN
    RAISE EXCEPTION 'Comando inválido: o identificador da diretriz deve ser explicitamente fornecido e coincidir com a candidata em trânsito (esperado %, recebido %)', p_candidate_id, v_extracted_candidate_id
      USING ERRCODE = 'P0002';
  END IF;

  -- 4. Carrega a candidata em promoted_knowledge com lock pessimista
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

  -- 6. Registra consumo único do evento com barreira atômica contra corridas
  BEGIN
    INSERT INTO public.owner_approval_consumptions(source_event_id, tenant_id, owner_id, candidate_id, consumed_at)
    VALUES(v_ie.inbound_event_id::text, v_ie.tenant_id, v_ie.owner_id, p_candidate_id, v_now);
  EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION 'evento % já foi consumido — reuso bloqueado (single-use)', p_inbound_event_id;
  END;

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

-- Sobrecarga auxiliar aceitando event_id como text para compatibilidade de chamada
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

-- ----------------------------------------------------------------------------
-- 4. Função activate_structured_memory com Validação Estrita de Evidência (P0003)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.activate_structured_memory(
  p_id          uuid,
  p_evidence_id uuid
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

  IF p_evidence_id IS NULL THEN
    RAISE EXCEPTION 'evidência obrigatória para ativar memória'
      USING ERRCODE = 'P0003';
  END IF;

  -- Validação estrita de existência do nó de evidência no mesmo tenant
  IF NOT EXISTS (
    SELECT 1 FROM public.evidence_nodes
    WHERE node_id = p_evidence_id
      AND tenant_id = v_row.tenant_id
  ) THEN
    RAISE EXCEPTION 'Evidência % inexistente ou inválida para o tenant %', p_evidence_id, v_row.tenant_id
      USING ERRCODE = 'P0003';
  END IF;

  IF v_row.scope = 'GLOBAL' AND v_row.origin = 'INFERRED_INTERACTION' THEN
    RAISE EXCEPTION 'memória global inferida não pode ser ativada automaticamente — exige revisão humana';
  END IF;

  UPDATE public.structured_memory
  SET status = 'ACTIVE', evidence_node_id = p_evidence_id::text, updated_at = now()
  WHERE id = p_id;

  RETURN true;
END;
$$;

-- Sobrecarga para compatibilidade textual (valida UUID canônico antes de delegar)
CREATE OR REPLACE FUNCTION public.activate_structured_memory(
  p_id               uuid,
  p_evidence_node_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF p_evidence_node_id IS NULL OR trim(p_evidence_node_id) = '' OR p_evidence_node_id !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN
    RAISE EXCEPTION 'Evidência % inexistente ou inválida (formato UUID obrigatório)', p_evidence_node_id
      USING ERRCODE = 'P0003';
  END IF;

  RETURN public.activate_structured_memory(p_id, p_evidence_node_id::uuid);
END;
$$;

-- ----------------------------------------------------------------------------
-- 5. Privilégios Mínimos e Segurança
-- ----------------------------------------------------------------------------
REVOKE ALL ON TABLE public.sovereign_approval_allowlist FROM PUBLIC;
REVOKE ALL ON TABLE public.sovereign_evidence_nodes FROM PUBLIC;
REVOKE ALL ON FUNCTION public.validate_rafael_approval_event(text,text,text,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.approve_promotion_by_rafael(uuid,uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.approve_promotion_by_rafael(uuid,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.activate_structured_memory(uuid,uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.activate_structured_memory(uuid,text) FROM PUBLIC;

GRANT SELECT ON TABLE public.sovereign_approval_allowlist TO visao360_app;
GRANT SELECT ON TABLE public.sovereign_evidence_nodes TO visao360_app;
GRANT EXECUTE ON FUNCTION public.validate_rafael_approval_event(text,text,text,text,text) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.approve_promotion_by_rafael(uuid,uuid) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.approve_promotion_by_rafael(uuid,text) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.activate_structured_memory(uuid,uuid) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.activate_structured_memory(uuid,text) TO visao360_app;

COMMIT;
