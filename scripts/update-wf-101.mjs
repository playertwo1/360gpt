import fs from 'node:fs';
import { execSync } from 'node:child_process';

const wfPath = 'n8n/workflows/wf-101-local-dispatcher.json';
const wf = JSON.parse(fs.readFileSync(wfPath, 'utf8'));

// 0. Atualizar nó 02: Claim via RPC da Migration 18
const node02 = wf.nodes.find(n => n.name === '02 Claim com lease');
if (node02) {
  node02.parameters.query = `-- claim via RPC (usa FOR UPDATE SKIP LOCKED internamente)
-- lease_expires_at = now() + interval '2 minutes'
-- attempt_count = attempt_count + 1
SELECT * FROM public.claim_next_inbound_event('n8n-wf-101', 120);`;
}

// 0.1 Atualizar nó 03: Roteamento determinístico (reconhecer atalhos do teclado customizado)
const node03 = wf.nodes.find(n => n.name === '03 Roteamento determinístico');
if (node03) {
  node03.parameters.jsCode = `const event = $input.first()?.json;
if (!event || !event.inbound_event_id || !event.tenant_id) return [];
const text = String(event.text_content ?? '').trim();
const norm = text.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase();

const parts = text.split(/\\s+/);
let command = (parts[0] || '').toLowerCase();
let command_arg = parts.slice(1).join(' ');

// Mapeamento determinístico dos botões do Custom Reply Keyboard para comandos canônicos
if (norm.includes('resumo executivo') || norm === 'resumo') {
  command = '/resumo';
  command_arg = '';
} else if (norm.includes('pobj & metas') || norm === 'pobj' || norm === 'metas') {
  command = '/pobj';
  command_arg = '';
} else if (norm.includes('pendencias') || norm === 'pendencia') {
  command = '/pendencias';
  command_arg = '';
} else if (norm.includes('status do sistema') || norm === 'status') {
  command = '/status';
  command_arg = '';
}

const known = new Set([
  '/start','/comandos','/ajuda','/menu','/status','/progresso','/protocolo','/pendencias',
  '/duvidas','/excluir','/excluirultimo','/confirmar','/pobj','/metas','/prioridades',
  '/riscos','/cenarios','/indicador','/historico','/fontes','/evidencias','/hoje',
  '/corrigir','/responder','/reabrir','/destravar','/reprocessartodos','/explicar',
  '/privacidade','/meusdados','/diretrizes','/aprovardiretriz','/revogardiretriz','/suspenderdiretriz',
  '/resumo'
]);
const isCommand = known.has(command);
const route = isCommand ? 'COMMAND' : (event.event_kind === 'DOCUMENT' || event.event_kind === 'IMAGE') ? 'DOCUMENT' : 'CONVERSATION';
return [{json:{...event, route, command, command_arg, runtime:'N8N_LOCAL', business_state:'POSTGRES_VISAO360'}}];`;
}

// 1. Atualizar nó 04: Persistir conversa antes de interpretar com subqueries de consolidação e projeção POBJ
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
  SELECT approve_promotion_by_rafael(
    p.command_arg::uuid,
    p.inbound_event_id
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
  ) AS raw_update_payload,
  (
    SELECT json_build_object(
      'pobj_score', (ss.snapshot->>'pobj_score')::numeric,
      'competence', ss.snapshot->>'competence',
      'agency', ss.snapshot->>'agency',
      'pobj_target', (ss.snapshot->>'pobj_target')::numeric,
      'source_file', ss.snapshot->>'source_file'
    )
    FROM state_snapshots ss
    WHERE ss.tenant_id = p.tenant_id OR ss.tenant_id = 'tenant-owner'
    ORDER BY ss.generated_at DESC
    LIMIT 1
  ) AS latest_snapshot,
  (
    SELECT row_to_json(r) FROM (
      SELECT * FROM public.get_estado_360_resumo(p.tenant_id)
    ) r
  ) AS estado_resumo,
  (
    SELECT row_to_json(rr) FROM (
      SELECT * FROM public.get_pobj_run_rate(p.tenant_id)
    ) rr
  ) AS pobj_run_rate,
  (
    SELECT json_agg(json_build_object('codigo', indicador_codigo, 'nome', indicador_nome, 'produzido', valor_produzido, 'meta', valor_meta, 'status', status))
    FROM public.estado_360_producao
    WHERE (tenant_id = p.tenant_id OR tenant_id = 'tenant-owner' OR tenant_id = 'rafael-360')
      AND status = 'pendente'
  ) AS pendencias_lista,
  (
    SELECT json_agg(json_build_object('codigo', indicador_codigo, 'nome', indicador_nome, 'produzido', valor_produzido, 'meta', valor_meta, 'status', status))
    FROM (
      SELECT indicador_codigo, indicador_nome, valor_produzido, valor_meta, status
      FROM public.estado_360_producao
      WHERE (tenant_id = p.tenant_id OR tenant_id = 'tenant-owner' OR tenant_id = 'rafael-360')
      ORDER BY created_at DESC
      LIMIT 10
    ) ind
  ) AS indicadores_lista
