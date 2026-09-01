export type TelegramSendResult = { messageId: string; partIndex: number; partCount: number };

const TELEGRAM_SAFE_LIMIT = 3600;

export function splitTelegramText(text: string, limit = TELEGRAM_SAFE_LIMIT) {
  const normalized = String(text ?? '').replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];
  const parts: string[] = [];
  let remaining = normalized;
  while (remaining.length > limit) {
    const window = remaining.slice(0, limit);
    const paragraph = window.lastIndexOf('\n\n');
    const line = window.lastIndexOf('\n');
    const sentence = Math.max(window.lastIndexOf('. '), window.lastIndexOf('; '));
    const cut = paragraph > limit * 0.55 ? paragraph : line > limit * 0.65 ? line : sentence > limit * 0.7 ? sentence + 1 : limit;
    parts.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }
  if (remaining) parts.push(remaining);
  return parts;
}

export async function sendTelegramText(token: string, chatId: number, text: string, replyToMessageId?: number) {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, ...(replyToMessageId ? { reply_parameters: { message_id: replyToMessageId } } : {}) }),
    signal: AbortSignal.timeout(10000),
  });
  const payload = await response.json().catch(() => ({})) as { ok?: boolean; result?: { message_id?: number }; description?: string };
  if (!response.ok || !payload.ok || !payload.result?.message_id) throw new Error(`telegram_send_${response.status}_${payload.description ?? 'failed'}`);
  return String(payload.result.message_id);
}

export async function sendTelegramParts(token: string, chatId: number, text: string) {
  const bodies = splitTelegramText(text);
  const total = bodies.length;
  const sent: TelegramSendResult[] = [];
  for (let index = 0; index < total; index += 1) {
    const prefix = total > 1 ? `Parte ${index + 1}/${total}\n\n` : '';
    const messageId = await sendTelegramText(token, chatId, `${prefix}${bodies[index]}`);
    sent.push({ messageId, partIndex: index + 1, partCount: total });
  }
  return sent;
}

export const TELEGRAM_COMMANDS = [
  { command: 'comandos', description: 'Ver todos os comandos' },
  { command: 'ajuda', description: 'Abrir ajuda e comandos' },
  { command: 'menu', description: 'Abrir menu geral' },
  { command: 'status', description: 'Saúde do sistema e da fila' },
  { command: 'progresso', description: 'Progresso do arquivo atual e diagnóstico' },
  { command: 'andamento', description: 'Progresso do arquivo atual e diagnóstico' },
  { command: 'ultimo', description: 'Último parecer concluído' },
  { command: 'protocolo', description: 'Consultar um protocolo' },
  { command: 'pendencias', description: 'Ver itens pendentes' },
  { command: 'duvidas', description: 'Perguntas aguardando resposta' },
  { command: 'tentar', description: 'Tentar novamente um protocolo' },
  { command: 'pobj', description: 'Último panorama POBJ' },
  { command: 'prioridades', description: 'Prioridades de Performance' },
  { command: 'riscos', description: 'Riscos e gaps atuais' },
  { command: 'cenarios', description: 'Cenários conferíveis' },
  { command: 'historico', description: 'Histórico de relatórios' },
  { command: 'fontes', description: 'Fontes de um protocolo' },
  { command: 'evidencias', description: 'Evidências de um protocolo' },
  { command: 'explicar', description: 'Explicar como o resultado foi gerado' },
  { command: 'corrigir', description: 'Iniciar correção supervisionada' },
  { command: 'reabrir', description: 'Reabrir análise incompleta' },
  { command: 'destravar', description: 'Destravar e reprocessar jobs travados' },
  { command: 'reprocessartodos', description: 'Reprocessar todos os jobs travados' },
  { command: 'hoje', description: 'Plano diário sem dados inventados' },
  { command: 'meusdados', description: 'Listar seus documentos' },
  { command: 'privacidade', description: 'Uso e retenção dos dados' },
  { command: 'conhecimento', description: 'Ver regras e mapeamentos homologados' },
  { command: 'aprovar', description: 'Aprovar candidato de conhecimento' },
  { command: 'revogarregra', description: 'Revogar conhecimento homologado' },
] as const;

export function telegramCommandMenu() {
  return [
    'COMANDOS DO DIRETOR 360',
    '',
    'GERAL',
    '/status — saúde do sistema e fila',
    '/progresso ou /andamento — progresso em % e diagnóstico de travamento',
    '/ultimo — último parecer concluído',
    '/protocolo <id> — situação de um arquivo',
    '/pendencias — processamentos e revisões',
    '/duvidas — perguntas aguardando sua resposta',
    '/cancelar <protocolo> — solicitar cancelamento',
    '/tentar novamente <protocolo> — repetir falha recuperável',
    '/destravar ou /reprocessartodos — reabrir todos os jobs travados',
    '',
    'PERFORMANCE',
    '/pobj ou /metas — panorama POBJ real',
    '/prioridades — indicadores prioritários',
    '/riscos — riscos e gaps',
    '/cenarios — cenários com regras homologadas',
    '/indicador <nome> — detalhe de indicador',
    '/comparar <protocolo1> <protocolo2> — comparar relatórios',
    '/historico [mês] — histórico',
    '/fontes <protocolo> — fontes usadas',
    '/evidencias <protocolo> — evidências do resultado',
    '/hoje ou /planodiario — prioridades do dia',
    '',
    'CORREÇÃO E GOVERNANÇA',
    '/corrigir <protocolo> — corrigir de forma supervisionada',
    '/responder <protocolo> — responder pendência',
    '/reabrir <protocolo> — solicitar reabertura',
    '/explicar <protocolo> — explicar o resultado',
    '/privacidade — retenção e uso dos dados',
    '/meusdados — listar seus documentos',
    '/excluir <protocolo> — solicitar exclusão/revogação',
    '/conhecimento — listar conhecimento POBJ homologado',
    '/aprovar <id> — aprovar candidato selecionado',
    '/revogarregra <id> — revogar regra ou mapeamento',
    '',
    'Ações críticas exigem /confirmar <código>.',
  ].join('\n');
}

export async function registerTelegramCommands(token: string) {
  const response = await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ commands: TELEGRAM_COMMANDS }), signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`telegram_commands_${response.status}`);
}
