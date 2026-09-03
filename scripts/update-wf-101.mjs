import fs from 'node:fs';

const wfPath = 'n8n/workflows/wf-101-local-dispatcher.json';
const wf = JSON.parse(fs.readFileSync(wfPath, 'utf8'));
const serialized = JSON.stringify(wf);

const forbidden = [
  /4075337d793cdb7fdf51fd3383918e232de65f81822ef8c74530e6b58c862cd8/i,
  /76,70\s*pontos/i,
  /16\s*indicadores\s*oficiais/i,
  /Agosto\/2026/i,
  /consolidados\s+e\s+persistidos/i,
  /Enfileirado\s+para\s+extra[cç][aã]o\s+ass[ií]ncrona/i,
  /Flywheel N2\.3[^\n]*ATIVO/i,
];

for (const pattern of forbidden) {
  if (pattern.test(serialized)) {
    throw new Error(`WF-101 rejeitado: conteúdo proibido pela quinta remediação (${pattern})`);
  }
}

const sendNode = wf.nodes?.find((node) => node.name === '05 Enviar pelo adaptador');
const secretExpression = sendNode?.parameters?.headerParameters?.parameters?.find(
  (header) => header.name === 'X-Director360-Transport',
)?.value;
if (secretExpression !== '={{$env.DIRECTOR360_TRANSPORT_SECRET}}') {
  throw new Error('WF-101 deve ler DIRECTOR360_TRANSPORT_SECRET apenas do ambiente do n8n');
}

if (wf.active !== false || wf.activeVersionId !== null) {
  throw new Error('WF-101 de remediação deve permanecer inativo até o cutover E2E');
}

const finishNode = wf.nodes?.find((node) => node.name === '06 Finalizar evento sem falso sucesso');
const finishSql = String(finishNode?.parameters?.query || '');
if (!finishSql.includes("CASE WHEN $4::text='COMPLETED'") || !finishSql.includes("ELSE 'FAILED'")) {
  throw new Error('WF-101 não possui finalização fail-closed por tipo de resultado');
}

console.log('WF-101 quinta remediação: contrato fail-closed validado; nenhuma mutação foi aplicada.');