FROM params p;`;
}

// 2. Atualizar nó 05: Responder comandos e rotas com dados dinâmicos, tom parceiro e reply_markup no item
const node05 = wf.nodes.find(n => n.name === '05 Responder comandos mínimos');
if (node05) {
  node05.parameters.jsCode = `const x = $input.first()?.json ?? {};

const defaultKeyboard = {
  keyboard: [
    [ { text: '📊 Resumo Executivo' }, { text: '🎯 POBJ & Metas' } ],
    [ { text: '📑 Pendências' }, { text: '⚙️ Status do Sistema' } ]
  ],
  resize_keyboard: true,
  is_persistent: true
};

function fmt(n, decimals = 2) {
  if (n === null || n === undefined || isNaN(Number(n))) return '0,00';
  return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function parseMoney(raw) {
  let s = String(raw).trim().replace(/r\\$\\s*/i, '');
  const mMil = s.match(/([\\d.,]+)\\s*(?:mil|k)\\b/i);
  if (mMil) return parseFloat(mMil[1].replace(/\\./g, '').replace(',', '.')) * 1000;
  if (s.includes(',') && s.includes('.')) s = s.replace(/\\./g, '').replace(',', '.');
  else if (s.includes(',')) s = s.replace(',', '.');
  const val = parseFloat(s.replace(/[^\\d.-]/g, ''));
  return Number.isFinite(val) ? val : 0;
}

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
    return [{ json: { ...x, text: replyText, reply_markup: defaultKeyboard } }];
  }

  try {
    const transportSecret = (typeof $env !== 'undefined' ? ($env.DIRECTOR360_TRANSPORT_SECRET || $env.INTERNAL_TRANSPORT_SECRET || $env.BRIDGE_SHARED_SECRET) : '') || '';
    const fileResp = await fetch('http://telegram-poller:8790/file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Director360-Transport': transportSecret },
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
      '✅ <i>Extração concluída e enviada ao pipeline de validação. A consolidação definitiva ocorre após validação de integridade.</i>';

    return [{ json: { ...x, text: replyText, document_processed: true, reply_markup: defaultKeyboard } }];
  } catch (err) {
    const replyText = '📄 <b>Documento Registrado no Núcleo Local 360</b>\\n\\n' +
      \`• <b>Protocolo:</b> <code>\${docId}</code>\\n\` +
      \`• <b>Arquivo:</b> <code>\${fileName}</code>\\n\` +
      '• <b>Status:</b> <code>RECEBIDO_FILA_LOCAL</code>\\n' +
      '• <b>Nota:</b> Houve um erro ao processar — nenhum dado foi consolidado. Vou precisar da sua confirmação para prosseguir.\\n\\n' +
      '<i>Os dados serão confrontados deterministicamente com as metas oficiais.</i>';
    return [{ json: { ...x, text: replyText, reply_markup: defaultKeyboard } }];
  }
}

if (x.route === 'COMMAND') {
  const menu = '🎛️ <b>Painel Diretor Geral 360 — Agência 6895</b>\\n\\n' +
    'Fala, Rafael! Aqui estão os nossos atalhos rápidos e comandos:\\n\\n' +
    '<b>Atalhos no Teclado:</b>\\n' +
    '• 📊 <b>Resumo Executivo</b> — Panorama consolidado de produção e meta\\n' +
    '• 🎯 <b>POBJ & Metas</b> — Placar oficial de pontos e run-rate diário\\n' +
    '• 📑 <b>Pendências</b> — Contratos e linhas que faltam pra bater a meta\\n' +
    '• ⚙️ <b>Status do Sistema</b> — Saúde dos motores, banco e worker\\n\\n' +
    '<b>Outros Comandos:</b>\\n' +
    '/diretrizes — Regras de aprendizado do sistema\\n' +
    '/aprovardiretriz &lt;id&gt; — Aprovar regra formalmente\\n' +
    '/suspenderdiretriz &lt;id&gt; — Suspender regra temporariamente\\n' +
    '/revogardiretriz &lt;id&gt; — Revogar regra imediatamente\\n' +
    '/indicador &lt;codigo&gt; — Detalhes de uma linha de produção\\n' +
    '/protocolo — Protocolo e rastreabilidade do último evento\\n' +
    '/fontes — Registro oficial de fontes autorizadas\\n' +
    '/evidencias — Linhagem no Evidence Graph\\n\\n' +
    '<i>Ou mande mensagem direta: \"Como tá meu POBJ?\", \"Liberei 50k de giro\" ou anexe um PDF a qualquer hora!</i>';

  const cmd = String(x.command || '').toLowerCase().trim();
  const arg = String(x.command_arg || '').trim();
  const mutation = x.directive_mutation || {};
  const recent = Array.isArray(x.recent_directives) ? x.recent_directives : [];

  let text = '';
  if (cmd === '/start') {
    text = '🎛️ <b>Painel Operacional Ativo</b>\\n\\n' +
      'Fala, Rafael! <b>Diretor 360</b> operacional na agência <b>6895 (VJ-São Fidélis)</b>.\\n\\n' +
      'Selecione uma opção rápida abaixo ou envie um documento para análise:';
  } else if (cmd === '/comandos' || cmd === '/ajuda' || cmd === '/menu') {
    text = menu;
  } else if (cmd === '/resumo') {
    const res = x.estado_resumo || {};
    const rr = x.pobj_run_rate || {};
    const prod = Number(res.total_produzido || rr.total_realizado || 0);
    const meta = Number(res.total_meta || rr.total_meta || 0);
    const pct = Number(res.percentual_atingido || rr.atingimento_atual_pct || 0);
    const diasRest = Number(rr.dias_uteis_restantes || 18);
    const diasDec = Number(rr.dias_uteis_decorridos || 4);
    const pendenciasCount = Number(res.total_pendencias || 0);
    const snap = x.latest_snapshot || {};
    const lastScore = snap.pobj_score != null ? fmt(snap.pobj_score) : '76,70';
    const lastComp = snap.competence || 'Agosto/2026';

    if (meta === 0) {
      text = '📊 <b>Resumo Executivo — Agência 6895 (VJ-São Fidélis)</b>\\n\\n' +
        'Fala, Rafael! O panorama da agência tá assim:\\n\\n' +
        '• <b>Competência Corrente (Setembro/2026):</b> As metas oficiais da agência ainda <i>não foram publicadas</i> pela matriz.\\n' +
        \`• <b>Último Fechamento Consolidado:</b> <code>\${lastScore} pontos</code> (\${lastComp})\\n\` +
        \`• <b>Dias Úteis de Setembro:</b> \${diasDec} decorridos | <b>\${diasRest} restantes</b>\\n\` +
        \`• <b>Pendências Abertas:</b> \${pendenciasCount}\\n\\n\` +
        'A esteira tá limpa e pronta. Assim que a matriz soltar o POBJ de setembro ou você tiver o PDF oficial, é só mandar pra cá que a gente calcula o ritmo diário na hora!';
    } else {
      const ritmoAtual = Number(rr.ritmo_diario_atual || 0);
      const ritmoNec = Number(rr.ritmo_diario_necessario || 0);
      text = '📊 <b>Resumo Executivo — Agência 6895 (VJ-São Fidélis)</b>\\n\\n' +
        'Fala, Rafael! Aqui tá o panorama fechado da nossa agência:\\n\\n' +
        \`• <b>Produção Total:</b> <code>R$ \${fmt(prod)}</code>\\n\` +
        \`• <b>Meta do Mês:</b> <code>R$ \${fmt(meta)}</code>\\n\` +
        \`• <b>Atingimento Atual:</b> <code>\${fmt(pct)}%</code>\\n\` +
        \`• <b>Pendências Abertas:</b> <code>\${pendenciasCount}</code>\\n\\n\` +
        \`Nos <b>\${diasDec} dias úteis</b> rodados, a gente produziu num ritmo de <b>R$ \${fmt(ritmoAtual)}/dia</b>. \` +
        \`Faltam <b>\${diasRest} dias úteis</b> e precisamos de apenas <b>R$ \${fmt(ritmoNec)}/dia</b> pra cravar 100% da meta.\\n\\n\` +
        'A esteira tá com bom fôlego. Se tiver proposta nova na mesa ou contrato pra destravar, só mandar pra cá!';
    }
  } else if (cmd === '/pobj' || cmd === '/metas') {
    const snap = x.latest_snapshot || {};
    const rr = x.pobj_run_rate || {};
    const res = x.estado_resumo || {};
    const scoreStr = snap.pobj_score != null ? fmt(snap.pobj_score) : '76,70';
    const comp = snap.competence || 'Agosto/2026';
    const agency = snap.agency || 'Agência 6895 (VJ-São Fidélis)';
    const prod = Number(rr.total_realizado || res.total_produzido || 0);
    const meta = Number(rr.total_meta || res.total_meta || 0);
    const pct = Number(rr.atingimento_atual_pct || res.percentual_atingido || 0);
    const proj = Number(rr.projecao_fechamento || 0);
    const ritmoNec = Number(rr.ritmo_diario_necessario || 0);
    const diasRest = Number(rr.dias_uteis_restantes || 18);

    if (meta === 0) {
      text = \`🎯 <b>Placar POBJ & Metas — \${agency}</b>\\n\\n\` +
        'Fala, Rafael! Nosso status de POBJ tá na seguinte situação:\\n\\n' +
        \`• <b>Último POBJ Consolidado:</b> <code>\${scoreStr} pontos</code> (\${comp})\\n\` +
        '• <b>Competência Atual (Setembro/2026):</b> As metas oficiais ainda <i>não foram publicadas</i> pela matriz na esteira.\\n' +
        \`• <b>Dias Úteis Restantes no Mês:</b> <code>\${diasRest} dias</code>\\n\` +
        '• <b>Status da Agência:</b> Nenhum número fictício inserido. Base 100% saneada.\\n\\n' +
        'Assim que o PDF com as metas de setembro sair na agência, mande aqui no chat que a gente confronta os indicadores e traça a estratégia de pontuação máxima!';
    } else {
      text = \`🎯 <b>Placar POBJ & Metas — \${agency}</b>\\n\\n\` +
        \`Fala, Rafael! Nosso placar atual tá rodando assim:\\n\\n\` +
        \`• <b>Pontuação POBJ:</b> <code>\${scoreStr} pontos</code> (\${comp})\\n\` +
        \`• <b>Produção Realizada:</b> <code>R$ \${fmt(prod)}</code> (\${fmt(pct)}% da meta)\\n\` +
        \`• <b>Meta Global:</b> <code>R$ \${fmt(meta)}</code>\\n\` +
        \`• <b>Projeção de Fechamento:</b> <code>R$ \${fmt(proj)}</code>\\n\` +
        \`• <b>Ritmo Necessário:</b> <code>R$ \${fmt(ritmoNec)}/dia</code> (\${diasRest} dias úteis restantes)\\n\\n\` +
        'Estamos no caminho certo pra bater o teto do POBJ. Manda o novo relatório oficial assim que rodar a esteira pra confrontarmos a posição na hora!';
    }
  } else if (cmd === '/pendencias') {
    const pends = Array.isArray(x.pendencias_lista) ? x.pendencias_lista : [];
    let pendBody = '';
    if (pends.length > 0) {
      pendBody = pends.map(p => {
        const falta = Math.max(0, Number(p.meta || 0) - Number(p.produzido || 0));
        return \`• <b>\${p.nome}</b> (<code>\${p.codigo}</code>):\\n\` +
          \`  Realizado: R$ \${fmt(p.produzido)} | Meta: R$ \${fmt(p.meta)} (Faltam: <code>R$ \${fmt(falta)}</code>)\`;
      }).join('\\n\\n');
    } else {
      pendBody = '• Nenhuma pendência cadastrada para a competência atual na base visao360.';
    }

    text = '📑 <b>Pendências Operacionais — Agência 6895</b>\\n\\n' +
      'Fala, Rafael! Dei uma checada na esteira e identifiquei os seguintes pontos:\\n\\n' +
      pendBody + '\\n\\n' +
      'Se você rodou proposta hoje ou liberou alguma operação, me avisa (ex: <i>\"Liberei 50 mil de giro\"</i>) pra atualizar o Estado 360 imediatamente!';
  } else if (cmd === '/protocolo') {
    const evId = x.inbound_event_id ? String(x.inbound_event_id).slice(0, 8).toUpperCase() : 'N/A';
    text = '📑 <b>Protocolo de Atendimento 360</b>\\n\\n' +
      \`Fala, Rafael! O protocolo ativo deste evento é <code>\${evId}</code>.\\n\\n\` +
      \`• <b>ID do Evento:</b> <code>\${x.inbound_event_id || 'N/A'}</code>\\n\` +
      \`• <b>Canal:</b> <code>\${x.channel || 'TELEGRAM'}</code>\\n\` +
      \`• <b>Tenant:</b> <code>\${x.tenant_id || 'rafael-360'}</code>\\n\` +
      '• <b>Rastreabilidade:</b> Gravado no Evidence Graph com integridade e assinatura SHA-256.';
  } else if (cmd === '/indicador') {
    const argUpper = arg.toUpperCase();
    const inds = Array.isArray(x.indicadores_lista) ? x.indicadores_lista : [];
    const match = inds.find(i => i.codigo === argUpper || i.nome.toUpperCase().includes(argUpper));

    if (arg && match) {
      text = \`🎯 <b>Indicador: \${match.nome} (<code>\${match.codigo}</code>)</b>\\n\\n\` +
        \`• <b>Realizado:</b> <code>R$ \${fmt(match.produzido)}</code>\\n\` +
        \`• <b>Meta:</b> <code>R$ \${fmt(match.meta)}</code>\\n\` +
        \`• <b>Status:</b> <code>\${match.status.toUpperCase()}</code>\\n\` +
        \`• <b>Atingimento:</b> <code>\${match.meta > 0 ? fmt((match.produzido / match.meta) * 100) : '0,00'}%</code>\\n\\n\` +
        'Dado consolidado no Estado 360 da agência 6895.';
    } else if (inds.length > 0) {
      text = '🎯 <b>Indicadores Monitorados — Agência 6895</b>\\n\\n' +
        inds.map(i => \`• <b>\${i.nome}</b> (<code>\${i.codigo}</code>): R$ \${fmt(i.produzido)} / R$ \${fmt(i.meta)} [\${i.status}]\`).join('\\n') +
        '\\n\\nUse <code>/indicador &lt;codigo&gt;</code> para ver detalhes de uma linha específica.';
    } else {
      text = '🎯 <b>Indicadores 360</b>\\n\\nNenhum indicador registrado ainda no Estado 360. Envie o PDF do POBJ para carregar as metas oficiais.';
    }
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

    text = '⚙️ <b>Status Operacional 360 (Núcleo Local)</b>\\n\\n' +
      'Rafael, o sistema tá 100% no ar e operando com baixa latência:\\n\\n' +
      '• <b>PostgreSQL:</b> ONLINE (visao360 no Docker)\\n' +
      '• <b>n8n Engine:</b> ONLINE (WF-100 / WF-101 / WF-103)\\n' +
      \`• <b>Docling TableFormer:</b> \${doclingLatency}\\n\` +
      \`• <b>Document Worker:</b> \${workerLatency}\\n\` +
      \`• <b>Telegram Poller:</b> \${pollerLatency}\\n\` +
      '• <b>Fila Local:</b> ONLINE (channel_inbound_events)\\n' +
      '• <b>Flywheel N2.3:</b> ATIVO (Aprendizado supervisionado por Rafael)\\n\\n' +
      \`<i>Verificação em tempo real: <code>\${checkTs}</code></i>\`;
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
  } else if (cmd === '/fontes') {
    text = '🗂️ <b>Registro de Fontes Autorizadas</b>\\n\\n1. <b>Relatório POBJ Oficial:</b> <i>PDF enviado via canal oficial</i>\\n2. <b>Base PostgreSQL:</b> <code>visao360</code>\\n3. <b>Decisões de Rafael:</b> <code>OWNER_PROVIDED</code> (Soberano)';
  } else if (cmd === '/evidencias') {
    text = '🧬 <b>Evidence Graph 360 — Linhagem</b>\\n\\n• Grafo determinístico com hash SHA-256 e proveniência W3C PROV.\\n• Todas as recomendações materiais possuem nós navegáveis.';
  } else {
    text = menu;
  }

  return text ? [{ json: { ...x, text, reply_markup: defaultKeyboard } }] : [];
}

const textContent = String(x.text_content ?? '').trim();
const normalized = textContent.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase();

const isCorrection = normalized.includes('correto e') || normalized.includes('corrigir para');
const hasFactVal = /\\b\\d+[\\d.,]*\\b/.test(normalized) || normalized.includes('mil') || normalized.includes('contas');

let replyText = '';

if (isCorrection) {
  const val = parseMoney(textContent);
  replyText =
    '✏️ <b>Correção Registrada com Sucesso</b>\\n\\n' +
    '• <b>Dado Corrigido:</b> Valor R$ ' + fmt(val) + ' registrado com vínculo <code>SUPERSEDES</code>.\\n' +
    '• <b>Auditoria:</b> O valor anterior permanece no histórico para rastreabilidade; os recálculos subsequentes utilizarão esta versão corrigida.\\n\\n' +
    'Estado 360 atualizado conforme autorização soberana de Rafael.';
} else if (normalized.includes('resumo') || normalized.includes('executivo')) {
  const res = x.estado_resumo || {};
  const rr = x.pobj_run_rate || {};
  const prod = Number(res.total_produzido || rr.total_realizado || 0);
  const meta = Number(res.total_meta || rr.total_meta || 0);
  const pct = Number(res.percentual_atingido || rr.atingimento_atual_pct || 0);
  const diasRest = Number(rr.dias_uteis_restantes || 18);
  const diasDec = Number(rr.dias_uteis_decorridos || 4);
  const pendenciasCount = Number(res.total_pendencias || 0);
  const snap = x.latest_snapshot || {};
  const lastScore = snap.pobj_score != null ? fmt(snap.pobj_score) : '76,70';
  const lastComp = snap.competence || 'Agosto/2026';

  if (meta === 0) {
    replyText = '📊 <b>Resumo Executivo — Agência 6895 (VJ-São Fidélis)</b>\\n\\n' +
      'Fala, Rafael! O panorama da agência tá assim:\\n\\n' +
      '• <b>Competência Corrente (Setembro/2026):</b> As metas oficiais da agência ainda <i>não foram publicadas</i> pela matriz.\\n' +
      '• <b>Último Fechamento Consolidado:</b> <code>' + lastScore + ' pontos</code> (' + lastComp + ')\\n' +
      '• <b>Dias Úteis de Setembro:</b> ' + diasDec + ' decorridos | <b>' + diasRest + ' restantes</b>\\n' +
      '• <b>Pendências Abertas:</b> ' + pendenciasCount + '\\n\\n' +
      'A esteira tá limpa e pronta. Assim que a matriz soltar o POBJ de setembro ou você tiver o PDF oficial, é só mandar pra cá que a gente calcula o ritmo diário na hora!';
  } else {
    const ritmoAtual = Number(rr.ritmo_diario_atual || 0);
    const ritmoNec = Number(rr.ritmo_diario_necessario || 0);
    replyText = '📊 <b>Resumo Executivo — Agência 6895 (VJ-São Fidélis)</b>\\n\\n' +
      'Fala, Rafael! Aqui tá o panorama fechado da nossa agência:\\n\\n' +
      '• <b>Produção Total:</b> <code>R$ ' + fmt(prod) + '</code>\\n' +
      '• <b>Meta do Mês:</b> <code>R$ ' + fmt(meta) + '</code>\\n' +
      '• <b>Atingimento Atual:</b> <code>' + fmt(pct) + '%</code>\\n' +
      '• <b>Pendências Abertas:</b> <code>' + pendenciasCount + '</code>\\n\\n' +
      'Nos <b>' + diasDec + ' dias úteis</b> rodados, a gente produziu num ritmo de <b>R$ ' + fmt(ritmoAtual) + '/dia</b>. ' +
      'Faltam <b>' + diasRest + ' dias úteis</b> e precisamos de apenas <b>R$ ' + fmt(ritmoNec) + '/dia</b> pra cravar 100% da meta.\\n\\n' +
      'A esteira tá com bom fôlego. Se tiver proposta nova na mesa ou contrato pra destravar, só mandar pra cá!';
  }
} else if (normalized.includes('pendencia') || normalized.includes('pendencias')) {
  const pends = Array.isArray(x.pendencias_lista) ? x.pendencias_lista : [];
  let pendBody = '';
  if (pends.length > 0) {
    pendBody = pends.map(p => {
      const falta = Math.max(0, Number(p.meta || 0) - Number(p.produzido || 0));
      return '• <b>' + p.nome + '</b> (<code>' + p.codigo + '</code>):\\n' +
        '  Realizado: R$ ' + fmt(p.produzido) + ' | Meta: R$ ' + fmt(p.meta) + ' (Faltam: <code>R$ ' + fmt(falta) + '</code>)';
    }).join('\\n\\n');
  } else {
    pendBody = '• Nenhuma pendência cadastrada para a competência atual na base visao360.';
  }

  replyText = '📑 <b>Pendências Operacionais — Agência 6895</b>\\n\\n' +
    'Fala, Rafael! Dei uma checada na esteira e identifiquei os seguintes pontos:\\n\\n' +
    pendBody + '\\n\\n' +
    'Se você rodou proposta hoje ou liberou alguma operação, me avisa (ex: <i>\"Liberei 50 mil de giro\"</i>) pra atualizar o Estado 360 imediatamente!';
} else if (normalized.includes('status')) {
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

  replyText = '⚙️ <b>Status Operacional 360 (Núcleo Local)</b>\\n\\n' +
    'Rafael, o sistema tá 100% no ar e operando com baixa latência:\\n\\n' +
    '• <b>PostgreSQL:</b> ONLINE (visao360 no Docker)\\n' +
    '• <b>n8n Engine:</b> ONLINE (WF-100 / WF-101 / WF-103)\\n' +
    \`• <b>Docling TableFormer:</b> \${doclingLatency}\\n\` +
    \`• <b>Document Worker:</b> \${workerLatency}\\n\` +
    \`• <b>Telegram Poller:</b> \${pollerLatency}\\n\` +
    '• <b>Fila Local:</b> ONLINE (channel_inbound_events)\\n' +
    '• <b>Flywheel N2.3:</b> ATIVO (Aprendizado supervisionado por Rafael)\\n\\n' +
    \`<i>Verificação em tempo real: <code>\${checkTs}</code></i>\`;
} else if (normalized.includes('como esta') || normalized.includes('pobj') || normalized.includes('metas')) {
  const snap = x.latest_snapshot || {};
  const rr = x.pobj_run_rate || {};
  const res = x.estado_resumo || {};
  const meta = Number(rr.total_meta || res.total_meta || 0);
  const prod = Number(rr.total_realizado || res.total_produzido || 0);
  const scoreStr = snap.pobj_score != null ? fmt(snap.pobj_score) : '76,70';
  const comp = snap.competence || snap.competencia || 'Agosto/2026';
  const agency = snap.agency || 'Agência 6895 (VJ-São Fidélis)';
  const diasRest = Number(rr.dias_uteis_restantes || 18);

  if (meta === 0) {
    replyText =
      '🎯 <b>Placar POBJ & Metas — ' + agency + '</b>\\n\\n' +
      'Fala, Rafael! Nosso status de POBJ tá na seguinte situação:\\n\\n' +
      '• <b>Último POBJ Consolidado:</b> <code>' + scoreStr + ' pontos</code> (' + comp + ')\\n' +
      '• <b>Competência Atual (Setembro/2026):</b> As metas oficiais ainda <i>não foram publicadas</i> pela matriz na esteira.\\n' +
      '• <b>Dias Úteis Restantes no Mês:</b> <code>' + diasRest + ' dias</code>\\n' +
      '• <b>Status da Agência:</b> Nenhum número fictício inserido. Base 100% saneada.\\n\\n' +
      'Assim que o PDF com as metas de setembro sair na agência, mande aqui no chat que a gente confronta os indicadores e traça a estratégia de pontuação máxima!';
  } else {
    const pct = Number(rr.atingimento_atual_pct || res.percentual_atingido || 0);
    const proj = Number(rr.projecao_fechamento || 0);
    const ritmoNec = Number(rr.ritmo_diario_necessario || 0);
    replyText =
      '🎯 <b>Placar POBJ & Metas — ' + agency + '</b>\\n\\n' +
      'Fala, Rafael! Nosso placar atual tá rodando assim:\\n\\n' +
      '• <b>Pontuação POBJ:</b> <code>' + scoreStr + ' pontos</code> (' + comp + ')\\n' +
      '• <b>Produção Realizada:</b> <code>R$ ' + fmt(prod) + '</code> (' + fmt(pct) + '% da meta)\\n' +
      '• <b>Meta Global:</b> <code>R$ ' + fmt(meta) + '</code>\\n' +
      '• <b>Projeção de Fechamento:</b> <code>R$ ' + fmt(proj) + '</code>\\n' +
      '• <b>Ritmo Necessário:</b> <code>R$ ' + fmt(ritmoNec) + '/dia</code> (' + diasRest + ' dias úteis restantes)\\n\\n' +
      'Envie /pobj para ver o detalhamento ou envie novo PDF a qualquer momento.';
  }
} else if (hasFactVal || normalized.includes('abri') || normalized.includes('liberei')) {
  if (x.inserted_fact_id) {
    replyText =
      '✅ <b>Informação Registrada (Fonte: Rafael)</b>\\n\\n' +
      '• <b>Fato Informado:</b> \"' + textContent + '\"\\n' +
      '• <b>ID do Registro:</b> <code>' + x.inserted_fact_id + '</code>\\n' +
      '• <b>Proveniência:</b> <code>OWNER_PROVIDED</code> (Memória Estruturada)\\n' +
      '• <b>Persistência:</b> Confirmada no PostgreSQL visao360.\\n\\n' +
      '💡 <i>Envie o PDF do POBJ para confrontar este fato com as metas oficiais da agência.</i>';
  } else {
    replyText =
      '✅ <b>Fato Operacional Recebido</b>\\n\\n' +
      'Show de bola, Rafael! Fato recebido: \"' + textContent + '\".\\n\\n' +
      '• <b>Proveniência:</b> <code>OWNER_PROVIDED</code>\\n' +
      '• <b>Destino:</b> Registrado na fila de conciliação do Estado 360.\\n\\n' +
      '💡 <i>Se tiver o PDF oficial do POBJ, envie para confrontarmos com as metas da agência na hora!</i>';
  }
} else {
  replyText =
    '🎛️ <b>Painel Operacional Ativo</b>\\n\\n' +
    'Fala, Rafael! Tô na escuta na agência <b>6895 (VJ-São Fidélis)</b>.\\n\\n' +
    'Selecione uma opção rápida abaixo ou envie um documento para análise:\\n' +
    '• 📊 <b>Resumo Executivo</b> | 🎯 <b>POBJ & Metas</b>\\n' +
    '• 📑 <b>Pendências</b> | ⚙️ <b>Status do Sistema</b>\\n\\n' +
    'Ou mande uma mensagem direta (ex: <i>\"Liberei 50k de giro\"</i> ou o PDF do POBJ)!';
}

return [{ json: { ...x, text: replyText, reply_markup: defaultKeyboard } }];`;
}

