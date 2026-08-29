# -*- coding: utf-8 -*-
import os, sys, json, time, hashlib
from typing import Dict, Any, List

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from core.performance_engine import PerformanceEngine
except ImportError:
    from performance_engine import PerformanceEngine

class Director360Runtime:
    """
    Diretor 360 Runtime — Modo ACTIVE_READ_ONLY_SUPERVISED (Marco A4)
    Consolida pareceres dos 4 Gerentes Gerais sem intervenção externa automática.
    """
    def __init__(self):
        self.performance_engine = PerformanceEngine()
        self.version = "3.2.27"

    def run_supervised_analysis(self, company_data: Dict[str, Any]) -> Dict[str, Any]:
        cnpj = company_data.get("cnpj", "00.000.000/0000-00")
        name = company_data.get("name", "Empresa Exemplo")
        
        # 1. Parecer GG Conta (Identidade, Restrições 1-7, Ciclo de Vida)
        parecer_conta = {
            "domain": "CONTA",
            "manager_version": "4.38.0",
            "runtime_status": "ACTIVE_READ_ONLY_SUPERVISED",
            "cadastral_status": "ATIVO_REGULAR",
            "restriction_grade": company_data.get("restriction_grade", 1),
            "risk_clearance": "LIBERADO" if company_data.get("restriction_grade", 1) <= 3 else "BLOQUEADO",
            "account_lifecycle_phase": company_data.get("lifecycle_phase", "MADURA"),
            "health_condition": company_data.get("health_condition", "NORMAL")
        }

        # 2. Parecer GG Performance (Score POBJ, Gaps, Oportunidades)
        pobj_data = self.performance_engine.load_pobj()
        parecer_performance = {
            "domain": "PERFORMANCE",
            "manager_version": "5.3.0",
            "runtime_status": "ACTIVE_READ_ONLY_SUPERVISED",
            "current_pobj_score": pobj_data["achieved_points"],
            "projected_pobj_score": pobj_data["projected_final_points"],
            "suggested_product_lever": "Capital de Giro PJ" if parecer_conta["risk_clearance"] == "LIBERADO" else "Regularização Cadastral"
        }

        # 3. Parecer GG Financeiro (DRE, Liquidez, Margem)
        parecer_financeiro = {
            "domain": "FINANCEIRO",
            "manager_version": "2.0.0",
            "runtime_status": "ACTIVE_READ_ONLY_SUPERVISED",
            "revenue_12m": company_data.get("revenue_12m", 12000000.0),
            "net_margin_pct": company_data.get("net_margin_pct", 18.5),
            "current_liquidity": company_data.get("liquidity", 1.85),
            "financial_viability": "ELEVADA"
        }

        # 4. Parecer GG Relacionamento (Timeline, Contatos, Abordagem)
        parecer_relacionamento = {
            "domain": "RELACIONAMENTO",
            "manager_version": "2.0.0",
            "runtime_status": "ACTIVE_READ_ONLY_SUPERVISED",
            "days_since_last_contact": company_data.get("days_since_contact", 15),
            "contact_alert": "NORMAL" if company_data.get("days_since_contact", 15) <= 60 else "OVERDUE",
            "consultative_script_ready": True
        }

        # 5. Consolidação do Estado 360 Imutável
        state_payload = {
            "state_id": f"STATE_{hashlib.md5(f'{cnpj}_{time.time()}'.encode()).hexdigest()[:12]}",
            "version": 1,
            "status": "READY_FOR_HUMAN_REVIEW",
            "mode": "ACTIVE_READ_ONLY_SUPERVISED",
            "company": {"cnpj": cnpj, "name": name},
            "domain_handoffs": [
                parecer_conta,
                parecer_performance,
                parecer_financeiro,
                parecer_relacionamento
            ],
            "recommendation": {
                "action": "PROPOR_GIRO_E_EXPANSAO" if parecer_conta["risk_clearance"] == "LIBERADO" else "REGULARIZAR_RESTRICAO",
                "limit_suggested": 1500000.0 if parecer_conta["risk_clearance"] == "LIBERADO" else 0.0,
                "urgency": "P1_ALTA",
                "requires_human_dispatch": True,
                "decision_authority": "rafael"
            },
            "evidence_graph_nodes": 8,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }

        state_hash = hashlib.sha256(json.dumps(state_payload, sort_keys=True).encode("utf-8")).hexdigest()
        state_payload["state_hash"] = state_hash

        return state_payload

if __name__ == "__main__":
    runtime = Director360Runtime()
    sample_company = {
        "cnpj": "12.345.678/0001-90",
        "name": "Metalúrgica Santa Rita Ltda",
        "restriction_grade": 1,
        "lifecycle_phase": "MADURA",
        "health_condition": "NORMAL",
        "revenue_12m": 14850000.0,
        "net_margin_pct": 18.2,
        "liquidity": 1.85,
        "days_since_contact": 12
    }
    result = runtime.run_supervised_analysis(sample_company)
    print(json.dumps(result, indent=2, ensure_ascii=False))