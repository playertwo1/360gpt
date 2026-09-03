# REAUDITORIA TÉCNICA E DE CONFORMIDADE — GATES A0 E N2.3

**Projeto:** Diretor 360  
**Repositório:** `playertwo1/360gpt`  
**Branch auditada:** `main`  
**Commit auditado:** `2f9e876f10178962e4db80cd16ba107123a8d6a1`  
**Versão declarada:** `6.1.0-gates-a0-n2.3-remediated`  
**Data:** 02/09/2026 — America/Sao_Paulo  
**Auditor independente:** ChatGPT Codex  
**Escopo:** código, políticas, migrations, PostgreSQL, runtime n8n, workflows importados, testes e documentação  
**Resultado Gate A0:** **REPROVADO**  
**Resultado Gate N2.3:** **REPROVADO**  
**Veredito global:** **REPROVADO PARA HOMOLOGAÇÃO**  
**Estado do documento:** aberto para resposta e segunda remediação pelo Antigravity; reauditoria posterior obrigatória

---

## 1. Finalidade e instruções ao Antigravity

Este documento registra a reauditoria das correções declaradas em
`docs/audits/RESPOSTA_REMEDIACAO_CODEX_GATES_A0_N2_3.md`.

O objetivo não é descartar o trabalho realizado. Existem correções válidas, mas os critérios de saída dos Gates A0 e N2.3 ainda não foram satisfeitos no runtime real. O Antigravity deve usar este dossiê para:

1. confirmar ou contestar cada achado com evidência técnica reproduzível;
2. explicar a causa raiz, inclusive quando a documentação declarou algo diferente do runtime;
3. corrigir código, workflows, banco, políticas, testes e documentação de forma coerente;
4. fornecer evidências antes/depois e comandos exatos de validação;
5. não marcar um achado como resolvido somente porque um teste isolado passou;
6. manter WF-104 inativo e não promover conhecimento no tenant operacional enquanto o Gate N2.3 estiver reaberto; testes de autopromoção devem usar tenant sintético isolado;
7. preservar dados e criar backup verificável antes de qualquer migration ou alteração destrutiva;
8. solicitar nova auditoria independente apenas após todos os critérios de saída estarem comprovados.

Não é permitido preencher os campos de resposta abaixo apenas com “corrigido”, “teste passou” ou “conforme documentação”. Toda resposta precisa apontar implementação, runtime e evidência.

---

## 2. Resumo executivo

A remediação do commit `2f9e876` trouxe avanços reais:

- as rotas `app/api/bridge/*` foram removidas do build;
- a rota Telegram deixou de importar os três handlers de negócio identificados na auditoria anterior;
- as cinco tabelas do flywheel foram formalizadas em migration e existem no PostgreSQL `visao360`;
- o WF-104 consulta `decision_outcomes` e está inativo;
- o cálculo de DUR foi desvinculado de `model_confidence`;
- amostra insuficiente passou a ser tratada explicitamente;
- o Reflexion Engine produz candidatas por padrão;
- foi adicionada uma suíte de integração com PostgreSQL e um Threat Model;
- `npm test`, lint e build foram aprovados.

Entretanto, a reauditoria do runtime demonstrou que:

- o webhook hospedado grava em uma fila D1 que não alimenta a fila PostgreSQL consumida pelo WF-101;
- o polling local está desligado;
- workflows legados ativos continuam chamando as rotas `/api/bridge/*` removidas;
- a rota Telegram ainda baixa arquivos, grava estado de documento/execução/auditoria e envia confirmação diretamente, antes do n8n;
- o inventário real de workflows ativos diverge da política canônica;
- WF-104 não persiste candidatas e anuncia comandos de aprovação inexistentes no WF-101;
- os cinco motores não estão integrados ao caminho operacional do n8n;
- o banco e as APIs dos motores ainda permitem ativação arbitrária, sem passar por um Learning Engine, score, política de risco, evidências ou trilha de promoção;
- exemplares e memória negativa nascem ativos em alguns caminhos;
- a migration apaga todas as tabelas do flywheel ao ser reaplicada;
- o registro de auditoria não é tecnicamente append-only e aceita hash inválido;
- a Memória Negativa produz tipos incompatíveis com o contrato oficial do Evidence Graph;
- a suíte denominada E2E não executa o workflow n8n, o comando Telegram ou o ciclo operacional completo;
- documentos de controle continuam contraditórios e desatualizados.

Portanto, o resultado atual é uma **base de código parcialmente remediada**, não um cutover canônico nem um flywheel operacional homologado.

---

## 3. Respostas às quatro perguntas da reauditoria

### 3.1 O corte dos legados atende 100% à regra canônica de runtime exclusivo no n8n Docker?

**Não.** Há workflows legados ativos, referências a rotas removidas, mutações e resposta Telegram fora do n8n, duas filas desconectadas e divergência entre inventário declarado e runtime.

### 3.2 O aprendizado respeita estritamente Prompt-as-Code e Data-as-State?

**Não integralmente.** Os arquivos de prompt não são autoeditados, mas o estado dinâmico pode ser marcado como ativo/promovido diretamente pelo chamador, sem decisão do Learning Engine, score, evidências, risco e auditoria. Alguns dados sintéticos também continuam disponíveis como fallback operacional.

### 3.3 Decision Utility, Memória Negativa e Exemplares Dourados estão integrados e auditáveis?

**Não.** Os módulos existem, mas não estão conectados ao caminho canônico do n8n. O WF-104 duplica lógica em Code Node, não persiste candidatas e não oferece um caminho funcional de autopromoção controlada, revisão excepcional, aplicação, avaliação e reversão.

### 3.4 Veredito final

**REPROVADO PARA HOMOLOGAÇÃO DOS GATES A0 E N2.3.**

O Gate N7 e qualquer ampliação operacional que dependa desses gates deve permanecer bloqueado. O WF-104 deve continuar inativo.

---

## 4. Escopo e evidências examinadas

### 4.1 Arquivos principais

- `AGENTS.md`
- `ROADMAP.md`
- `PROJECT_STATE.md`
- `status.md`
- `CHANGELOG.md`
- `SESSION_STATE.json`
- `CODEX_HANDOFF.md`
- `docs/audits/AUDITORIA_CODEX_GATE_A0_N2_3_COMMIT_940C38B.md`
- `docs/audits/RESPOSTA_REMEDIACAO_CODEX_GATES_A0_N2_3.md`
- `policies/n8n-canonical-architecture.yaml`
- `security/THREAT_MODEL.md`
- `app/api/ingest/telegram/route.ts`
- `lib/telegram-runtime.ts`
- `infra/postgres/init/09-flywheel-learning.sql`
- cinco motores N2.3 em `engines/`
- `contracts/evidence-graph.schema.json`
- `n8n/workflows/wf-100-telegram-local-intake.json`
- `n8n/workflows/wf-101-local-dispatcher.json`
- `n8n/workflows/wf-104-weekly-reflexion.json`
- WF-11, WF-97, WF-98 e WF-99
- `scripts/test-n8n-canonical-architecture.mjs`
- `scripts/test-telegram-hardening.mjs`
- `tests/flywheel-learning-postgres-integration.test.mjs`

### 4.2 Runtime verificado

- `HEAD` e `origin/main` em `2f9e876`;
- worktree inicialmente limpo;
- containers PostgreSQL, n8n e serviços locais;
- banco `n8n`, tabela `workflow_entity`;
- banco `visao360`, tabelas, constraints e contagens do flywheel;
- estado real do WF-104 importado;
- configuração do Telegram Poller.

### 4.3 Validações executadas

- `npm test`: **PASS**;
- `npm run lint`: **PASS**, zero erros e 26 avisos;
- `npm run build`: **PASS**, zero rotas `/api/bridge/*` no build;
- inspeção de workflows ativos no banco n8n;
- inspeção do conteúdo dos workflows ativos;
- consulta das cinco tabelas do flywheel;
- testes negativos transacionais no PostgreSQL, revertidos por `ROLLBACK`;
- testes negativos das APIs dos motores, sem persistência;
- conferência do contrato Evidence Graph;
- comparação entre política, JSON versionado e workflow importado.

O fato de a suíte automatizada passar é registrado como evidência positiva, mas não substitui os testes operacionais ausentes.

