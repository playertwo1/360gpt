# AGENTS.md — Diretor 360

Contrato curto para qualquer agente (Claude, Codex, Gemini, Antigravity…). Se uma instrução não serve à maioria das tarefas, ela não fica aqui: vai para `docs/` e é lida só quando precisar.

## Propósito
O Diretor 360 é o orquestrador executivo multiagente de Rafael (Agência 6895): recebe entradas pelo Telegram e pelo dashboard, aciona Gerentes Gerais e especialistas e entrega parecer executivo com evidência. Executor: n8n self-hosted em Docker com PostgreSQL local `visao360`.

> **Princípio central:** Fontes governam. Motores calculam. Especialistas investigam. Gerentes Gerais interpretam seus domínios. O Diretor integra e desafia. Rafael decide.

> **Regra canônica de execução n8n:** toda entrada operacional deve chegar a um workflow n8n antes de qualquer comando, decisão, classificação, cálculo, IA, pergunta, aprendizado, mutação de estado ou resposta. Sites, Telegram, adaptadores, scripts, APIs e serviços auxiliares não podem implementar caminhos paralelos. Docling somente extrai; PostgreSQL somente persiste; interfaces somente transportam e exibem. Alterar comportamento significa alterar workflow, contrato, política ou subworkflow versionado e chamado pelo n8n.

- Contrato comportamental completo (persona, precedência, handoff, Estado 360, segurança, testes de aceitação — antigas §1–§17): [`docs/arquitetura-agentes-360/CONTRATO_DIRETOR_360.md`](docs/arquitetura-agentes-360/CONTRATO_DIRETOR_360.md), versão 2.8. No container n8n: `/files/agents/CONTRATO_DIRETOR_360.md`.
- Mudança de comportamento do Diretor = mudança nesse contrato (nova versão + entrada em `docs/agents/CHANGELOG_CONTRATO.md`), nunca aqui.

## Mapa do contrato (leia só a seção necessária)
- §1 Identidade, mandato, tom de voz e classes de ação · §2 Precedência, Registro de Fontes e Evidence Graph
- §3 Estrutura executiva, domínios e Aprendizado Contínuo · §4 Modos, roteamento e pareceres
- §5 Identificadores e idempotência · §6 Handoff hierárquico, revisão manual e autorização
- §7 Validação e confiança · §8 Deduplicação, prioridade e Agenda Executiva
- §9 Estado 360 consolidado · §10 Fluxo obrigatório · §11 Auto-auditoria pré-resposta
- §12 Segurança e privacidade · §13 Resiliência e modo degradado · §14 Observabilidade e auditoria
- §15 Homologação e operação segura · §16 Proibições absolutas · §17 Testes mínimos de aceitação

## Fontes de verdade
- `STATE.md` — onde paramos, divergências e a próxima ação. **Comece por aqui.**
- `ROADMAP.md` — marcos e fila. `PROJECT.md` — problema, MVP e fora de escopo.
- `CHANGELOG.md` — histórico por versão (`## X.Y.Z — AAAA-MM-DD`).
- `PROJECT_STATE.md`, `SESSION_STATE.json`, `CODEX_HANDOFF.md`, `status.md` — histórico detalhado lido por scripts; em divergência, `STATE.md` registra qual prevalece.
- `docs/arquitetura-agentes-360/` — ADR-002, arquitetura n8n, workflows e contratos compartilhados.
- Ordem de precedência em divergência: estado real do código e dos serviços → contrato do Diretor → `STATE.md` → `ROADMAP.md`.

## Comandos
- Instalar: `npm ci`
- Lint: `npm run lint`
- Build: `npm run build`
- Testes completos: `npm test` (exige PostgreSQL local `visao360` e Docker; parte dos scripts roda em Windows PowerShell)
- Recortes: `npm run test:p0` · `npm run test:n7-security` · `npm run test:conversational`
- Gate arquitetural n8n: `node scripts/test-n8n-canonical-architecture.mjs`
- Núcleo local (Docker): `compose.n8n.yaml`; atalhos `INICIAR_DOCKER.bat` / `PARAR_DOCKER.bat`.

## Regras
1. Leia só o necessário: localize antes de abrir, prefira o trecho ao arquivo inteiro e filtre saídas grandes.
2. Separe fato verificado, hipótese e sugestão. Confira o código antes de afirmar que algo existe.
3. Faça a menor mudança correta. Sem abstração para necessidade hipotética; preserve o comportamento e o trabalho existentes. Melhoria fora do pedido vira sugestão, não código; na dúvida entre mudar por suposição e preservar, preserve e investigue.
4. Correção simples: implemente e teste. Feature média: spec curta. Mudança grande ou arriscada: também plano e revisão independente.
5. Registre os testes que rodou e o resultado. Não executado é `NOT_RUN`, nunca `PASS`. Não altere teste para esconder bug.
6. `DONE` só com critérios de aceite cumpridos e evidência de agora. Resposta "feito" da IA não é evidência.
7. Exigem aprovação humana: exclusões, ações irreversíveis, deploy/produção, gastos, segredos, dados pessoais, permissões e decisões de produto. Diante delas, pare antes e explique o risco, as opções e a recomendação.
8. Nunca versione senha, token, chave ou dado pessoal real; não os escreva em logs nem em evidências.
9. Se plano e código divergirem, registre a diferença em `STATE.md`; não esconda a falha.
10. Ao encerrar sessão relevante, atualize `STATE.md`: o que mudou, testes, bloqueios e **uma** próxima ação. Handoff = ID da tarefa, arquivos, testes, riscos, decisão pendente.

