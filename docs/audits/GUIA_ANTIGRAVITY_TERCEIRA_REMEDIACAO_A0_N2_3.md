# GUIA OPERACIONAL PARA O ANTIGRAVITY — TERCEIRA REMEDIAÇÃO A0/N2.3

**Projeto:** Diretor 360

**Repositório oficial:** `https://github.com/playertwo1/360gpt`

**Branch de referência:** `main`

**Commit reprovado na reauditoria:** `2e34b9ad49becc3c9ffdcfbb119edb7f5db86432`

**Data deste guia:** 03/09/2026 — America/Sao_Paulo

**Destinatário:** Antigravity

**Responsável pelo produto:** Rafael

**Auditor independente:** ChatGPT Codex

**Situação:** Gates A0 e N2.3 abertos; terceira remediação necessária

---

## 1. Instrução direta ao Antigravity

Este é o arquivo principal de retomada. Leia-o integralmente antes de alterar código, banco, Docker ou n8n.

Não considere os Gates A0 ou N2.3 homologados. A segunda remediação trouxe melhorias, mas foi reprovada porque o runtime real contradiz várias alegações documentais.

Seu objetivo é executar os blocos `T0` a `T7` deste guia, demonstrando cada correção no runtime real. Não marque uma tarefa como concluída apenas porque o código foi escrito ou porque um teste unitário passou.

`DONE` significa:

1. implementação concluída;
2. execução no runtime real;
3. teste positivo e negativo;
4. evidência reproduzível;
5. documentação sincronizada;
6. ausência de regressão;
7. critério de aceite atendido.

Não substitua este guia por uma explicação resumida. Quando houver divergência entre documentação e runtime, o runtime e as evidências reproduzíveis governam.

---

## 2. Ordem obrigatória de leitura

Leia os arquivos abaixo exatamente nesta ordem:

1. `AGENTS.md` — regras canônicas e limites do projeto;
2. este arquivo: `docs/audits/GUIA_ANTIGRAVITY_TERCEIRA_REMEDIACAO_A0_N2_3.md`;
3. `docs/audits/RESPOSTA_SEGUNDA_REMEDIACAO_CODEX_GATES_A0_N2_3.md`, começando pela seção **PARECER FORMAL DA REAUDITORIA INDEPENDENTE CODEX**;
4. `PROJECT_STATE.md` — use como referência, mas valide contra Git, banco, Docker e n8n;
5. `ROADMAP.md`, principalmente a Seção 11.3;
6. `CHANGELOG.md` recente;
7. `SESSION_STATE.json`;
8. `CODEX_HANDOFF.md`;
9. `policies/n8n-canonical-architecture.yaml`;
10. `app/api/ingest/telegram/route.ts`;
11. `scripts/test-n8n-canonical-architecture.mjs`;
12. `n8n/workflows/exported_all.json`;
13. `n8n/workflows/wf-100-local-telegram-intake.json`;
14. `n8n/workflows/wf-101-local-dispatcher.json`;
15. `n8n/workflows/wf-104-weekly-reflexion.json`;
16. `infra/postgres/init/09-flywheel-learning.sql`;
17. `infra/postgres/init/10-flywheel-learning-upgrade.sql`;
18. motores em `engines/learning`, `engines/knowledge`, `engines/feedback`, `engines/orchestration` e `engines/security`;
19. `tests/flywheel-learning-postgres-integration.test.mjs`;
20. `security/THREAT_MODEL.md`.

Depois da leitura, verifique o estado real antes de editar qualquer coisa.

---

## 3. Estado verdadeiro de partida

### 3.1 Git

- O commit reauditado é `2e34b9ad49becc3c9ffdcfbb119edb7f5db86432`.
- Na reauditoria, `HEAD` e `origin/main` estavam sincronizados.
- O documento de auditoria recebeu uma seção posterior do Codex que ainda pode estar sem commit. Preserve essa alteração.
- Não descarte mudanças locais do usuário.

### 3.2 Veredito vigente

- Gate A0: `OPEN / NOT_APPROVED`.
- Gate N2.3: `OPEN / NOT_APPROVED`.
- Gate N7: bloqueado por dependência.
- WF-104: deve permanecer inativo.
- Promoção automática operacional: suspensa até correção e nova auditoria.
- O sistema não pode se declarar `CANONICAL_LOCAL_ACTIVE`.

### 3.3 Resultado da reauditoria dos 28 achados

- 3 encerrados com evidência suficiente;
- 8 parcialmente corrigidos;
- 17 abertos.

Consulte a matriz individual na seção 10 do parecer formal incluído em:

