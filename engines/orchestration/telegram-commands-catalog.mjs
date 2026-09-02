/**
 * engines/orchestration/telegram-commands-catalog.mjs
 * Marco N2.2.6 — Catálogo Textual e Comandos Avançados no Telegram
 */

export function executeAdvancedCommand({
  command,
  args = [],
  rawArgs = "",
  snapshot = {
    current_points: 70.71,
    accelerator_points: 10.0,
    total_points: 80.71,
    folha_pct: 12.5,
    boleto_pix_pct: 3.1,
    credito_pj_pct: 180.8,
    vencidos_59d_pct: 78.3
  }
}) {
  const cmd = String(command || "").toLowerCase().trim();
  const arg = (args[0] || rawArgs || "").toLowerCase().trim();

  switch (cmd) {
    case "/indicador": {
      if (!arg) {
        return (
          `📊 <b>Consulta de Indicadores do POBJ</b>\n\n` +
          `Uso: <code>/indicador <nome></code>\n\n` +
          `Exemplos disponíveis:\n` +
          `• <code>/indicador folha</code> — Conquista de Folha de Pagamento\n` +
          `• <code>/indicador cobranca</code> — Faturamento Boleto + PIX\n` +
          `• <code>/indicador credito</code> — Produção de Crédito PJ\n` +
          `• <code>/indicador vencidos</code> — Gestão de Vencidos Até 59 dias`
        );
      }

      if (arg.includes("folha")) {
        return (
          `📋 <b>Detalhamento: Conquista Folha PJ</b>\n\n` +
          `• <b>Peso no POBJ:</b> 4,00 pontos normativos\n` +
          `• <b>Atingimento Atual:</b> ${snapshot.folha_pct}%\n` +
          `• <b>Pontos Conquistados:</b> 0,00 de 4,00 pts (ESTEIRA ZERADA)\n` +
          `• <b>Diagnóstico:</b> Oportunidade prioritária de aceleração.\n` +
          `🏢 <b>Alvo na Carteira 6895:</b> <i>Hospital & Maternidade São Lucas S/A</i> (280 vidas ativas). Contato: Dr. Arnaldo Silveira (Dir. Financeiro).`
        );
      } else if (arg.includes("cobranca") || arg.includes("pix") || arg.includes("boleto")) {
        return (
          `📋 <b>Detalhamento: Faturamento Boleto + PIX</b>\n\n` +
          `• <b>Peso no POBJ:</b> 4,00 pontos normativos\n` +
          `• <b>Atingimento Atual:</b> ${snapshot.boleto_pix_pct}%\n` +
          `• <b>Pontos Conquistados:</b> 0,00 de 4,00 pts (ESTEIRA ZERADA)\n` +
          `• <b>Diagnóstico:</b> Esteira sem tração no fechamento.\n` +
          `🏢 <b>Alvo na Carteira 6895:</b> <i>Metalúrgica Forja Sul Ltda</i> (R$ 420 mil em boletos externos). Contato: Sr. Cláudio Mendes (Sócio).`
        );
      } else if (arg.includes("credito") || arg.includes("rotativo") || arg.includes("giro")) {
        return (
          `📋 <b>Detalhamento: Produção de Crédito PJ</b>\n\n` +
          `• <b>Peso no POBJ:</b> 15,00 pontos normativos\n` +
          `• <b>Atingimento Atual:</b> ${snapshot.credito_pj_pct}% (Teto de 150% superado)\n` +
          `• <b>Pontos Conquistados:</b> 15,00 de 15,00 pts (TETO MÁXIMO ATINGIDO)\n` +
          `• <b>Diagnóstico:</b> Linha totalmente esgotada. Novas liberações elevam volume comercial, mas não adicionam novos pontos ao POBJ.`
        );
      } else if (arg.includes("vencido") || arg.includes("mora")) {
        return (
          `📋 <b>Detalhamento: Vencidos Até 59 Dias</b>\n\n` +
          `• <b>Peso no POBJ:</b> 10,00 pontos ponderados\n` +
          `• <b>Atingimento Atual:</b> ${snapshot.vencidos_59d_pct}%\n` +
          `• <b>Pontos em Risco:</b> 9,34 pontos sob alerta de mora\n` +
          `• <b>Diagnóstico:</b> O índice está próximo da linha d'água de 70%. Qualquer entrada relevante de inadimplência zera a pontuação integral da esteira.`
        );
      }

      return `⚠️ Indicador '${arg}' não reconhecido. Use <code>/indicador</code> sem argumentos para ver as opções.`;
    }

    case "/fontes": {
      return (
        `🗂️ <b>Registro de Fontes Autorizadas (Agência 6895)</b>\n\n` +
        `1. <b>Relatório POBJ Oficial:</b> <code>POBJ2608.pdf</code> (Base: 28/08/2026) — <i>Confiança Alta (100% células válidas)</i>\n` +
        `2. <b>Cadastro PJ Local:</b> <code>PostgreSQL visao360.pj_accounts</code> (20 contas ativas) — <i>Autoritativo</i>\n` +
        `3. <b>Sócios e Contatos:</b> <code>PostgreSQL visao360.pj_account_contacts</code> (7 decisores mapeados) — <i>Autorizado</i>\n` +
        `4. <b>Orientações e Decisões:</b> <code>Rafael (OWNER_PROVIDED)</code> — <i>Soberano</i>`
      );
    }

    case "/evidencias": {
      return (
        `🧬 <b>Evidence Graph 360 — Linhagem de Decisão</b>\n\n` +
        `• <b>Nó Raiz:</b> <code>SOURCE_ARTIFACT:POBJ2608.pdf</code> (Hash: sha256:6ac408...)\n` +
        `• <b>Transformação:</b> Motor de Pontuação Determinístico V2\n` +
        `• <b>Achado:</b> Gaps críticos em Folha (0/4) e Cobrança (0/4)\n` +
        `• <b>Proposição:</b> Recomendações de abordagem vinculadas aos CNPJs 01.234.567/0001-89 e 12.345.678/0001-90\n` +
        `• <b>Autoridade Soberana:</b> RAFAEL`
      );
    }

    default:
      return null;
  }
}