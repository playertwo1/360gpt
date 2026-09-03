/**
 * lib/telegram-runtime.ts
 * Adaptador neutro de transporte para canal Telegram.
 * 
 * Regra Arquitetural: Não contém lógica de negócio, não executa comandos,
 * não acessa banco de dados diretamente e não altera estado de documento ou POBJ.
 * Toda a inteligência reside nos workflows n8n e nos motores determinísticos.
 */

import { repairMojibake } from './clarification-ai';

export interface TelegramEnvelope {
  update_id: number;
  message_id?: number;
  chat_id: string;
  sender_is_bot: boolean;
  text?: string;
  command?: string;
  raw_payload: Record<string, unknown>;
}

export function parseTelegramCommand(text: string): { command: string | null; args: string[]; rawArgs: string } {
  const normalized = repairMojibake(text).trim().replace(/\s+/g, ' ');
  if (!normalized.startsWith('/')) {
    return { command: null, args: [], rawArgs: normalized };
  }
  const [head = '', ...rest] = normalized.split(' ');
  const command = head.toLowerCase().split('@')[0] || null;
  return { command, args: rest, rawArgs: rest.join(' ') };
}

export function sanitizeTelegramMarkdown(text: string): string {
  return repairMojibake(text);
}