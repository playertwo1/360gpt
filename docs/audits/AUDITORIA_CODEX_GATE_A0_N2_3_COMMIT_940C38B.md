# AUDITORIA TÉCNICA E DE CONFORMIDADE — GATES A0 E N2.3

**Projeto:** Diretor 360  
**Repositório:** `playertwo1/360gpt`  
**Branch auditada:** `main`  
**Commit auditado:** `940c38b7d887940854cc7ba9add649201edb6437`  
**Versão declarada:** `6.0.0-gate-n2.3-flywheel-approved`  
**Data da auditoria:** 02/09/2026 — America/Sao_Paulo  
**Auditor:** Codex  
**Tipo:** auditoria independente de código, runtime, persistência, testes e documentação  
**Resultado:** **REPROVADO PARA HOMOLOGAÇÃO DOS GATES A0 E N2.3**  
**Estado deste documento:** aberto para correção pelo Antigravity e posterior reauditoria pelo Codex

---

## 1. Objetivo deste documento

Este dossiê registra, de forma reproduzível e acionável, tudo que foi encontrado na auditoria do Marco A0 e do Marco N2.3. Ele deve ser entregue ao Antigravity para:

1. explicar tecnicamente cada divergência;
2. corrigir as falhas confirmadas;
3. apresentar evidências reais das correções;
4. não substituir implementação por alterações apenas documentais;
5. preparar o repositório e o runtime para uma nova auditoria independente.

Este documento não autoriza a exclusão de dados, a publicação do site, a ativação de efeitos externos nem a promoção automática de conhecimento. Correções com risco de perda de dados devem ser precedidas por backup verificável.

---

## 2. Resumo executivo

O desenho conceitual do flywheel é promissor e os cinco motores possuem funções puras que passam nos testes unitários existentes. O worker Python antigo também foi reduzido corretamente a um stub aposentado.

Entretanto, as declarações de conclusão presentes em `ROADMAP.md`, `PROJECT_STATE.md`, `status.md`, `CHANGELOG.md`, na política canônica e no pacote de auditoria anterior não refletem integralmente o código e o runtime observados.

As conclusões principais são:

- o Gate A0 não possui zero violações: comandos, esclarecimentos, mutações de estado e respostas continuam sendo executados fora do n8n;
- as rotas `/api/bridge/*` continuam versionadas, compiladas e com lógica operacional;
- o teste do Gate A0 lê declarações do próprio YAML, mas não detecta o runtime paralelo existente;
- os cinco motores do N2.3 aparecem apenas nos próprios arquivos e testes; não estão conectados ao n8n ou ao PostgreSQL operacional;
- as quatro tabelas existem no banco local, mas foram criadas fora de migration versionada, estão vazias e não possuem controles suficientes de governança;
- o WF-104 está ativo no banco do n8n, porém envia métricas, clientes e lições codificados diretamente no JSON do workflow, sem consultar as tabelas do flywheel;
- a suíte denominada E2E é uma simulação em memória e fabrica os nove resultados úteis usados para produzir DUR de 90%; não executa n8n, PostgreSQL, Evidence Graph ou aprovação real;
- regras semânticas nascem `PROMOTED` por padrão, contrariando o ciclo obrigatório de aprovação por Rafael;
- dados dinâmicos são inseridos no contexto como “PRIORIDADE MÁXIMA”, criando risco de ultrapassar políticas imutáveis e de prompt injection;
- exemplares comerciais estão codificados no JavaScript, contrariando a separação Prompt-as-Code / Data-as-State;
- o DUR está sendo usado para aumentar `model_confidence`, embora aceitação/utilidade de uma mensagem não seja evidência de correção factual;
- a documentação possui contradições de versão, estado e próxima tarefa.

Consequentemente, a implementação pode ser considerada um **protótipo parcial do N2.3**, mas não um flywheel operacional homologado.

---

## 3. Escopo e fontes examinadas

### 3.1 Arquivos prioritários

- `AGENTS.md`
- `ROADMAP.md`, principalmente a Seção 11.1
- `PROJECT_STATE.md`
- `status.md`
- `CHANGELOG.md`
- `docs/ONDE_ESTAMOS_E_PROXIMOS_PASSOS.md`
- `docs/audits/AUDITORIA_ENTREGA_CONTINUA_E_FLYWHEEL_CODEX.md`
- `policies/n8n-canonical-architecture.yaml`
- `app/api/ingest/telegram/route.ts`
- `lib/telegram-runtime.ts`
- todas as rotas em `app/api/bridge/`
- `engines/knowledge/semantic-memory-engine.mjs`
- `engines/knowledge/golden-exemplars-engine.mjs`
- `engines/feedback/decision-utility-engine.mjs`
- `engines/orchestration/reflexion-engine.mjs`
- `engines/security/negative-memory-engine.mjs`
- `n8n/workflows/wf-104-weekly-reflexion.json`
- `tests/flywheel-learning-gate-n2-3.test.mjs`
- testes unitários dos cinco motores
- `scripts/test-n8n-canonical-architecture.mjs`
- `scripts/test-local-core-architecture.mjs`
- testes P0 do Telegram

### 3.2 Runtime examinado

- Docker local;
- container `visao-360-n8n-1`;
- container `visao-360-postgres-1`;
- banco `n8n` para confirmar o estado real do WF-104;
- banco `visao360` para confirmar tabelas, colunas, índices, constraints e contagens.

### 3.3 Validações executadas

- confirmação de que `HEAD` e `origin/main` apontavam para `940c38b7d887940854cc7ba9add649201edb6437`;
- `npm run test:local-core`;
- `npm run test:p0`;
- cinco testes unitários do N2.3;
- `node tests/flywheel-learning-gate-n2-3.test.mjs`;
- `npm run lint`;
- `npm run build`;
- inspeção dos workflows cadastrados/ativos no n8n;
- consultas somente leitura aos schemas e metadados dos bancos PostgreSQL.

