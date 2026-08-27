# Reconciliação arquitetural v2 — 27/08/2026

## Objetivo

Estabelecer uma fonte central, verificável e sem ambiguidade para a estrutura aprovada do Projeto 360. A aprovação de um desenho não autoriza sua execução.

## Estado canônico

| Domínio | Gerente | Versão aprovada | Especialistas | Runtime |
|---|---|---:|---:|---|
| Conta | GERENTE_GERAL_CONTA | 4.38.0 | 6 | INACTIVE |
| Performance | GERENTE_GERAL_PERFORMANCE | 5.3.0-approved-design | 5 | INACTIVE |
| Financeiro | GERENTE_GERAL_FINANCEIRO | 2.0.0-approved-design | 5 | INACTIVE |
| Relacionamento | GERENTE_GERAL_RELACIONAMENTO | 2.0.0-approved-design | 5 | INACTIVE |

O Diretor Geral está aprovado como desenho v2.0 e permanece inativo. Governança de conhecimento é uma capacidade transversal; não é um quinto Gerente Geral.

## Divergências encontradas

1. O registro de capacidades atual mistura capacidades sintéticas ativas com os novos desenhos aprovados.
2. Performance, Financeiro e Relacionamento ainda não possuem seus especialistas aprovados materializados no registro antigo.
3. O antigo Gerente de Conhecimento consta como aposentado, mas capacidades filhas ainda aparecem ativas.
4. O arquivo de status ainda referencia AGENTS v1.11, enquanto a fonte aprovada é v2.0.
5. O status bloqueia dados reais, mas o roadmap declara autorização. Até reconciliação documental, o manifesto registra UNRESOLVED.
6. A interface contém versões e indicadores demonstrativos fixos que não provam estado operacional.

## Regra de migração

O registro antigo continua sendo catálogo legado do runtime sintético até sua migração. Ele não comprova que os novos gerentes ou especialistas aprovados estejam ativos.

Cada componente passa a declarar separadamente:

- design_status;
- implementation_status;
- runtime_status;
- fonte normativa.

## Migração aplicada

Os arquivos capability-registry.yaml e routing.yaml agora consomem o manifesto central e distinguem:

- os oito fluxos sintéticos legados, que continuam executáveis apenas com dados sintéticos;
- os quatro Gerentes Gerais e 21 especialistas aprovados, que permanecem inativos;
- o antigo Gerente de Conhecimento e suas capacidades filhas, agora coerentemente aposentados.

Uma rota de desenho aprovado sem runtime autorizado retorna MANUAL_REVIEW_REQUIRED. A ativação futura exigirá mudança explícita de lifecycle, escopo de dados e testes de liberação.

## Contratos específicos adicionados

Performance, Financeiro e Relacionamento agora possuem contratos separados de solicitação e resposta.

- Performance exige mês de referência, data-base, fontes oficiais, mínimos, tetos, pontos, esforço e defasagem de atualização. A resposta limita o plano diário a cinco ações priorizadas.
- Financeiro exige orçamento e realizado por linha, data-base e situação da fonte. A resposta separa variação, concentração e atribuição confirmada, estimada ou desconhecida.
- Relacionamento exige finalidade, referência do cliente, base de consentimento e linha do tempo. A resposta separa necessidades, objeções, compromissos, abordagem sugerida e visão alternativa.
- Todas as respostas exigem incertezas explícitas, aprovação humana para recomendações e Rafael como autoridade final.
