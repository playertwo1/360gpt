# -*- coding: utf-8 -*-
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import json
from core.evidence_graph_humanizer import EvidenceGraphHumanizer
from core.document_intake_receipt import DocumentIntakeReceiptSystem

def test_humanizer():
    raw = {
        'state_id': 'STATE_TEST_HUMAN',
        'nodes': [
            {'node_type': 'SOURCE_ARTIFACT', 'source': 'TELEGRAM', 'label': 'Mensagem /hoje'},
            {'node_type': 'TRANSFORMATION', 'engine': 'PerformanceEngine', 'rule_applied': 'POBJ 2026'},
            {'node_type': 'FINDING', 'finding': 'Meta de POBJ com gap de 26.96 pts.'},
            {'node_type': 'RECOMMENDATION', 'action': 'Ativar 4 clientes PJ elegíveis (P0)'}
        ]
    }
    res = EvidenceGraphHumanizer.humanize_graph(raw)
    assert len(res['trilha_humanizada']) == 5, f"Esperado 5 etapas, obtido {len(res['trilha_humanizada'])}"
    assert "ORIGEM DO DADO" in res['trilha_humanizada'][0]['fase']
    assert "SOBERANIA DECISÓRIA" in res['trilha_humanizada'][4]['fase']
    print(f"  [OK] Trilha humanizada gerada com {len(res['trilha_humanizada'])} etapas claras.")

def test_receipt():
    rec = DocumentIntakeReceiptSystem.issue_receipt(
        channel='TELEGRAM',
        sender_id='5281600644',
        content_type='PLANILHA_EXCEL',
        raw_content='pobj_agencia_6895.xlsx',
        summary='Planilha de POBJ da Agência 6895'
    )
    assert rec['remetente'] == 'Rafael Pedrosa', f"Remetente incorreto: {rec['remetente']}"
    assert "CONFIRMADO" in rec['status_na_esteira']['etapa_1_recebimento']
    assert "DISPONÍVEL" in rec['status_na_esteira']['etapa_4_disponibilidade_painel']
    print(f"  [OK] Recibo emitido: {rec['protocolo']} para {rec['remetente']}.")

if __name__ == "__main__":
    test_humanizer()
    test_receipt()
    print("ALL_UNIT_TESTS_PASS")