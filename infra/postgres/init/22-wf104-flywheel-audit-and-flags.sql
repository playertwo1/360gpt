-- ============================================================================
-- Migration 22: Homologação WF-104, Governança Soberana e Sincronização de Flags
-- ============================================================================
\connect visao360;

BEGIN;

-- 1. Sincronização e Suporte Simétrico a system_flags (key/value e flag_name/flag_value)
ALTER TABLE public.system_flags ADD COLUMN IF NOT EXISTS flag_name TEXT;
ALTER TABLE public.system_flags ADD COLUMN IF NOT EXISTS flag_value TEXT;

-- Adiciona constraint UNIQUE em flag_name caso não exista para suportar ON CONFLICT (flag_name)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'system_flags_flag_name_key'
  ) THEN
    ALTER TABLE public.system_flags ADD CONSTRAINT system_flags_flag_name_key UNIQUE (flag_name);
  END IF;
END $$;

-- Trigger para sincronizar key <-> flag_name e value <-> flag_value
CREATE OR REPLACE FUNCTION public.sync_system_flags_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.key IS NULL AND NEW.flag_name IS NOT NULL THEN
    NEW.key := NEW.flag_name;
  END IF;
  IF NEW.flag_name IS NULL AND NEW.key IS NOT NULL THEN
    NEW.flag_name := NEW.key;
  END IF;

  IF NEW.value IS NULL AND NEW.flag_value IS NOT NULL THEN
    NEW.value := (lower(NEW.flag_value) = 'true');
  END IF;
  IF NEW.flag_value IS NULL AND NEW.value IS NOT NULL THEN
    NEW.flag_value := NEW.value::text;
  END IF;

  NEW.updated_at := clock_timestamp();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_system_flags_columns ON public.system_flags;
CREATE TRIGGER trg_sync_system_flags_columns
BEFORE INSERT OR UPDATE ON public.system_flags
FOR EACH ROW EXECUTE FUNCTION public.sync_system_flags_columns();

-- 2. Habilitação Soberana da flag AUTO_PROMOTION_ENABLED
UPDATE public.system_flags
SET value = true, flag_name = 'AUTO_PROMOTION_ENABLED', flag_value = 'true', updated_at = now()
WHERE key = 'AUTO_PROMOTION_ENABLED';

INSERT INTO public.system_flags (key, value, flag_name, flag_value, updated_at)
VALUES ('AUTO_PROMOTION_ENABLED', true, 'AUTO_PROMOTION_ENABLED', 'true', now())
ON CONFLICT (key) DO UPDATE SET value = true, flag_name = 'AUTO_PROMOTION_ENABLED', flag_value = 'true', updated_at = now();

UPDATE public.runtime_feature_flags
SET enabled = true, updated_at = now(), updated_by = 'rafael-sovereign-approval'
WHERE flag_key = 'AUTO_PROMOTION_ENABLED';

INSERT INTO public.runtime_feature_flags (flag_key, enabled, updated_at, updated_by)
VALUES ('AUTO_PROMOTION_ENABLED', true, now(), 'rafael-sovereign-approval')
ON CONFLICT (flag_key) DO UPDATE SET enabled = true, updated_at = now(), updated_by = 'rafael-sovereign-approval';

-- 3. Cadastro Prévio na Allowlist Soberana
INSERT INTO public.owner_channel_allowlist (tenant_id, owner_id, channel, chat_id, active)
VALUES 
  ('default', 'rafael', 'TELEGRAM', '5281600644', true),
  ('default', 'rafael', 'telegram', '5281600644', true),
  ('tenant-owner', 'rafael', 'TELEGRAM', '5281600644', true),
  ('rafael-360', 'rafael', 'TELEGRAM', '5281600644', true)
ON CONFLICT (tenant_id, owner_id, channel, chat_id) DO UPDATE SET active = true;

