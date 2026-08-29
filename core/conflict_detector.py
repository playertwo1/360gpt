# -*- coding: utf-8 -*-
import json, hashlib
from typing import Dict, Any, List, Optional

class ConflictDetector:
    """
    Motor Determinístico de Detecção e Classificação de Conflitos (Etapa D).
    Conforme AGENTS.md v2.1:
    - O Motor nunca escolhe uma fonte divergente por inferência estatística.
    - Todo conflito material gera MANUAL_REVIEW_REQUIRED com payload estruturado.
    """
    
    @staticmethod
    def detect_data_divergence(field_name: str, values_by_source: Dict[str, Any], tolerance_pct: float = 0.0) -> Optional[Dict[str, Any]]:
        """Detecta DIVERGENCIA_DE_DADOS entre fontes autorizadas para o mesmo campo."""
        if len(values_by_source) < 2:
            return None
            
        distinct_values = set()
        numeric_values = []
        
        for src, val in values_by_source.items():
            distinct_values.add(str(val))
            if isinstance(val, (int, float)):
                numeric_values.append(val)
                
        if len(distinct_values) <= 1:
            return None  # Sem divergência
            
        # Se for numérico e estiver dentro da tolerância permitida
        if len(numeric_values) == len(values_by_source) and tolerance_pct > 0.0:
            min_val = min(numeric_values)
            max_val = max(numeric_values)
            if min_val > 0:
                diff_pct = ((max_val - min_val) / min_val) * 100.0
                if diff_pct <= tolerance_pct:
                    return None
                    
        return {
            "conflict_type": "DIVERGENCIA_DE_DADOS",
            "field_name": field_name,
            "values_observed": values_by_source,
            "status": "MANUAL_REVIEW_REQUIRED",
            "reason_code": "DATA_SOURCE_DISCREPANCY",
            "recommended_action": "Solicitar confirmação documental pelo gerente."
        }

    @staticmethod
    def detect_internal_divergence(domain_a: str, conclusion_a: str, domain_b: str, conclusion_b: str) -> Optional[Dict[str, Any]]:
        """Detecta DIVERGENCIA_INTERNA entre conclusões de gerentes gerais ou motores."""
        # Ex: Performance recomenda Crédito PJ, mas Conta aponta restrição Grau 5
        if "RECOMENDAR_CREDITO" in conclusion_a and "BLOQUEIO_CREDITO" in conclusion_b:
            return {
                "conflict_type": "DIVERGENCIA_INTERNA",
                "domains_involved": [domain_a, domain_b],
                "conclusions": { domain_a: conclusion_a, domain_b: conclusion_b },
                "status": "MANUAL_REVIEW_REQUIRED",
                "reason_code": "CROSS_DOMAIN_ELIGIBILITY_CONFLICT",
                "recommended_action": "Manter recomendação suspensa até regularização em Conta."
            }
        return None

if __name__ == "__main__":
    cd = ConflictDetector()
    div1 = cd.detect_data_divergence("faturamento_12m", {"extrato": 1200000.0, "dre": 1800000.0})
    print("Divergência de Dados:", div1)
    div2 = cd.detect_internal_divergence("PERFORMANCE", "RECOMENDAR_CREDITO", "CONTA", "BLOQUEIO_CREDITO")
    print("Divergência Interna:", div2)