## Regras deste projeto
- n8n é a autoridade operacional exclusiva (ADR-002). Nada de caminho paralelo em site, Telegram, scripts ou APIs.
- Topologia canônica: `WF-100` entrada/deduplicação/fila; `WF-101` processamento, inteligência e entrega (nunca desativar, aposentar ou arquivar); `WF-103` contingência; `WF-104` reflexão semanal/Flywheel.
- Rafael decide: a IA nunca homologa gate, nunca ativa diretriz/AUTO por conta própria e nunca declara deploy remoto sem probe HTTP real (`.agents/rules/sovereignty_and_audit_guardrails.md`).
- Dados reais (POBJ, carteira PJ, clientes) não entram em evidência, log ou commit; use dados sintéticos em testes.
- `registries/project-manifest.json`, `compose.n8n.yaml` e o identificador `AGENTS_MD_V2.2` (`engines/orchestration/layered-memory-engine.mjs`) não mudam em tarefa de documentação.
- `AGENTS.md` é montado no n8n em `/files/contracts/AGENTS.md`; a frase "Regra canônica de execução n8n" é verificada por `scripts/test-n8n-canonical-architecture.mjs` e não pode sair daqui.

## Mapa rápido do repositório
- `n8n/workflows/` — workflows versionados (WF-100, WF-101, WF-103, WF-104 canônicos; demais históricos ou não promovidos).
- `infra/postgres/init/` — migrações PostgreSQL do `visao360`, numeradas e incrementais.
- `engines/` — motores determinísticos (POBJ, conta, orquestração, memória em camadas).
- `domains/`, `contracts/`, `policies/`, `registries/` — domínios, schemas, parâmetros mutáveis e catálogos.
- `services/` — adaptadores e workers (document-worker, Docling, telegram-poller), sem regra de negócio.
- `app/`, `lib/`, `core/` — dashboard web (Next/vinext) e rota de ingestão do Telegram (somente transporte).
- `tests/`, `scripts/`, `evals/` — suítes, gates e utilitários; `runbooks/` e `docs/` — operação e arquitetura.
- Estrutura completa e papel de cada pasta: `docs/agents/ESTRUTURA_PROJETO.md`.

## Onde mexer em tarefas comuns
- Comportamento, tom ou regra do Diretor → contrato (`docs/arquitetura-agentes-360/CONTRATO_DIRETOR_360.md`) + workflow n8n correspondente.
- Novo comando ou intenção do Telegram → `WF-101` (nunca em `app/api/ingest/telegram/route.ts`).
- Novo dado persistido → nova migração em `infra/postgres/init/`; nunca editar migração já aplicada.
- Cálculo de pontuação ou projeção → motor em `engines/` ou função SQL determinística, com teste.
- Planejamento ou status → `ROADMAP.md` e `STATE.md`; histórico → `CHANGELOG.md`.

## Evidência e verificação
- Toda entrega lista os comandos executados e o resultado (PASS / FAIL / NOT_RUN com motivo).
- `npm test` completo e testes de integração precisam do PostgreSQL local e, em parte, de Windows PowerShell; fora desse ambiente registre `NOT_RUN`.
- Antes de declarar gate concluído: estado real do n8n (ativo/publicado) e do banco conferido, não apenas o JSON versionado.

## Git
- Branch + PR para `main`; nunca commit direto na `main`, nunca force push.
- Mensagens de commit em pt-BR, no formato `tipo(escopo): resumo`.
- Merge só com aprovação de Rafael.
- Antes do push: `npm run lint` e `npm run build` quando viáveis; resultado de cada verificação na descrição do PR.
- Documentação movida é movida verbatim (sem apagar conteúdo); arquivos históricos vão para `docs/arquivo/`.
- Não commitar `.env*`, dumps, backups, `.local/` nem documentos reais de clientes.

## Índice do que saiu deste arquivo (movido verbatim em 2026-10-19)
| Conteúdo antigo | Onde está agora |
|---|---|
| Cabeçalho + §1–§17 (contrato do Diretor) | [`docs/arquitetura-agentes-360/CONTRATO_DIRETOR_360.md`](docs/arquitetura-agentes-360/CONTRATO_DIRETOR_360.md) |
| Changelog do contrato (v1.3–v2.8) | [`docs/agents/CHANGELOG_CONTRATO.md`](docs/agents/CHANGELOG_CONTRATO.md) |
| §18 Estrutura recomendada do projeto | [`docs/agents/ESTRUTURA_PROJETO.md`](docs/agents/ESTRUTURA_PROJETO.md) |
| Roadmap de implementação após v1.11 (desatualizado) | [`docs/arquivo/AGENTS_ROADMAP_POS_V1.11.md`](docs/arquivo/AGENTS_ROADMAP_POS_V1.11.md) |
| Execução autônoma, estado e histórico (desatualizado) | [`docs/arquivo/AGENTS_EXECUCAO_AUTONOMA.md`](docs/arquivo/AGENTS_EXECUCAO_AUTONOMA.md) |
| ROADMAP v11 completo (2026-09-04) | [`docs/arquivo/ROADMAP_v11_2026-09-04.md`](docs/arquivo/ROADMAP_v11_2026-09-04.md) |
