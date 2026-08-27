import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { isDenied, requireDashboardReader } from '../../reviews/shared';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string[]> = {
  'application/pdf': ['pdf'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
  'application/vnd.ms-excel': ['xls'],
  'text/csv': ['csv'],
};

export async function GET() {
  const access = await requireDashboardReader();
  if (isDenied(access)) return access;
  const result = await env.DB.prepare(`SELECT id, original_name, mime_type, content_hash, raw_text, status, received_at
    FROM documents WHERE owner_id = ? AND source = 'pobj_mobile' ORDER BY received_at DESC LIMIT 10`)
    .bind(access.userId).all<ImportRow>();
  return NextResponse.json({ ok: true, imports: (result.results ?? []).map(toImport) }, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(request: Request) {
  const access = await requireDashboardReader();
  if (isDenied(access)) return access;
  if (!env.DB || !env.FILES) return NextResponse.json({ ok: false, error: 'storage_unavailable' }, { status: 503 });

  let form: FormData;
  try { form = await request.formData(); } catch { return invalid('invalid_form'); }
  const file = form.get('file');
  const competence = String(form.get('competence') ?? '').trim();
  const baseDate = String(form.get('baseDate') ?? '').trim();
  if (!(file instanceof File)) return invalid('file_required');
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(competence)) return invalid('invalid_competence');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(baseDate) || Number.isNaN(Date.parse(`${baseDate}T00:00:00Z`))) return invalid('invalid_base_date');
  if (!file.size || file.size > MAX_FILE_BYTES) return NextResponse.json({ ok: false, error: 'invalid_file_size' }, { status: 413 });

  const mime = file.type.toLowerCase();
  const extension = file.name.toLowerCase().split('.').pop() ?? '';
  if (!(ALLOWED_TYPES[mime] ?? []).includes(extension)) return NextResponse.json({ ok: false, error: 'file_type_not_allowed' }, { status: 415 });

  const bytes = await file.arrayBuffer();
  if (!contentMatches(bytes, mime)) return invalid('file_content_mismatch');
  const hash = `sha256:${await sha256Hex(bytes)}`;
  const now = Date.now();
  const id = `pobj-${crypto.randomUUID()}`;
  const storageKey = `pobj/${access.userId}/${new Date(now).toISOString().slice(0, 10)}/${id}.${extension}`;
  const metadata = { competence, baseDate, size: file.size, reviewRequired: true, official: false };

  await env.FILES.put(storageKey, bytes, {
    httpMetadata: { contentType: mime },
    customMetadata: { sha256: hash, competence, baseDate, contentTrust: 'UNTRUSTED' },
  });
  try {
    await env.DB.batch([
      env.DB.prepare(`INSERT INTO documents (id, owner_id, source, original_name, mime_type, storage_key, content_hash, raw_text, status, received_at)
        VALUES (?, ?, 'pobj_mobile', ?, ?, ?, ?, ?, 'pending_validation', ?)`).bind(id, access.userId, safeName(file.name), mime, storageKey, hash, JSON.stringify(metadata), now),
      env.DB.prepare(`INSERT INTO audit_log (id, owner_id, actor, action, entity_type, entity_id, details_json, created_at)
        VALUES (?, ?, ?, 'pobj_received', 'document', ?, ?, ?)`).bind(`audit-${crypto.randomUUID()}`, access.userId, `chatgpt:${access.email}`, id, JSON.stringify({ ...metadata, hash }), now),
    ]);
  } catch (error) {
    await env.FILES.delete(storageKey);
    throw error;
  }

  return NextResponse.json({ ok: true, import: { id, name: safeName(file.name), mime, hash, competence, baseDate, size: file.size, status: 'pending_validation', receivedAt: new Date(now).toISOString(), official: false } }, { status: 202 });
}

type ImportRow = { id: string; original_name: string | null; mime_type: string | null; content_hash: string | null; raw_text: string | null; status: string; received_at: number };
function toImport(row: ImportRow) {
  let meta: Record<string, unknown> = {};
  try { meta = JSON.parse(row.raw_text ?? '{}') as Record<string, unknown>; } catch { /* metadata remains empty */ }
  return { id: row.id, name: row.original_name, mime: row.mime_type, hash: row.content_hash, status: row.status, receivedAt: new Date(row.received_at).toISOString(), competence: meta.competence, baseDate: meta.baseDate, size: meta.size, official: false };
}
function invalid(error: string) { return NextResponse.json({ ok: false, error }, { status: 400 }); }
function safeName(value: string) { return value.normalize('NFKC').replace(/[\\/\u0000-\u001f]/g, '_').slice(0, 120); }
function contentMatches(value: ArrayBuffer, mime: string) {
  const bytes = new Uint8Array(value); const starts = (s: number[]) => s.every((b, i) => bytes[i] === b);
  if (mime === 'application/pdf') return starts([0x25, 0x50, 0x44, 0x46, 0x2d]);
  if (mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return starts([0x50, 0x4b, 0x03, 0x04]);
  if (mime === 'application/vnd.ms-excel') return starts([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  return mime === 'text/csv' && !bytes.slice(0, Math.min(bytes.length, 8192)).includes(0);
}
async function sha256Hex(value: ArrayBuffer) { const digest = await crypto.subtle.digest('SHA-256', value); return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join(''); }
