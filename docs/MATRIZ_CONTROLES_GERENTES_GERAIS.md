# Matriz de controles dos Gerentes Gerais

**Versão:** 1.0.0  
**Estado:** preparação para canary; nenhum gerente está ativo.  
**Finalidade:** concentrar o escopo, as fontes, os limites e os controles exigidos para A2–A4 do roadmap.

| Domínio | Fontes e evidências aceitas | Regra determinística | Limites obrigatórios | Controle de pausa e rollback |
|---|---|---|---|---|
| Conta | Identidade forte, cadastro, produtos, limites, movimentação e políticas vigentes do domínio | Elegibilidade por produto, operação ou ação; divergência gera revisão manual | Não calcula POBJ ou rentabilidade; não transforma pré-aprovação em promessa; não executa operação | `DISABLE_CAPABILITY`; reabrir somente com evidência atual e revisão humana |
| Performance | POBJ oficial versionado, data-base, unidade, meta, realizado e regra aplicável | Piso, teto, fórmula e exceções somente por política homologada | Não escolhe empresa sem Conta; não inventa retorno financeiro ou abordagem | `DISABLE_CAPABILITY`; divergência de fonte ou curva gera `MANUAL_REVIEW_REQUIRED` |
| Financeiro | Orçamento, realizado, período, moeda, escala, memória de cálculo e fontes conciliadas | Cálculos reproduzíveis de variação, atingimento e cenário | Ausência é `NOT_AVAILABLE`; não aprova crédito e não executa efeito financeiro | `DISABLE_CAPABILITY`; ausência, divergência ou fórmula não homologada interrompe o parecer material |
| Relacionamento | Conversas, compromissos, responsáveis, prazos e evidência textual autorizada | Compromissos e follow-up rastreáveis; hipótese permanece hipótese | Não converte inferência em necessidade; não envia redação externa sem autorização | `DISABLE_CAPABILITY`; conteúdo ambíguo, injetado ou sem evidência segue para revisão manual |

## Controles transversais

- Runtime permanece `INACTIVE`; somente o runtime sintético legado está ativo.
- Máximo de quatro especialistas por domínio e profundidade máxima Diretor → Gerente → Especialista.
- Parecer material exige fonte, versão, vigência, data-base, hash e trilha no Evidence Graph.
- Toda ação externa exige autorização humana específica; nesta fase permanece bloqueada.
- Métricas de canary incluem erro, latência, custo, divergência, override e evidência completa.
- Rollback padrão: desabilitar a capacidade, preservar auditoria e reprocessar somente após correção autorizada.

## Critérios de saída A2–A4

1. Contrato e fonte aplicável validados por domínio.
2. Testes sintéticos individuais e integração 360 aprovados.
3. Kill switch, rollback, orçamento FinOps e auditoria comprovados.
4. Aprovação explícita para um único domínio e uma única capacidade antes de qualquer `ACTIVE`.
