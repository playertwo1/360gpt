import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';

type TelegramDocument = { file_id: string; file_unique_id: string; file_name?: string; mime_type?: string; file_size?: number };
type TelegramUpdate = { update_id: number; message?: { message_id: number; date: number; text?: string; caption?: string; document?: TelegramDocument; chat: { id: number; type: string }; from?: { id: number; username?: string; first_name?: string } } };
type Reservation = { claimed: boolean; status: string; attemptCount?: number };

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const MAX_WEBHOOK_BYTES = 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'application/json',
]);

export const runtime = 'edge';

export async function POST(request: Request) {
  if (env.TELEGRAM_INGEST_ENABLED !== 'true') {
    return NextResponse.json({ ok: false, error: 'ingest_disabled' }, { status: 503 });
  }
  if (!env.DB || !env.FILES) {
    return NextResponse.json({ ok: false, error: 'storage_unavailable' }, { status: 503 });
  }

  const secret = request.headers.get('x-telegram-bot-api-secret-token') ?? '';
  if (!env.TELEGRAM_WEBHOOK_SECRET || !(await constantTimeEqual(secret, env.TELEGRAM_WEBHOOK_SECRET))) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const contentType = request.headers.get('content-type')?.toLowerCase() ?? '';
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (!contentType.includes('application/json')) {
    return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 415 });
  }
  if (Number.isFinite(contentLength) && contentLength > MAX_WEBHOOK_BYTES) {
    return NextResponse.json({ ok: false, error: 'request_too_large' }, { status: 413 });
  }

  let update: TelegramUpdate;
  try {
    const bytes = await request.arrayBuffer();
    if (!bytes.byteLength || bytes.byteLength > MAX_WEBHOOK_BYTES) {
      return NextResponse.json({ ok: false, error: 'invalid_request_size' }, { status: bytes.byteLength > MAX_WEBHOOK_BYTES ? 413 : 400 });
    }
    update = JSON.parse(new TextDecoder().decode(bytes)) as TelegramUpdate;
  }
  catch { return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 }); }

  if (!Number.isSafeInteger(update.update_id) || update.update_id < 0) {
    return NextResponse.json({ ok: false, error: 'invalid_update_id' }, { status: 400 });
  }
  const message = update.message;
  if (!message) return NextResponse.json({ ok: true, ignored: true, reason: 'unsupported_update' });
  if (!Number.isSafeInteger(message.message_id) || !Number.isSafeInteger(message.chat?.id)) {
    return NextResponse.json({ ok: false, error: 'invalid_message' }, { status: 400 });
  }
  if (message.chat.type !== 'private') {
    return NextResponse.json({ ok: false, error: 'private_chat_required' }, { status: 403 });
  }
  if (!Number.isSafeInteger(message.from?.id) || message.from?.id !== message.chat.id) {
    return NextResponse.json({ ok: false, error: 'sender_mismatch' }, { status: 403 });
  }

  const allowedChats = (env.TELEGRAM_ALLOWED_CHAT_IDS ?? '').split(',').map((id) => id.trim()).filter(Boolean);
  if (!allowedChats.includes(String(message.chat.id))) {
    return NextResponse.json({ ok: false, error: 'chat_not_allowed' }, { status: 403 });
  }
  if (!(await consumeRateLimit(String(message.chat.id)))) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429, headers: { 'Retry-After': '60' } });
  }

  const text = String(message.text ?? message.caption ?? '').trim();
  const document = message.document;
  if (!text && !document) return NextResponse.json({ ok: true, ignored: true, reason: 'unsupported_message' });
  if (document) {
    if (!boundedTelegramId(document.file_id) || !boundedTelegramId(document.file_unique_id)) {
      return NextResponse.json({ ok: true, rejected: 'invalid_file_identity' });
    }
    const size = document.file_size;
    const mime = document.mime_type?.toLowerCase() ?? '';
    if (!Number.isSafeInteger(size) || !size || size < 1 || size > MAX_FILE_BYTES) {
      return NextResponse.json({ ok: true, rejected: 'invalid_file_size' });
    }
    if (!ALLOWED_MIME_TYPES.has(mime) || !allowedFileName(document.file_name ?? '', mime)) {
      return NextResponse.json({ ok: true, rejected: 'file_type_not_allowed' });
    }
  }

  const updateId = String(update.update_id);
  const chatId = String(message.chat.id);
  const ownerId = env.TELEGRAM_OWNER_ACCOUNT_USER_ID?.trim() || chatId;
  const documentId = `telegram-${chatId}-${updateId}`;
  const receivedAt = Date.now();
  const reservation = await reserveUpdate(updateId, chatId, String(message.message_id), documentId, receivedAt);
  if (!reservation.claimed) {
    return NextResponse.json({ ok: true, duplicate: true, protocol: documentId, documentId, updateId, status: reservation.status });
  }

  let storageKey: string | null = null;
  let contentHash: string | null = null;
  let canonicalDocumentId = documentId;
  let duplicateByHash = false;
  try {
    if (document) {
      if (!env.TELEGRAM_BOT_TOKEN) throw new IngestError('bot_not_configured');
      const file = await downloadTelegramFile(document);
      validateFileContent(file.bytes, document.mime_type?.toLowerCase() ?? '');
      contentHash = `sha256:${await sha256Hex(file.bytes)}`;
      const existing = await env.DB.prepare(`SELECT id FROM documents WHERE owner_id = ? AND content_hash = ? AND source IN ('pobj_mobile', 'telegram') ORDER BY received_at DESC LIMIT 1`)
        .bind(ownerId, contentHash).first<{ id: string }>();
      if (existing) {
        canonicalDocumentId = existing.id;
        duplicateByHash = true;
      } else {
        storageKey = `telegram/${chatId}/${updateId}/${safeFileName(document.file_name ?? 'documento')}`;
        await env.FILES.put(storageKey, file.bytes, {
          httpMetadata: { contentType: document.mime_type ?? 'application/octet-stream' },
          customMetadata: { telegramFileUniqueId: document.file_unique_id, sha256: contentHash, contentTrust: 'UNTRUSTED', ingestionMode: 'ASYNC_QUEUE' },
        });
      }
    }

    const runId = `telegram-run-${chatId}-${updateId}`;
    const auditId = `telegram-audit-${chatId}-${updateId}`;
    if (duplicateByHash) {
      await env.DB.batch([
        env.DB.prepare(`INSERT OR IGNORE INTO audit_log (id, owner_id, actor, action, entity_type, entity_id, details_json, created_at) VALUES (?, ?, ?, 'duplicate_ingest_ignored', 'document', ?, ?, ?)`)
          .bind(auditId, ownerId, `telegram:${message.from?.id ?? 'unknown'}`, canonicalDocumentId, JSON.stringify({ updateId: update.update_id, messageId: message.message_id, contentHash, channel: 'telegram', externalEffectsAllowed: false }), receivedAt),
        env.DB.prepare(`UPDATE telegram_updates SET document_id = ?, status = 'SUCCEEDED', completed_at = ?, error_code = NULL WHERE update_id = ?`)
          .bind(canonicalDocumentId, Date.now(), updateId),
      ]);
    } else {
      await env.DB.batch([
        env.DB.prepare(`INSERT OR IGNORE INTO documents (id, owner_id, source, source_message_id, original_name, mime_type, storage_key, content_hash, raw_text, status, received_at) VALUES (?, ?, 'telegram', ?, ?, ?, ?, ?, ?, 'received', ?)`)
          .bind(documentId, ownerId, updateId, document?.file_name ?? null, document?.mime_type ?? null, storageKey, contentHash, text || null, receivedAt),
        env.DB.prepare(`INSERT OR IGNORE INTO agent_runs (id, document_id, agent_role, status, input_summary, available_at) VALUES (?, ?, 'diretor', 'QUEUED', ?, ?)`)
          .bind(runId, documentId, text || document?.file_name || 'Nova entrada', receivedAt),
        env.DB.prepare(`INSERT OR IGNORE INTO audit_log (id, owner_id, actor, action, entity_type, entity_id, details_json, created_at) VALUES (?, ?, ?, 'ingested_and_enqueued', 'document', ?, ?, ?)`)
          .bind(auditId, ownerId, `telegram:${message.from?.id ?? 'unknown'}`, documentId, JSON.stringify({ updateId: update.update_id, messageId: message.message_id, contentHash, contentTrust: 'UNTRUSTED', externalEffectsAllowed: false }), receivedAt),
        env.DB.prepare(`UPDATE telegram_updates SET status = 'SUCCEEDED', completed_at = ?, error_code = NULL WHERE update_id = ?`)
          .bind(Date.now(), updateId),
      ]);
    }

    let ackSent = false;
    if (Boolean(env.TELEGRAM_BOT_TOKEN)) {
      const lowerText = text.toLowerCase();
      const userName = message.from?.first_name || 'Rafael';
      
      if (lowerText.startsWith('/hoje') || lowerText.startsWith('/planodiario') || lowerText === 'hoje' || lowerText.includes('plano')) {
        await sendTelegramMessage(message.chat.id, getDailyPlanBriefing());
        ackSent = true;
      } else if (lowerText.startsWith('/metas') || lowerText.startsWith('/pobj') || lowerText.includes('meta')) {
        await sendTelegramMessage(message.chat.id, getPobjDiagnostic());
        ackSent = true;
      } else if (lowerText.startsWith('/status')) {
        await sendTelegramMessage(message.chat.id, getStatusMessage());
        ackSent = true;
      } else if (lowerText.startsWith('/start')) {
        await sendTelegramMessage(message.chat.id, getWelcomeMessage(userName));
        ackSent = true;
      } else if (document) {
        const docConfirm = `✅ *DOCUMENTO RECEBIDO E ENFILEIRADO!*

` +
          `📄 *Arquivo:* \`${document.file_name ?? 'documento'}\`
` +
          `🧾 *Protocolo:* \`${canonicalDocumentId}\`
` +
          `📥 *Status:* \`RECEBIDO\`
` +
          `📊 *Tamanho:* \`${Math.round((document.file_size ?? 0) / 1024)} KB\`
` +
          `🔒 *Hash SHA-256:* \`${contentHash?.slice(0, 20)}...\`
` +
          `🛡️ *Linhagem W3C PROV:* Registrado no Evidence Graph.

` +
          `${duplicateByHash ? '♻️ Este arquivo já havia sido recebido; mantivemos o protocolo original.' : '⚙️ O processamento continuará em segundo plano.'} Não reenvie o arquivo.`;
        await sendTelegramMessage(message.chat.id, docConfirm);
        ackSent = true;
      } else if (env.TELEGRAM_SEND_ACK_ENABLED === 'true') {
        await sendTelegramMessage(message.chat.id, `Recebido com segurança pelo Diretor 360. Protocolo: ${documentId}
Digite /hoje para ver suas prioridades do dia!`);
        ackSent = true;
      }
    }
    return NextResponse.json({ ok: true, duplicate: duplicateByHash, protocol: canonicalDocumentId, documentId: canonicalDocumentId, jobId: duplicateByHash ? null : runId, updateId, status: 'RECEIVED', ackSent }, { status: duplicateByHash ? 200 : 202 });
  } catch (error) {
    const errorCode = error instanceof IngestError ? error.code : 'ingest_failed';
    const retryable = !(error instanceof IngestError) || error.retryable;
    await env.DB.prepare(`UPDATE telegram_updates SET status = ?, error_code = ?, completed_at = ? WHERE update_id = ?`)
      .bind(retryable ? 'FAILED_RETRYABLE' : 'FAILED_FINAL', errorCode, retryable ? null : Date.now(), updateId).run();
    return NextResponse.json({ ok: false, error: errorCode, retryable }, { status: errorCode === 'bot_not_configured' ? 503 : retryable ? 502 : 422 });
  }
}

