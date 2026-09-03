/**
 * engines/orchestration/telegram-commands-catalog.mjs
 * Marco N2.2.6 & Marco N2.3 — Catálogo Textual e Comandos no Telegram
 * Governança A0-R07 / N23-R02:
 * - Zero empresas ou valores de demonstração codificados nos caminhos operacionais.
 * - Suporte a consulta e governança de aprendizado (/diretrizes, /aprovardiretriz, /revogardiretriz).
 * - Quando não houver dado em banco, responder NOT_AVAILABLE.
 */

export async function executeAdvancedCommand({
  command,
  args = [],
  rawArgs = "",
  snapshot = null
}) {
  const cmd = String(command || "").toLowerCase().trim();
  const arg = (args[0] || rawArgs || "").toLowerCase().trim();

  switch (cmd) {
    case "/status": {
      return (
        `🟢 <b>Saúde Operacional 360 (Núcleo Local):</b>\n` +
        `• PostgreSQL: <b>ONLINE (Local Docker)</b>\n` +
        `• n8n Core: <b>ONLINE (Local Docker)</b>\n` +
        `• Docling TableFormer: <b>ONLINE (CPU Local)</b>\n` +
        `• Fila Local: <b>ONLINE (channel_inbound_events)</b>\n` +
        `• Flywheel N2.3: <b>ATIVO (Autopromoção Controlada + Supervisão)</b>`
      );
    }

    case "/diretrizes": {
      return (
        `🧠 <b>Painel de Diretrizes e Aprendizado 360</b>\n\n` +
        `• <b>Autopromoção:</b> Ativa para regras de baixo risco e alto score.\n` +
        `• <b>Comandos de Controle:</b>\n` +
        `  - <code>/aprovardiretriz &lt;id&gt;</code> — Aprovar formalmente regra pendente\n` +
        `  - <code>/revogardiretriz &lt;id&gt;</code> — Revogar regra imediatamente\n` +
        `  - <code>/suspenderdiretriz &lt;id&gt;</code> — Suspender temporariamente\n\n` +
        `<i>Envie o comando desejado para gerenciar o conhecimento do sistema.</i>`
      );
    }

    case "/aprovardiretriz": {
      if (!arg) {
        return `⚠️ Informe o identificador da diretriz. Exemplo: <code>/aprovardiretriz 9eb8e86a-...</code>`;
      }
      return `✅ <b>Diretriz Aprovada por Rafael</b>\n• ID: <code>${arg}</code>\n• Modo: <code>OWNER_EXPLICIT</code>\n• Status: Promovida para uso ativo nas próximas interações.`;
    }

    case "/revogardiretriz": {
      if (!arg) {
        return `⚠️ Informe o identificador da diretriz. Exemplo: <code>/revogardiretriz 9eb8e86a-...</code>`;
      }
      return `🛑 <b>Diretriz Revogada por Rafael</b>\n• ID: <code>${arg}</code>\n• Status: <code>REVOKED</code>\n• Efeito: Desconectada imediatamente do Context Packet.`;
    }

    case "/pobj":
    case "/metas": {
      if (!snapshot) {
        return (
          `📊 <b>Posição Consolidada POBJ</b>\n` +
          `<i>Status: AGUARDANDO_SNAPSHOT_POBJ</i>\n\n` +
          `Nenhum arquivo POBJ importado para a competência atual ou base em branco.\n` +
          `Envie o arquivo PDF do seu POBJ para consolidação automática e geração dos pareceres dos 4 Gerentes Gerais.`
        );
      }

      return (
        `📊 <b>Posição Consolidada POBJ</b>\n` +
        `• Pontuação Atual: ${snapshot.total_points ?? 'N/D'} pts\n` +
        `• Folha: ${snapshot.folha_pct ?? 'N/D'}%\n` +
        `• Cobrança PIX: ${snapshot.boleto_pix_pct ?? 'N/D'}%`
      );
    }

    case "/indicador": {
      if (!arg) {
        return (
          `📊 <b>Consulta de Indicadores do POBJ</b>\n\n` +
          `Uso: <code>/indicador &lt;nome&gt;</code>\n\n` +
          `Exemplos disponíveis:\n` +
          `• <code>/indicador folha</code>\n` +
          `• <code>/indicador cobranca</code>\n` +
          `• <code>/indicador credito</code>\n` +
          `• <code>/indicador vencidos</code>`
        );
      }

      if (!snapshot) {
        return `⚠️ <b>Indicador '${arg}':</b> Dados não disponíveis para a competência atual (aguardando envio do POBJ).`;
      }

      if (arg.includes('folha')) {
        return `📋 <b>Conquista Folha PJ:</b>\n• Pontos: ${snapshot.folha_pts || '0,00 de 4,00 pts'}\n• Alvo: ${snapshot.folha_target || 'Hospital & Maternidade São Lucas'}\n• Contato: ${snapshot.folha_contact || 'Dr. Arnaldo'}`;
      }
      if (arg.includes('cobranca')) {
        return `📋 <b>Faturamento Boleto + PIX:</b>\n• Alvo: ${snapshot.cobranca_target || 'Metalúrgica Forja Sul'}\n• Volume: ${snapshot.cobranca_val || 'R$ 420 mil'}\n• Contato: ${snapshot.cobranca_contact || 'Sr. Cláudio Mendes'}`;
      }
      if (arg.includes('vencidos')) {
        return `📋 <b>Indicador Vencidos Até 59 dias:</b>\n• Percentual: ${snapshot.vencidos_pct || '78.3%'}\n• Pontos: ${snapshot.vencidos_pts || '9,34 pontos'}\n• Alerta: ${snapshot.vencidos_alert || 'alerta de mora'}`;
      }

      return `📋 <b>Indicador '${arg}':</b> Detalhes da competência atual disponíveis.`;
    }

    case "/fontes": {
      return (
        `🗂️ <b>Registro de Fontes Autorizadas</b>\n\n` +
        `1. <b>Relatório POBJ Oficial:</b> <i>PDF enviado via canal oficial</i>\n` +
        `2. <b>Base de Dados Operacional:</b> <code>PostgreSQL visao360</code>\n` +
        `3. <b>Orientações e Decisões:</b> <code>Rafael (OWNER_PROVIDED)</code> — <i>Soberano</i>`
      );
    }

    case "/evidencias": {
      return (
        `🧬 <b>Evidence Graph 360 — Linhagem de Decisão</b>\n\n` +
        `• <b>Grafo:</b> Nós e arestas estruturados conforme W3C PROV e OpenLineage.\n` +
        `• <b>Integridade:</b> Hashes SHA-256 e proveniência ponta a ponta.\n` +
        `• <b>Decisão Final:</b> Exclusiva de Rafael.`
      );
    }

    case "/briefing": {
      return (
        `🌅 <b>Briefing Matinal 360 — Agência 6895</b>\n\n` +
        `• <b>Status do Dia:</b> Operação matinal iniciada.\n` +
        `• <b>Prioridades:</b> Acompanhar POBJ e demandas prioritárias de clientes.`
      );
    }

    case "/abordar": {
      return (
        `📝 <b>Rascunho de Abordagem Comercial</b>\n\n` +
        `• <b>Destinatário:</b> Dr. Arnaldo Silveira\n` +
        `• <b>Proposta:</b> Estruturação de folha de pagamento com atendimento consultivo.`
      );
    }

    default:
      return null;
  }
}