`docs/audits/RESPOSTA_SEGUNDA_REMEDIACAO_CODEX_GATES_A0_N2_3.md`

### 3.4 Serviços observados

Ativos na reauditoria:

- PostgreSQL;
- n8n;
- telegram-poller;
- document-worker.

Parados na reauditoria:

- Docling;
- túnel Cloudflared antigo.

O telegram-poller estava saudável como serviço, mas com polling desabilitado. Portanto, não existia transporte comprovado da fila hospedada para o n8n local.

### 3.5 Problemas críticos confirmados

1. WF-11, WF-97 e WF-98 possuem `active=false`, porém continuam publicados por `activeVersionId`.
2. As versões publicadas desses workflows ainda contêm `/api/bridge/*`.
3. Eles continuam produzindo execuções recorrentes.
4. O teste canônico verifica somente `active=true` e gera falso positivo.
5. A rota hospedada tenta usar `127.0.0.1:5678`, que não representa o PC de Rafael no ambiente edge.
6. Quando grava no D1, não existe consumidor local ativo demonstrado.
7. WF-101 está inativo e não é iniciado pelo WF-100.
8. Existem eventos presos em `PROCESSING` com lease expirado.
9. O ramo `DOCUMENT` do WF-101 termina sem processar o documento.
10. Comandos de diretrizes respondem texto, mas não alteram o banco.
11. WF-104 duplica regras e não utiliza os motores compartilhados como fonte canônica.
12. A role `visao360_app` não possui acesso suficiente às tabelas do flywheel.
13. Migration 09 permanece destrutiva em instalação limpa.
14. Migration 10 possui incompatibilidades no ciclo `CANDIDATE` de Golden Exemplars.
15. A tabela de auditoria aceita `TRUNCATE`.
16. O Learning Engine promove como baixo risco instruções sobre efeitos externos, fórmula, retenção e acesso.
17. Reflexion aceita outcomes sem tenant e usa contrato antigo do Decision Utility.
18. Sanitização não bloqueia variações relevantes de prompt injection.
19. Decision Utility ainda usa hash próprio fraco.
20. A memória chamada semântica não possui pgvector nem recuperação vetorial operacional.
21. WF-102 está ativo com empresas e valores fictícios.
22. Arquivos de controle permanecem contraditórios.

---

## 4. Regras que não podem ser violadas durante a remediação

1. O n8n continua sendo a autoridade operacional exclusiva.
2. Sites e Telegram são canais de transporte e exibição, não motores de negócio.
3. PostgreSQL persiste; não interpreta regras.
4. Docling extrai; não decide nem corrige dados.
5. Não reintroduza lógica de negócio em rotas Next.js, pollers, scripts ou adaptadores.
6. Não coloque token, senha ou segredo em Git, logs, documentação ou export de workflow.
7. Não use dados reais nos testes de remediação.
8. Não apresente empresas fictícias no runtime operacional.
9. Não execute promoção operacional enquanto o Gate N2.3 estiver aberto.
10. Não ative WF-104 antes da nova auditoria.
11. Não preencha artificialmente histórico ausente.
12. Não declare risco residual zero sem teste negativo correspondente.
13. Não altere `AGENTS.md` silenciosamente para fazer o código parecer conforme.
14. Se a política de autopromoção for alterada, documente a decisão, limites, versionamento e rollback.
15. Use a role real da aplicação nos testes; teste como `postgres` não comprova capacidade do n8n.

---

## 5. Sequência de execução obrigatória

### T0 — Contenção e checkpoint

**Objetivo:** impedir que legados e dados fictícios continuem executando durante a correção.

- [ ] Confirmar Git e preservar todas as mudanças locais.
- [ ] Criar backup novo dos bancos `visao360` e `n8n` antes de migrations.
- [ ] Registrar tamanho e SHA-256 dos backups.
- [ ] Despublicar WF-11, WF-97 e WF-98 pelo mecanismo suportado pelo n8n.
- [ ] Despublicar WF-102 por conter dados fictícios operacionais.
- [ ] Confirmar `active=false` e `activeVersionId IS NULL`.
- [ ] Reiniciar o n8n se timers antigos permanecerem carregados.
- [ ] Manter WF-104 inativo.
- [ ] Observar e comprovar que não surgem novas execuções dos workflows despublicados.

**Não fazer:** apenas executar `UPDATE workflow_entity SET active=false`. Isso já foi tentado e não removeu a versão publicada.

**Aceite T0:** zero versões publicadas com bridge, zero novas execuções legadas e zero briefing fictício ativo.

### T1 — Corrigir o gate arquitetural

