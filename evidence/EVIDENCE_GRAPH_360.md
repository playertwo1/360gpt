# Evidence Graph 360 — Fundação 13A

## Mandato

O Evidence Graph registra a linhagem verificável entre artefatos, observações, transformações, achados, recomendações, revisões, resoluções, snapshots e atores. Ele é derivado apenas de eventos persistidos e não decide qual evidência está correta.

## Regras obrigatórias

- Nós e relações são append-only; correções criam novas entidades e relações `SUPERSEDES` ou `INVALIDATES`.
- Todo registro possui tenant, versão, hash SHA-256, tempo de registro e payload mínimo.
- O payload não armazena segredos, tokens, documentos brutos ou PII desnecessária.
- Atores humanos usam o identificador estável e restrito ao Site, nunca o e-mail no grafo.
- Relações somente apontam para nós existentes do mesmo tenant.
- A consulta é autenticada, limitada a quatro saltos e somente leitura.

## Integração inicial

```text
STATE_SNAPSHOT ──GENERATED_BY──> ACTOR(serviço da ponte)
MANUAL_REVIEW_REQUEST ──DERIVED_FROM──> STATE_SNAPSHOT
MANUAL_REVIEW_REQUEST ──GENERATED_BY──> ACTOR(Central determinística)
REVIEW_RESOLUTION ──DERIVED_FROM──> MANUAL_REVIEW_REQUEST
REVIEW_RESOLUTION ──ATTRIBUTED_TO──> ACTOR(revisor humano)
```

O endpoint `GET /api/audit/reviews/{review_request_id}?tenant_id=tenant-demo` devolve o pedido, a resolução, os eventos de auditoria e o subgrafo conectado. Ausência de linhagem é rotulada `ORPHAN_EVIDENCE`; nenhuma informação é reconstruída por memória de agente.

## Limite do Marco 13A

Esta fundação entrega contrato, persistência, integração e consulta. A visualização navegável, filtros executivos e drill-down gráfico pertencem ao Marco 13B.
