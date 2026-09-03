/**
 * engines/knowledge/golden-exemplars-engine.mjs
 * Marco N2.3.2 — Repositório de Exemplares Dourados Dinâmicos (Dynamic Few-Shot Learning)
 * Governança N23-R05:
 * - Nenhum dado operacional de clientes reais fica codificado no JavaScript.
 * - Exemplares nascem obrigatoriamente como CANDIDATE.
 * - Em caso de não-correspondência ou conjunto vazio, retorna null (zero fallback sintético em produção).
 * - Idempotência protegida por SHA-256 canônico.
 */

import { randomUUID } from "node:crypto";
import { sha256Hex, PROMOTION_MODES } from "../learning/learning-engine.mjs";

export const SECTORS = {
  HOSPITALAR: "HOSPITALAR",
  METALMECANICA: "METALMECANICA",
  AGRO: "AGRO",
  SERVICOS: "SERVICOS",
  GERAL: "GERAL"
};

export const OBJECTIVES = {
  FOLHA_PAGAMENTO: "FOLHA_PAGAMENTO",
  COBRANCA_PIX: "COBRANCA_PIX",
  CREDITO_GIRO: "CREDITO_GIRO",
  RECUPERACAO_VENCIDOS: "RECUPERACAO_VENCIDOS"
};

/**
 * Fixtures Sintéticas para Testes Unitários Isolados (NUNCA USADAS COMO FALLBACK DE PRODUCAO)
 */
export const SYNTHETIC_TEST_EXEMPLARS = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    tenant_id: "default",
    sector: SECTORS.HOSPITALAR,
    objective: OBJECTIVES.FOLHA_PAGAMENTO,
    client_name: "Hospital Sintético Modelo S/A",
    channel: "WHATSAPP",
    approved_text:
      "Olá, Dr. Modelo, tudo bem? Aqui é o Rafael do Banco do Brasil. Estruturamos uma proposta com abertura de contas presencial na agência sem sobrecarregar o seu RH. Podemos tomar um café amanhã para alinhar os detalhes? Um abraço!",
    author: "RAFAEL",
    rating: 5,
    status: "ACTIVE",
    promotion_mode: "OWNER_EXPLICIT"
  }
];

/**
 * Cria um exemplar dourado candidato para persistência no banco de dados.
 */
export function createGoldenExemplar({
  tenant_id = "default",
  sector = SECTORS.GERAL,
  objective = OBJECTIVES.FOLHA_PAGAMENTO,
  client_name = "Cliente Referência",
  channel = "WHATSAPP",
  approved_text,
  author = "RAFAEL",
  rating = 5,
  tags = []
}) {
  if (!approved_text || !approved_text.trim()) {
    throw new Error("approved_text obrigatório");
  }

  const id = randomUUID();
  const cleanText = approved_text.trim();
  const idempotency_key = `ge:${tenant_id}:${sector}:${objective}:${channel}:${sha256Hex(cleanText)}`;

  return {
    id,
    tenant_id,
    sector: String(sector).toUpperCase().trim(),
    objective: String(objective).toUpperCase().trim(),
    client_name: String(client_name).trim(),
    channel: String(channel).toUpperCase().trim(),
    approved_text: cleanText,
    author,
    rating: Math.min(5, Math.max(1, Number(rating))),
    status: "CANDIDATE", // N23-R05: Padrão CANDIDATE
    approved_by: null,
    approved_at: null,
    promotion_mode: null,
    promotion_score: null,
    idempotency_key,
    tags,
    created_at: new Date().toISOString()
  };
}

/**
 * Promove um exemplar dourado para ACTIVE.
 */
export function promoteGoldenExemplar(exemplar, {
  approved_by = "RAFAEL",
  promotion_mode = PROMOTION_MODES.OWNER_EXPLICIT,
  promotion_score = 1.00,
  learning_run_id = null
} = {}) {
  return {
    ...exemplar,
    status: "ACTIVE",
    approved_by: promotion_mode === PROMOTION_MODES.AUTO ? "SYSTEM_LEARNING_ENGINE" : approved_by,
    approved_at: new Date().toISOString(),
    promotion_mode,
    promotion_score: Number(promotion_score),
    learning_run_id: learning_run_id || (promotion_mode === PROMOTION_MODES.AUTO ? `run-${randomUUID()}` : null)
  };
}

/**
 * Encontra o melhor exemplar por similaridade de setor e objetivo comercial.
 * Governança N23-R05:
 * - O argumento padrão de exemplares é VAZIO (elimina contaminação sintética em produção).
 * - Se não houver correspondência, retorna estritamente null.
 */
export function findBestGoldenExemplar({
  tenant_id = "default",
  sector = SECTORS.GERAL,
  objective = OBJECTIVES.FOLHA_PAGAMENTO,
  channel = "WHATSAPP",
  exemplars = [] // N23-R05: Zero fixtures no default de produção
}) {
  if (!Array.isArray(exemplars) || exemplars.length === 0) {
    return null;
  }

  const normSector = String(sector).toUpperCase().trim();
  const normObjective = String(objective).toUpperCase().trim();
  const normChannel = String(channel).toUpperCase().trim();

  const activePool = exemplars.filter(
    (e) => e.status === "ACTIVE" && e.rating === 5 && (!e.tenant_id || e.tenant_id === tenant_id)
  );

  // 1. Match perfeito: setor + objetivo + canal
  const exact = activePool.find(
    (e) => e.sector === normSector && e.objective === normObjective && e.channel === normChannel
  );
  if (exact) return exact;

  // 2. Match de objetivo + canal
  const byObjective = activePool.find(
    (e) => e.objective === normObjective && e.channel === normChannel
  );
  if (byObjective) return byObjective;

  // 3. Match de setor
  const bySector = activePool.find((e) => e.sector === normSector);
  if (bySector) return bySector;

  return null;
}

/**
 * Formata o bloco Dynamic Few-Shot para injeção no prompt de subagentes.
 */
export function formatFewShotExemplarBlock(exemplar) {
  if (!exemplar || !exemplar.approved_text) {
    return "";
  }

  return (
    `\n### EXEMPLAR DOURADO DE REFERÊNCIA (ESTILO E TOM DE VOZ COMERCIAL NOTA 5/5):\n` +
    `> Utilize o tom, concisão e apelo comercial do exemplar abaixo para redigir sua abordagem. ` +
    `Adapte estritamente os dados e nomes para a empresa atual:\n` +
    `"${exemplar.approved_text}"\n`
  );
}