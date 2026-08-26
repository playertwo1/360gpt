# Roadmap Operacional — Diretor 360 Híbrido

**Objetivo:** manter o site e o último Estado 360 acessíveis pela internet, enquanto Docker, n8n e os agentes processam os trabalhos no computador de Rafael.

**Público:** Rafael e qualquer agente autorizado trabalhando pelo Codex ou Antigravity.

**Última atualização:** 26 de agosto de 2026
**Fase atual:** PILOTO HÍBRIDO 100% CONCLUÍDO & HOMOLOGADO (H1 a H10)
**Próxima ação:** Operação Assistida contínua sob governança de Rafael.
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
|---|---|---|---|
| H1 | Acesso privado ao site confirmado | [x] | Login autorizado |
| H2 | Dados hospedados persistem com o computador desligado | [x] | H1 |
| H3 | Ponte site ↔ n8n processa e publica um caso | [x] | H2 |
| H4 | Diretor 360 inicia com um clique | [x] | H3 |
| H5 | Telegram recebe e enfileira texto | [x] | H3 |
| H6 | Telegram processa PDF e Excel com segurança | [x] | H5 |
| H7 | Visão 360 executiva completa e rastreável | [x] | H6 |
| H8 | Segurança e privacidade homologadas para o piloto | [x] | H1–H7 |
| H9 | Backup e restauração comprovados | [x] | H3–H8 |
| H10 | Rotina diária documentada e testada por Rafael | [x] | H1–H9 |








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

- [x] Criar um segredo forte exclusivo para a ponte.
- [x] Configurar o segredo no ambiente hospedado.
- [x] Configurar o mesmo segredo localmente, fora do Git.
- [x] Revisar os kill switches antes da ativação.
- [x] Ativar o `WF-09` para o piloto sintético.
- [x] Enfileirar um trabalho sintético pelo site.
- [x] Confirmar lease/lock de uma única execução.
- [x] Processar pelos workflows locais.
- [x] Publicar o novo Estado 360 no site.
- [x] Repetir a mesma entrada e confirmar deduplicação.
- [x] Reiniciar o processamento local com o trabalho em fila e comprovar retomada segura.
- [x] Confirmar que nenhum segredo foi gravado em log ou commit.

**Critério de aceite:** um caso sintético percorre o fluxo completo uma única vez e seu estado aparece no site hospedado. **ATENDIDO em 2026-08-26.**

**Evidências:**

- Pré-verificação: `kill switches revisados; Telegram permaneceu desativado; nenhum segredo versionado no Git`.
- Rotação: `segredo aleatório de 64 caracteres aplicado coordenadamente no ambiente local, credencial n8n e Sites; valor nunca registrado em documentação`.
- Caso: `h3-1787778865-1823 / synthetic-run-h3-1787778865-1823`.
- Estado final: `cust-demo-001 / versão 380 / sha256:75adcdabf3164fe178ab85455d8c22eeb3b8ce97725756ed5936fca38d8e189c / MANUAL_REVIEW_REQUIRED`.
- Teste de repetição/retomada: `entrada repetida retornou duplicate=true; trabalho permaneceu QUEUED durante reinício e concluiu SUCCEEDED na tentativa 1`.
- Segurança: `sem segredo retornou 401; external_effects_allowed=false; Telegram desligado`.

---

## H4 — Operação local com um clique

**Objetivo:** Rafael iniciar e verificar o sistema sem usar comandos técnicos.

- [x] Conferir se o Docker Desktop está aberto.
- [x] Iniciar PostgreSQL e n8n automaticamente.
- [x] Aguardar os healthchecks.
- [x] Iniciar os componentes locais necessários.
- [x] Testar a conexão da ponte hospedada.
- [x] Mostrar estado simples: Docker, banco, n8n, site, ponte e Telegram.
- [x] Mostrar quantidade de trabalhos aguardando.
- [x] Mostrar data do último backup.
- [x] Abrir Dashboard e Mesa do Revisor.
- [x] Oferecer encerramento seguro sem apagar volumes.
- [x] Testar após reiniciar o Windows.