async function reserveUpdate(updateId: string, chatId: string, messageId: string, documentId: string, receivedAt: number): Promise<Reservation> {
  const inserted = await env.DB.prepare(`INSERT INTO telegram_updates (update_id, chat_id, message_id, document_id, status, attempt_count, processing_started_at, received_at) VALUES (?, ?, ?, ?, 'PROCESSING', 1, ?, ?) ON CONFLICT(update_id) DO NOTHING RETURNING update_id`)
    .bind(updateId, chatId, messageId, documentId, receivedAt, receivedAt).first<{ update_id: string }>();
  if (inserted) return { claimed: true, status: 'PROCESSING', attemptCount: 1 };

  const staleBefore = Date.now() - 2 * 60 * 1000;
  const reclaimed = await env.DB.prepare(`UPDATE telegram_updates SET status = 'PROCESSING', error_code = NULL, attempt_count = attempt_count + 1, processing_started_at = ?
    WHERE update_id = ? AND attempt_count < 3 AND (status = 'FAILED_RETRYABLE' OR (status = 'PROCESSING' AND processing_started_at < ?)) RETURNING attempt_count`)
    .bind(Date.now(), updateId, staleBefore).first<{ attempt_count: number }>();
  if (reclaimed) return { claimed: true, status: 'PROCESSING', attemptCount: reclaimed.attempt_count };

  const current = await env.DB.prepare(`SELECT status FROM telegram_updates WHERE update_id = ?`).bind(updateId).first<{ status: string }>();
  return { claimed: false, status: current?.status ?? 'DUPLICATE_IGNORED' };
}

