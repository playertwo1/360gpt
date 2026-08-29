# -*- coding: utf-8 -*-
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.performance_engine import PerformanceEngine

def test_performance_engine_refinements():
    eng = PerformanceEngine()
    
    # 1. Testar avaliação completa
    eval_res = eng.evaluate_full_pobj()
    assert eval_res["achieved_points"] > 0, "Pontos do POBJ devem ser positivos"
    assert len(eval_res["categories"]) == 7, "Devem existir 7 categorias avaliadas"
    assert eval_res["executive_provocation"] is not None, "Provocação executiva deve ser gerada"
    print(f"  [OK] Avaliação Completa do POBJ: {eval_res['achieved_points']} pts (Gap: {eval_res['gap_points']} pts).")

    # 2. Testar Curvas Oficiais (Piso, Meta, Teto)
    pts_piso, pct_piso, st_piso = eng.calculate_score_curve(69.0, 100.0, 10.0)
    assert pts_piso == 0.0 and st_piso == "ABAIXO_DO_PISO"
    
    pts_meta, pct_meta, st_meta = eng.calculate_score_curve(100.0, 100.0, 10.0)
    assert pts_meta == 10.0 and st_meta == "META_ATINGIDA"
    
    pts_teto, pct_teto, st_teto = eng.calculate_score_curve(160.0, 100.0, 10.0)
    assert pts_teto == 15.0 and st_teto == "SUPERADO_TETO"
    print("  [OK] Curvas Oficiais POBJ 2026 (Piso 0 pts, Meta 10 pts, Teto 15 pts) 100% validadas.")

    # 3. Testar Simulação de Negócio
    sim = eng.simulate_deal_impact("CAPTACAO_RECURSOS", 200000.0)
    assert sim["points_gain"] > 0, "Ganho de pontos na simulação deve ser positivo"
    print(f"  [OK] Simulação de Negócio: +R$ 200k em Captação gera +{sim['points_gain']} pts.")

if __name__ == "__main__":
    test_performance_engine_refinements()
    print("ALL_PERF_REFINEMENTS_PASS")