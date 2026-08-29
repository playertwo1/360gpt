# -*- coding: utf-8 -*-
import json, os, hashlib, time
from typing import Dict, Any, List, Tuple, Optional

class PerformanceEngine:
    """
    Motor Determinístico Refinado de Performance & POBJ 2026 (Bloco 1).
    Calcula pontuações com curvas oficiais (Piso 70%, Meta 100%, Teto 150%),
    Run-Rate, Necessidade Diária, Simulação de Cenários e Provocação Crítica.
    """
    def __init__(self, pobj_path: str = "test-data/performance/pobj_agosto_2026.json"):
        self.pobj_path = pobj_path
        os.makedirs("test-data/performance", exist_ok=True)
        # Sempre inicializa ou atualiza com a estrutura canônica completa
        self._init_default_pobj()

    def _init_default_pobj(self):
        default_data = {
            "period": "Agosto/2026",
            "reference_date": "2026-08-25",
            "manager": "VJ-RAFAEL PEDROSA GONCALVES",
            "branch": "6895 - VJ-SAO FIDELIS",
            "total_indicators": 7,
            "target_points": 98.00,
            "achieved_points": 57.96,
            "pct_monthly_achieved": 59.14,
            "points_needed": 7.00,
            "projected_final_points": 72.44,
            "business_days_total": 21,
            "business_days_elapsed": 17,
            "business_days_remaining": 4,
            "categories": [
                {
                    "id": "CREDITO_PJ",
                    "category": "Negócios Crédito (Capital de Giro / Pronampe)",
                    "weight_max": 15.00,
                    "target_value": 765726.75,
                    "achieved_value": 1384193.37,
                    "unit": "R$"
                },
                {
                    "id": "CAPTACAO_RECURSOS",
                    "category": "Negócios Captação (CDB, Fundos, Poupança)",
                    "weight_max": 20.00,
                    "target_value": 1000000.00,
                    "achieved_value": 545500.00,
                    "unit": "R$"
                },
                {
                    "id": "CRESCIMENTO_PJ",
                    "category": "Clientes (Crescimento Líquido PJ)",
                    "weight_max": 16.00,
                    "target_value": 4.00,
                    "achieved_value": 3.00,
                    "unit": "Contas"
                },
                {
                    "id": "QUALIDADE_ENCANTA",
                    "category": "Qualidade e Satisfação (Encanta BRA)",
                    "weight_max": 10.00,
                    "target_value": 144.00,
                    "achieved_value": 150.00,
                    "unit": "Pontos NPS"
                },
                {
                    "id": "OPEN_FINANCE",
                    "category": "Aceleradores (Open Finance Ativo)",
                    "weight_max": 15.00,
                    "target_value": 4.00,
                    "achieved_value": 5.00,
                    "unit": "Consentimentos"
                },
                {
                    "id": "SEGUROS_CONSORCIOS",
                    "category": "Seguridade e Consórcios PJ",
                    "weight_max": 12.00,
                    "target_value": 50000.00,
                    "achieved_value": 22000.00,
                    "unit": "R$"
                },
                {
                    "id": "FOLHA_PAGAMENTO",
                    "category": "Convênios de Folha de Pagamento",
                    "weight_max": 10.00,
                    "target_value": 2.00,
                    "achieved_value": 1.00,
                    "unit": "Empresas"
                }
            ]
        }
        with open(self.pobj_path, "w", encoding="utf-8") as f:
            json.dump(default_data, f, indent=2, ensure_ascii=False)

    def load_pobj(self) -> Dict[str, Any]:
        if os.path.exists(self.pobj_path):
            with open(self.pobj_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                # Se as categorias tiverem achieved_value, usa direto
                if data.get("categories") and "achieved_value" in data["categories"][0]:
                    return data
        self._init_default_pobj()
        with open(self.pobj_path, "r", encoding="utf-8") as f:
            return json.load(f)

    @staticmethod
    def calculate_score_curve(achieved_val: float, target_val: float, weight_max: float) -> Tuple[float, float, str]:
        """
        Curva Oficial de Pontuação POBJ 2026:
        - Abaixo de 70% da meta: 0 pontos (Piso).
        - Em 100% da meta: 100% dos pontos da meta (weight_max).
        - Acima de 150% da meta: Limitado a 150% dos pontos (Teto).
        - Entre 70% e 150%: Escala linear progressiva.
        """
        if target_val <= 0:
            return 0.0, 0.0, "INVALID_TARGET"
        
        pct_achieved = (achieved_val / target_val) * 100.0
        
        if pct_achieved < 70.0:
            points = 0.0
            status = "ABAIXO_DO_PISO"
        elif pct_achieved >= 150.0:
            points = weight_max * 1.5
            status = "SUPERADO_TETO"
        elif pct_achieved >= 100.0:
            # Escala entre 100% e 150%
            points = weight_max + (weight_max * 0.5) * ((pct_achieved - 100.0) / 50.0)
            status = "META_ATINGIDA"
        else:
            # Escala entre 70% e 100%
            points = weight_max * ((pct_achieved - 70.0) / 30.0)
            status = "EM_ANDAMENTO"
            
        return round(points, 2), round(pct_achieved, 2), status

    def evaluate_full_pobj(self) -> Dict[str, Any]:
        """Avalia todos os indicadores e calcula o consolidado do POBJ com run-rate."""
        data = self.load_pobj()
        remaining_days = data.get("business_days_remaining", 4)
        elapsed_days = data.get("business_days_elapsed", 17)
        total_days = data.get("business_days_total", 21)

        evaluated_categories = []
        total_achieved_pts = 0.0
        total_weight_max = 0.0
        floor_breaches = []
        ceiling_saturated = []

        for cat in data.get("categories", []):
            achieved = cat.get("achieved_value", cat.get("target_value", 100.0) * 0.75)
            target = cat.get("target_value", 100.0)
            weight = cat.get("weight_max", 10.0)
            
            pts, pct, status = self.calculate_score_curve(achieved, target, weight)
            total_achieved_pts += pts
            total_weight_max += weight

            # Necessidade Diária
            nec_dia = 0.0
            if remaining_days > 0 and achieved < target:
                gap_val = target - achieved
                nec_dia = round(gap_val / remaining_days, 2)

            # Run-rate projetado no final do mês
            run_rate_val = round((achieved / max(1, elapsed_days)) * total_days, 2)
            proj_pts, proj_pct, proj_status = self.calculate_score_curve(run_rate_val, target, weight)

            cat_eval = {
                "id": cat.get("id", cat["category"]),
                "category": cat["category"],
                "unit": cat.get("unit", "R$"),
                "target_value": target,
                "achieved_value": achieved,
                "pct_achieved": pct,
                "weight_max": weight,
                "achieved_points": pts,
                "status": status,
                "daily_necessity": nec_dia,
                "projected_final_value": run_rate_val,
                "projected_final_points": proj_pts
            }
            evaluated_categories.append(cat_eval)

            if status == "ABAIXO_DO_PISO":
                floor_breaches.append(cat["category"])
            elif status == "SUPERADO_TETO":
                ceiling_saturated.append(cat["category"])

        total_achieved_pts = round(total_achieved_pts, 2)
        target_pts = round(data.get("target_points", 100.0), 2)
        gap_pts = max(0.0, round(target_pts - total_achieved_pts, 2))

        # Provocação Crítica Executiva
        provocation = None
        if ceiling_saturated and floor_breaches:
            provocation = (
                f"⚠️ ATENÇÃO EXECUTIVA: Você atingiu o TETO em '{ceiling_saturated[0]}' (onde novo esforço gera 0 pontos adicionais), "
                f"enquanto '{floor_breaches[0]}' está ABAIXO DO PISO (0 pontos ganhos). "
                f"Redirecionar esforço para tirar indicadores do piso gerará até 3x mais pontos hoje!"
            )

        return {
            "period": data["period"],
            "manager": data["manager"],
            "branch": data["branch"],
            "total_weight_max": total_weight_max,
            "target_points": target_pts,
            "achieved_points": total_achieved_pts,
            "gap_points": gap_pts,
            "pct_realized": round((total_achieved_pts / target_pts) * 100.0, 2),
            "categories": evaluated_categories,
            "floor_breaches": floor_breaches,
            "ceiling_saturated": ceiling_saturated,
            "executive_provocation": provocation
        }

    def simulate_deal_impact(self, category_id: str, added_value: float) -> Dict[str, Any]:
        """Simula o impacto em pontos do fechamento de um negócio específico."""
        full_eval = self.evaluate_full_pobj()
        cat = next((c for c in full_eval["categories"] if c["id"] == category_id), None)
        if not cat:
            return {"error": f"Categoria '{category_id}' nao encontrada."}

        new_val = cat["achieved_value"] + added_value
        new_pts, new_pct, new_status = self.calculate_score_curve(new_val, cat["target_value"], cat["weight_max"])
        pts_gain = round(new_pts - cat["achieved_points"], 2)

        return {
            "category_id": category_id,
            "category": cat["category"],
            "added_value": added_value,
            "previous_points": cat["achieved_points"],
            "simulated_points": new_pts,
            "points_gain": pts_gain,
            "new_status": new_status,
            "simulated_total_pobj": round(full_eval["achieved_points"] + pts_gain, 2)
        }


    @staticmethod
    def calculate_daily_necessity(target_val: float, achieved_val: float, remaining_days: int) -> float:
        """Calcula a necessidade diária para alcançar a meta nos dias úteis restantes."""
        if remaining_days <= 0:
            return 0.0
        gap = max(0.0, target_val - achieved_val)
        return round(gap / remaining_days, 2)

    def generate_diagnostic_text(self) -> str:
        data = self.load_pobj()
        text = (
            f"📊 *DIAGNÓSTICO EXECUTIVO — POBJ {data['period'].upper()}*\n"
            f"👤 *Gerente:* {data['manager']} ({data['branch']})\n"
            f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            f"🏆 *Score Realizado:* `{data['achieved_points']} pts` ({data['pct_monthly_achieved']}%)\n"
            f"🎯 *Meta Teto:* `{data['target_points']} pts` (100,00%)\n"
            f"⚡ *Projeção Final:* `{data.get('projected_final_points', data['achieved_points'])} pts`\n"
            f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
            f"📋 *Posição por Categoria de Negócio:*\n"
        )
        for cat in data.get("categories", []):
            badge = "🟢" if "SUPERADO" in cat.get("status", "") else "🟡"
            text += f"• {badge} *{cat['category']}:* `{cat.get('achieved_points', 0.0)} pts` / `{cat.get('weight_max', 10.0)} pts`\n"
        return text

if __name__ == "__main__":
    eng = PerformanceEngine()
    res = eng.evaluate_full_pobj()
    print(f"POBJ Consolidado: {res['achieved_points']} pts / {res['target_points']} pts (Gap: {res['gap_points']} pts)")