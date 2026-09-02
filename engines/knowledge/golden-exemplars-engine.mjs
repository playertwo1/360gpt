/**
 * engines/knowledge/golden-exemplars-engine.mjs
 * Marco N2.3.2 — Repositório de Exemplares Dourados Dinâmicos (Dynamic Few-Shot Learning)
 * O subagente aprende a escrever imitando abordagens aprovadas por Rafael com nota 5/5.
 */

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
 * Exemplares Dourados Canônicos Iniciais (Aprovados por Rafael na Agência 6895)
 */
export const CANONICAL_EXEMPLARS = [
  {
    id: "exemplar-01",
    sector: SECTORS.HOSPITALAR,
    objective: OBJECTIVES.FOLHA_PAGAMENTO,
    client_name: "Hospital & Maternidade São Lucas S/A",
    channel: "WHATSAPP",
    approved_text:
      "Olá, Dr. Arnaldo, tudo bem? Aqui é o Rafael, gerente da sua conta no Banco do Brasil. Estive analisando a folha dos seus 280 colaboradores e estruturamos uma proposta com abertura de contas presencial na agência sem sobrecarregar o seu RH, além de pacote de benefícios exclusivo para o corpo clínico. Podemos tomar um café rápido amanhã para alinhar os detalhes? Um abraço!",
    author: "RAFAEL",
    rating: 5
  },
  {
    id: "exemplar-02",
    sector: SECTORS.METALMECANICA,
    objective: OBJECTIVES.COBRANCA_PIX,
    client_name: "Metalúrgica Forja Sul Ltda",
    channel: "WHATSAPP",
    approved_text:
      "Olá, Sr. Cláudio, tudo bem? Aqui é o Rafael do Banco do Brasil. Fizemos um levantamento do seu volume mensal de emissão de boletos (cerca de R$ 420 mil) e conseguimos habilitar nossa Cobrança Híbrida com QR Code PIX D+0 a R$ 1,80, gerando economia imediata nas tarifas da empresa. Além disso, gostaria de alinhar a regularização dos títulos em aberto para mantermos seus limites de giro 100% livres. Consegue me atender amanhã às 10h? Abraço!",
    author: "RAFAEL",
    rating: 5
  }
];

/**
 * Encontra o melhor exemplar por similaridade de setor e objetivo comercial.
 */
export function findBestGoldenExemplar({
  sector = SECTORS.GERAL,
  objective = OBJECTIVES.FOLHA_PAGAMENTO,
  channel = "WHATSAPP",
  exemplars = CANONICAL_EXEMPLARS
}) {
  const normSector = String(sector).toUpperCase().trim();
  const normObjective = String(objective).toUpperCase().trim();
  const normChannel = String(channel).toUpperCase().trim();

  // 1. Match perfeito: setor + objetivo + canal
  const exact = exemplars.find(
    (e) => e.sector === normSector && e.objective === normObjective && e.channel === normChannel
  );
  if (exact) return exact;

  // 2. Match de objetivo + canal
  const byObjective = exemplars.find(
    (e) => e.objective === normObjective && e.channel === normChannel
  );
  if (byObjective) return byObjective;

  // 3. Match de setor
  const bySector = exemplars.find((e) => e.sector === normSector);
  if (bySector) return bySector;

  // 4. Fallback padrão
  return exemplars[0] || null;
}

/**
 * Formata o bloco Dynamic Few-Shot para injeção no prompt de subagentes.
 */
export function formatFewShotExemplarBlock(exemplar) {
  if (!exemplar) return "";

  return (
    `\n### EXEMPLO DOURADO DE REFERÊNCIA (ESTILO REAL APROVADO POR RAFAEL - NOTA 5/5):\n` +
    `• Contexto: [Setor: ${exemplar.sector} | Objetivo: ${exemplar.objective} | Canal: ${exemplar.channel}]\n` +
    `• Mensagem de Referência:\n` +
    `"""\n${exemplar.approved_text}\n"""\n` +
    `👉 IMPORTANTE: Imite a objetividade, o calor profissional e a concisão deste exemplo ao formular a nova mensagem.\n`
  );
}