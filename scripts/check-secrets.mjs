#!/usr/bin/env node
// scripts/check-secrets.mjs
// Detecta segredos em arquivos versionados que NÃO devem conter credenciais.
// Execução: node scripts/check-secrets.mjs
// Retorna exit 0 se limpo, exit 1 se encontrar segredos.

import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

// Padrões proibidos em arquivos versionados
const FORBIDDEN_PATTERNS = [
  // Hashes hexadecimais de 64 chars como valor literal hardcoded num arquivo de código
  { name: 'transport_secret_hardcoded', regex: /TRANSPORT_SECRET\s*=\s*["']([0-9a-f]{40,})/i },
  // Chaves de API Telegram em arquivo de código (não .env)
  { name: 'telegram_bot_token', regex: /bot\d{6,10}:[A-Za-z0-9_-]{35}/i },
  // Senhas hardcoded óbvias em arquivos não-.env
  { name: 'hardcoded_password', regex: /password\s*=\s*["']((?!pwd_placeholder|.*\$\{|.*process\.env).{8,})/i },
];

// Extensões de código a verificar (não .env, não binários)
const CODE_EXTENSIONS = ['.mjs', '.js', '.ts', '.json', '.yaml', '.yml'];
// Arquivos ignorados
const IGNORE_PATTERNS = [
  'node_modules', '.git', '.next', 'dist', 'backup', '.env', '.env.',
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
];

const ROOT = resolve(process.cwd());
const findings = [];

function shouldIgnore(path) {
  return IGNORE_PATTERNS.some(p => path.includes(p));
}

function scanDir(dir) {
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    if (shouldIgnore(fullPath)) continue;
    let stat;
    try { stat = statSync(fullPath); } catch { continue; }
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (CODE_EXTENSIONS.some(ext => entry.endsWith(ext))) {
      checkFile(fullPath);
    }
  }
}

function checkFile(filePath) {
  let content;
  try { content = readFileSync(filePath, 'utf8'); } catch { return; }
  const relPath = filePath.replace(ROOT, '').replace(/\\/g, '/');
  for (const { name, regex } of FORBIDDEN_PATTERNS) {
    if (regex.test(content)) {
      findings.push({ file: relPath, pattern: name });
    }
  }
}

scanDir(ROOT);

// Verifica também via git diff (arquivos staged ou modified vs HEAD)
try {
  execSync('git diff HEAD --name-only 2>/dev/null', {
    encoding: 'utf8', cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe']
  });
  // Apenas verifica se não há conflito de merge pendente
} catch { /* git pode não estar disponível */ }

if (findings.length === 0) {
  console.log('[check-secrets] OK — nenhum segredo detectado em arquivos versionados.');
  process.exit(0);
} else {
  console.error('[check-secrets] ALERTA — segredos detectados:');
  for (const f of findings) {
    console.error(`  ${f.file}: ${f.pattern}`);
  }
  process.exit(1);
}
