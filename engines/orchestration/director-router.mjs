const ROUTES = [
  { domain: 'conta', terms: ['cadastro', 'cnpj', 'limite', 'conta'], capabilities: ['resolver_identidade', 'avaliar_elegibilidade'] },
  { domain: 'performance', terms: ['meta', 'pobj', 'pontuacao', 'produção', 'producao', 'performance'], capabilities: ['avaliar_performance', 'identificar_gap_execucao'] },
  { domain: 'financeiro', terms: ['financeiro', 'margem', 'receita', 'g dad', 'g dad', 'rentabilidade'], capabilities: ['calcular_rentabilidade', 'avaliar_viabilidade'] },
  { domain: 'relacionamento', terms: ['reunião', 'reuniao', 'compromisso', 'cliente', 'relacionamento'], capabilities: ['recuperar_contexto', 'preparar_abordagem'] }
];

export function routeDirector({ purpose = '', text = '', requestedDomains = [] } = {}) {
  const normalized = `${purpose} ${text}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const selected = requestedDomains.length
    ? ROUTES.filter((route) => requestedDomains.includes(route.domain))
    : ROUTES.filter((route) => route.terms.some((term) => normalized.includes(term.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))));
  const domains = selected.slice(0, 4).map((route) => ({ domain: route.domain, capabilities: route.capabilities, requirement: 'REQUIRED' }));
  const excluded = ROUTES.filter((route) => !domains.some((item) => item.domain === route.domain)).map((route) => ({ domain: route.domain, reason_code: 'NOT_REQUIRED_FOR_INTENT' }));
  return { routing_method: 'DETERMINISTIC', selected_domains: domains, excluded_domains: excluded, decision_status: domains.length ? 'READY' : 'MANUAL_REVIEW_REQUIRED', max_domains: 4, specialist_runtime: 'INACTIVE' };
}
