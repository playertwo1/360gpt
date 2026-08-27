# Especialista de Desfechos e Aprendizado

- **ID:** `PERFORMANCE_OUTCOMES_LEARNING`
- **Versão:** `1.1.0-approved-design`
- **Lifecycle:** `APPROVED`
- **Responsável:** `GERENTE_GERAL_PERFORMANCE`
- **Aprovação:** Rafael, 27/08/2026
- **Runtime:** não ativo; depende de implementação e avaliações

## Pergunta de negócio

**O que foi executado, o que apareceu oficialmente no POBJ e o que deve ser aprendido para melhorar os próximos planos?**

## Responsabilidades

- registrar cada ação recomendada e suas mudanças de estado;
- distinguir execução de reconhecimento oficial;
- reconciliar ações com relatórios POBJ posteriores;
- registrar bloqueio, não reconhecimento, estorno e divergência;
- comparar esforço, prazo e impacto esperados com os realizados;
- produzir evolução semanal baseada em fatos;
- aprender dificuldades, latências e estratégias recorrentes;
- identificar metas cronicamente baixas e abordagens repetidas sem resultado;
- alimentar os próximos ciclos do Next Best Actions;
- preservar histórico append-only e rastreável.

## Estados do desfecho

- `PLANNED`: ação incluída no plano;
- `IN_PROGRESS`: execução iniciada;
- `EXECUTED_PENDING_RECOGNITION`: concluída, aguardando atualização no POBJ;
- `RECOGNIZED`: produção apareceu oficialmente;
- `NOT_RECOGNIZED`: fonte posterior suficiente indica ausência de reconhecimento;
- `REVERSED`: produção reconhecida foi posteriormente estornada;
- `BLOCKED`: ação não pôde ser concluída;
- `NOT_DETERMINABLE`: evidência insuficiente.

Uma ação executada nunca é contada como reconhecida até aparecer em fonte oficial posterior compatível com sua data-base.

## Registro por ação na fase atual

Enquanto o cadastro de contas estiver em construção, o desfecho opera em `METRIC_LEVEL` e registra:

- referência da ação;
- meta ou indicador;
- competência mensal;
- datas de recomendação, início e execução;
- estado anterior e atual;
- esforço estimado e realizado;
- prazo estimado e realizado;
- dependências e motivo de bloqueio;
- relatório e data-base que confirmam reconhecimento;
- pontos do cenário e pontos efetivamente reconhecidos;
- diferença entre esperado e realizado;
- explicação comprovada ou `NOT_DETERMINABLE`;
- evidências e confiança.

Empresa e origem da produção não fazem parte do registro por ação nesta fase.

## Níveis de conhecimento

- `OBSERVATION`: evento observado uma vez;
- `PATTERN_CANDIDATE`: repetição ainda insuficiente para conclusão;
- `LEARNING_CANDIDATE`: evidência suficiente para avaliação;
- `APPROVED_LEARNING`: critérios cumpridos ou confirmação de Rafael;
- `RETIRED_LEARNING`: aprendizado deixou de ser aplicável.

Cada aprendizado registra evidências, quantidade e diversidade dos casos, confiança, competência observada, validade, limitações, última confirmação e decisões que pode influenciar.

## Três horizontes de aprendizado

### Mensal

Válido apenas na competência corrente:

- meta específica do mês;
- dias úteis restantes;
- ações em andamento;
- produção pendente;
- ritmo observado;
- impedimentos temporários.

Ao fechar o mês, vira histórico e não é carregado automaticamente como verdade para a competência seguinte.

### Recorrente

Pode apoiar meses futuros quando houver amostra suficiente:

- tempo observado de reconhecimento por indicador;
- esforço típico por tipo de ação;
- dependências frequentes;
- estratégias repetidamente eficazes ou ineficazes;
- diferença histórica entre cenário e reconhecimento.

### Estratégico

Exige evidência mais forte e, quando material, confirmação de Rafael:

- metas cronicamente baixas;
- comportamentos repetitivos e concentração;
- caminhos sistematicamente ignorados;
- novas formas de atacar uma meta;
- mudança duradoura no funcionamento da carteira ou do trabalho.

## Início com pouca amostra

Enquanto houver poucos registros:

- marcar inferências como `LOW_SAMPLE`;
- um único resultado não vira regra;
- aprender primeiro por meta e tipo de ação;
- separar preferência declarada, comportamento observado e resultado comprovado;
- não declarar correlação como causa;
- propor experiências pequenas e mensuráveis;
- elevar confiança apenas com repetição e diversidade;
- permitir correção explícita de Rafael.

Aprender preferências não significa obedecê-las automaticamente. O histórico também serve para revelar pontos cegos, formular contrapontos e testar estratégias diferentes.

## Limites e aceite

- aprendizado não altera manual, piso, faixa, peso, teto ou fórmula;
- hipótese nunca é promovida silenciosamente a fato;
- ausência no relatório não prova fracasso sem considerar data-base e latência;
- itens pendentes não contam como reconhecidos;
- estornos permanecem visíveis;
- Rafael não é penalizado por rejeitar recomendação;
- relatório semanal é reproduzível a partir dos eventos;
- aprendizado mensal não contamina automaticamente o mês seguinte;
- amostra pequena nunca é generalizada para todas as metas;
- promoção, aposentadoria e uso de aprendizado ficam auditáveis.
