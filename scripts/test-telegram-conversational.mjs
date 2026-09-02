import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import process from 'node:process';

// Compatibility entrypoint for the canonical conversational regression test.
// The assertions remain in the PowerShell script so Windows and n8n operators
// can run the same checks without duplicating them.
const script = new URL('./test-telegram-conversational.ps1', import.meta.url);
const path = decodeURIComponent(script.pathname.replace(/^\//, ''));
if (!existsSync(path)) {
  console.error(`Missing test script: ${path}`);
  process.exit(1);
}

const shells = process.platform === 'win32' ? ['pwsh', 'powershell'] : ['pwsh'];
for (const shell of shells) {
  const result = spawnSync(shell, ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path], { stdio: 'inherit' });
  if (!result.error) process.exit(result.status ?? 1);
}

console.error('PowerShell 7 (pwsh) is required to run the conversational regression test.');
process.exit(1);
