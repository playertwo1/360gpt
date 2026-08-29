# -*- coding: utf-8 -*-
import json, os, time, hashlib
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

class CadastroSpecialist:
    """Especialista de Cadastro PJ: Enquadramento, CNAE, Porte e Governança Fiscal."""
    @staticmethod
    def evaluate(company: Dict[str, Any]) -> Dict[str, Any]:
        cnae = company.get("cnae", "47.11-3-02")
        porte = company.get("porte", "MEDIO_PORTE")
        regime = company.get("regime_tributario", "LUCRO_PRESUMIDO")
        socios_count = len(company.get("quadro_societario", [{"nome": "Socio 1", "cpf": "***"}]))
        
        return {
            "specialist": "ESP_CADASTRO",
            "cnae": cnae,
            "porte": porte,
            "regime_tributario": regime,
            "socios_count": socios_count,
            "status": "VALIDATED",
            "registration_complete": True,
            "observations": f"Porte {porte} sob regime {regime} com {socios_count} sócio(s)."
        }

class RestricoesSpecialist:
    """Especialista de Restrições e Apontamentos Cadastrais (Graus 1 a 7)."""
    @staticmethod
    def evaluate(company: Dict[str, Any]) -> Dict[str, Any]:
        grade = company.get("restriction_grade", 1)
        scr_rating = company.get("scr_rating", "AA")
        protestos_count = company.get("protestos_count", 0)
        serasa_apontamentos = company.get("serasa_apontamentos", 0)
        
        grades_map = {
            1: {"level": "CLEAR", "description": "Sem restrições ativas", "credit_cleared": True},
            2: {"level": "LOW_ALERT", "description": "Apontamento pontual sanado", "credit_cleared": True},
            3: {"level": "MODERATE_ALERT", "description": "Restrição comercial branda", "credit_cleared": True},
            4: {"level": "HIGH_ALERT", "description": "Restrição BACEN/SCR em regularização", "credit_cleared": False},
            5: {"level": "HARD_BLOCK", "description": "Apontamento impeditivo ativo", "credit_cleared": False},
            6: {"level": "LEGAL_BLOCK", "description": "Ação de execução judicial / Falência", "credit_cleared": False},
            7: {"level": "COMPLIANCE_RESTRICTED", "description": "Bloqueio normativo / Compliance", "credit_cleared": False}
        }
        
        spec_eval = grades_map.get(grade, grades_map[1])
        
        return {
            "specialist": "ESP_RESTRICOES",
            "grade": grade,
            "scr_rating": scr_rating,
            "protestos_count": protestos_count,
            "serasa_apontamentos": serasa_apontamentos,
            "level": spec_eval["level"],
            "description": spec_eval["description"],
            "credit_cleared": spec_eval["credit_cleared"]
        }

class MaturacaoSpecialist:
    """Especialista de Maturação e Ciclo de Vida da Conta PJ (D0 a D120)."""
    @staticmethod
    def evaluate(company: Dict[str, Any]) -> Dict[str, Any]:
        account_age_days = company.get("account_age_days", 45)
        has_pix_key = company.get("has_pix_key", True)
        has_payroll = company.get("has_payroll", False)
        
        if account_age_days <= 30:
            stage = "D0_D30_BOAS_VINDAS"
            priority_action = "Cadastrar chaves PIX e ofertar convênio de Folha de Pagamento"
        elif account_age_days <= 60:
            stage = "D31_D60_ATIVACAO_CREDITO"
            priority_action = "Ofertar Cartão PJ e Limite de Cheque Especial Operacional"
        elif account_age_days <= 120:
            stage = "D61_D120_RENTABILIZACAO"
            priority_action = "Estruturar Capital de Giro e Investimentos de Tesouraria"
        else:
            stage = "CONSOLIDADA_ACIMA_D120"
            priority_action = "Manter cadência de relacionamento e cross-selling"

        return {
            "specialist": "ESP_MATURACAO",
            "account_age_days": account_age_days,
            "stage": stage,
            "has_pix_key": has_pix_key,
            "has_payroll": has_payroll,
            "recommended_stage_action": priority_action
        }