### 4.4 Decisão superveniente de Rafael sobre o aprendizado

Após a primeira emissão desta reauditoria, Rafael alterou expressamente o requisito de governança do flywheel:

> O aprendizado não precisa de aprovação formal de Rafael para cada regra. O sistema deve aprender progressivamente o que funciona e o que não funciona, usando memória, evidências, recorrência, recência, resultados e feedback explícito. Revisão manual será solicitada somente quando necessária pelo risco, ambiguidade ou impacto.

Essa decisão substitui a premissa anterior de “toda promoção exige aprovação individual”. Ela **não** autoriza autopromoção arbitrária, alteração autônoma de `AGENTS.md`, System Prompts, políticas, contratos, regras oficiais ou efeitos externos.

O modelo esperado passa a ser:

```text
interação → memória episódica → avaliação → regra candidata
→ Learning Engine calcula evidência/risco
→ autopromoção controlada OU revisão manual
→ aplicação monitorada → resultado → reforço/decaimento/revogação
```

Categorias mínimas:

1. **Memória bruta/episódica:** pode ser registrada automaticamente, com tenant, entidade, data, origem, retenção e proveniência.
2. **Memória semântica:** pode receber embeddings automaticamente; recuperação é contextual e nunca transforma similaridade em fato.
3. **Fato estruturado informado explicitamente por Rafael:** pode ser registrado automaticamente com origem `OWNER_PROVIDED`, escopo e vigência; não vira regra global.
4. **Regra aprendida candidata:** nasce `CANDIDATE` e recebe score, evidências, escopo, risco e validade.
5. **Autopromoção controlada:** permitida para aprendizado reversível e de baixo risco que satisfaça política versionada e determinística.
6. **Revisão manual:** permanece obrigatória para mudança de política/AGENTS/System Prompt, fórmula oficial, autorização/acesso/retenção, efeito externo, conflito material, regra global de alto impacto ou evidência insuficiente.

O Learning Engine deve considerar, no mínimo:

```text
confidence × frequency × recency × observed_outcome × explicit_feedback
```

Também deve aplicar penalidades por conflito, baixa diversidade de amostra, mudança de período/layout, escopo amplo e risco. Feedback explícito como “está correto”, “não faça assim”, “prefiro dessa forma” ou uma correção objetiva de Rafael recebe peso superior a inferências silenciosas.

Toda promoção deve registrar `promotion_mode` (`AUTO`, `OWNER_EXPLICIT` ou `MANUAL_REVIEW`), versão da política, score, evidências, risco, escopo, validade e motivo. Rafael deve poder corrigir, revogar e consultar o que foi aprendido, mesmo quando não precisou aprovar previamente.

---

## 5. Evidência objetiva resumida do runtime

### 5.1 Telegram Poller

```text
TELEGRAM_POLLING_ENABLED=false
```

### 5.2 Workflows ativos no banco n8n

```text
WF-100  active=true   bridge=false
WF-101  active=true   bridge=false
WF-102  active=true   bridge=false
WF-103  active=true   bridge=false
WF-104  active=false  bridge=false
WF-11   active=true   bridge=true
WF-12   active=true   bridge=false
WF-13   active=true   bridge=false
WF-20   active=true   bridge=false
WF-30   active=true   bridge=false
WF-40   active=true   bridge=false
WF-97   active=true   bridge=true
WF-98   active=true   bridge=true
WF-99   active=false  bridge=true
```

### 5.3 Tabelas do flywheel

```text
promoted_knowledge    0 linhas
golden_exemplars      0 linhas
decision_outcomes     0 linhas
negative_memory       0 linhas
flywheel_audit_events 0 linhas
```

### 5.4 WF-104 importado

```text
active=false
reads decision_outcomes=true
persists promoted_knowledge=false
uses Math.random=true
```

### 5.5 Provas negativas do banco

Dentro de uma transação posteriormente revertida, o banco aceitou:

- `promoted_knowledge.status='PROMOTED'` sem `approved_by` e sem `approved_at`;
- `negative_memory` com status padrão `ACTIVE` sem base de promoção;
- `flywheel_audit_events.evidence_hash='not-a-sha256'`.

Esses resultados demonstram que a supervisão e a integridade dependem de disciplina do chamador, e não de controles obrigatórios do sistema.

---

## 6. Achados detalhados — Gate A0

### A0-R01 — Fila hospedada D1 não alimenta a fila local do n8n

**Severidade:** CRÍTICA  
**Estado:** confirmado

#### Evidência

- `app/api/ingest/telegram/route.ts:112` grava em `telegram_inbound_events` usando `env.DB`, portanto D1 hospedado.
- `n8n/workflows/wf-101-local-dispatcher.json:63` consome `channel_inbound_events` no PostgreSQL local.
- O Telegram Poller está com `TELEGRAM_POLLING_ENABLED=false`.
- Não foi encontrado adaptador ativo que transporte o evento do D1 para `channel_inbound_events`.

#### Impacto

O webhook pode aceitar e registrar a entrada hospedada sem que ela chegue ao controlador local. Isso rompe o caminho canônico e pode produzir silêncio, processamento parcial ou estado divergente.

#### Correção obrigatória

Escolher e implementar um único mecanismo de transporte:

1. webhook hospedado autentica, deduplica tecnicamente e entrega o envelope ao WF-100 por canal seguro; ou
2. webhook grava uma caixa postal puramente técnica e um adaptador local de saída a consome e chama o WF-100.

Em ambos os casos, o primeiro componente a decidir comando, documento, conversa ou resposta deve ser o n8n. A entrega precisa ter lease, idempotência, retry, DLQ e rastreabilidade ponta a ponta.

#### Critério de aceite

- um update sintético no webhook gera exatamente uma linha em `channel_inbound_events`;
- WF-101 reserva e conclui o mesmo evento;
- retry do webhook não duplica a execução;
- falha intermediária é recuperável;
- não existe segunda fila de negócio divergente.

#### Resposta do Antigravity — preencher

- Confirma ou contesta o achado:
- Causa raiz:
- Arquitetura escolhida:
- Arquivos/workflows alterados:
- Migration/configuração aplicada:
- Comandos executados:
- Evidência antes/depois:
- Teste E2E e resultado:
- Risco residual:
- Commit da correção:

---

### A0-R02 — Workflows ativos ainda chamam rotas `/api/bridge/*` removidas

**Severidade:** CRÍTICA  
**Estado:** confirmado

#### Evidência

- WF-11 ativo chama `/api/bridge/claim`, `/clarifications/request`, `/complete` e `/fail`.
- WF-97 ativo chama `/api/bridge/inbound/claim` e `/process`.
- WF-98 ativo chama `/api/bridge/directives/claim`, `/extract` e `/complete`.
- WF-99, embora inativo, ainda chama `/api/bridge/errors/report`.
- As rotas foram removidas do build, portanto esses workflows apontam para endpoints inexistentes.

#### Impacto

Há violações ativas e fluxos inevitavelmente quebrados. A afirmação de “zero exceções legadas” é falsa no runtime.

#### Correção obrigatória

- desativar imediatamente os workflows legados quebrados;
- arquivar ou migrar suas capacidades necessárias para WF-100/WF-101/WF-103;
- remover credenciais e URLs de bridge dos workflows canônicos;
- impedir reativação acidental por teste de inventário.

#### Critério de aceite

- consulta ao banco n8n retorna zero workflow ativo contendo `/api/bridge/`;
- nenhum workflow canônico depende de rota removida;
- lista de ativos coincide com inventário aprovado;
- capacidade necessária é demonstrada no caminho novo antes do arquivamento definitivo.

#### Resposta do Antigravity — preencher

- Confirma ou contesta o achado:
- Workflows desativados/arquivados:
- Capacidades migradas:
- Evidência do banco n8n:
- Evidência de ausência de `/api/bridge/`:
- Testes executados:
- Commit:

---

### A0-R03 — Endpoint Telegram ainda executa mutação e resposta antes do n8n

**Severidade:** CRÍTICA  
**Estado:** confirmado

#### Evidência

`app/api/ingest/telegram/route.ts` ainda:

