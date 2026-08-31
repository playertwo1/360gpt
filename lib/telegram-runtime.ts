import type { D1Database } from '@cloudflare/workers-types';
import { interpretClarification, type ClarificationQuestion } from './clarification-ai';
import { registerTelegramCommands, sendTelegramText, telegramCommandMenu } from './telegram-messages';

type InteractionResult = { handled: boolean; kind?: string };

function commandParts(text: string) {
  const normalized = text.trim().replace(/\s+/g, ' ');
  const [head = '', ...rest] = normalized.split(' ');
  return { command: head.toLowerCase().split('@')[0], args: rest, rawArgs: rest.join(' ') };
}

function safeJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

async function latestState(db: D1Database) {
  return db.prepare(`SELECT state_id, state_version, overall_status, snapshot_json, executive_assessment_json, generated_at
    FROM state_snapshots WHERE tenant_id = 'tenant-owner' AND subject_ref = 'performance-owner'
    ORDER BY state_version DESC LIMIT 1`).first<{ state_id: string; state_version: number; overall_status: string; snapshot_json: string; executive_assessment_json: string | null; generated_at: number }>();
}

function conciseSection(text: string, heading: string) {
  const upper = text.toUpperCase(); const start = upper.indexOf(heading.toUpperCase());
  if (start < 0) return '';
  const rest = text.slice(start); const next = rest.slice(heading.length).search(/\n[A-ZÁÉÍÓÚÇ][A-ZÁÉÍÓÚÇ ]{4,}\n/);
  return (next >= 0 ? rest.slice(0, heading.length + next) : rest).slice(0, 3200).trim();
}

async function createConfirmation(db: D1Database, token: string, chatId: number, ownerId: string, command: string, args: string[]) {
  const code = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
  const now = Date.now(); const expiresAt = now + 10 * 60 * 1000;
  await db.prepare(`INSERT INTO command_confirmations (id, owner_id, chat_id, command, arguments_json, status, expires_at, created_at) VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?)`)
    .bind(code, ownerId, String(chatId), command, JSON.stringify(args), expiresAt, now).run();
  await sendTelegramText(token, chatId, `CONFIRMAÇÃO NECESSÁRIA\n\nAção: ${command}\nAlvo: ${args.join(' ') || 'não informado'}\n\nPara confirmar em até 10 minutos, envie:\n/confirmar ${code}\n\nPara desistir, ignore esta mensagem.`);
}

async function executeConfirmation(db: D1Database, token: string, chatId: number, ownerId: string, code: string) {
  const row = await db.prepare(`SELECT id, command, arguments_json FROM command_confirmations WHERE id = ? AND owner_id = ? AND chat_id = ? AND status = 'PENDING' AND expires_at >= ?`)
    .bind(code.toUpperCase(), ownerId, String(chatId), Date.now()).first<{ id: string; command: string; arguments_json: string }>();
  if (!row) { await sendTelegramText(token, chatId, 'Confirmação inválida ou expirada. Repita o comando original.'); return; }
  const args = safeJson<string[]>(row.arguments_json, []); const protocol = args[0]; const now = Date.now();
  if (!protocol) { await sendTelegramText(token, chatId, 'Ação sem protocolo válido.'); return; }
  if (row.command === '/cancelar') {
    await db.batch([
      db.prepare(`UPDATE agent_runs SET status = 'CANCELLED', completed_at = ?, lease_token = NULL, lease_expires_at = NULL WHERE document_id = ? AND status NOT IN ('SUCCEEDED','CANCELLED')`).bind(now, protocol),
      db.prepare(`UPDATE documents SET status = 'cancelled' WHERE id = ? AND owner_id = ?`).bind(protocol, ownerId),
    ]);
  } else if (row.command === '/tentar' || row.command === '/reabrir') {
    await db.batch([
      db.prepare(`UPDATE agent_runs SET status = 'QUEUED', available_at = ?, completed_at = NULL, last_error_code = NULL WHERE document_id = ? AND status IN ('FAILED_RETRYABLE','FAILED_FINAL','INCOMPLETE_OWNER_INPUT_TIMEOUT','CANCELLED')`).bind(now, protocol),
      db.prepare(`UPDATE documents SET status = 'ready_for_processing' WHERE id = ? AND owner_id = ?`).bind(protocol, ownerId),
    ]);
  } else if (row.command === '/excluir') {
    await db.batch([
      db.prepare(`UPDATE agent_runs SET status = 'REVOKED', completed_at = ?, lease_token = NULL, lease_expires_at = NULL WHERE document_id = ?`).bind(now, protocol),
      db.prepare(`UPDATE documents SET status = 'revoked', raw_text = NULL, storage_key = NULL WHERE id = ? AND owner_id = ?`).bind(protocol, ownerId),
    ]);
  } else if (row.command === '/corrigir') {
    await sendTelegramText(token, chatId, `Correção autorizada para ${protocol}. Envie /responder ${protocol} seguido da informação correta.`);
  }
  await db.prepare(`UPDATE command_confirmations SET status = 'CONFIRMED', confirmed_at = ? WHERE id = ?`).bind(now, row.id).run();
  await sendTelegramText(token, chatId, `Ação ${row.command} confirmada para o protocolo ${protocol}.`);
}

