# -*- coding: utf-8 -*-
from dataclasses import dataclass
from typing import List, Dict, Any

@dataclass
class ExtractionMetrics:
    precision: float
    recall: float
    f1: float

def calculate_f1_score(true_entities: List[str], extracted_entities: List[str]) -> ExtractionMetrics:
    true_set = set([e.lower().strip() for e in true_entities])
    ext_set = set([e.lower().strip() for e in extracted_entities])
    
    if not ext_set and not true_set:
        return ExtractionMetrics(precision=1.0, recall=1.0, f1=1.0)
    if not ext_set or not true_set:
        return ExtractionMetrics(precision=0.0, recall=0.0, f1=0.0)
        
    tp = len(true_set.intersection(ext_set))
    fp = len(ext_set - true_set)
    fn = len(true_set - ext_set)
    
    prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = (2 * prec * rec) / (prec + rec) if (prec + rec) > 0 else 0.0
    
    return ExtractionMetrics(precision=prec, recall=rec, f1=f1)

def calculate_decision_agreement(human_decisions: List[str], ai_decisions: List[str]) -> float:
    if not human_decisions or len(human_decisions) != len(ai_decisions):
        return 0.0
    matches = sum(1 for h, a in zip(human_decisions, ai_decisions) if h == a)
    return matches / len(human_decisions)