---

## 4. Resultado por pergunta de auditoria

### 4.1 O Gate A0 atende 100% ao runtime exclusivo no n8n Docker?

**Não.** Existem caminhos paralelos de negócio e estado no site/API, apesar de a política declarar zero exceções e zero violações.

### 4.2 O aprendizado respeita estritamente código/prompt imutável e contexto dinâmico?

**Não integralmente.** Os motores não escrevem fisicamente em arquivos de System Prompt, mas há auto-promoção por padrão, exemplares codificados no JavaScript e contexto não confiável rotulado como prioridade máxima.

### 4.3 Decision Utility, Memória Negativa e Exemplares Dourados estão integrados e auditáveis?

**Não.** Atualmente são módulos isolados exercitados por testes em memória. O WF-104 ativo não os utiliza nem consulta as quatro tabelas.

### 4.4 Veredito

**REPROVADO para manter as classificações `CANONICAL_LOCAL_ACTIVE`, `ZERO VIOLAÇÕES` e `GATE N2.3 HOMOLOGADO`.**

O veredito não significa descartar o trabalho. Significa reabrir os Gates A0 e N2.3, corrigir os bloqueadores e apresentar evidência operacional verdadeira.

---

## 5. Achados detalhados — Gate A0

### A0-01 — Entrada Telegram executa lógica de negócio fora do n8n

**Severidade:** CRÍTICA  
**Status:** confirmado

#### Evidência

`app/api/ingest/telegram/route.ts`, linhas 122–128, ainda chama diretamente:

- `handleClarificationReply`;
- `handleTelegramCommand`;
- `handleConversationalText`.

Essas chamadas acontecem no site/API antes ou sem a execução canônica do workflow n8n.

#### Violação

Contraria:

- `AGENTS.md`, regra canônica de execução n8n;
- `policies/n8n-canonical-architecture.yaml`, que permite ao site apenas autenticar, autorizar o canal, aplicar rate limit, deduplicar tecnicamente, enfileirar envelope e exibir;
- a proibição expressa de comandos de negócio, roteamento, prompt, cálculo, esclarecimento e parecer fora do n8n.

#### Correção exigida

Reduzir o endpoint Telegram a:

1. autenticação/validação do webhook;
2. allowlist e controles técnicos de canal;
3. deduplicação técnica atômica por `update_id`;
4. criação do envelope normalizado;
5. enfileiramento durável no PostgreSQL local através do adaptador permitido;
6. resposta HTTP técnica imediata.

Todo comando, conversa, dúvida, correção, aprovação, exclusão, reprocessamento, cálculo e resposta deve ocorrer em workflow n8n versionado.

#### Aceite

- nenhuma importação de `handleClarificationReply`, `handleTelegramCommand` ou `handleConversationalText` no endpoint;
- teste estrutural que falha se qualquer handler de negócio voltar a ser chamado pelo site;
- teste E2E mostrando que `/comandos` entra na fila e só recebe resposta após execução do n8n.

---

### A0-02 — `lib/telegram-runtime.ts` continua sendo runtime de negócio

**Severidade:** CRÍTICA  
**Status:** confirmado

#### Evidência

O arquivo ainda:

- cria e confirma operações críticas;
- aprova e revoga conhecimento;
- aprova, rejeita e revoga diretrizes;
- cancela, reabre e exclui documentos;
- altera `agent_runs` e outras tabelas;
- interpreta respostas de esclarecimento;
- implementa `/status`, `/progresso`, `/pendencias`, `/meusdados`, `/privacidade`, `/ultimo`, `/pobj`, `/historico` e outros comandos;
- importa dinamicamente o catálogo avançado de comandos;
- envia respostas diretamente ao Telegram.

#### Violação

A política classifica esse arquivo como `REDUCED_TO_CHANNEL_ADAPTER`, mas seu conteúdo real é um controlador de negócio e estado.

#### Correção exigida

- manter fora do n8n somente funções estritamente técnicas de serialização e entrega;
- mover toda decisão para WF-100/WF-101 ou subworkflows canônicos chamados por eles;
- impedir que o adaptador escreva tabelas de negócio;
- preferir outbox transacional e entrega idempotente.

#### Aceite

- adaptador sem SQL de negócio;
- adaptador sem parser de comandos;
- adaptador sem aprovação/revogação/exclusão;
- cobertura automatizada que falha se essas responsabilidades retornarem.

---

### A0-03 — Rotas `/api/bridge/*` não foram descontinuadas

**Severidade:** CRÍTICA  
**Status:** confirmado

#### Evidência

Foram encontrados 16 arquivos versionados sob `app/api/bridge/`, incluindo:

- `claim`;
- `complete`;
- `fail`;
- `file`;
- `clarifications/*`;
- `directives/*`;
- `inbound/*`;
- `knowledge/apply`;
- `errors/report`;
- `telegram/action`;
- `synthetic-enqueue`.

O build lista essas rotas como endpoints da aplicação. Algumas delas persistem Estado 360, operam leases, processam comandos, registram diretrizes e enviam mensagens Telegram.

#### Violação

Contraria a declaração `RETIRED_FROZEN` e a afirmação documental de que as rotas foram descontinuadas.

#### Correção exigida

O Antigravity deve escolher e documentar uma das opções compatíveis:

1. remover integralmente as rotas do build; ou
2. reduzir uma pequena superfície a adaptador técnico, renomeando-a e provando que não executa negócio, estado decisório ou efeitos externos.

Não é suficiente manter as rotas e apenas mudar o texto do YAML.

#### Aceite

- `npm run build` não lista rotas de ponte operacional aposentadas;
- busca estática não encontra handlers de negócio nelas;
- n8n usa PostgreSQL local e serviços subordinados, sem depender do Sites para processar casos reais.