**Objetivo:** impedir falso positivo do Gate A0.

- [ ] Consultar `workflow_entity.active`.
- [ ] Consultar `workflow_entity.activeVersionId`.
- [ ] Associar `activeVersionId` a `workflow_history`.
- [ ] Procurar `/api/bridge/` nos nós da versão efetivamente publicada.
- [ ] Fazer o teste falhar se Docker, n8n ou PostgreSQL não estiverem acessíveis.
- [ ] Remover valores finais hardcoded como `legacyExceptions: 0` quando não forem derivados das verificações.
- [ ] Verificar também dados fictícios proibidos em versões publicadas.
- [ ] Exportar o n8n novamente e comparar hashes com o banco.

**Aceite T1:** o teste falha ao publicar deliberadamente uma fixture com bridge e passa somente após despublicá-la.

### T2 — Definir e provar o transporte Telegram/Sites → n8n local

**Objetivo:** criar um único caminho funcional até o WF-100.

Escolha apenas uma opção:

1. polling local autenticado e idempotente;
2. consumidor durável do D1 hospedado;
3. túnel HTTPS gratuito e autenticado até o WF-100.

Requisitos comuns:

- [ ] remover o fallback edge para `127.0.0.1`;
- [ ] registrar evento antes de ACK quando necessário;
- [ ] validar assinatura/segredo em tempo constante;
- [ ] validar a resposta estruturada do WF-100, incluindo `accepted`;
- [ ] aplicar idempotência por evento do canal;
- [ ] ter retry com backoff e dead-letter/revisão;
- [ ] preservar `correlation_id`, `source_event_id` e tenant;
- [ ] provar recuperação depois de interrupção.

**Aceite T2:** um evento sintético originado pelo mesmo ponto usado pelo Telegram hospedado chega uma única vez ao WF-100 e à fila local.

### T3 — Tornar WF-101 operacional

**Objetivo:** fazer o dispatcher consumir a fila, processar todos os tipos suportados e finalizar corretamente.

- [ ] definir acionamento canônico do WF-101;
- [ ] implementar claim transacional;
- [ ] recuperar leases expirados com segurança;
- [ ] limitar concorrência por protocolo/chat quando necessário;
- [ ] corrigir o ramo `DOCUMENT`;
- [ ] manter ramos `COMMAND`, `CONVERSATION`, `TEXT`, `PDF`, `IMAGE`, `XLSX` e `CSV` coerentes com o MVP;
- [ ] implementar finalização `COMPLETED`, retry e falha final;
- [ ] evitar resposta duplicada;
- [ ] calcular `/status` consultando o runtime, sem texto hardcoded;
- [ ] não afirmar que Estado 360 foi atualizado sem persistência confirmada.

**Aceite T3:** evento sintético atravessa WF-100 e WF-101, conclui uma vez e possui evidência auditável.

### T4 — Implementar governança real de diretrizes

**Objetivo:** transformar comandos simulados em operações reais.

- [ ] `/diretrizes` consulta candidatas, ativas, suspensas e revogadas no tenant autorizado;
- [ ] `/aprovardiretriz <id>` executa transação real;
- [ ] `/suspenderdiretriz <id>` executa transação real;
- [ ] `/revogardiretriz <id>` executa transação real;
- [ ] comandos exigem ator autorizado e estado anterior válido;
- [ ] toda mutação registra auditoria e idempotência;
- [ ] resposta Telegram deriva da linha alterada, não de texto presumido;
- [ ] revogação impede recuperação da regra em interações futuras.

**Aceite T4:** teste mostra antes/depois no banco e contexto posterior sem a regra revogada.

### T5 — Corrigir banco, migrations e permissões

**Objetivo:** garantir instalação limpa, upgrade seguro e acesso mínimo do n8n.

- [ ] substituir ou tornar não destrutiva a migration 09;
- [ ] testar do banco vazio até a migration 10;
- [ ] testar upgrade com dados existentes;
- [ ] corrigir status permitidos de Golden Exemplars;
- [ ] permitir `CANDIDATE` sem aprovação prévia;
- [ ] exigir metadados completos somente na promoção;
- [ ] exigir tenant, owner, evidência e idempotência onde materiais;
- [ ] conceder grants mínimos a `visao360_app`;
- [ ] impedir alteração de schema pela role da aplicação;
- [ ] impedir `UPDATE`, `DELETE` e `TRUNCATE` da auditoria pela aplicação;
- [ ] implementar e validar cadeia hash de auditoria.

**Aceite T5:** todos os testes de banco passam como `visao360_app`; operações proibidas falham.

