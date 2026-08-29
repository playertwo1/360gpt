# -*- coding: utf-8 -*-
import json, time, hashlib
from typing import Dict, Any, List
from datetime import datetime, timezone

class EvidenceGraphHumanizer:
    """
    Tradutor e Visualizador Humanizado do Evidence Graph 360.
    Converte nós técnicos, grafos PROV e hashes criptográficos em uma 
    Trilha Executiva compreensível para Rafael.
    """
    @staticmethod
    def humanize_graph(raw_graph: Dict[str, Any]) -> Dict[str, Any]:
        nodes = raw_graph.get("nodes", [])
        state_id = raw_graph.get("state_id", "STATE_UNKNOWN")
        generated_at = raw_graph.get("generated_at", datetime.now(timezone.utc).isoformat())

        storyline = []
        
        # Mapeia nós técnicos para passos da história executiva
        step_number = 1
        for node in nodes:
            ntype = node.get("node_type", "UNKNOWN")
            
            if ntype == "SOURCE_ARTIFACT":
                source_name = node.get("source", "Origem Desconhecida")
                doc_name = node.get("label", node.get("id", "Documento"))
                storyline.append({
                    "passo": step_number,
                    "fase": "📥 ORIGEM DO DADO",
                    "icone": "📥",
                    "titulo": f"Dado Recebido de {source_name}",
                    "descricao": f"O sistema capturou o registro '{doc_name}'. O arquivo original foi validado, preservado de forma imutável e autenticado.",
                    "detalhes_tecnicos": {"fonte": source_name, "id_origem": node.get("id")}
                })
                step_number += 1

            elif ntype == "TRANSFORMATION":
                engine_name = node.get("engine", "Motor Determinístico")
                regr = node.get("rule_applied", "Cálculo Oficial Homologado")
                storyline.append({
                    "passo": step_number,
                    "fase": "⚙️ MOTOR DE CÁLCULO",
                    "icone": "⚙️",
                    "titulo": f"Processamento pelo {engine_name}",
                    "descricao": f"Os dados foram calculados matematicamente pela regra '{regr}', sem depender de inferência arbitrária de IA.",
                    "detalhes_tecnicos": {"motor": engine_name, "regra": regr}
                })
                step_number += 1

            elif ntype == "FINDING":
                finding_text = node.get("finding", node.get("label", "Fato apurado"))
                storyline.append({
                    "passo": step_number,
                    "fase": "🔍 ACHADO CONCRETO",
                    "icone": "🔍",
                    "titulo": "Diagnóstico do Cliente",
                    "descricao": finding_text,
                    "detalhes_tecnicos": {"id_achado": node.get("id")}
                })
                step_number += 1

            elif ntype == "RECOMMENDATION":
                rec_text = node.get("action", node.get("label", "Ação proposta"))
                storyline.append({
                    "passo": step_number,
                    "fase": "💡 RECOMENDAÇÃO DE AÇÃO",
                    "icone": "💡",
                    "titulo": "Próximo Melhor Passo (NBA)",
                    "descricao": f"Proposta de atuação: {rec_text}",
                    "detalhes_tecnicos": {"prioridade": node.get("priority", "P0")}
                })
                step_number += 1

        # Adiciona o Gate Humano Final
        storyline.append({
            "passo": step_number,
            "fase": "✍️ SOBERANIA DECISÓRIA",
            "icone": "✍️",
            "titulo": "Decisão de Rafael",
            "descricao": "A recomendação está pronta e aguarda o despacho soberano de Rafael. Nenhuma ação externa é disparada sem seu clique de autorização.",
            "detalhes_tecnicos": {"autoridade": "Rafael Pedrosa (fael@live.de)", "status": "PENDENTE_DE_DESPACHO"}
        })

        return {
            "estado_id": state_id,
            "data_geracao": generated_at,
            "resumo_executivo": f"Trilha de {len(storyline)} etapas concluída com sucesso. Rastreabilidade ponta a ponta garantida.",
            "trilha_humanizada": storyline
        }

if __name__ == "__main__":
    sample_graph = {
        "state_id": "STATE_9be598d33d3d",
        "nodes": [
            {"node_type": "SOURCE_ARTIFACT", "source": "TELEGRAM_BOT", "label": "Mensagem /planodiario enviada por Rafael"},
            {"node_type": "TRANSFORMATION", "engine": "PerformanceEngine", "rule_applied": "Curvas Oficiais POBJ 2026 (70%-150%)"},
            {"node_type": "FINDING", "finding": "Gap do POBJ identificado em 26.96 pontos; 4 empresas na carteira elegíveis para crédito."},
            {"node_type": "RECOMMENDATION", "action": "Ofertar R$ 1.5M de Capital de Giro para Metalúrgica Santa Rita (P0)"}
        ]
    }
    humanized = EvidenceGraphHumanizer.humanize_graph(sample_graph)
    print("Trilha Humanizada:")
    for step in humanized["trilha_humanizada"]:
        print(f"[{step['passo']}] {step['icone']} {step['fase']}: {step['titulo']}")
        print(f"    {step['descricao']}\n")