export async function handleClarificationReply(db: D1Database, token: string, chatId: number, ownerId: string, messageId: number, text: string, replyToMessageId?: number, explicitProtocol?: string) {
  const row = replyToMessageId
    ? await db.prepare(`SELECT * FROM clarification_requests WHERE chat_id = ? AND telegram_message_id = ? AND status IN ('PENDING','NEEDS_FOLLOW_UP') ORDER BY created_at DESC LIMIT 1`).bind(String(chatId), String(replyToMessageId)).first<Record<string, unknown>>()
    : explicitProtocol
      ? await db.prepare(`SELECT * FROM clarification_requests WHERE chat_id = ? AND document_id = ? AND status IN ('PENDING','NEEDS_FOLLOW_UP') ORDER BY created_at DESC LIMIT 1`).bind(String(chatId), explicitProtocol).first<Record<string, unknown>>()
      : await db.prepare(`SELECT * FROM clarification_requests WHERE chat_id = ? AND status IN ('PENDING','NEEDS_FOLLOW_UP') ORDER BY created_at DESC LIMIT 2`).bind(String(chatId)).all().then((result) => result.results?.length === 1 ? result.results[0] as Record<string, unknown> : null);
  if (!row) return false;
  const questions = safeJson<ClarificationQuestion[]>(String(row.questions_json ?? '[]'), []);
  const interpretation = await interpretClarification(questions, text);
  const now = Date.now();
  if (!interpretation.resolved) {
    await db.prepare(`UPDATE clarification_requests SET status = 'NEEDS_FOLLOW_UP', answer_text = ?, answer_message_id = ?, interpretation_json = ?, attempt_count = attempt_count + 1 WHERE id = ?`)
      .bind(text, String(messageId), JSON.stringify(interpretation), String(row.id)).run();
    await sendTelegramText(token, chatId, ['Ainda preciso confirmar:', ...interpretation.follow_up.map((item, index) => `${index + 1}. ${item}`), '', `Protocolo: ${row.document_id}`].join('\n'), messageId);
    return true;
  }
  await db.batch([
    db.prepare(`UPDATE clarification_requests SET status = 'RESOLVED', answer_text = ?, answer_message_id = ?, interpretation_json = ?, attempt_count = attempt_count + 1, resolved_at = ? WHERE id = ?`)
      .bind(text, String(messageId), JSON.stringify(interpretation), now, String(row.id)),
    db.prepare(`UPDATE agent_runs SET status = 'QUEUED', available_at = ?, output_json = NULL, completed_at = NULL WHERE id = ? AND status = 'AWAITING_OWNER_INPUT'`).bind(now, String(row.job_id)),
    db.prepare(`UPDATE documents SET status = 'ready_for_processing' WHERE id = ? AND owner_id = ?`).bind(String(row.document_id), ownerId),
    db.prepare(`INSERT INTO audit_log (id, owner_id, actor, action, entity_type, entity_id, details_json, created_at) VALUES (?, ?, ?, 'clarification_resolved', 'clarification', ?, ?, ?)`)
      .bind(`clarification-answer-${row.id}`, ownerId, `telegram:${chatId}`, String(row.id), JSON.stringify({ model: interpretation.model, answerCount: interpretation.answers.length }), now),
  ]);
  await sendTelegramText(token, chatId, `Resposta vinculada ao protocolo ${row.document_id}. O mesmo arquivo voltou para a fila e será reprocessado.`, messageId);
  return true;
}