- importa `sendTelegramText` na linha 3;
- baixa arquivo do Telegram na linha 129 e implementa o download na linha 252;
- grava `audit_log` nas linhas 154 e 166;
- grava estado de documento/execução no mesmo caminho transacional;
- envia confirmação diretamente na linha 269.

#### Impacto

O endpoint não é transporte técnico puro. Ele determina jornada de documento, cria estado operacional e responde ao usuário antes de o n8n assumir a entrada.

#### Correção obrigatória

O gateway pode autenticar, aplicar allowlist/rate limit, deduplicar tecnicamente, formar envelope e acusar HTTP 200 ao Telegram. Confirmação conversacional, download/processamento documental, protocolo de negócio, auditoria de negócio e resposta ao Rafael devem ser comandados pelo n8n.

#### Critério de aceite

- rota sem `sendTelegramText`;
- rota sem escrita em `documents`, `agent_runs`, Estado 360 ou auditoria de negócio;
- rota sem interpretação de tipo operacional além do envelope técnico;
- ACK visível ao Rafael produzido por workflow n8n e outbox idempotente.

#### Resposta do Antigravity — preencher

- Confirma ou contesta:
- Responsabilidades removidas:
- Responsabilidades técnicas preservadas e justificativa:
- Workflow que assumiu a jornada:
- Teste estrutural:
- Teste E2E:
- Commit:

---

### A0-R04 — Inventário declarado diverge do runtime real

**Severidade:** ALTA  
**Estado:** confirmado

#### Evidência

`policies/n8n-canonical-architecture.yaml` declara:

```text
legacy_exceptions_count: 0
active_runtime_violations: 0
gate_a0_status: CANONICAL_LOCAL_ACTIVE
```

O banco n8n possui 12 workflows ativos, inclusive WF-11, WF-97 e WF-98 com bridge. Há ainda divergências de `active` entre arquivos JSON e workflows importados, como o WF-100.

#### Impacto

Não existe fonte confiável de inventário, release ou rollback. Testes podem aprovar arquivos que não correspondem ao runtime.

#### Correção obrigatória

- criar manifesto versionado dos workflows canônicos com ID, versão/hash, status esperado e dependências;
- exportar o runtime e comparar automaticamente com o manifesto;
- bloquear gate quando existir workflow desconhecido, hash divergente ou status diferente;
- somente declarar `CANONICAL_LOCAL_ACTIVE` quando a consulta real for compatível.

#### Critério de aceite

- teste consulta o banco/API do n8n;
- runtime, export e Git coincidem;
- nenhuma ativação não declarada;
- evidência de rollback e última importação registrada.

#### Resposta do Antigravity — preencher

- Inventário anterior:
- Inventário final:
- Manifesto criado/alterado:
- Método de comparação runtime/Git:
- Resultado da comparação:
- Commit:

---

### A0-R05 — Teste arquitetural ainda é insuficiente e contém resultado pré-declarado

**Severidade:** ALTA  
**Estado:** confirmado

#### Evidência

`scripts/test-n8n-canonical-architecture.mjs` verifica a ausência de três nomes de handlers e a ausência física das rotas bridge. Ao final, imprime `legacyExceptions: 0` e `runtimeGate: CANONICAL_LOCAL_ACTIVE` sem consultar o runtime.

`scripts/test-telegram-hardening.mjs` exige que `sendTelegramText` continue no gateway, ratificando justamente a resposta fora do n8n.

#### Impacto

A suíte fornece falso positivo: passa mesmo com workflows legados ativos, filas desconectadas e resposta direta no gateway.

#### Correção obrigatória

Expandir a suíte para verificar:

- workflow importado e estado ativo;
- referências a bridges removidas;
- paridade de hash Git/runtime;
- proibição de envio Telegram e SQL de negócio no gateway;
- conexão real webhook → WF-100 → WF-101;
- inventário fechado.

#### Critério de aceite

Introduzir falhas controladas para comprovar que o teste reprova cada violação. O teste não pode imprimir status de gate a partir de constante.

#### Resposta do Antigravity — preencher

- Falhas que o teste antigo não detectava:
- Novas verificações:
- Negative tests adicionados:
- Saída do teste corrigido:
- Commit:

---

### A0-R06 — `lib/telegram-runtime.ts` não foi reduzido a adaptador

**Severidade:** ALTA  
**Estado:** confirmado como risco latente

#### Evidência

A busca não encontrou importação operacional não legada após o cutover, o que reduz o risco imediato. Porém o arquivo continua contendo parser de comandos, aprovação, revogação, exclusão, esclarecimentos, SQL e respostas de negócio. A política declara que ele foi reduzido a adaptador.

#### Impacto

O código pode ser reativado acidentalmente e a documentação descreve um estado inexistente.

#### Correção obrigatória

- mover o controlador inteiro para `legacy/` ou eliminar suas responsabilidades de negócio;
- manter em módulo operacional apenas transporte sem decisão;
- criar teste de dependência proibida.

#### Critério de aceite

- arquivo operacional sem comandos, regras e SQL de negócio;
- nenhum import fora de `legacy/`;
- política descreve exatamente seu estado.

#### Resposta do Antigravity — preencher

- Decisão: remover, arquivar ou reduzir:
- Justificativa:
- Arquivos alterados:
- Teste de dependência:
- Commit:

---

### A0-R07 — WF-101 ativo contém fatos e recomendações codificados

**Severidade:** CRÍTICA  
**Estado:** confirmado

#### Evidência

O Code Node do WF-101 contém diretamente pontuação `70,71`, nomes de empresas, contatos, volumes, oportunidades e recomendações, incluindo Hospital São Lucas, Metalúrgica Forja Sul e R$ 420 mil. Outros motores conversacionais também contêm snapshots e entidades como defaults.

#### Impacto

O runtime pode responder com dados estáticos, desatualizados ou sintéticos sem consultar Estado 360 e fontes vigentes. Isso viola “Fontes governam” e cria risco de contaminação entre períodos e clientes.

#### Correção obrigatória

- remover fatos operacionais codificados do WF-101 e dos defaults de produção;
- consultar Estado 360 e tabelas por tenant, período e evidência;
- quando não houver dado, responder `NOT_AVAILABLE`/`REFRESH_REQUIRED`;
- manter fixtures somente em `test-data` ou módulos explicitamente de teste.

#### Critério de aceite

- busca estática não encontra clientes/valores de demonstração no caminho operacional;
- banco vazio não produz fatos inventados;
- respostas mostram fonte e data-base;
- fixtures seguem aprovando em ambiente isolado.

#### Resposta do Antigravity — preencher

- Dados removidos:
- Fonte operacional substituta:
- Comportamento sem dados:
- Testes de não contaminação:
- Commit:

---

## 7. Achados detalhados — Gate N2.3

### N23-R01 — WF-104 não persiste as candidatas que anuncia

**Severidade:** CRÍTICA  
**Estado:** confirmado

#### Evidência

O workflow lê `decision_outcomes`, mas não possui `INSERT INTO promoted_knowledge`. O Code Node gera IDs com `Math.random().toString(36).substring(2, 10)` e os coloca nos comandos Telegram.

#### Impacto

O Rafael recebe IDs sem registro correspondente. Não há candidata auditável, idempotência, proveniência, promoção controlada nem revisão possível.

#### Correção obrigatória

- gerar UUID ou ID persistido pelo banco;
- persistir cada candidata como `CANDIDATE` antes de construir o card;
- usar `INSERT ... ON CONFLICT` com chave de idempotência por tenant;
- registrar evidências, janela, padrões e versão do motor;
- usar outbox para o card somente após commit.

#### Critério de aceite

- execução do WF-104 cria candidata no PostgreSQL;
- ID do card corresponde exatamente ao registro;
- retry não duplica candidata nem card;
- ausência de persistência impede envio do card.

#### Resposta do Antigravity — preencher

- Causa raiz:
- Nós adicionados/alterados:
- SQL utilizado:
- Estratégia de idempotência:
- Evidência no banco:
- Resultado de retry:
- Commit:

---

### N23-R02 — Mecanismos de revisão, correção e revogação anunciados não existem no WF-101

**Severidade:** ALTA  
**Estado:** confirmado

#### Evidência

