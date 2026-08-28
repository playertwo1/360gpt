# -*- coding: utf-8 -*-
"""Monitor de simulação sintética do canary.

Não representa casos reais, não cria decisões humanas e não produz efeitos externos.
"""
import json
import os
from typing import Any, Dict


class CanaryMonitor:
    def __init__(self, cases_dir: str = "test-data/evals/cases"):
        self.cases_dir = cases_dir

    def run_canary_simulation(self) -> Dict[str, Any]:
        case_paths = sorted(
            os.path.join(self.cases_dir, filename)
            for filename in os.listdir(self.cases_dir)
            if filename.endswith(".json")
        )[:10]

        waves = {
            "onda_1_inicial_1_a_3": {"count": 3, "status": "SYNTHETIC_REVIEW_PENDING"},
            "onda_2_expansao_4_a_5": {"count": 5, "status": "SYNTHETIC_REVIEW_PENDING"},
            "onda_3_consolidado_6_a_10": {"count": 10, "status": "SYNTHETIC_REVIEW_PENDING"},
        }
        cases_log = []

        for sequence, case_path in enumerate(case_paths, start=1):
            with open(case_path, "r", encoding="utf-8") as source:
                case_data = json.load(source)
            cases_log.append(
                {
                    "sequence": sequence,
                    "case_id": case_data.get("case_id", f"case-{sequence:02d}"),
                    "source": "SYNTHETIC_EVAL_FIXTURE",
                    "recommended_status": case_data.get("expected_status", "READY"),
                    "review_status": "PENDING_RAFAEL_REVIEW",
                    "rafael_verdict": None,
                    "decision_notes": None,
                    "decision_record_hash": None,
                    "external_effects": [],
                }
            )

        return {
            "data_scope": "SYNTHETIC_ONLY",
            "total_canary_cases_processed": len(cases_log),
            "waves": waves,
            "state_mutation_count": 0,
            "external_effect_count": 0,
            "total_human_overrides": None,
            "human_override_rate_percent": None,
            "concordance_rate_percent": None,
            "override_threshold_met": None,
            "pending_human_review_count": len(cases_log),
            "canary_status": "SYNTHETIC_REVIEW_PENDING",
            "cases_log": cases_log,
        }


if __name__ == "__main__":
    report = CanaryMonitor().run_canary_simulation()
    print("=" * 72)
    print(" DIRETOR 360 - SIMULACAO SINTETICA CANARY (REVISAO PENDENTE)")
    print("=" * 72)
    print(f"Casos sinteticos processados: {report['total_canary_cases_processed']}")
    print(f"Revisoes humanas pendentes: {report['pending_human_review_count']}")
    print("Efeitos externos: 0 | Mutacoes de estado: 0")
    print("Nenhuma decisao de Rafael foi simulada.")
    with open("test-data/canary_telemetry_latest.json", "w", encoding="utf-8") as output:
        json.dump(report, output, indent=2, ensure_ascii=False)
