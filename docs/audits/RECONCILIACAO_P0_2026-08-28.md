# Reconciliação P0 — Checklist, Roadmap e Estado Real

**Data:** 28 de agosto de 2026  
**Escopo:** documentação, código, testes disponíveis e estado do Git.  
**Fora do escopo:** qualquer alteração em scripts, fixtures, métricas, critérios ou configuração da Trilha Shadow.

## Resultado

`P0 — CONCLUÍDO COM AJUSTES DOCUMENTAIS`

Os artefatos canônicos, contratos, políticas, domínios, scripts de teste e registros de governança referenciados pelo checklist estão presentes no repositório. O checkpoint anterior é `563f0e6`. Os arquivos gerados locais não relacionados foram preservados e não fazem parte deste ajuste.

## Divergências encontradas e resolução

| Item | Divergência | Resolução adotada |
|---|---|---|
| Autorização de dados reais | `ROADMAP.md` dizia `UNRESOLVED`; `status.md` dizia `AUTORIZADO`. | Unificado: existe autorização institucional, mas cada uso operacional continua condicionado a finalidade, escopo, minimização, auditoria e gate específico. Nenhuma fonte real foi conectada. |
| RTO/RPO | `checklist.md` apresentava 3m12s/0s como medição fixa. | Corrigido para indicar restauração isolada aprovada e medição operacional dependente do ambiente-alvo. |
| Fase 8 | `status.md` dizia “PRONTO P/ ATIVAR”, embora M8.2 esteja planejado. | Corrigido para “M8.1 pronto; M8.2 planejado sob demanda”. |
| Shadow | Preparação e observação apareciam misturadas. | Mantida separação explícita: medições sintéticas, append-only e sem efeitos externos; nenhuma alteração na trilha. |

## Evidências verificadas

- Contratos JSON Schema Draft 2020-12 presentes em `contracts/`.
- Manifesto, políticas de lifecycle, roteamento, fontes, freshness, FinOps, revisão e Evidence Graph presentes.
- Quatro Gerentes Gerais e especialistas documentados em `domains/`.
- Scripts das baterias H3–H10, Fases 2, 4, 5, 6 e 7 presentes.
- Testes específicos de ponte, Evidence Graph, revisão manual, backup, restauração, canary e governança presentes.
- Git preservado; alterações locais não relacionadas não foram incluídas.

## Pendências corretamente abertas

- P1: executar regressão completa, lint e build e produzir relatório único.
- P2: concluir apenas motores determinísticos ainda pendentes.
- P5: preencher finalidade, escopo, responsáveis e retenção da autorização operacional.
- Shadow S1/S2: completar 24/24 e consolidar o Gate; esta reconciliação não altera medições.
- P8/A1 em diante: dependem do Gate Shadow e das aprovações correspondentes.
