import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const tenantId = bounded(requestUrl.searchParams.get('tenant_id') ?? 'tenant-demo', 120);
  const subjectRef = bounded(requestUrl.searchParams.get('subject_ref') ?? 'cust-demo-001', 160);
  if (!tenantId || !subjectRef) {
    return NextResponse.json({ available: false, error: 'invalid_scope' }, { status: 400 });
  }

  const configuredBase = process.env.VISAO360_N8N_URL?.trim();
  const baseUrl = configuredBase || 'http://127.0.0.1:5678';
  const endpoint = new URL('/webhook/visao-360/offline-latest-state', baseUrl);
  endpoint.searchParams.set('tenant_id', tenantId);
  endpoint.searchParams.set('subject_ref', subjectRef);

  try {
    const response = await fetch(endpoint, {
      headers: { 'X-Visao360-Test-Mode': 'OFFLINE_EVAL' },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`read_model_${response.status}`);
    return NextResponse.json(await response.json(), {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch {
    return NextResponse.json(
      { available: false, execution_mode: 'OFFLINE_EVAL', read_only: true, tenant_id: tenantId, subject_ref: subjectRef, error: 'local_read_model_unavailable' },
      { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
    );
  }
}

function bounded(value: string, max: number) {
  const normalized = value.trim();
  return normalized.length <= max ? normalized : '';
}
