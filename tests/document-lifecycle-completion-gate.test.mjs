import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const sql = await readFile('infra/postgres/init/14-document-lifecycle-and-completion-gate.sql', 'utf8');

for (const required of [
  'CREATE TABLE IF NOT EXISTS public.document_extractions',
  'CREATE TABLE IF NOT EXISTS public.document_field_evidence',
  'CREATE TABLE IF NOT EXISTS public.document_final_opinions',
  'FUNCTION public.begin_document_job',
  'FUNCTION public.persist_validated_extraction',
  'FUNCTION public.fail_document_job',
  'FUNCTION public.complete_document_job',
  "schema_version = '1.1.0'",
  'COMPLETION_REQUIRES_VALIDATED_EXTRACTION',
  'COMPLETION_REQUIRES_DIRECTOR_SUCCESS',
  'COMPLETION_REQUIRES_GG_PERFORMANCE_SUCCESS',
  'COMPLETION_REQUIRES_STATE_SNAPSHOT',
  'COMPLETION_REQUIRES_FINAL_OPINION',
  'COMPLETION_REQUIRES_FIELD_EVIDENCE'
]) assert.ok(sql.includes(required), `ausente: ${required}`);

assert.match(sql, /status='COMPLETED'.*current_stage='COMPLETED'.*progress_percent=100/s);
assert.match(sql, /channel_documents SET status='COMPLETED'/);
assert.match(sql, /channel_inbound_events SET status='COMPLETED'/);
assert.match(sql, /channel_updates SET status='COMPLETED'/);
assert.match(sql, /p_failure_status NOT IN \('FAILED_RETRYABLE','FAILED_FINAL','AWAITING_OWNER_INPUT'\)/);
assert.match(sql, /REVOKE ALL ON FUNCTION public\.complete_document_job.*FROM PUBLIC/s);
assert.match(sql, /GRANT EXECUTE ON FUNCTION public\.complete_document_job.*TO visao360_app/s);

const completionBody = sql.slice(sql.indexOf('CREATE OR REPLACE FUNCTION public.complete_document_job'));
const firstCompletionUpdate = completionBody.indexOf("status='COMPLETED'");
for (const guard of [
  'COMPLETION_REQUIRES_VALIDATED_EXTRACTION',
  'COMPLETION_REQUIRES_DIRECTOR_SUCCESS',
  'COMPLETION_REQUIRES_GG_PERFORMANCE_SUCCESS',
  'COMPLETION_REQUIRES_STATE_SNAPSHOT',
  'COMPLETION_REQUIRES_FINAL_OPINION',
  'COMPLETION_REQUIRES_FIELD_EVIDENCE'
]) {
  assert.ok(completionBody.indexOf(guard) >= 0 && completionBody.indexOf(guard) < firstCompletionUpdate,
    `${guard} precisa ocorrer antes de qualquer COMPLETED`);
}

console.log('document lifecycle completion gate: PASS');
