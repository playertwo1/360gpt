/**
 * engines/memory/memory-manager-engine.mjs
 * Marco N2.3 — AGENT-MEMORY-MANAGER
 * Responsável por decidir o que manter, esquecer, consolidar ou encaminhar para revisão.
 * Integra Memória Bruta (Episódica), Semântica e Estruturada.
 */

import { randomUUID } from 'node:crypto';
import { sha256Hex } from '../learning/learning-engine.mjs';

export const MEMORY_TYPES = {
  FACT: 'FACT',
  PREFERENCE: 'PREFERENCE',
  RULE: 'RULE',
  ERROR: 'ERROR',
  STRATEGY: 'STRATEGY'
};

export const MEMORY_SCOPES = {
  GLOBAL: 'GLOBAL',
  DOMAIN: 'DOMAIN',
  CLIENT: 'CLIENT',
  OPERATION: 'OPERATION'
};

/**
 * Registra uma interação na memória bruta episódica.
 */
export function createEpisodicRecord({
  tenant_id = 'default',
  owner_id = 'rafael',
  channel = 'TELEGRAM',
  chat_id,
  direction = 'INBOUND',
  actor_role = 'OWNER',
  content,
  metadata = {}
}) {
  if (!chat_id || !content) {
    throw new Error('chat_id e content são obrigatórios para memória episódica');
  }

  const id = randomUUID();
  const cleanContent = String(content).trim();
  const content_hash = sha256Hex(cleanContent);

  return {
    id,
    tenant_id,
    owner_id,
    channel,
    chat_id: String(chat_id),
    direction,
    actor_role,
    content: cleanContent,
    content_hash,
    metadata,
    created_at: new Date().toISOString()
  };
}

/**
 * Cria ou atualiza um fato na memória estruturada.
 */
export function createStructuredMemoryRecord({
  tenant_id = 'default',
  owner_id = 'rafael',
  memory_type = MEMORY_TYPES.FACT,
  scope = MEMORY_SCOPES.DOMAIN,
  target_ref = 'GERAL',
  data = {},
  confidence_score = 1.00,
  origin = 'OWNER_PROVIDED',
  evidence_node_id = null
}) {
  const id = randomUUID();
  const idempotency_key = `sm:${tenant_id}:${memory_type}:${scope}:${target_ref}:${sha256Hex(data)}`;
  const now = new Date();
  const validTo = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  return {
    id,
    tenant_id,
    owner_id,
    memory_type,
    scope,
    target_ref: String(target_ref).trim(),
    data,
    confidence_score: Number(confidence_score.toFixed(2)),
    status: 'ACTIVE',
    origin,
    evidence_node_id,
    idempotency_key,
    valid_from: now.toISOString(),
    valid_to: validTo.toISOString(),
    created_at: now.toISOString(),
    updated_at: now.toISOString()
  };
}