---

### A0-04 — Teste canônico é autorreferente e produz falso positivo

**Severidade:** ALTA  
**Status:** confirmado

#### Evidência

`scripts/test-n8n-canonical-architecture.mjs` verifica somente se o YAML contém:

- `legacy_exceptions_count: 0`;
- `gate_a0_status: CANONICAL_LOCAL_ACTIVE`.

Depois imprime os mesmos valores. O teste não inspeciona as chamadas de negócio do endpoint Telegram, o conteúdo real do `telegram-runtime`, as rotas compiladas nem os workflows ativos no banco do n8n.

O teste P0 agrava a inconsistência porque exige que `handleConversationalText` continue integrado a `lib/telegram-runtime.ts` e ao endpoint hospedado.

#### Correção exigida

Criar teste negativo/estrutural que:

- examine imports e chamadas do endpoint de entrada;
- proíba SQL e decisões de negócio no adaptador de canal;
- verifique rotas compiladas;
- consulte workflows ativos no banco do n8n;
- compare runtime, repositório, política e AGENTS;
- falhe quando um workflow ativo não estiver no inventário canônico.

#### Aceite

O teste deve falhar no commit `940c38b` sem depender da alteração manual do YAML.

---

### A0-05 — Topologia canônica está contraditória

**Severidade:** ALTA  
**Status:** confirmado

#### Evidência

- `AGENTS.md` define somente WF-100, WF-101 e WF-103 como topologia mínima e incorpora a função do WF-102 ao WF-101.
- A política lista WF-100, WF-101, WF-102 e WF-103 como canônicos e também lista WF-102 como incorporado.
- O WF-104 está ativo, mas não consta no inventário canônico da política.

#### Correção exigida

Definir uma única topologia oficial e sincronizar:

- AGENTS;
- política;
- inventário de workflows;
- runtime do n8n;
- ROADMAP;
- testes.

#### Aceite

Não pode existir workflow operacional ativo sem status e finalidade no inventário canônico versionado.

---

### A0-06 — Worker Python foi aposentado corretamente, mas permanece como stub no caminho antigo

**Severidade:** INFORMATIVA  
**Status:** parcialmente correto

`core/telegram_bot_worker.py` agora apenas informa que foi aposentado e encerra. Isso é aceitável como proteção temporária contra chamadas antigas, desde que:

- nenhum serviço, script, agendamento ou compose ainda o invoque;
- o teste confirme ausência de referências executáveis;
- exista plano de remoção do stub após a janela de compatibilidade.

---

## 6. Achados detalhados — Marco N2.3

### N23-01 — Motores não estão integrados ao runtime

**Severidade:** CRÍTICA  
**Status:** confirmado

#### Evidência

A busca por imports e chamadas mostrou os cinco motores apenas em:

- seus próprios arquivos;
- testes unitários;
- `tests/flywheel-learning-gate-n2-3.test.mjs`;
- documentação.

Nenhum workflow ou adaptador operacional invoca o conjunto real dos motores.

#### Impacto

O sistema em produção não executa o flywheel descrito. Ter funções testadas não equivale a ter capacidade integrada.

#### Correção exigida

Implementar no n8n, com contratos versionados:

1. captura de desfecho real;
2. persistência em `decision_outcomes`;
3. reflexão assíncrona sobre dados reais autorizados;
4. criação de lições como `CANDIDATE`;
5. aprovação autenticada de Rafael;
6. promoção transacional;
7. recuperação de memória semântica, negativa e exemplar;
8. montagem de Context Packet subordinado às políticas;
9. registro das memórias aplicadas em cada execução;
10. bloqueio preventivo auditável;
11. resultado e auditoria no Evidence Graph.

#### Aceite

Um teste de integração deve comprovar o caminho completo no n8n e banco real de teste, sem arrays locais substituindo persistência.

---

### N23-02 — WF-104 ativo envia conteúdo fictício/hard-coded

**Severidade:** CRÍTICA  
**Status:** confirmado no repositório e no banco do n8n

#### Evidência

O banco `n8n` confirmou `active = true` para:

`9eb8e86a-84b8-4aa9-97e4-360000000104 | WF-104 — Reflexion Engine Semanal 360`

O workflow instalado contém:

- métricas fixas de 10 propostas, 9 úteis e DUR de 90%;
- lições fixas sobre Renata, Forja Sul e Dr. Arnaldo;
- `chat_id` fixo;
- nenhum nó PostgreSQL;
- nenhuma referência a `decision_outcomes`;
- envio direto pelo Telegram.

Consulta ao banco do n8n confirmou:

- `hardcoded_metrics = true`;
- `hardcoded_lesson = true`;
- `reads_outcomes = false`;
- `has_postgres_node = false`.

#### Impacto

O workflow pode enviar ao Rafael um relatório sintético apresentado como balanço semanal real.

#### Correção exigida

1. Desativar o WF-104 atual antes de qualquer sexta-feira operacional.
2. Substituir dados fixos por consultas parametrizadas e read-only.
3. Não enviar card quando não houver amostra mínima real; apresentar “amostra insuficiente”.
4. Nunca gerar aprovação para IDs que não existam no banco.
5. Aplicar outbox/idempotência para a mensagem.
6. Separar claramente dados sintéticos de testes do runtime real.

#### Aceite

- nenhum nome, número, lição ou DUR hard-coded no workflow;
- execução sem dados retorna estado vazio seguro;
- execução com fixtures isoladas calcula o resultado esperado;
- execução com dados reais usa somente registros persistidos e autorizados;
- o card referencia IDs reais de candidatos.

---

### N23-03 — Agendamento documentado e expressão cron divergem

**Severidade:** MÉDIA  
**Status:** confirmado

#### Evidência

