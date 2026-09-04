/**
 * engines/relationship/outreach-draft-engine.mjs
 * Gerador de Rascunhos de Abordagem Comercial (WhatsApp / E-mail)
 * Regra Soberana: Toda abordagem externa exige aprovação prévia de Rafael (requires_owner_approval: true)
 */

export const OUTREACH_CHANNELS = {
  WHATSAPP: "WHATSAPP",
  EMAIL: "EMAIL"
};

/**
 * Mapeamento de contatos e dores corporativas das contas-chave da Agência 6895
 */
const KEY_ACCOUNTS_CONTACTS = {
  "hospital-sao-lucas": {
    cnpj: "01.234.567/0001-89",
    razao_social: "Hospital & Maternidade São Lucas S/A",
    decision_maker: "Dr. Arnaldo Silveira",
    role: "Diretor Financeiro & Sócio",
    operational_contact: "Dra. Helena Ramos (RH)",
    lives: 280,
    opportunity: "CONQUISTA_FOLHA_PAGAMENTO",
    value_prop: "Abertura de contas-salário em lote sem filas, apoio presencial de gerentes da agência 6895 e isenção de tarifas de folha para os colaboradores."
  },
  "forja-sul": {
    cnpj: "12.345.678/0001-90",
    razao_social: "Metalúrgica Forja Sul Ltda",
    decision_maker: "Sr. Cláudio Mendes",
    role: "Sócio-Administrador",
    operational_contact: "Sra. Renata Dias (Gerente Financeira)",
    monthly_external_volume: 420000.0,
    opportunity: "FATURAMENTO_BOLETO_PIX_E_VENCIDOS",
    value_prop: "Cobrança bancária híbrida Boleto + QR Code PIX com liquidação D+0 e tarifa de R$ 1,80 (economizando cerca de R$ 1.200/mês para a empresa), além de repactuação preventiva de faturas para proteger limites de giro."
  }
};

/**
 * Gera rascunho de abordagem personalizada.
 */
