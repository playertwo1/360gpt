import fs from 'node:fs';
import assert from 'node:assert/strict';

const wf = JSON.parse(fs.readFileSync('n8n/workflows/wf-101-local-dispatcher.json', 'utf8'));
const src = JSON.stringify(wf);
const generator = fs.readFileSync('scripts/update-wf-101.mjs', 'utf8');

assert.equal(wf.active, false, 'WF-101 deve permanecer inativo durante a remediação');
assert.equal(wf.activeVersionId, null, 'WF-101 não pode estar publicado antes do cutover E2E');
assert.match(src, /\$env\.DIRECTOR360_TRANSPORT_SECRET/);
assert.doesNotMatch(src, /4075337d793cdb7fdf51fd3383918e232de65f81822ef8c74530e6b58c862cd8/i);
assert.doesNotMatch(generator, /const\s+TRANSPORT_SECRET\s*=\s*['"][a-f0-9]{32,}['"]/i);
assert.doesNotMatch(src, /76,70\s*pontos/i);
assert.doesNotMatch(src, /16\s*indicadores\s*oficiais/i);
assert.doesNotMatch(src, /Agosto\/2026/i);
assert.doesNotMatch(src, /consolidados\s+e\s+persistidos/i);
assert.doesNotMatch(src, /enfileirado\s+para\s+extra[cç][aã]o\s+ass[ií]ncrona/i);
assert.match(src, /DOCUMENT_PIPELINE_NOT_CUTOVER/);
assert.match(src, /Nenhum snapshot persistido foi encontrado/);
assert.match(src, /CASE WHEN \$4::text='COMPLETED' THEN 'COMPLETED' ELSE 'FAILED' END/);

const declaredCommands = src.match(/\/progresso|\/protocolo|\/pendencias|\/excluirultimo|\/reprocessartodos/g) || [];
assert.equal(declaredCommands.length, 0, 'WF-101 não deve anunciar comandos sem handler');

console.log('PASS wf101 fail-closed regression');
