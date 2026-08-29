# -*- coding: utf-8 -*-
import json, os, hashlib
from typing import Dict, Any, List, Optional

class FinanceiroEngine:
    """
    Motor Determinístico do Domínio Financeiro & GDAD (Marco P2.2)
    Calcula orçamento vs. realizado do GDAD, margem de contribuição e viabilidade financeira.
    """
    def __init__(self, gdad_path: str = "test-data/financeiro/gdad_sample.json"):
        self.gdad_path = gdad_path
        os.makedirs("test-data/financeiro", exist_ok=True)
        if not os.path.exists(self.gdad_path):
            self._init_default_gdad()

    def _init_default_gdad(self):
        default_data = {
            "period": "Agosto/2026",
            "branch": "6895 - VJ-SAO FIDELIS",
            "accounts": [
                {
                    "account_name": "Receita de Intermediação Financeira (Crédito PJ)",
                    "budget_val": 420000.0,
                    "realized_val": 510000.0
                },
                {
                    "account_name": "Receita de Prestação de Serviços & Tarifas",
                    "budget_val": 180000.0,
                    "realized_val": 195000.0
                },
                {
                    "account_name": "Receita de Cobrança Bancária & Convênios",
                    "budget_val": 75000.0,
                    "realized_val": 82000.0
                },
                {
                    "account_name": "Custo de Captação e Funding",
                    "budget_val": 220000.0,
                    "realized_val": 240000.0
                },
                {
                    "account_name": "Provisão para Créditos de Liquidação Duvidosa (PCLD)",
                    "budget_val": 65000.0,
                    "realized_val": 48000.0
                }
            ]
        }
        with open(self.gdad_path, "w", encoding="utf-8") as f:
            json.dump(default_data, f, indent=2, ensure_ascii=False)

    def calculate_gdad_summary(self) -> Dict[str, Any]:
        with open(self.gdad_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        total_budget_revenue = 0.0
        total_realized_revenue = 0.0
        total_budget_cost = 0.0
        total_realized_cost = 0.0
        account_results = []

        for acc in data.get("accounts", []):
            name = acc["account_name"]
            budget = acc["budget_val"]
            realized = acc["realized_val"]
            variance_abs = round(realized - budget, 2)
            variance_pct = round((variance_abs / budget) * 100.0, 2) if budget > 0 else 0.0
            
            is_cost = "Custo" in name or "PCLD" in name
            if is_cost:
                total_budget_cost += budget
                total_realized_cost += realized
            else:
                total_budget_revenue += budget
                total_realized_revenue += realized

            account_results.append({
                "account_name": name,
                "budget": budget,
                "realized": realized,
                "variance_abs": variance_abs,
                "variance_pct": variance_pct,
                "status": "FAVORAVEL" if (realized >= budget if not is_cost else realized <= budget) else "DESFAVORAVEL"
            })

        budget_margin = round(total_budget_revenue - total_budget_cost, 2)
        realized_margin = round(total_realized_revenue - total_realized_cost, 2)
        margin_variance = round(realized_margin - budget_margin, 2)

        return {
            "period": data["period"],
            "branch": data["branch"],
            "total_budget_revenue": total_budget_revenue,
            "total_realized_revenue": total_realized_revenue,
            "total_budget_cost": total_budget_cost,
            "total_realized_cost": total_realized_cost,
            "budget_net_margin": budget_margin,
            "realized_net_margin": realized_margin,
            "margin_variance_abs": margin_variance,
            "margin_growth_pct": round((margin_variance / budget_margin) * 100.0, 2) if budget_margin > 0 else 0.0,
            "account_breakdown": account_results
        }

    @staticmethod
    def calculate_company_profitability(revenue_12m: float, margin_pct: float, funding_cost_rate: float = 0.08) -> Dict[str, Any]:
        """Calcula rentabilidade estimada e margem de contribuição de cliente PJ."""
        if revenue_12m <= 0:
            return {"status": "NOT_AVAILABLE", "reason": "Faturamento não informado ou zerado"}
            
        gross_profit = revenue_12m * (margin_pct / 100.0)
        est_funding_cost = gross_profit * funding_cost_rate
        net_contribution = round(gross_profit - est_funding_cost, 2)
        
        return {
            "revenue_12m": revenue_12m,
            "margin_pct": margin_pct,
            "estimated_gross_profit": round(gross_profit, 2),
            "estimated_net_contribution": net_contribution,
            "viability_tier": "ALTA" if margin_pct >= 15.0 else ("MEDIA" if margin_pct >= 8.0 else "BAIXA")
        }

if __name__ == "__main__":
    engine = FinanceiroEngine()
    summary = engine.calculate_gdad_summary()
    print("Margem Realizada GDAD:", summary["realized_net_margin"])
    print("Variação da Margem:", summary["margin_growth_pct"], "%")