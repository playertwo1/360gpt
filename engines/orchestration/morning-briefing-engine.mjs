/**
 * engines/orchestration/morning-briefing-engine.mjs
 * Marco Operacional — Briefing Matinal Proativo (Disparo diário às 08h30)
 */

export function generateMorningBriefing({
  agencyCode = "6895 - VJ-SAO FIDELIS",
  _competence = "Agosto/2026",
  ownerName = "Rafael",
  currentPoints = 80.71,
  attainmentPct = 100.65,
  beatenIndicators = 7,
  totalIndicators = 22,
  priorities = [
    {
      account: "Hospital & Maternidade São Lucas S/A",
      action: "Portabilidade de Folha de Pagamento (280 vidas)",
      gain: "+4,00 pts no POBJ | +R$ 84.000,00/ano em receita",
      contact: "Dr. Arnaldo Silveira (Dir. Financeiro)",
      command: "/abordar saolucas"
    },
    {
      account: "Metalúrgica Forja Sul Ltda",
      action: "Cobrança Híbrida Boleto+PIX & Blindagem de Vencidos",
      gain: "+4,00 pts de Cobrança e proteção de 9,34 pts de mora",
      contact: "Sr. Cláudio Mendes (Sócio-Administrador)",
      command: "/abordar forjasul"
    }
  ]
}) {
  const dateStr = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

  const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  return (
    `☀️ <b>Bom dia, ${ownerName}! Briefing Matinal 360</b>\n` +
    `🏛️ <b>Agência ${agencyCode}</b> | <i>${formattedDate}</i>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `📊 <b>Posição Consolidada do POBJ:</b>\n` +
    `• <b>Pontuação Atual:</b> <b>${currentPoints.toFixed(2).replace(".", ",")} pts</b> (${attainmentPct.toFixed(2).replace(".", ",")}% atingido)\n` +
    `• <b>Indicadores Batidos:</b> ${beatenIndicators} de ${totalIndicators}\n` +
    `• <b>Meta Global:</b> Batida com aceleradores. Foco agora é maximizar esteiras zeradas e blindar risco de inadimplência.\n\n` +
    `🎯 <b>2 Ações Prioritárias para Hoje:</b>\n\n` +
    `1. <b>${priorities[0].account}</b>\n` +
    `   • <b>Oportunidade:</b> ${priorities[0].action}\n` +
    `   • <b>Retorno:</b> <b>${priorities[0].gain}</b>\n` +
    `   • <b>Contato:</b> ${priorities[0].contact}\n` +
    `   👉 <i>Para ver a mensagem pronta de WhatsApp, envie:</i> <code>${priorities[0].command}</code>\n\n` +
    `2. <b>${priorities[1].account}</b>\n` +
    `   • <b>Oportunidade:</b> ${priorities[1].action}\n` +
    `   • <b>Retorno:</b> <b>${priorities[1].gain}</b>\n` +
    `   • <b>Contato:</b> ${priorities[1].contact}\n` +
    `   👉 <i>Para ver a mensagem pronta de WhatsApp, envie:</i> <code>${priorities[1].command}</code>\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `💡 <i>Tenha um excelente e produtivo dia de negócios!</i>`
  );
}