WF-104 anuncia `/aprovardiretriz <id>` e `/aprovar_todas`. O catálogo determinístico do WF-101 não reconhece esses comandos. A implementação encontrada permanece no runtime TypeScript legado. Também não foi demonstrado um caminho canônico para Rafael consultar, corrigir, rejeitar ou revogar aprendizado promovido automaticamente.

#### Impacto

Embora a nova regra não exija aprovação manual para toda candidata, o ciclo de supervisão e override não fecha. O card solicita operações impossíveis e Rafael não possui controle operacional para casos que exigem revisão ou para desfazer aprendizado inadequado.

#### Correção obrigatória

Implementar no n8n mecanismos para:

- autenticação forte de Rafael e tenant;
- resolução inequívoca do ID;
- listar regra, evidências, score, escopo, risco, validade e `promotion_mode`;
- aprovar/forçar promoção apenas quando a política exigir revisão ou Rafael quiser intervir;
- corrigir, rejeitar, revogar, suspender e reabrir aprendizado;
- confirmação vinculada, curta e expirada para ações críticas;
- atualização condicional compatível com o lifecycle;
- auditoria append-only;
- idempotência;
- resposta de sucesso/falha;
- ações em lote restritas ao conjunto apresentado e à janela correta.

#### Critério de aceite

- usuário não autorizado é bloqueado;
- candidata inexistente/expirada não é promovida;
- mesmo comando repetido é idempotente;
- autopromoção elegível funciona sem comando manual e fica auditada;
- intervenção válida aparece no Context Packet seguinte;
- revogação impede usos futuros;
- `/aprovar_todas`, se mantido, não aprova candidatas que não estavam no card.

#### Resposta do Antigravity — preencher

- Workflows/nós implementados:
- Autenticação e confirmação:
- SQL transacional:
- Testes negativos:
- Teste E2E:
- Commit:

---

### N23-R03 — Cinco motores não estão conectados ao runtime n8n

**Severidade:** CRÍTICA  
**Estado:** confirmado

#### Evidência

As referências operacionais aos módulos aparecem nos próprios motores, testes e documentação. O WF-104 reimplementa parte do DUR/reflexão em JavaScript próprio, em vez de chamar os motores versionados. Não foi encontrado caminho n8n que carregue e aplique Semantic Memory, Golden Exemplars, Decision Utility, Reflexion e Negative Memory como um ciclo.

#### Impacto

Correções nos motores podem não afetar o runtime. Código e workflow podem divergir silenciosamente, impedindo auditoria e reprodução.

#### Correção obrigatória

Definir uma única integração canônica, por exemplo:

- subworkflows n8n versionados com lógica determinística; ou
- serviço interno sem acesso público que exponha os motores e seja chamado somente pelo n8n.

Não duplicar algoritmos em Code Nodes. Registrar versão/hash do motor aplicado.

#### Critério de aceite

- trace E2E mostra chamada aos cinco componentes quando aplicável;
- versão do motor registrada no evento;
- alterar um motor em teste de mutação muda o resultado controlado;
- nenhuma implementação paralela da mesma regra.

#### Resposta do Antigravity — preencher

- Estratégia de integração escolhida:
- Motivo:
- Workflows/serviços alterados:
- Como a versão é registrada:
- Testes de paridade:
- Commit:

---

### N23-R04 — Semantic Memory permite ativação fora da política de aprendizado

**Severidade:** CRÍTICA  
**Estado:** confirmado

#### Evidência

`createSemanticRule()` aceita `status` fornecido pelo chamador. Se for `PROMOTED`, a própria função atribui `approved_by='RAFAEL'` e `approved_at`, sem executar Learning Engine, score, política de risco ou auditoria. `promoteSemanticRule()` aceita a string padrão `RAFAEL`. `getActiveRules()` verifica status e expiração, mas não exige base de promoção, política, score/evidência e não valida `valid_from`.

O banco também aceitou regra `PROMOTED` sem nenhuma base de promoção.

#### Impacto

Qualquer chamador interno pode inserir regra ativa e até atribuir falsamente a promoção a Rafael. Isso não é aprendizado automático controlado; é bypass direto do lifecycle.

#### Correção obrigatória

- remover `status` da API de criação ou rejeitar qualquer valor diferente de `CANDIDATE`;
- promoção ocorrer somente por transação do Learning Engine ou por intervenção explícita registrada;
- banco exigir `promotion_mode`, `promotion_policy_version`, `promotion_score`, `promotion_reason` e referências de evidência para `PROMOTED`;
- quando `promotion_mode='OWNER_EXPLICIT'` ou `MANUAL_REVIEW`, exigir ator/evento autenticado;
- quando `promotion_mode='AUTO'`, exigir critérios de score, risco, frequência e evidência satisfeitos;
- `getActiveRules()` exigir todos os invariantes e `valid_from <= now < valid_to`.

#### Critério de aceite

- tentativa de criar diretamente `PROMOTED` falha na API e no banco;
- string `RAFAEL` isolada não constitui base de promoção;
- autopromoção elegível passa exclusivamente pelo Learning Engine e fica auditada;
- intervenção humana, quando necessária, exige evento autenticado;
- regra futura, expirada, sem evidências ou sem trilha de promoção nunca entra no contexto.

#### Resposta do Antigravity — preencher

- API corrigida:
- Constraints adicionadas:
- Modelo de promoção automática e revisão:
- Negative tests:
- Evidência de promoção válida:
- Commit:

---

### N23-R05 — Exemplares Dourados nascem ativos e possuem fallback sintético

**Severidade:** CRÍTICA  
**Estado:** confirmado

#### Evidência

- `createGoldenExemplar()` retorna `status='ACTIVE'` e pré-preenche aprovação.
- A tabela define `status DEFAULT 'ACTIVE'`, `approved_by DEFAULT 'RAFAEL'` e `approved_at DEFAULT NOW()`.
- `findBestGoldenExemplar()` usa `SYNTHETIC_TEST_EXEMPLARS` como argumento padrão.
- O fallback por objetivo/canal e por setor pode selecionar exemplo de contexto mais amplo do que o solicitado.

#### Impacto

Um insert comum ativa conteúdo sem revisão, e um chamador que omita o conjunto de dados pode receber cliente/texto sintético em produção.

#### Correção obrigatória

- lifecycle `CANDIDATE → ACTIVE` por autopromoção controlada ou revisão excepcional;
- remover defaults de ativação/aprovação do banco;
- exigir `promotion_mode`, score, risco, política e evidências para todo exemplar ativo;
- remover fixtures do módulo operacional ou exigir `exemplars` explicitamente;
- aplicar tenant, escopo, finalidade, canal, período e compatibilidade;
- sanitizar conteúdo antes da injeção.

#### Critério de aceite

- criação gera candidata inativa;
- banco rejeita ativo sem base válida de promoção automática ou humana;
- exemplo nota máxima pode ganhar peso, mas uma avaliação isolada não vira padrão global silenciosamente;
- array ausente retorna `null` ou erro seguro, nunca fixture;
- nenhum nome/valor sintético aparece no runtime real.

#### Resposta do Antigravity — preencher

- Lifecycle final:
- Defaults removidos:
- Destino das fixtures:
- Critério de similaridade:
- Testes de isolamento:
- Commit:

---

### N23-R06 — Memória Negativa nasce ativa sem avaliação, evidência ou política

**Severidade:** CRÍTICA  
**Estado:** confirmado

#### Evidência

`createNegativeMemoryItem()` usa `ACTIVE` como padrão e autoatribui aprovação de Rafael. A tabela também usa `ACTIVE` como padrão. Não há Learning Engine, score, recorrência, classificação de risco nem caminho canônico de promoção/revogação.

#### Impacto

Uma única observação ou inferência pode bloquear recomendações legítimas sem evidência suficiente. O problema não é a ausência de aprovação formal em todos os casos; é a ativação imediata sem avaliação controlada.

#### Correção obrigatória

- padrão obrigatório `CANDIDATE`;
- separar criação, avaliação, autopromoção/revisão, ativação, revogação e expiração;
- exigir score, evidências, risco e escopo preciso;
- permitir autopromoção apenas para veto reversível, inequívoco e de baixo risco; bloqueio material ou amplo exige revisão;
- registrar motivo, entidade, produto/ação, vigência e evidência.