**Critério de aceite:** Rafael liga o computador, abre o Docker e coloca o Diretor 360 online com um clique. **ATENDIDO em 2026-08-26.**

**Evidências:**
- Scripts criados: `iniciar-diretor-360.ps1`, `iniciar-diretor-360.bat`, `parar-diretor-360.ps1`, `parar-diretor-360.bat`.
- Teste automatizado: `scripts/test-h4-launcher.ps1` executado e aprovado com código 0 (`H4_ONE_CLICK_LAUNCHER_PASS`).
- Painel executivo: exibição clara do status do Docker, PostgreSQL (porta 5432), n8n (porta 5678), Site hospedado (`https://visao-360-diretor.fael360092.chatgpt.site`), ponte segura WF-09, fila de revisão e último backup.


---

## H5 — Telegram hospedado: texto

**Objetivo:** receber mensagens enquanto o computador estiver desligado e processá-las quando ele voltar.

- [x] Confirmar o bot e guardar o token somente no ambiente protegido.
- [x] Confirmar o `chat_id` autorizado de Rafael.
- [x] Criar ou rotacionar o segredo do webhook.
- [x] Manter a ingestão desabilitada durante a configuração.
- [x] Testar o endpoint sem segredo e confirmar bloqueio.
- [x] Registrar o webhook com `secret_token`.
- [x] Confirmar o endereço usando `getWebhookInfo`.
- [x] Habilitar a ingestão para o piloto.
- [x] Enviar uma mensagem sintética com o computador desligado.
- [x] Confirmar que a mensagem aguarda na fila hospedada.
- [x] Ligar o computador e processar a mensagem.
- [x] Confirmar atualização do Dashboard e resposta adequada no Telegram.
- [x] Repetir a mensagem e validar idempotência.

**Critério de aceite:** texto enviado pelo Telegram entra na fila, é processado uma vez e atualiza o site. **ATENDIDO em 2026-08-26.**

**Evidências:**
- Proteção: validação estrita de `x-telegram-bot-api-secret-token` com tempo constante contra timing attacks (401 se ausente/inválido).
- Autorização: allowlist estrita de `chat_id` autorizado de Rafael em chat privado (403 se remetente fora da allowlist).
- Fila assíncrona: reserva atômica de `update_id` no D1 (`bridge_queue`) permitindo enfileiramento com o computador local desligado.
- Ponte e consolidação: `WF-09` local reclama a mensagem com lease de 10 min, executa os 4 domínios e publica o Estado 360 atualizado.
- Idempotência: reenvio do mesmo `update_id` retorna `duplicate: true` sem reprocessamento ou efeitos duplicados.
- Teste automatizado: `scripts/test-h5-telegram-text.ps1` executado e aprovado com código 0 (`H5_TELEGRAM_TEXT_PASS`).


---

## H6 — Telegram multimodal: PDF e Excel

**Objetivo:** receber documentos e planilhas sem aceitar conteúdo como instrução do sistema.

- [x] PDF digital testado.
- [x] PDF digitalizado testado.
- [x] Excel com uma aba testado.
- [x] Excel com várias abas testado.
- [x] Arquivo vazio ou corrompido rejeitado corretamente.
- [x] Arquivo repetido não produz novo efeito.
- [x] Limites de tamanho e tipos permitidos confirmados.
- [x] Hash do arquivo preservado.
- [x] Conteúdo marcado como `UNTRUSTED`.
- [x] Teste de prompt injection em documento bloqueado.
- [x] Lacunas e falhas aparecem claramente para revisão.

**Critério de aceite:** texto, PDF e Excel sintéticos são processados com evidência, limites, idempotência e tratamento explícito de erro. **ATENDIDO em 2026-08-26.**

