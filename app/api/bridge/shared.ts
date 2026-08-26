import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';

export const BRIDGE_BODY_LIMIT = 2 * 1024 * 1024;
export const BRIDGE_LEASE_MS = 10 * 60 * 1000;
export const BRIDGE_MAX_ATTEMPTS = 3;

export async function requireBridge(request: Request) {
  if (env.BRIDGE_ENABLED !== 'true') {
    return NextResponse.json({ ok: false, error: 'bridge_disabled' }, { status: 503 });
  }
  if (!env.DB || !env.FILES || !env.BRIDGE_SHARED_SECRET) {
    return NextResponse.json({ ok: false, error: 'bridge_unavailable' }, { status: 503 });
  }
  const authorization = request.headers.get('authorization') ?? '';
  const supplied = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!supplied || !(await constantTimeEqual(supplied, env.BRIDGE_SHARED_SECRET))) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  return null;
}

export async function readBoundedJson(request: Request, limit = BRIDGE_BODY_LIMIT) {
  const contentType = request.headers.get('content-type')?.toLowerCase() ?? '';
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (!contentType.includes('application/json')) throw new RequestError('invalid_content_type', 415);
  if (Number.isFinite(declaredLength) && declaredLength > limit) throw new RequestError('request_too_large', 413);
  const bytes = await request.arrayBuffer();
  if (!bytes.byteLength || bytes.byteLength > limit) throw new RequestError('invalid_request_size', bytes.byteLength > limit ? 413 : 400);
  try { return JSON.parse(new TextDecoder().decode(bytes)) as unknown; }
  catch { throw new RequestError('invalid_json', 400); }
}

export function boundedString(value: unknown, max: number, pattern?: RegExp) {
  if (typeof value !== 'string') return '';
  const normalized = value.trim();
  if (!normalized || normalized.length > max || (pattern && !pattern.test(normalized))) return '';
  return normalized;
}

export async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export class RequestError extends Error {
  constructor(public readonly code: string, public readonly status: number) { super(code); }
}

export function requestErrorResponse(error: unknown) {
  if (error instanceof RequestError) return NextResponse.json({ ok: false, error: error.code }, { status: error.status });
  return NextResponse.json({ ok: false, error: 'bridge_failed' }, { status: 500 });
}

async function constantTimeEqual(left: string, right: string) {
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(left)),
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(right)),
  ]);
  const leftBytes = new Uint8Array(leftHash); const rightBytes = new Uint8Array(rightHash); let difference = 0;
  for (let index = 0; index < leftBytes.length; index += 1) difference |= leftBytes[index] ^ rightBytes[index];
  return difference === 0;
}
