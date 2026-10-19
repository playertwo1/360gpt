# ROADMAP — DIRETOR 360

**Versão do planejamento:** 12.0 · **Atualizado em:** 2026-10-19 · **Proprietário:** Rafael

> **REGRA INEQUÍVOCA:** WF-101 é obrigatório e deve permanecer publicado e ativo. Não desativar, aposentar, remover ou arquivar o WF-101.

O n8n é a autoridade operacional exclusiva: toda entrada passa por workflow antes de comando, IA, cálculo, pergunta, estado ou resposta (ADR-002, `AGENTS.md`).

Estado de retomada, divergências e próxima ação: `STATE.md`. Histórico completo do planejamento até 2026-09-04 (v11, 1467 linhas): [`docs/arquivo/ROADMAP_v11_2026-09-04.md`](docs/arquivo/ROADMAP_v11_2026-09-04.md).

Legenda: `[ ]` pendente · `[~]` em andamento · `[x]` entregue com evidência · `[v]` em validação por Rafael.

## Marcos

| Marco | Descrição | Estado | Evidência |
|---|---|---|---|
| A0.0–A0.1 | Decisão, fronteiras e fundação local n8n + PostgreSQL | Entregue | CHANGELOG 3.10.0 |
| A0.2 | Rota crítica até o MVP real (M0–M10) — antigo "MARCO ATUAL" | Entregue | CHANGELOG 3.11.0 (Gate MVP homologado por Rafael, 02/09) |
| P0 | Blindagem do Telegram | Entregue | CHANGELOG 3.9.0 |
| N0 | Intake durável | Entregue | ROADMAP v11 §7 |
| N2 | Leitor documental subordinado (Docling) — antigo "MARCO ATUAL" | Entregue | CHANGELOG 3.13.0–3.14.0 (Gate N2 homologado, 02/09) |
| N2.1–N2.2 | Entrada textual conversacional e evolução pós-MVP | Entregue | CHANGELOG 3.15.0, 4.1.0, 5.0.0 |
| N2.3 | Aprendizado contínuo e Flywheel | Entregue | CHANGELOG 6.0.0 |
| N8.1–N8.4 | GG Conta, Relacionamento, Financeiro e Mesa dos 4 Gerentes | Entregue | CHANGELOG 3.12.0, 3.16.0, 4.0.0 |
| N9.1–N9.3 | Observabilidade, segurança, backup e cutover canônico | Entregue | CHANGELOG 4.0.0, 5.2.0 |
| 11.3 | Segunda/terceira remediação dos gates A0 e N2.3 — antigo "MARCO ATUAL" | Entregue | CHANGELOG 6.2.0–6.3.0 |
| 11.4 | Quarta remediação (Q0–Q8) — antigo "MARCO ATUAL" | Entregue | CHANGELOG 6.3.0; sequência oficial item 7 do ROADMAP v11 |
| Q12 | Camada conversacional contextual, multi-turno e resiliente | Entregue | CHANGELOG 12.0.0 (`3398e92`, 2026-09-04) |
| N1, N3–N7 | Controlador mestre, Diretor, GG Performance, Estado 360, revisão, Telegram ponta a ponta | Desatualizado — reconciliar | Status no ROADMAP v11 anterior às entregas 4.0.0–12.0.0; ver `STATE.md` |
| N9.4 | Disponibilidade futura | Pendente (fora do marco ativo) | ROADMAP v11 §9.4 |
| **OP1** | **Operação assistida real** | **Ativo** | abaixo |

## Marco ativo — OP1 — Operação assistida real

Objetivo: Rafael usa o Diretor 360 no dia a dia, pelo celular, com documentos e conversas reais, e o estado declarado bate com o runtime.

| ID | Tarefa | Estado | Critério de aceite |
|---|---|---|---|
| OP1-01 | POBJ real pelo celular | [ ] | Rafael envia um POBJ real pelo Telegram; WF-100 → WF-101 → Docling → GG Performance → parecer entregue; protocolo, extração e resposta registrados no PostgreSQL; sem dado real em log ou commit. |
| OP1-02 | Recompor janela Shadow | [ ] | Resolver ou formalmente encerrar o `HOURLY_MEASUREMENT_GAP` de 2026-09-02 com nova janela medida e registro da decisão de Rafael; até lá nenhuma promoção ou ampliação. |
| OP1-03 | Reconciliar estado AUTO | [ ] | Conferir `AUTO_PROMOTION_ENABLED` no `.env.n8n`, no container e no PostgreSQL; registrar o valor real e a decisão de Rafael; alinhar `PROJECT_STATE.md`, `STATE.md` e este roadmap. |

Fora do marco: novos domínios, deploy em nuvem, Seguros/Cartões com regra dedicada (decisão de negócio pendente).

## Entregues

| Versão | Data | Entrega |
|---|---|---|
| 12.0.0 | 2026-09-04 | Camada conversacional natural com Gemini e 10 casos homologados (Q12) |
| 11.0.0 | 2026-09-04 | Ativação canônica do WF-104 e Flywheel com governança soberana |
| 10.0.0 | 2026-09-04 | Humanização conversacional e extrator Gemini/Docling |
| 9.0.0 | 2026-09-04 | Custom reply keyboard e projeção dinâmica POBJ |
| 8.0.0 | 2026-09-04 | Sétima remediação — migration 20 |
| 7.1.0 | 2026-09-04 | Sexta remediação — RPCs inbound |
| 7.0.0 | 2026-09-03 | Quinta remediação — gates N7/N7A |
| 6.0.0–6.3.0 | 2026-09-02/03 | Gate N2.3 Flywheel e remediações A0/N2.3 |
| 5.0.0–5.3.0 | 2026-09-02 | Gate N2.2, piloto, cutover canônico A0 |
| 4.0.0–4.1.0 | 2026-09-02 | Mesa dos 4 Gerentes, N9, fases N2.2 |
| 3.10.0–3.16.0 | 2026-09-02 | Núcleo local n8n, runtime exclusivo, MVP, N2, N2.1, GG Conta/Relacionamento |
| 3.8.0–3.9.1 | 2026-09-01/02 | Docling único OCR, blindagem P0 do Telegram |

Detalhe de cada entrega: `CHANGELOG.md`.