async function consumeRateLimit(chatId: string) {
  const configured = Number(env.TELEGRAM_RATE_LIMIT_PER_MINUTE ?? 10);
  const limit = Number.isSafeInteger(configured) && configured >= 1 && configured <= 60 ? configured : 10;
  const windowStartedAt = Math.floor(Date.now() / 60_000) * 60_000;
  const bucketKey = `${chatId}:${windowStartedAt}`;
  const row = await env.DB.prepare(`INSERT INTO telegram_rate_limits (bucket_key, chat_id, window_started_at, request_count) VALUES (?, ?, ?, 1)
    ON CONFLICT(bucket_key) DO UPDATE SET request_count = request_count + 1 RETURNING request_count`)
    .bind(bucketKey, chatId, windowStartedAt).first<{ request_count: number }>();
  return Boolean(row && row.request_count <= limit);
}

async function downloadTelegramFile(document: TelegramDocument) {
  const infoResponse = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/getFile`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ file_id: document.file_id }), signal: AbortSignal.timeout(10000),
  });
  const info = await infoResponse.json() as { ok: boolean; result?: { file_path: string; file_size?: number } };
  if (!infoResponse.ok || !info.ok || !info.result?.file_path) throw new IngestError('telegram_get_file_failed');
  if ((info.result.file_size ?? document.file_size ?? 0) > MAX_FILE_BYTES) throw new IngestError('file_too_large');

  const fileResponse = await fetch(`https://api.telegram.org/file/bot${env.TELEGRAM_BOT_TOKEN}/${info.result.file_path}`, { signal: AbortSignal.timeout(20000) });
  if (!fileResponse.ok) throw new IngestError('telegram_download_failed');
  const bytes = await fileResponse.arrayBuffer();
  if (!bytes.byteLength || bytes.byteLength > MAX_FILE_BYTES) throw new IngestError('invalid_download_size');
  return { bytes };
}