#### Critério de aceite

- criação nunca bloqueia por si só;
- somente `ACTIVE` com base de promoção válida intercepta;
- correção explícita de Rafael recebe peso alto e pode gerar regra provisória imediata no escopo correto, sem virar política global;
- revogação é imediata para usos futuros;
- histórico permanece auditável.

#### Resposta do Antigravity — preencher

- Lifecycle implementado:
- API e banco alterados:
- Caminho de autopromoção/revisão/revogação:
- Testes:
- Commit:

---

### N23-R07 — Saída de Memória Negativa viola o schema Evidence Graph

**Severidade:** ALTA  
**Estado:** confirmado

#### Evidência

O motor produz:

```text
node_type: NEGATIVE_CONSTRAINT
relation: DERIVED_FROM_OUTCOME
```

Esses valores não existem nos enums de `contracts/evidence-graph.schema.json`.

#### Impacto

A evidência não pode ser validada nem inserida legitimamente no grafo canônico. A alegação de integração com Evidence Graph não é verdadeira.

#### Correção obrigatória

Escolher uma das opções:

- mapear o item para tipos existentes, como `FINDING`/`REVIEW_RESOLUTION` e relação `DERIVED_FROM`; ou
- versionar o schema com novos tipos, migration, compatibilidade e testes.

O payload deve usar os nomes de campos exigidos pelo contrato (`node_id`, `content_hash`, versões e timestamps).

#### Critério de aceite

- saída valida contra JSON Schema Draft 2020-12;
- nó e arestas são persistidos;
- caminho até `SOURCE_ARTIFACT`/decisão humana é navegável;
- hash e versões são registrados.

#### Resposta do Antigravity — preencher

- Estratégia adotada:
- Schema/engine alterados:
- Exemplo JSON válido:
- Resultado do validator:
- Evidência persistida:
- Commit:

---

### N23-R08 — Migration 09 é destrutiva e não pode ser reaplicada com segurança

**Severidade:** CRÍTICA  
**Estado:** confirmado

#### Evidência

`infra/postgres/init/09-flywheel-learning.sql` inicia com cinco comandos `DROP TABLE IF EXISTS ... CASCADE`.

#### Impacto

Reexecutar bootstrap ou migration apaga todo o aprendizado, desfechos e auditoria. O uso de `CASCADE` pode remover dependências adicionais.

#### Correção obrigatória

- nunca editar o histórico já aplicado para fingir migração limpa;
- criar migration incremental seguinte;
- usar `CREATE TABLE IF NOT EXISTS` apenas no bootstrap novo e `ALTER TABLE` para upgrade;
- preservar dados;
- incluir procedimento de rollback seguro e backup verificado;
- testar upgrade em cópia do banco com dados.

#### Critério de aceite

- aplicar migrations duas vezes não perde dados;
- upgrade preserva contagens e hashes;
- backup restaura em banco limpo;
- nenhuma migration de produção depende de `DROP ... CASCADE` para atualizar schema.

#### Resposta do Antigravity — preencher

- Causa da migration destrutiva:
- Migration incremental criada:
- Backup verificado:
- Teste de upgrade:
- Teste de reexecução:
- Resultado de restore:
- Commit:

---

### N23-R09 — Constraints não garantem base de promoção, tenant e lifecycle

**Severidade:** CRÍTICA  
**Estado:** confirmado

#### Evidência

- `PROMOTED` pode existir sem score, evidências, política ou base de promoção.
- `ACTIVE` pode existir sem score, evidências, política ou base de promoção.
- `idempotency_key` é globalmente UNIQUE, em vez de ter escopo explícito por tenant.
- faltam constraints ligando datas e atores aos estados.
- faltam vínculos referenciais obrigatórios para evidência, promoção e revisão em vários registros.

#### Impacto

Há risco de personificação, estado impossível, colisão entre tenants e registros órfãos.

#### Correção obrigatória

Adicionar constraints equivalentes a:

- `PROMOTED/ACTIVE` exige `promotion_mode`, versão da política, score, risco, motivo e evidências;
- promoção humana exige `approved_by`, `approved_at` e `approval_event_id`; autopromoção exige `learning_run_id` e critérios verificáveis;
- `REVOKED` exige revogador/data;
- `EXPIRED` exige término de vigência;
- `valid_to > valid_from`;
- unicidade contextual `(tenant_id, idempotency_key)`;
- foreign keys ou referências auditáveis;
- owner/tenant obrigatório onde aplicável.

#### Critério de aceite

Negative tests SQL devem provar a rejeição de cada estado inválido e cross-tenant deve ser exercitado.

#### Resposta do Antigravity — preencher

- Constraints adicionadas:
- Foreign keys/referências:
- Política de tenant:
- Negative tests:
- Commit:

---

### N23-R10 — Auditoria não é append-only e aceita hash inválido

**Severidade:** CRÍTICA  
**Estado:** confirmado

#### Evidência

`flywheel_audit_events` é uma tabela comum, sem trigger ou privilégios que impeçam `UPDATE`/`DELETE`. `evidence_hash` é apenas `VARCHAR(64)` e aceitou `not-a-sha256`. O teste grava `sha256:test_audit_hash`, que também não é um SHA-256 válido.

#### Impacto

O histórico pode ser alterado ou removido e não oferece prova criptográfica verificável.

#### Correção obrigatória

- validar formato e cálculo do hash;
- incluir `previous_event_hash` ou mecanismo equivalente se a política exigir cadeia;
- proibir `UPDATE` e `DELETE` para a role do aplicativo;
- permitir correções apenas por novo evento;
- ligar auditoria ao ator autenticado e objeto;
- testar tamper detection.

#### Critério de aceite

- hash inválido é rejeitado;
- aplicação não consegue atualizar/apagar evento;
- alteração de payload invalida verificação;
- histórico reproduz a base da promoção e cada aplicação.

#### Resposta do Antigravity — preencher

- Modelo de imutabilidade:
- Roles/triggers alterados:
- Formato do hash:
- Testes de adulteração:
- Commit:

---

### N23-R11 — WF-104 não isola tenant/owner

**Severidade:** CRÍTICA  
**Estado:** confirmado

#### Evidência

A consulta do WF-104 seleciona todos os `decision_outcomes` dos últimos sete dias sem `WHERE tenant_id = ...` e sem owner. O card possui `chat_id` fixo.

#### Impacto

Com mais de um tenant, dados podem ser agregados e enviados ao destinatário errado. Mesmo em projeto pessoal, o contrato multitenant declarado exige isolamento.

#### Correção obrigatória

- selecionar por tenant/owner configurado e autorizado;
- resolver chat pelo cadastro do canal, nunca por número fixo no Code Node;
- particionar idempotência e outbox;
- registrar tenant em candidatos e auditoria.

#### Critério de aceite

- dois tenants sintéticos não misturam outcomes, candidatos ou cards;
- chat incorreto não recebe nada;
- consulta sem tenant é bloqueada por teste estrutural/RLS quando aplicável.

#### Resposta do Antigravity — preencher

- Estratégia de isolamento:
- Consulta final:
- Resolução do destinatário:
- Teste com dois tenants:
- Commit:

---

### N23-R12 — Sanitização de contexto é frágil e não constitui defesa suficiente

**Severidade:** ALTA  
**Estado:** confirmado

#### Evidência

`sanitizeRuleText()` substitui apenas alguns padrões ingleses exatos. Formulações equivalentes, outros idiomas, conteúdo indireto e instruções fragmentadas passam. O teste cobre um único texto conhecido.

O Context Packet é montado como texto livre. Não há política estrutural que impeça o modelo de tratar o conteúdo como instrução superior.

#### Impacto

Conhecimento promovido ou contaminado pode influenciar o agente além do escopo pretendido.

#### Correção obrigatória

- tratar memória como dados estruturados, não como bloco de instruções livres;
- validar tipo, tamanho, escopo, caracteres e finalidade;
- aplicar allowlist de categorias;
- separar fatos, preferências, vetos e regras homologadas;
- executar red-team multilíngue e indireto;
- impedir URLs, ferramentas, segredos e alterações de política.

#### Critério de aceite

