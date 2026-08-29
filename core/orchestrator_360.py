# -*- coding: utf-8 -*-
import json, time, hashlib, os
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from core.performance_engine import PerformanceEngine
from core.financeiro_engine import FinanceiroEngine
from core.relacionamento_engine import RelacionamentoEngine
from core.conta_engine import ContaEngine
from core.conflict_detector import ConflictDetector

class Orchestrator360:
    """
    Orquestrador Hierárquico Multiagente Diretor 360 (Etapa D).
    Governa a interação entre Diretor, os 4 Gerentes Gerais e até 4 especialistas por domínio.
    """
    MAX_SPECIALISTS_PER_DOMAIN = 4

    def __init__(self):
        self.perf_engine = PerformanceEngine()
        self.fin_engine = FinanceiroEngine()
        self.rel_engine = RelacionamentoEngine()
        self.conta_engine = ContaEngine()
        self.conflict_detector = ConflictDetector()

    def create_context_packet(self, source_domain: str, target_domain: str, payload: Dict[str, Any], specialists: List[str]) -> Dict[str, Any]:
        """Cria e valida um pacote de contexto imutável com limite estrito de especialistas."""
        if len(specialists) > self.MAX_SPECIALISTS_PER_DOMAIN:
            raise ValueError(f"Violacao de Governanca: Dominio {target_domain} tentou acionar {len(specialists)} especialistas. Maximo permitido: {self.MAX_SPECIALISTS_PER_DOMAIN}")
            
        correlation_id = f"corr_{int(time.time()*1000)}"
        handoff_id = f"HND_{source_domain[:3]}_{target_domain[:3]}_{int(time.time())}"
        
        return {
            "handoff_id": handoff_id,
            "correlation_id": correlation_id,
            "source_domain": source_domain,
            "target_domain": target_domain,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "specialists_invoked": specialists,
            "context_payload": payload,
            "governance": {
                "max_specialists_limit": self.MAX_SPECIALISTS_PER_DOMAIN,
                "lateral_calls_allowed": False,
                "requires_human_approval": True
            }
        }

    def execute_360_cycle(self, client_input: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Executa um ciclo completo integrado pelos 4 domínios."""
        client_input = client_input or {
            "cnpj": "12.345.678/0001-90",
            "razao_social": "Metalúrgica Santa Rita Ltda",
            "faturamento_12m": 12000000.0,
            "margem_ebitda": 18.5,
            "restriction_grade": 1,
            "days_since_contact": 15,
            "account_age_days": 180
        }

        # 1. Domínio Conta (Max 4 especialistas)
        conta_specialists = ["ESP_CADASTRO", "ESP_RESTRICOES", "ESP_MATURACAO", "ESP_ELEGIBILIDADE"]
        restr_eval = self.conta_engine.evaluate_restriction_grade(client_input["restriction_grade"])
        lifecycle_eval = self.conta_engine.evaluate_account_lifecycle(client_input["account_age_days"])
        packet_conta = self.create_context_packet(
            "DIRETOR", "CONTA",
            {"restriction": restr_eval, "lifecycle": lifecycle_eval},
            conta_specialists
        )

        # 2. Domínio Performance (Max 4 especialistas)
        perf_specialists = ["ESP_METAS_POBJ", "ESP_RUNRATE", "ESP_GAPS", "ESP_RANKING"]
        pobj_data = self.perf_engine.load_pobj()
        packet_perf = self.create_context_packet(
            "DIRETOR", "PERFORMANCE",
            {"pobj_summary": pobj_data, "achieved_pts": pobj_data.get("achieved_points", 51.04)},
            perf_specialists
        )

        # 3. Domínio Financeiro (Max 4 especialistas)
        fin_specialists = ["ESP_GDAD", "ESP_MARGEM", "ESP_RENTABILIDADE", "ESP_PRICING"]
        gdad_summary = self.fin_engine.calculate_gdad_summary()
        prof_eval = self.fin_engine.calculate_company_profitability(client_input["faturamento_12m"], client_input["margem_ebitda"])
        packet_fin = self.create_context_packet(
            "DIRETOR", "FINANCEIRO",
            {"gdad": gdad_summary, "profitability": prof_eval},
            fin_specialists
        )

        # 4. Domínio Relacionamento (Max 4 especialistas)
        rel_specialists = ["ESP_AGING_CONTATOS", "ESP_COMPROMISSOS", "ESP_ABORDAGEM"]
        aging_eval = self.rel_engine.classify_contact_aging(client_input["days_since_contact"])
        comm_eval = self.rel_engine.evaluate_commitments()
        packet_rel = self.create_context_packet(
            "DIRETOR", "RELACIONAMENTO",
            {"aging": aging_eval, "commitments": comm_eval},
            rel_specialists
        )

        # 5. Detecção de Conflitos Cross-Domain
        conflicts = []
        c1 = self.conflict_detector.detect_internal_divergence(
            "PERFORMANCE", "RECOMENDAR_CREDITO",
            "CONTA", restr_eval["credit_clearance"]
        )
        if c1:
            conflicts.append(c1)

        state_id = f"STATE_{hashlib.sha256(str(time.time()).encode()).hexdigest()[:12]}"
        
        return {
            "state_id": state_id,
            "overall_status": "READY" if not conflicts else "MANUAL_REVIEW_REQUIRED",
            "requires_human_approval": True,
            "target_authority": "Rafael (fael@live.de)",
            "domain_packets": {
                "CONTA": packet_conta,
                "PERFORMANCE": packet_perf,
                "FINANCEIRO": packet_fin,
                "RELACIONAMENTO": packet_rel
            },
            "conflicts_detected": conflicts,
            "evidence_graph_nodes_count": 8,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }

if __name__ == "__main__":
    orch = Orchestrator360()
    cycle = orch.execute_360_cycle()
    print(f"Ciclo 360 Executado: {cycle['state_id']} (Status: {cycle['overall_status']})")
    print(f"Pacotes de Dominio Validados: {list(cycle['domain_packets'].keys())}")