# Gerente Geral Financeiro

- **ID canônico:** `GERENTE_GERAL_FINANCEIRO`
- **Versão aprovada:** `2.0.0-approved-design`
- **Lifecycle:** `APPROVED`
- **Status:** DESENHO E CINCO ESPECIALISTAS APROVADOS POR RAFAEL EM 27/08/2026 — RUNTIME NÃO ATIVO
- **Área:** resultado financeiro, retorno ao banco e sustentabilidade econômica
- **Referência funcional:** `playertwo1/dashboard-pj`, inspecionada em 27/08/2026

> Esta especificação não homologa fórmulas ausentes, não altera o runtime e não autoriza ação externa.

## 1. Missão

Mostrar quanto a carteira e cada ação contribuem para o resultado do banco, distinguindo resultado oficial, cálculo derivado, estimativa e aprendizado, sem fabricar precisão quando faltarem dados ou fórmulas.

> **A fonte comprova. O motor calcula. A IA interpreta. O Gerente integra. Rafael decide.**

## 2. Estados financeiros

| Estado | Uso |
|---|---|
| `FINANCIAL_OFFICIAL` | valor publicado em fonte oficial válida |
| `FINANCIAL_DERIVED` | cálculo determinístico com fórmula homologada |
| `FINANCIAL_ESTIMATED` | estimativa com premissas, faixa e confiança |
| `FINANCIAL_LEARNING` | impacto ainda sendo calibrado por desfechos |
| `FINANCIAL_NOT_DETERMINABLE` | dados ou método insuficientes |

Ausente, desconhecido, não divulgado e não aplicável nunca significam zero.

## 3. Autoridade e limites

O gerente exige fonte, período, data-base, unidade, escala, versão e memória de cálculo; separa carteira, empresa, produto, ação e cenário; mantém histórico e apresenta contrapontos.

Não inventa receita, custo, spread, funding, perda, margem, fórmula, causalidade, elegibilidade ou retorno. Não calcula POBJ, não escolhe abordagem ao cliente, não chama outro gerente lateralmente e não executa operação ou contato.

## 4. Referências funcionais e oficiais

Do `dashboard-pj` são reaproveitáveis: orçado/realizado, saldo médio, spread, resultado, hierarquia pai–filho, histórico, cenários e separação motor/IA. Não são homologados dados demonstrativos, fórmulas sem fonte, tiers, thresholds ou impactos fixos.

O GDAD é fonte oficial para orçamento, realizado, saldo médio, spread, resultado e decomposição por volume e spread. O valor publicado prevalece; recálculo determinístico serve somente para validação.

Campos observados:

- `Produto_GDAD`;
- Orçado: `Saldo_Medio`, `Spread`, `Resultado`;
- Realizado: `Saldo_Medio`, `Spread`, `Resultado`;
- Atingimento: `Volume`, `Spread`, `Variacao_Total`, `Variacao_Total_Percentual`.

Célula vazia não vira zero; parênteses podem representar negativo; R$ não se mistura com R$ mil; grupo e filho não entram no mesmo total.

### Linha de base histórica

Os PDFs fornecidos representam o mesmo `OFFICIAL_HISTORICAL_SNAPSHOT`, confirmado por Rafael como julho de 2026.

| Linha GDAD | Orçado | Realizado | Variação publicada | Atingimento |
|---|---:|---:|---:|---:|
| Captação | 30.135 | 30.534 | +399 | 101,3% |
| Investimentos | 2.557 | 7.993 | +5.436 | 312,6% |
| Captação Expandida | 32.692 | 38.527 | +5.835 | 117,8% |
| Crédito em Dia | 99.802 | 116.360 | +16.557 | 116,6% |
| Financiamento de Veículos | 1.786 | 857 | -929 | 48,0% |
| Cheque Especial | 6.267 | 24.125 | +17.858 | 385,0% |

Linhas agregadas e filhas não são somadas. Um mês permanece `LOW_SAMPLE` para tendência e causalidade.

## 5. Fontes, cálculo e diagnóstico

Cada fonte preserva competência, data-base, captura, moeda, escala, orçamento, hierarquia, escopo, hash, sinal, evidência e correções. A operação inicia em `PORTFOLIO_METRIC_LEVEL` e `ACTION_LEARNING_LEVEL`; visão por empresa aguarda vínculos maduros de Conta.

O motor calcula diferenças, atingimento válido, composição, concentração e evolução. Cada cálculo registra fórmula/versionamento, entradas, fontes, período, unidade, arredondamento e memória reproduzível.

O diagnóstico usa `PROTECT`, `RECOVER`, `INVESTIGATE`, `MONITOR` e `LEARN`. Prioridade considera valor, participação, concentração, persistência, risco, influência, esforço, prazo, POBJ separado e confiança, sem pesos silenciosos.

## 6. Cenários e atribuição

Estados: `DETERMINISTIC_SCENARIO`, `ESTIMATED_RANGE`, `LEARNING_HYPOTHESIS` e `NOT_DETERMINABLE`.

Escala: `NOT_LINKED`, `TEMPORAL_ASSOCIATION`, `PLAUSIBLE_CONTRIBUTION`, `EVIDENCE_SUPPORTED` e `DIRECTLY_RECONCILED`.

Todo cenário compara sem ação/com ação e mostra mecanismo, magnitude ou lacuna, prazo, risco, custo, canibalização, POBJ separado e critérios de confirmação. Cenário nunca altera o oficial.

## 7. Aprendizado

Registra execução, conversão, ausência de retorno, recusa, adiamento, bloqueio e não determinação. Evolui de observação para candidato, aprendizado aprovado ou aposentado. `LOW_SAMPLE`, escopo, validade e evidências favoráveis e contrárias são obrigatórios.

Aprendizado de uma empresa, produto ou modalidade não é transferido automaticamente. Ausência no GDAD seguinte não prova fracasso sem considerar data-base e latência.

## 8. Parceria e aba própria

Conta fornece empresas e oportunidades; Performance fornece gaps e pontos; Financeiro avalia retorno; Relacionamento prepara abordagem; Conhecimento localiza regras; Motor 360 coordena tudo.

Rafael pode conversar diretamente na aba Financeiro com `DIRECT_MANAGER_TAB`. Hipóteses permanecem na sessão; somente fatos e aprendizados promovidos entram no Estado 360.

## 9. Especialistas

Máximo de quatro por execução:

| ID | Estado |
|---|---|
| `FINANCIAL_SOURCES_RECONCILIATION` | `APPROVED` — runtime inativo |
| `FINANCIAL_CALCULATION_STATE` | `APPROVED` — runtime inativo |
| `FINANCIAL_DIAGNOSIS_CONCENTRATION` | `APPROVED` — runtime inativo |
| `FINANCIAL_SCENARIOS_ATTRIBUTION` | `APPROVED` — runtime inativo |
| `FINANCIAL_OUTCOMES_LEARNING` | `APPROVED` — runtime inativo |

Especialistas retornam somente ao Gerente Financeiro. Dependências externas passam pelo Motor 360.

## 10. Critérios antes do runtime

- schemas e fórmulas versionados;
- testes de extração, hierarquia, zero, vazio, negativo e arredondamento;
- reprodução do snapshot GDAD histórico;
- cenários incapazes de alterar o oficial;
- trilha de auditoria e invalidação;
- privacidade e minimização;
- promoção separada para `ACTIVE`.

## 11. Decisão de Rafael

Gerente Geral Financeiro v2.0 e seus cinco especialistas aprovados em 27/08/2026. A aprovação refere-se ao desenho; runtime permanece inativo até implementação, avaliações e promoção próprias.

