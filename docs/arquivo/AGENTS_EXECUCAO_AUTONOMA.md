# ARQUIVADO — Execução autônoma, estado e histórico do projeto (AGENTS.md)

> Arquivado verbatim do `AGENTS.md` em 2026-10-19. Substituído pelo fluxo `STATE.md` → `ROADMAP.md` → `CHANGELOG.md` do ideias_standard.

## Execução autônoma, estado e histórico do projeto

### 1. Arquivos de controle

O projeto utiliza obrigatoriamente:

- `ROADMAP.md` — fonte oficial do planejamento e das próximas tarefas.
- `PROJECT_STATE.md` — estado operacional atual e ponto exato de retomada.
- `CHANGELOG.md` — histórico permanente das alterações realizadas.
- `AGENTS.md` — regras que governam a execução autônoma.

Esses arquivos devem permanecer sincronizados durante toda a execução.

### 2. PROJECT_STATE.md

O `PROJECT_STATE.md` representa o estado atual do projeto. Se não existir, crie-o automaticamente.

Deve conter, no mínimo: versão atual; fase atual; marco atual; tarefa atual; status da tarefa; última tarefa concluída; próxima tarefa; última validação executada; resultado da validação; último commit, quando disponível; bloqueios existentes; decisões pendentes; timestamp da última atualização; e instrução objetiva de retomada.

Formato recomendado:

```text
# PROJECT STATE

Version: X.Y.Z
Current phase: ...
Current milestone: ...
Current task: ...
Status: IN_PROGRESS

Last completed: ...
Next task: ...

Last validation: PASS | FAIL | NOT_RUN
Last commit: ...

Blockers:
- none

Pending decisions:
- none

Last update: YYYY-MM-DD HH:MM

Resume instruction:
Continue ROADMAP.md from ...
```

O arquivo deve ser atualizado sempre que houver mudança relevante no estado da execução. Antes de encerrar qualquer execução, atualize obrigatoriamente `PROJECT_STATE.md`. Na próxima execução, leia `PROJECT_STATE.md` antes de decidir onde continuar.

O estado registrado deve ser validado contra `ROADMAP.md` e contra o estado real do repositório. Nunca considere `PROJECT_STATE.md` correto cegamente se houver inconsistência com código, testes, Git ou roadmap.

### 3. CHANGELOG.md

Toda alteração relevante realizada no projeto deve ser registrada em `CHANGELOG.md`. Se não existir, crie-o automaticamente.

Utilize versionamento semântico quando aplicável:

- `PATCH` — correções, refatorações pequenas e ajustes sem mudança relevante de comportamento.
- `MINOR` — novas funcionalidades, integrações ou melhorias relevantes compatíveis com a versão anterior.
- `MAJOR` — mudanças estruturais ou incompatíveis.

Cada entrada deve registrar, quando aplicável: versão; data; funcionalidades adicionadas; alterações realizadas; correções; mudanças de arquitetura; mudanças de configuração; mudanças de banco de dados; integrações; segurança; itens removidos; e observações de migração.

Formato recomendado:

```text
## [X.Y.Z] - YYYY-MM-DD

### Added
- ...

### Changed
- ...

### Fixed
- ...

### Security
- ...
```

Não criar uma nova versão para alterações puramente temporárias ou artefatos sem impacto no projeto. Antes de concluir um marco relevante do roadmap, confirme que o changelog está atualizado.

### 4. Sincronização ROADMAP → STATE → CHANGELOG

Sempre que uma tarefa for concluída:

1. Execute os testes e validações definidos.
2. Corrija automaticamente problemas corrigíveis.
3. Confirme os critérios de aceite.
4. Atualize `ROADMAP.md`.
5. Atualize `PROJECT_STATE.md`.
6. Atualize `CHANGELOG.md` quando houver alteração relevante.
7. Faça commit quando permitido.
8. Identifique automaticamente a próxima tarefa elegível.
9. Continue a execução sem solicitar confirmação.

Nunca marque uma tarefa como concluída apenas porque o código foi escrito. `DONE` significa que os critérios de aceite e validações aplicáveis foram satisfeitos.

### 5. Retomada automática

Ao iniciar ou retomar uma execução:

1. Leia `AGENTS.md`.
2. Leia `PROJECT_STATE.md`.
3. Leia `ROADMAP.md`.
4. Leia o `CHANGELOG.md` recente.
5. Verifique o estado do Git.
6. Verifique se existem alterações não commitadas.
7. Compare o estado declarado com o estado real do projeto.
8. Determine a próxima tarefa executável.
9. Continue automaticamente.

Se `PROJECT_STATE.md` indicar uma tarefa incompleta, tente retomá-la antes de iniciar outra, salvo quando existir bloqueio documentado.

### 6. Interrupções e HARD BLOCKERS

Só interrompa a execução quando houver um HARD BLOCKER real, como:

- credencial necessária indisponível;
- permissão externa necessária;
- decisão de produto não definida;
- conflito entre requisitos que não possa ser resolvido com segurança;
- operação destrutiva irreversível que necessite autorização;
- dependência externa indisponível;
- necessidade inequívoca de intervenção humana.

Erros de código, build, lint, testes ou configuração não são automaticamente HARD BLOCKERS. Primeiro tente: `diagnosticar → corrigir → validar → tentar novamente`.

Se uma tarefa permanecer bloqueada, mas existirem tarefas independentes executáveis, registre o bloqueio e continue nelas.

### 7. Notificação obrigatória de interrupção

Quando a execução realmente não puder continuar sem intervenção humana:

1. Atualize `PROJECT_STATE.md`.
2. Atualize `ROADMAP.md` com o bloqueio.
3. Atualize `CHANGELOG.md` caso alguma alteração relevante tenha sido concluída antes da interrupção.
4. Preserve todo trabalho válido já realizado.
5. Faça commit seguro do trabalho concluído, quando permitido.
6. Tente enviar uma notificação para `fael@live.de`.

Assunto: `[360] Codex interrompido — intervenção necessária`.

Informe: projeto; versão; fase; marco; tarefa; última tarefa concluída; motivo da interrupção; diagnóstico realizado; tentativas de correção; ação necessária do usuário; próxima ação recomendada; e existência de risco ou urgência.

Não envie e-mail para problemas corrigidos automaticamente. O e-mail deve ser enviado somente quando houver uma interrupção real que exija intervenção humana.

Nunca armazene senhas, tokens SMTP ou outras credenciais no repositório. Utilize apenas o mecanismo seguro de notificação disponibilizado pelo ambiente ou projeto. Se o envio do e-mail falhar, registre a falha em `PROJECT_STATE.md`.

### Regra de continuidade

A conclusão de uma tarefa não encerra a execução.

Depois de concluir e validar uma tarefa:

`ROADMAP → validar → PROJECT_STATE → CHANGELOG → commit/checkpoint → próxima tarefa`

Continue percorrendo o roadmap enquanto existir trabalho seguro e executável.

Só encerre quando:

1. todo o roadmap elegível estiver concluído; ou
2. não existir nenhuma tarefa executável sem intervenção humana.

Antes de qualquer encerramento, deixe o projeto em estado recuperável, documentado e com uma instrução clara de retomada em `PROJECT_STATE.md`.