### T6 — Corrigir Learning Engine, Reflexion e integração

**Objetivo:** garantir aprendizado contextual sem promoção perigosa ou lógica duplicada.

- [ ] trocar blocklist frágil por allowlist de categorias elegíveis a AUTO;
- [ ] aplicar comportamento fail-closed quando a classe de risco for desconhecida;
- [ ] impedir AUTO para segurança, acesso, identidade, autorização, efeitos externos, política, fórmula, fonte, retenção, compliance e escopo global;
- [ ] exigir tenant em todos os outcomes;
- [ ] não atribuir `OWNER_EXPLICIT` sem evento autenticado de Rafael;
- [ ] alinhar contrato entre Decision Utility e Reflexion;
- [ ] eliminar `NaN`, `undefined` e campos obsoletos;
- [ ] usar SHA-256 em todos os motores;
- [ ] gerar idempotência a partir de dados estáveis;
- [ ] reforçar sanitização na escrita e recuperação;
- [ ] escolher escopo mínimo demonstrável;
- [ ] expor motores por subworkflow ou serviço interno versionado chamado pelo n8n;
- [ ] remover cópias de fórmula e thresholds dos Code Nodes;
- [ ] decidir se haverá pgvector real ou renomear corretamente a memória atual.

**Aceite T6:** corpus adversarial não promove regra proibida; rerun não duplica candidata; nenhum outcome cruza tenant.

### T7 — E2E real, documentação e submissão

**Objetivo:** demonstrar a arquitetura completa e preparar nova reauditoria.

- [ ] teste WF-100 → WF-101 → motor → PostgreSQL → resposta sintética;
- [ ] teste de documento sintético pelo ramo correto;
- [ ] teste dos comandos de diretriz no n8n;
- [ ] teste de retry, lease expirado e concorrência;
- [ ] teste de idempotência e tenant;
- [ ] teste de revogação;
- [ ] teste de prompt injection em PT/EN;
- [ ] teste de categorias críticas de aprendizado;
- [ ] teste de ausência de dados fictícios em runtime publicado;
- [ ] `npm test`;
- [ ] `npm run lint`;
- [ ] `npm run build`;
- [ ] atualizar `ROADMAP.md`;
- [ ] atualizar `PROJECT_STATE.md`;
- [ ] atualizar `CHANGELOG.md`;
- [ ] atualizar `SESSION_STATE.json`;
- [ ] atualizar `CODEX_HANDOFF.md`;
- [ ] gerar export novo dos workflows;
- [ ] criar commit e push somente depois das validações;
- [ ] preparar novo dossiê de resposta, sem declarar homologação antes do Codex.

**Aceite T7:** pacote reproduzível permite ao Codex repetir as verificações sem depender de afirmações narrativas.

---

## 6. Comandos iniciais de diagnóstico

Execute a partir da raiz do projeto. Ajuste apenas nomes de containers se o Compose real usar nomes diferentes.

```powershell
git status --short --branch
git rev-parse HEAD
git fetch origin
git rev-parse origin/main
docker ps -a
npm test
npm run lint
npm run build
```

Inspecione o banco n8n considerando publicação, não apenas o booleano `active`:

```sql
SELECT id, name, active, "activeVersionId"
FROM workflow_entity
ORDER BY name;
```

Associe a versão publicada ao histórico e procure referências legadas:

```sql
SELECT
  we.id,
  we.name,
  we.active,
  we."activeVersionId",
  CASE WHEN wh.nodes::text LIKE '%/api/bridge/%' THEN true ELSE false END AS published_uses_bridge
FROM workflow_entity we
LEFT JOIN workflow_history wh
  ON wh."versionId" = we."activeVersionId"
WHERE we."activeVersionId" IS NOT NULL
ORDER BY we.name;
```

Inspecione permissões do flywheel:

```sql
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN (
    'promoted_knowledge',
    'golden_exemplars',
    'decision_outcomes',
    'negative_memory',
    'episodic_memory',
    'structured_memory',
    'flywheel_audit_events'
  )
ORDER BY table_name, grantee, privilege_type;
```

Não copie segredos, credenciais ou tokens para o dossiê. Evidências devem mostrar apenas nome da variável, presença/ausência e resultado sanitizado.

---

## 7. Testes negativos obrigatórios

Antes de solicitar nova auditoria, demonstre que o sistema rejeita:

1. workflow publicado contendo `/api/bridge/*`;
2. evento com segredo inválido;
3. evento Telegram duplicado;
4. processamento concorrente do mesmo lease;
5. documento que não chega ao processador;
6. comando de diretriz por ator não autorizado;
7. candidata sem tenant;
8. promoção sem evidência;
9. promoção AUTO envolvendo efeito externo;
10. promoção AUTO envolvendo fórmula de pontuação;
11. promoção AUTO envolvendo retenção de dados;
12. promoção AUTO envolvendo acesso ou identidade;
13. outcome sem tenant;
14. leitura entre tenants;
15. hash fora de SHA-256;
16. `UPDATE`, `DELETE` e `TRUNCATE` da auditoria pela role da aplicação;
17. candidata Golden com estado válido e promoção com metadados incompletos;
18. prompt injection em português e inglês;
19. rerun que tenta duplicar candidata;
20. presença de empresa fictícia em versão operacional publicada.

---

## 8. Evidências que devem ser guardadas

Para cada bloco, registre:

- comando executado;
- timestamp;
- ambiente e versão;
- resultado sanitizado;
- estado antes e depois;
- arquivo ou workflow alterado;
- teste positivo;
- teste negativo;
- risco residual real;
- rollback;
- commit que contém a correção.

Não use somente prints de interface. Prefira consultas, exports, hashes, logs sanitizados e testes automatizados reproduzíveis.

---

## 9. Formato da resposta que o Antigravity deve produzir

Crie um novo documento:

`docs/audits/RESPOSTA_TERCEIRA_REMEDIACAO_CODEX_GATES_A0_N2_3.md`

Para cada bloco T0–T7, informe:

```text
Bloco:
Status: DONE | PARTIAL | BLOCKED
Causa raiz:
Correção implementada:
Arquivos alterados:
Workflows alterados:
Migrations alteradas:
Estado do runtime antes:
Estado do runtime depois:
Teste positivo:
Teste negativo:
Evidência reproduzível:
Risco residual:
Rollback:
Commit:
Critério de aceite:
```

Para cada um dos 28 achados, informe também `FIXED`, `PARTIAL`, `NOT_FIXED` ou `CONTESTED`, sempre com prova. Não use “risco zero” quando não houver teste negativo específico.

---

## 10. Pacote obrigatório para devolver ao Codex

Ao terminar, envie ao Codex:

1. commit SHA completo;
2. branch;
3. `RESPOSTA_TERCEIRA_REMEDIACAO_CODEX_GATES_A0_N2_3.md`;
4. export atualizado do n8n;
5. lista dos workflows com `active` e `activeVersionId`;
6. prova de zero execuções legadas após a contenção;
7. prova E2E do transporte até WF-100;
8. prova E2E de WF-101;
9. prova das mutações reais dos comandos de diretriz;
10. grants da role `visao360_app`;
11. teste de instalação limpa e upgrade;
12. corpus e resultado dos testes adversariais;
13. hashes dos novos backups;
14. `npm test`, lint e build;
15. arquivos de estado sincronizados.

---

## 11. Prompt pronto para iniciar no Antigravity

Copie e envie o texto abaixo:

```text
Leia integralmente o arquivo docs/audits/GUIA_ANTIGRAVITY_TERCEIRA_REMEDIACAO_A0_N2_3.md e siga a ordem obrigatória de leitura definida nele.

O commit 2e34b9ad49becc3c9ffdcfbb119edb7f5db86432 foi reprovado na reauditoria independente. Gates A0 e N2.3 permanecem abertos. Execute os blocos T0 a T7 sem tratar documentação como prova do runtime.

Antes de alterar qualquer coisa, valide Git, Docker, n8n e PostgreSQL e preserve as mudanças locais. Corrija primeiro a publicação residual dos workflows legados, o transporte hospedado para o n8n local e o WF-101. Depois corrija governança, migrations, permissões, Learning Engine, Reflexion e testes E2E.

Não use dados reais nos testes, não exponha segredos, não ative WF-104, não promova regras operacionais e não declare os gates homologados. Ao finalizar, crie docs/audits/RESPOSTA_TERCEIRA_REMEDIACAO_CODEX_GATES_A0_N2_3.md no formato exigido pelo guia, atualize os arquivos de controle, faça commit/push e retorne o SHA completo para nova auditoria do Codex.
```

---

## 12. Ponto exato de retomada

Comece pelo **Bloco T0 — Contenção e checkpoint**.

A primeira prova necessária é mostrar, no banco real do n8n, que WF-11, WF-97, WF-98 e WF-102 foram efetivamente despublicados, com `activeVersionId IS NULL`, e que deixaram de gerar novas execuções.

Somente depois avance para T1. Não pule diretamente para o flywheel enquanto o Gate A0 continuar produzindo execuções legadas ou sem transporte operacional comprovado.
