import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const authModule = await import('../../chatgpt-auth');
  const user = await authModule.getChatGPTUser();
  if (!user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
  if (!authModule.isDashboardUserAllowed(user)) return NextResponse.json({ error: 'access_denied' }, { status: 403 });

  const state = await env.DB.prepare(`SELECT state_id, state_version, state_hash, overall_status, snapshot_json, executive_assessment_json, generated_at
    FROM state_snapshots WHERE tenant_id = 'tenant-owner' AND subject_ref = 'performance-owner'
    ORDER BY state_version DESC LIMIT 1`).first<{
      state_id: string; state_version: number; state_hash: string; overall_status: string;
      snapshot_json: string; executive_assessment_json: string | null; generated_at: number;
    }>();
  if (!state) return NextResponse.json({ available: false, read_only: true, message: 'Nenhum Estado 360 real foi persistido ainda.' }, { status: 404 });

  const snapshot = safeJson(state.snapshot_json);
  const assessment = state.executive_assessment_json ? safeJson(state.executive_assessment_json) : null;
  const nodes = await env.DB.prepare(`SELECT node_id, node_type, entity_id, content_hash, payload_json, recorded_at
    FROM evidence_nodes WHERE tenant_id = 'tenant-owner' AND (entity_id = ? OR payload_json LIKE ?)
    ORDER BY recorded_at ASC LIMIT 200`).bind(state.state_id, `%${state.state_id}%`).all<Record<string, unknown>>();

  return NextResponse.json({
    available: true,
    read_only: true,
    state: { id: state.state_id, version: state.state_version, hash: state.state_hash, status: state.overall_status, generated_at: new Date(state.generated_at).toISOString() },
    snapshot,
    executive_assessment: assessment,
    evidence_nodes: (nodes.results ?? []).map((node) => ({ ...node, payload: safeJson(String(node.payload_json ?? '{}')), payload_json: undefined })),
    limitation: (nodes.results ?? []).length ? null : 'Nenhum nó de evidência real foi vinculado a este Estado; o sistema não criará trilha demonstrativa.',
  }, { headers: { 'Cache-Control': 'private, no-store' } });
}

function safeJson(value: string) { try { return JSON.parse(value) as unknown; } catch { return {}; } }