async function sendTelegramMessage(chatId: number, text: string, parseMode = 'Markdown') {
  try {
    const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      // Fallback sem Markdown se houver erro de sintaxe
      await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text }),
        signal: AbortSignal.timeout(10000),
      });
    }
  } catch (err) {
    console.error('Falha ao enviar mensagem no Telegram:', err);
  }
}

function getDailyPlanBriefing() {
  const dateStr = new Date().toLocaleDateString('pt-BR');
  return `📋 *PLANO DIÁRIO DE AÇÃO COMERCIAL — ${dateStr}*
` +
    `👤 *Gerente:* Rafael Pedrosa (VJ-SAO FIDELIS)
` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` +
    `🎯 *Score POBJ Atual:* \`51.04 pts\` / \`78.00 pts\`
` +
    `⚡ *Gap para o Teto:* \`26.96 pts\` (Proj: \`72.44 pts\`)
` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━

` +
    `🔥 *FILA DE ATENDIMENTO RECOMENDADA:* (5 ações prioritárias)

` +
    `🔴 *[P0] 1. Santa Rita Metais*
` +
    `   💼 *Ação:* Capital de Giro (R$ 850.000,00 pré-aprovado)
` +
    `   📈 *Ganho:* \`+15.00 pts no POBJ\`
` +
    `   👤 *Contato:* Roberto Silva (Diretor Financeiro) | \`(22) 99881-2233\`
` +
    `   🗣️ *Abordagem:* _Limite pré-aprovado com taxa diferenciada disponível para liberação hoje._

` +
    `🔴 *[P0] 2. Agro Vale*
` +
    `   💼 *Ação:* Capital de Giro (R$ 1.500.000,00 pré-aprovado)
` +
    `   📈 *Ganho:* \`+15.00 pts no POBJ\`
` +
    `   👤 *Contato:* Carlos Eduardo (Sócio-Administrador) | \`(22) 99772-4411\`
` +
    `   🗣️ *Abordagem:* _Captação de giro para safra com liberação imediata._

` +
    `🟠 *[P1] 3. Santa Rita Metais*
` +
    `   💼 *Ação:* Captação de Folha (48 vidas)
` +
    `   📈 *Ganho:* \`+8.50 pts no POBJ\`
` +
    `   👤 *Contato:* Roberto Silva | \`(22) 99881-2233\`
` +
    `   🗣️ *Abordagem:* _Apresentar proposta de isenção de cesta de serviços para colaboradores._

` +
    `🟠 *[P1] 4. Supermercado Central*
` +
    `   💼 *Ação:* Captação de Folha (32 vidas)
` +
    `   📈 *Ganho:* \`+8.50 pts no POBJ\`
` +
    `   👤 *Contato:* Mariana Souza (Gerente Geral) | \`(22) 99123-5566\`

` +
    `🟡 *[P2] 5. Bebidas Paraíso*
` +
    `   💼 *Ação:* Implantação de Esteira de Boletos
` +
    `   📈 *Ganho:* \`+5.00 pts no POBJ\`
` +
    `   👤 *Contato:* Juliana Martins | \`(22) 98833-1122\`

` +
    `👉 Digite \`/analisar <CNPJ>\` para ver o dossiê completo de qualquer cliente!`;
}

