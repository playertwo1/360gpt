export type KnowledgeType = 'FIELD_MAPPING' | 'SCORING_RULE';
export type KnowledgeStatus = 'CANDIDATE' | 'OWNER_APPROVED' | 'ACTIVE' | 'CONTESTED' | 'SUPERSEDED' | 'REVOKED';

const FORBIDDEN_REUSABLE_KEYS = /^(meta|target|realizado|realized|achieved|value|valor|period|periodo|competencia|baseDate|currentPoints|targetPoints)$/i;

export function normalizeIndicatorKey(value: unknown) {
  return String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 80);
}

export function layoutSignature(indicators: Array<{ key: string; name: string; unit: string }>) {
  const canonical = indicators.map((item) => `${normalizeIndicatorKey(item.key)}:${normalizeIndicatorKey(item.name)}:${item.unit}`).sort().join('|');
  return `layout-v1:${canonical}`;
}

export function assertReusableKnowledge(content: unknown): asserts content is Record<string, unknown> {
  if (!content || typeof content !== 'object' || Array.isArray(content)) throw new Error('invalid_knowledge_content');
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) return value.forEach(walk);
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (FORBIDDEN_REUSABLE_KEYS.test(key)) throw new Error(`monthly_value_forbidden:${key}`);
      walk(child);
    }
  };
  walk(content);
}

export async function contentHash(content: unknown) {
  const bytes = new TextEncoder().encode(JSON.stringify(content));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return `sha256:${[...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')}`;
}

export function parseDocumentMeta(raw: string | null) {
  try { return JSON.parse(raw ?? '{}') as Record<string, unknown>; } catch { return {}; }
}