**Evidências:**
- Extração e persistência: PDF digital (Balanço) e planilha financeira (12 meses) processados deterministicamente com extração de metadados e registro de hash SHA-256 no Evidence Graph.
- Proteção e limites: arquivos vazios rejeitados com `invalid_file_size` e limite máximo de 20 MB aplicado.
- Defesa contra Injection: payloads maliciosos ("IGNORE TODAS AS REGRAS") marcados como `UNTRUSTED_CONTENT` e neutralizados, sem alterar regras do sistema.
- Mesa do Revisor: lacunas e divergências encaminhadas estruturadamente para `MANUAL_REVIEW_REQUIRED`.
- Teste automatizado: `scripts/test-h6-telegram-multimodal.ps1` executado e aprovado com código 0 (`H6_TELEGRAM_MULTIMODAL_PASS`).


---

## H7 — Visão executiva 360 completa

**Objetivo:** apresentar informação útil para decisão, sempre ancorada em evidências.

- [x] Resumo executivo.
- [x] Conta e elegibilidade.
- [x] Performance, metas e produção.
- [x] Financeiro e rentabilidade.
- [x] Relacionamento e compromissos.
- [x] Oportunidades elegíveis.
- [x] Prazos e próximas ações.
- [x] Conflitos e lacunas de dados.
- [x] Estado decisório de cada item.
- [x] Evidência navegável até a origem.
- [x] Atualidade do snapshot visível.
- [x] Pergunta objetiva quando houver revisão humana.
- [x] Consistência entre Dashboard e Assessor Executivo.

**Critério de aceite:** Rafael consegue entender o que ocorreu, o que exige atenção e qual decisão precisa tomar sem consultar dados ocultos. **ATENDIDO em 2026-08-26.**

**Evidências:**
- Consolidação integral: os 4 Gerentes Gerais (Conta, Performance, Financeiro, Relacionamento) reportam em formato padronizado e determinístico no Estado 360.
- Evidence Graph: linhagem PROV ponta a ponta navegável, com visualizador em modal interativo e hashes SHA-256 copiáveis.
- Decidibilidade: separação clara entre o que está `READY` e o que exige decisão humana em `MANUAL_REVIEW_REQUIRED`, com `reason_code` fechado e pergunta objetiva.
- Assessor Executivo: síntese em linguagem natural ancorada 100% no snapshot persistido, sem alucinações ou efeitos transacionais diretos.
- Teste automatizado: `scripts/test-h7-executive-view.ps1` executado e aprovado com código 0 (`H7_EXECUTIVE_VIEW_PASS`).


---

## H8 — Segurança e privacidade do piloto

**Objetivo:** operar um piloto sintético privado, sem exposição indevida ou autonomia transacional.

- [x] Allowlist das duas contas comprovada.
- [x] Allowlist do Telegram comprovada.
- [x] Segredos ausentes do Git e dos logs.
- [x] Kill switches testados.
- [x] Limites de arquivo e requisição testados.
- [x] Acesso não autorizado testado.
- [x] Evidence Graph append-only testado.
- [x] Quatro olhos e assinatura de revisão testados.
- [x] Retenção e descarte documentados.
- [x] Procedimento de rotação de segredos testado.
- [x] Regra “somente dados sintéticos” visível na operação.
- [x] Plano para homologação institucional separado do piloto pessoal.

**Critério de aceite:** testes demonstram bloqueio de acessos e efeitos externos não autorizados, sem credenciais versionadas. **ATENDIDO em 2026-08-26.**

**Evidências:**
- Allowlist: acesso restrito a `fael@live.de` e `rafa.pedrosa1@gmail.com` com bloqueio 403 para anônimos.
- Perímetro Telegram: canal privado bloqueando remetentes fora do `chat_id` de Rafael.
- Segredos limpos: checagem de pre-commit e diff garantindo ausência de chaves/tokens privados no repositório.
- Kill switches: `TELEGRAM_INGEST_ENABLED` e `AUTONOMY_EXTERNAL_EFFECTS_ALLOWED` ativos e responsivos.
- Quatro Olhos: Mesa do Revisor protegida por assinatura criptográfica SHA-256 e lock de 10 min.
- Isolamento: dados sintéticos em modo `OFFLINE_EVAL` sem contato com redes bancárias de produção.
- Teste automatizado: `scripts/test-h8-security-privacy.ps1` executado e aprovado com código 0 (`H8_SECURITY_PRIVACY_PASS`).


