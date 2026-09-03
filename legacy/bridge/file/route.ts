import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { boundedString, requireBridge } from '../shared';

export const runtime = 'edge';

export async function GET(request: Request) {
  const denied = await requireBridge(request); if (denied) return denied;
  const url = new URL(request.url);
  const jobId = boundedString(url.searchParams.get('job_id'), 160, /^[A-Za-z0-9._:-]+$/);
  const leaseToken = boundedString(request.headers.get('x-bridge-lease-token'), 80, /^[A-Za-z0-9-]+$/);
  if (!jobId || !leaseToken) return NextResponse.json({ ok: false, error: 'invalid_lease' }, { status: 400 });
  const row = await env.DB.prepare(`SELECT d.storage_key, d.mime_type, d.original_name FROM agent_runs ar JOIN documents d ON d.id = ar.document_id
    WHERE ar.id = ? AND ar.status = 'PROCESSING' AND ar.lease_token = ? AND ar.lease_expires_at >= ?`)
    .bind(jobId, leaseToken, Date.now()).first<{ storage_key: string | null; mime_type: string | null; original_name: string | null }>();
  if (!row?.storage_key) return NextResponse.json({ ok: false, error: 'lease_not_found' }, { status: 409 });
  const object = await env.FILES.get(row.storage_key);
  if (!object) return NextResponse.json({ ok: false, error: 'file_not_found' }, { status: 404 });
  return new Response(object.body, { headers: {
    'Content-Type': row.mime_type ?? 'application/octet-stream', 'Content-Length': String(object.size),
    'Content-Disposition': `attachment; filename="${safeHeaderFileName(row.original_name ?? 'documento')}"`, 'Cache-Control': 'private, no-store',
  } });
}

function safeHeaderFileName(value: string) { return value.replace(/[\r\n"\\]/g, '_').slice(0, 120); }