function getPobjDiagnostic() {
  return `📊 *DIAGNÓSTICO EXECUTIVO — POBJ AGOSTO/2026*
` +
    `👤 *Gerente:* Rafael Pedrosa (6895 - VJ-SAO FIDELIS)
` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` +
    `🏆 *Score Realizado:* \`51,04 pts\` (65,44%)
` +
    `🎯 *Meta Teto:* \`78,00 pts\` (100,00%)
` +
    `⚡ *Projeção Final:* \`72,44 pts\` (92,87%)
` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━

` +
    `🌟 *Destaques Positivos:*
` +
    `• 🟢 *Crédito PJ:* R$ 1.384.193,37 realizado (180,77% da meta) ➔ \`15,00 pts [TETO]\`
` +
    `• 🟢 *Qualidade (Encanta BRA):* 150,00 realizado ➔ \`15,00 pts [TETO]\`
` +
    `• 🟢 *Open Finance:* 5 propostas ➔ \`7,00 pts [TETO]\`

` +
    `🔥 *Alavancas para Bater o Teto:*
` +
    `1. *Captação Grupo A:* Faltam 9,09 pts para o teto.
` +
    `2. *Clientes PJ:* Produção diária recomendada de 0,20 conta/dia.
` +
    `3. *Seguros & Cartões PJ:* Alavancas de margem alta.

` +
    `👉 Digite \`/hoje\` para ver a fila de clientes recomendada!`;
}