O nó se chama “Disparo Sexta-feira 18h00”, mas usa `0 21 * * 5`. O container possui `GENERIC_TIMEZONE=America/Sao_Paulo` e `TZ=America/Sao_Paulo`.

#### Correção exigida

Definir explicitamente se a expressão é interpretada em UTC ou no timezone do workflow/instância e criar teste para o próximo horário calculado. Não confiar apenas no nome do nó.

---

### N23-04 — Tabelas existem, mas não há migration versionada

**Severidade:** CRÍTICA  
**Status:** confirmado

#### Evidência

As tabelas existem no PostgreSQL `visao360`:

- `promoted_knowledge`;
- `golden_exemplars`;
- `decision_outcomes`;
- `negative_memory`.

Porém, não foi encontrada migration SQL versionada que contenha seus `CREATE TABLE`.

#### Impacto

- ambiente não reproduzível;
- backup/restauração e instalação nova podem perder o flywheel;
- alterações manuais não ficam ligadas ao commit;
- não existe rollback versionado de schema.

#### Correção exigida

Criar migration idempotente, versionada e testada, incluindo upgrade e rollback seguro quando aplicável.

#### Aceite

- banco vazio pode ser reconstruído apenas pelo repositório;
- schema resultante coincide com o schema esperado;
- migration reaplicada não duplica objetos;
- teste em banco descartável comprova instalação e restauração.

---

### N23-05 — Constraints e segregação insuficientes

**Severidade:** CRÍTICA  
**Status:** confirmado

#### Evidência

As quatro tabelas possuem apenas constraints de chave primária. Não existem constraints para:

- status permitido;
- escopo permitido;
- confiança entre 0 e 1;
- nota válida do exemplar;
- tipos válidos de desfecho;
- unicidade/idempotência;
- validade temporal coerente;
- tenant/owner;
- aprovação humana;
- referência obrigatória de evidência;
- vínculo entre desfecho, candidato, promoção e aplicação.

Além disso, no momento da auditoria as quatro tabelas possuíam zero linhas.

#### Correção exigida

Adicionar no mínimo:

- `tenant_id` e/ou `owner_id` obrigatório;
- `status` fechado por CHECK ou enum controlado;
- `created_by`, `approved_by`, `approved_at`, `revoked_by`, `revoked_at`;
- `source_event_id`, `evidence_node_id`, `correlation_id` e versão;
- hash semântico/idempotency key único por tenant e escopo;
- `valid_from < valid_to`;
- CHECK de confiança e rating;
- índices incluindo tenant;
- trilha append-only de transições/aplicações;
- política de retenção e revogação.

#### Aceite

Testes de banco devem provar que inserts inválidos, promoção sem aprovação e colisões cross-tenant são rejeitados.

---

### N23-06 — Contrato dos motores é incompatível com o schema do banco

**Severidade:** ALTA  
**Status:** confirmado

#### Evidência

- os motores geram IDs como `rule-*`, `outcome-*` e `neg-*`, mas o banco usa UUID;
- `decision-utility-engine.mjs` retorna `proposed_text` e `final_text`, enquanto a tabela usa `proposed_payload` e `final_payload` JSONB;
- exemplares canônicos usam IDs como `exemplar-01`, também incompatíveis com UUID se persistidos diretamente;
- não existe adaptador explícito que faça a tradução e valide contratos.

#### Correção exigida

Criar contratos JSON Schema versionados e adaptadores de persistência. IDs devem ser UUID ou o banco deve declarar conscientemente outro tipo. A conversão não pode ser implícita.

---

### N23-07 — Auto-promoção viola aprovação soberana de Rafael

**Severidade:** CRÍTICA  
**Status:** confirmado

#### Evidência

- `createSemanticRule()` usa `status = PROMOTED` como padrão;
- a coluna `promoted_knowledge.status` no banco também usa `DEFAULT 'PROMOTED'`;
- o teste do Gate cria uma regra sem informar status e exige que ela já esteja promovida.

#### Violação

Contraria o ciclo do AGENTS:

`OBSERVED → INTERPRETED → LEARNING_CANDIDATE → VALIDATED → OWNER_APPROVED → PROMOTED`.

#### Correção exigida

- padrão obrigatório `CANDIDATE`;
- promoção somente por comando/evento autenticado de Rafael;
- transação com versão esperada, idempotência e auditoria;
- o processo que propõe não pode aprovar a própria regra;
- revogação bloqueia usos futuros sem apagar histórico.

#### Aceite

Teste deve comprovar que nenhuma chamada sem aprovação consegue produzir regra `PROMOTED`.

---

### N23-08 — Context Packet pode ultrapassar política imutável

**Severidade:** CRÍTICA  
**Status:** confirmado

#### Evidência

`buildContextPacket()` concatena `learned_rule` em texto livre e introduz o bloco como “PRIORIDADE MÁXIMA”. Não há:

- escaping ou separação robusta entre dados e instruções;
- limitação de tamanho;
- deduplicação;
- classificação de risco;
- precedência inferior explícita;
- validação contra prompt injection;
- referência obrigatória de origem/aprovação.

#### Correção exigida

- usar payload JSON estruturado validado por schema;
- inserir memórias depois das políticas imutáveis e marcá-las como dados subordinados;
- proibir comandos, mudança de papel, URLs suspeitas, segredos e instruções de ferramenta dentro de regras aprendidas;
- registrar quais IDs/versões foram injetados;
- limitar quantidade e tamanho por escopo;
- aplicar DLP e sanitização.

#### Aceite

Testes adversariais devem demonstrar que uma memória contendo “ignore as regras anteriores” não altera política, permissão ou comportamento seguro.

---

### N23-09 — Exemplares Dourados estão em código e fallback pode cruzar contexto

**Severidade:** ALTA  
**Status:** confirmado