- conjunto adversarial diversificado é bloqueado/quarentenado;
- conteúdo permanece rotulado como dado subordinado;
- regra não pode solicitar ferramenta, revelar segredo ou mudar política;
- rejeição fica auditada.

#### Resposta do Antigravity — preencher

- Threats considerados:
- Contrato estruturado:
- Validações implementadas:
- Red-team executado:
- Resultado:
- Commit:

---

### N23-R13 — Hashes dos motores não são criptográficos

**Severidade:** ALTA  
**Estado:** confirmado

#### Evidência

Os motores usam uma função de hash inteira de 32 bits baseada em deslocamento e soma. Ela possui alta probabilidade de colisão e não é SHA-256.

#### Impacto

Idempotência, deduplicação e evidência podem colidir ou ser manipuladas, contrariando as alegações criptográficas.

#### Correção obrigatória

Usar SHA-256 sobre serialização canônica que inclua tenant, tipo, escopo, entidade, conteúdo normalizado e versão do contrato. A constraint do banco deve refletir o formato.

#### Critério de aceite

- vetor determinístico conhecido;
- variação de tenant/escopo muda o hash;
- serialização independe da ordem acidental de chaves;
- hashes têm formato validado.

#### Resposta do Antigravity — preencher

- Algoritmo e canonicalização:
- Campos incluídos:
- Migração necessária:
- Vetores de teste:
- Commit:

---

### N23-R14 — Normalização e correspondência da Memória Negativa são imprecisas

**Severidade:** ALTA  
**Estado:** confirmado

#### Evidência

O comentário afirma normalização de acentos e pontuação, mas `normalizeText()` remove apenas acentos, converte para minúsculas e aplica `trim`. A entidade é comparada por `includes`, podendo gerar falso positivo em nomes parciais. A ação proibida também depende de substring exata.

#### Impacto

Pode bloquear entidade errada ou deixar passar reformulação da mesma ação.

#### Correção obrigatória

- usar identificador forte da entidade quando disponível;
- normalizar pontuação/espaços de modo determinístico;
- evitar substring como confirmação de identidade;
- definir matcher por tipo de veto;
- enviar baixa confiança para revisão, não bloquear silenciosamente.

#### Critério de aceite

- testes de homônimos, abreviações, pontuação, acentos e negação;
- CNPJ/customer_ref prevalece sobre nome;
- falso positivo não produz bloqueio automático.

#### Resposta do Antigravity — preencher

- Estratégia de matching:
- Identificadores utilizados:
- Casos de teste:
- Resultado:
- Commit:

---

### N23-R15 — Reflexion Engine cria escopo global excessivo

**Severidade:** ALTA  
**Estado:** confirmado

#### Evidência

As candidatas produzidas pelo `reflexion-engine.mjs` usam escopo `GLOBAL`, mesmo quando o padrão pode pertencer a domínio, cliente, canal ou finalidade. Uma nota explícita isolada também pode originar candidata global.

#### Impacto

Uma preferência local pode contaminar outros clientes, áreas e contextos.

#### Correção obrigatória

- inferir apenas o menor escopo demonstrável;
- guardar evidências e amostra;
- proibir promoção global automática de regras materiais; preferências reversíveis de estilo só podem chegar a global com recorrência forte, diversidade de amostra e score elevado;
- distinguir preferência de estilo, regra de negócio, fato e veto.

#### Critério de aceite

- correção de um cliente não aparece em outro;
- promoção mostra claramente o escopo e `promotion_mode`;
- global material exige revisão; global de baixo risco exige threshold automático mais rigoroso;
- casos ambíguos permanecem candidatos para revisão.

#### Resposta do Antigravity — preencher

- Modelo de escopo:
- Critério de recorrência:
- UI/comando de consulta, revisão e revogação:
- Testes de não contaminação:
- Commit:

---

### N23-R16 — Suíte PostgreSQL não é E2E operacional do Gate N2.3

**Severidade:** CRÍTICA  
**Estado:** confirmado

#### Evidência

`tests/flywheel-learning-postgres-integration.test.mjs`:

- insere outcomes diretamente com SQL;
- chama motores pelo processo Node;
- persiste candidata manualmente;
- simula `/aprovardiretriz` por `UPDATE` SQL;
- insere auditoria manualmente com hash fictício;
- não executa WF-104;
- não executa WF-101;
- não recebe comando Telegram;
- não prova aplicação no próximo contexto;
- não prova bloqueio real da Memória Negativa no fluxo operacional.

#### Impacto

Os 10/10 testes provam integração parcial entre funções e PostgreSQL, mas não provam o Gate N2.3.

#### Correção obrigatória

Manter a suíte atual como teste de integração, renomeando sua classificação se necessário, e adicionar E2E que percorra o runtime real.

#### Critério de aceite E2E

1. criar outcomes por evento canônico;
2. executar WF-104 real;
3. persistir candidata;
4. entregar card por outbox sintética/canal capturado;
5. executar autopromoção controlada de uma candidata elegível e encaminhar outra de alto risco para revisão;
6. promover transacionalmente com `promotion_mode`, score, política e evidências;
7. registrar auditoria válida;
8. aplicar regra no próximo Context Packet;
9. recuperar exemplar promovido legitimamente;
10. bloquear anti-padrão ativo com base válida de promoção;
11. revogar e comprovar que deixou de ser aplicado;
12. provar isolamento por tenant e idempotência;
13. deixar efeitos externos desabilitados durante o teste.

#### Resposta do Antigravity — preencher

- Classificação correta da suíte atual:
- Novo teste E2E:
- Como o n8n foi executado:
- Evidências do banco e traces:
- Resultados dos 13 passos:
- Commit:

---

### N23-R17 — Não existe evidência operacional acumulada do flywheel

**Severidade:** MÉDIA  
**Estado:** confirmado

#### Evidência

As cinco tabelas estavam vazias na reauditoria. Tabela vazia não é erro por si só, mas contradiz alegações de ciclos reais/operacionais e impede avaliar aplicação, revogação e auditoria reais.

#### Impacto

Não há evidência de que o sistema tenha produzido e consumido conhecimento pelo runtime.

#### Correção obrigatória

Após corrigir o E2E, registrar um conjunto sintético isolado com tenant de teste e fornecer consulta reproduzível. Não fabricar histórico real nem contaminar o tenant operacional.

#### Critério de aceite

- registros coerentes no tenant sintético;
- cadeia completa de IDs e hashes;
- teardown seguro ou retenção como evidência marcada;
- tenant real permanece sem dados fabricados.

#### Resposta do Antigravity — preencher

- Tenant de teste:
- Contagens antes/depois:
- Cadeia de IDs:
- Evidência:
- Política de limpeza/retenção:
- Commit:

---

## 8. Achados de documentação, segurança e continuidade

### DOC-R01 — Arquivos de controle permanecem contraditórios

**Severidade:** ALTA  
**Estado:** confirmado

#### Evidência

- `PROJECT_STATE.md` declara versão `6.1.0`, mas `status.md` declara `v5.3.0`.
- `status.md` ainda aponta o Bloco 0 como próxima tarefa.
- `ROADMAP.md` marca remediação concluída, mas a sequência oficial mantém A0 e N2.3 pendentes.
- ROADMAP afirma WF-104 ativo; banco mostra `active=false`.
- PROJECT_STATE informa “nenhum bloqueador técnico”, apesar dos achados críticos.
- `SESSION_STATE.json` e `CODEX_HANDOFF.md` ainda descrevem uma fase anterior.

#### Impacto

Outra IA pode retomar do ponto errado, promover gates indevidamente ou repetir trabalho obsoleto.

#### Correção obrigatória

Após a remediação técnica, sincronizar todos os arquivos com o runtime comprovado. Não apagar a reprovação histórica; registrar superação com referência ao novo commit e nova auditoria.

#### Critério de aceite

- mesma versão, gate, marco, bloqueadores e próxima tarefa;
- timestamps atuais;
- afirmações compatíveis com banco e n8n;
- script automático detecta divergências essenciais.

#### Resposta do Antigravity — preencher

- Arquivos sincronizados:
- Estado final declarado:
- Script/check de consistência:
- Commit:

---

### DOC-R02 — Threat Model declara controles homologados que não existem integralmente

