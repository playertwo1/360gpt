/**
 * engines/orchestration/contextual-reference-engine.mjs
 * Marco N2.2.5 — Resolução de Referências Contextuais e Conversas Contínuas
 */

export function resolveContextualReference({
  currentText = "",
  conversationHistory = []
}) {
  const text = currentText.trim();
  const normalized = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  // Procurar antecedentes no histórico recente (ordem cronológica inversa)
  let lastMentionedEntity = null;
  let lastMentionedIndicator = null;

  for (let i = conversationHistory.length - 1; i >= 0; i--) {
    const item = conversationHistory[i];
    const prevText = String(item.text || item.content || "").toLowerCase();
    const prevNormalized = prevText.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (!lastMentionedEntity) {
      if (prevNormalized.includes("sao lucas") || prevNormalized.includes("hospital")) {
        lastMentionedEntity = { name: "Hospital & Maternidade São Lucas S/A", cnpj: "01.234.567/0001-89" };
      } else if (prevNormalized.includes("forja") || prevNormalized.includes("metalurgica")) {
        lastMentionedEntity = { name: "Metalúrgica Forja Sul Ltda", cnpj: "12.345.678/0001-90" };
      }
    }

    if (!lastMentionedIndicator) {
      if (prevNormalized.includes("folha")) lastMentionedIndicator = "CONQUISTA_FOLHA_PAGAMENTO";
      else if (prevNormalized.includes("boleto") || prevNormalized.includes("cobranca") || prevNormalized.includes("pix")) lastMentionedIndicator = "FATURAMENTO_BOLETO_PIX";
      else if (prevNormalized.includes("credito") || prevNormalized.includes("rotativo")) lastMentionedIndicator = "PRODUCAO_CREDITO_PJ";
    }

    if (lastMentionedEntity && lastMentionedIndicator) break;
  }

  // 1. Checar referência a empresa ("essa empresa", "a empresa anterior", "o hospital")
  const isReferringToEntity =
    normalized.includes("essa empresa") ||
    normalized.includes("a empresa anterior") ||
    normalized.includes("esse cliente") ||
    normalized.includes("o cliente anterior");

  if (isReferringToEntity) {
    if (!lastMentionedEntity) {
      return {
        resolved: false,
        requires_clarification: true,
        clarification_question: "A qual empresa da carteira você está se referindo para continuarmos a análise?",
        enriched_text: text
      };
    }
    return {
      resolved: true,
      resolved_entity: lastMentionedEntity,
      enriched_text: text.replace(/essa empresa|a empresa anterior|esse cliente|o cliente anterior/gi, lastMentionedEntity.name)
    };
  }

  // 2. Checar referência a indicador ("essa linha", "essa esteira", "esse produto")
  const isReferringToIndicator =
    normalized.includes("essa linha") ||
    normalized.includes("essa esteira") ||
    normalized.includes("esse indicador");

  if (isReferringToIndicator) {
    if (!lastMentionedIndicator) {
      return {
        resolved: false,
        requires_clarification: true,
        clarification_question: "A qual linha de indicador você se refere (Folha, Cobrança ou Crédito)?",
        enriched_text: text
      };
    }
    return {
      resolved: true,
      resolved_indicator: lastMentionedIndicator,
      enriched_text: text.replace(/essa linha|essa esteira|esse indicador/gi, lastMentionedIndicator)
    };
  }

  // 3. Incremento contextual ("e se forem mais duas?", "e se forem mais 3?")
  const moreMatch = normalized.match(/e\s+se\s+forem\s+mais\s+(\d+)/i);
  if (moreMatch) {
    return {
      resolved: true,
      incremental_quantity: Number(moreMatch[1]),
      is_incremental_simulation: true,
      resolved_indicator: lastMentionedIndicator || "CRESCIMENTO_LIQUIDO_PJ",
      enriched_text: `Simulação de +${moreMatch[1]} unidades na esteira ${lastMentionedIndicator || "de Contas PJ"}`
    };
  }

  return {
    resolved: true,
    enriched_text: text,
    is_direct: true
  };
}