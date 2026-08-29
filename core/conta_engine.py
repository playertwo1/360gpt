# -*- coding: utf-8 -*-
import json, os, hashlib
from typing import Dict, Any, List, Optional

class ContaEngine:
    """
    Motor Determinístico do Domínio Conta & Carteira PJ (Marco P2.4)
    Executa a Matriz de Restrições 1 a 7 e o Ciclo de Vida da Conta (D0 a D120 + Madura).
    """
    @staticmethod
    def evaluate_restriction_grade(grade: int, restrictions: List[str] = None) -> Dict[str, Any]:
        """Avalia a elegibilidade determinística conforme a Matriz de Restrições 1 a 7."""
        restrictions = restrictions or []
        
        matrix = {
            1: {
                "grade": 1,
                "label": "CADASTRO_LIMPO",
                "credit_clearance": "LIBERADO_TOTAL",
                "action": "Elegível para todas as linhas de crédito e produtos",
                "hard_block": False
            },
            2: {
                "grade": 2,
                "label": "HISTORICO_SANADO",
                "credit_clearance": "LIBERADO_TOTAL",
                "action": "Elegível com monitoramento preventivo de rotina",
                "hard_block": False
            },
            3: {
                "grade": 3,
                "label": "PENDENCIA_DOCUMENTAL_LEVE",
                "credit_clearance": "LIBERADO_COM_RESSALVA",
                "action": "Liberado com exigência de regularização cadastral posterior",
                "hard_block": False
            },
            4: {
                "grade": 4,
                "label": "RESTRICAO_EM_REGULARIZACAO",
                "credit_clearance": "BLOQUEADO_TEMPORARIO",
                "action": "Encaminhar para saneamento antes de novas concessões",
                "hard_block": True
            },
            5: {
                "grade": 5,
                "label": "PROTESTO_OU_CCF_ATIVO",
                "credit_clearance": "BLOQUEADO_CREDITO",
                "action": "Bloqueio estrito de concessão de crédito PJ",
                "hard_block": True
            },
            6: {
                "grade": 6,
                "label": "INADIMPLENCIA_CONGLOMERADO",
                "credit_clearance": "BLOQUEADO_REGULATORIO",
                "action": "Acionar mesa de recuperação de crédito",
                "hard_block": True
            },
            7: {
                "grade": 7,
                "label": "IMPEDIMENTO_LEGAL_JUDICIAL",
                "credit_clearance": "BLOQUEIO_ABSOLUTO",
                "action": "Operações suspensas por exigência jurídica ou compliance",
                "hard_block": True
            }
        }
        
        selected = matrix.get(grade, matrix[7])
        return {
            "grade": selected["grade"],
            "label": selected["label"],
            "credit_clearance": selected["credit_clearance"],
            "hard_block": selected["hard_block"],
            "action": selected["action"],
            "active_restrictions": restrictions
        }

    @staticmethod
    def evaluate_account_lifecycle(account_age_days: int) -> Dict[str, Any]:
        """Classifica a fase de maturação da conta PJ na esteira D0 a D120."""
        if account_age_days <= 15:
            phase = "D0_BOAS_VINDAS"
            priority_action = "Ativação de canais digitais, Chave Pix e primeiro depósito"
        elif account_age_days <= 45:
            phase = "D30_PRIMEIROS_PRODUTOS"
            priority_action = "Oferta de Maquininha / Cobrança Bancária e Domicílio"
        elif account_age_days <= 75:
            phase = "D60_CONSOLIDACAO"
            priority_action = "Consolidação de fluxo de caixa e contratação de Cartão de Crédito PJ"
        elif account_age_days <= 105:
            phase = "D90_EXPANSAO_LIMITES"
            priority_action = "Avaliação e liberação de Limite de Capital de Giro e Rotativo"
        elif account_age_days <= 135:
            phase = "D120_PRINCIPALIDADE"
            priority_action = "Captação da Folha de Pagamento e produtos de Seguridade"
        else:
            phase = "MADURA"
            priority_action = "Fidelização contínua, renovação de linhas e assessoria de investimentos"

        return {
            "account_age_days": account_age_days,
            "lifecycle_phase": phase,
            "priority_action": priority_action
        }

if __name__ == "__main__":
    engine = ContaEngine()
    r1 = engine.evaluate_restriction_grade(1)
    print("Grau 1:", r1["credit_clearance"], f"(Hard Block: {r1['hard_block']})")
    r5 = engine.evaluate_restriction_grade(5, ["Protesto de R$ 12k"])
    print("Grau 5:", r5["credit_clearance"], f"(Hard Block: {r5['hard_block']})")
    lc = engine.evaluate_account_lifecycle(95)
    print("Lifecycle 95 dias:", lc["lifecycle_phase"])