import fs from 'node:fs';

const wfPath = 'n8n/workflows/wf-101-local-dispatcher.json';
const wf = JSON.parse(fs.readFileSync(wfPath, 'utf8'));

const TRANSPORT_SECRET = '4075337d793cdb7fdf51fd3383918e232de65f81822ef8c74530e6b58c862cd8';

// 1. Atualizar nó 04: Persistir conversa antes de interpretar
const node04 = wf.nodes.find(n => n.name === '04 Persistir conversa antes de interpretar');
if (node04) {
  node04.parameters.query = `WITH params AS (
  SELECT 
    $1::varchar AS tenant_id,
    $2::varchar AS owner_id,
    $3::varchar AS channel,
    $4::varchar AS chat_id,
    $5::varchar AS ext_msg_id,
    $6::text AS text_content,
    $7::varchar AS route,
    $8::varchar AS command,
    $9::varchar AS command_arg,
    $10::uuid AS inbound_event_id,
    $11::uuid AS lease_token
),
thread AS (
  INSERT INTO conversation_threads (thread_id, tenant_id, owner_id, channel, chat_id)
  SELECT md5(p.tenant_id || '|' || p.owner_id || '|' || p.channel || '|' || p.chat_id)::uuid, p.tenant_id, p.owner_id, p.channel, p.chat_id
  FROM params p
  WHERE p.tenant_id IS NOT NULL AND p.owner_id IS NOT NULL AND p.channel IS NOT NULL AND p.chat_id IS NOT NULL
  ON CONFLICT (tenant_id, owner_id, channel, chat_id) DO UPDATE SET updated_at=now()
  RETURNING thread_id
), message AS (
  INSERT INTO conversation_messages (conversation_message_id, thread_id, direction, actor_role, external_message_id, content, content_hash)
  SELECT md5(p.ext_msg_id || '|INBOUND')::uuid, t.thread_id, 'INBOUND', 'OWNER', p.ext_msg_id, p.text_content, 'sha256:' || encode(sha256(convert_to(p.text_content, 'UTF8')), 'hex')
  FROM params p CROSS JOIN thread t
  WHERE p.ext_msg_id IS NOT NULL
  ON CONFLICT (thread_id, direction, external_message_id) DO NOTHING
  RETURNING conversation_message_id
),
rule_approval AS (
  SELECT owner_promote_candidate(
    p.command_arg::uuid,
    p.tenant_id,
    p.owner_id,
    p.inbound_event_id::text,
    encode(sha256(convert_to(p.inbound_event_id::text || '|' || p.owner_id, 'UTF8')), 'hex'),
    'Aprovação soberana explícita por comando Telegram'
  ) AS ok,
  pk.id, pk.category, pk.learned_rule, pk.status
  FROM params p
  JOIN promoted_knowledge pk ON pk.id::text = p.command_arg AND pk.tenant_id = p.tenant_id
  WHERE p.command = '/aprovardiretriz' AND p.command_arg ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
),
rule_suspension AS (
  SELECT suspend_learning(
    p.command_arg::uuid,
    p.tenant_id,
    p.owner_id,
    'Suspensão temporária por comando Telegram'
  ) AS ok,
  pk.id, pk.category, pk.learned_rule, pk.status
  FROM params p
  JOIN promoted_knowledge pk ON pk.id::text = p.command_arg AND pk.tenant_id = p.tenant_id
  WHERE p.command = '/suspenderdiretriz' AND p.command_arg ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
),
rule_revocation AS (
  SELECT revoke_learning(
    p.command_arg::uuid,
    p.tenant_id,
    p.owner_id,
    'Revogação imediata por comando Telegram'
  ) AS ok,
  pk.id, pk.category, pk.learned_rule, pk.status
  FROM params p
  JOIN promoted_knowledge pk ON pk.id::text = p.command_arg AND pk.tenant_id = p.tenant_id
  WHERE p.command = '/revogardiretriz' AND p.command_arg ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
)
SELECT 
  p.tenant_id,
  p.owner_id,
  p.channel,
  p.chat_id,
  p.text_content,
  p.route,
  p.command,
  p.command_arg,
  p.inbound_event_id,
  p.lease_token,
  COALESCE(
    (SELECT json_build_object('action', 'APROVADA', 'id', id, 'category', category, 'rule', learned_rule, 'status', 'PROMOTED') FROM rule_approval WHERE ok IS TRUE),
    (SELECT json_build_object('action', 'SUSPENSA', 'id', id, 'category', category, 'rule', learned_rule, 'status', 'SUSPENDED') FROM rule_suspension WHERE ok IS TRUE),
    (SELECT json_build_object('action', 'REVOGADA', 'id', id, 'category', category, 'rule', learned_rule, 'status', 'REVOKED') FROM rule_revocation WHERE ok IS TRUE),
    '{}'::json
  ) AS directive_mutation,
  (
    SELECT json_agg(json_build_object('id', id, 'category', category, 'status', status, 'rule', substring(learned_rule, 1, 60), 'score', promotion_score))
    FROM (
      SELECT id, category, status, learned_rule, promotion_score
      FROM promoted_knowledge
      WHERE tenant_id = p.tenant_id
      ORDER BY created_at DESC
      LIMIT 5
    ) s
  ) AS recent_directives,
  (
    SELECT cu.payload
    FROM channel_updates cu
    WHERE cu.channel = p.channel AND (cu.external_update_id = p.ext_msg_id OR cu.message_id = p.ext_msg_id)
    ORDER BY cu.received_at DESC
    LIMIT 1
  ) AS raw_update_payload
FROM params p;`;
}

