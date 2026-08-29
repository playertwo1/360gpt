# -*- coding: utf-8 -*-
import os, sys, json, time, hashlib
from typing import Dict, Any, List, Optional

class CarteiraPJEngine:
    def __init__(self, data_path: str = "test-data/carteira/carteira_pj_sample.json"):
        self.data_path = data_path
        self.companies = self.load_companies()

    def load_companies(self) -> List[Dict[str, Any]]:
        if os.path.exists(self.data_path):
            with open(self.data_path, "r", encoding="utf-8") as f:
                return json.load(f)
        else:
            default_sample = [
                {
                    "cnpj": "12.345.678/0001-90",
                    "razao_social": "Metalúrgica Santa Rita Ltda",
                    "nome_fantasia": "Santa Rita Metais",
                    "segmento": "Indústria",
                    "faturamento_12m": 14850000.0,
                    "rating": "B1",
                    "grau_restricao": 1,
                    "restricoes": [],
                    "limite_giro_pre_aprovado": 850000.0,
                    "limite_cartao_pre_aprovado": 120000.0,
                    "possui_folha": False,
                    "qtd_funcionarios": 48,
                    "possui_cobranca": True,
                    "dias_sem_contato": 18,
                    "contato_decisor": "Roberto Silva (Diretor Financeiro)",
                    "telefone": "(22) 99881-2233",
                    "fase_conta": "MADURA"
                },
                {
                    "cnpj": "98.765.432/0001-10",
                    "razao_social": "Agropecuária Vale do Paraíba Ltda",
                    "nome_fantasia": "Agro Vale",
                    "segmento": "Agronegócio",
                    "faturamento_12m": 22400000.0,
                    "rating": "A2",
                    "grau_restricao": 1,
                    "restricoes": [],
                    "limite_giro_pre_aprovado": 1500000.0,
                    "limite_cartao_pre_aprovado": 250000.0,
                    "possui_folha": True,
                    "qtd_funcionarios": 110,
                    "possui_cobranca": False,
                    "dias_sem_contato": 42,
                    "contato_decisor": "Carlos Eduardo (Sócio-Administrador)",
                    "telefone": "(22) 99772-4411",
                    "fase_conta": "MADURA"
                },
                {
                    "cnpj": "45.123.890/0001-55",
                    "razao_social": "Comércio de Alimentos São Fidélis Eireli",
                    "nome_fantasia": "Supermercado Central",
                    "segmento": "Varejo",
                    "faturamento_12m": 8900000.0,
                    "rating": "B3",
                    "grau_restricao": 2,
                    "restricoes": ["Apontamento informativo quitado em 05/2026"],
                    "limite_giro_pre_aprovado": 350000.0,
                    "limite_cartao_pre_aprovado": 80000.0,
                    "possui_folha": False,
                    "qtd_funcionarios": 32,
                    "possui_cobranca": False,
                    "dias_sem_contato": 65,
                    "contato_decisor": "Mariana Souza (Gerente Geral)",
                    "telefone": "(22) 99123-5566",
                    "fase_conta": "EM_RESGATE"
                },
                {
                    "cnpj": "77.889.900/0001-22",
                    "razao_social": "Construtora e Engenharia Norte Fluminense S.A.",
                    "nome_fantasia": "Norte Construtora",
                    "segmento": "Construção Civil",
                    "faturamento_12m": 31200000.0,
                    "rating": "C1",
                    "grau_restricao": 5,
                    "restricoes": ["Protesto ativo em cartório R$ 12.400,00"],
                    "limite_giro_pre_aprovado": 0.0,
                    "limite_cartao_pre_aprovado": 0.0,
                    "possui_folha": True,
                    "qtd_funcionarios": 85,
                    "possui_cobranca": True,
                    "dias_sem_contato": 10,
                    "contato_decisor": "Fernando Torres (CFO)",
                    "telefone": "(22) 99344-7788",
                    "fase_conta": "EM_RECUPERACAO"
                },
                {
                    "cnpj": "33.445.566/0001-77",
                    "razao_social": "Distribuidora de Bebidas Paraíso Ltda",
                    "nome_fantasia": "Bebidas Paraíso",
                    "segmento": "Distribuição / Logística",
                    "faturamento_12m": 16500000.0,
                    "rating": "A3",
                    "grau_restricao": 1,
                    "restricoes": [],
                    "limite_giro_pre_aprovado": 600000.0,
                    "limite_cartao_pre_aprovado": 150000.0,
                    "possui_folha": False,
                    "qtd_funcionarios": 40,
                    "possui_cobranca": True,
                    "dias_sem_contato": 25,
                    "contato_decisor": "Juliana Martins (Sócia)",
                    "telefone": "(22) 98833-1122",
                    "fase_conta": "MADURA"
                }
            ]
            os.makedirs(os.path.dirname(self.data_path), exist_ok=True)
            with open(self.data_path, "w", encoding="utf-8") as f:
                json.dump(default_sample, f, indent=2, ensure_ascii=False)
            return default_sample

    def get_eligible_companies_for_product(self, product_type: str) -> List[Dict[str, Any]]:
        """
        Filtra clientes com elegibilidade determinística por produto:
        - Sem restrição impeditiva (Grau <= 3);
        - Com potencial/necessidade clara.
        """
        eligible = []
        for c in self.companies:
            if c.get("grau_restricao", 1) > 3:
                continue  # Bloqueio de risco cadastral (GG Conta)

            if product_type == "CREDITO_GIRO" and c.get("limite_giro_pre_aprovado", 0) > 0:
                eligible.append({
                    "company": c,
                    "opportunity": "CAPITAL_DE_GIRO",
                    "value_available": c["limite_giro_pre_aprovado"],
                    "pitch": f"Limite pré-aprovado de R$ {c['limite_giro_pre_aprovado']:,.2f} com liberação imediata em conta."
                })
            elif product_type == "FOLHA_PAGAMENTO" and not c.get("possui_folha", False) and c.get("qtd_funcionarios", 0) >= 10:
                eligible.append({
                    "company": c,
                    "opportunity": "FOLHA_DE_PAGAMENTO",
                    "value_available": c["qtd_funcionarios"],
                    "pitch": f"Captação de folha com {c['qtd_funcionarios']} funcionários e isenção de tarifas para os colaboradores."
                })
            elif product_type == "COBRANCA_BANCARIA" and not c.get("possui_cobranca", False):
                eligible.append({
                    "company": c,
                    "opportunity": "COBRANCA_BANCARIA",
                    "value_available": c["faturamento_12m"] / 12,
                    "pitch": "Implantação de esteira de cobrança registrada com conciliação automática e taxas reduzidas."
                })
            elif product_type == "CARTAO_CREDITO_PJ" and c.get("limite_cartao_pre_aprovado", 0) > 0:
                eligible.append({
                    "company": c,
                    "opportunity": "CARTAO_CREDITO_PJ",
                    "value_available": c["limite_cartao_pre_aprovado"],
                    "pitch": f"Cartão Corporativo com limite pré-aprovado de R$ {c['limite_cartao_pre_aprovado']:,.2f} e pontuação Livelo."
                })

        return eligible

if __name__ == "__main__":
    engine = CarteiraPJEngine()
    print(f"Total de empresas na carteira PJ: {len(engine.companies)}")
    giro_leads = engine.get_eligible_companies_for_product("CREDITO_GIRO")
    print(f"Empresas elegíveis para Capital de Giro: {len(giro_leads)}")