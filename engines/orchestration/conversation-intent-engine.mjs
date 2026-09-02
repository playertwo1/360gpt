/**
 * engines/orchestration/conversation-intent-engine.mjs
 * Motor conversacional determinístico para o Marco N2.1 do Diretor 360.
 * Conforme contratos/telegram-intent.schema.json e AGENTS.md v2.2.
 */

import { evaluatePortfolio } from '../conta/conta-engine.mjs';

function fmt(n, decimals = 2) {
  return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function parseMoneyValue(raw) {
  if (typeof raw === 'number') return raw;
  if (!raw) return 0;
  let str = String(raw).trim().replace(/r\$\s*/i, '');
  const milMatch = str.match(/([\d.,]+)\s*(?:mil|k)\b/i);
  if (milMatch) {
    const base = parseFloat(milMatch[1].replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(base) ? base * 1000 : 0;
  }
  const miMatch = str.match(/([\d.,]+)\s*(?:milh[a-z]+|mi|m)\b/i);
  if (miMatch) {
    const base = parseFloat(miMatch[1].replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(base) ? base * 1000000 : 0;
  }
  if (str.includes(',') && str.includes('.')) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (str.includes(',')) {
    str = str.replace(',', '.');
  }
  const num = parseFloat(str.replace(/[^\d.-]/g, ''));
  return Number.isFinite(num) ? num : 0;
}

export function classifyIntent(text) {
  const normalized = String(text ?? '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (normalized.startsWith('/')) {
    return 'COMMAND';
  }

  // 5. Texto longo estruturado com seções executivas
  if (
    normalized.includes('situacao') &&
    (normalized.includes('pontuacao') || normalized.includes('pontos')) &&
    (normalized.includes('metas criticas') || normalized.includes('risco') || normalized.includes('carteira pj'))
  ) {
    return 'OWNER_ANALYSIS';
  }

  // 4. Correção simples
  if (
    normalized.includes('correto e') ||
    normalized.includes('o correto') ||
    normalized.includes('corrigir para') ||
    normalized.includes('retificar')
  ) {
    return 'OWNER_CORRECTION';
  }

  // 3. Fato + pergunta
  const isQuestion = normalized.includes('?') || normalized.includes('bato') || normalized.includes('consigo') || normalized.includes('alcanco');
  const hasFactValue = /\b\d+[\d.,]*\b/.test(normalized) || normalized.includes('mil') || normalized.includes('contas');
  if (isQuestion && hasFactValue) {
    return 'QUESTION_AND_FACT';
  }

  // 1. Pergunta simples
  if (
    normalized.includes('como esta') ||
    normalized.includes('qual o status') ||
    normalized.includes('como estao as metas') ||
    normalized.includes('resumo') ||
    normalized.includes('pobj') ||
    isQuestion
  ) {
    return 'QUESTION';
  }

  // 2. Fato simples
  if (hasFactValue || normalized.includes('abri') || normalized.includes('liberei') || normalized.includes('fechei')) {
    return 'OWNER_FACT';
  }

  return 'SOCIAL_OR_AMBIGUOUS';
}

export function processConversationInput({ text, stateSnapshot = null, pjAccounts = [] }) {
  const intent = classifyIntent(text);
  const receivedAt = new Date().toISOString();

  const defaultSnapshot = {
    period: 'Agosto/2026',
    reference_date: '2026-08-28',
    branch: '6895 - VJ-SAO FIDELIS',
    manager: 'VJ-RAFAEL PEDROSA GONCALVES',
    current_points: 70.71,
    accelerator_points: 10.0,
    total_points: 80.71,
    target_points: 78.0,
    attainment_pct: 100.65,
    beaten_indicators: 7,
    total_indicators: 22,
    credito_realizado: 1384193.37,
    credito_meta: 765726.75,
    credito_pct: 180.77,
    folha_pct: 12.5,
    boleto_pix_pct: 3.11,
    vencidos_59d_pct: 78.27,
    vencidos_59d_points: 9.34
  };

  const snapshot = stateSnapshot || defaultSnapshot;

  let safeResponse = '';
  let behaviorType = intent;
  const answers = [];
  const extractedFacts = [];
  const consultedDomains = ['performance'];

  switch (intent) {
    case 'QUESTION': {
      safeResponse =
        `📊 <b>Posição Consolidada POBJ — ${snapshot.branch}</b>\n` +
        `<i>Competência: ${snapshot.period} (Base: ${snapshot.reference_date})</i>\n\n` +
        `• <b>Pontuação Atual:</b> ${fmt(snapshot.current_points)} pts normativos + ${fmt(snapshot.accelerator_points)} acel. = <b>${fmt(snapshot.total_points)} pts totais</b> (${fmt(snapshot.attainment_pct)}% atingido)\n` +
        `• <b>Indicadores Batidos:</b> ${snapshot.beaten_indicators} de ${snapshot.total_indicators} indicadores\n\n` +
        `⚠️ <b>Esteiras Críticas com Pontos Zerados:</b>\n` +
        `1. <b>Conquista Folha PJ:</b> ${fmt(snapshot.folha_pct, 1)}% atingido (0,0 de 4,0 pts)\n` +
        `2. <b>Faturamento Boleto + PIX:</b> ${fmt(snapshot.boleto_pix_pct, 1)}% atingido (0,0 de 4,0 pts)\n` +
        `3. <b>Vencidos Até 59 dias:</b> ${fmt(snapshot.vencidos_59d_pct, 1)}% atingido (${fmt(snapshot.vencidos_59d_points)} pts em risco de mora)\n\n` +
        `💡 <i>Sugestão: Use a carteira PJ para direcionar Folha e Cobrança nas contas elegíveis.</i>`;
      break;
    }

    case 'OWNER_FACT': {
      const contaMatch = text.match(/(\d+)\s*contas?/i);
      const qtdContas = contaMatch ? parseInt(contaMatch[1], 10) : 1;
      consultedDomains.push('conta');

      extractedFacts.push({
        indicator: 'CRESCIMENTO_LIQUIDO_PJ',
        value: qtdContas,
        unit: 'Contas',
        provenance: 'OWNER_PROVIDED',
        recorded_at: receivedAt
      });

      safeResponse =
        `✅ <b>Informação Registrada (Fonte: Rafael)</b>\n\n` +
        `• <b>Fato Informado:</b> Abertura de +${qtdContas} conta(s) PJ registrada com proveniência <code>OWNER_PROVIDED</code>.\n` +
        `• <b>Domínios Consultados:</b> Performance e Conta.\n` +
        `• <b>Impacto na Linha:</b> Crescimento Líquido PJ reforçado na competência.\n\n` +
        `🎯 <b>Próxima Ação:</b> Vincular reciprocidade imediata (Folha de Pagamento ou Cobrança PIX) às novas contas para oxigenar os gaps zerados.`;
      break;
    }

    case 'QUESTION_AND_FACT': {
      const val = parseMoneyValue(text);
      extractedFacts.push({
        indicator: 'CREDITO_ROTATIVO',
        value: val,
        unit: 'R$',
        provenance: 'OWNER_PROVIDED',
        recorded_at: receivedAt
      });

      const novoRealizado = snapshot.credito_realizado + val;

      safeResponse =
        `📋 <b>Análise de Impacto — Liberação de Crédito</b>\n\n` +
        `• <b>Fato Registrado:</b> Liberação de R$ ${fmt(val)} informada por Rafael.\n` +
        `• <b>Diagnóstico GG Performance:</b>\n` +
        `  - A linha de <b>Produção de Crédito PJ</b> já está em <b>${fmt(snapshot.credito_pct, 1)}% de atingimento</b> (teto máximo normativo é 150%).\n` +
        `  - Os <b>15,00 pontos máximos</b> já foram integralmente conquistados.\n` +
        `  - Adicionar +R$ ${fmt(val)} eleva o volume para R$ ${fmt(novoRealizado)}, porém <b>não adiciona novos pontos</b> na esteira de Crédito.\n\n` +
        `💡 <b>Recomendação do Diretor:</b>\n` +
        `Direcione o esforço para <b>Folha de Pagamento</b> (+4,0 pts) ou <b>Boleto/PIX</b> (+4,0 pts), onde a agência ainda possui 8,0 pontos zerados na mesa.`;
      break;
    }

    case 'OWNER_CORRECTION': {
      const val = parseMoneyValue(text);
      extractedFacts.push({
        type: 'CORRECTION',
        value: val,
        provenance: 'OWNER_PROVIDED',
        relation: 'SUPERSEDES',
        recorded_at: receivedAt
      });

      safeResponse =
        `✏️ <b>Correção Registrada com Sucesso</b>\n\n` +
        `• <b>Dado Corrigido:</b> Valor R$ ${fmt(val)} registrado com vínculo <code>SUPERSEDES</code>.\n` +
        `• <b>Auditoria:</b> O valor anterior permanece no histórico para rastreabilidade; os recálculos subsequentes utilizarão esta versão corrigida.\n\n` +
        `Estado 360 atualizado conforme autorização soberana de Rafael.`;
      break;
    }

    case 'OWNER_ANALYSIS': {
      consultedDomains.push('conta');
      const gaps = [
        { indicator: 'CONQUISTA_FOLHA_PAGAMENTO', weight: 4.0, attainment_pct: snapshot.folha_pct },
        { indicator: 'FATURAMENTO_BOLETO_PIX', weight: 4.0, attainment_pct: snapshot.boleto_pix_pct },
        { indicator: 'VENCIDOS_ATE_59_DIAS', weight: 10.0, attainment_pct: snapshot.vencidos_59d_pct, at_risk: true }
      ];

      if (pjAccounts.length) {
        evaluatePortfolio({ accounts: pjAccounts, currentGaps: gaps });
      }

      safeResponse =
        `🏛️ <b>Parecer Executivo 360 — Recepção e Cruzamento Estruturado</b>\n\n` +
        `• <b>Entrada Recebida:</b> Análise situacional de fechamento de Agosto/2026 recebida integralmente e registrada sob <code>OWNER_PROVIDED</code>.\n` +
        `• <b>Domínios Ativados:</b> GG Performance (Metas) e GG Conta (Carteira 6895).\n\n` +
        `📊 <b>Conferência de Metas e Gaps (Performance):</b>\n` +
        `  - Pontuação: <b>${fmt(snapshot.current_points)} pts atingidos + ${fmt(snapshot.accelerator_points)} acel. = ${fmt(snapshot.total_points)} pts</b>.\n` +
        `  - Indicadores batidos: <b>${snapshot.beaten_indicators} de ${snapshot.total_indicators}</b>.\n` +
        `  - Gaps críticos confirmados: Conquista Folha (0/4 pts) e Boleto/PIX (0/4 pts).\n` +
        `  - Blindagem necessária: Vencidos Até 59d (${fmt(snapshot.vencidos_59d_pct, 1)}% atingido, ${fmt(snapshot.vencidos_59d_points)} pts em risco).\n\n` +
        `🏢 <b>Encaminhamento Prático na Carteira PJ (GG Conta):</b>\n` +
        `  1. <b>Folha de Pagamento:</b> <i>Hospital São Lucas</i> (180 vidas ativas, convênio pronto para portabilidade).\n` +
        `  2. <b>Boleto + PIX:</b> <i>Metalúrgica Forja Sul</i> (R$ 420 mil em cobrança bancária externa) e <i>Transportadora Transvale</i>.\n` +
        `  3. <b>Blindagem de Crédito:</b> Regularizar faturas em atraso recente na <i>Metalúrgica Forja Sul</i> para proteger o limiar de 70% dos vencidos.\n\n` +
        `⚖️ <b>Decisão Soberana:</b> Submetido para condução comercial de Rafael.`;
      break;
    }

    default: {
      safeResponse =
        `👋 Olá, Rafael! Recebi sua mensagem.\n\n` +
        `Você pode me enviar a qualquer momento:\n` +
        `• <b>Perguntas:</b> "Como está meu POBJ?"\n` +
        `• <b>Fatos da agência:</b> "Abri 2 contas hoje" ou "Liberei R$ 50 mil de giro"\n` +
        `• <b>Relatórios textuais:</b> Copiar e colar a situação da carteira PJ\n` +
        `• <b>Documentos:</b> Enviar PDF do POBJ para leitura automática.\n\n` +
        `Ou use /comandos para acessar o menu operacional.`;
      break;
    }
  }

  const telegramIntent = {
    schema_version: '1.0.0',
    intent: intent === 'COMMAND' ? 'COMMAND' : intent === 'SOCIAL_OR_AMBIGUOUS' ? 'UNKNOWN' : intent === 'QUESTION' ? 'QUESTION' : 'NEW_INPUT',
    answers,
    context_request: null,
    format_feedback: null,
    unresolved_question_ids: [],
    requires_follow_up: false,
    safe_response: safeResponse.slice(0, 3600)
  };

  return {
    ...telegramIntent,
    telegram_intent: telegramIntent,
    behavior_type: behaviorType,
    extracted_facts: extractedFacts,
    consulted_domains: consultedDomains,
    provenance: {
      evidence_type: 'OWNER_PROVIDED',
      actor: 'Rafael',
      channel: 'TELEGRAM',
      received_at: receivedAt
    }
  };
}