**Severidade:** ALTA  
**Estado:** confirmado

#### Evidência

`security/THREAT_MODEL.md` afirma:

- `owner_id == 'rafael'`, enquanto a identidade real não é comprovada dessa forma em todo o ciclo;
- auditoria append-only/imutável sem enforcement no banco;
- endpoint Telegram apenas valida e enfileira, embora ele baixe, persista e responda;
- TM-01 a TM-05 como `HOMOLOGADO`, apesar das falhas demonstradas.

#### Impacto

O documento transmite segurança não comprovada e pode ser usado como evidência incorreta de aprovação.

#### Correção obrigatória

Separar claramente:

- ameaça;
- controle planejado;
- controle implementado;
- controle testado;
- evidência;
- risco residual;
- status real.

#### Critério de aceite

Cada controle homologado possui teste negativo e evidência de runtime correspondente.

#### Resposta do Antigravity — preencher

- Controles reclassificados:
- Evidências adicionadas:
- Riscos residuais:
- Commit:

---

### DOC-R03 — Evidência dos backups declarados não foi localizada

**Severidade:** MÉDIA  
**Estado:** evidência insuficiente

#### Evidência

Os caminhos abaixo, citados durante a remediação, não existiam no container PostgreSQL na reauditoria:

```text
/tmp/backup_pre_flywheel.sql
/tmp/backup_pre_flywheel_n8n.sql
```

Isso não prova que nenhum backup exista em outro local, mas o dossiê não oferece caminho durável, hash, tamanho ou teste de restauração verificável.

#### Correção obrigatória

- apontar backups reais e duráveis;
- registrar timestamp, tamanho, SHA-256, origem e destino;
- provar restauração em ambiente isolado;
- não guardar backup importante apenas em `/tmp` de container.

#### Critério de aceite

- arquivos existentes;
- hashes reproduzíveis;
- restore concluído e validado;
- política de retenção documentada.

#### Resposta do Antigravity — preencher

- Local real dos backups:
- Tamanho:
- SHA-256:
- Comando de restore:
- Resultado do restore:
- Retenção:

---

### DOC-R04 — CHANGELOG preserva declarações de homologação incompatíveis com a auditoria

**Severidade:** MÉDIA  
**Estado:** confirmado

#### Evidência

O CHANGELOG possui entradas recentes declarando “Gates A0 e N2.3 Remediados”, “Complete & Homologated” e “Gate N2.3 PASS”, sem uma entrada posterior que registre o resultado desta reauditoria.

#### Impacto

Leitores podem interpretar reivindicação histórica como estado atual.

#### Correção obrigatória

Preservar o histórico, mas adicionar entrada de reauditoria informando que a homologação permanece suspensa, com referência a este dossiê.

#### Critério de aceite

O topo do CHANGELOG e os arquivos de estado apontam para o mesmo veredito vigente.

#### Resposta do Antigravity — preencher

- Entrada adicionada:
- Versão/estado vigente:
- Commit:

---

## 9. Matriz consolidada de achados

| ID | Severidade | Síntese | Gate | Estado |
|---|---|---|---|---|
| A0-R01 | CRÍTICA | D1 hospedado não alimenta fila PostgreSQL local | A0 | ABERTO |
| A0-R02 | CRÍTICA | Workflows ativos chamam bridges removidas | A0 | ABERTO |
| A0-R03 | CRÍTICA | Gateway executa mutação e resposta antes do n8n | A0 | ABERTO |
| A0-R04 | ALTA | Inventário/política divergem do runtime | A0 | ABERTO |
| A0-R05 | ALTA | Teste arquitetural produz falso positivo | A0 | ABERTO |
| A0-R06 | ALTA | telegram-runtime não foi reduzido a adaptador | A0 | ABERTO |
| A0-R07 | CRÍTICA | WF-101 contém fatos e recomendações codificados | A0 | ABERTO |
| N23-R01 | CRÍTICA | WF-104 não persiste candidatas | N2.3 | ABERTO |
| N23-R02 | ALTA | Revisão, correção e revogação não existem no WF-101 | N2.3 | ABERTO |
| N23-R03 | CRÍTICA | Cinco motores não integram runtime n8n | N2.3 | ABERTO |
| N23-R04 | CRÍTICA | Semantic Memory permite ativação fora da política | N2.3 | ABERTO |
| N23-R05 | CRÍTICA | Exemplares ativos por padrão e fallback sintético | N2.3 | ABERTO |
| N23-R06 | CRÍTICA | Memória Negativa ativa sem avaliação/evidência | N2.3 | ABERTO |
| N23-R07 | ALTA | Evidence Graph incompatível | N2.3 | ABERTO |
| N23-R08 | CRÍTICA | Migration destrutiva | N2.3 | ABERTO |
| N23-R09 | CRÍTICA | Constraints insuficientes | N2.3 | ABERTO |
| N23-R10 | CRÍTICA | Auditoria mutável e hash inválido aceito | N2.3 | ABERTO |
| N23-R11 | CRÍTICA | WF-104 sem isolamento de tenant | N2.3 | ABERTO |
| N23-R12 | ALTA | Sanitização de contexto insuficiente | N2.3 | ABERTO |
| N23-R13 | ALTA | Hashes não criptográficos | N2.3 | ABERTO |
| N23-R14 | ALTA | Matching da Memória Negativa impreciso | N2.3 | ABERTO |
| N23-R15 | ALTA | Candidatas recebem escopo global excessivo | N2.3 | ABERTO |
| N23-R16 | CRÍTICA | Teste PostgreSQL não é E2E operacional | N2.3 | ABERTO |
| N23-R17 | MÉDIA | Sem evidência operacional acumulada | N2.3 | ABERTO |
| DOC-R01 | ALTA | Arquivos de controle contraditórios | Ambos | ABERTO |
| DOC-R02 | ALTA | Threat Model declara controles não comprovados | Ambos | ABERTO |
| DOC-R03 | MÉDIA | Backup declarado sem evidência localizável | Ambos | ABERTO |
| DOC-R04 | MÉDIA | CHANGELOG não reflete reauditoria | Ambos | ABERTO |

**Total:** 28 achados — 14 críticos, 11 altos e 3 médios.

---

## 10. Ordem obrigatória sugerida para a segunda remediação

### Bloco R0 — Contenção e backup

- [ ] Manter WF-104 inativo.
- [ ] Desativar WF-11, WF-97 e WF-98 enquanto apontarem para bridges removidas.
- [ ] Criar backup durável de `visao360` e `n8n`.
- [ ] Registrar tamanho, SHA-256 e restore testado.
- [ ] Não apagar tabelas nem dados operacionais.

### Bloco R1 — Fechar o Gate A0 de verdade

- [ ] Implementar o transporte único entre webhook e WF-100.
- [ ] Remover mutações/respostas de negócio do gateway.
- [ ] Resolver ou arquivar `lib/telegram-runtime.ts`.
- [ ] Remover fatos estáticos do WF-101.
- [ ] Reconciliar runtime, JSON e manifesto.
- [ ] Reescrever o teste A0 para consultar runtime e provar E2E.

### Bloco R2 — Corrigir persistência e política de promoção N2.3

- [ ] Criar migration incremental, sem DROP.
- [ ] Forçar lifecycle controlado no banco, com `promotion_mode`, score, risco, evidências e versão de política.
- [ ] Implementar Learning Engine determinístico para autopromoção de baixo risco e roteamento de exceções para revisão.
- [ ] Implementar idempotência por tenant.
- [ ] Tornar auditoria append-only e verificável.
- [ ] Corrigir contratos Evidence Graph.
- [ ] Substituir hashes fracos por SHA-256 canônico.

### Bloco R3 — Integrar os motores ao n8n

- [ ] Escolher integração única e versionada.
- [ ] Remover duplicação de lógica dos Code Nodes.
- [ ] Registrar versões dos motores em cada execução.
- [ ] Isolar tenant, owner, entidade, domínio e período.
- [ ] Remover fixtures dos defaults operacionais.

### Bloco R4 — Fechar WF-104, autopromoção e controles humanos

