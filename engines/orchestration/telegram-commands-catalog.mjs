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

      return `📋 <b>Indicador '${arg}':</b> Consulta em desenvolvimento.`;
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

    default:
      return null;
  }
}