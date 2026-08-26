import { NextResponse } from 'next/server';
import { getChatGPTUser, isDashboardUserAllowed, isReviewerAllowed, type ChatGPTUser } from '../../chatgpt-auth';

export const OPEN_REVIEW_STATUSES = ['PENDING_TRIAGE', 'ASSIGNED', 'IN_REVIEW', 'MORE_DATA_REQUIRED', 'ESCALATED'] as const;
export const REVIEW_DECISIONS = ['RESOLVED_CONFIRMED', 'RESOLVED_CORRECTED', 'RESOLVED_DISMISSED', 'MORE_DATA_REQUIRED', 'CONFIRM_SOURCE_A', 'CONFIRM_SOURCE_B'] as const;
export const NEXT_ACTIONS = ['TRIGGER_REPROCESS', 'DISMISS_DEPENDENTS', 'AWAIT_EXTERNAL_DATA', 'NO_ACTION_REQUIRED'] as const;

export type ReviewRequestRow = {
  review_request_id: string; event_id: string; tenant_id: string; correlation_id: string; state_id: string; state_version: number;
  reason_code: string; category: string; severity: string; review_priority: string; status: string; owner_queue: string;
  assigned_to: string | null; sla_policy_id: string; escalation_level: number; dedupe_key: string; duplicate_of: string | null;
  problem_statement: string; affected_scope_json: string; impact: string; required_decision: string;
  suggested_checks_json: string; reviewer_role: string; allowed_resolutions_json: string; due_at: number | null;
  created_at: number; completed_at: number | null;
};

export async function requireDashboardReader(): Promise<ChatGPTUser | NextResponse> {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ ok: false, error: 'authentication_required' }, { status: 401 });
  if (!isDashboardUserAllowed(user)) return NextResponse.json({ ok: false, error: 'access_denied' }, { status: 403 });
  return user;
}

export async function requireReviewer(): Promise<ChatGPTUser | NextResponse> {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ ok: false, error: 'authentication_required' }, { status: 401 });
  if (!isReviewerAllowed(user)) return NextResponse.json({ ok: false, error: 'reviewer_not_authorized' }, { status: 403 });
  return user;
}

export function isDenied(value: ChatGPTUser | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}

export function bounded(value: unknown, max: number, pattern?: RegExp): string {
  if (typeof value !== 'string') return '';
  const normalized = value.trim();
  if (!normalized || normalized.length > max || (pattern && !pattern.test(normalized))) return '';
  return normalized;
}

export function parseJsonArray(value: string): unknown[] {
  try { const parsed = JSON.parse(value) as unknown; return Array.isArray(parsed) ? parsed : []; } catch { return []; }
}

export function parseJsonObject(value: string): Record<string, unknown> {
  try { const parsed = JSON.parse(value) as unknown; return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {}; } catch { return {}; }
}

export function slaState(dueAt: number | null, createdAt: number, now = Date.now()) {
  if (!dueAt) return 'NO_DUE_DATE';
  if (now >= dueAt) return 'OVERDUE';
  const duration = Math.max(1, dueAt - createdAt);
  return (dueAt - now) / duration <= 0.25 ? 'DUE_SOON' : 'ON_TRACK';
}

export async function hashCanonical(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(canonicalize(value)));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return `sha256:${[...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')}`;
}

export function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right)).map(([key, entry]) => [key, canonicalize(entry)]));
  return value;
}
