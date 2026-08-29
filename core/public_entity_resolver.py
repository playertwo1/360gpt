# -*- coding: utf-8 -*-
import json, os, time, hashlib
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

class PublicEntityResolver:
    """
    Motor do Radar Comercial & Entity Resolution (Marco C3 / Fase 3).
    Resolve identidades empresariais públicas, grupos econômicos e matriz/filiais.
    """
    def __init__(self):
        self.cache = {}
        # Base de conhecimento de empresas conhecidas para resolução de grupo
        self.known_companies = [
            {
                "cnpj": "12.345.678/0001-90",
                "razao_social": "Metalúrgica Santa Rita Matriz Ltda",
                "situacao_cadastral": "ATIVA",
                "cnae": "25.11-0-00",
                "capital_social": 5000000.0,
                "qsa": [
                    {"nome": "CARLOS EDUARDO SILVA", "cpf_mascarado": "***.123.456-**", "qualificacao": "SÓCIO-ADMINISTRADOR"},
                    {"nome": "MARIA HELENA SILVA", "cpf_mascarado": "***.789.012-**", "qualificacao": "SÓCIA"}
                ]
            },
            {
                "cnpj": "12.345.678/0002-71",
                "razao_social": "Metalúrgica Santa Rita Filial RJ",
                "situacao_cadastral": "ATIVA",
                "cnae": "25.11-0-00",
                "capital_social": 5000000.0,
                "qsa": [
                    {"nome": "CARLOS EDUARDO SILVA", "cpf_mascarado": "***.123.456-**", "qualificacao": "SÓCIO-ADMINISTRADOR"}
                ]
            },
            {
                "cnpj": "88.999.000/0001-15",
                "razao_social": "Santa Rita Logística e Transportes Ltda",
                "situacao_cadastral": "ATIVA",
                "cnae": "49.30-2-02",
                "capital_social": 1200000.0,
                "qsa": [
                    {"nome": "CARLOS EDUARDO SILVA", "cpf_mascarado": "***.123.456-**", "qualificacao": "SÓCIO-ADMINISTRADOR"}
                ]
            }
        ]

    def resolve_entity(self, cnpj: str) -> Dict[str, Any]:
        """Resolve uma empresa e identifica seu grupo econômico e filiais."""
        clean_cnpj = cnpj.strip()
        
        # 1. Checa cache
        if clean_cnpj in self.cache:
            res = self.cache[clean_cnpj].copy()
            res["from_cache"] = True
            return res

        # 2. Localiza a empresa principal
        target = next((c for c in self.known_companies if c["cnpj"] == clean_cnpj), None)
        if not target:
            # Fallback sintético determinístico
            is_matriz = "/0001-" in clean_cnpj
            target = {
                "cnpj": clean_cnpj,
                "razao_social": f"Empresa Sintética ({clean_cnpj})",
                "situacao_cadastral": "ATIVA",
                "cnae": "47.11-3-02",
                "capital_social": 1000000.0,
                "qsa": [{"nome": "SÓCIO PADRÃO", "cpf_mascarado": "***.000.000-**", "qualificacao": "SÓCIO-ADMINISTRADOR"}]
            }

        target_partners = {p["nome"] for p in target.get("qsa", [])}
        root_cnpj = clean_cnpj.split("/")[0]

        group_companies = []
        shared_partners = []

        # 3. Detecta Filiais e Empresas do Grupo por Sócios em Comum
        for comp in self.known_companies:
            if comp["cnpj"] == clean_cnpj:
                continue
                
            comp_root = comp["cnpj"].split("/")[0]
            comp_partners = {p["nome"] for p in comp.get("qsa", [])}
            common = target_partners.intersection(comp_partners)
            
            if comp_root == root_cnpj:
                # É Filial ou Matriz
                rel_type = "FILIAL" if "/0001-" not in comp["cnpj"] else "MATRIZ"
                group_companies.append({
                    "cnpj": comp["cnpj"],
                    "razao_social": comp["razao_social"],
                    "relationship_type": rel_type
                })
            elif len(common) > 0:
                # É Coligada por sócio em comum (Grupo Econômico de Fato)
                group_companies.append({
                    "cnpj": comp["cnpj"],
                    "razao_social": comp["razao_social"],
                    "relationship_type": "COLIGADA_SOCIOS_COMUNS"
                })
                for partner_name in common:
                    if not any(sp["nome"] == partner_name for sp in shared_partners):
                        shared_partners.append({
                            "nome": partner_name,
                            "qualificacao": "SÓCIO EM COMUM NO GRUPO"
                        })

        economic_group_identified = len(group_companies) > 0

        # 4. Cria nós do Evidence Graph
        ev_nodes = [
            {"node_type": "SOURCE_ARTIFACT", "id": f"SRC_RFB_{clean_cnpj}", "source": "RECEITA_FEDERAL_CNPJ"},
            {"node_type": "FINDING", "id": f"FND_SIT_{clean_cnpj}", "finding": f"Situação: {target['situacao_cadastral']}"},
            {"node_type": "FINDING", "id": f"FND_GRP_{clean_cnpj}", "finding": f"Grupo Econômico com {len(group_companies)} empresa(s) vinculada(s)"},
            {"node_type": "RECOMMENDATION", "id": f"REC_LIMIT_GRP_{clean_cnpj}", "action": "Avaliar limite de crédito consolidado para o grupo econômico."}
        ]

        result = {
            "primary_cnpj": clean_cnpj,
            "razao_social": target["razao_social"],
            "situacao_cadastral": target["situacao_cadastral"],
            "economic_group_identified": economic_group_identified,
            "group_companies": group_companies,
            "shared_partners": shared_partners,
            "evidence_nodes": ev_nodes,
            "resolved_at": datetime.now(timezone.utc).isoformat()
        }

        self.cache[clean_cnpj] = result
        return result

if __name__ == "__main__":
    resolver = PublicEntityResolver()
    res = resolver.resolve_entity("12.345.678/0001-90")
    print(f"Empresa: {res['razao_social']}")
    print(f"Grupo Econômico Identificado: {res['economic_group_identified']}")
    print(f"Empresas Vinculadas: {len(res['group_companies'])}")
    for gc in res['group_companies']:
        print(f"  - [{gc['relationship_type']}] {gc['razao_social']} ({gc['cnpj']})")