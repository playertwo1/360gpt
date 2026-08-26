import { NextResponse } from 'next/server';
import { env } from 'cloudflare:workers';
import { getChatGPTUser, isDashboardUserAllowed } from '../../../chatgpt-auth';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = await getChatGPTUser();
  if (!user) {
    return NextResponse.json({ available: false, error: 'authentication_required' }, { status: 401 });
  }
  if (!isDashboardUserAllowed(user)) {
    return NextResponse.json({ available: false, error: 'access_denied' }, { status: 403 });
  }

  const requestUrl = new URL(request.url);
  const tenantId = bounded(requestUrl.searchParams.get('tenant_id') ?? 'tenant-demo', 120);
  const subjectRef = bounded(requestUrl.searchParams.get('subject_ref') ?? 'cust-demo-001', 160);
  if (!tenantId || !subjectRef) {
    return NextResponse.json({ available: false, error: 'invalid_scope' }, { status: 400 });
  }

  try {
    if (!env.DB) throw new Error('storage_unavailable');
    const row = await env.DB.prepare(`SELECT state_id, state_version, event_id, correlation_id, state_hash, overall_status,
      snapshot_json, executive_assessment_json, generated_at FROM state_snapshots
      WHERE tenant_id = ? AND subject_ref = ? ORDER BY state_version DESC LIMIT 1`)
      .bind(tenantId, subjectRef).first<{
        state_id: string; state_version: number; event_id: string; correlation_id: string; state_hash: string;
        overall_status: string; snapshot_json: string; executive_assessment_json: string | null; generated_at: number;
      }>();
    if (!row) return NextResponse.json({ available: false, execution_mode: 'OFFLINE_EVAL', read_only: true, tenant_id: tenantId, subject_ref: subjectRef }, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
    return NextResponse.json({
      available: true, execution_mode: 'OFFLINE_EVAL', read_only: true,
      state_id: row.state_id, state_version: row.state_version, event_id: row.event_id, correlation_id: row.correlation_id,
      state_hash: row.state_hash, overall_status: row.overall_status, generated_at: new Date(row.generated_at).toISOString(),
      snapshot: JSON.parse(row.snapshot_json), executive_assessment: row.executive_assessment_json ? JSON.parse(row.executive_assessment_json) : null,
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json(
      { available: false, execution_mode: 'OFFLINE_EVAL', read_only: true, tenant_id: tenantId, subject_ref: subjectRef, error: 'hosted_read_model_unavailable' },
      { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
    );
  }
}

function bounded(value: string, max: number) {
  const normalized = value.trim();
  return normalized.length <= max ? normalized : '';
}
