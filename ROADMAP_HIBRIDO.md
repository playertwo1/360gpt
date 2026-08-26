# Roadmap Operacional — Diretor 360 Híbrido

**Objetivo:** manter o site e o último Estado 360 acessíveis pela internet, enquanto Docker, n8n e os agentes processam os trabalhos no computador de Rafael.

**Público:** Rafael e qualquer agente autorizado trabalhando pelo Codex ou Antigravity.

**Última atualização:** 26 de agosto de 2026
**Fase atual:** H3 — Homologar a ponte site ↔ computador
**Próxima ação:** conferir os segredos e kill switches da ponte, ativar somente o piloto sintético e executar um novo caso ponta a ponta.
**Dados permitidos:** somente dados sintéticos em `OFFLINE_EVAL` até homologação formal do banco.

---

## Como utilizar este documento

- `[ ]` significa não iniciado.
- `[~]` significa em andamento ou parcialmente comprovado.
- `[x]` significa concluído com evidência registrada.
- Um item só deve receber `[x]` depois que seu critério de aceite for comprovado.
- Nunca colocar senhas, tokens, chaves ou dados reais de clientes neste arquivo.
- Ao terminar uma sessão, atualizar a seção **Registro de continuidade** e o `status.md`.
- Antes de começar uma nova sessão, ler nesta ordem: `AGENTS.md` → `status.md` → este arquivo → `CODEX_HANDOFF.md`.

## Arquitetura escolhida

```text
Telegram e navegador
        ↓
Site privado hospedado + fila + último Estado 360
        ↕ ponte autenticada WF-09
Computador de Rafael: Docker + PostgreSQL + n8n + agentes
        ↓
Google Drive + GitHub para continuidade e backup
```

O site permanece acessível com o computador desligado e exibe o último estado sincronizado. Novos trabalhos podem aguardar na fila; o processamento volta quando o computador e o Docker estiverem ligados.

## Painel geral

| Fase | Resultado esperado | Estado | Dependência principal |
|---|---|:---:|---|
| H1 | Acesso privado ao site confirmado | [x] | Login autorizado |
| H2 | Dados hospedados persistem com o computador desligado | [x] | H1 |
| H3 | Ponte site ↔ n8n processa e publica um caso | [ ] | H2 |
| H4 | Diretor 360 inicia com um clique | [ ] | H3 |
| H5 | Telegram recebe e enfileira texto | [ ] | H3 |
| H6 | Telegram processa PDF e Excel com segurança | [ ] | H5 |
| H7 | Visão 360 executiva completa e rastreável | [ ] | H6 |
| H8 | Segurança e privacidade homologadas para o piloto | [ ] | H1–H7 |
| H9 | Backup e restauração comprovados | [ ] | H3–H8 |
| H10 | Rotina diária documentada e testada por Rafael | [ ] | H1–H9 |

---

## H1 — Confirmar o site e o acesso

**Objetivo:** acessar o Dashboard pela internet usando somente contas autorizadas.

- [x] Abrir `https://visao-360-diretor.fael360092.chatgpt.site`.
- [x] Entrar com `fael@live.de`.
- [x] Entrar com `rafa.pedrosa1@gmail.com`.
- [x] Confirmar o Dashboard principal.
- [x] Confirmar a Mesa do Revisor em `/reviews`.
- [x] Repetir por outro navegador ou modo anônimo e confirmar exigência de login.
- [x] Confirmar que uma conta não autorizada recebe acesso negado.
- [x] Registrar data, conta usada e resultado, sem capturar dados sensíveis.

**Critério de aceite:** pelo menos uma conta autorizada acessa Dashboard e Mesa do Revisor em outro dispositivo, e uma sessão não autorizada é bloqueada. **ATENDIDO em 2026-08-26.**

**Evidências:**