#### Evidência

`golden-exemplars-engine.mjs` contém nomes, contatos, valores e textos comerciais diretamente em `CANONICAL_EXEMPLARS`.

Quando não existe correspondência adequada, o motor retorna `exemplars[0]`, podendo injetar exemplo hospitalar em setor/objetivo não relacionado.

#### Correção exigida

- remover exemplares operacionais do código;
- deixar em código apenas fixtures inequivocamente sintéticas sob `test-data`;
- recuperar somente exemplar `ACTIVE`, nota 5, tenant correto, aprovado por Rafael e compatível com setor, objetivo e canal;
- retornar `null` se não houver correspondência segura;
- nunca reutilizar nomes/valores do exemplar como fatos do cliente atual.

#### Aceite

Teste de “sem correspondência” deve retornar ausência de exemplar, não o primeiro registro.

---

### N23-10 — DUR está sendo confundido com confiança factual

**Severidade:** CRÍTICA  
**Status:** confirmado

#### Evidência

`calibrateConfidenceScore()` aumenta `baseConfidence` em 0,15 quando o DUR é alto e reduz quando é baixo.

O teste transforma 0,80 em 0,95 com base em nove decisões classificadas como úteis.

#### Problema conceitual

DUR mede utilidade/aceitação da proposta. Não mede:

- correção dos números;
- autoridade ou atualidade da fonte;
- completude;
- elegibilidade;
- risco;
- calibração estatística do modelo.

Uma mensagem pode ser aceita e ainda conter erro factual; uma recomendação correta pode ser recusada por preferência pessoal.

#### Correção exigida

- manter DUR como métrica separada de produto/experiência;
- não alterar `model_confidence` por DUR;
- usar perfis de calibração por domínio, intenção, tarefa, modelo e prompt conforme AGENTS;
- usar DUR para priorizar revisão de estilo, utilidade e aderência, não para ampliar autonomia.

#### Aceite

Teste deve provar que mudar o DUR não altera confiança factual nem autorização.

---

### N23-11 — Cálculo do DUR possui casos enganosos

**Severidade:** ALTA  
**Status:** confirmado

#### Evidência

- conjunto vazio retorna `utility_rate_pct = 100` e `meets_target = true`;
- qualquer edição é classificada integralmente como útil;
- tipos desconhecidos permanecem no denominador sem erro explícito;
- não há janela temporal, domínio, amostra mínima ou intervalo de confiança;
- o “diff semântico” é, na prática, comparação de contagem de palavras.

#### Correção exigida

- conjunto vazio deve retornar `NOT_ENOUGH_DATA`, taxa `null` e gate não aprovado;
- definir amostra mínima;
- validar tipos;
- separar edição leve, edição material e correção factual;
- segmentar por domínio/tarefa/modelo/prompt;
- calcular janela temporal e apresentar tamanho da amostra;
- renomear o mecanismo atual como delta léxico até existir comparação semântica validada.

---

### N23-12 — Reflexion Engine promove lições frágeis

**Severidade:** ALTA  
**Status:** confirmado

#### Evidência

O motor agrupa `feedback_note` por igualdade literal e recomenda promoção se:

- a nota se repetir duas vezes; ou
- contiver simplesmente “preferir”; ou
- contiver “não”.

Isso permite que uma observação única contendo “não” seja recomendada como diretriz permanente. Não existe agrupamento semântico robusto, validação de escopo, detecção de contradição ou revisão de evidência.

#### Correção exigida

- sempre produzir candidato, nunca promoção;
- exigir escopo, evidência, recorrência e confiança verificável;
- tratar negação linguisticamente, não por substring;
- detectar regras conflitantes e superadas;
- exigir aprovação explícita individual ou em lote com relação dos IDs reais;
- impedir `/aprovar_todas` genérico sem snapshot/lista/hash do lote.

---

### N23-13 — Memória Negativa não possui lifecycle, vigência ou aprovação

**Severidade:** CRÍTICA  
**Status:** confirmado

#### Evidência

`recordNegativeDecision()` cria uma decisão imediatamente utilizável, sem:

- status;
- tenant/owner;
- validade;
- aprovador;
- versão;
- hash de deduplicação;
- política de revogação;
- vínculo obrigatório de evidência.

O filtro usa apenas correspondência de entidade, tipo e substring normalizada.

#### Impacto

Pode bloquear proposta correta por falso positivo ou deixar passar paráfrase do item vetado. Também não distingue veto global, preferência temporária, recusa pontual ou proibição normativa.

#### Correção exigida

- lifecycle `CANDIDATE | ACTIVE | SUPERSEDED | REVOKED | EXPIRED`;
- escopo e validade explícitos;
- evidência e aprovação;
- correspondência determinística por catálogo/ID quando disponível;
- revisão manual em ambiguidade;
- nunca apresentar uma preferência comercial como impedimento normativo.

---

### N23-14 — Evidence Graph declarado não foi implementado pelos novos motores

**Severidade:** CRÍTICA  
**Status:** confirmado

#### Evidência

O ROADMAP afirma que o motor de memória negativa cria nós `CONTRADICTS` e `SUPERSEDES`. O código apenas gera um campo `evidence_node_id`; não escreve nós ou arestas, não calcula hash e não verifica existência do nó.

Também não há trilha ligando:

`decision_outcome → reflexão → candidato → aprovação → memória promovida → aplicação → nova recomendação`.

#### Correção exigida

Implementar essa cadeia como eventos append-only, com IDs, hashes, ator, horário, versão e causalidade.

---

### N23-15 — IDs aleatórios não são idempotentes nem suficientemente auditáveis

**Severidade:** ALTA  
**Status:** confirmado

Os motores usam `Date.now()` com `Math.random()` para IDs. Isso:

- não garante UUID compatível;
- não impede duplicação em retry;
- não representa o mesmo evento lógico;
- dificulta reconciliação e auditoria.

Usar UUID e `idempotency_key` determinística baseada em tenant, evento, finalidade, escopo e versão.

---

### N23-16 — A suíte “E2E” não é E2E

**Severidade:** CRÍTICA  
**Status:** confirmado

#### Evidência

`tests/flywheel-learning-gate-n2-3.test.mjs`:

- cria `negativeDb`, `semanticDb` e `outcomesDb` como arrays;
- cria uma recusa e nove aceitações/edições simuladas;
- calcula DUR de 90% sobre os próprios dados fabricados;
- promove diretamente uma regra pelo default `PROMOTED`;
- não acessa PostgreSQL;
- não executa workflow n8n;
- não confirma autorização de Rafael;
- não testa o WF-104 instalado;
- não testa persistência/restart;
- não testa Evidence Graph;
- não testa isolamento de tenant;
- não testa idempotência transacional;
- não testa injeção maliciosa.

#### Correção exigida

Renomear o teste atual para integração em memória e criar um E2E verdadeiro em ambiente isolado.

#### Aceite E2E mínimo

1. subir banco descartável com migrations;
2. importar workflows versionados;
3. inserir desfechos sintéticos explicitamente marcados;
4. executar WF-104 sem Telegram externo;
5. gerar candidatos reais no banco;
6. comprovar que continuam inativos;
7. simular aprovação autenticada de Rafael;
8. recuperar a memória promovida na próxima execução;
9. bloquear reincidência pela memória negativa;
10. recuperar exemplar compatível;
11. registrar todos os eventos e aplicações;
12. repetir/retry sem duplicação;
13. reiniciar serviços e comprovar persistência;
14. provar que System Prompts e Git permaneceram intactos.

---

### N23-17 — Falta atualização do threat model e dos artefatos de governança

**Severidade:** ALTA  
**Status:** confirmado pelo escopo do commit

O AGENTS exige atualização do threat model quando surge nova memória, fluxo de aprovação ou efeito externo. O commit adicionou todos esses elementos, mas não alterou `security/THREAT_MODEL.md`, contrato de schema, registro de fonte, política de retenção ou manifesto de release.

#### Correção exigida

Atualizar, no mínimo:

- threat model;
- classificação dos dados nas quatro tabelas;
- retenção e descarte;
- modelo de autorização;
- risco de prompt injection persistente;
- risco de envenenamento de memória;
- risco de cross-tenant;
- plano de revogação e propagação;
- rollback do flywheel;
- inventário e manifesto da release.

---

## 7. Inconsistências documentais

### DOC-01 — Auditoria anterior é autoatestação, não evidência independente

`docs/audits/AUDITORIA_ENTREGA_CONTINUA_E_FLYWHEEL_CODEX.md` declara “zero violações” com base em testes que não inspecionam as violações descritas neste documento.

### DOC-02 — Versão incorreta do AGENTS

O pacote anterior declara conformidade com `AGENTS.md v2.1`, mas o repositório auditado possui `AGENTS.md v2.2` com regra n8n exclusiva mais restritiva.

### DOC-03 — Estado contraditório

`docs/ONDE_ESTAMOS_E_PROXIMOS_PASSOS.md` declara N2.3 aprovado no topo, mas depois o apresenta como próximo marco e informa N2.3.1 como próxima tarefa.

`status.md` também declara N2.3 aprovado e, ao mesmo tempo, aponta N2.3/N2.3.1 como próximos.

### DOC-04 — ROADMAP marca implementações inexistentes como concluídas

Exemplos:

- persistência exclusiva no PostgreSQL, apesar de exemplares estarem em código;
- varredura do PostgreSQL pelo WF-104, apesar de ele não possuir consulta;
- criação de nós `CONTRADICTS` e `SUPERSEDES`, ausente no motor;
- três ciclos no banco, quando foram usados arrays em memória;
- 100% de aderência ao padrão, embora o teste valide apenas substrings.

### Correção documental exigida

Até a implementação ser corrigida:

- Gate A0: `REOPENED / BLOCKED`;
- N2.3: `PARTIAL_IMPLEMENTATION / NOT_HOMOLOGATED`;
- WF-104 hard-coded: `DISABLED_PENDING_REIMPLEMENTATION`;
- teste atual: `IN_MEMORY_INTEGRATION`, não E2E;
- DUR 90%: `SYNTHETIC_TEST_RESULT`, não métrica real de produção.

---

## 8. Pontos positivos preserváveis

Os seguintes elementos podem ser aproveitados:

- `core/telegram_bot_worker.py` foi reduzido a stub aposentado;
- os cinco motores possuem responsabilidades iniciais separadas;
- testes unitários básicos passam;
- lint não apresentou erros, apenas avisos;
- build foi concluído;
- containers de n8n e PostgreSQL estavam saudáveis;
- as tabelas e índices básicos existem;
- existe intenção explícita de não editar System Prompts;
- a separação conceitual entre Decision Utility, memória semântica, exemplos e memória negativa é válida;
- a aprovação soberana de Rafael está prevista no desenho, embora não esteja garantida pela implementação atual.

Esses pontos não devem ser removidos sem necessidade; devem ser integrados e endurecidos.

---

## 9. Plano de correção recomendado

### Bloco 0 — Contenção imediata

- [ ] Fazer backup verificável do banco `n8n` e `visao360`.
- [ ] Exportar o WF-104 instalado para comparação.
- [ ] Desativar o WF-104 hard-coded.
- [ ] Registrar por que foi desativado.
- [ ] Não apagar tabelas nem evidências existentes.

### Bloco 1 — Reabrir corretamente os gates

