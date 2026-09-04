-- ============================================================================
-- Migration 17: Gate N7 Lockdown, Expurgo de Órfãos e Revogação Estrita de DML
-- Saneamento de funções legadas, ajuste de constraints de auditoria e revogação de DML.
-- ============================================================================
\connect visao360;

BEGIN;

-- 1. Eliminação de funções legadas e inseguras
DROP FUNCTION IF EXISTS public.owner_promote_candidate(uuid, character varying, character varying, character varying, character varying, text);
DROP FUNCTION IF EXISTS public.owner_promote_candidate;
DROP FUNCTION IF EXISTS public.insert_flywheel_audit_event(text, text, text, uuid, text, jsonb, text);
DROP FUNCTION IF EXISTS public.insert_flywheel_audit_event;

-- 2. Expurgo de dados órfãos e registros inconsistentes
DELETE FROM public.channel_inbound_events cie
WHERE cie.event_kind = 'DOCUMENT'
  AND cie.status = 'COMPLETED'
  AND NOT EXISTS (
    SELECT 1 
    FROM public.channel_documents cd 
    WHERE cd.inbound_event_id = cie.inbound_event_id
  );

UPDATE public.processing_jobs
SET 
  status = 'FAILED_FINAL',
  last_error_code = 'RECOVERED_FROM_DANGLING_LEASE: Processamento interrompido sem expiração definida'
WHERE status = 'PROCESSING'
  AND lease_expires_at IS NULL;

DELETE FROM public.structured_memory
WHERE evidence_node_id IN ('fake-evidence', 'test-evidence', 'mock-id')
   OR data::text ILIKE '%teste ofensivo%'
   OR data::text ILIKE '%fake%';

-- 3. Ajuste de constraints de auditoria
ALTER TABLE public.flywheel_audit_events 
  DROP CONSTRAINT IF EXISTS flywheel_audit_events_event_type_check;
ALTER TABLE public.flywheel_audit_events 
  DROP CONSTRAINT IF EXISTS chk_audit_event_type;

ALTER TABLE public.flywheel_audit_events
  ADD CONSTRAINT flywheel_audit_events_event_type_check CHECK (
    event_type::text = ANY (ARRAY[
      'PROPOSAL_RECORDED'::text,
      'OUTCOME_RECORDED'::text,
      'CANDIDATE_CREATED'::text,
      'AUTO_PROMOTED'::text,
      'OWNER_PROMOTED'::text,
      'OWNER_REVOKED'::text,
      'VETO_ENFORCED'::text,
      'CONTEXT_INJECTED'::text,
      'SUSPENDED'::text,
      'REVOKED'::text,
      'PROMOTION_REJECTED_RISK'::text,
      'AUTO_PROMOTION_BLOCKED_BY_FLAG'::text,
      'MEMORY_ACTIVATED'::text,
      'MEMORY_DEPRECATED'::text,
      'DOCUMENT_PROCESSED'::text
    ])
  );

-- 4. Transferência de propriedade para postgres e revogação estrita de DML
ALTER TABLE public.channel_updates OWNER TO postgres;
ALTER TABLE public.channel_inbound_events OWNER TO postgres;
ALTER TABLE public.flywheel_audit_events OWNER TO postgres;

GRANT SELECT, REFERENCES ON public.channel_updates, public.channel_inbound_events, public.flywheel_audit_events TO visao360_app;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.channel_updates, public.channel_inbound_events, public.flywheel_audit_events FROM visao360_app, PUBLIC;

COMMIT;

VACUUM (ANALYZE) public.channel_inbound_events;
VACUUM (ANALYZE) public.channel_documents;
VACUUM (ANALYZE) public.flywheel_audit_events;
VACUUM (ANALYZE) public.structured_memory;