- Data: `2026-08-26 17:50 America/Sao_Paulo`
- Resultado: `Dashboard e /reviews abriram em sessão autenticada; requisições sem autenticação receberam HTTP 403 nas duas rotas; site ainda sem snapshot hospedado.`
- Conta da sessão: `fael@live.de`, confirmada por Rafael.
- Navegador alternativo/anônimo: `solicitou login antes de permitir acesso`, confirmado por Rafael.
- Segunda conta: `rafa.pedrosa1@gmail.com` autenticou com senha e código recebido por e-mail e acessou Dashboard e `/reviews`, confirmado por Rafael.
- Referência ou captura: `validação visual no navegador e teste HTTP externo sem credenciais.`

---

## H2 — Validar banco e armazenamento hospedados

**Objetivo:** comprovar que o site mantém o último Estado 360 sem depender do computador ligado.

- [x] Confirmar os bindings hospedados de banco e arquivos.
- [x] Aplicar e conferir as migrações hospedadas.
- [x] Identificar um cliente e snapshot totalmente sintéticos para o teste.
- [x] Conferir o cliente no Dashboard hospedado.
- [x] Desligar os serviços locais sem apagar volumes.
- [x] Reabrir o site hospedado em sessão autenticada.
- [x] Confirmar que o último estado continua disponível.
- [x] Religá-los e confirmar ausência de perda ou duplicidade.

**Critério de aceite:** o mesmo snapshot sintético permanece disponível com Docker desligado e após a retomada. **ATENDIDO em 2026-08-26.**

**Evidências:**

- Snapshot/teste: `tenant-demo / cust-demo-001 / versão 37 / sha256:e94d61125cde7bb8fd88cdcec9f016119a75bd1d2d15b1eb663dba34ad71264b`.
- Persistência: `D1 ativo com 11 tabelas; R2 declarado como FILES e documento PDF sintético com storage_key hospedada`.
- Resultado com Docker desligado: `Dashboard recarregado e exibindo a mesma versão 37 e o mesmo hash`.
- Retomada: `PostgreSQL 17.6 e n8n 2.36.7 religados e saudáveis; volumes preservados`.

---

## H3 — Homologar a ponte site ↔ computador

**Objetivo:** receber um trabalho hospedado, processá-lo localmente e devolver o resultado ao site.

- [ ] Criar um segredo forte exclusivo para a ponte.
- [ ] Configurar o segredo no ambiente hospedado.
- [ ] Configurar o mesmo segredo localmente, fora do Git.
- [ ] Revisar os kill switches antes da ativação.
- [ ] Ativar o `WF-09` para o piloto sintético.
- [ ] Enfileirar um trabalho sintético pelo site.
- [ ] Confirmar lease/lock de uma única execução.
- [ ] Processar pelos workflows locais.
- [ ] Publicar o novo Estado 360 no site.
- [ ] Repetir a mesma entrada e confirmar `DUPLICATE_IGNORED`.
- [ ] Interromper a internet durante um teste e comprovar retomada segura.
- [ ] Confirmar que nenhum segredo foi gravado em log ou commit.

**Critério de aceite:** um caso sintético percorre o fluxo completo uma única vez e seu estado aparece no site hospedado.

**Evidências:**

- `correlation_id`: `pendente`
- Estado final: `pendente`
- Teste de repetição/retomada: `pendente`

---

## H4 — Operação local com um clique

**Objetivo:** Rafael iniciar e verificar o sistema sem usar comandos técnicos.

- [ ] Conferir se o Docker Desktop está aberto.
- [ ] Iniciar PostgreSQL e n8n automaticamente.
- [ ] Aguardar os healthchecks.
- [ ] Iniciar os componentes locais necessários.
- [ ] Testar a conexão da ponte hospedada.
- [ ] Mostrar estado simples: Docker, banco, n8n, site, ponte e Telegram.
- [ ] Mostrar quantidade de trabalhos aguardando.
- [ ] Mostrar data do último backup.
- [ ] Abrir Dashboard e Mesa do Revisor.
- [ ] Oferecer encerramento seguro sem apagar volumes.
- [ ] Testar após reiniciar o Windows.

**Critério de aceite:** Rafael liga o computador, abre o Docker e coloca o Diretor 360 online com um clique.

---

## H5 — Telegram hospedado: texto

**Objetivo:** receber mensagens enquanto o computador estiver desligado e processá-las quando ele voltar.

