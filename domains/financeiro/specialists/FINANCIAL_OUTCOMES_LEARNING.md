# Especialista — Desfechos e Aprendizado Financeiro

- **ID canônico:** `FINANCIAL_OUTCOMES_LEARNING`
- **Versão aprovada:** `1.0.0-approved-design`
- **Lifecycle:** `APPROVED`
- **Owner:** `GERENTE_GERAL_FINANCEIRO`
- **Status:** desenho aprovado por Rafael em 27/08/2026; runtime não ativo

## Missão

Aprender como ações, produtos e resultados evoluem entre competências, preservando amostra, escopo, evidência e incerteza.

## Capacidades propostas

- `financial.outcome.register`
- `financial.recognition.track`
- `financial.learning.candidate`
- `financial.learning.promote`
- `financial.learning.invalidate`

## Estados da ação

- `EXECUTED`, `CONVERTED`, `NO_RETURN`, `DECLINED`, `DEFERRED`, `BLOCKED`, `NOT_APPLICABLE`, `NOT_DETERMINABLE`.

## Níveis de conhecimento

- `OBSERVATION`;
- `PATTERN_CANDIDATE`;
- `LEARNING_CANDIDATE`;
- `APPROVED_LEARNING`;
- `RETIRED_LEARNING`.

## Método

1. registrar ação, cenário anterior e evidências em histórico append-only;
2. acompanhar data-base dos GDADs posteriores;
3. separar execução, conversão e reconhecimento financeiro;
4. comparar esperado e observado sem atribuição causal automática;
5. aprender latência, recorrência, sazonalidade e deterioração por escopo;
6. manter `LOW_SAMPLE` até repetição e diversidade suficientes;
7. promover por critérios aprovados ou confirmação de Rafael;
8. invalidar quando fonte, fórmula ou evidência forem corrigidas.

## Escopos

- competência e linha GDAD;
- produto e tipo de ação;
- empresa vinculada, quando Conta fornecer chave madura;
- carteira agregada;
- hipótese estratégica para revisão de Rafael.

Aprendizado de uma empresa, produto ou modalidade não é transferido automaticamente para outro.

## Saída

- desfecho e evidências;
- tempo até conversão e reconhecimento;
- resultado esperado e observado;
- estado de atribuição;
- candidato a aprendizado, escopo, amostra e confiança;
- evidências favoráveis e contrárias;
- recomendação de testar, manter, promover, revisar ou aposentar.

## Limites

- ausência no próximo GDAD não prova fracasso sem considerar data-base;
- correlação não vira causalidade;
- padrão não altera fórmula oficial;
- amostra pequena não gera faixa estimada ampla;
- resultado excepcional não vira expectativa;
- Rafael não é penalizado por rejeitar recomendação.

## Critérios de aceite

- um único GDAD mantém tendências em `LOW_SAMPLE`;
- correção histórica recalcula apenas aprendizados dependentes;
- promoção registra evidência, amostra, aprovador, validade e escopo;
- aprendizado vencido deixa de orientar decisões;
- nenhuma informação identificável cruza empresas;
- relatório de evolução é reproduzível pelos eventos.

## Falha segura e rollback

Sem desfecho ou período comparável, retornar `NOT_DETERMINABLE`. Rollback rebaixa ou aposenta o aprendizado, preservando observações e decisões anteriores.

## Decisão de Rafael

Especialista aprovado integralmente em 27/08/2026, incluindo estados de ação, evolução do conhecimento, `LOW_SAMPLE`, escopos, invalidação e rollback. A aprovação não autoriza ativação no runtime.
