-- 14-document-lifecycle-and-completion-gate.sql
-- Quinta remediacao — Gate A0 / jornada documental sem falso sucesso
\connect visao360;
BEGIN;

CREATE TABLE IF NOT EXISTS public.document_extractions (
  extraction_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL UNIQUE REFERENCES public.processing_jobs(job_id),
  document_id uuid NOT NULL REFERENCES public.channel_documents(document_id),
  tenant_id text NOT NULL,
  schema_version text NOT NULL CHECK (schema_version = '1.1.0'),
  extraction_payload jsonb NOT NULL,
  extraction_hash text NOT NULL CHECK (extraction_hash ~ '^sha256:[a-f0-9]{64}$'),
  validation_status text NOT NULL CHECK (validation_status IN ('VALIDATED','REJECTED')),
  validated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.document_field_evidence (
  field_evidence_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  extraction_id uuid NOT NULL REFERENCES public.document_extractions(extraction_id),
  tenant_id text NOT NULL,
  field_path text NOT NULL,
  field_value jsonb NOT NULL,
  content_hash text NOT NULL CHECK (content_hash ~ '^sha256:[a-f0-9]{64}$'),
  evidence_node_id uuid NOT NULL REFERENCES public.evidence_nodes(node_id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (extraction_id, field_path)
);

CREATE TABLE IF NOT EXISTS public.document_final_opinions (
  opinion_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL UNIQUE REFERENCES public.processing_jobs(job_id),
  state_id uuid NOT NULL,
  state_version bigint NOT NULL,
  tenant_id text NOT NULL,
  opinion_text text NOT NULL,
  opinion_hash text NOT NULL CHECK (opinion_hash ~ '^sha256:[a-f0-9]{64}$'),
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (state_id, state_version) REFERENCES public.state_snapshots(state_id, state_version)
);

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.document_extractions, public.document_field_evidence, public.document_final_opinions FROM visao360_app;
GRANT SELECT ON public.document_extractions, public.document_field_evidence, public.document_final_opinions TO visao360_app;

-- Registra documento + job antes de qualquer OCR. Idempotente por inbound_event_id + content_hash.
CREATE OR REPLACE FUNCTION public.begin_document_job(
  p_inbound_event_id uuid,
  p_original_name text,
  p_mime_type text,
  p_size_bytes bigint,
  p_content_hash text,
  p_storage_ref text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  e public.channel_inbound_events%ROWTYPE;
  v_document_id uuid;
  v_job_id uuid;
  v_protocol bigint;
  v_corr uuid;
  v_node uuid;
  v_payload jsonb;
  v_hash text;
BEGIN
  SELECT * INTO e FROM public.channel_inbound_events WHERE inbound_event_id=p_inbound_event_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'INBOUND_EVENT_NOT_FOUND'; END IF;
  IF e.event_kind NOT IN ('DOCUMENT','IMAGE') THEN RAISE EXCEPTION 'INBOUND_EVENT_NOT_DOCUMENT'; END IF;
  IF e.status NOT IN ('PROCESSING','QUEUED') THEN RAISE EXCEPTION 'INBOUND_EVENT_INVALID_STATE:%', e.status; END IF;
  IF p_size_bytes < 0 OR coalesce(p_original_name,'')='' OR coalesce(p_mime_type,'')='' OR p_content_hash !~ '^sha256:[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'DOCUMENT_METADATA_INVALID';
  END IF;

  v_document_id := md5(e.inbound_event_id::text || '|' || p_content_hash)::uuid;
  v_job_id := md5(v_document_id::text || '|PROCESSING_JOB')::uuid;
  v_corr := md5(e.tenant_id || '|' || e.inbound_event_id::text || '|CORRELATION')::uuid;

  INSERT INTO public.owner_protocol_counters(owner_id,next_value,updated_at)
  VALUES(e.owner_id,2,now())
  ON CONFLICT(owner_id) DO UPDATE SET next_value=public.owner_protocol_counters.next_value+1, updated_at=now()
  RETURNING next_value-1 INTO v_protocol;

  INSERT INTO public.channel_documents(document_id,inbound_event_id,tenant_id,owner_id,short_protocol,original_name,mime_type,size_bytes,content_hash,storage_ref,status,received_at)
  VALUES(v_document_id,e.inbound_event_id,e.tenant_id,e.owner_id,v_protocol,p_original_name,p_mime_type,p_size_bytes,p_content_hash,p_storage_ref,'PROCESSING',now())
  ON CONFLICT(document_id) DO NOTHING;

  INSERT INTO public.processing_jobs(job_id,document_id,correlation_id,current_stage,progress_percent,status,attempt_count,stage_payload,created_at,updated_at)
  VALUES(v_job_id,v_document_id,v_corr,'DOWNLOAD_CONFIRMED',15,'PROCESSING',1,jsonb_build_object('schema_version','1.1.0'),now(),now())
  ON CONFLICT(job_id) DO NOTHING;

  v_payload := jsonb_build_object('document_id',v_document_id,'job_id',v_job_id,'original_name',p_original_name,'mime_type',p_mime_type,'size_bytes',p_size_bytes,'content_hash',p_content_hash,'storage_ref',p_storage_ref);
  v_hash := 'sha256:' || encode(digest(convert_to(v_payload::text,'UTF8'),'sha256'),'hex');
  v_node := md5(v_document_id::text || '|SOURCE_ARTIFACT')::uuid;
  INSERT INTO public.evidence_nodes(node_id,tenant_id,node_type,entity_id,entity_version,content_hash,payload_json,observed_at,recorded_at)
  VALUES(v_node,e.tenant_id,'SOURCE_ARTIFACT',v_document_id::text,1,v_hash,v_payload,now(),now())
  ON CONFLICT(tenant_id,node_type,entity_id,entity_version) DO NOTHING;

  RETURN jsonb_build_object('document_id',v_document_id,'job_id',v_job_id,'correlation_id',v_corr,'protocol',v_protocol,'status','PROCESSING');
END $$;

-- Valida envelope 1.1.0, persiste a extracao e cria evidencia por campo de primeiro nivel.
CREATE OR REPLACE FUNCTION public.persist_validated_extraction(
  p_job_id uuid,
  p_schema_version text,
  p_extraction_payload jsonb
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  j RECORD;
  v_extraction_id uuid;
  v_hash text;
  kv RECORD;
  v_node uuid;
  v_field_hash text;
BEGIN
  SELECT pj.*, cd.tenant_id, cd.document_id INTO j
  FROM public.processing_jobs pj JOIN public.channel_documents cd ON cd.document_id=pj.document_id
  WHERE pj.job_id=p_job_id FOR UPDATE OF pj;
  IF NOT FOUND THEN RAISE EXCEPTION 'PROCESSING_JOB_NOT_FOUND'; END IF;
  IF j.status <> 'PROCESSING' THEN RAISE EXCEPTION 'PROCESSING_JOB_INVALID_STATE:%', j.status; END IF;
  IF p_schema_version <> '1.1.0' THEN RAISE EXCEPTION 'DOCUMENT_SCHEMA_VERSION_INVALID'; END IF;
  IF jsonb_typeof(p_extraction_payload) <> 'object' OR NOT (p_extraction_payload ? 'extraction') OR jsonb_typeof(p_extraction_payload->'extraction') <> 'object' THEN
    RAISE EXCEPTION 'DOCUMENT_SCHEMA_1_1_0_INVALID';
  END IF;

  v_hash := 'sha256:' || encode(digest(convert_to(p_extraction_payload::text,'UTF8'),'sha256'),'hex');
  INSERT INTO public.document_extractions(job_id,document_id,tenant_id,schema_version,extraction_payload,extraction_hash,validation_status,validated_at)
  VALUES(p_job_id,j.document_id,j.tenant_id,p_schema_version,p_extraction_payload,v_hash,'VALIDATED',now())
  ON CONFLICT(job_id) DO UPDATE SET extraction_payload=EXCLUDED.extraction_payload, extraction_hash=EXCLUDED.extraction_hash, validation_status='VALIDATED', validated_at=now()
  RETURNING extraction_id INTO v_extraction_id;

  FOR kv IN SELECT key,value FROM jsonb_each(p_extraction_payload->'extraction') LOOP
    v_field_hash := 'sha256:' || encode(digest(convert_to(kv.value::text,'UTF8'),'sha256'),'hex');
    v_node := md5(v_extraction_id::text || '|' || kv.key)::uuid;
    INSERT INTO public.evidence_nodes(node_id,tenant_id,node_type,entity_id,entity_version,content_hash,payload_json,observed_at,recorded_at)
    VALUES(v_node,j.tenant_id,'OBSERVATION',p_job_id::text || ':' || kv.key,1,v_field_hash,jsonb_build_object('field_path','/extraction/'||kv.key,'value',kv.value,'extraction_id',v_extraction_id),now(),now())
    ON CONFLICT(tenant_id,node_type,entity_id,entity_version) DO NOTHING;
    INSERT INTO public.document_field_evidence(extraction_id,tenant_id,field_path,field_value,content_hash,evidence_node_id)
    VALUES(v_extraction_id,j.tenant_id,'/extraction/'||kv.key,kv.value,v_field_hash,v_node)
    ON CONFLICT(extraction_id,field_path) DO NOTHING;
  END LOOP;

  UPDATE public.processing_jobs SET current_stage='SCHEMA_VALIDATED',progress_percent=55,stage_payload=jsonb_build_object('schema_version','1.1.0','extraction_id',v_extraction_id,'extraction_hash',v_hash),updated_at=now() WHERE job_id=p_job_id;
  UPDATE public.channel_documents SET status='PROCESSING' WHERE document_id=j.document_id;

  -- Handoffs nascem QUEUED; nenhuma consulta e declarada antes de SUCCESS real.
  INSERT INTO public.domain_handoffs_360(handoff_id,job_id,source_agent,target_agent,domain,schema_version,input_hash,payload,status)
  VALUES(md5(p_job_id::text||'|DIRECTOR')::uuid,p_job_id,'WF-101','DIRETOR_360','director','1.1.0',v_hash,jsonb_build_object('extraction_id',v_extraction_id),'QUEUED')
  ON CONFLICT DO NOTHING;
  INSERT INTO public.domain_handoffs_360(handoff_id,job_id,source_agent,target_agent,domain,schema_version,input_hash,payload,status)
  VALUES(md5(p_job_id::text||'|GG_PERFORMANCE')::uuid,p_job_id,'DIRETOR_360','GG_PERFORMANCE','performance','1.1.0',v_hash,jsonb_build_object('extraction_id',v_extraction_id),'QUEUED')
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object('job_id',p_job_id,'extraction_id',v_extraction_id,'schema_version','1.1.0','extraction_hash',v_hash,'status','SCHEMA_VALIDATED','handoffs_queued',2);
END $$;

CREATE OR REPLACE FUNCTION public.fail_document_job(
  p_job_id uuid,
  p_failure_status text,
  p_error_code text
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE v_document_id uuid; v_inbound uuid;
BEGIN
  IF p_failure_status NOT IN ('FAILED_RETRYABLE','FAILED_FINAL','AWAITING_OWNER_INPUT') THEN RAISE EXCEPTION 'INVALID_FAILURE_STATUS'; END IF;
  UPDATE public.processing_jobs SET status=p_failure_status,current_stage=p_failure_status,last_error_code=left(p_error_code,200),lease_token=NULL,lease_expires_at=NULL,updated_at=now()
  WHERE job_id=p_job_id AND status <> 'COMPLETED' RETURNING document_id INTO v_document_id;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  SELECT inbound_event_id INTO v_inbound FROM public.channel_documents WHERE document_id=v_document_id;
  UPDATE public.channel_documents SET status=CASE WHEN p_failure_status='AWAITING_OWNER_INPUT' THEN 'AWAITING_OWNER_INPUT' ELSE 'FAILED' END WHERE document_id=v_document_id;
  UPDATE public.channel_inbound_events SET status=CASE WHEN p_failure_status='AWAITING_OWNER_INPUT' THEN 'PROCESSING' ELSE 'FAILED' END,last_error_code=left(p_error_code,200),lease_token=NULL,lease_expires_at=NULL WHERE inbound_event_id=v_inbound;
  RETURN TRUE;
END $$;

-- Unica porta para COMPLETED. Exige extracao VALIDATED, Diretor SUCCESS, GG Performance SUCCESS,
-- snapshot persistido, parecer persistido e evidencia associada.
CREATE OR REPLACE FUNCTION public.complete_document_job(
  p_job_id uuid,
  p_state_id uuid,
  p_state_version bigint,
  p_opinion_text text
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  j RECORD; s RECORD; v_inbound uuid; v_opinion_hash text; v_refs jsonb;
BEGIN
  SELECT pj.*, cd.tenant_id, cd.document_id, cd.inbound_event_id INTO j
  FROM public.processing_jobs pj JOIN public.channel_documents cd ON cd.document_id=pj.document_id
  WHERE pj.job_id=p_job_id FOR UPDATE OF pj;
  IF NOT FOUND THEN RAISE EXCEPTION 'PROCESSING_JOB_NOT_FOUND'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.document_extractions de WHERE de.job_id=p_job_id AND de.validation_status='VALIDATED') THEN RAISE EXCEPTION 'COMPLETION_REQUIRES_VALIDATED_EXTRACTION'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.domain_handoffs_360 h WHERE h.job_id=p_job_id AND h.domain='director' AND h.status='SUCCESS') THEN RAISE EXCEPTION 'COMPLETION_REQUIRES_DIRECTOR_SUCCESS'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.domain_handoffs_360 h WHERE h.job_id=p_job_id AND h.domain='performance' AND h.status='SUCCESS') THEN RAISE EXCEPTION 'COMPLETION_REQUIRES_GG_PERFORMANCE_SUCCESS'; END IF;
  SELECT * INTO s FROM public.state_snapshots WHERE state_id=p_state_id AND state_version=p_state_version AND tenant_id=j.tenant_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'COMPLETION_REQUIRES_STATE_SNAPSHOT'; END IF;
  IF coalesce(trim(p_opinion_text),'')='' THEN RAISE EXCEPTION 'COMPLETION_REQUIRES_FINAL_OPINION'; END IF;

  SELECT coalesce(jsonb_agg(jsonb_build_object('node_id',dfe.evidence_node_id,'field_path',dfe.field_path)),'[]'::jsonb) INTO v_refs
  FROM public.document_field_evidence dfe JOIN public.document_extractions de ON de.extraction_id=dfe.extraction_id WHERE de.job_id=p_job_id;
  IF jsonb_array_length(v_refs)=0 THEN RAISE EXCEPTION 'COMPLETION_REQUIRES_FIELD_EVIDENCE'; END IF;
  v_opinion_hash := 'sha256:' || encode(digest(convert_to(p_opinion_text,'UTF8'),'sha256'),'hex');
  INSERT INTO public.document_final_opinions(job_id,state_id,state_version,tenant_id,opinion_text,opinion_hash,evidence_refs)
  VALUES(p_job_id,p_state_id,p_state_version,j.tenant_id,p_opinion_text,v_opinion_hash,v_refs)
  ON CONFLICT(job_id) DO NOTHING;

  UPDATE public.processing_jobs SET status='COMPLETED',current_stage='COMPLETED',progress_percent=100,completed_at=now(),updated_at=now(),lease_token=NULL,lease_expires_at=NULL WHERE job_id=p_job_id;
  UPDATE public.channel_documents SET status='COMPLETED' WHERE document_id=j.document_id;
  UPDATE public.channel_inbound_events SET status='COMPLETED',completed_at=now(),lease_token=NULL,lease_expires_at=NULL,last_error_code=NULL WHERE inbound_event_id=j.inbound_event_id;
  UPDATE public.channel_updates SET status='COMPLETED',completed_at=now() WHERE (channel,external_update_id)=(SELECT channel,external_update_id FROM public.channel_inbound_events WHERE inbound_event_id=j.inbound_event_id);
  RETURN TRUE;
END $$;

REVOKE ALL ON FUNCTION public.begin_document_job(uuid,text,text,bigint,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.persist_validated_extraction(uuid,text,jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fail_document_job(uuid,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_document_job(uuid,uuid,bigint,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.begin_document_job(uuid,text,text,bigint,text,text) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.persist_validated_extraction(uuid,text,jsonb) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.fail_document_job(uuid,text,text) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.complete_document_job(uuid,uuid,bigint,text) TO visao360_app;

COMMIT;
