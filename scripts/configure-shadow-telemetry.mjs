import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const secret = process.env.SHADOW_TELEMETRY_SECRET?.trim();
const endpoint = process.env.SHADOW_TELEMETRY_URL?.trim();
if (!secret || secret.length < 32 || !endpoint || !/^https:\/\//.test(endpoint)) throw new Error('SHADOW_TELEMETRY_CONFIGURATION_INVALID');
const path = new URL('../.env.local', import.meta.url);
const current = existsSync(path) ? readFileSync(path, 'utf8') : '';
const entries = new Map(current.split(/\r?\n/).filter(Boolean).map((line) => {
  const index = line.indexOf('=');
  return index > 0 ? [line.slice(0, index), line.slice(index + 1)] : [line, ''];
}));
entries.set('SHADOW_TELEMETRY_URL', endpoint);
entries.set('SHADOW_TELEMETRY_SECRET', secret);
writeFileSync(path, `${[...entries].map(([key, value]) => `${key}=${value}`).join('\n')}\n`, { encoding: 'utf8', mode: 0o600 });
console.log(JSON.stringify({ configured: true, endpoint, secret_fingerprint: createHash('sha256').update(secret).digest('hex').slice(0, 12) }));