- [ ] Confirmar o bot e guardar o token somente no ambiente protegido.
- [ ] Confirmar o `chat_id` autorizado de Rafael.
- [ ] Criar ou rotacionar o segredo do webhook.
- [ ] Manter a ingestão desabilitada durante a configuração.
- [ ] Testar o endpoint sem segredo e confirmar bloqueio.
- [ ] Registrar o webhook com `secret_token`.
- [ ] Confirmar o endereço usando `getWebhookInfo`.
- [ ] Habilitar a ingestão para o piloto.
- [ ] Enviar uma mensagem sintética com o computador desligado.
- [ ] Confirmar que a mensagem aguarda na fila hospedada.
- [ ] Ligar o computador e processar a mensagem.
- [ ] Confirmar atualização do Dashboard e resposta adequada no Telegram.
- [ ] Repetir a mensagem e validar idempotência.

**Critério de aceite:** texto enviado pelo Telegram entra na fila, é processado uma vez e atualiza o site.

---

## H6 — Telegram multimodal: PDF e Excel

**Objetivo:** receber documentos e planilhas sem aceitar conteúdo como instrução do sistema.

- [ ] PDF digital testado.
- [ ] PDF digitalizado testado.
- [ ] Excel com uma aba testado.
- [ ] Excel com várias abas testado.
- [ ] Arquivo vazio ou corrompido rejeitado corretamente.
- [ ] Arquivo repetido não produz novo efeito.
- [ ] Limites de tamanho e tipos permitidos confirmados.
- [ ] Hash do arquivo preservado.
- [ ] Conteúdo marcado como `UNTRUSTED`.
- [ ] Teste de prompt injection em documento bloqueado.
- [ ] Lacunas e falhas aparecem claramente para revisão.

**Critério de aceite:** texto, PDF e Excel sintéticos são processados com evidência, limites, idempotência e tratamento explícito de erro.

---

## H7 — Visão executiva 360 completa

**Objetivo:** apresentar informação útil para decisão, sempre ancorada em evidências.

- [ ] Resumo executivo.
- [ ] Conta e elegibilidade.
- [ ] Performance, metas e produção.
- [ ] Financeiro e rentabilidade.
- [ ] Relacionamento e compromissos.
- [ ] Oportunidades elegíveis.
- [ ] Prazos e próximas ações.
- [ ] Conflitos e lacunas de dados.
- [ ] Estado decisório de cada item.
- [ ] Evidência navegável até a origem.
- [ ] Atualidade do snapshot visível.
- [ ] Pergunta objetiva quando houver revisão humana.
- [ ] Consistência entre Dashboard e Assessor Executivo.

**Critério de aceite:** Rafael consegue entender o que ocorreu, o que exige atenção e qual decisão precisa tomar sem consultar dados ocultos.

---

## H8 — Segurança e privacidade do piloto

**Objetivo:** operar um piloto sintético privado, sem exposição indevida ou autonomia transacional.

- [ ] Allowlist das duas contas comprovada.
- [ ] Allowlist do Telegram comprovada.
- [ ] Segredos ausentes do Git e dos logs.
- [ ] Kill switches testados.
- [ ] Limites de arquivo e requisição testados.
- [ ] Acesso não autorizado testado.
- [ ] Evidence Graph append-only testado.
- [ ] Quatro olhos e assinatura de revisão testados.
- [ ] Retenção e descarte documentados.
- [ ] Procedimento de rotação de segredos testado.
- [ ] Regra “somente dados sintéticos” visível na operação.
- [ ] Plano para homologação institucional separado do piloto pessoal.

**Critério de aceite:** testes demonstram bloqueio de acessos e efeitos externos não autorizados, sem credenciais versionadas.

---

## H9 — Backup e recuperação

**Objetivo:** recuperar o serviço sem depender da memória de uma pessoa ou agente.

- [ ] Código sincronizado com GitHub.
- [ ] ZIP versionado nas duas pastas do Google Drive.
- [ ] Backup do PostgreSQL local gerado.
- [ ] Workflows n8n exportados.
- [ ] Inventário de configurações sem segredos atualizado.
- [ ] Procedimento de restauração revisado.
- [ ] Restauração em ambiente limpo executada.
- [ ] Integridade e hashes conferidos.
- [ ] RTO e RPO medidos no teste.
- [ ] Resultado registrado no `status.md`.

