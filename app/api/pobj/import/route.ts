import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { isDenied, requireDashboardReader } from '../../reviews/shared';
import { publicProcessingState } from '../../../../lib/processing-status';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string[]> = {
  'application/pdf': ['pdf'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
  'application/vnd.ms-excel': ['xls'],
  'text/csv': ['csv'],
};

const IMPORT_QUERY = `SELECT d.id, d.original_name, d.mime_type, d.content_hash, d.raw_text,
  d.status, d.received_at,
  (SELECT ar.id FROM agent_runs ar WHERE ar.document_id = d.id ORDER BY ar.available_at DESC LIMIT 1) AS job_id,
  (SELECT ar.status FROM agent_runs ar WHERE ar.document_id = d.id ORDER BY ar.available_at DESC LIMIT 1) AS job_status,
  (SELECT ar.attempt_count FROM agent_runs ar WHERE ar.document_id = d.id ORDER BY ar.available_at DESC LIMIT 1) AS attempt_count,
  (SELECT ar.last_error_code FROM agent_runs ar WHERE ar.document_id = d.id ORDER BY ar.available_at DESC LIMIT 1) AS last_error_code
  FROM documents d`;

export async function GET() {
  const access = await requireDashboardReader();
  if (isDenied(access)) return access;
  const result = await env.DB.prepare(`${IMPORT_QUERY}
    WHERE d.owner_id = ? AND d.source IN ('pobj_mobile', 'telegram')
    ORDER BY d.received_at DESC LIMIT 20`).bind(access.userId).all<ImportRow>();
  return NextResponse.json(
    { ok: true, imports: (result.results ?? []).map(toImport) },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}

export async function POST(request: Request) {
  const access = await requireDashboardReader();
  if (isDenied(access)) return access;
  if (!env.DB || !env.FILES) return NextResponse.json({ ok: false, error: 'storage_unavailable' }, { status: 503 });

  let form: FormData;
  try { form = await request.formData(); } catch { return invalid('invalid_form'); }
  const file = form.get('file');
  if (!(file instanceof File)) return invalid('file_required');
  if (!file.size || file.size > MAX_FILE_BYTES) return NextResponse.json({ ok: false, error: 'invalid_file_size' }, { status: 413 });

  const mime = file.type.toLowerCase();
  const extension = file.name.toLowerCase().split('.').pop() ?? '';
  if (!(ALLOWED_TYPES[mime] ?? []).includes(extension)) return NextResponse.json({ ok: false, error: 'file_type_not_allowed' }, { status: 415 });

  const bytes = await file.arrayBuffer();
  if (!contentMatches(bytes, mime)) return invalid('file_content_mismatch');
  const hash = `sha256:${await sha256Hex(bytes)}`;
  const duplicate = await env.DB.prepare(`${IMPORT_QUERY}
    WHERE d.owner_id = ? AND d.content_hash = ? AND d.source IN ('pobj_mobile', 'telegram')
    ORDER BY d.received_at DESC LIMIT 1`).bind(access.userId, hash).first<ImportRow>();

  if (duplicate) {
    await env.DB.prepare(`INSERT INTO audit_log (id, owner_id, actor, action, entity_type, entity_id, details_json, created_at)
      VALUES (?, ?, ?, 'duplicate_ingest_ignored', 'document', ?, ?, ?)`).bind(
        `audit-${crypto.randomUUID()}`, access.userId, `chatgpt:${access.email}`, duplicate.id,
        JSON.stringify({ channel: 'site', hash, originalName: safeName(file.name), externalEffectsAllowed: false }), Date.now(),
      ).run();
    return NextResponse.json({ ok: true, duplicate: true, protocol: duplicate.id, import: toImport(duplicate) });
  }

  const now = Date.now();
  const id = `pobj-${crypto.randomUUID()}`;
  const runId = `pobj-run-${crypto.randomUUID()}`;
  const storageKey = `pobj/${access.userId}/${new Date(now).toISOString().slice(0, 10)}/${id}.${extension}`;
  const metadata = {
    schemaVersion: '1.0.0', ingestionMode: 'ASYNC_QUEUE', size: file.size,
    reviewRequired: true, official: false, contentTrust: 'UNTRUSTED', originalChannel: 'site',
  };

  await env.FILES.put(storageKey, bytes, {
    httpMetadata: { contentType: mime },
    customMetadata: { sha256: hash, contentTrust: 'UNTRUSTED', ingestionMode: 'ASYNC_QUEUE' },
  });
  try {
    await env.DB.batch([
      env.DB.prepare(`INSERT INTO documents (id, owner_id, source, source_message_id, original_name, mime_type, storage_key, content_hash, raw_text, status, received_at)
        VALUES (?, ?, 'pobj_mobile', ?, ?, ?, ?, ?, ?, 'received', ?)`).bind(id, access.userId, id, safeName(file.name), mime, storageKey, hash, JSON.stringify(metadata), now),
      env.DB.prepare(`INSERT INTO agent_runs (id, document_id, agent_role, status, input_summary, attempt_count, available_at)
        VALUES (?, ?, 'diretor', 'QUEUED', ?, 0, ?)`).bind(runId, id, `Arquivo ${safeName(file.name)} recebido; processamento assíncrono pendente.`, now),
      env.DB.prepare(`INSERT INTO audit_log (id, owner_id, actor, action, entity_type, entity_id, details_json, created_at)
        VALUES (?, ?, ?, 'ingested_and_enqueued', 'agent_run', ?, ?, ?)`).bind(
          `audit-${crypto.randomUUID()}`, access.userId, `chatgpt:${access.email}`, runId,
          JSON.stringify({ documentId: id, protocol: id, channel: 'site', hash, contentTrust: 'UNTRUSTED', externalEffectsAllowed: false }), now,
        ),
    ]);
  } catch (error) {
    await env.FILES.delete(storageKey);
    throw error;
  }

  return NextResponse.json({
    ok: true, queued: true, protocol: id, jobId: runId, processingState: 'RECEIVED',
    import: toImport({
      id, original_name: safeName(file.name), mime_type: mime, content_hash: hash,
      raw_text: JSON.stringify(metadata), status: 'received', received_at: now,
      job_id: runId, job_status: 'QUEUED', attempt_count: 0, last_error_code: null,
    }),
  }, { status: 202 });
}

type ImportRow = {
  id: string; original_name: string | null; mime_type: string | null; content_hash: string | null;
  raw_text: string | null; status: string; received_at: number; job_id: string | null;
  job_status: string | null; attempt_count: number | null; last_error_code: string | null;
};

function toImport(row: ImportRow) {
  let meta: Record<string, unknown> = {};
  try { meta = JSON.parse(row.raw_text ?? '{}') as Record<string, unknown>; } catch { /* legacy metadata may be invalid */ }
  return {
    id: row.id, protocol: row.id, jobId: row.job_id, name: row.original_name, mime: row.mime_type,
    hash: row.content_hash, status: row.status, documentStatus: row.status, jobStatus: row.job_status,
    processingState: publicProcessingState(row.status, row.job_status), attempts: row.attempt_count ?? 0,
    errorCode: row.last_error_code, receivedAt: new Date(row.received_at).toISOString(),
    competence: meta.competence ?? 'A identificar', baseDate: meta.baseDate ?? 'A identificar', size: meta.size,
    official: row.status === 'published', aiStatus: meta.aiStatus, aiAnalysis: meta.aiAnalysis,
    extractionStatus: meta.extractionStatus, totalPages: meta.totalPages,
    indicatorSuggestions: meta.indicatorSuggestions, approved: meta.approved ?? meta.localReview,
  };
}

function invalid(error: string) { return NextResponse.json({ ok: false, error }, { status: 400 }); }
function safeName(value: string) { return value.normalize('NFKC').replace(/[\\/\u0000-\u001f]/g, '_').slice(0, 120); }
function contentMatches(value: ArrayBuffer, mime: string) {
  const bytes = new Uint8Array(value); const starts = (signature: number[]) => signature.every((byte, index) => bytes[index] === byte);
  if (mime === 'application/pdf') return starts([0x25, 0x50, 0x44, 0x46, 0x2d]);
  if (mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return starts([0x50, 0x4b, 0x03, 0x04]);
  if (mime === 'application/vnd.ms-excel') return starts([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  return mime === 'text/csv' && !bytes.slice(0, Math.min(bytes.length, 8192)).includes(0);
}
async function sha256Hex(value: ArrayBuffer) {
  const digest = await crypto.subtle.digest('SHA-256', value);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
