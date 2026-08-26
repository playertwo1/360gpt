# Central de Revisão 360

## Mandato

A Central de Revisão 360 é um serviço determinístico de fila e governança. Ela recebe pedidos estruturados quando um Estado 360 termina em `MANUAL_REVIEW_REQUIRED`, aplica deduplicação e SLA, registra atribuição e escalonamento e preserva a resolução humana como evento imutável.

A Central não interpreta evidências, não escolhe entre fontes conflitantes, não concede autorização transacional e não altera o Estado 360 publicado. Uma resolução com `TRIGGER_REPROCESS` apenas registra a necessidade de reprocessamento; o Diretor 360 continua responsável por coordenar uma nova execução autorizada.

## Contratos e persistência

- Pedido: `contracts/manual-review.schema.json`, Draft 2020-12, versão `2.0.0`.
- Resolução: `contracts/review-resolution.schema.json`, Draft 2020-12, versão `1.0.0`.
- SLA e filas: `policies/review-sla.yaml`.
- Reason codes: `policies/reason-codes.yaml`.
- PostgreSQL local: `manual_review_requests` e `manual_review_resolutions`.
- D1 hospedado: as mesmas entidades com JSON estruturado serializado e índices de tenant, status, prioridade, vencimento e deduplicação.

O `dedupe_key` é SHA-256 de tenant, snapshot, versão e reason code. Uma resolução por pedido é permitida; correção posterior exige nova evidência, novo snapshot e novo pedido versionado.

## Ciclo de vida

```text
PENDING_TRIAGE → ASSIGNED → IN_REVIEW
      │              │          ├─→ RESOLVED_CONFIRMED
      │              │          ├─→ RESOLVED_CORRECTED
      │              │          ├─→ RESOLVED_DISMISSED
      │              │          └─→ MORE_DATA_REQUIRED
      └─→ ESCALATED ─┘
```

- `ASSIGN_TO_ME` exige revisor presente em `REVIEWER_ALLOWED_EMAILS`.
- `START_REVIEW` exige atribuição ao mesmo usuário autenticado.
- `ESCALATE` é limitado a três níveis.
- Resolução exige status `IN_REVIEW`, atribuição vigente, decisão permitida e justificativa estruturada.
- Toda transição e resolução gera registro de auditoria; a resolução possui hash canônico.

## Interfaces hospedadas

- `GET /api/reviews`: consulta somente leitura para usuários autorizados do Dashboard.
- `PATCH /api/reviews/{id}`: atribuição, início de revisão e escalonamento por revisor autorizado.
- `POST /api/reviews/{id}/resolve`: resolução humana estruturada por revisor autorizado.

O Dashboard apenas exibe a fila e o SLA. Ele não chama interfaces de escrita. Ausência de identidade, allowlist de revisor ou contrato válido falha fechada.

## Operação segura

- Somente `OFFLINE_EVAL` e dados sintéticos estão homologados nesta fase.
- Nenhuma resolução executa contato, transação, cadastro ou alteração bancária.
- O WF-09, `BRIDGE_ENABLED` e `TELEGRAM_INGEST_ENABLED` permanecem desligados fora de janelas controladas.
- Implantação da Central exige migração D1, configuração explícita de `REVIEWER_ALLOWED_EMAILS` e homologação separada das transições autenticadas.
