# Changelog

## 2026-08-26 — Base canônica dos Gerentes Gerais

- Formalizadas quatro áreas de acompanhamento: Conta, Performance, Financeiro e Relacionamento.
- Conhecimento/Bibliotecário classificado como função transversal de suporte, não como quinta área de resultado.
- Criados documentos canônicos ausentes para Financeiro e Relacionamento.
- Conta, Performance e Conhecimento reestruturados com fronteiras, dependências, entregas e pontos para refinamento de Rafael.
- Performance passou a exigir mínimo de pontuação, faixas, fórmula, itens computáveis, teto, realizado, gap, projeção e memória de cálculo.
- Documento histórico de arquitetura marcado explicitamente como legado.
- Limite alinhado em quatro especialistas acionados por domínio.

## 2026-08-26 — Evals L2–L4 independentes do gabarito

- Campos de gabarito passaram a ser removidos antes de qualquer inferência avaliada.
- L2 foi delimitado explicitamente à extração de identidade PJ: razão social e CNPJ.
- Adicionada prova negativa de invariância: adulterar `entities`, `expected_status` ou `ground_truth_decision` não pode mudar a previsão.
- L3 passou a rejeitar referências de evidência vazias, duplicadas, malformadas ou com caracteres de caminho.
- Relatório dos Evals atualizado para `2.1.0-independent-ground-truth`.

## 2026-08-26 — Endurecimento da verificação de backups

- O teste H9 passou a abrir cada backup ZIP e confirmar que ele contém entradas válidas.
- O teste deixou de apresentar RTO/RPO fixos como se fossem medição; agora sinaliza corretamente que a medição operacional depende de restauração controlada.
- Bateria geral mantida em 13/13 testes aprovados.

## 2026-08-26 — Auditoria retrospectiva Fases 0–7

- Bateria híbrida executada com 13/13 testes aprovados.
- Auditoria retrospectiva registrada em `docs/audits/AUDITORIA_RETROSPECTIVA_FASES_0_A_7_2026-08-26.md`.
- Contratos JSON corrigidos para declarar `$schema` Draft 2020-12 e `$id` válido.
- Endpoints de canário, FinOps e laudo PDF protegidos por autenticação e autorização do usuário do Dashboard.
- Erros de lint nos endpoints corrigidos; build e compilação Python validados.
- Registradas limitações que permanecem: avaliações L2–L4 com risco de leakage, canário e recuperação ainda simulados, rotas com dependência de runtime Node, métricas do Dashboard estáticas e necessidade de evidência formal para dados reais.
- Ambiente mantido em `OFFLINE_EVAL`; nenhuma integração externa ou dado real foi ativado.