**Critério de aceite:** uma restauração completa termina com dados e workflows íntegros dentro das metas documentadas.

---

## H10 — Rotina diária e aceite de Rafael

**Objetivo:** tornar o Diretor 360 utilizável sem conhecimento técnico.

- [ ] Checklist “começar o dia” validado por Rafael.
- [ ] Checklist “usar durante o dia” validado por Rafael.
- [ ] Checklist “encerrar o dia” validado por Rafael.
- [ ] Alertas apresentados em linguagem simples.
- [ ] Falhas comuns possuem orientação de recuperação.
- [ ] Manual rápido revisado pelo usuário.
- [ ] Uma sessão completa foi feita sem intervenção técnica.
- [ ] Feedback de Rafael registrado e priorizado.

**Critério de aceite:** Rafael completa uma jornada realista de teste, do Telegram à decisão, usando apenas cliques e mensagens.

---

## Etapa futura opcional — VPS 24 horas

A VPS está adiada. Ela somente será retomada se Rafael precisar de processamento com o computador desligado, maior disponibilidade ou múltiplos usuários simultâneos. Os artefatos do Marco 24 permanecem preservados para essa migração.

---

## Regras de continuidade entre Codex e Antigravity

Antes de alterar o projeto:

1. Executar `git status` e preservar qualquer mudança existente.
2. Executar `git pull --ff-only origin main` somente se não houver conflito local.
3. Ler `AGENTS.md`, `status.md`, `ROADMAP_HIBRIDO.md` e `CODEX_HANDOFF.md`.
4. Trabalhar apenas na primeira fase não concluída, salvo instrução expressa de Rafael.
5. Não marcar checklist como concluído sem teste ou evidência.

Ao encerrar uma sessão:

1. Atualizar os checkboxes e evidências desta página.
2. Atualizar no `status.md`: último marco, workflows, testes, erros, decisões e próximo passo exato.
3. Atualizar o registro abaixo.
4. Rodar os testes proporcionais à mudança.
5. Criar backup, commit e push quando a entrega estiver estável.

## Registro de continuidade

| Data/hora | Ferramenta | Fase | O que mudou | Testes/evidências | Próximo passo | Commit |
|---|---|---|---|---|---|---|
| 2026-08-26 | Codex | Planejamento | Roadmap híbrido criado; VPS adiada | Documentação revisada | Executar H1: validar acesso hospedado | consultar `git log` |
| 2026-08-26 17:50 | Codex | H1 | Dashboard e Mesa do Revisor validados em sessão autenticada; bloqueio anônimo confirmado | HTTP 403 em `/` e `/reviews` sem credenciais; navegador autenticado abriu as duas páginas | Rafael confirmar a conta conectada e testar pelo celular | consultar `git log` |
| 2026-08-26 | Rafael/Codex | H1 | Conta principal identificada e barreira de login confirmada em outro navegador/modo anônimo | `fael@live.de` acessou diretamente pela sessão existente; sessão alternativa pediu login | Testar `rafa.pedrosa1@gmail.com` e concluir H1 | consultar `git log` |
| 2026-08-26 | Rafael/Codex | H1 concluída | Segunda conta autorizada validada | `rafa.pedrosa1@gmail.com` completou senha + código e abriu Dashboard e `/reviews` | Iniciar H2: persistência hospedada | consultar `git log` |
| 2026-08-26 | Codex | H2 concluída | Persistência hospedada comprovada com serviços locais desligados | Snapshot `cust-demo-001` v37 e hash `e94d…1264b` permaneceram no site; D1 com 11 tabelas; serviços religados saudáveis | Iniciar H3: novo caso sintético pela ponte | consultar `git log` |

## Modelo para nova entrada

Copie uma nova linha e preencha sem apagar o histórico:

```text
| AAAA-MM-DD HH:mm | Codex/Antigravity | Hn | resumo objetivo | testes ou IDs | próxima ação única | hash/tag |
```