-- 4. Função Transacional insert_flywheel_audit_event (SECURITY DEFINER)
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
    gen_random_uuid(), coalesce(p_tenant_id, 'default'), p_event_type, p_entity_type, p_entity_id,
    coalesce(p_actor, 'WF-104'), coalesce(p_payload, '{}'::jsonb), v_hash, v_now
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Sobrecargas auxiliares para chamadas n8n
CREATE OR REPLACE FUNCTION public.insert_flywheel_audit_event(
  p_tenant_id    text,
  p_event_type   text,
  p_payload      jsonb,
  p_evidence_ref text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  RETURN public.insert_flywheel_audit_event(
    p_tenant_id, p_event_type, 'RULE', gen_random_uuid(),
    'WF-104', p_payload, p_evidence_ref
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.insert_flywheel_audit_event(
  p_event_type   text,
  p_payload      jsonb,
  p_evidence_ref text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  RETURN public.insert_flywheel_audit_event(
    'default', p_event_type, 'RULE', gen_random_uuid(),
    'WF-104', p_payload, p_evidence_ref
  );
END;
$$;

-- 5. Sobrecargas auxiliares de Lifecycle Inbound
CREATE OR REPLACE FUNCTION public.claim_next_inbound_event(p_worker_id text)
RETURNS SETOF public.channel_inbound_events
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.claim_next_inbound_event(p_worker_id, 120);
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_inbound_event(
  p_inbound_event_id uuid,
  p_metadata jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_lease_token uuid;
  v_delivery_id uuid;
BEGIN
  IF p_metadata ? 'lease_token' AND (p_metadata->>'lease_token') ~ '^[0-9a-fA-F-]{36}$' THEN
    v_lease_token := (p_metadata->>'lease_token')::uuid;
  ELSE
    SELECT lease_token INTO v_lease_token
    FROM public.channel_inbound_events
    WHERE inbound_event_id = p_inbound_event_id;
  END IF;

  IF p_metadata ? 'delivery_id' AND (p_metadata->>'delivery_id') ~ '^[0-9a-fA-F-]{36}$' THEN
    v_delivery_id := (p_metadata->>'delivery_id')::uuid;
  END IF;

  RETURN public.complete_inbound_event(p_inbound_event_id, v_lease_token, v_delivery_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.fail_inbound_event(
  p_inbound_event_id uuid,
  p_error_details text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_lease_token uuid;
BEGIN
  SELECT lease_token INTO v_lease_token
  FROM public.channel_inbound_events
  WHERE inbound_event_id = p_inbound_event_id;

  RETURN public.fail_inbound_event(p_inbound_event_id, v_lease_token, p_error_details);
END;
$$;

CREATE OR REPLACE FUNCTION public.insert_structured_memory(p_payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  RETURN public.insert_structured_memory(
    coalesce(p_payload->>'tenant_id', 'default'),
    coalesce(p_payload->>'owner_id', 'rafael'),
    coalesce(p_payload->>'memory_type', 'PREFERENCE'),
    coalesce(p_payload->>'scope', 'DOMAIN'),
    coalesce(p_payload->>'target_ref', 'CONTA'),
    coalesce(p_payload->'data', p_payload),
    coalesce(p_payload->>'origin', 'OWNER_PROVIDED'),
    coalesce((p_payload->>'confidence_score')::numeric, 1.00),
    p_payload->>'evidence_node_id'
  );
END;
$$;

-- 6. Concessões de Permissão Mínima para visao360_app
GRANT EXECUTE ON FUNCTION public.claim_next_inbound_event(text, integer) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.claim_next_inbound_event(text) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.complete_inbound_event(uuid, uuid, uuid) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.complete_inbound_event(uuid, jsonb) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.fail_inbound_event(uuid, uuid, text) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.fail_inbound_event(uuid, text) TO visao360_app;

GRANT EXECUTE ON FUNCTION public.insert_structured_memory(text, text, text, text, text, jsonb, text, numeric, text) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.insert_structured_memory(jsonb) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.activate_structured_memory(uuid, text) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.activate_structured_memory(uuid, uuid) TO visao360_app;

GRANT EXECUTE ON FUNCTION public.insert_flywheel_audit_event(text, text, text, uuid, text, jsonb, text) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.insert_flywheel_audit_event(text, text, jsonb, text) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.insert_flywheel_audit_event(text, jsonb, text) TO visao360_app;

GRANT EXECUTE ON FUNCTION public.promote_safe_preference_auto(uuid, varchar, varchar, varchar, varchar, numeric) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.create_learning_candidate(varchar, varchar, varchar, varchar, varchar, text, numeric, varchar, integer, varchar, varchar, varchar) TO visao360_app;

GRANT SELECT ON TABLE public.system_flags TO visao360_app;
GRANT SELECT ON TABLE public.runtime_feature_flags TO visao360_app;
GRANT SELECT ON TABLE public.sovereign_approval_allowlist TO visao360_app;

COMMIT;