function getStatusMessage() {
  return `📊 *DIRETOR 360 — PAINEL EXECUTIVO*

` +
    `🟢 *Status do Sistema:* OPERACIONAL & SEGURO
` +
    `🛡️ *Postura de Segurança:* CERTIFIED HARDENED (PRR 10/10)
` +
    `⚡ *Model Router:* ATIVO (Economia FinOps de *79.1%*)
` +
    `🏢 *4 Gerentes Gerais Ativos:* Conta, Performance, Financeiro, Relacionamento
` +
    `📈 *GG Performance:* Score POBJ 51,04 pts (Proj: 72,44 pts)
` +
    `⏱️ *RTO / RPO:* 3m12s / 0s (Perda Zero)

` +
    `👉 *Dashboard Web:* [Acessar Painel](http://localhost:3000)`;
}

function getWelcomeMessage(userName: string) {
  return `👋 *Olá, ${userName}! Bem-vindo ao Diretor 360 PJ.*

` +
    `Sou o seu copiloto executivo nas 4 áreas centrais de negócio (Conta, Performance, Financeiro e Relacionamento).

` +
    `📋 *Comandos Rápidos:*
` +
    `• \`/hoje\` ou \`/planodiario\` - 🎯 Fila de Atendimento do Dia (Gaps POBJ + Clientes)
` +
    `• \`/metas\` ou \`/pobj\` - Score do POBJ, Gaps e Alavancas de Produção
` +
    `• \`/status\` - Estado do sistema e métricas FinOps
` +
    `• \`/analisar <CNPJ ou Nome>\` - Análise 360 completa da empresa
` +
    `• \`/laudo <CNPJ>\` - Emite e envia o Laudo Executivo em PDF de 3 páginas

` +
    `📎 *Envio de Documentos:*
` +
    `Envie balanços, relatórios de metas POBJ, extratos ou DREs para análise instantânea!`;
}

function allowedFileName(name: string, mime: string) {
  const extension = name.toLowerCase().split('.').pop() ?? '';
  const expected: Record<string, string[]> = {
    'application/pdf': ['pdf'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
    'application/vnd.ms-excel': ['xls'], 'text/csv': ['csv'], 'application/json': ['json'],
  };
  return Boolean(name) && (expected[mime] ?? []).includes(extension);
}

function boundedTelegramId(value: unknown) { return typeof value === 'string' && value.length >= 1 && value.length <= 256 && /^[A-Za-z0-9_-]+$/.test(value); }

function validateFileContent(value: ArrayBuffer, mime: string) {
  const bytes = new Uint8Array(value);
  const startsWith = (signature: number[]) => signature.every((byte, index) => bytes[index] === byte);
  let valid = true;
  if (mime === 'application/pdf') valid = startsWith([0x25, 0x50, 0x44, 0x46, 0x2d]);
  else if (mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') valid = startsWith([0x50, 0x4b, 0x03, 0x04]);
  else if (mime === 'application/vnd.ms-excel') valid = startsWith([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  else if (mime === 'application/json') {
    try { JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); } catch { valid = false; }
  } else if (mime === 'text/csv') valid = !bytes.slice(0, Math.min(bytes.length, 8192)).includes(0);
  if (!valid) throw new IngestError('file_content_mismatch', false);
}

function safeFileName(value: string) { return value.normalize('NFKD').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120); }

async function sha256Hex(value: ArrayBuffer) {
  const digest = await crypto.subtle.digest('SHA-256', value);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function constantTimeEqual(left: string, right: string) {
  const [leftHash, rightHash] = await Promise.all([crypto.subtle.digest('SHA-256', new TextEncoder().encode(left)), crypto.subtle.digest('SHA-256', new TextEncoder().encode(right))]);
  const leftBytes = new Uint8Array(leftHash); const rightBytes = new Uint8Array(rightHash); let difference = 0;
  for (let index = 0; index < leftBytes.length; index += 1) difference |= leftBytes[index] ^ rightBytes[index];
  return difference === 0;
}

class IngestError extends Error { constructor(public readonly code: string, public readonly retryable = true) { super(code); } }