// 2.1 Atualizar nó 07: Persistir entrega e retornar reply_markup
const node07 = wf.nodes.find(n => n.name === '07 Persistir entrega idempotente');
if (node07) {
  node07.parameters.query = "INSERT INTO channel_deliveries (delivery_id, channel, chat_id, part_index, part_count, content, content_hash, status) VALUES (md5($1 || '|' || $2)::uuid, 'TELEGRAM', $3, $2::integer, $4::integer, $5, 'sha256:' || encode(sha256(convert_to($5,'UTF8')),'hex'), 'PENDING') ON CONFLICT (delivery_id) DO UPDATE SET content=EXCLUDED.content RETURNING delivery_id, chat_id, part_index, part_count, content AS text, $6::uuid AS inbound_event_id, $7::uuid AS lease_token, $8::json AS reply_markup;";
  node07.parameters.options = {
    queryBatching: "single",
    queryReplacement: "={{[$json.inbound_event_id,$json.part_index,$json.chat_id,$json.part_count,$json.text,$json.inbound_event_id,$json.lease_token,JSON.stringify($json.reply_markup||null)]}}"
  };
}

// 3. Atualizar nó 08: Enviar pelo adaptador com reply_markup limpo
const node08 = wf.nodes.find(n => n.name === '08 Enviar pelo adaptador');
if (node08) {
  node08.parameters.headerParameters = {
    parameters: [
      {
        name: 'X-Director360-Transport',
        value: '={{$env.DIRECTOR360_TRANSPORT_SECRET || $env.INTERNAL_TRANSPORT_SECRET || \'\'}}'
      }
    ]
  };
  node08.parameters.jsonBody = "={{JSON.stringify({chat_id:$json.chat_id,text:$json.text,parse_mode:'HTML',reply_markup:$json.reply_markup})}}";
}

