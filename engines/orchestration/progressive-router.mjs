/**
 * engines/orchestration/progressive-router.mjs
 * Marco N2.2.4 — Roteamento Multidomínio Progressivo & Reconciliação Fina
 */

export const ALL_DOMAINS = ["performance", "conta", "relacionamento", "financeiro"];

export function routeRequestProgressively({
  text = "",
  hasEntityMention = false,
  hasStrategyRequest = false,
  hasFinancialQuery = false
}) {
  const normalized = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const selectedDomains = [];
  const domainDecisions = {};

  // 1. Domínio Performance
  const isPerformance =
    normalized.includes("pobj") ||
    normalized.includes("meta") ||
    normalized.includes("ponto") ||
    normalized.includes("gap") ||
    normalized.includes("atingimento") ||
    normalized.includes("indicador");

  if (isPerformance || !hasEntityMention) {
    selectedDomains.push("performance");
    domainDecisions.performance = {
      status: "INCLUDED",
      reason: "Consulta de metas, gaps operacionais ou pontuação do POBJ."
    };
  } else {
    domainDecisions.performance = {
      status: "EXCLUDED",
      reason: "Demanda restrita a cadastro ou relacionamento pontual sem impacto em metas."
    };
  }

  // 2. Domínio Conta
  const isConta =
    hasEntityMention ||
    normalized.includes("conta") ||
    normalized.includes("empresa") ||
    normalized.includes("carteira") ||
    normalized.includes("cnpj") ||
    normalized.includes("elegivel") ||
    normalized.includes("cliente");

  if (isConta) {
    selectedDomains.push("conta");
    domainDecisions.conta = {
      status: "INCLUDED",
      reason: "Identificação de empresa corporativa, dados cadastrais ou elegibilidade da carteira."
    };
  } else {
    domainDecisions.conta = {
      status: "EXCLUDED",
      reason: "Não há menção a empresa específica ou necessidade de cruzamento de carteira."
    };
  }

  // 3. Domínio Relacionamento
  const isRelacionamento =
    hasStrategyRequest ||
    normalized.includes("reuniao") ||
    normalized.includes("contato") ||
    normalized.includes("socio") ||
    normalized.includes("decisor") ||
    normalized.includes("objecao") ||
    normalized.includes("abordagem") ||
    normalized.includes("falar com");

  if (isRelacionamento) {
    selectedDomains.push("relacionamento");
    domainDecisions.relacionamento = {
      status: "INCLUDED",
      reason: "Demanda de inteligência de contato, sócios, compromissos ou pauta de abordagem comercial."
    };
  } else {
    domainDecisions.relacionamento = {
      status: "EXCLUDED",
      reason: "Não há solicitação de abordagem, contato interpessoal ou histórico de reuniões."
    };
  }

  // 4. Domínio Financeiro
  const isFinanceiro =
    hasFinancialQuery ||
    normalized.includes("receita") ||
    normalized.includes("orcamento") ||
    normalized.includes("margem") ||
    normalized.includes("faturamento") ||
    normalized.includes("quanto rende") ||
    normalized.includes("impacto financeiro");

  if (isFinanceiro) {
    selectedDomains.push("financeiro");
    domainDecisions.financeiro = {
      status: "INCLUDED",
      reason: "Cálculo de retorno financeiro, receita estimada ou análise de variância orçamentária."
    };
  } else {
    domainDecisions.financeiro = {
      status: "EXCLUDED",
      reason: "Não há exigência de precificação ou análise de impacto orçamentário."
    };
  }

  return {
    router_version: "2.2.4",
    routed_at: new Date().toISOString(),
    selected_domains: selectedDomains,
    domain_decisions: domainDecisions,
    coordination_rule: "STRICT_VERTICAL_DIRECTOR_ORCHESTRATION",
    allow_side_calls: false
  };
}