export async function handleTelegramCommand(db: D1Database, token: string, chatId: number, ownerId: string, text: string): Promise<InteractionResult> {
  const { command, args, rawArgs } = commandParts(text);
  if (!command.startsWith('/')) return { handled: false };
  if (['/comandos','/ajuda','/menu','/start'].includes(command)) {
    try { await registerTelegramCommands(token); } catch (error) { console.error('Falha ao registrar menu do Telegram:', error); }
    await sendTelegramText(token, chatId, telegramCommandMenu()); return { handled: true, kind: 'menu' };
  }
  if (command === '/confirmar') { await executeConfirmation(db, token, chatId, ownerId, args[0] ?? ''); return { handled: true, kind: 'confirmation' }; }
  if (['/cancelar','/reabrir','/excluir','/corrigir'].includes(command) || (command === '/tentar' && args[0]?.toLowerCase() === 'novamente')) {
    const normalizedArgs = command === '/tentar' ? args.slice(1) : args;
    const normalizedCommand = command === '/tentar' ? '/tentar' : command;
    if (!normalizedArgs[0]) await sendTelegramText(token, chatId, `Informe o protocolo. Exemplo: ${command} telegram-...`);
    else await createConfirmation(db, token, chatId, ownerId, normalizedCommand, normalizedArgs);
    return { handled: true, kind: 'critical' };
  }
  if (command === '/responder') {
    const protocol = args.shift(); const answer = args.join(' ');
    if (!protocol || !answer) await sendTelegramText(token, chatId, 'Use /responder <protocolo> <sua resposta>.');
    else if (!(await handleClarificationReply(db, token, chatId, ownerId, Date.now(), answer, undefined, protocol))) await sendTelegramText(token, chatId, 'Não encontrei dúvida pendente para esse protocolo.');
    return { handled: true, kind: 'answer' };
  }
  if (command === '/status') {
    const counts = await db.prepare(`SELECT status, count(*) AS total FROM agent_runs GROUP BY status`).all<{ status: string; total: number }>();
    const summary = (counts.results ?? []).map((item) => `• ${item.status}: ${item.total}`).join('\n') || 'Fila vazia.';
    await sendTelegramText(token, chatId, `STATUS DIRETOR 360\n\nServiços locais são monitorados pelo n8n.\n\nFila persistida:\n${summary}`); return { handled: true, kind: 'status' };
  }
  if (command === '/protocolo') {
    const protocol = args[0];
    const row = protocol ? await db.prepare(`SELECT d.id, d.original_name, d.status AS document_status, ar.status AS job_status, ar.last_error_code, ar.completed_at FROM documents d LEFT JOIN agent_runs ar ON ar.document_id = d.id WHERE d.id = ? AND d.owner_id = ? ORDER BY ar.started_at DESC LIMIT 1`).bind(protocol, ownerId).first<Record<string, unknown>>() : null;
    const status = String(row?.job_status ?? row?.document_status ?? 'RECEIVED').toUpperCase();
    const progress = status === 'SUCCEEDED' || status === 'COMPLETED' ? 100 : status === 'PROCESSING' ? 60 : status === 'AWAITING_OWNER_INPUT' ? 80 : status.startsWith('FAILED') ? 0 : 10;
    const stage = status === 'SUCCEEDED' ? 'parecer enviado' : status === 'PROCESSING' ? 'OCR e análise em execução' : status === 'AWAITING_OWNER_INPUT' ? 'aguardando sua resposta' : status.startsWith('FAILED') ? 'erro — tente novamente' : 'recebido e aguardando o worker';
    await sendTelegramText(token, chatId, row ? `PROTOCOLO ${row.id}\nArquivo: ${row.original_name ?? 'sem nome'}\nProgresso: ${progress}%\nEtapa: ${stage}\nDocumento: ${row.document_status}\nProcessamento: ${row.job_status ?? 'não iniciado'}${row.last_error_code ? `\nErro: ${row.last_error_code}` : ''}` : 'Protocolo não encontrado ou não informado.');
    return { handled: true, kind: 'protocol' };
  }
  if (command === '/pendencias' || command === '/duvidas') {
    const rows = command === '/duvidas'
      ? await db.prepare(`SELECT document_id, status, due_at FROM clarification_requests WHERE owner_id = ? AND status IN ('PENDING','NEEDS_FOLLOW_UP') ORDER BY created_at DESC LIMIT 10`).bind(ownerId).all<Record<string, unknown>>()
      : await db.prepare(`SELECT d.id AS document_id, d.original_name, ar.status FROM agent_runs ar JOIN documents d ON d.id = ar.document_id WHERE d.owner_id = ? AND ar.status NOT IN ('SUCCEEDED','CANCELLED','REVOKED') ORDER BY d.received_at DESC LIMIT 10`).bind(ownerId).all<Record<string, unknown>>();
    const lines = (rows.results ?? []).map((row) => `• ${row.document_id}: ${row.status}${row.original_name ? ` — ${row.original_name}` : ''}`);
    await sendTelegramText(token, chatId, lines.length ? `${command === '/duvidas' ? 'DÚVIDAS PENDENTES' : 'PENDÊNCIAS'}\n\n${lines.join('\n')}` : 'Nenhuma pendência encontrada.');
    return { handled: true, kind: 'pending' };
  }
  if (command === '/meusdados') {
    const rows = await db.prepare(`SELECT id, original_name, status, received_at FROM documents WHERE owner_id = ? ORDER BY received_at DESC LIMIT 20`).bind(ownerId).all<Record<string, unknown>>();
    const lines = (rows.results ?? []).map((row) => `• ${row.id} — ${row.original_name ?? 'texto'} — ${row.status}`);
    await sendTelegramText(token, chatId, lines.length ? `SEUS DOCUMENTOS\n\n${lines.join('\n')}` : 'Nenhum documento encontrado.'); return { handled: true, kind: 'data' };
  }
  if (command === '/privacidade') { await sendTelegramText(token, chatId, 'PRIVACIDADE\n\nFinalidade: análise pessoal de Performance/POBJ.\nRetenção detalhada: até 24 meses.\nBackups: até 90 dias.\nAgregados não identificáveis: prazo indeterminado.\nRafael decide quais fontes e campos podem ser utilizados.\nUse /meusdados para consultar e /excluir <protocolo> para solicitar revogação.'); return { handled: true, kind: 'privacy' }; }
  const state = await latestState(db);
  if (['/ultimo','/pobj','/metas','/prioridades','/riscos','/cenarios','/hoje','/planodiario'].includes(command)) {
    if (!state) { await sendTelegramText(token, chatId, 'Ainda não existe Estado POBJ real persistido. Envie um arquivo pelo Telegram. Nenhuma conta fictícia será sugerida.'); return { handled: true, kind: 'no-state' }; }
    const assessment = safeJson<{ summary?: string }>(state.executive_assessment_json, {}); const full = assessment.summary ?? 'Parecer não disponível.';
    let answer = full;
    if (command === '/prioridades' || command === '/hoje' || command === '/planodiario') answer = conciseSection(full, 'CAMINHO RECOMENDADO') || conciseSection(full, 'RISCOS E GAPS') || full;
    if (command === '/riscos') answer = conciseSection(full, 'RISCOS E GAPS') || 'Nenhum risco material estruturado no último parecer.';
    if (command === '/cenarios') answer = conciseSection(full, 'CENÁRIOS CONFERÍVEIS') || 'Nenhum cenário conferível disponível no último parecer.';
    await sendTelegramText(token, chatId, `${answer}\n\nEstado: ${state.state_id} v${state.state_version}`); return { handled: true, kind: 'performance' };
  }
  if (command === '/historico') {
    const rows = await db.prepare(`SELECT state_id, state_version, generated_at, overall_status FROM state_snapshots WHERE tenant_id = 'tenant-owner' AND subject_ref = 'performance-owner' ORDER BY state_version DESC LIMIT 12`).all<Record<string, unknown>>();
    const lines = (rows.results ?? []).map((row) => `• v${row.state_version} — ${new Date(Number(row.generated_at)).toLocaleDateString('pt-BR')} — ${row.overall_status}`);
    await sendTelegramText(token, chatId, lines.length ? `HISTÓRICO POBJ\n\n${lines.join('\n')}` : 'Ainda não há histórico real.'); return { handled: true, kind: 'history' };
  }
  if (['/fontes','/evidencias','/explicar','/indicador','/comparar'].includes(command)) {
    await sendTelegramText(token, chatId, state ? `Consulta recebida: ${command} ${rawArgs}\n\nOs detalhes disponíveis estão vinculados ao Estado ${state.state_id} v${state.state_version}. Campos ausentes serão perguntados; nenhuma informação será inventada.` : 'Ainda não existe Estado real para essa consulta.');
    return { handled: true, kind: 'explain' };
  }
  await sendTelegramText(token, chatId, 'Comando não reconhecido. Use /comandos para ver todas as opções.');
  return { handled: true, kind: 'unknown' };
}
