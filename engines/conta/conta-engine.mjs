/**
 * Motor Determinístico do Gerente Geral de Conta (GG Conta)
 * Versão: 1.0.0
 * Governado por: domains/conta/GERENTE_GERAL_CONTA.md e AGENTS.md
 * Autoridade decisória: RAFAEL
 */

export function evaluateAccount(account, targetGaps = []) {
  const cnpj = account.cnpj;
  const name = account.razao_social || account.name;
  const employees = Number(account.employees_count || 0);
  const revenue = Number(account.months_revenue_12m || account.expected_total_revenue || 0);
  const score = Number(account.credit_score || 0);
  const protests = Number(account.protests_count ?? account.protests ?? 0);
  const taxReg = account.tax_regularity !== false;

  const opportunities = [];
  const limitations = [];

  // 1. Verificação de Restrições Cadastrais / Risco
  let baseEligibility = 'ELIGIBLE';
  if (protests > 0) {
    baseEligibility = 'UNDETERMINED';
    limitations.push(`RESTRICTION_RECURRENT: ${protests} apontamento(s) ativo(s) pendente(s) de saneamento.`);
  }
  if (!taxReg) {
    limitations.push('RESTRICTION_NEW: CND ou regularidade fiscal requer atualização cadastral.');
  }

  // 2. Mapeamento de Oportunidades por Gap do POBJ
  // Gap A: Conquista Folha de Pagamento
  if (targetGaps.includes('folha_pagamento') || targetGaps.includes('conquista_folha') || targetGaps.length === 0) {
    if (employees >= 10 && !account.payroll_active) {
      opportunities.push({
        indicator_key: 'conquista_folha',
        target_product: 'FOLHA_DE_PAGAMENTO',
        estimated_points_gain: 4.0,
        reason_code: 'CROSS_SELL_FOLHA_PAGAMENTO',
        rationale: `Empresa com ${employees} colaboradores elegível para processamento de folha no banco. Potencial de capturar os 4,0 pontos do POBJ.`,
        confidence: 0.95,
        status: baseEligibility,
      });
    }
  }

  // Gap B: Faturamento Boleto + PIX QR Code
  if (targetGaps.includes('boleto_pix') || targetGaps.includes('faturamento_boleto_pix') || targetGaps.length === 0) {
    if (revenue >= 1000000 && (!account.billing_active || !account.pix_active)) {
      opportunities.push({
        indicator_key: 'faturamento_boleto_pix',
        target_product: 'COBRANCA_E_PIX_EMPRESARIAL',
        estimated_points_gain: 4.0,
        reason_code: 'CROSS_SELL_COBRANCA_PIX',
        rationale: `Faturamento anual de R$ ${(revenue / 1e6).toFixed(1)}M com esteira de cobrança/PIX aberta. Potencial de recuperar os 4,0 pontos zerados.`,
        confidence: 0.90,
        status: baseEligibility,
      });
    }
  }

  // Gap C: Proteção de Vencidos (5 a 59 dias)
  if (targetGaps.includes('gestao_vencidos') || targetGaps.includes('vencidos_59d') || targetGaps.length === 0) {
    if (score >= 600 && score < 750) {
      opportunities.push({
        indicator_key: 'gestao_vencidos',
        target_product: 'MONITORAMENTO_PREVENTIVO_MORA',
        estimated_points_gain: 9.34,
        reason_code: 'MONITORAMENTO_PREVENTIVO_MORA',
        rationale: `Score intermediário (${score}). Monitoramento preventivo antes da virada contábil para blindar os 9,34 pontos em risco.`,
        confidence: 0.85,
        status: baseEligibility,
      });
    }
  }

  // Gap D: Crescimento Líquido PJ (Ativação)
  if (targetGaps.includes('crescimento_liquido_pj') || targetGaps.length === 0) {
    if (account.status_conta === 'RECENTE' || account.status_conta === 'ABERTURA_PENDENTE' || account.status_conta === 'MADURA') {
      opportunities.push({
        indicator_key: 'crescimento_liquido_pj',
        target_product: 'ATIVACAO_DIGITAL_ONBOARDING',
        estimated_points_gain: 1.89,
        reason_code: 'ATIVACAO_CONTA_PENDENTE',
        rationale: `Dossiê ou ativação de produtos para consolidação do 4º cliente líquido e ganho residual de 1,89 pontos.`,
        confidence: 0.92,
        status: baseEligibility,
      });
    }
  }

  return {
    account_ref: cnpj,
    razao_social: name,
    segmento: account.segmento,
    eligibility_status: baseEligibility,
    evidence_refs: [`account_record_${cnpj}`, 'receita_federal_cnae', 'motor_elegibilidade_v1'],
    opportunities,
    limitations,
  };
}

export function evaluatePortfolio(accounts = [], targetGaps = [], requestId = `req-${Date.now()}`, operatingPhase = 'ACCOUNT_LEVEL_FUTURE') {
  const evaluatedAccounts = accounts.map((acc) => evaluateAccount(acc, targetGaps));
  const eligibleCandidates = evaluatedAccounts.filter((a) => a.eligibility_status === 'ELIGIBLE' && a.opportunities.length > 0);

  const portfolioSignals = [
    {
      signal: `Carteira analisada com ${accounts.length} empresas ativas na agência 6895.`,
      evidence_status: 'CONFIRMED',
      use_in_plan: 'ALLOW',
    },
    {
      signal: `Identificadas ${eligibleCandidates.length} empresas elegíveis com alta aderência aos gaps do POBJ.`,
      evidence_status: 'CONFIRMED',
      use_in_plan: 'ALLOW',
    },
  ];

  const limitations = [
    'Dados cadastrais baseados em registros da carteira PJ de São Fidélis (6895).',
    'Ações externas ou concessão de produtos exigem autorização expressa de Rafael.',
  ];

  if (operatingPhase === 'GOAL_LEVEL_INITIAL') {
    return {
      schema_version: '1.0.0',
      request_id: requestId,
      provided_by: 'GERENTE_GERAL_CONTA',
      mediated_by: 'MOTOR_CONSOLIDACAO_360',
      operating_phase: 'GOAL_LEVEL_INITIAL',
      account_data_status: 'NOT_AVAILABLE',
      portfolio_signals: portfolioSignals,
      account_candidates: [],
      limitations,
      decision_authority: 'RAFAEL',
    };
  }

  return {
    schema_version: '1.0.0',
    request_id: requestId,
    provided_by: 'GERENTE_GERAL_CONTA',
    mediated_by: 'MOTOR_CONSOLIDACAO_360',
    operating_phase: 'ACCOUNT_LEVEL_FUTURE',
    account_data_status: 'AVAILABLE',
    portfolio_signals: portfolioSignals,
    account_candidates: eligibleCandidates.map((c) => ({
      account_ref: c.account_ref,
      eligibility_status: c.eligibility_status,
      evidence_refs: c.evidence_refs,
    })),
    evaluated_details: eligibleCandidates,
    limitations,
    decision_authority: 'RAFAEL',
  };
}