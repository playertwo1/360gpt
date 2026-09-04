-- ============================================================================
-- Migration 23: Sessão de Conversa, Deadlock Prevention e Comandos Telegram
-- ============================================================================
\connect visao360;

BEGIN;

-- 1. Adicionar colunas de sessão em conversation_threads
ALTER TABLE public.conversation_threads ADD COLUMN IF NOT EXISTS current_state VARCHAR(50) NOT NULL DEFAULT 'IDLE';
ALTER TABLE public.conversation_threads ADD COLUMN IF NOT EXISTS session_context JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2. RPC update_thread_session (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.update_thread_session(
  p_chat_id text,
  p_state text,
  p_context jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.conversation_threads
  SET current_state = coalesce(p_state, 'IDLE'),
      session_context = coalesce(p_context, '{}'::jsonb),
      updated_at = now()
  WHERE chat_id = p_chat_id;
END;
$$;

-- 3. RPC destravar_jobs_travados (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.destravar_jobs_travados(p_tenant_id text DEFAULT 'rafael-360')
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.channel_inbound_events
  SET status = 'QUEUED',
      lease_token = NULL,
      lease_expires_at = NULL,
      attempt_count = 0
  WHERE status = 'PROCESSING'
    AND (lease_expires_at < now() OR lease_expires_at IS NULL)
    AND (tenant_id = p_tenant_id OR p_tenant_id IS NULL);

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- 4. RPC cancelar_ultimo_documento (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.cancelar_ultimo_documento(p_chat_id text, p_tenant_id text DEFAULT 'rafael-360')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_ev RECORD;
BEGIN
  SELECT inbound_event_id, event_kind, created_at, status
  INTO v_ev
  FROM public.channel_inbound_events
  WHERE chat_id = p_chat_id
    AND event_kind IN ('DOCUMENT', 'IMAGE')
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_ev.inbound_event_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Nenhum documento encontrado para revogar.');
  END IF;

  UPDATE public.channel_inbound_events
  SET status = 'FAILED',
      last_error_code = 'REVOGADO_PELO_USUARIO'
  WHERE inbound_event_id = v_ev.inbound_event_id;

  RETURN jsonb_build_object(
    'success', true,
    'inbound_event_id', v_ev.inbound_event_id,
    'status', 'REVOGADO',
    'created_at', v_ev.created_at
  );
END;
$$;

-- 5. Atualizar claim_next_inbound_event para prevenir deadlock em attempt_count >= 5
DROP FUNCTION IF EXISTS public.claim_next_inbound_event(text, integer);
CREATE OR REPLACE FUNCTION public.claim_next_inbound_event(
  p_worker_id text,
  p_lease_seconds integer DEFAULT 120
)
RETURNS TABLE(
  inbound_event_id uuid,
  external_update_id text,
  tenant_id text,
  owner_id text,
  channel text,
  chat_id text,
  event_kind text,
  text_content text,
  lease_token uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_candidate_id uuid;
  v_new_token    uuid := gen_random_uuid();
  v_seconds      integer := coalesce(p_lease_seconds, 120);
BEGIN
  -- 1. Recupera leases expirados (< 5 tentativas)
  UPDATE public.channel_inbound_events
  SET status = 'QUEUED',
      lease_token = NULL,
      lease_expires_at = NULL
  WHERE status = 'PROCESSING'
    AND lease_expires_at < now()
    AND attempt_count < 5;

  -- 1.1 Marca como FAILED leases expirados com 5 ou mais tentativas (elimina deadlock)
  UPDATE public.channel_inbound_events
  SET status = 'FAILED',
      lease_token = NULL,
      lease_expires_at = NULL,
      last_error_code = 'EXCEEDED_MAX_ATTEMPTS'
  WHERE status = 'PROCESSING'
    AND lease_expires_at < now()
    AND attempt_count >= 5;

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

-- 6. Garantir permissões de execução para visao360_app
GRANT EXECUTE ON FUNCTION public.update_thread_session(text, text, jsonb) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.destravar_jobs_travados(text) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.cancelar_ultimo_documento(text, text) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.claim_next_inbound_event(text, integer) TO visao360_app;

COMMIT;