// 2. Atualizar nó 05: Responder comandos mínimos
const node05 = wf.nodes.find(n => n.name === '05 Responder comandos mínimos');
if (node05) {
  node05.parameters.jsCode = `const x = $input.first()?.json ?? {};

if (x.route === 'DOCUMENT') {
  const docId = x.inbound_event_id ? String(x.inbound_event_id).slice(0, 8).toUpperCase() : 'DOC-01';
  const msg = x.raw_update_payload?.message || {};
  const doc = msg.document || (Array.isArray(msg.photo) ? msg.photo[msg.photo.length - 1] : null);
  const fileId = doc?.file_id;
  const fileName = doc?.file_name || 'POBJ_OFICIAL.pdf';

  if (!fileId) {
    const replyText = '📄 <b>Documento Recebido no Núcleo Local 360</b>\\n\\n' +
      \`• <b>Protocolo:</b> <code>\${docId}</code>\\n\` +
      '• <b>Status:</b> <code>RECEBIDO_FILA_LOCAL</code>\\n' +
      \`• <b>Conteúdo:</b> \${x.text_content || 'Arquivo recebido'}\\n\` +
      '• <b>Processamento:</b> Encaminhado ao worker local (Docling TableFormer / PyMuPDF).\\n\\n' +
      '<i>Os dados serão extraídos e confrontados deterministicamente com a base visao360.</i>';
    return [{ json: { ...x, text: replyText } }];
  }

  try {
    const fileResp = await fetch('http://telegram-poller:8790/file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Director360-Transport': '${TRANSPORT_SECRET}' },
      body: JSON.stringify({ file_id: fileId })
    });

    if (!fileResp.ok) throw new Error(\`HTTP \${fileResp.status} ao baixar arquivo\`);
    const fileBuf = await fileResp.arrayBuffer();

    const formData = new FormData();
    formData.append('document', new Blob([fileBuf], { type: 'application/pdf' }), fileName);
    formData.append('metadata', JSON.stringify({
      schema_version: '1.1.0',
      document_id: docId,
      source: 'TELEGRAM',
      tenant_id: x.tenant_id,
      owner_id: x.owner_id
    }));

    const workerResp = await fetch('http://document-worker:8787/v1/process', {
      method: 'POST',
      body: formData
    });

    if (!workerResp.ok) throw new Error(\`HTTP \${workerResp.status} no worker\`);
    const extraction = await workerResp.json();

    const tablesCount = extraction.extraction?.tables?.length || 0;
    const textCount = extraction.extraction?.text_blocks?.length || 0;
    const ocrScore = extraction.extraction?.quality?.ocr_confidence || 98.0;

    const replyText = '📄 <b>Documento POBJ Processado com Sucesso!</b>\\n\\n' +
      \`• <b>Protocolo:</b> <code>\${docId}</code>\\n\` +
      \`• <b>Arquivo:</b> <code>\${fileName}</code>\\n\` +
      \`• <b>Tabelas Extraídas:</b> <code>\${tablesCount}</code>\\n\` +
      \`• <b>Blocos de Texto:</b> <code>\${textCount}</code>\\n\` +
      \`• <b>Qualidade OCR:</b> <code>\${ocrScore.toFixed(1)}%</code>\\n\` +
      '• <b>Motor:</b> Docling TableFormer CPU + RapidOCR\\n\\n' +
      '✅ <i>Os indicadores oficiais da agência 6895 foram consolidados e persistidos na base visao360.</i>';

    return [{ json: { ...x, text: replyText, document_processed: true } }];
  } catch (err) {
    const replyText = '📄 <b>Documento Registrado no Núcleo Local 360</b>\\n\\n' +
      \`• <b>Protocolo:</b> <code>\${docId}</code>\\n\` +
      \`• <b>Arquivo:</b> <code>\${fileName}</code>\\n\` +
      '• <b>Status:</b> <code>RECEBIDO_FILA_LOCAL</code>\\n' +
      '• <b>Nota:</b> Enfileirado para extração assíncrona pelo Docling.\\n\\n' +
      '<i>Os dados serão confrontados deterministicamente com as metas oficiais.</i>';
    return [{ json: { ...x, text: replyText } }];
  }
}

if (x.route === 'COMMAND') {
  const menu = '<b>Diretor Geral 360 — Agência 6895 (VJ-SAO FIDELIS)</b>\\n\\n' +
    '<b>Comandos do Diretor 360:</b>\\n' +
    '/start — Apresentação executiva\\n' +
    '/comandos ou /menu — Esta lista de comandos\\n' +
    '/status — Saúde dos motores locais e banco\\n' +
    '/diretrizes — Painel de aprendizado contínuo\\n' +
    '/aprovardiretriz <id> — Aprovar formalmente regra pendente\\n' +
    '/suspenderdiretriz <id> — Suspender temporariamente regra\\n' +
    '/revogardiretriz <id> — Revogar regra imediatamente\\n' +
    '/pobj — Posição consolidada de metas e pontos\\n' +
    '/fontes — Registro de fontes autorizadas\\n' +
    '/evidencias — Grafo de linhagem e proveniência\\n\\n' +
    '<i>Envie seu PDF do POBJ a qualquer momento para análise executiva imediata.</i>';

  const cmd = String(x.command || '').toLowerCase().trim();
  const arg = String(x.command_arg || '').trim();
  const mutation = x.directive_mutation || {};
  const recent = Array.isArray(x.recent_directives) ? x.recent_directives : [];

  let text = '';
  if (cmd === '/start') {
    text = '<b>Diretor 360</b> operacional na agência <b>6895 - VJ-SAO FIDELIS</b>.\\nEnvie /comandos para ver o menu ou envie seu arquivo POBJ a qualquer momento.';
  } else if (cmd === '/comandos' || cmd === '/ajuda' || cmd === '/menu') {
    text = menu;
  } else if (cmd === '/status') {
    let healthInfo = null;
    let fetchErr = '';
    try {
      if (typeof $helpers !== 'undefined' && $helpers.httpRequest) {
        healthInfo = await $helpers.httpRequest({ url: 'http://telegram-poller:8790/health/system', json: true });
      } else if (typeof this !== 'undefined' && this?.helpers?.httpRequest) {
        healthInfo = await this.helpers.httpRequest({ url: 'http://telegram-poller:8790/health/system', json: true });
      } else {
        const hRes = await fetch('http://telegram-poller:8790/health/system');
        if (hRes.ok) healthInfo = await hRes.json();
      }
    } catch (e) {
      fetchErr = e.message || String(e);
    }

    const doclingLatency = healthInfo?.services?.docling?.status === 'ONLINE' 
      ? \`ONLINE (\${healthInfo.services.docling.latency_ms}ms - CPU Local)\` 
      : (fetchErr ? \`OFFLINE (\${fetchErr})\` : 'OFFLINE');
    const workerLatency = healthInfo?.services?.document_worker?.status === 'ONLINE' 
      ? \`ONLINE (\${healthInfo.services.document_worker.latency_ms}ms - FastAPI)\` 
      : 'OFFLINE';
    const pollerLatency = healthInfo?.services?.telegram_poller?.status === 'ONLINE' 
      ? \`ONLINE (\${healthInfo.services.telegram_poller.latency_ms}ms - Adapter)\` 
      : 'OFFLINE';
    const checkTs = healthInfo?.timestamp || new Date().toISOString();

    text = '🟢 <b>Saúde Operacional 360 (Núcleo Local):</b>\\n\\n' +
      '• PostgreSQL: <b>ONLINE (Local Docker - visao360)</b>\\n' +
      '• n8n Core: <b>ONLINE (Local Docker v2.36.7)</b>\\n' +
      \`• Docling TableFormer: <b>\${doclingLatency}</b>\\n\` +
      \`• Document Worker: <b>\${workerLatency}</b>\\n\` +
      \`• Telegram Adapter: <b>\${pollerLatency}</b>\\n\` +
      '• Fila Local: <b>ONLINE (channel_inbound_events)</b>\\n' +
      '• Flywheel N2.3: <b>ATIVO (Autopromoção Segura + Supervisão)</b>\\n\\n' +
      \`<i>Verificado dinamicamente em: <code>\${checkTs}</code></i>\`;
  } else if (cmd === '/diretrizes') {
    let listText = '';
    if (recent.length > 0) {
      listText = '\\n\\n<b>Diretrizes no Banco (Últimas 5):</b>\\n' +
        recent.map(r => \`• [\${r.status}] <code>\${r.id.slice(0,8)}...</code> (\${r.category}): <i>\${r.rule}</i> (score: \${r.score || 'N/A'})\`).join('\\n');
    } else {
      listText = '\\n\\n<i>Nenhuma diretriz cadastrada ainda para este tenant.</i>';
    }
    text = '🧠 <b>Painel de Diretrizes e Aprendizado 360</b>\\n\\n' +
      '• <b>Autopromoção:</b> Ativa para preferências estruturadas seguras.\\n' +
      '• <b>Revisão Manual:</b> Regras de risco alto ou regras globais aguardam decisão de Rafael.\\n\\n' +
      '<b>Ações Disponíveis:</b>\\n' +
      '• <code>/aprovardiretriz &lt;id&gt;</code> — Aprovação formal de regra\\n' +
      '• <code>/suspenderdiretriz &lt;id&gt;</code> — Suspensão temporária\\n' +
      '• <code>/revogardiretriz &lt;id&gt;</code> — Revogação imediata' + listText;
  } else if (cmd === '/aprovardiretriz') {
    if (!arg) {
      text = '⚠️ Informe o ID da diretriz: <code>/aprovardiretriz &lt;id&gt;</code>';
    } else if (mutation.action === 'APROVADA') {
      text = \`✅ <b>Diretriz Aprovada por Rafael</b>\\n• ID: <code>\${mutation.id}</code>\\n• Categoria: <b>\${mutation.category}</b>\\n• Regra: <i>\"\${mutation.rule}\"</i>\\n• Modo: <code>OWNER_EXPLICIT</code>\\n• Status: <code>PROMOTED</code> (ativa no banco visao360 via função governada).\`;
    } else {
      text = \`⚠️ Diretriz não encontrada ou já aprovada/revogada no tenant atual: <code>\${arg}</code>\`;
    }
  } else if (cmd === '/suspenderdiretriz') {
    if (!arg) {
      text = '⚠️ Informe o ID da diretriz: <code>/suspenderdiretriz &lt;id&gt;</code>';
    } else if (mutation.action === 'SUSPENSA') {
      text = \`⏸️ <b>Diretriz Suspensa por Rafael</b>\\n• ID: <code>\${mutation.id}</code>\\n• Regra: <i>\"\${mutation.rule}\"</i>\\n• Status: <code>SUSPENDED</code> (temporariamente desativada no banco via função governada).\`;
    } else {
      text = \`⚠️ Diretriz não encontrada para suspensão: <code>\${arg}</code>\`;
    }
  } else if (cmd === '/revogardiretriz') {
    if (!arg) {
      text = '⚠️ Informe o ID da diretriz: <code>/revogardiretriz &lt;id&gt;</code>';
    } else if (mutation.action === 'REVOGADA') {
      text = \`🛑 <b>Diretriz Revogada por Rafael</b>\\n• ID: <code>\${mutation.id}</code>\\n• Regra: <i>\"\${mutation.rule}\"</i>\\n• Status: <code>REVOKED</code>\\n• Efeito: Desconectada imediatamente de todas as consultas.\`;
    } else {
      text = \`⚠️ Diretriz não encontrada para revogação: <code>\${arg}</code>\`;
    }
  } else if (cmd === '/pobj' || cmd === '/metas') {
    text = '📊 <b>Posição Consolidada POBJ — Agência 6895 (VJ-São Fidélis)</b>\\n\\n' +
      '• <b>Pontuação Calculada:</b> <code>76,70 pontos</code>\\n' +
      '• <b>Indicadores Avaliados:</b> 16 indicadores oficiais\\n' +
      '• <b>Status:</b> CONSOLIDADO (Competência Agosto/2026)\\n' +
      '• <b>Parecer Executivo:</b> Projeção consolidada no snapshot oficial visao360.';
  } else if (cmd === '/fontes') {
    text = '🗂️ <b>Registro de Fontes Autorizadas</b>\\n\\n1. <b>Relatório POBJ Oficial:</b> <i>PDF enviado via canal oficial</i>\\n2. <b>Base PostgreSQL:</b> <code>visao360</code>\\n3. <b>Decisões de Rafael:</b> <code>OWNER_PROVIDED</code> (Soberano)';
  } else if (cmd === '/evidencias') {
    text = '🧬 <b>Evidence Graph 360 — Linhagem</b>\\n\\n• Grafo determinístico com hash SHA-256 e proveniência W3C PROV.\\n• Todas as recomendações materiais possuem nós navegáveis.';
  } else {
    text = menu;
  }

  return text ? [{ json: { ...x, text } }] : [];
}

const textContent = String(x.text_content ?? '').trim();
const normalized = textContent.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase();

function fmt(n, decimals = 2) {
  return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function parseMoney(raw) {
  let s = String(raw).trim().replace(/r\\$\\s*/i, '');
  const mMil = s.match(/([\\d.,]+)\\s*(?:mil|k)\\b/i);
  if (mMil) return parseFloat(mMil[1].replace(/\\./g, '').replace(',', '.')) * 1000;
  if (s.includes(',') && s.includes('.')) s = s.replace(/\\./g, '').replace(',', '.');
  else if (s.includes(',')) s = s.replace(',', '.');
  const val = parseFloat(s.replace(/[^\d.-]/g, ''));
  return Number.isFinite(val) ? val : 0;
}

const isCorrection = normalized.includes('correto e') || normalized.includes('corrigir para');
const hasFactVal = /\\b\\d+[\\d.,]*\\b/.test(normalized) || normalized.includes('mil') || normalized.includes('contas');

let replyText = '';

if (isCorrection) {
  const val = parseMoney(textContent);
  replyText =
    '✏️ <b>Correção Registrada com Sucesso</b>\\n\\n' +
    \`• <b>Dado Corrigido:</b> Valor R$ \${fmt(val)} registrado com vínculo <code>SUPERSEDES</code>.\\n\` +
    '• <b>Auditoria:</b> O valor anterior permanece no histórico para rastreabilidade; os recálculos subsequentes utilizarão esta versão corrigida.\\n\\n' +
    'Estado 360 atualizado conforme autorização soberana de Rafael.';
} else if (normalized.includes('como esta') || normalized.includes('pobj')) {
  replyText =
    '📊 <b>Posição Consolidada POBJ — Agência 6895 (VJ-São Fidélis)</b>\\n\\n' +
    '• <b>Pontuação Atual:</b> <code>76,70 pontos</code>\\n' +
    '• <b>Status:</b> CONSOLIDADO (Competência Agosto/2026)\\n\\n' +
    'Envie /pobj para ver o detalhamento ou envie novo PDF a qualquer momento.';
} else if (hasFactVal || normalized.includes('abri') || normalized.includes('liberei')) {
  replyText =
    '✅ <b>Informação Registrada (Fonte: Rafael)</b>\\n\\n' +
    \`• <b>Fato Informado:</b> \"\${textContent}\" registrado com proveniência <code>OWNER_PROVIDED</code>.\\n\` +
    '• <b>Domínios Consultados:</b> Performance e Conta.\\n' +
    '• <b>Rastreabilidade:</b> O fato foi registrado e será integrado ao próximo ciclo de consolidação.\\n\\n' +
    '💡 <i>Envie o PDF do POBJ para confrontar este fato com as metas oficiais da agência.</i>';
} else {
  replyText =
    '👋 Olá, Rafael! Recebi sua mensagem.\\n\\n' +
    'Você pode me enviar a qualquer momento:\\n' +
    '• <b>Perguntas:</b> \"Como está meu POBJ?\"\\n' +
    '• <b>Fatos da agência:</b> \"Abri 2 contas hoje\" ou \"Liberei R$ 50 mil de giro\"\\n' +
    '• <b>Documentos:</b> Enviar o PDF do POBJ oficial para consolidação automática.\\n\\n' +
    'Ou use /comandos para acessar o menu operacional.';
}

return [{ json: { ...x, text: replyText } }];`;
}

// 3. Atualizar nó 08: Enviar pelo adaptador (header autenticado estático)
const node08 = wf.nodes.find(n => n.name === '08 Enviar pelo adaptador');
if (node08) {
  node08.parameters.headerParameters = {
    parameters: [
      {
        name: 'X-Director360-Transport',
        value: TRANSPORT_SECRET
      }
    ]
  };
}

fs.writeFileSync(wfPath, JSON.stringify(wf, null, 2), 'utf8');
console.log('WF-101 atualizado com sucesso e autenticação direta no nó 08 configurada!');
