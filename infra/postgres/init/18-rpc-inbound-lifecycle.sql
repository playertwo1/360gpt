-- ============================================================================
-- Migration 18: Inbound Lifecycle RPCs (Desbloqueio Seguro WF-100 e WF-101)
-- Substitui escrita direta de DML de visao360_app por RPCs SECURITY DEFINER
-- com search_path imutável e validação atômica de integridade.
-- ============================================================================
\connect visao360;

BEGIN;

-- 1. Ingestão segura de update do canal (Substitui DML direto no WF-100 nó 03)
CREATE OR REPLACE FUNCTION public.ingest_channel_update(
  p_channel              text,
  p_external_update_id   text,
  p_tenant_id            text,
  p_owner_id             text,
  p_chat_id              text,
  p_message_id           text,
  p_sender_is_bot        boolean,
  p_payload              jsonb,
  p_transport_secret_hash text,
  p_payload_hash         text,
  p_event_kind           text,
  p_text_content         text
)
RETURNS TABLE (
  accepted   boolean,
  persisted  boolean,
  duplicate  boolean,
  queued     boolean,
  update_id  text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_authorized boolean := false;
  v_inserted_update boolean := false;
  v_exists_update boolean := false;
  v_inserted_inbound boolean := false;
  v_inbound_id uuid;
BEGIN
  -- 1. Verifica autorização do adaptador de canal
  SELECT true INTO v_authorized
  FROM public.channel_adapters
  WHERE adapter_id = 'telegram-local-poller'
    AND channel = p_channel
    AND status IN ('SHADOW', 'ACTIVE')
    AND secret_hash = p_transport_secret_hash;

  IF coalesce(v_authorized, false) IS NOT TRUE THEN
    RETURN QUERY SELECT false, false, false, false, p_external_update_id;
    RETURN;
  END IF;

  -- 2. Tenta inserir na tabela de transporte bruto channel_updates
  BEGIN
    INSERT INTO public.channel_updates (
      channel, external_update_id, tenant_id, owner_id, chat_id,
      message_id, sender_is_bot, payload, payload_hash, status
    )
    VALUES (
      p_channel, p_external_update_id, p_tenant_id, p_owner_id, p_chat_id,
      NULLIF(p_message_id, ''), coalesce(p_sender_is_bot, false),
      coalesce(p_payload, '{}'::jsonb), p_payload_hash,
      CASE WHEN coalesce(p_sender_is_bot, false) THEN 'IGNORED' ELSE 'QUEUED' END
    );
    v_inserted_update := true;
  EXCEPTION WHEN unique_violation THEN
    v_inserted_update := false;
  END;

  SELECT true INTO v_exists_update
  FROM public.channel_updates
  WHERE channel = p_channel AND external_update_id = p_external_update_id;

  -- 3. Se não for bot, enfileira evento na tabela de eventos de negócio channel_inbound_events
  IF coalesce(p_sender_is_bot, false) IS FALSE THEN
    v_inbound_id := md5(p_channel || '|' || p_external_update_id)::uuid;
    BEGIN
      INSERT INTO public.channel_inbound_events (
        inbound_event_id, channel, external_update_id, tenant_id, owner_id,
        chat_id, event_kind, text_content, status
      )
      VALUES (
        v_inbound_id, p_channel, p_external_update_id, p_tenant_id, p_owner_id,
        p_chat_id, p_event_kind, coalesce(p_text_content, ''), 'QUEUED'
      );
      v_inserted_inbound := true;
    EXCEPTION WHEN unique_violation THEN
      v_inserted_inbound := false;
    END;
  END IF;

  RETURN QUERY SELECT
    true AS accepted,
    (v_inserted_update OR coalesce(v_exists_update, false)) AS persisted,
    (NOT v_inserted_update) AS duplicate,
    v_inserted_inbound AS queued,
    p_external_update_id AS update_id;
END;
$$;

-- 2. Claim atômico de próximo evento com lease (Substitui DML direto no WF-101 nó 02)
CREATE OR REPLACE FUNCTION public.claim_next_inbound_event(
  p_worker_id     text DEFAULT 'n8n-wf-101',
  p_lease_seconds integer DEFAULT 120
)
RETURNS TABLE (
  inbound_event_id   uuid,
  external_update_id text,
  tenant_id          text,
  owner_id           text,
  channel            text,
  chat_id            text,
  event_kind         text,
  text_content       text,
  lease_token        uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_candidate_id uuid;
  v_new_token    uuid := gen_random_uuid();
  v_seconds      integer := coalesce(p_lease_seconds, 120);
BEGIN
  -- 1. Recupera leases expirados de tentativas anteriores (< 5 tentativas)
  UPDATE public.channel_inbound_events
  SET status = 'QUEUED',
      lease_token = NULL,
      lease_expires_at = NULL
  WHERE status = 'PROCESSING'
    AND lease_expires_at < now()
    AND attempt_count < 5;

  -- 2. Seleciona candidata com FOR UPDATE SKIP LOCKED
  SELECT cie.inbound_event_id INTO v_candidate_id
  FROM public.channel_inbound_events cie
  WHERE cie.status = 'QUEUED'
    AND cie.available_at <= now()
  ORDER BY cie.created_at ASC
  FOR UPDATE SKIP LOCKED
  LIMIT 1;

  IF v_candidate_id IS NULL THEN
    RETURN;
  END IF;

  -- 3. Atualiza estado para PROCESSING atribuindo o novo lease_token
  RETURN QUERY
  UPDATE public.channel_inbound_events cie
  SET status = 'PROCESSING',
      lease_token = v_new_token,
      lease_expires_at = now() + (v_seconds || ' seconds')::interval,
      attempt_count = cie.attempt_count + 1
  WHERE cie.inbound_event_id = v_candidate_id
  RETURNING
    cie.inbound_event_id,
    cie.external_update_id,
    cie.tenant_id,
    cie.owner_id,
    cie.channel,
    cie.chat_id,
    cie.event_kind,
    cie.text_content,
    cie.lease_token;
END;
$$;

-- 3. Conclusão atômica de evento (Substitui DML direto no WF-101 nó 09)
CREATE OR REPLACE FUNCTION public.complete_inbound_event(
  p_inbound_event_id uuid,
  p_lease_token      uuid,
  p_delivery_id      uuid DEFAULT NULL
)
RETURNS TABLE (
  inbound_event_id uuid,
  delivered        boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_delivered boolean := false;
  v_event_kind text;
BEGIN
  -- Se delivery_id fornecido, marca como SENT
  IF p_delivery_id IS NOT NULL THEN
    UPDATE public.channel_deliveries
    SET status = 'SENT', sent_at = now()
    WHERE delivery_id = p_delivery_id;
    v_delivered := FOUND;
  END IF;

  -- Consulta o tipo de evento para aplicar a regra estrita de lifecycle
  SELECT cie.event_kind INTO v_event_kind
  FROM public.channel_inbound_events cie
  WHERE cie.inbound_event_id = p_inbound_event_id
    AND cie.lease_token = p_lease_token
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'LEASE_INVALID_OR_EVENT_NOT_FOUND';
  END IF;

  -- Eventos DOCUMENT e IMAGE permanecem em PROCESSING até a conclusão no worker
  RETURN QUERY
  UPDATE public.channel_inbound_events cie
  SET status = CASE WHEN v_event_kind IN ('DOCUMENT', 'IMAGE') THEN 'PROCESSING' ELSE 'COMPLETED' END,
      completed_at = CASE WHEN v_event_kind IN ('DOCUMENT', 'IMAGE') THEN NULL ELSE now() END,
      lease_token = CASE WHEN v_event_kind IN ('DOCUMENT', 'IMAGE') THEN p_lease_token ELSE NULL END,
      lease_expires_at = CASE WHEN v_event_kind IN ('DOCUMENT', 'IMAGE') THEN now() + interval '10 minutes' ELSE NULL END
  WHERE cie.inbound_event_id = p_inbound_event_id
    AND cie.lease_token = p_lease_token
  RETURNING
    cie.inbound_event_id,
    v_delivered AS delivered;
END;
$$;

-- 4. Registro de falha com retenção de erro (Fallback seguro de execução)
CREATE OR REPLACE FUNCTION public.fail_inbound_event(
  p_inbound_event_id uuid,
  p_lease_token      uuid,
  p_error_details    text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  UPDATE public.channel_inbound_events
  SET status = CASE WHEN attempt_count >= 5 THEN 'FAILED' ELSE 'QUEUED' END,
      lease_token = NULL,
      lease_expires_at = NULL,
      last_error_code = left(p_error_details, 200)
  WHERE inbound_event_id = p_inbound_event_id
    AND lease_token = p_lease_token;

  RETURN FOUND;
END;
$$;

-- 5. Reaper de Leases Órfãos (Evitar travamento silencioso da fila se vazia)
CREATE OR REPLACE FUNCTION public.reap_stale_inbound_leases()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_reaped_count integer;
BEGIN
  UPDATE public.channel_inbound_events
  SET status = CASE WHEN attempt_count >= 5 THEN 'FAILED' ELSE 'QUEUED' END,
      lease_token = NULL,
      lease_expires_at = NULL,
      last_error_code = 'LEASE_TIMEOUT_AUTO_REAPED'
  WHERE status = 'PROCESSING'
    AND lease_expires_at < now();

  GET DIAGNOSTICS v_reaped_count = ROW_COUNT;
  RETURN v_reaped_count;
END;
$$;

-- 6. Privilégios mínimos estritos: Revoga de PUBLIC e concede a visao360_app
REVOKE ALL ON FUNCTION public.ingest_channel_update(text,text,text,text,text,text,boolean,jsonb,text,text,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_next_inbound_event(text,integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_inbound_event(uuid,uuid,uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fail_inbound_event(uuid,uuid,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reap_stale_inbound_leases() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.ingest_channel_update(text,text,text,text,text,text,boolean,jsonb,text,text,text,text) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.claim_next_inbound_event(text,integer) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.complete_inbound_event(uuid,uuid,uuid) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.fail_inbound_event(uuid,uuid,text) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.reap_stale_inbound_leases() TO visao360_app;

COMMIT;
