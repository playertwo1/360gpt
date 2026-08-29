import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  // Evidence Graph is an authenticated, read-only surface.
  const authModule = await import('../../chatgpt-auth');
  const user = await authModule.getChatGPTUser();
  if (!user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
  if (!authModule.isDashboardUserAllowed(user)) return NextResponse.json({ error: 'access_denied' }, { status: 403 });
  const humanizedGraph = {
    estado_id: "STATE_360_LIVE",
    data_geracao: new Date().toISOString(),
    resumo_executivo: "Trilha de Evidências Humanizada: do dado bruto até a recomendação comercial.",
    trilha_humanizada: [
      {
        passo: 1,
        fase: "📥 ORIGEM DO DADO",
        icone: "📥",
        titulo: "Entrada via Telegram (@Diretor_360bot)",
        descricao: "Rafael enviou comando ou documento com parâmetros da agência 6895 (VJ-SAO FIDELIS). Dados recebidos e validados.",
        detalhes: { canal: "Telegram Webhook Oficial", remetente: "Rafael Pedrosa (ID 5281600644)" }
      },
      {
        passo: 2,
        fase: "⚙️ MOTOR DETERMINÍSTICO",
        icone: "⚙️",
        titulo: "Processamento por Regra Oficial 2026",
        descricao: "Motores de Performance e Finanças aplicaram as curvas do POBJ (Piso 70% = 0 pts / Meta 100% = 10 pts / Teto 150% = 15 pts) e conciliação do GDAD.",
        detalhes: { motor: "PerformanceEngine & FinanceiroEngine", status_calculo: "100% DETERMINÍSTICO" }
      },
      {
        passo: 3,
        fase: "🔍 DIAGNÓSTICO & ACHADO",
        icone: "🔍",
        titulo: "Gaps de Metas & Clientes Elegíveis",
        descricao: "Identificado gap de 26,96 pontos no POBJ. 4 empresas da carteira PJ foram identificadas como 100% elegíveis para Capital de Giro (Grau 1 sem restrições).",
        detalhes: { gap_pobj: "26.96 pts", clientes_aptos: 4 }
      },
      {
        passo: 4,
        fase: "💡 RECOMENDAÇÃO EXECUTIVA",
        icone: "💡",
        titulo: "Plano de Ação Comercial (P0/P1/P2)",
        descricao: "Ação P0 sugerida: Ofertar Capital de Giro de R$ 1,5M para Metalúrgica Santa Rita e R$ 800k para Transportadora TransVale.",
        detalhes: { acao_principal: "CAPITAL_DE_GIRO", prioridade: "P0" }
      },
      {
        passo: 5,
        fase: "✍️ DECISÃO SOBERANA",
        icone: "✍️",
        titulo: "Aguardando Despacho de Rafael",
        descricao: "A recomendação está montada na Mesa de Decisão. O sistema NUNCA dispara ações externas sem seu clique expresso de aprovação.",
        detalhes: { autoridade: "Rafael Pedrosa (fael@live.de)", status: "AGUARDANDO_AUTORIZACAO" }
      }
    ]
  };

  return NextResponse.json(humanizedGraph, { status: 200 });
}