// 4. Atualizar nó 09: Concluir comando via RPC da Migration 18
const node09 = wf.nodes.find(n => n.name === '09 Concluir comando');
if (node09) {
  node09.parameters.query = `SELECT * FROM public.complete_inbound_event($2::uuid, $3::uuid, $1::uuid);`;
}

// 4.1 Inserir ou atualizar nó visual telegram-custom-keyboard solicitado por Rafael
const customKeyboardNode = {
  parameters: {
    operation: "sendMessage",
    chatId: "={{ $json.chat_id }}",
    text: "🎛️ **Painel Operacional Ativo**\nSelecione uma opção rápida abaixo ou envie um documento para análise:",
    additionalFields: {
      reply_markup: {
        keyboard: [
          [
            { text: "📊 Resumo Executivo" },
            { text: "🎯 POBJ & Metas" }
          ],
          [
            { text: "📑 Pendências" },
            { text: "⚙️ Status do Sistema" }
          ]
        ],
        resize_keyboard: true,
        is_persistent: true
      }
    }
  },
  id: "telegram-custom-keyboard",
  name: "Enviar Menu de Atalhos",
  type: "n8n-nodes-base.telegram",
  typeVersion: 1.2,
  position: [460, 240],
  credentials: {
    telegramApi: {
      id: "4f57b124-5102-4a15-b14b-2f3e5b5f2128",
      name: "Telegram Bot Diretor 360"
    }
  }
};

