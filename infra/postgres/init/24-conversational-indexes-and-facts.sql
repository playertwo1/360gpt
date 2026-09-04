-- ============================================================================
-- Migration 24: Índices de Conversação e Registro de Fatos Operacionais
-- ============================================================================
\connect visao360;

BEGIN;

-- 1. Índice para busca rápida de sessão por chat_id
CREATE INDEX IF NOT EXISTS idx_conversation_threads_chat_id 
ON public.conversation_threads (chat_id);

-- 2. Tabela de fatos operacionais candidatos com proveniência estrita OWNER_PROVIDED
CREATE TABLE IF NOT EXISTS public.operational_candidate_facts (
  fact_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  chat_id TEXT NOT NULL,
  fact_payload JSONB NOT NULL,
  provenance TEXT NOT NULL DEFAULT 'OWNER_PROVIDED',
  status TEXT NOT NULL DEFAULT 'CANDIDATE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_provenance_owner CHECK (provenance IN ('OWNER_PROVIDED', 'DOCUMENT_REPORTED', 'SYSTEM_CALCULATED'))
);

CREATE INDEX IF NOT EXISTS idx_operational_candidate_facts_tenant_chat 
ON public.operational_candidate_facts (tenant_id, chat_id, created_at DESC);

-- 3. RPC record_operational_fact (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.record_operational_fact(
  p_tenant_id TEXT,
  p_chat_id TEXT,
  p_fact JSONB,
  p_provenance TEXT DEFAULT 'OWNER_PROVIDED'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_fact_id UUID;
BEGIN
  INSERT INTO public.operational_candidate_facts (
    tenant_id,
    chat_id,
    fact_payload,
    provenance,
    status
  )
  VALUES (
    COALESCE(p_tenant_id, 'rafael-360'),
    p_chat_id,
    p_fact,
    COALESCE(p_provenance, 'OWNER_PROVIDED'),
    'CANDIDATE'
  )
  RETURNING fact_id INTO v_fact_id;

  RETURN v_fact_id;
END;
$$;

-- 4. Permissões à role de aplicação
GRANT SELECT, INSERT, UPDATE ON public.operational_candidate_facts TO visao360_app;
GRANT EXECUTE ON FUNCTION public.record_operational_fact(TEXT, TEXT, JSONB, TEXT) TO visao360_app;

COMMIT;
