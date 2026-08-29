# -*- coding: utf-8 -*-
import json, os, hashlib, time
from typing import Dict, Any, List, Optional

class RelacionamentoEngine:
    """
    Motor Determinístico de Relacionamento & Compromissos (Marco P2.3)
    Calcula aging de contatos, status de compromissos e alertas de ausência de contato.
    """
    def __init__(self, commitments_path: str = "test-data/relacionamento/compromissos_sample.json"):
        self.commitments_path = commitments_path
        os.makedirs("test-data/relacionamento", exist_ok=True)
        if not os.path.exists(self.commitments_path):
            self._init_default_commitments()

    def _init_default_commitments(self):
        default_data = [
            {
                "commitment_id": "CMP_001",
                "cnpj": "12.345.678/0001-90",
                "company_name": "Metalúrgica Santa Rita Ltda",
                "title": "Apresentar proposta de renovação de Capital de Giro",
                "due_date": "2026-08-30",
                "status": "ABERTO",
                "responsible": "Rafael Pedrosa"
            },
            {
                "commitment_id": "CMP_002",
                "cnpj": "98.765.432/0001-10",
                "company_name": "Agropecuária Vale do Paraíba Ltda",
                "title": "Visita presencial à fazenda sede",
                "due_date": "2026-08-20",
                "status": "VENCIDO",
                "responsible": "Rafael Pedrosa"
            },
            {
                "commitment_id": "CMP_003",
                "cnpj": "45.123.890/0001-55",
                "company_name": "Comércio de Alimentos São Fidélis Eireli",
                "title": "Coletar balanço patrimonial 2025 assinado",
                "due_date": "2026-08-15",
                "status": "CONCLUIDO",
                "responsible": "Rafael Pedrosa"
            }
        ]
        with open(self.commitments_path, "w", encoding="utf-8") as f:
            json.dump(default_data, f, indent=2, ensure_ascii=False)

    @staticmethod
    def classify_contact_aging(days_since_contact: int) -> Dict[str, str]:
        """Classifica a cadência de contato conforme política de relacionamento."""
        if days_since_contact <= 30:
            return {
                "health_status": "CONTATO_EM_DIA",
                "urgency": "NORMAL",
                "recommendation": "Manter acompanhamento de rotina."
            }
        elif days_since_contact <= 60:
            return {
                "health_status": "ATENCAO_PREVENTIVA",
                "urgency": "P2_MEDIA",
                "recommendation": "Agendar contato de relacionamento para atualizar demandas."
            }
        elif days_since_contact <= 90:
            return {
                "health_status": "EM_RESGATE",
                "urgency": "P1_ALTA",
                "recommendation": "Acionar sócio-decisor com oferta de valor para evitar inatividade."
            }
        else:
            return {
                "health_status": "RISCO_EVASAO",
                "urgency": "P0_CRITICA",
                "recommendation": "Visita prioritária obrigatória ou resgate comercial urgente."
            }

    def evaluate_commitments(self, current_date_str: str = "2026-08-28") -> Dict[str, Any]:
        with open(self.commitments_path, "r", encoding="utf-8") as f:
            commitments = json.load(f)

        abertos = []
        vencidos = []
        concluidos = []

        for c in commitments:
            status = c.get("status", "ABERTO")
            due = c.get("due_date", "")
            
            if status == "CONCLUIDO":
                concluidos.append(c)
            elif due < current_date_str:
                c["status"] = "VENCIDO"
                vencidos.append(c)
            else:
                abertos.append(c)

        return {
            "total_commitments": len(commitments),
            "abertos": len(abertos),
            "vencidos": len(vencidos),
            "concluidos": len(concluidos),
            "overdue_list": vencidos,
            "open_list": abertos
        }

if __name__ == "__main__":
    engine = RelacionamentoEngine()
    aging = engine.classify_contact_aging(65)
    print("Aging 65 dias:", aging)
    eval_c = engine.evaluate_commitments()
    print(f"Compromissos: {eval_c['abertos']} abertos, {eval_c['vencidos']} vencidos")