export function generateOutreachDraft({
  accountKey = "hospital-sao-lucas",
  channel = OUTREACH_CHANNELS.WHATSAPP,
  _topic = "FOLHA"
}) {
  const normKey = accountKey.toLowerCase().replace(/[^a-z0-9]/g, "");
  let target = KEY_ACCOUNTS_CONTACTS["hospital-sao-lucas"];

  if (normKey.includes("forja") || normKey.includes("metalurgica")) {
    target = KEY_ACCOUNTS_CONTACTS["forja-sul"];
  }

  const draftId = `draft-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  if (target === KEY_ACCOUNTS_CONTACTS["hospital-sao-lucas"]) {
    if (channel === OUTREACH_CHANNELS.WHATSAPP) {
      const text =
        `Olá, ${target.decision_maker}, tudo bem? Aqui é o Rafael, gerente da sua conta no Banco do Brasil (Agência São Fidélis).\n\n` +
        `Estive analisando a estrutura do ${target.razao_social} e estruturamos uma condição diferenciada para o processamento da folha dos seus ${target.lives} colaboradores.\n\n` +
        `Nosso compromisso é realizar todo o cadastramento e abertura das contas presencialmente ou digitalmente sem sobrecarregar o RH da ${target.operational_contact}, com pacote de benefícios exclusivo para a equipe médica e administrativa.\n\n` +
        `Podemos tomar um café de 15 minutos amanhã ou na quinta para eu lhe apresentar a proposta? Um abraço!`;

      return {
        draft_id: draftId,
        channel,
        target_account: target.razao_social,
        contact_name: target.decision_maker,
        contact_role: target.role,
        requires_owner_approval: true,
        decision_authority: "RAFAEL",
        draft_content: text,
        created_at: new Date().toISOString()
      };
    } else {
      const subject = `Parceria de Folha de Pagamento e Benefícios — Banco do Brasil & ${target.razao_social}`;
      const body =
        `Prezado ${target.decision_maker},\n\n` +
        `Espero que este e-mail o encontre bem.\n\n` +
        `Gostaria de agendar uma breve reunião executiva nesta semana para apresentar uma proposta de convênio de Folha de Pagamento desenhada sob medida para os cerca de ${target.lives} funcionários do ${target.razao_social}.\n\n` +
        `Principais diferenciais operacionais:\n` +
        `1. Apoio integral da equipe da Agência 6895 no processo de recepção e cadastramento, sem gerar demanda operacional para o RH;\n` +
        `2. Isenção de tarifas e linhas exclusivas de crédito consignado para colaboradores;\n` +
        `3. Condições tarifárias especiais para a conta corporativa do hospital.\n\n` +
        `Fico à disposição para alinhar o melhor horário.\n\n` +
        `Atenciosamente,\n\n` +
        `Rafael\n` +
        `Gerente de Relacionamento — Agência 6895 (VJ-SAO FIDELIS)\n` +
        `Banco do Brasil S/A`;

      return {
        draft_id: draftId,
        channel,
        subject,
        target_account: target.razao_social,
        contact_name: target.decision_maker,
        contact_role: target.role,
        requires_owner_approval: true,
        decision_authority: "RAFAEL",
        draft_content: body,
        created_at: new Date().toISOString()
      };
    }
  } else {
    // Forja Sul
    if (channel === OUTREACH_CHANNELS.WHATSAPP) {
      const text =
        `Olá, ${target.decision_maker}, tudo bem? Aqui é o Rafael, gerente da sua conta no Banco do Brasil.\n\n` +
        `Fizemos um levantamento recente do fluxo financeiro da ${target.razao_social} e identifiquei uma oportunidade de redução imediata no custo de emissão de boletos da empresa (cerca de R$ 420 mil/mês).\n\n` +
        `Conseguimos habilitar nossa esteira de Cobrança Híbrida (Boleto + QR Code PIX com liquidação instantânea D+0) com tarifa competitiva de R$ 1,80, gerando economia líquida direta para o financeiro da ${target.operational_contact}.\n\n` +
        `Além disso, gostaria de alinhar a regularização dos títulos em aberto para mantermos seus limites de crédito empresarial 100% disponíveis.\n\n` +
        `Consegue me atender amanhã às 10h ou prefere na parte da tarde? Abraço!`;

      return {
        draft_id: draftId,
        channel,
        target_account: target.razao_social,
        contact_name: target.decision_maker,
        contact_role: target.role,
        requires_owner_approval: true,
        decision_authority: "RAFAEL",
        draft_content: text,
        created_at: new Date().toISOString()
      };
    } else {
      const subject = `Otimização de Custos de Cobrança Bancária & Manutenção de Linhas — ${target.razao_social}`;
      const body =
        `Prezado ${target.decision_maker},\n\n` +
        `Com o objetivo de apoiar a gestão de fluxo de caixa e redução de despesas operacionais da ${target.razao_social}, formulamos uma proposta de Cobrança Bancária Híbrida (Boleto com PIX D+0).\n\n` +
        `Para o volume estimado de emissão da sua empresa, a redução de tarifas representa uma economia líquida recorrente, além de liquidação em tempo real dos recebíveis.\n\n` +
        `Na mesma oportunidade, gostaríamos de conferir o cronograma de regularização de duplicatas em aberto para blindagem das linhas ativas de capital de giro.\n\n` +
        `Atenciosamente,\n\n` +
        `Rafael\n` +
        `Gerente de Relacionamento — Agência 6895 (VJ-SAO FIDELIS)\n` +
        `Banco do Brasil S/A`;

      return {
        draft_id: draftId,
        channel,
        subject,
        target_account: target.razao_social,
        contact_name: target.decision_maker,
        contact_role: target.role,
        requires_owner_approval: true,
        decision_authority: "RAFAEL",
        draft_content: body,
        created_at: new Date().toISOString()
      };
    }
  }
}

/**
 * Formata o rascunho de abordagem para exibição executiva no Telegram.
 */
export function formatOutreachTelegram(draft) {
  return (
    `📲 <b>Rascunho de Abordagem Comercial (${draft.channel})</b>\n\n` +
    `• <b>Alvo:</b> ${draft.target_account}\n` +
    `• <b>Decisor:</b> ${draft.contact_name} (${draft.contact_role})\n` +
    `• <b>Autorização:</b> <code>requires_owner_approval: true</code> (Submetido à aprovação de Rafael)\n\n` +
    `💬 <b>Texto Pronto para Copiar e Enviar:</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `${draft.draft_content}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `💡 <i>Copie a mensagem acima, faça os ajustes que desejar e envie diretamente no WhatsApp ou E-mail do cliente.</i>`
  );
}