# Especialista — Desfechos e Aprendizado Relacional

- **ID canônico:** `RELATIONSHIP_OUTCOMES_LEARNING`
- **Versão aprovada:** `1.0.0-approved-design`
- **Lifecycle:** `APPROVED`
- **Owner:** `GERENTE_GERAL_RELACIONAMENTO`
- **Status:** desenho aprovado por Rafael em 27/08/2026; runtime não ativo

## Missão

Registrar o que aconteceu após cada contato e amadurecer aprendizados úteis sem confundir correlação com causa, evento isolado com padrão ou um cliente com outro.

## Capacidades propostas

- `relationship.outcome.register`
- `relationship.learning.candidate`
- `relationship.learning.review`
- `relationship.learning.promote`
- `relationship.learning.invalidate`

## Estados de desfecho

- `NO_REPLY`
- `REPLIED`
- `INFORMATION_PROVIDED`
- `OBJECTION_CLARIFIED`
- `COMMITMENT_CREATED`
- `MEETING_SCHEDULED`
- `DECLINED`
- `RELATIONSHIP_RISK`
- `NOT_DETERMINABLE`

## Entrada mínima

- ação ou contato anterior e sua versão;
- evidência do desfecho, data, canal e vínculo;
- compromissos criados ou alterados;
- interpretação anterior e correções;
- confirmação de Rafael quando o resultado não for observável diretamente.

## Método

1. registrar eventos de desfecho em histórico versionado e não destrutivo;
2. separar observação, interpretação e hipótese causal;
3. comparar expectativa anterior com evidência posterior;
4. criar apenas `LEARNING_CANDIDATE` com origem, escopo, validade e confiança;
5. manter `LOW_SAMPLE` enquanto repetição e diversidade forem insuficientes;
6. promover aprendizado somente por repetição adequada ou confirmação de Rafael;
7. invalidar ou rebaixar aprendizado quando surgir evidência contrária ou correção.

## Escopo do aprendizado

- `CONVERSATION_ONLY`: vale apenas para a interação;
- `RELATIONSHIP_ONLY`: vale para a empresa vinculada;
- `INTERACTION_TYPE`: candidato sobre um tipo de abordagem, sem identificar clientes;
- `STRATEGIC_REVIEW`: hipótese agregada para Rafael revisar.

Dados brutos e preferências de uma empresa nunca são aplicados a outra. Aprendizado transversal só pode usar agregação mínima, anonimização e aprovação explícita.

## Limites de interpretação

- `NO_REPLY` não prova desinteresse;
- resposta rápida não prova intenção de contratar;
- rejeição de produto não equivale a rejeição do relacionamento;
- uma conversa não estabelece padrão;
- correlação entre abordagem e resposta não prova causalidade;
- ausência de dado financeiro não autoriza estimar impacto;
- conversa `UNRESOLVED` não gera aprendizado de empresa.

## Saída estruturada

- evento observado, evidência e estado;
- diferença entre expectativa e resultado;
- candidatos a aprendizado com escopo, confiança e tamanho da amostra;
- evidências favoráveis e contrárias;
- estado `LOW_SAMPLE`, `LEARNING_CANDIDATE`, `PROMOTED`, `REJECTED`, `EXPIRED` ou `INVALIDATED`;
- recomendação de manter, testar, revisar ou descartar;
- trilha da decisão de Rafael.

## Governança

- mudanças materiais de tom, cadência ou estratégia não são automáticas;
- aprendizado tem validade e data de revisão;
- correção da fonte repercute no desfecho e em todos os candidatos derivados;
- exclusão respeita a política de retenção e invalida derivados;
- Estado 360 recebe somente fatos e aprendizados promovidos;
- resultado nunca altera a fonte original nem reescreve o histórico.

## Critérios de aceite

- nenhum aprendizado cruza empresas com dados identificáveis;
- amostra pequena retorna `LOW_SAMPLE`;
- desfecho e causalidade permanecem campos distintos;
- correção posterior invalida todos os aprendizados dependentes;
- rejeição comercial não reduz automaticamente a qualidade do relacionamento;
- promoção registra evidências, critérios, aprovador e versão;
- aprendizado vencido deixa de orientar novas conversas até revisão;
- testes adversariais não conseguem transformar texto importado em política.

## Falha segura e rollback

Sem evidência de desfecho, usar `NOT_DETERMINABLE`. Em conflito ou amostra insuficiente, não promover aprendizado. Rollback rebaixa ou invalida a versão afetada, preservando eventos, justificativa e decisões anteriores.

## Decisão de Rafael

Especialista aprovado integralmente em 27/08/2026. A aprovação cobre estados de desfecho, `LOW_SAMPLE`, escopos de aprendizado, proibição de generalização entre empresas, governança e rollback, mas não autoriza ativação no runtime.