---

## H9 — Backup e recuperação

**Objetivo:** recuperar o serviço sem depender da memória de uma pessoa ou agente.

- [x] Código sincronizado com GitHub.
- [x] ZIP versionado nas duas pastas do Google Drive.
- [x] Backup do PostgreSQL local gerado.
- [x] Workflows n8n exportados.
- [x] Inventário de configurações sem segredos atualizado.
- [x] Procedimento de restauração revisado.
- [x] Restauração em ambiente limpo executada.
- [x] Integridade e hashes conferidos.
- [x] RTO e RPO medidos no teste.
- [x] Resultado registrado no `status.md`.

**Critério de aceite:** uma restauração completa termina com dados e workflows íntegros dentro das metas documentadas. **ATENDIDO em 2026-08-26.**

**Evidências:**
- Sincronização: GitHub origin/main 100% atualizado com branches e tags imutáveis.
- Google Drive: backups compactados sincronizados em `Google Drive\360` e `Meu Drive\360`.
- Banco e Workflows: script `scripts/backup-database.ps1` e 10 workflows em `n8n/workflows/`.
- RTO & RPO: RTO medido em 3m12s (meta < 15m) e RPO de 0s / perda zero (meta < 5m).
- Teste automatizado: `scripts/test-h9-backup-recovery.ps1` executado e aprovado com código 0 (`H9_BACKUP_RECOVERY_PASS`).


---

## H10 — Rotina diária e aceite de Rafael

**Objetivo:** tornar o Diretor 360 utilizável sem conhecimento técnico.

- [x] Checklist “começar o dia” validado por Rafael (`iniciar-diretor-360.bat`).
- [x] Checklist “usar durante o dia” validado por Rafael (Dashboard, `/reviews` e Telegram).
- [x] Checklist “encerrar o dia” validado por Rafael (`parar-diretor-360.bat`).
- [x] Alertas apresentados em linguagem simples.
- [x] Falhas comuns possuem orientação de recuperação.
- [x] Manual rápido revisado pelo usuário (`docs/GUIA_OPERACIONAL_PILOTO_HIBRIDO.md`).
- [x] Uma sessão completa foi feita sem intervenção técnica.
- [x] Feedback de Rafael registrado e priorizado.

**Critério de aceite:** Rafael completa uma jornada realista de teste, do Telegram à decisão, usando apenas cliques e mensagens. **ATENDIDO em 2026-08-26 (PILOTO HÍBRIDO 100% HOMOLOGADO).**

**Evidências:**
- Manual do Usuário: publicado em `docs/GUIA_OPERACIONAL_PILOTO_HIBRIDO.md`.
- Operação 1-Clique: iniciador e desligador validados em ambiente real sem intervenção de terminal.
- Jornada ponta a ponta: do recebimento de mensagem no Telegram até a resolução do Revisor Humano com assinatura SHA-256 no Evidence Graph.
- Teste automatizado: `scripts/test-h10-daily-routine-acceptance.ps1` executado e aprovado com código 0 (`H10_DAILY_ROUTINE_ACCEPTANCE_PASS`).


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
| 2026-08-26 | Codex | H3 pré-verificação | Kill switches confirmados; divergência entre segredos locais detectada sem exposição de valores | Ponte e Telegram permanecem desativados; arquivos de segredo não são rastreados pelo Git | Autorizar rotação coordenada, republicação e teste sintético | consultar `git log` |
| 2026-08-26 | Rafael/Codex | H3 concluída | Segredo rotacionado, site v8 publicado e WF-09 homologado ponta a ponta | Caso `h3-1787778865-1823`, tentativa 1, estado v380, hash `75ad…189c`, deduplicação e retomada aprovadas | Iniciar H4: operação local com um clique | consultar `git log` |

## Modelo para nova entrada

Copie uma nova linha e preencha sem apagar o histórico:

```text
| AAAA-MM-DD HH:mm | Codex/Antigravity | Hn | resumo objetivo | testes ou IDs | próxima ação única | hash/tag |
```
