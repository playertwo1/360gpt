/**
 * engines/relationship/relationship-engine.mjs
 * Motor determinístico do Gerente Geral de Relacionamento (Marco N8.2).
 * Conforme contracts/relationship-specialist-response.schema.json e AGENTS.md v2.2.
 */

import { assessCommitment } from './commitments-engine.mjs';

export { assessCommitment };

/**
 * Prepara a estratégia de relacionamento e abordagem comercial para uma conta específica.
 */
export function prepareAccountApproach({
  account,
  contact = null,
  targetProduct = 'FOLHA_DE_PAGAMENTO',
  timeline = [],
  commitments = [],
  requestId = null
}) {
  const reqId = requestId || `req-rel-${Date.now()}`;
  const contactName = contact?.contact_name || 'Decisor Financeiro';
  const contactRole = contact?.role || 'Diretor';
  const companyName = account?.razao_social || account?.name || 'Empresa Cliente';

  // 1. Linha do tempo e histórico
  const timelineSummary = timeline.length
    ? timeline.map(t => `[${t.occurred_at || 'Data não informada'}] ${t.event_type || 'CONTATO'}: ${t.summary}`).join(' | ')
    : `Último contato registrado em ${contact?.last_contact_at ? new Date(contact.last_contact_at).toLocaleDateString('pt-BR') : 'agosto/2026'} com ${contactName} (${contactRole}).`;

  // 2. Necessidades explícitas
  const needs = Array.isArray(contact?.key_interests) && contact.key_interests.length
    ? [...contact.key_interests]
    : targetProduct === 'FOLHA_DE_PAGAMENTO'
      ? ['Redução de custos operacionais com folha', 'Agilidade no crédito aos colaboradores']
      : ['Tarifas reduzidas de emissão de boletos', 'Liquidação imediata de recebíveis via PIX'];

  // 3. Objeções explícitas conhecidas
  const objections = Array.isArray(contact?.known_objections) && contact.known_objections.length
    ? [...contact.known_objections]
    : targetProduct === 'FOLHA_DE_PAGAMENTO'
      ? ['Receio de retrabalho na transição de contas dos colaboradores']
      : ['Contrato de longo prazo vigente com banco concorrente'];

  // 4. Compromissos em aberto avaliados deterministicamente
  const assessedCommitments = commitments.map(c => assessCommitment(c));
  const openCommitments = assessedCommitments
    .filter(c => c.status === 'OPEN' || c.status === 'OVERDUE_OPEN')
    .map(c => `[${c.status}] Responsável: ${c.responsible} | Prazo: ${c.dueAt} | Evidência: ${c.evidenceRef}`);

  if (!openCommitments.length && contact?.last_contact_at) {
    openCommitments.push(`[OPEN] Realizar contato de acompanhamento de agosto/2026 com ${contactName}`);
  }

  // 5. Sugestão de Abordagem Estruturada
  let objective = '';
  let opening = '';
  let questions = [];
  let nextStep = '';
  let alternativeView = '';
  let uncertainties = [];

  if (targetProduct === 'FOLHA_DE_PAGAMENTO') {
    const lives = account?.employees_count || 180;
    objective = `Apresentar proposta de processamento de folha de pagamento (${lives} vidas) com implantação assistida pela agência 6895, eliminando sobrecarga operacional do RH.`;
    opening = `Olá, ${contactName}! Notei que na última conversa avaliamos soluções financeiras corporativas. Estruturei um formato sob medida para a folha do ${companyName}, onde a agência assume todo o suporte presencial de abertura e validação das contas, sem demandar esforço da sua equipe de RH.`;
    questions = [
      'Qual é o principal ponto de atrito que o RH enfrenta no processamento da folha no banco atual?',
      'Seus colaboradores valorizariam acesso imediato a linhas de crédito consignado com taxas exclusivas de agência?',
      'Existe alguma data de fechamento contratual específica que precisamos observar para a portabilidade?'
    ];
    nextStep = 'Agendar reunião técnica de 20 minutos com a equipe de RH para apresentar a esteira digital de cadastramento.';
    alternativeView = 'Se a troca completa da folha enfrentar resistência de prazos do RH neste mês, propor a captação seletiva via consignado e abertura de contas pontuais.';
    uncertainties = [
      'Tempo de vigência do contrato atual de folha com a instituição concorrente',
      'Compatibilidade do layout de remessa CNAB do ERP utilizado pela empresa'
    ];
  } else if (targetProduct === 'COBRANCA_PIX') {
    const rev = Number(account?.months_revenue_12m || 0);
    const revStr = rev ? `(R$ ${(rev / 1e6).toFixed(1)}M anuais)` : '';
    objective = `Implantar pacote integrado de Cobrança Bancária e PIX Dinâmico com liquidação D+0 e tarifa de emissão competitiva para o faturamento comercial ${revStr}.`;
    opening = `Olá, ${contactName}! Analisando o fluxo de recebíveis da ${companyName}, preparamos uma condição de cobrança integrada (Boleto + QR Code PIX no mesmo documento) que garante liquidação D+0 e reduz substancialmente o custo por título liquidado.`;
    questions = [
      'Qual o percentual atual de recebimentos que já ocorre via PIX versus boleto tradicional?',
      'O sistema de gestão da empresa permite emissão híbrida (boleto com QR Code PIX acoplado)?',
      'Existe demanda por antecipação automática ou desconto de duplicatas após a emissão?'
    ];
    nextStep = 'Enviar simulação comparativa de tarifas de cobrança e agendar teste de homologação de arquivo.';
    alternativeView = 'Se houver fidelidade contratual no boleto tradicional, focar a captura exclusivamente nos recebíveis de PIX e transferências de clientes corporativos.';
    uncertainties = [
      'Volume exato de títulos emitidos mensalmente pela empresa',
      'Tarifa efetiva cobrada pelo banco concorrente atual'
    ];
  } else {
    objective = `Conduzir alinhamento de crédito e proteção de liquidez para a ${companyName}.`;
    opening = `Olá, ${contactName}! Gostaríamos de alinhar a estratégia de liquidez e suporte de crédito da agência para os compromissos da ${companyName} neste fechamento de ciclo.`;
    questions = [
      'Como está a previsão de fluxo de recebimento de duplicatas para os próximos 30 dias?',
      'Existe necessidade de repactuação de prazos para manter os fluxos em dia?'
    ];
    nextStep = 'Apresentar linha de repactuação preventiva e avaliar garantias.';
    alternativeView = 'Caso o caixa esteja estabilizado, direcionar a conversa para investimentos de curto prazo.';
    uncertainties = ['Previsão exata de entradas financeiras dos principais clientes da empresa'];
  }

  return {
    schema_version: '1.0.0',
    request_id: reqId,
    specialist_id: 'RELATIONSHIP_CONVERSATION_STRATEGY_DRAFTING',
    timeline_summary: timelineSummary,
    needs,
    objections,
    open_commitments: openCommitments,
    suggested_approach: {
      objective,
      opening,
      questions,
      next_step: nextStep,
      requires_owner_approval: true
    },
    alternative_view: alternativeView,
    uncertainties,
    decision_authority: 'RAFAEL'
  };
}

