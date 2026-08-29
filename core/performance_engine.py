# -*- coding: utf-8 -*-
import json, os, hashlib, time
from typing import Dict, Any, List

class PerformanceEngine:
    """
    Motor Determinístico de Performance & POBJ (Marco P2.1)
    Calcula pontuações com curvas oficiais (Piso 70%, Meta 100%, Teto 150%), Run-Rate e Necessidade Diária.
    """
    def __init__(self, pobj_path: str = "test-data/performance/pobj_agosto_2026.json"):
        self.pobj_path = pobj_path
        os.makedirs("test-data/performance", exist_ok=True)
        if not os.path.exists(self.pobj_path):
            self._init_default_pobj()

    def _init_default_pobj(self):
        default_data = {
            "period": "Agosto/2026",
            "reference_date": "2026-08-25",
            "manager": "VJ-RAFAEL PEDROSA GONCALVES",
            "branch": "6895 - VJ-SAO FIDELIS",
            "total_indicators": 20,
            "indicators_achieved": 4,
            "target_points": 78.00,
            "achieved_points": 51.04,
            "pct_monthly_achieved": 65.44,
            "points_needed": 7.00,
            "projected_final_points": 72.44,
            "business_days_total": 21,
            "business_days_elapsed": 17,
            "business_days_remaining": 4,
            "categories": [
                {
                    "category": "Negócios Crédito",
                    "weight_max": 15.00,
                    "target_value": 765726.75,
                    "achieved_value": 1384193.37,
                    "achieved_points": 15.00,
                    "status": "SUPERADO_TETO",
                    "details": "Meta R$ 765.726,75 | Realizado R$ 1.384.193,37 (180,77%)"
                },
                {
                    "category": "Qualidade (Encanta BRA)",
                    "weight_max": 10.00,
                    "target_value": 144.00,
                    "achieved_value": 150.00,
                    "achieved_points": 15.00,
                    "status": "SUPERADO_TETO",
                    "details": "Meta 144,00 | Realizado 150,00 (104,17%)"
                },
                {
                    "category": "Negócios Captação",
                    "weight_max": 20.00,
                    "target_value": 1000000.00,
                    "achieved_value": 545500.00,
                    "achieved_points": 10.91,
                    "status": "EM_ANDAMENTO",
                    "details": "Grupo A: 211,13% | Fundos: 169,36% | Depósito a Prazo: 250,88%"
                },
                {
                    "category": "Ligadas e Aceleradores (Open Finance)",
                    "weight_max": 15.00,
                    "target_value": 4.00,
                    "achieved_value": 5.00,
                    "achieved_points": 7.00,
                    "status": "SUPERADO",
                    "details": "Meta 4,00 | Realizado 5,00 (125,00%)"
                },
                {
                    "category": "Clientes (Crescimento Líquido PJ)",
                    "weight_max": 16.00,
                    "target_value": 4.00,
                    "achieved_value": 3.00,
                    "achieved_points": 4.92,
                    "status": "EM_ANDAMENTO",
                    "details": "Meta 4,00 | Realizado 3,00 (75,00%) | Nec Dia: 0,20"
                }
            ]
        }
        with open(self.pobj_path, "w", encoding="utf-8") as f:
            json.dump(default_data, f, indent=2, ensure_ascii=False)

    def load_pobj(self) -> Dict[str, Any]:
        if os.path.exists(self.pobj_path):
            with open(self.pobj_path, "r", encoding="utf-8") as f:
                return json.load(f)
        self._init_default_pobj()
        with open(self.pobj_path, "r", encoding="utf-8") as f:
            return json.load(f)

    @staticmethod
    def calculate_score_curve(achieved_val: float, target_val: float, weight_max: float) -> Tuple:
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

    def calculate_daily_necessity(self, target_val: float, achieved_val: float, remaining_days: int) -> float:
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
            f"⚡ *Projeção Final:* `{data['projected_final_points']} pts`\n"
            f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
            f"📋 *Posição por Categoria de Negócio:*\n"
        )
        for cat in data.get("categories", []):
            badge = "🟢" if "SUPERADO" in cat["status"] else "🟡"
            text += f"• {badge} *{cat['category']}:* `{cat['achieved_points']} pts` / `{cat['weight_max']} pts`\n  _{cat['details']}_\n"
        return text

if __name__ == "__main__":
    from typing import Tuple
    engine = PerformanceEngine()
    pts, pct, st = engine.calculate_score_curve(1384193.37, 765726.75, 10.0)
    print(f"Crédito PJ: {pct}% -> {pts} pts ({st})")