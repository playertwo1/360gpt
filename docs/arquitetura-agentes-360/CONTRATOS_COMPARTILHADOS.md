# Contratos compartilhados 360

## Natureza das afirmações

`FACT`, `CALCULATION`, `INFERENCE`, `RECOMMENDATION` e `HYPOTHESIS`. Inferência e hipótese nunca são apresentadas como fato.

## Estado da informação

`VALID`, `PARTIAL`, `MISSING`, `STALE`, `CONFLICTING`, `NOT_APPLICABLE` ou `BLOCKED`. Zero é valor; ausência é ausência.

## Handoff obrigatório

```yaml
specialist_handoff:
  run_id: id
  correlation_id: id_estavel_da_entrada
  idempotency_key: chave_estavel_da_operacao
  specialist: id
  status: OK | PARTIAL | BLOCKED | ERROR
  as_of: ISO-8601
  subject_ids: []
  intent: codigo
  facts: []
  calculations: []
  inferences: []
  recommendations: []
  evidence: []
  rule_codes: []
  blockers: []
  missing_data: []
  dependencies: []
  confidence: HIGH | MEDIUM | LOW
  confidence_reason: texto_curto
  schema_version: 1.0
```

## Caso consolidado

```yaml
final_case:
  subject: cliente_ou_carteira
  domains: []
  labels: []
  priority: P0 | P1 | P2 | P3 | BLOCKED
  situation: texto_objetivo
  evidence: []
  impact_account: texto_ou_nao_determinavel
  impact_performance: texto_ou_nao_determinavel
  impact_financial: texto_ou_nao_determinavel
  recommended_action: verbo_objetivo
  client_approach: texto | NOT_APPLICABLE
  deadline: data_ou_condicao
  dependencies: []
  confidence: HIGH | MEDIUM | LOW
  completion_criterion: evento_verificavel
  reevaluation: data_ou_condicao
```

Chave de deduplicação: `subject + root_cause + governing_rule + recommended_action`.

## Envelope de evento n8n

```yaml
event:
  schema_version: 1.0
  event_id: uuid
  correlation_id: uuid
  idempotency_key: origem_id_mensagem_ou_hash
  received_at: ISO-8601
  source: telegram | app | web | manual | schedule
  actor_id: id_opaco
  subject_hint: id_opaco | null
  intent_hint: codigo | null
  payload_ref: referencia_segura
  reply_target: referencia_do_canal
  consent_purpose: finalidade
```

Arquivos e conversas extensas circulam por referência autenticada, não como binário repetido entre subworkflows.

