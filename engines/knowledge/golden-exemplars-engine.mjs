/**
 * engines/knowledge/golden-exemplars-engine.mjs
 * Marco N2.3.2 — Repositório de Exemplares Dourados Dinâmicos (Dynamic Few-Shot Learning)
 * Governança N23-09:
 * - Nenhum dado operacional de clientes reais fica codificado no JavaScript.
 * - O repositório real é persistido na tabela golden_exemplars no PostgreSQL.
 * - Em caso de não-correspondência segura, o motor retorna null (elimina fallback inseguro).
 */

import { randomUUID } from "node:crypto";

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
 * Fixtures Sintéticas Canônicas para Testes Unitários e Replay (Dados 100% Descaracterizados)
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
    status: "ACTIVE"
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    tenant_id: "default",
    sector: SECTORS.METALMECANICA,
    objective: OBJECTIVES.COBRANCA_PIX,
    client_name: "Metalúrgica Sintética Modelo Ltda",
    channel: "WHATSAPP",
    approved_text:
      "Olá, Sr. Modelo, tudo bem? Aqui é o Rafael do Banco do Brasil. Conseguimos habilitar nossa Cobrança Híbrida com QR Code PIX D+0 a R$ 1,80, gerando economia imediata nas tarifas da empresa. Consegue me atender amanhã às 10h? Abraço!",
    author: "RAFAEL",
    rating: 5,
    status: "ACTIVE"
  }
];

/**
 * Cria um exemplar dourado para persistência no banco de dados.
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
  const idempotency_key = `ge:${tenant_id}:${sector}:${objective}:${channel}:${hashString(approved_text.trim())}`;

  return {
    id,
    tenant_id,
    sector: String(sector).toUpperCase().trim(),
    objective: String(objective).toUpperCase().trim(),
    client_name: String(client_name).trim(),
    channel: String(channel).toUpperCase().trim(),
    approved_text: approved_text.trim(),
    author,
    rating: Math.min(5, Math.max(1, Number(rating))),
    status: "ACTIVE",
    approved_by: author,
    approved_at: new Date().toISOString(),
    idempotency_key,
    tags,
    created_at: new Date().toISOString()
  };
}

/**
 * Encontra o melhor exemplar por similaridade de setor e objetivo comercial.
 * Governança N23-09: Se não houver correspondência compatível, retorna null.
 */
export function findBestGoldenExemplar({
  tenant_id = "default",
  sector = SECTORS.GERAL,
  objective = OBJECTIVES.FOLHA_PAGAMENTO,
  channel = "WHATSAPP",
  exemplars = SYNTHETIC_TEST_EXEMPLARS
}) {
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

  // Governança N23-09: NUNCA retornar exemplar[0] arbitrário. Retorna null se não houver match.
  return null;
}

/**
 * Formata o bloco Dynamic Few-Shot para injeção no prompt de subagentes.
 */
export function formatFewShotExemplarBlock(exemplar) {
  if (!exemplar) return "";

  return (
    `\n### EXEMPLO DE REFERÊNCIA DE TOM E ESTILO (APROVADO POR RAFAEL - NOTA 5/5):\n` +
    `> Contexto: [Setor: ${exemplar.sector} | Objetivo: ${exemplar.objective} | Canal: ${exemplar.channel}]\n` +
    `"""\n${exemplar.approved_text}\n"""\n` +
    `👉 IMPORTANTE: Imite a concisão e o tom profissional deste exemplo. ` +
    `NUNCA copie nomes ou valores deste exemplo para o caso atual; use estritamente os fatos da empresa em análise.\n`
  );
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}