- [ ] Persistir candidatas antes do card.
- [ ] Autopromover somente candidatas elegíveis pela política versionada; enviar ambíguas ou materiais para revisão.
- [ ] Implementar consulta, correção, rejeição, promoção excepcional e revogação no WF-101.
- [ ] Vincular intervenções críticas a Rafael autenticado, candidato e prazo.
- [ ] Usar outbox e idempotência para Telegram.
- [ ] Provar aplicação e revogação em contexto posterior.

### Bloco R5 — E2E e testes adversariais

- [ ] Executar o ciclo operacional completo pelo n8n.
- [ ] Testar duplicidade, concorrência, lease, retry e recuperação.
- [ ] Testar dois tenants.
- [ ] Testar autopromoção válida, promoção fora da política, regra de alto risco e ator não autorizado.
- [ ] Testar prompt injection multilíngue/indireto.
- [ ] Testar adulteração de auditoria.
- [ ] Testar banco vazio sem dados inventados.
- [ ] Executar regressão geral, lint e build.

### Bloco R6 — Sincronização documental

- [ ] Atualizar ROADMAP, PROJECT_STATE, status, CHANGELOG, SESSION_STATE e CODEX_HANDOFF.
- [ ] Atualizar Threat Model apenas com controles comprovados.
- [ ] Criar manifesto de release e pacote de evidências.
- [ ] Solicitar nova reauditoria do novo commit e runtime.

---

## 11. Critérios mínimos para reabrir a homologação

### Gate A0

Todos devem ser verdadeiros:

- [ ] toda entrada chega ao n8n antes de decisão, mutação ou resposta de negócio;
- [ ] exatamente uma fila canônica alimenta o núcleo local;
- [ ] zero workflow ativo usa `/api/bridge/*`;
- [ ] zero workflow ativo fora do inventário permitido;
- [ ] runtime importado corresponde ao Git por ID, versão/hash e estado;
- [ ] endpoint Telegram é transporte técnico puro;
- [ ] nenhum fato sintético/hard-coded pode aparecer no runtime real;
- [ ] E2E Telegram/webhook → n8n → PostgreSQL → outbox comprovado.

### Gate N2.3

Todos devem ser verdadeiros:

- [ ] toda regra aprendida nasce candidata; memória bruta/fatos explícitos seguem lifecycle próprio e escopo limitado;
- [ ] autopromoção ocorre somente pelo Learning Engine, com política versionada, score, evidências, risco, escopo e auditoria;
- [ ] revisão manual é solicitada apenas nos casos materiais, ambíguos ou de alto risco definidos;
- [ ] banco rejeita estados ativos sem base de promoção válida;
- [ ] WF-104 persiste candidatos reais e usa IDs persistidos;
- [ ] comandos de consulta, correção, revisão e revogação existem no runtime canônico;
- [ ] motores são efetivamente chamados pelo n8n;
- [ ] Context Packet usa somente conhecimento promovido, vigente e compatível;
- [ ] Exemplares não têm fallback sintético operacional;
- [ ] Memória Negativa possui base de promoção, é precisa e compatível com Evidence Graph;
- [ ] auditoria é append-only, verificável e vinculada à evidência;
- [ ] migration preserva dados e pode ser atualizada com segurança;
- [ ] isolamento de tenant comprovado;
- [ ] E2E operacional completo aprovado sem efeitos externos.

---

## 12. Perguntas obrigatórias ao Antigravity

Responder todas antes da próxima reauditoria:

1. Qual componente transporta hoje um evento do D1 hospedado até `channel_inbound_events` local, e onde está a prova de que está ativo?
2. Por que WF-11, WF-97 e WF-98 permaneceram ativos depois da remoção das rotas bridge?
3. Qual inventário foi usado para declarar zero violações se o banco n8n contém workflows adicionais ativos?
4. Por que o gateway ainda baixa arquivos, grava estado e envia Telegram diretamente?
5. Quem deve produzir o ACK conversacional e o protocolo: gateway ou n8n?
6. Por que o teste A0 imprime `CANONICAL_LOCAL_ACTIVE` sem consultar o runtime?
7. Por que o teste Telegram exige `sendTelegramText` no gateway se a política dá a resposta ao n8n?
8. Qual será o destino definitivo de `lib/telegram-runtime.ts`?
9. Por que o WF-101 contém clientes, contatos, valores e pontuações codificados?
10. Onde WF-104 persiste as candidatas antes de gerar seus comandos?
11. Como um ID de oito caracteres criado por `Math.random()` pode identificar uma candidata que não existe no banco?
12. Onde Rafael consulta, corrige, rejeita, promove excepcionalmente ou revoga aprendizados no runtime canônico?
13. Qual política, fórmula, threshold e classe de risco determinam `AUTO`, `OWNER_EXPLICIT` ou `MANUAL_REVIEW`?
14. Por que `createSemanticRule()` ainda aceita `PROMOTED` diretamente, contornando o Learning Engine?
15. Por que Golden Exemplars e Negative Memory nascem ativos sem avaliação e base de promoção?
16. Por que fixtures sintéticas são o argumento padrão do seletor de exemplares?
17. Como os cinco motores são chamados pelo n8n sem duplicação de lógica?
18. Por que a migration 09 apaga todas as tabelas com `CASCADE`?
19. Como a auditoria é imutável se a role do aplicativo pode atualizar e apagar linhas?
20. Por que `evidence_hash` aceita texto que não é SHA-256?
21. Como a Memória Negativa valida contra o Evidence Graph usando tipos ausentes no schema?
22. Por que WF-104 consulta outcomes sem tenant e envia a chat fixo?
23. Por que a suíte chamada E2E simula o comando com `UPDATE` SQL e não executa n8n?
24. Onde estão as evidências duráveis e os hashes dos backups declarados?
25. Qual documento representa hoje o estado verdadeiro, diante das divergências de versão e gate?

---

## 13. Modelo consolidado de resposta da remediação

O Antigravity deve criar um novo documento de resposta e preencher o quadro abaixo para **cada um dos 28 achados**.

```text
ID DO ACHADO:
STATUS PROPOSTO: OPEN | FIXED | MITIGATED | CONTESTED | NOT_APPLICABLE

1. Confirmação ou contestação fundamentada:

2. Causa raiz técnica:

3. Por que os testes/documentos anteriores não detectaram ou declararam incorretamente:

4. Correção implementada:

5. Arquivos, workflows, migrations e tabelas alterados:

6. Compatibilidade e migração de dados:

7. Risco da correção e rollback:

8. Testes positivos executados:

9. Testes negativos executados:

10. Evidência de runtime real:

11. Evidência de banco antes/depois:

12. Evidência de idempotência, tenant e autorização, quando aplicável:

13. Risco residual:

14. Commit exato:

15. Critério de aceite atendido e prova:
```

Contestação de um achado deve incluir comando, saída, arquivo, linha e explicação. Alegação sem evidência será tratada como achado aberto.

---

## 14. Pacote obrigatório para a próxima reauditoria

Entregar:

- commit e branch exatos;
- worktree limpo e sincronizado;
- relatório de resposta aos 28 achados;
- migrations incrementais;
- export dos workflows realmente importados;
- inventário/hash do runtime;
- consulta de workflows ativos;
- queries e constraints do flywheel;
- backup com hash e restore testado;
- trace E2E A0;
- trace E2E N2.3;
- resultados de testes negativos;
- `npm test`, lint e build;
- documentos de estado sincronizados;
- confirmação de WF-104 inativo até a homologação.

---

## 15. Conclusão

O commit `2f9e876` representa progresso relevante em relação ao baseline `940c38b`, principalmente pela remoção das rotas bridge do build, criação das tabelas, correções do DUR e contenção do WF-104.

Ainda assim, as falhas restantes atingem os próprios objetivos dos gates:

- A0 não possui uma cadeia operacional única e exclusiva no n8n;
- N2.3 não possui um ciclo de aprendizado controlado completo, persistido, integrado e auditável.

Assim, permanecem suspensas as declarações:

```text
CANONICAL_LOCAL_ACTIVE
ZERO VIOLAÇÕES LEGADAS
GATE A0 HOMOLOGADO
GATE N2.3 HOMOLOGADO
FLYWHEEL OPERACIONAL
```

O próximo passo é executar os Blocos R0 a R6, responder integralmente este documento e solicitar nova reauditoria independente.
