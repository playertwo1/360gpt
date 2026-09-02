/**
 * engines/orchestration/layered-memory-engine.mjs
 * Motor de Memória Operacional em 4 Camadas e Aprendizagem Supervisionada (Marco N2.2.1).
 * Conforme AGENTS.md v2.2.
 */

export const MEMORY_LAYERS = {
  LAYER_1_SESSION: "SESSION_EPHEMERAL",
  LAYER_2_CONFIRMED_FACTS: "CONFIRMED_FACTS_ENTITY",
  LAYER_3_OWNER_DIRECTIVES: "OWNER_DIRECTIVES_PREFERENCES",
  LAYER_4_NORMATIVE_POLICY: "NORMATIVE_GOVERNANCE_POLICY"
};

/**
 * Monta o contexto minimizado e seguro para um agente, evitando contaminação temporal ou cruzada.
 */
export function assembleAgentContext({
  agentDomain = "performance",
  entityRef = null,
  period = "2026-08",
  recentInteractions = [],
  accountData = null,
  ownerDirectives = []
}) {
  // Camada 1: Sessão recente (máximo 6 a 10 interações)
  const sessionInteractions = recentInteractions.slice(-8);

  // Camada 2: Fatos confirmados escopados por entidade e período
  const entityFacts = [];
  if (accountData && (!entityRef || accountData.cnpj === entityRef)) {
    entityFacts.push({
      layer: MEMORY_LAYERS.LAYER_2_CONFIRMED_FACTS,
      entity_ref: accountData.cnpj,
      razao_social: accountData.razao_social,
      period,
      employees: accountData.employees_count,
      revenue_12m: accountData.months_revenue_12m,
      payroll_active: accountData.payroll_active,
      billing_active: accountData.billing_active,
      provenance: "CONFIRMED_DATABASE"
    });
  }

  // Camada 3: Diretrizes operacionais e preferências de Rafael
  const activeDirectives = ownerDirectives
    .filter(d => !d.scope_domain || d.scope_domain === agentDomain || d.scope_domain === "all")
    .map(d => ({
      layer: MEMORY_LAYERS.LAYER_3_OWNER_DIRECTIVES,
      directive_id: d.id,
      title: d.title,
      approved_by: "RAFAEL",
      valid_until: d.valid_until || "PERMANENT"
    }));

  // Camada 4: Política normativa e governança do domínio
  const normativePolicy = {
    layer: MEMORY_LAYERS.LAYER_4_NORMATIVE_POLICY,
    domain: agentDomain,
    authority: "AGENTS_MD_V2.2",
    decision_authority: "RAFAEL",
    external_effects_allowed: false
  };

  return {
    period,
    target_entity: entityRef,
    context_layers: {
      layer_1_session_count: sessionInteractions.length,
      layer_1_recent_interactions: sessionInteractions,
      layer_2_entity_facts: entityFacts,
      layer_3_owner_directives: activeDirectives,
      layer_4_normative_policy: normativePolicy
    },
    compiled_at: new Date().toISOString()
  };
}

/**
 * Consulta estruturada: "o que você sabe sobre este cliente ou indicador?"
 */
export function queryKnowledgeAboutEntity({
  entityRef,
  account,
  contacts = [],
  period = "2026-08"
}) {
  if (!account) {
    return {
      status: "NOT_FOUND",
      message: `Nenhum registro localizado para o identificador '${entityRef}'.`,
      evidence_date: null
    };
  }

  const linkedContacts = contacts.filter(c => c.cnpj === account.cnpj);
  return {
    status: "CONFIRMED",
    entity_ref: account.cnpj,
    razao_social: account.razao_social,
    period,
    facts: [
      `Faturamento 12m: R$ ${Number(account.months_revenue_12m || 0).toLocaleString("pt-BR")}`,
      `Colaboradores ativos: ${account.employees_count || 0}`,
      `Folha ativa: ${account.payroll_active ? "SIM" : "NÃO"}`,
      `Cobrança ativa: ${account.billing_active ? "SIM" : "NÃO"}`
    ],
    key_contacts: linkedContacts.map(c => ({
      name: c.contact_name,
      role: c.role,
      is_decision_maker: c.is_decision_maker,
      last_contact: c.last_contact_at
    })),
    data_source: "POSTGRES_PJ_ACCOUNTS_AND_CONTACTS",
    evidence_date: account.updated_at || account.created_at || "2026-08-28"
  };
}