# -*- coding: utf-8 -*-
"""
Diretor 360 - Motor do Gerente Geral de Conhecimento ("O Bibliotecário")
Custódia, indexação, auditoria com SHA-256 e detecção bitemporal de conflitos normativos.
"""

import os
import json
import hashlib
from datetime import datetime
from typing import Dict, Any, List, Optional

class KnowledgeEngine:
    DEFAULT_STORE_PATH = "test-data/knowledge/knowledge_store.json"
    
    def __init__(self, store_path: Optional[str] = None):
        self.store_path = store_path or self.DEFAULT_STORE_PATH
        self.documents = []
        self.load_store()
        
    def _compute_hash(self, text: str) -> str:
        return hashlib.sha256(text.encode("utf-8")).hexdigest()
        
    def load_store(self):
        if os.path.exists(self.store_path):
            try:
                with open(self.store_path, "r", encoding="utf-8") as f:
                    self.documents = json.load(f)
            except Exception as e:
                print(f"[AVISO] Erro ao carregar store de conhecimento: {e}")
                self.documents = []
        else:
            self._initialize_default_knowledge()

    def _initialize_default_knowledge(self):
        """Inicializa a base de conhecimento institucional canônica do banco."""
        default_docs = [
            {
                "doc_id": "IN_CRED_2026_01",
                "title": "Instrução Normativa de Crédito PJ - Alçadas e Limites",
                "version": "1.0",
                "category": "NORMATIVO",
                "valid_from": "2026-01-01",
                "valid_to": None,
                "is_active": True,
                "supersedes": None,
                "content": "Art. 4º: O limite de alçada local da agência para Capital de Giro sem garantia real é de até R$ 500.000,00 para empresas com faturamento anual superior a R$ 2.400.000,00 e Rating mínimo B. Operações acima de R$ 500.000,00 exigem parecer do Comitê Regional de Crédito.",
                "page_or_section": "Artigo 4º, § 2º, Página 3",
                "keywords": ["alcada", "capital de giro", "limite", "garantia real", "comite", "rating"]
            },
            {
                "doc_id": "TAB_METAS_2026_Q3",
                "title": "Tabela de Pontuação de Produtos PJ - Q3 2026",
                "version": "3.0",
                "category": "METAS_PONTUACAO",
                "valid_from": "2026-07-01",
                "valid_to": "2026-09-30",
                "is_active": True,
                "supersedes": "TAB_METAS_2026_Q2",
                "content": "Regra 1: Antecipação de Recebíveis (Cartões/Duplicatas) pontua 150 pontos a cada R$ 10.000,00 contratados. Capital de Giro pontua 100 pontos a cada R$ 10.000,00. Seguro Empresarial pontua 300 pontos fixos por apólice emitida com prêmio anual > R$ 1.200,00.",
                "page_or_section": "Tabela 2.1 - Pesos e Fatores de Produção, Página 5",
                "keywords": ["metas", "pontuacao", "pontos", "antecipacao", "recebiveis", "seguro", "giro"]
            },
            {
                "doc_id": "SOP_CARTAO_EMP_2026",
                "title": "Procedimento Operacional - Limite e Emissão de Cartão Empresarial",
                "version": "2.1",
                "category": "PROCESSO_SOP",
                "valid_from": "2026-02-15",
                "valid_to": None,
                "is_active": True,
                "supersedes": None,
                "content": "Passo 1: Acessar o sistema SIS_CORP > Menu Crédito > Cartões PJ. Passo 2: Anexar o Balanço DRE dos últimos 12 meses assinado pelo contador. Passo 3: Emitir e colher assinatura no Termo de Adesão e Limite F-4089.",
                "page_or_section": "Seção 4 - Fluxo Operacional Sistêmico, Página 2",
                "keywords": ["cartao", "limite", "processo", "passo a passo", "formulario", "f-4089"]
            },
            {
                "doc_id": "CAT_FORMULARIOS_2026",
                "title": "Catálogo Geral de Formulários Oficiais do Banco",
                "version": "1.4",
                "category": "FORMULARIO",
                "valid_from": "2026-01-10",
                "valid_to": None,
                "is_active": True,
                "supersedes": None,
                "content": "Formulário F-1020: Abertura de Conta Corrente PJ e Cadastro de Sócios. Formulário F-4089: Termo de Adesão e Proposta de Cartão Corporativo. Formulário F-7721: Cédula de Crédito Bancário (CCB) para Capital de Giro. Formulário F-9012: Termo de Garantia e Fiança Bancária.",
                "page_or_section": "Índice de Formulários PJ, Páginas 1-4",
                "keywords": ["formulario", "f-1020", "f-4089", "f-7721", "f-9012", "ccb", "termo"]
            },
            {
                "doc_id": "CAT_RAMAIS_MESAS_2026",
                "title": "Guia Oficial de Ramais, Mesas e Suporte Interno",
                "version": "2026.08",
                "category": "CONTATO_RAMAL",
                "valid_from": "2026-08-01",
                "valid_to": None,
                "is_active": True,
                "supersedes": None,
                "content": "Mesa de Câmbio e Comex: Telefone (11) 3388-4100 / Ramal 4102 / E-mail: cambio.pj@banco.local / Horário: 09h às 17h. Suporte a Sistemas de Crédito: Telefone 0800-770-3600 / Ramal 8820 / E-mail: suporte.credito@banco.local. Mesa de Derivativos e Hedge: Ramal 4150.",
                "page_or_section": "Tabela de Contatos Corporativos, Página 1",
                "keywords": ["telefone", "ramal", "contato", "cambio", "suporte", "derivativos", "email"]
            }
        ]
        
        # Calcular hashes
        for doc in default_docs:
            doc["sha256_hash"] = self._compute_hash(doc["content"])
            
        self.documents = default_docs
        self.save_store()

    def save_store(self):
        os.makedirs(os.path.dirname(self.store_path), exist_ok=True)
        with open(self.store_path, "w", encoding="utf-8") as f:
            json.dump(self.documents, f, indent=2, ensure_ascii=False)

    def ingest_document(self, doc_data: Dict[str, Any]) -> Dict[str, Any]:
        """Ingere um novo documento ou norma e verifica potenciais conflitos com a base existente."""
        content = doc_data.get("content", "").strip()
        if not content:
            raise ValueError("Documento sem conteúdo não pode ser ingerido.")
            
        doc_id = doc_data.get("doc_id", f"DOC_{int(datetime.now().timestamp())}")
        doc_data["sha256_hash"] = self._compute_hash(content)
        doc_data["recorded_at"] = datetime.now().isoformat()
        
        # Detector de conflitos normativos
        conflicts = []
        supersedes_id = doc_data.get("supersedes")
        
        for existing in self.documents:
            if not existing.get("is_active"):
                continue
                
            # Verifica se trata da mesma categoria e possui sobreposição de palavras-chave
            same_category = existing.get("category") == doc_data.get("category")
            keywords_overlap = set(existing.get("keywords", [])).intersection(set(doc_data.get("keywords", [])))
            
            if same_category and len(keywords_overlap) >= 2:
                if supersedes_id == existing.get("doc_id"):
                    # Revogação explícita
                    existing["is_active"] = False
                    existing["superseded_by"] = doc_id
                    existing["superseded_at"] = datetime.now().isoformat()
                else:
                    # Conflito potencial sem revogação expressa
                    conflict_record = {
                        "conflict_id": f"CONF_{int(datetime.now().timestamp())}",
                        "conflict_type": "DIVERGENCIA_NORMATIVA",
                        "doc_a": existing.get("doc_id"),
                        "doc_b": doc_id,
                        "reason": f"Sobreposição de regras na categoria {doc_data.get('category')} sem declaração de revogação explícita (supersedes).",
                        "decision_required_from": "rafael"
                    }
                    conflicts.append(conflict_record)
                    
        self.documents.append(doc_data)
        self.save_store()
        
        return {
            "doc_id": doc_id,
            "status": "MANUAL_REVIEW_REQUIRED" if conflicts else "INGESTED_ACTIVE",
            "conflicts": conflicts
        }

    def query_knowledge(self, query_type: str, search_text: str) -> Dict[str, Any]:
        """Consulta estrita sem alucinações. Se não houver evidência, retorna EVIDENCE_NOT_FOUND."""
        search_terms = [t.lower() for t in search_text.replace("?", "").replace(",", "").split() if len(t) > 2]
        
        matched_docs = []
        for doc in self.documents:
            if not doc.get("is_active", True):
                continue
            if query_type != "TODOS" and doc.get("category") != query_type:
                continue
                
            content_lower = doc["content"].lower()
            keywords_lower = [k.lower() for k in doc.get("keywords", [])]
            
            score = 0
            for term in search_terms:
                if term in content_lower:
                    score += 2
                if any(term in kw for kw in keywords_lower):
                    score += 3
                    
            if score >= 3:
                matched_docs.append((score, doc))
                
        matched_docs.sort(key=lambda x: x[0], reverse=True)
        
        if not matched_docs:
            return {
                "domain": "conhecimento",
                "status": "EVIDENCE_NOT_FOUND",
                "query_context": {
                    "query_type": query_type,
                    "subject": search_text
                },
                "findings": [],
                "source_citations": [],
                "conflicts_detected": [],
                "generated_at": datetime.now().isoformat(),
                "audit_message": "Informação não localizada na base oficial de conhecimento. Nenhuma regra ou norma foi inventada."
            }
            
        top_doc = matched_docs[0][1]
        
        findings = [{
            "finding_id": f"FIND_{top_doc['doc_id']}",
            "category": top_doc["category"],
            "statement": top_doc["content"],
            "valid_from": top_doc.get("valid_from", "2026-01-01"),
            "valid_to": top_doc.get("valid_to"),
            "is_active": True
        }]
        
        citations = [{
            "source_document_id": top_doc["doc_id"],
            "title": top_doc["title"],
            "version": top_doc["version"],
            "page_or_section": top_doc["page_or_section"],
            "sha256_hash": top_doc["sha256_hash"],
            "excerpt": top_doc["content"][:200] + "..." if len(top_doc["content"]) > 200 else top_doc["content"]
        }]
        
        return {
            "domain": "conhecimento",
            "status": "READY",
            "query_context": {
                "query_type": query_type,
                "subject": search_text
            },
            "findings": findings,
            "source_citations": citations,
            "conflicts_detected": [],
            "generated_at": datetime.now().isoformat()
        }

if __name__ == "__main__":
    engine = KnowledgeEngine()
    print("Base de Conhecimento inicializada com", len(engine.documents), "documentos.")
    
    # Teste de consulta
    q = engine.query_knowledge("NORMATIVO", "qual o limite de alçada para capital de giro sem garantia?")
    print("\nResultado da Consulta Normativa:")
    print(json.dumps(q, indent=2, ensure_ascii=False))