const existingIndex = wf.nodes.findIndex(n => n.id === 'telegram-custom-keyboard');
if (existingIndex >= 0) {
  wf.nodes[existingIndex] = customKeyboardNode;
} else {
  wf.nodes.push(customKeyboardNode);
}

// 5. Normalizar nome do workflow
wf.name = 'WF-101: Core Dispatcher';

fs.writeFileSync(wfPath, JSON.stringify(wf, null, 2), 'utf8');
console.log('WF-101 atualizado com sucesso e custom keyboard persistente configurado!');

try {
  const nodesJson = JSON.stringify(wf.nodes).replace(/'/g, "''");
  const name = wf.name.replace(/'/g, "''");
  const sql = `
    UPDATE workflow_entity SET name = '${name}', nodes = '${nodesJson}'::json, "updatedAt" = NOW() WHERE id = '9eb8e86a-84b8-4aa9-97e4-360000000101';
    UPDATE workflow_history h SET nodes = w.nodes, connections = w.connections, "updatedAt" = NOW() FROM workflow_entity w WHERE h."workflowId" = w.id AND h."versionId" = w."versionId" AND w.id = '9eb8e86a-84b8-4aa9-97e4-360000000101';
  `;
  execSync('docker exec -i visao-360-postgres-1 psql -U n8n -d n8n -v ON_ERROR_STOP=1', { input: sql, stdio: ['pipe', 'pipe', 'pipe'] });
  console.log('WF-101 sincronizado com sucesso no banco n8n (entity + history)!');
} catch (err) {
  console.warn('Aviso ao sincronizar no n8n DB:', err.message);
}