/**
 * Avalia a carteira de contatos para apoiar os gaps de metas de Performance.
 */
export function evaluateRelationshipPortfolio({ accounts = [], contacts = [], _targetGaps = [] }) {
  const approaches = [];

  for (const acc of accounts) {
    const accContacts = contacts.filter(c => c.cnpj === acc.cnpj);
    const mainContact = accContacts.find(c => c.is_decision_maker) || accContacts[0] || null;

    // Prioridade 1: Folha se a conta tiver muitos funcionários e folha inativa
    if (acc.employees_count >= 20 && !acc.payroll_active) {
      approaches.push({
        account_ref: acc.cnpj,
        razao_social: acc.razao_social,
        contact_name: mainContact?.contact_name || 'Decisor',
        target_product: 'FOLHA_DE_PAGAMENTO',
        plan: prepareAccountApproach({
          account: acc,
          contact: mainContact,
          targetProduct: 'FOLHA_DE_PAGAMENTO'
        })
      });
    }
    // Prioridade 2: Cobrança se faturamento >= 1M e cobrança inativa
    else if (Number(acc.months_revenue_12m || 0) >= 1000000 && (!acc.billing_active || !acc.pix_active)) {
      approaches.push({
        account_ref: acc.cnpj,
        razao_social: acc.razao_social,
        contact_name: mainContact?.contact_name || 'Decisor',
        target_product: 'COBRANCA_PIX',
        plan: prepareAccountApproach({
          account: acc,
          contact: mainContact,
          targetProduct: 'COBRANCA_PIX'
        })
      });
    }
  }

  return {
    provided_by: 'GERENTE_GERAL_RELACIONAMENTO',
    approaches_count: approaches.length,
    approaches,
    decision_authority: 'RAFAEL',
    compliance_note: 'Toda abordagem e contato externo exige autorização soberana de Rafael.'
  };
}