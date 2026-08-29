# -*- coding: utf-8 -*-
import os, sys, json, time
from typing import Dict, Any, List

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from core.performance_engine import PerformanceEngine
    from core.carteira_pj_engine import CarteiraPJEngine
except ImportError:
    from performance_engine import PerformanceEngine
    from carteira_pj_engine import CarteiraPJEngine

class DailyActionPlanEngine:
    def __init__(self):
        self.performance_engine = PerformanceEngine()
        self.carteira_engine = CarteiraPJEngine()

    def generate_daily_plan(self) -> Dict[str, Any]:
        pobj = self.performance_engine.load_pobj()
        current_pts = pobj["achieved_points"]
        target_pts = pobj.get("target_points", 78.00)
        gap_pts = round(max(0, target_pts - current_pts), 2)
        
        # 1. Mapear Gaps do POBJ para Produtos da Carteira
        actions = []
        
        # Alavanca 1: Crédito / Capital de Giro PJ
        giro_eligible = self.carteira_engine.get_eligible_companies_for_product("CREDITO_GIRO")
        for item in giro_eligible[:2]: # Top 2
            c = item["company"]
            actions.append({
                "priority": "P0_URGENTE",
                "category": "CRÉDITO PJ (FECHAMENTO DE TETO)",
                "company_name": c["nome_fantasia"],
                "cnpj": c["cnpj"],
                "contact_person": c["contato_decisor"],
                "phone": c["telefone"],
                "opportunity": f"Capital de Giro (R$ {item['value_available']:,.2f} pré-aprovado)",
                "pobj_impact": "+15.00 pts no POBJ",
                "pitch_suggestion": f"Roberto/Carlos, identificamos um limite rotativo/giro pré-aprovado de R$ {item['value_available']:,.2f} com taxa diferenciada de CDI + 0.35% disponível para liberação hoje.",
                "days_without_contact": c["dias_sem_contato"]
            })

        # Alavanca 2: Folha de Pagamento PJ
        folha_eligible = self.carteira_engine.get_eligible_companies_for_product("FOLHA_PAGAMENTO")
        for item in folha_eligible[:2]:
            c = item["company"]
            actions.append({
                "priority": "P1_ALTA",
                "category": "CONQUISTA DE FOLHA PJ",
                "company_name": c["nome_fantasia"],
                "cnpj": c["cnpj"],
                "contact_person": c["contato_decisor"],
                "phone": c["telefone"],
                "opportunity": f"Captação de Folha ({item['value_available']} vidas)",
                "pobj_impact": "+8.50 pts no POBJ",
                "pitch_suggestion": f"Apresentar proposta de isenção de cesta de serviços para os {item['value_available']} funcionários e linha de crédito consignado exclusiva.",
                "days_without_contact": c["dias_sem_contato"]
            })

        # Alavanca 3: Cobrança Bancária & Varejo
        cobranca_eligible = self.carteira_engine.get_eligible_companies_for_product("COBRANCA_BANCARIA")
        for item in cobranca_eligible[:1]:
            c = item["company"]
            actions.append({
                "priority": "P2_MEDIA",
                "category": "SERVIÇOS & COBRANÇA BANCÁRIA",
                "company_name": c["nome_fantasia"],
                "cnpj": c["cnpj"],
                "contact_person": c["contato_decisor"],
                "phone": c["telefone"],
                "opportunity": "Implantação de Esteira de Boletos",
                "pobj_impact": "+5.00 pts no POBJ",
                "pitch_suggestion": "Oferecer redução de tarifa por boleto liquidado e integração com ERP financeiro.",
                "days_without_contact": c["dias_sem_contato"]
            })

        return {
            "date": time.strftime("%d/%m/%Y"),
            "manager_name": "Rafael Pedrosa (VJ-SAO FIDELIS)",
            "pobj_summary": {
                "score_realizado": current_pts,
                "score_teto": target_pts,
                "gap_pontos": gap_pts,
                "projecao_atual": pobj["projected_final_points"]
            },
            "total_actions": len(actions),
            "actions_queue": actions
        }

    def format_telegram_daily_briefing(self) -> str:
        plan = self.generate_daily_plan()
        pobj = plan["pobj_summary"]
        
        text = (
            f"📋 *PLANO DIÁRIO DE AÇÃO COMERCIAL — {plan['date']}*\n"
            f"👤 *Gerente:* {plan['manager_name']}\n"
            f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            f"🎯 *Score POBJ Atual:* `{pobj['score_realizado']} pts` / `{pobj['score_teto']} pts`\n"
            f"⚡ *Gap para o Teto:* `{pobj['gap_pontos']} pts` (Proj: `{pobj['projecao_atual']} pts`)\n"
            f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
            f"🔥 *FILA DE ATENDIMENTO RECOMENDADA:* ({plan['total_actions']} ações prioritárias)\n\n"
        )
        
        for i, act in enumerate(plan["actions_queue"], 1):
            badge = "🔴 *[P0]*" if "P0" in act["priority"] else ("🟠 *[P1]*" if "P1" in act["priority"] else "🟡 *[P2]*")
            text += (
                f"{badge} *{i}. {act['company_name']}*\n"
                f"   💼 *Ação:* {act['opportunity']}\n"
                f"   📈 *Ganho:* `{act['pobj_impact']}`\n"
                f"   👤 *Contato:* {act['contact_person']} | `{act['phone']}`\n"
                f"   🗣️ *Abordagem:* _{act['pitch_suggestion']}_\n\n"
            )
            
        text += "👉 Digite `/analisar <CNPJ>` para ver o dossiê completo de qualquer cliente!"
        return text

if __name__ == "__main__":
    engine = DailyActionPlanEngine()
    briefing = engine.format_telegram_daily_briefing()
    print(briefing)