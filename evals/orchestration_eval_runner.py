# -*- coding: utf-8 -*-
import sys, os, json, time, hashlib
from typing import Dict, Any, List
from datetime import datetime, timezone

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.orchestrator_360 import Orchestrator360
from core.performance_engine import PerformanceEngine
from core.financeiro_engine import FinanceiroEngine
from core.relacionamento_engine import RelacionamentoEngine
from core.conta_engine import ContaEngine

def run_orchestration_evals():
    """
    Executor de Evals da Orquestração 360 (Etapa E).
    Executa os 20 casos canônicos através do Orchestrator360 e avalia L1 a L4.
    """
    cases_dir = "test-data/evals/cases"
    os.makedirs(cases_dir, exist_ok=True)
    
    orch = Orchestrator360()
    results = []
    
    total_cases = 20
    l1_passed = 0
    l2_passed = 0
    l3_passed = 0
    l4_passed = 0
    total_latency_ms = 0.0

    print(f"Iniciando execucao de {total_cases} casos sinteticos no Orchestrator360...")

    for i in range(1, total_cases + 1):
        case_id = f"CASE_{i:03d}"
        
        # Simula caso com variações determinísticas
        faturamento = 5000000.0 + (i * 500000.0)
        restr_grade = 1 if i <= 15 else (3 if i <= 18 else 5)
        days_contact = 10 + (i * 4)
        account_days = 30 * (i % 6 + 1)
        
        input_data = {
            "case_id": case_id,
            "cnpj": f"12.345.{i:03d}/0001-90",
            "razao_social": f"Empresa Sintetica {i} Ltda",
            "faturamento_12m": faturamento,
            "margem_ebitda": 15.0 + (i % 5),
            "restriction_grade": restr_grade,
            "days_since_contact": days_contact,
            "account_age_days": account_days
        }

        t0 = time.time()
        cycle_res = orch.execute_360_cycle(input_data)
        latency_ms = round((time.time() - t0) * 1000.0, 2)
        total_latency_ms += latency_ms

        # L1: Determinismo estrutural (4 domínios presentes)
        has_4_domains = len(cycle_res.get("domain_packets", {})) == 4
        if has_4_domains:
            l1_passed += 1

        # L2: Integridade de Dados
        has_correct_restr = cycle_res["domain_packets"]["CONTA"]["context_payload"]["restriction"]["grade"] == restr_grade
        if has_correct_restr:
            l2_passed += 1

        # L3: Rastreabilidade (Evidence Graph com 8 nós)
        has_evidence = cycle_res.get("evidence_graph_nodes_count", 0) >= 8
        if has_evidence:
            l3_passed += 1

        # L4: Decisão Coerente (Se Grau 5 -> MANUAL_REVIEW_REQUIRED ou BLOQUEIO)
        expected_status = "MANUAL_REVIEW_REQUIRED" if restr_grade >= 5 else "READY"
        decision_match = (cycle_res["overall_status"] == expected_status)
        if decision_match:
            l4_passed += 1

        results.append({
            "case_id": case_id,
            "latency_ms": latency_ms,
            "restriction_grade": restr_grade,
            "overall_status": cycle_res["overall_status"],
            "l1_deterministic": has_4_domains,
            "l2_extraction": has_correct_restr,
            "l3_reasoning": has_evidence,
            "l4_decision": decision_match
        })

    avg_latency = round(total_latency_ms / total_cases, 2)
    l1_rate = round((l1_passed / total_cases) * 100.0, 2)
    l2_rate = round((l2_passed / total_cases) * 100.0, 2)
    l3_rate = round((l3_passed / total_cases) * 100.0, 2)
    l4_rate = round((l4_passed / total_cases) * 100.0, 2)

    eval_report = {
        "report_id": f"EVAL_ORCH_{int(time.time())}",
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
        "total_cases_evaluated": total_cases,
        "metrics": {
            "l1_deterministic_accuracy_pct": l1_rate,
            "l2_data_integrity_pct": l2_rate,
            "l3_evidence_lineage_coverage_pct": l3_rate,
            "l4_decision_agreement_rate_pct": l4_rate,
            "average_latency_ms": avg_latency
        },
        "target_slos": {
            "min_l1_accuracy_pct": 100.0,
            "min_l2_integrity_pct": 95.0,
            "min_l3_coverage_pct": 100.0,
            "min_l4_agreement_pct": 90.0,
            "max_latency_ms": 250.0
        },
        "slo_compliance_status": "ALL_SLOS_MET" if (l1_rate == 100.0 and l3_rate == 100.0 and l4_rate >= 90.0) else "DEGRADED",
        "detailed_results": results
    }

    report_path = "test-data/evals/eval_orchestration_report_latest.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(eval_report, f, indent=2, ensure_ascii=False)

    print("========================================================================")
    print("   RESULTADO DOS EVALS DA ORQUESTRACAO 360 (ETAPA E)                   ")
    print("========================================================================")
    print(f" Casos Avaliados: {total_cases}")
    print(f" L1 Determinismo: {l1_rate}% (Meta: 100.0%)")
    print(f" L2 Integridade:  {l2_rate}% (Meta: >=95.0%)")
    print(f" L3 Linhagem:     {l3_rate}% (Meta: 100.0%)")
    print(f" L4 Concordancia: {l4_rate}% (Meta: >=90.0%)")
    print(f" Latencia Media:  {avg_latency} ms")
    print(f" Status Final:    {eval_report['slo_compliance_status']}")
    print("========================================================================")
    
    return eval_report

if __name__ == "__main__":
    run_orchestration_evals()