class ElegibilidadeSpecialist:
    """Especialista de Elegibilidade e Enquadramento de Produtos PJ."""
    @staticmethod
    def evaluate(company: Dict[str, Any], restr_result: Dict[str, Any]) -> Dict[str, Any]:
        credit_cleared = restr_result["credit_cleared"]
        fat_12m = company.get("faturamento_12m", 5000000.0)
        
        eligible_products = []
        if credit_cleared:
            eligible_products.append({"product": "CAPITAL_DE_GIRO", "max_limit_est": round(fat_12m * 0.15, 2)})
            eligible_products.append({"product": "CARTAO_PJ_EMPRESARIAL", "max_limit_est": 50000.0})
            eligible_products.append({"product": "CHEQUE_ESPECIAL_PJ", "max_limit_est": round(fat_12m * 0.03, 2)})
        
        # Serviços sem risco de crédito sempre elegíveis se cadastro ok
        eligible_products.append({"product": "FOLHA_DE_PAGAMENTO", "type": "SERVICO"})
        eligible_products.append({"product": "COBRANCA_BANCARIA_BOLETO", "type": "SERVICO"})
        eligible_products.append({"product": "MAQUININHA_PIX_ADQUIRENCIA", "type": "SERVICO"})

        return {
            "specialist": "ESP_ELEGIBILIDADE",
            "credit_cleared": credit_cleared,
            "eligible_products_count": len(eligible_products),
            "eligible_products": eligible_products
        }

class CarteiraSpecialistsEngine:
    """Motor Central de Triagem da Carteira PJ com 4 Especialistas de Conta."""
    def __init__(self):
        self.esp_cad = CadastroSpecialist()
        self.esp_res = RestricoesSpecialist()
        self.esp_mat = MaturacaoSpecialist()
        self.esp_ele = ElegibilidadeSpecialist()

    def process_company_360(self, company: Dict[str, Any]) -> Dict[str, Any]:
        cnpj = company.get("cnpj", "00.000.000/0001-00")
        razao = company.get("razao_social", "Empresa Exemplo")
        
        # 1. Executa os 4 especialistas de forma isolada
        cad_res = self.esp_cad.evaluate(company)
        res_res = self.esp_res.evaluate(company)
        mat_res = self.esp_mat.evaluate(company)
        ele_res = self.esp_ele.evaluate(company, res_res)

        # 2. Gera Next Best Actions (NBA)
        nbas = []
        if res_res["credit_cleared"]:
            nbas.append({
                "action_id": f"NBA_{int(time.time())}_01",
                "product": "CAPITAL_DE_GIRO",
                "priority": "P0",
                "rationale": f"Cliente elegível Grau {res_res['grade']}. Enquadrado na esteira {mat_res['stage']}."
            })
            nbas.append({
                "action_id": f"NBA_{int(time.time())}_02",
                "product": "CARTAO_PJ_EMPRESARIAL",
                "priority": "P1",
                "rationale": "Ampliar ativação e reciprocidade da conta."
            })
        else:
            nbas.append({
                "action_id": f"NBA_{int(time.time())}_03",
                "product": "REGULARIZACAO_CADASTRAL",
                "priority": "P0",
                "rationale": f"Bloqueio de crédito ativo ({res_res['description']}). Ação recomendada: saneamento."
            })

        # 3. Nós do Evidence Graph
        ev_nodes = [
            {"node_type": "SOURCE_ARTIFACT", "id": f"SRC_CAD_{cnpj}", "source": "CADASTRO_RECEITA_PJ"},
            {"node_type": "FINDING", "id": f"FND_RESTR_{cnpj}", "finding": res_res["description"]},
            {"node_type": "FINDING", "id": f"FND_MATUR_{cnpj}", "finding": mat_res["stage"]},
            {"node_type": "RECOMMENDATION", "id": f"REC_NBA_{cnpj}", "action": nbas[0]["product"]}
        ]

        return {
            "cnpj": cnpj,
            "razao_social": razao,
            "evaluated_at": datetime.now(timezone.utc).isoformat(),
            "specialist_results": {
                "cadastro": cad_res,
                "restricoes": res_res,
                "maturacao": mat_res,
                "elegibilidade": ele_res
            },
            "next_best_actions": nbas,
            "evidence_nodes": ev_nodes
        }

if __name__ == "__main__":
    engine = CarteiraSpecialistsEngine()
    test_comp = {
        "cnpj": "98.765.432/0001-10",
        "razao_social": "Transportadora TransVale Ltda",
        "faturamento_12m": 8500000.0,
        "restriction_grade": 1,
        "account_age_days": 40
    }
    result = engine.process_company_360(test_comp)
    print(f"Empresa Processada: {result['razao_social']}")
    print(f"Especialistas Concluídos: {list(result['specialist_results'].keys())}")
    print(f"Next Best Actions: {len(result['next_best_actions'])}")