- [ ] Alterar estado documental de A0 para reaberto.
- [ ] Alterar N2.3 para implementação parcial.
- [ ] Remover a expressão “zero violações” enquanto A0-01 a A0-05 estiverem abertos.
- [ ] Classificar DUR 90% como resultado sintético.

### Bloco 2 — Concluir cutover A0 real

- [ ] Transformar ingestão hospedada em transporte técnico puro.
- [ ] Remover lógica de negócio do `telegram-runtime`.
- [ ] retirar/desativar as rotas bridge operacionais.
- [ ] Consolidar comandos, conversa, esclarecimentos e mutações no n8n.
- [ ] Definir topologia única WF-100/WF-101/WF-103 e subworkflows permitidos.
- [ ] Criar teste estrutural real do A0.

### Bloco 3 — Versionar persistência N2.3

- [ ] Criar migrations das quatro tabelas.
- [ ] Adicionar tenant, owner, lifecycle, aprovação, evidência e idempotência.
- [ ] Criar tabelas/eventos append-only de promoção, revogação e aplicação.
- [ ] Criar testes de constraints e isolamento.
- [ ] Testar restore em banco limpo.

### Bloco 4 — Corrigir os motores

- [ ] Semantic Memory: default `CANDIDATE`, validade completa, escopo seguro e Context Packet estruturado.
- [ ] Golden Exemplars: remover dados operacionais do código, eliminar fallback inseguro e exigir aprovação/compatibilidade.
- [ ] Decision Utility: separar utilidade de confiança, tratar amostra vazia e validar janela/amostra.
- [ ] Reflexion: trabalhar com registros reais, criar candidatos e nunca promover automaticamente.
- [ ] Negative Memory: lifecycle, vigência, evidência, aprovação, revogação e matching seguro.
- [ ] Usar UUID e idempotency key em todos os motores.
- [ ] Implementar vínculos reais no Evidence Graph.

### Bloco 5 — Reimplementar WF-104

- [ ] Consultar `decision_outcomes` no PostgreSQL.
- [ ] Aplicar janela semanal e amostra mínima.
- [ ] Calcular DUR por código/motor versionado, não por texto fixo.
- [ ] Persistir candidatos antes de enviar o card.
- [ ] Referenciar IDs reais.
- [ ] Usar outbox e entrega idempotente.
- [ ] Não enviar nada quando não houver dados suficientes, salvo aviso seguro autorizado.
- [ ] Corrigir e testar timezone.

### Bloco 6 — E2E verdadeiro

- [ ] Banco descartável criado por migrations.
- [ ] Workflows importados do Git.
- [ ] Eventos sintéticos claramente marcados.
- [ ] Execução real do n8n.
- [ ] Candidato persistido e inativo.
- [ ] Aprovação simulada com identidade de teste autorizada.
- [ ] Memória aplicada na execução seguinte.
- [ ] Memória negativa intercepta reincidência.
- [ ] Exemplar compatível é recuperado.
- [ ] Evidence Graph completo.
- [ ] Retry não duplica.
- [ ] Restart preserva estado.
- [ ] Nenhum efeito Telegram/site real durante teste.

### Bloco 7 — Regressão e documentação

- [ ] `npm run test:p0` atualizado para exigir o caminho n8n.
- [ ] `npm run test:local-core` detecta violações reais.
- [ ] testes unitários e E2E passam.
- [ ] lint sem erros; avisos novos justificados ou removidos.
- [ ] build aprovado e sem rotas bridge aposentadas.
- [ ] AGENTS, política, ROADMAP, PROJECT_STATE, status e CHANGELOG sincronizados.
- [ ] threat model e release manifest atualizados.
- [ ] novo pacote de evidências gerado sem autoafirmação circular.

---

## 10. Critérios obrigatórios para nova auditoria Codex

O Antigravity deve fornecer:

1. commit exato da correção;
2. lista completa de arquivos alterados;
3. migrations adicionadas;
4. export dos workflows efetivamente instalados;
5. lista de workflows ativos consultada no banco do n8n;
6. DDL e constraints das quatro tabelas;
7. contagens antes/depois, sem expor conteúdo sensível;
8. evidência de que WF-104 não contém métricas/clientes/lições fixas;
9. execução do E2E verdadeiro com IDs de correlação;
10. prova de que candidatos permanecem inativos até aprovação;
11. prova de que DUR não modifica confiança factual;
12. prova de proteção contra memória maliciosa/prompt injection;
13. prova de isolamento por tenant/owner;
14. prova de idempotência e recuperação de lease/retry;
15. diff dos arquivos de controle sincronizados;
16. plano e evidência de rollback;
17. declaração explícita de qualquer item não corrigido.

Não será aceito como evidência suficiente:

- apenas marcar checkboxes no ROADMAP;
- apenas alterar `legacy_exceptions_count` no YAML;
- teste que lê a própria declaração de sucesso;
- arrays em memória apresentados como banco real;
- saída hard-coded apresentada como cálculo;
- screenshot sem export ou query reproduzível;
- afirmação de “100% PASS” sem explicar o alcance dos testes.

---

## 11. Perguntas obrigatórias ao Antigravity

Responder uma a uma antes da reauditoria:

1. Por que a política declarou as rotas `/api/bridge/*` descontinuadas se elas continuam compiladas e operacionais?
2. Por que o endpoint Telegram ainda chama handlers de negócio diretamente?
3. Qual é a topologia canônica final: três workflows, quatro workflows ou outra composição?
4. Onde, exatamente, os cinco motores são chamados pelo n8n no runtime atual?
5. Como as quatro tabelas foram criadas se não existe migration versionada no commit?
6. Por que `promoted_knowledge` nasce `PROMOTED` por padrão?
7. Como a aprovação de Rafael é autenticada, versionada e ligada à promoção?
8. Por que o WF-104 ativo utiliza números e clientes fixos?
9. Como o WF-104 poderia refletir a semana real sem nó PostgreSQL?
10. Por que a suíte foi chamada E2E se utiliza apenas arrays em memória?
11. De onde vieram as nove decisões úteis que produziram DUR de 90%?
12. Por que utilidade decisória foi usada para aumentar confiança factual?
13. Como se evita que uma regra aprendida com conteúdo malicioso ultrapasse política ou System Prompt?
14. Como são prevenidos vazamentos ou aplicação cruzada entre clientes/tenants?
15. Onde estão os eventos `CONTRADICTS`, `SUPERSEDES`, promoção, aplicação e revogação no Evidence Graph?
16. Por que os exemplares estão em código se a arquitetura declara Data-as-State no PostgreSQL?
17. Qual é o comportamento correto quando não existe exemplar compatível?
18. Como a memória negativa diferencia veto normativo, preferência comercial, recusa pontual e informação vencida?
19. Como o sistema se recupera de retry/restart sem duplicar aprendizado ou mensagem?
20. Quais afirmações dos documentos anteriores precisam ser retificadas?

---

## 12. Modelo de resposta do Antigravity

Para cada achado, preencher:

```text
ID DO ACHADO:
Diagnóstico confirmado? SIM | PARCIAL | NÃO
Explicação técnica:
Causa raiz:
Arquivos alterados:
Migration/workflow alterado:
Correção implementada:
Como a correção respeita AGENTS.md:
Teste criado ou atualizado:
Comando de validação:
Resultado observado:
Evidência reproduzível:
Risco residual:
Rollback:
Status: CORRIGIDO | PARCIAL | BLOQUEADO
```

Discordâncias devem ser sustentadas por código, export do runtime, consulta ou teste reproduzível. Não basta afirmar que o desenho pretendido era diferente.

---

## 13. Comandos de reprodução usados na auditoria

Executar na raiz do repositório, sem expor segredos:

```powershell
git rev-parse HEAD
git rev-parse origin/main
git status --short

npm run test:local-core
npm run test:p0

node tests/semantic-memory-engine.test.mjs
node tests/golden-exemplars-engine.test.mjs
node tests/decision-utility-engine.test.mjs
node tests/reflexion-engine.test.mjs
node tests/negative-memory-engine.test.mjs
node tests/flywheel-learning-gate-n2-3.test.mjs

npm run lint
npm run build

rg -n --hidden --glob '!node_modules/**' --glob '!.git/**' `
  "semantic-memory-engine|golden-exemplars-engine|decision-utility-engine|reflexion-engine|negative-memory-engine" .

git ls-files 'app/api/bridge/**'
rg -n "handleClarificationReply|handleTelegramCommand|handleConversationalText" `
  app/api/ingest/telegram/route.ts lib/telegram-runtime.ts app/api/bridge

docker exec visao-360-postgres-1 psql -U postgres -d n8n -P pager=off `
  -c "SELECT id,name,active FROM workflow_entity WHERE id='9eb8e86a-84b8-4aa9-97e4-360000000104';"

docker exec visao-360-postgres-1 psql -U postgres -d visao360 -P pager=off `
  -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('promoted_knowledge','golden_exemplars','decision_outcomes','negative_memory') ORDER BY table_name;"
```

Para consultar constraints e índices, utilizar `information_schema`, `pg_constraint` e `pg_indexes`; não imprimir linhas que contenham informações de clientes.

---

## 14. Registro das validações observadas

| Validação | Resultado técnico | Interpretação correta |
|---|---:|---|
| HEAD versus origin/main | iguais em `940c38b` | commit correto auditado |
| `npm run test:local-core` | PASS | não prova A0; teste autorreferente |
| `npm run test:p0` | PASS | comprova regressões P0, mas ainda exige runtime hospedado |
| testes unitários N2.3 | PASS | funções isoladas operam nos casos previstos |
| gate N2.3 em memória | PASS | simulação, não E2E |
| lint | 0 erros, 23 avisos | compilável, com dívida de limpeza |
| build | PASS | também confirma rotas bridge compiladas |
| containers | saudáveis | infraestrutura disponível |
| quatro tabelas | existem, zero linhas | schema básico presente; flywheel sem dados reais |
| constraints | somente PK | governança insuficiente |
| migration versionada | não encontrada | ambiente não reproduzível |
| WF-104 no banco n8n | ativo | efeito externo agendado |
| WF-104 consulta Postgres | não | relatório fixo, não reflexão real |

---

## 15. Decisão de gate

### Gate A0

**REABRIR.** Não pode permanecer `CANONICAL_LOCAL_ACTIVE` enquanto A0-01 a A0-05 não forem corrigidos e verificados no runtime.

### Gate N2.3

**REABRIR.** Classificar como `PARTIAL_IMPLEMENTATION`. Os motores podem permanecer como base de desenvolvimento, mas o flywheel só poderá ser homologado após integração real, governança de dados, aprovação segura e E2E verdadeiro.

### Operação provisória

- manter capacidades estáveis anteriores sem ampliar autonomia;
- não usar o WF-104 hard-coded;
- não promover conhecimento automaticamente;
- não usar DUR como confiança factual;
- não declarar zero violações;
- preservar backups e rastreabilidade durante as correções.

---

## 16. Encerramento

Esta auditoria diferencia quatro conceitos que não podem ser tratados como equivalentes:

1. **desenho aprovado**;
2. **código escrito**;
3. **teste unitário aprovado**;
4. **capacidade integrada e homologada no runtime**.

No commit `940c38b`, o desenho existe, o código inicial existe e os testes unitários passam. A integração operacional, a governança persistente, a evidência E2E e o cutover exclusivo ainda não satisfazem os critérios do próprio `AGENTS.md`.

Depois das correções, o Codex deverá repetir esta auditoria diretamente sobre o novo commit e sobre o runtime local efetivamente instalado.
