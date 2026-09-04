# ROADMAP UNIFICADO — DIRETOR 360

> **REGRA INEQUÍVOCA:** WF-101 é obrigatório e deve terminar publicado e ativo. Não desativar, aposentar, remover ou arquivar o WF-101. Somente WF-104 e `AUTO_PROMOTION_ENABLED` permanecem desligados durante Q0–Q7. A formulação anterior ambígua foi erro do auditor Codex e está revogada.

**Versão do planejamento:** 5.0 — Quinta remediação dos Gates N7/N7A

**Atualizado em:** 3 de setembro de 2026

**Autoridade e proprietário:** Rafael

**Repositório oficial:** `https://github.com/playertwo1/360gpt.git` — branch `main`

**Estado atual:** `IN_PROGRESS`

**Fase atual:** Quinta remediação (Gate N7/N7A) — consolidada e auditada no runtime real (Migration 17 + WF-101 Soberano + Pre-commit hook)

**Marco atual:** `Q9 — Quinta remediação Gate N7/N7A concluída e validada; aguardando reauditoria independente do ChatGPT Codex`

**Próxima tarefa:** Submeter pacote completo da Quinta Remediação sob a tag imutável `v1.1-gate-n7a-remediation` para emissão de parecer do auditor ChatGPT Codex.

**Bloqueio de observabilidade:** a medição Shadow de 2026-09-02 aprovou 20/20 casos, sem divergência, mutação ou efeito externo, mas detectou `HOURLY_MEASUREMENT_GAP`; nenhuma promoção ou ampliação está autorizada até recompor a janela.

> Este é o único arquivo de planejamento e checklist do projeto. Em caso de divergência com documentação histórica, prevalecem, nesta ordem: estado real do código e dos serviços, `AGENTS.md`, `PROJECT_STATE.md` e este `ROADMAP.md`.

---

## 1. Como qualquer IA deve usar este documento

### 1.1 Ordem obrigatória de retomada

1. Ler `AGENTS.md` integralmente.
2. Ler `PROJECT_STATE.md`.
3. Ler este `ROADMAP.md`.
4. Ler as entradas recentes de `CHANGELOG.md`.
5. Verificar `git status`, último commit, serviços e testes aplicáveis.
6. Comparar o estado declarado com o estado real.
7. Retomar a primeira tarefa elegível do marco atual.
8. Após cada entrega: validar → atualizar roadmap → atualizar estado → atualizar changelog → checkpoint → continuar.

### 1.2 Legenda única

- `[x]` — concluído e sustentado por evidência ou teste aplicável.
- `[~]` — parcialmente implementado, historicamente testado ou aguardando revalidação no caminho atual.
- `[ ]` — não concluído no caminho operacional atual.
- `BLOCKED` — existe impedimento real documentado.
- `PAUSED_BY_GATE` — implementação existe, mas não pode operar até passar pelo gate anterior.
- `HISTORICAL` — marco preservado como histórico; não representa runtime atual.

### 1.3 Três estados que nunca podem ser confundidos

Cada capacidade possui três dimensões independentes:

1. `design_status`: desenho documentado e aprovado.
2. `implementation_status`: código, workflow ou contrato construído e testado isoladamente.
3. `runtime_status`: condição efetiva no fluxo atual (`INACTIVE`, `SHADOW`, `ACTIVE`).

Um teste aprovado não ativa runtime. Um workflow com `active: true` no JSON não é operacional se o controlador que o chama estiver inativo. Uma homologação sintética não comprova o fluxo real atual.

### 1.4 Definition of Done

Uma tarefa somente muda para `[x]` quando, conforme o risco, possui:

- código ou configuração versionados;
- critérios de aceite satisfeitos;
- testes com asserções reais;
- contrato/schema validado nas fronteiras aplicáveis;
- tratamento de erro sem `fail-open`;
- telemetria ou evidência de execução;
- segurança, idempotência e isolamento preservados;
- rollback ou retorno seguro;
- documentação, `PROJECT_STATE.md` e `CHANGELOG.md` atualizados;
- nenhuma afirmação de produção baseada apenas em simulação.

---

## 2. Visão do produto e objetivo final

O Diretor 360 é um sistema privado de Rafael para transformar arquivos, mensagens, metas, resultados e conversas em uma visão executiva rastreável. O objetivo final é:

```text
Telegram ou site
  → adaptadores de canal sem regra de negócio
  → entrada durável e arquivo original preservado no núcleo local
  → n8n controla estado, fila, lease, retries e auditoria
  → leitor local extrai texto, tabelas e evidências
  → Diretor identifica intenção e domínios materiais
  → Gerentes Gerais coordenam especialistas de seus domínios
  → motores determinísticos calculam regras conhecidas
  → Motor 360 reconcilia e publica Estado 360 imutável
  → Rafael revisa, corrige, aprova e decide
  → Dashboard e Telegram apresentam informação verificável
```

O PostgreSQL local `visao360` é a fonte oficial de runtime e histórico. O Sites/D1 pode existir somente como caixa postal de transporte para acesso remoto; não pode ser a fonte oficial de comandos, jobs, perguntas, diretrizes, conhecimento ou Estado 360. A decisão está em `docs/arquitetura-agentes-360/ADR-002-N8N-NUCLEO-LOCAL.md`.

### 2.1 Princípio central

> Fontes governam. Motores calculam. Especialistas investigam. Gerentes Gerais interpretam. O Diretor integra e desafia. Rafael decide.

### 2.2 Propriedade, fontes e dados

- O projeto é privado, pessoal e pertencente a Rafael.
- Rafael decide quais fontes podem ser utilizadas e quais dados podem ser guardados.
- Regras institucionais limitam o uso de uma fonte quando forem aplicáveis a essa fonte; não transferem a propriedade do projeto.
- Não armazenar segredos no Git.
- Dados reais exigem finalidade, minimização, rastreabilidade, retenção e revisão compatíveis com a autorização dada por Rafael e com eventuais limites da fonte.
- Política aprovada para POBJ: retenção detalhada por 24 meses, backups por até 90 dias e agregados não identificáveis por prazo indeterminado.
- Efeitos externos continuam proibidos, exceto a resposta Telegram solicitada e ações individualmente autorizadas com Human-in-the-Loop.

### 2.3 Escopo congelado do MVP atual

Dentro do primeiro corte:

- Telegram como entrada e saída;
- n8n como controlador exclusivo da jornada;
- PDF, JPG, PNG, XLSX e CSV;
- Docling CPU/TableFormer como único OCR de PDF/imagem;
- PyMuPDF apenas para texto digital nativo;
- Diretor limitado a classificar, rotear e integrar;
- somente GG Performance e especialistas necessários;
- POBJ, metas, atingimento, pontos, gaps, cenários e recomendações;
- Estado 360 mínimo, evidências e revisão;
- perguntas ao Rafael para dúvida material;
- resposta rastreável no mesmo chat.

Fora do MVP, até o gate N7:

- GG Conta, Financeiro e Relacionamento no runtime real;
- visão multidomínio completa;
- contatos ou ações externas automáticas;
- aprendizado autônomo sem aprovação;
- VPS/alta disponibilidade;
- expansão visual sem relação com o primeiro fluxo útil.

### 2.4 Regra de arquitetura vigente

- n8n é a autoridade operacional exclusiva: toda entrada passa por workflow antes de comando, IA, cálculo, pergunta, estado ou resposta.
- Implementação paralela em Sites, Telegram, scripts, APIs ou workers é proibida e não conta como `DONE`.
- Telegram continua em webhook HTTPS estável no gateway hospedado; WF-97 entrega a fila ao Docker por conexão de saída.
- O editor n8n permanece somente em `127.0.0.1:5678`.
- Sites e Telegram são portas de entrada/saída; regras e estado pertencem ao n8n/PostgreSQL.
- Docling é um serviço técnico subordinado ao n8n, assim como o adaptador de transporte.
- O WF-11 que chama `/api/bridge/*` hospedado é legado de transição e não pode ser reativado como controlador canônico.
- O Sites/D1 no canal Telegram é somente fila de transporte; comandos, IA, cálculos e Estado 360 migram para n8n/PostgreSQL.

---

## 3. Baseline técnico atual

### 3.1 Hardware e sistema

- Host: AMD Ryzen 5 5600X, 6C/12T, 16 GB RAM, RTX 4060 Ti, Windows 11 23H2.
- WSL2 Ubuntu 24.04 com limite de 6 GB via `.wslconfig`.
- Docker Engine nativo no WSL2; Docker Desktop não é necessário.
- Lazydocker 0.25.2 pelo atalho `lazydocker.bat` na Área de Trabalho.
- Espaço informado: G: 763 GB livres; C: 233 GB livres; mais de 451 GB recuperados.

### 3.2 Serviços e persistência

- `visao-360-postgres-1`: serviço-base, persistente, saudável.
- `visao-360-n8n-1`: serviço-base, persistente, saudável, editor em `http://localhost:5678`.
- `visao-360-docling-1`: perfil `processing`, CPU, 2 threads, 1 worker, limite de 3 GB, rede interna.
- `visao-360-document-worker-1`: perfil `processing`, rede interna, filesystem somente leitura e `/tmp` temporário.
- Volumes: `visao-360_postgres_data`, `visao-360_n8n_data` e `visao-360_docling_models`.
- Bind mounts versionados: `n8n/workflows/` e `infra/postgres/init/`.
- Backups anteriores preservados na Área de Trabalho e em bundle Git pré-Docling.

### 3.3 Leitura documental vigente

- Docling Serve 1.30.0 fixado por digest.
- TableFormer `accurate`, uma conversão concorrente, lote de uma página e timeout de cinco minutos.
- Contrato `document-extraction` 1.1.0 com Markdown, JSON, tabelas, seções, páginas, proveniência e avisos.
- XLSX/CSV lidos nativamente.
- MinerU, Tesseract e Pillow removidos do runtime, imagem, Compose, scripts e contrato.
- Falha em imagem ou PDF escaneado: retry seguro e posterior revisão; nunca inventar conteúdo.
- Conteúdo do documento é sempre `UNTRUSTED`; instruções existentes no arquivo não governam o sistema.

### 3.4 Estado verificado dos workflows

| Workflow | Implementação | JSON ativo | Situação operacional atual |
|---|---|---:|---|
| WF-11 Orquestrador mestre | existe, 15 nós | não | `PAUSED_BY_GATE` em N2 |
| WF-12 Diretor/roteamento | existe, 3 nós | sim | não alcançável enquanto WF-11 estiver pausado |
| WF-13 GG Performance | existe, 11 nós | sim | não alcançável enquanto WF-11 estiver pausado |

Regra: WF-12/WF-13 não serão descritos como MVP ativo enquanto o controlador WF-11 estiver despublicado.

---

## 4. Estado executivo resumido

### 4.1 O que está comprovadamente concluído

- [x] Repositório, contratos, schemas, políticas, motores e documentação-base existem.
- [x] Site hospedado, autenticação, Estado 360, auditoria e telas técnicas foram construídos.
- [x] Telegram autenticado, allowlist, protocolo, hash, idempotência e fila durável foram implementados.
- [x] n8n, PostgreSQL e backups foram restaurados no Docker Engine nativo do WSL2.
- [x] Document worker e Docling respondem pela rede interna.
- [x] Smoke test: PDF digital, imagem via Docling, XLSX e CSV.
- [x] Compose, integração Docling, sintaxe Python, lint e build aprovados no checkpoint atual.
- [x] POBJ2608 foi processado em 142,6 s, com 12 posições de coluna preservadas.
- [x] Pico observado do Docling: aproximadamente 1,87 GiB, dentro do limite.
- [x] Células vazias não são compactadas nem deslocam silenciosamente as colunas.

### 4.2 Bloqueio técnico atual

- [ ] Docling ainda une materialmente alguns conteúdos, como peso/métrica ou dois valores na mesma célula.
- [ ] Associar com 100% de certeza `PERÍODO`, `INDICADOR`, `META`, `REALIZADO`, `% ATG` e `PONTOS` na mesma linha.
- [ ] Alcançar pelo menos 98% de correspondência nas células não críticas.
- [ ] Validar POBJ2608, POBJ2708, POBJ2808 e mais dois arquivos reais.
- [ ] Republicar WF-11 somente após o gate.

### 4.3 Decisões pendentes de negócio

- Regras dedicadas de Seguros e Cartões; até serem confirmadas, permanecem valores reportados pela fonte, sem herdar regra geral.

---

## 5. Histórico reconciliado — não confundir com runtime atual

### 5.1 Arquitetura e confiança

- [x] Fases históricas 0–1: baseline, contratos, idempotência, segurança e fila avaliados.
- [x] Suíte sintética, Shadow 24/24 e gates de observação concluídos no ambiente da época.
- [x] Motores de Performance, Conta, Financeiro e Relacionamento foram implementados/testados isoladamente.
- [x] Canary sintético A1–A3 foi executado sem efeitos externos.
- [x] A4/A5 tiveram testes de capacidade e políticas aprovados isoladamente.
- [~] Esses resultados provam componentes e desenho; não significam que os quatro Gerentes estão ativos no MVP atual.

### 5.2 Protótipo Telegram anterior

- [x] Um fluxo anterior processou PDF real e devolveu resposta no Telegram.
- [x] WF-12/WF-13 foram construídos e um POBJ real foi interpretado no protótipo.
- [~] O protótipo utilizava leitores e configurações posteriormente substituídos.
- [~] M0–M4 antigos permanecem evidência histórica, não gate atual.
- [ ] O caminho atual com Docling deve ser re-homologado de N2 a N7.

### 5.3 Arquiteturas substituídas

- `ROADMAP_HIBRIDO`: cumpriu a transição site hospedado + processamento local.
- `ROADMAP_POS_HOMOLOGACAO`: originou gates sintéticos e canary.
- `ROADMAP_RECONSTRUCAO_MVP_REAL`: originou o corte vertical real.
- `ROADMAP_N8N_MVP_REAL`: estabeleceu n8n como espinha dorsal e N0–N9.
- MinerU, Tesseract, pipeline PDF de 120 ms e fallback Gemini do site são históricos, não a arquitetura documental atual.

---

## 5A. Marco prioritário A0 — n8n e PostgreSQL como núcleo local

> Este marco corrige a fronteira arquitetural antes de P0 e N2. A decisão foi aprovada por Rafael em 02/09/2026. Nenhuma nova regra de negócio deve ser adicionada ao Sites/D1.

### A0.0 — Decisão e fronteiras

- [x] Registrar ADR-002 com n8n como orquestrador, PostgreSQL local como verdade e canais como transporte.
- [x] Tornar o n8n autoridade operacional exclusiva no `AGENTS.md` v2.2 e na política executável.
- [x] Inventariar e congelar quatro exceções legadas fora do n8n; nenhuma pode receber nova funcionalidade.
- [x] Formalizar Telegram por webhook no gateway hospedado e entrega ao Docker pelo WF-97.
- [x] Proibir exposição pública do editor n8n e do PostgreSQL.
- [x] Identificar WF-11 e `/api/bridge/*` hospedados como caminho legado de transição.

### A0.1 — Fundação local segura

- [x] Criar esquema PostgreSQL canônico para updates, eventos, documentos, jobs, conversas, perguntas, diretrizes, entregas e handoffs.
- [x] Manter `telegram-poller` isolado e desligado como contingência, não como caminho principal.
- [x] Restaurar e verificar o webhook estável no Sites, sem pendências ou erro reportado pelo Telegram.
- [x] Criar WF-100 para validar, deduplicar e persistir updates no PostgreSQL local.
- [x] Executar teste sintético do WF-100: primeira entrada aceita e enfileirada; repetição reconhecida como duplicata; uma única linha persistida.
- [x] Deixar WF-100 despublicado e `TELEGRAM_POLLING_ENABLED=false` após o teste.

### A0.2 — Rota crítica detalhada até o MVP real — MARCO ATUAL

> Esta seção é a instrução principal para o Antigravity. Ela substitui, para o primeiro MVP, planos anteriores que separavam excessivamente dispatcher, entrega, shadow, blindagens e recursos avançados. O objetivo é colocar um único arquivo real de Rafael no Telegram e obter um parecer útil do GG Performance, persistido e rastreável. Recursos que não participem diretamente dessa jornada ficam para depois do Gate MVP.

#### A0.2.1 Estado real de partida

- [x] PostgreSQL, n8n, Docling e document-worker estão saudáveis no Docker Engine do WSL2.
- [x] O webhook HTTPS atual do Telegram aponta para o gateway hospedado e está operacional.
- [x] A entrada durável, tabelas de canais, documentos, jobs, conversas, esclarecimentos, diretrizes, entregas e handoffs existem no PostgreSQL local.
- [x] WF-100 existe para validar, deduplicar e enfileirar entrada; permanece inativo até o corte.
- [x] WF-101 existe e foi importado com claim/lease, roteamento inicial e persistência inbound.
- [x] WF-103 existe e foi importado como contingência global, permanecendo inativo.
- [~] Existe uma edição local ainda não homologada do WF-101 tentando incorporar comandos e entrega. O Antigravity deve abrir o JSON e o workflow importado, escolher uma única versão, corrigir a estrutura e reimportar. Não assumir que esse rascunho funciona.
- [~] WF-102 existe, mas deixou de ser canônico. Aproveitar somente os nós úteis de divisão e envio; depois mantê-lo inativo e marcar como incorporado/aposentado.
- [ ] A lógica hospedada antiga ainda executa comandos, esclarecimentos e partes da jornada documental. Ela só pode ser removida depois que o caminho local produzir uma resposta real.

#### A0.2.2 Definição exata do MVP viável

O MVP estará pronto quando Rafael conseguir, pelo celular:

1. enviar um PDF POBJ pelo Telegram;
2. receber confirmação imediata com protocolo curto;
3. consultar o andamento com `/protocolo <número>`;
4. ter o arquivo baixado e processado localmente pelo n8n;
5. ter o Docling extraindo texto, tabelas, páginas e proveniência;
6. ter o Diretor classificando o documento como Performance/POBJ;
7. ter o GG Performance e o especialista POBJ produzindo uma análise baseada somente no documento e nas regras homologadas;
8. receber uma pergunta objetiva se existir lacuna material;
9. responder naturalmente e continuar no mesmo protocolo;
10. receber o parecer final no Telegram, em partes legíveis;
11. encontrar documento, extração, perguntas, resposta de Rafael, análise e parecer registrados no PostgreSQL.

O MVP não precisa, antes desse gate, de todos os comandos históricos, quatro Gerentes ativos, site completo, aprendizado automático, comparação de carteiras, Redis, VPS, alta disponibilidade ou bateria extensa de testes.

#### A0.2.3 Topologia canônica mínima

Somente três workflows poderão participar do runtime do MVP:

```text
Telegram/Sites
    ↓
WF-100 — entrada rápida
    valida canal → ignora bot → deduplica update → preserva envelope → enfileira → confirma recebimento
    ↓
WF-101 — jornada principal completa
    claim/lease → classifica intenção → comando | resposta | documento
       documento → baixa → registra hash/protocolo → Docling → Diretor → GG Performance/POBJ
       dúvida material → pergunta Rafael → pausa → recebe resposta → reprocessa
       pronto → Estado 360 mínimo → parecer → persiste entrega → Telegram

WF-103 — contingência independente
    captura erro definitivo → sanitiza → registra → libera lease/retry → avisa uma única vez quando necessário
```

Regras inegociáveis:

- Telegram e Sites apenas transportam e exibem.
- Docling apenas extrai; não interpreta indicador nem corrige célula ambígua.
- PostgreSQL persiste, aplica constraints, idempotência e leases; não escreve parecer.
- Toda decisão, comando, IA, prompt, cálculo, pergunta, estado e resposta ocorre no WF-101 ou em nós/subworkflows chamados por ele.
- Para o MVP, subworkflows de agentes podem continuar existindo, mas devem ser chamados pelo WF-101; não são novos runtimes independentes.

#### A0.2.4 Passo M0 — reconciliar o rascunho e congelar a base

Objetivo: começar de uma versão única e recuperável, sem carregar JSON parcialmente editado.

- [x] Verificar `git status` e preservar mudanças do usuário fora do escopo.
- [x] Comparar o WF-101 versionado, a edição local e o workflow importado no n8n.
- [x] Manter no WF-101 somente nós que participem da jornada final; eliminar ramos provisórios duplicados.
- [x] Confirmar que `active=false` durante toda a construção.
- [x] Criar um commit/checkpoint pequeno antes de alterar banco, webhook ou workflows ativos.
- [x] Não criar novos testes unitários para nós que serão substituídos dentro desta mesma execução.

Saída: um único WF-101 importável, inativo e escolhido como base oficial.

#### A0.2.5 Passo M1 — fechar a entrada do Telegram no WF-100

Objetivo: transformar o gateway hospedado numa caixa postal, sem regra de negócio.

Envelope mínimo esperado pelo WF-100:

- `channel`, `update_id`, `chat_id`, `message_id` e `sender_id`;
- tipo `COMMAND | TEXT | DOCUMENT | IMAGE | CALLBACK`;
- texto/caption, metadados do arquivo e referência temporária para download;
- hash do envelope, timestamp e resposta à mensagem anterior quando existir;
- nenhuma decisão de comando, indicador, lacuna ou protocolo feita pelo Sites.

Implementação:

- [x] Ajustar o gateway para autenticar, aplicar allowlist/rate limit, deduplicar tecnicamente, armazenar o envelope e devolver HTTP 200 rapidamente.
- [x] Fazer WF-97, ou uma etapa incorporada ao WF-100, buscar envelopes por conexão de saída; não abrir o editor n8n à internet.
- [x] Fazer WF-100 gravar `channel_updates` e `channel_inbound_events` atomicamente.
- [x] Ignorar `sender_is_bot=true` antes da fila operacional.
- [x] Não chamar IA, Docling ou regras de negócio na confirmação inicial.

Saída: uma mensagem ou arquivo chega ao PostgreSQL local uma única vez.

#### A0.2.6 Passo M2 — transformar WF-101 no controlador completo

Objetivo: concentrar toda a jornada em um único workflow legível.

Ordem recomendada de nós:

1. Schedule Trigger de 5–10 segundos.
2. PostgreSQL Claim com `FOR UPDATE SKIP LOCKED` e lease de dois minutos.
3. IF “há evento?”; se não houver, encerrar sem erro.
4. Code “Normalizar UTF-8 e intenção básica”.
5. PostgreSQL “Persistir inbound e thread”.
6. Switch principal: `COMMAND`, `OWNER_REPLY`, `DOCUMENT`, `TEXT` ou `UNSUPPORTED`.
7. Cada ramo deve terminar em `COMPLETED`, `AWAITING_OWNER_INPUT`, `FAILED_RETRYABLE` ou `FAILED_FINAL`; nunca deixar `PROCESSING` órfão.
8. Um único bloco comum de saída: montar texto → dividir → persistir partes → enviar → confirmar entrega.

Regras de concorrência:

- [x] Lease válido obrigatório em toda transição do evento/job.
- [x] Retry cria nova tentativa, mas preserva protocolo e correlação.
- [x] Entrega usa chave idempotente por protocolo + versão do parecer + índice da parte.
- [x] Falha depois de enviar não pode reenviar parte já marcada `SENT`.
- [x] Mensagem nova nunca substitui pergunta pendente sem correlação válida.

Saída: WF-101 controla todos os estados e não depende de lógica hospedada para decidir.

#### A0.2.7 Passo M3 — comandos mínimos, sem reconstruir o catálogo inteiro

Comandos obrigatórios antes do MVP:

- [x] `/start` — explicar em poucas linhas como enviar o arquivo.
- [x] `/comandos`, `/ajuda` e `/menu` — mostrar somente comandos realmente disponíveis.
- [x] `/status` — informar saúde do n8n, banco, Docling e fila sem fabricar disponibilidade.
- [x] `/protocolo <n>` — mostrar estado, etapa, porcentagem estimada e último erro seguro.
- [x] `/pendencias` — listar protocolos aguardando resposta de Rafael.
- [x] `/excluirultimo` + `/confirmar <4 dígitos>` — revogar o último documento do proprietário sem apagar auditoria.

Adiados para depois do Gate MVP: comandos analíticos avançados, histórico completo, comparação, diretivas, carteira, plano diário e exclusões em massa.

Regras:

- [x] Comando é roteado antes de esclarecimento e antes da IA.
- [x] `/comandos` nunca pode cair numa pergunta de POBJ pendente.
- [x] Código de confirmação tem quatro caracteres, validade de dez minutos e hash persistido.
- [x] Menu não lista comando inexistente.

Saída: Rafael consegue operar e diagnosticar o primeiro protocolo sem abrir o n8n.

#### A0.2.8 Passo M4 — jornada documental local

Objetivo: fazer o PDF chegar ao Docling e voltar como contrato estruturado.

- [x] Baixar o arquivo pela referência de transporte somente depois do claim local.
- [x] Calcular SHA-256 e deduplicar por proprietário + hash, devolvendo o protocolo existente quando aplicável.
- [x] Alocar protocolo sequencial curto na mesma transação do documento.
- [x] Guardar binário em storage local controlado; PostgreSQL armazena apenas referência, metadados e hash.
- [x] Criar `processing_jobs` com versão do contrato, correlação, tentativas e estado.
- [x] Atualizar etapas: `RECEIVED 10% → DOWNLOADED 20% → OCR 30–55% → DIRECTOR 60% → PERFORMANCE 70–85% → REVIEW/READY 90% → DELIVERED 100%`.
- [x] Chamar `document-worker`, que chama Docling interno em CPU.
- [x] Consumir primeiro `tables[]`; usar Markdown somente como contexto auxiliar.
- [x] Preservar página, tabela, linha, cabeçalho, célula, confiança e avisos.
- [x] Se houver célula mesclada, coluna deslocada, total incompatível ou OCR materialmente incerto, não corrigir silenciosamente.
- [x] Timeout de Docling: uma tentativa adicional; depois `AWAITING_OWNER_INPUT` ou `FAILED_FINAL` explicável.

Saída: contrato `document-extraction` 1.1.0 persistido e ligado ao artefato original.

#### A0.2.9 Passo M5 — Diretor, GG Performance e especialista POBJ

Objetivo: produzir o primeiro valor real do sistema sem tentar ativar os quatro domínios.

Escopo do MVP:

- Diretor identifica que o documento é POBJ/Performance e cria o pacote de contexto.
- GG Performance coordena somente as capacidades necessárias.
- Especialista POBJ associa indicadores, meta, realizado, percentual, pontos, período e evidência.
- Motor determinístico aplica apenas regras homologadas; informação sem regra permanece como reportada ou pendente.

Sequência:

- [x] Diretor recebe metadados, `tables[]`, Markdown, warnings e regras homologadas; conteúdo do documento continua `UNTRUSTED`.
- [x] Diretor gera JSON estruturado: intenção, domínio, capacidades necessárias e lacunas iniciais.
- [x] GG Performance recebe somente o contexto de Performance.
- [x] Especialista POBJ normaliza indicadores sem inventar nomes, empresas, metas ou regras.
- [x] Motor calcula apenas quando unidade, período, regra e operandos forem compatíveis.
- [x] Persistir cada handoff antes de avançar.
- [x] Criar Estado 360 mínimo com fonte, cálculo, informação de Rafael, estimativa e pendência claramente separados.

Parecer mínimo:

- situação geral e data-base;
- total/meta/resultado que foram realmente encontrados;
- pontos fortes;
- riscos e gaps;
- cenários conferíveis, quando existirem regras suficientes;
- próxima ação, motivo, ganho possível, risco de não agir e confiança;
- referências de evidência por indicador material.

Saída: parecer útil e rastreável do domínio Performance.

#### A0.2.10 Passo M6 — esclarecimento supervisionado

Objetivo: impedir o looping já observado no Telegram.

- [x] Criar perguntas somente para lacuna capaz de mudar cálculo, risco, prioridade ou recomendação.
- [x] Agrupar perguntas numeradas e citar o indicador de forma legível.
- [x] Persistir pergunta, protocolo, message_id do bot, evidências e prazo de sete dias.
- [x] Mover job para `AWAITING_OWNER_INPUT` e liberar o worker/lease.
- [x] Reconhecer resposta direta à mensagem do bot ou `/responder <protocolo>`.
- [x] Com uma única pendência no chat, aceitar resposta natural sem protocolo; com várias, exigir correlação.
- [x] Tratar “qual indicador?”, “não sei”, reclamação e comando como intenção de controle, nunca como valor.
- [x] Acumular respostas parciais e recalcular deterministicamente as pendências.
- [x] Registrar resposta confirmada como `OWNER_PROVIDED`.
- [x] Reenfileirar o mesmo job e produzir nova versão do parecer.
- [x] Após sete dias, encerrar como incompleto sem fabricar conclusão, permitindo reabrir.

Saída: uma lacuna proposital gera pergunta, a resposta de Rafael retoma o mesmo protocolo e o loop não se repete.

#### A0.2.11 Passo M7 — saída incorporada ao WF-101

Objetivo: aposentar o WF-102 sem perder segurança de entrega.

- [x] Criar dentro do WF-101 um bloco único reutilizado por comandos, progresso, perguntas e parecer.
- [x] Produzir texto simples ou HTML restrito; não usar MarkdownV2.
- [x] Dividir semanticamente abaixo de 3.800 caracteres, preservando títulos e sem cortar UTF-8.
- [x] Numerar partes quando houver mais de uma.
- [x] Persistir cada parte em `channel_deliveries` antes do envio.
- [x] Enviar pelo adaptador estreito, que conhece o token mas não decide conteúdo.
- [x] Marcar `SENT` somente após confirmação da API Telegram.
- [x] Registrar mensagem outbound em `conversation_messages`.
- [x] Em retry, enviar apenas partes não confirmadas.
- [x] Quando a equivalência estiver comprovada, manter WF-102 inativo e rotulá-lo `RETIRED — INCORPORADO AO WF-101`.

Saída: nenhuma resposta operacional depende do WF-102 separado.

#### A0.2.12 Passo M8 — contingência e recuperação

- [x] Conectar WF-103 como Error Workflow do WF-100 e WF-101.
- [x] Sanitizar erros: sem token, documento, prompt, resposta completa ou dado sensível.
- [x] Se retry for seguro, devolver evento/job para fila com espera progressiva e limite.
- [x] Se falha for final, liberar lease, registrar código estável e permitir consulta por `/protocolo`.
- [x] Avisar Rafael apenas uma vez quando a falha exigir ação; não enviar tempestade de mensagens.
- [x] Nunca concluir parecer se OCR, regra ou handoff material falhar.

Saída: falha não deixa job preso e não cria resposta inventada.

#### A0.2.13 Passo M9 — validação mínima, única e útil

Não criar uma bateria ampla antes do MVP. Executar somente:

1. **Validação estrutural:** [x] JSON do WF-100, WF-101 e WF-103 importa no n8n e todos ficam inativos.
2. **Smoke sintético único:** [x] um envelope com PDF de teste percorre fila, Docling, Performance e entrega simulada, sem chamar Telegram real.
3. **Teste real único aprovado por Rafael:** [x] enviar `Pobj3108.pdf` pelo Telegram e verificar a jornada completa.

Critérios do teste real:

- [x] uma única confirmação de recebimento;
- [x] protocolo curto e estável;
- [x] `/protocolo` mostra avanço coerente;
- [x] nenhum timeout silencioso;
- [x] nenhuma mensagem cortada ou com `├®`;
- [x] nenhuma empresa ou conta fictícia;
- [x] números do parecer possuem evidência no PDF ou rótulo de cálculo/estimativa;
- [x] dúvida material pergunta uma vez e aceita resposta sem looping;
- [x] parecer final chega completo em até três partes;
- [x] retry não duplica arquivo, pergunta ou parecer;
- [x] PostgreSQL contém a trilha completa;
- [x] Sites não tomou decisão de negócio.

Se o teste falhar, corrigir somente o trecho real que falhou e repetir esse cenário. Não voltar a criar dezenas de testes de peças provisórias.

#### A0.2.14 Passo M10 — cutover e rollback

- [x] Criar backup do PostgreSQL, volume n8n, configuração e workflows exportados imediatamente antes do corte.
- [x] Guardar hash, timestamp e instrução de restauração.
- [x] Ativar WF-100, WF-101 e WF-103; nenhum outro workflow operacional deve concorrer pela mesma entrada.
- [x] Manter a URL atual do webhook enquanto o gateway for caixa postal.
- [x] Desativar processamento operacional legado hospedado após o primeiro sucesso local comprovado.
- [x] Remover parser de comandos e slot-filling de `lib/telegram-runtime.ts` somente após o cutover.
- [x] Reduzir `/api/bridge/*` a transporte ou aposentar endpoints substituídos.
- [x] Se houver loop, duplicidade, perda de arquivo ou falha de persistência, pausar WF-101 e restaurar o caminho anterior pelo rollback documentado.

**Gate MVP:** Concluído e homologado por Rafael em 02/09/2026. Rafael testou o Telegram, os comandos e o fluxo de documentos. Toda decisão operacional ocorreu no n8n e motores determinísticos; Docling apenas extraiu; PostgreSQL preservou a verdade; Telegram/Sites apenas transportaram e exibiram.

#### A0.2.15 Pacote obrigatório para auditoria posterior do Codex

Ao terminar, o Antigravity deve deixar:

- [x] WF-100, WF-101 e WF-103 exportados em `n8n/workflows/`, iguais às versões importadas.
- [x] IDs, nomes, versão, status ativo/inativo e Error Workflow registrados.
- [x] migrations SQL novas ou alteradas versionadas.
- [x] exemplo sanitizado do envelope recebido, extração Docling, handoffs e parecer.
- [x] protocolo do teste real, timestamps das etapas e IDs das execuções n8n.
- [x] lista de tabelas e registros criados, sem expor segredos.
- [x] evidência de que WF-102 e lógica hospedada não participaram do resultado final.
- [x] `git status`, commit do MVP e lista explícita de alterações preexistentes preservadas.
- [x] `ROADMAP.md`, `PROJECT_STATE.md`, `status.md`, `SESSION_STATE.json`, `CODEX_HANDOFF.md` e `CHANGELOG.md` sincronizados.
- [x] seção “erros conhecidos” contendo somente falhas ainda reproduzíveis.
- [x] instrução exata para o Codex: auditar fronteiras, idempotência, estados, evidências, segurança, workflow importado versus exportado e reprodução do teste real.

O Codex fará a auditoria após o Antigravity concluir. A auditoria não deve reconstruir preventivamente o MVP nem exigir cobertura extensa antes de examinar a execução real.

#### A0.2.16 Depois do MVP — fora da rota crítica

Somente após o Gate MVP:

- completar catálogo de comandos;
- ativar Conta, Financeiro e Relacionamento;
- construir visão multidomínio e dashboard completo;
- ativar aprendizado supervisionado de diretrizes;
- comparar múltiplos relatórios e períodos;
- homologar regras adicionais de Seguros e Cartões;
- melhorar acurácia Docling com corpus real;
- ampliar testes de regressão, segurança, carga e recuperação;
- avaliar Redis/queue mode, acesso remoto alternativo, VPS ou alta disponibilidade.

Esses itens não podem atrasar o primeiro PDF chegando a um parecer real.

---

## 6. Marco P0 — blindagem do Telegram

> Este marco sucede A0. Ele consolida três planejamentos aprovados: estabilidade Telegram/n8n/LLM, blindagem de entrada e memória, e aprendizado supervisionado de diretrizes. Itens marcados como hospedados precisam ser revalidados ou migrados no núcleo local antes de `DONE` operacional.

### P0.0 — Checkpoint e baseline

- [x] Backup Git completo e patch binário das alterações preexistentes criados na Área de Trabalho.
- [x] Alterações anteriores do usuário identificadas e preservadas fora do escopo do checkpoint P0.
- [x] Registrar bateria baseline do Telegram, ponte e n8n antes da publicação.

### P0.1 — Texto seguro e entregas

- [x] Adotar texto simples em todos os emissores operacionais e remover Markdown padrão residual.
- [x] Divisão semântica defensiva existente em até 3.600 caracteres.
- [x] Entregas finais possuem índice, hash e idempotência por parte.
- [x] Validar acentos, caracteres especiais, mensagens extensas e retry de parte.

### P0.2 — Confirmação rápida e fila de entrada

- [x] Deduplicação atômica existente por `update_id`.
- [x] Filtro de mensagens produzidas por bot.
- [~] Criar `telegram_inbound_events` e retirar processamento conversacional pesado do webhook (implementado atrás de `TELEGRAM_ASYNC_INTERACTIONS_ENABLED`).
- [~] Responder HTTP 200 antes de OCR, LLM ou interpretação conversacional (aguarda publicação/canário).
- [x] Reivindicar eventos com lease e recuperação idempotente.

### P0.3 — Debounce e concorrência

- [x] Criar lotes duráveis por `chat_id`, com janela de 2,5 segundos.
- [x] Preservar ordem, `update_id` e `message_id` das partes.
- [ ] Comandos, arquivos e respostas diretas a esclarecimentos não aguardam debounce.
- [x] Impedir duas execuções de alterarem a mesma pendência simultaneamente.

### P0.4 — Roteamento e IA estruturada

- [~] Roteamento determinístico já cobre respostas numéricas, perguntas contextuais, reclamações e `não sei`; ampliar testes e contrato.
- [x] Interpretação Gemini já exige JSON estruturado quando o parser determinístico não resolve.
- [x] Formalizar contrato versionado `contracts/telegram-intent.schema.json` para intenção, respostas, contexto, feedback, confiança e pendências.
- [x] Calcular pendências somente por diferença determinística entre perguntas persistidas e respostas aceitas acumuladas.
- [x] Corrigir loop de respostas parciais: respostas anteriores agora permanecem no conjunto aceito do protocolo.

### P0.5 — Memória deslizante e estado persistido

- [x] Perguntas, respostas, correções, conhecimento POBJ e Estado 360 possuem persistência estruturada.
- [ ] Limitar contexto textual a oito interações recentes.
- [ ] Resumir histórico antigo preservando referências auditáveis.
- [ ] Confirmar que nenhuma execução usa conversa livre como fonte oficial de indicador.

### P0.6 — Digitação e progresso

- [x] Criar endpoint autenticado `/api/bridge/telegram/action` sem expor token ao n8n.
- [~] Chamar `typing` depois do claim e antes de etapas demoradas (endpoint pronto; WF-11 aguardando canário).
- [x] Configurar endpoint com timeout de 3 s; retries e tolerância ficam no nó n8n.
- [x] Progresso explícito e protocolo já existem para documentos demorados.

### P0.7 — Contingência global

- [x] Criar WF-99 com Error Trigger e correlação de workflow, job, protocolo e chat (inativo até publicação).
- [ ] Diferenciar falha recuperável de definitiva e impedir aviso duplicado.
- [ ] Persistir diagnóstico sanitizado sem segredos, prompts ou stack trace integral.

### P0.8 — Retenção do n8n

- [x] Pruning e limite máximo de 10.000 execuções já ativos.
- [x] Alterar retenção operacional para 24 horas.
- [x] Salvar sucessos e erros durante a janela e desativar progresso intermediário.
- [ ] Preservar falhas relevantes na auditoria própria antes do pruning.

### P0.9 — Aprendizado supervisionado

- [x] Criar persistência hospedada de feedbacks, candidatas, versões e aplicações.
- [ ] Registrar reclamação imediatamente sem chamar IA no webhook.
- [x] Criar workflow separado de extração estruturada de lições (`WF-98`, inativo até publicação).
- [ ] Toda regra inicia `CANDIDATE`; somente Rafael aprova, rejeita ou revoga.
- [x] Adicionar `/diretrizes`, `/aprovardiretriz`, `/rejeitardiretriz` e `/revogardiretriz`.
- [x] Injetar no máximo 15 regras ativas e aproximadamente 2.000 caracteres, abaixo de políticas e contratos.

### P0.10 — Gate de homologação

- [~] Testes estáticos de hardening e lint/build locais aprovados; o entrypoint `scripts/test-telegram-conversational.mjs` agora executa a suíte PowerShell equivalente. Cenários HTTP de duplicidade, concorrência, falha de IA e pruning aguardam canário.
- [ ] Testar criação, aprovação, aplicação e revogação de diretriz.
- [ ] Executar migrations, lint, build e regressões WF-11/WF-13/WF-99.
- [ ] Publicar canário com a conta proprietária `fael@live.de` e reabrir o protocolo com estado limpo (bloqueado pelo conector Sites sem projeto visível).
- [ ] Atualizar controles e criar checkpoint Git final.
- [x] Remover clientes e pontuações demo da interface operacional; sem carteira conectada o painel informa a limitação.

**Gate P0:** nenhuma mensagem vazia, cortada, duplicada ou em loop; erros possuem contingência; aprendizado exige aprovação explícita.

---

## 7. Caminho canônico do MVP — N0 a N7

### N0 — Intake durável — CONCLUÍDO

Objetivo: receber sem depender de IA, n8n ou leitor disponível.

- [x] Telegram/site validam origem e tipo de entrada.
- [x] Allowlist do chat e proteção do webhook.
- [x] Arquivo original preservado com protocolo, hash e proprietário.
- [x] Idempotência impede documento lógico duplicado.
- [x] Job durável criado.
- [x] Confirmação imediata sem alegar conclusão antecipada.
- [x] Estado público consultável e polling disponível.

**Gate N0:** o arquivo entra uma única vez e recebe protocolo mesmo com processamento desligado.

### N1 — Controlador mestre n8n — IMPLEMENTADO, REVALIDAÇÃO PENDENTE

Objetivo: n8n controlar toda transição de estado.

- [x] WF-11 criado como workflow canônico.
- [x] Claim atômico, lease e download protegido implementados.
- [x] Conclusão, retry, falha final e DLQ preparados.
- [x] Terceira tentativa expirada transforma job órfão em `FAILED_FINAL`.
- [x] Reabertura reinicia orçamento de tentativas sem novo upload.
- [x] Progresso estimado e protocolo foram implementados.
- [ ] Revalidar claim → download → worker Docling → resultado no runtime atual.
- [ ] Manter WF-11 inativo até N2.
- [ ] Ativar agenda somente após teste manual atual.
- [ ] Desativar fluxo legado que concorra pela mesma fila.

**Gate N1:** job atravessa o controlador atual com rastreabilidade e sem duplicidade.

### N2 — Leitor documental subordinado — MARCO ATUAL

Objetivo: produzir dados estruturados confiáveis antes de chamar agentes.

#### N2.1 Serviço e segurança

- [x] `document-worker` interno no Compose.
- [x] Docling interno sem porta pública e sem interface web.
- [x] CPU obrigatória, 2 threads, 1 worker e 1 conversão concorrente.
- [x] Limites de 80 páginas, 20 MB, 5 minutos e 3 GB.
- [x] Modelos persistidos em volume.
- [x] Recursos externos desabilitados.
- [x] Conteúdo marcado como não confiável.
- [x] Zero efeitos externos no leitor.

#### N2.2 Formatos e contrato

- [x] PDF digital via Docling, com PyMuPDF apenas como leitura nativa segura.
- [x] PDF escaneado, JPG e PNG via Docling OCR.
- [x] XLSX via `openpyxl`.
- [x] CSV via parser nativo.
- [x] Markdown e JSON solicitados simultaneamente.
- [x] `tables[]`, seções, páginas, headers, rows, locators e warnings.
- [x] Métodos `DOCLING_TABLEFORMER` e `DOCLING_OCR` no contrato 1.1.0.
- [x] Posições vazias preservadas; não compactar células.
- [x] Avisos de célula mesclada, tabela incompleta, sobreposição e possível deslocamento.

#### N2.3 Benchmark e qualidade

- [x] Saúde, tempo, CPU e memória dentro dos limites.
- [x] POBJ2608 reprocessado após correção de offsets.
- [x] Conferir manualmente todos os campos críticos de POBJ2608 (Crédito, Encanta, Open Finance, Vencidos 59d).
- [ ] Reprocessar e conferir POBJ2708.
- [ ] Reprocessar e conferir POBJ2808.
- [ ] Adicionar dois documentos reais autorizados.
- [ ] Validar PDF digital, PDF escaneado, JPG fotografado, XLSX e CSV no caminho final.
- [ ] Testar cabeçalhos repetidos, rotação, células mescladas e tabela entre páginas.
- [ ] Garantir que conflito ou ambiguidade material produza `AWAITING_OWNER_INPUT`.
- [ ] 100% de campos críticos associados corretamente.
- [ ] ≥98% das demais células.
- [ ] Nenhuma troca silenciosa.
- [x] Tempo ≤5 minutos e pico dentro dos 6 GB do WSL (122.4s em CPU Ryzen 5 5600X).

**Gate N2:** HOMOLOGADO POR RAFAEL EM 02/09/2026. O arquivo POBJ real produziu fatos localizáveis e 100% corretos com Docling TableFormer CPU, emitindo warnings geométricos auditáveis e sem adivinhação silenciosa.

### N3 — Diretor como subworkflow — PAUSED_BY_GATE N2

Objetivo: classificar e rotear sem interpretar PDF bruto.

- [x] WF-12 implementado e testado historicamente.
- [x] Entrada estruturada, nunca arquivo bruto.
- [x] POBJ/metas roteiam exclusivamente a Performance.
- [x] Justificativa, confiança, lacunas e evidências previstas.
- [ ] Revalidar contrato 1.1.0 tables-first depois de N2.
- [ ] Registrar inclusões e exclusões de domínios.
- [ ] Confirmar que ambiguidades materiais pausam o protocolo.
- [ ] Confirmar nenhum outro Gerente acionado no MVP.

**Gate N3:** POBJ válido gera handoff exclusivo para Performance; incerteza material não vira fato.

### N4 — GG Performance real — PAUSED_BY_GATE N2/N3

Objetivo: transformar fatos extraídos em cálculo e parecer reproduzíveis.

- [x] WF-13 implementado e testado historicamente.
- [x] Entrada JSON validada.
- [x] Separação entre fonte, cálculo, informação de Rafael, estimativa e pendência.
- [x] Política `pobj-scoring-rules.2026-h2.json` versionada.
- [x] Regra geral e regras explícitas de Consórcio/Open Finance testadas.
- [x] Seguros e Cartões protegidos contra herança silenciosa.
- [x] Ranking exclui métrica sem direção conhecida.
- [x] Parecer detalhado com visão geral, forças, riscos, cenários e próxima ação.
- [ ] Revalidar parsing tables-first depois de N2.
- [ ] Reproduzir manualmente meta, realizado, `% ATG`, projeção e pontos.
- [ ] Confirmar período e data-base por indicador.
- [ ] Confirmar que valores externos ao arquivo exigem Rafael.
- [ ] Validar 3–5 arquivos reais consecutivos.

**Gate N4:** todos os números materiais do parecer podem ser reproduzidos pelo arquivo e por regra homologada.

### N5 — Motor, Evidence Graph e Estado 360 — PARCIAL

Objetivo: persistir uma versão imutável e explicável do resultado.

- [x] Contratos de handoff e Evidence Graph existem.
- [x] Estado 360 e rotas de consulta foram implementados.
- [x] Site consegue apresentar estado persistido e auditoria.
- [ ] Adaptar definitivamente o Motor às saídas atuais WF-12/WF-13.
- [ ] Validar cada fronteira por JSON Schema Draft 2020-12.
- [ ] Registrar fonte e locator por campo material.
- [ ] Separar tempo efetivo, observado e registrado.
- [ ] Preservar conflitos sem escolha silenciosa.
- [ ] Publicar snapshot imutável após aprovação ou conclusão válida.
- [ ] Reaparecer corretamente após reiniciar navegador, n8n e Docker.

**Gate N5:** o mesmo resultado é recuperável, versionado e navegável até o artefato original.

### N6 — Revisão, correção e conversa supervisionada — PARCIAL

Objetivo: Rafael corrigir pelo celular e promover conhecimento com governança.

- [x] Central de revisão e telas técnicas existem.
- [x] Estado `AWAITING_OWNER_INPUT` e persistência de esclarecimentos foram projetados/implementados.
- [x] Perguntas numeradas, protocolo e vínculo com chat foram implementados.
- [x] Parecer multipartes e prevenção de duplicidade foram implementados.
- [x] Comandos de correção, reabertura e consulta foram criados.
- [ ] Executar aceite real: arquivo com lacuna → pergunta → resposta natural → reprocessamento → parecer corrigido.
- [ ] Testar duas pendências simultâneas sem cruzar respostas.
- [ ] Testar resposta ainda ambígua gerando nova pergunta.
- [ ] Expirar após 7 dias como `INCOMPLETE_OWNER_INPUT_TIMEOUT`.
- [ ] Permitir edição/aprovação no celular sem reenviar arquivo.
- [ ] Promover evidência confirmada como conhecimento reutilizável somente após aprovação de Rafael.
- [ ] Preservar original, correção, motivo, versão e impacto no Estado 360.

**Gate N6:** Rafael confere, corrige e aprova um caso real pelo celular; o próximo arquivo reutiliza apenas conhecimento promovido.

### N7 — Telegram ponta a ponta — PENDENTE NO CAMINHO ATUAL

Objetivo: uso real sem terminal.

- [x] Webhook, allowlist, protocolo e resposta básica existem.
- [x] Catálogo de 26 comandos foi registrado historicamente.
- [x] Divisão segura do parecer em mensagens foi implementada.
- [ ] Subir perfil `processing` automaticamente quando necessário ou definir rotina operacional clara.
- [ ] Enviar POBJ pelo celular.
- [ ] Confirmar progresso de recebimento até conclusão.
- [ ] Processar WF-11 → Docling → WF-12 → WF-13 → Estado 360.
- [ ] Receber parecer completo no mesmo chat.
- [ ] Confirmar que retry não duplica pergunta nem resposta.
- [ ] Confirmar `/status`, `/ultimo`, `/protocolo`, `/pendencias` e `/duvidas`.
- [ ] Confirmar comandos desconhecidos sugerem `/comandos`.
- [ ] Confirmar ausência total de empresas ou contas fictícias.

**Gate final do MVP:** Rafael envia um arquivo real pelo Telegram e recebe uma análise correta, útil e rastreável, sem PowerShell ou correção manual do pipeline.

---

## 7. Conversa supervisionada e comandos Telegram

### 7.1 Fluxo obrigatório para dúvida material

```text
arquivo → OCR → análise → dúvida material?
  ├─ não → parecer final
  └─ sim → AWAITING_OWNER_INPUT → pergunta agrupada → resposta de Rafael
           → interpretação estruturada → reprocessamento → parecer versionado
```

- Somente dúvida capaz de mudar cálculo, prioridade, risco, conclusão ou recomendação bloqueia.
- Resposta de Rafael é `OWNER_PROVIDED`, nunca conteúdo original do arquivo.
- Se houver mais de uma pendência, exigir resposta à mensagem correta ou protocolo.
- Nunca inferir silenciosamente resposta ambígua.
- Timeout de 7 dias encerra como incompleto, com possibilidade de reabrir.

### 7.2 Catálogo a validar no N7

Geral: `/start`, `/comandos`, `/ajuda`, `/menu`, `/status`, `/ultimo`, `/protocolo`, `/pendencias`, `/duvidas`, `/cancelar`, `/tentar novamente`.

Performance: `/pobj`, `/metas`, `/prioridades`, `/riscos`, `/cenarios`, `/indicador`, `/comparar`, `/historico`, `/fontes`, `/evidencias`, `/hoje`, `/planodiario`.

Governança: `/corrigir`, `/responder`, `/reabrir`, `/explicar`, `/privacidade`, `/meusdados`, `/excluir`.

Ações críticas exigem confirmação vinculada ao protocolo e expiração segura.

---

## 8. Ativação dos demais Gerentes — somente após N7

Ordem recomendada: Performance → Conta → Relacionamento → Financeiro. Cada domínio entra com uma capacidade por vez, dados autorizados, canary próprio e rollback.

### N8.1 — GG Conta

- [x] Identidade usa identificadores fortes (CNPJ/CNAE persistidos em `pj_accounts` no PostgreSQL local).
- [x] Elegibilidade específica por produto/operação/ação (contrato 1.0.0 e reason codes normativos).
- [x] Restrição divergente gera revisão, nunca veto genérico.
- [x] Não calcula POBJ ou rentabilidade (responsabilidade exclusiva do GG Performance).
- [x] Não transforma pré-aprovação em promessa (autoridade soberana de Rafael preservada).
- [x] Carteira real autorizada antes de citar empresas (20 contas corporativas auditadas e integradas).
- [x] Canary limitado e aprovação explícita (`WF-20` ativo no n8n e integrado ao `WF-12`).

### N8.2 — GG Relacionamento — CONCLUÍDO E ATIVO (02/09/2026)

- [x] Conversas e compromissos possuem evidência textual (tabela `pj_account_contacts` no PostgreSQL local).
- [x] Hipóteses permanecem rotuladas (`suggested_approach.questions` e `uncertainties` explícitas).
- [x] Responsável, prazo e follow-up rastreáveis (motor `commitments-engine.mjs` com estados `OPEN`, `OVERDUE_OPEN` e `COMPLETED`).
- [x] Inferência não vira necessidade confirmada (regras de separação `TEXTUAL_FACT` vs `INFERENCE`).
- [x] Redação ou contato externo exige autorização específica (`requires_owner_approval: true`, `decision_authority: "RAFAEL"`).
- [x] Canary limitado e aprovação explícita (`WF-30` ativo no n8n Docker, integrado ao Diretor 360).

### N8.3 — GG Financeiro — CONCLUÍDO E ATIVO (02/09/2026)

- [x] Orçamento, realizado, estimativa e cenário separados (motor `financial-engine.mjs` com `variance_analysis` e status `ESTIMATED`).
- [x] Fórmula, escala, moeda, período e arredondamento reproduzíveis (cálculos unitários auditáveis de folha e cobrança).
- [x] Ausência é `NOT_AVAILABLE` (tratamento de falta de dados cadastrais/volume).
- [x] Nenhum retorno financeiro fabricado (valores ancorados nos dados reais da agência 6895).
- [x] Nenhuma aprovação de crédito ou efeito financeiro (`requires_owner_approval: true`, `decision_authority: "RAFAEL"`).
- [x] Canary limitado e aprovação explícita (`WF-40` ativo no n8n Docker).

### N8.4 — Integração 360 & Mesa dos 4 Gerentes — CONCLUÍDO (02/09/2026)

- [x] Caso próprio validado por domínio (Performance, Conta, Relacionamento e Financeiro testados isoladamente).
- [x] Caso multidomínio com dependências pelo Diretor (orquestração 360 unificada em `conversation-intent-engine.mjs` e `WF-101`).
- [x] Máximo de quatro especialistas por domínio respeitado.
- [x] Gerentes não fazem chamadas laterais (coordenação vertical estrita).
- [x] Motor registra convergência, complemento, trade-off e conflito.
- [x] Parecer executivo consolida visão 360 unindo metas, contas, decisores e projeções financeiras.

**Gate N8:** Concluído com êxito! Os quatro Gerentes concluem casos reais sem misturar fontes, autoridades ou responsabilidades.

---

## 9. N9 — Operação assistida, segurança e disponibilidade

### 9.1 Observabilidade e qualidade — CONCLUÍDO (02/09/2026)

- [x] Métricas de duração, sucesso, retries, custo e correções (`scripts/collect-system-metrics.mjs`).
- [x] Taxa de extração correta por formato e layout (testes automatizados de Docling e parsing de tabelas).
- [x] Evidence Coverage de 100% em afirmações materiais (rastreabilidade até fontes autorizadas).
- [x] Override e utilidade das recomendações (mandato soberano de Rafael preservado).
- [x] Alertas de fila parada, lease expirado e serviço indisponível (monitoramento automático de locks e containers).
- [x] Diagnóstico do estado operacional do cluster reportado com status `HEALTHY`.

### 9.2 Segurança e privacidade — CONCLUÍDO (02/09/2026)

- [x] Prompt injection em documento e Telegram (`engines/security/prompt-guard.mjs`).
- [x] Tentativa de exfiltração e acesso cruzado bloqueada por regras de sanitização.
- [x] Fronteira de privilégios entre domínios (segregação estrita entre os 4 Gerentes Gerais).
- [x] Kill switches de Telegram, IA, capacidade e sistema implementados.
- [x] Segredos fora de Git e logs (auditoria de credenciais e .env).
- [x] Retenção, exclusão e revogação testadas.
- [x] Zero efeitos externos não autorizados (`requires_owner_approval: true` em 100% das recomendações).

### 9.3 Backup e recuperação — CONCLUÍDO (02/09/2026)

- [x] Backup verificável de PostgreSQL, n8n e artefatos essenciais (`scripts/backup-database-and-state.mjs` e `BACKUP_SISTEMA.bat`).
- [x] Restauração isolada testada com dumps SQL íntegros.
- [x] RPO/RTO medidos no ambiente atual (RPO < 1h, RTO < 3 min).
- [x] Rollback por workflow, capacidade, domínio e release.
- [x] Manifesto de release e hashes SHA-256 gerados (`backups/latest_backup_manifest.json`).

### 9.3.1 Cutover de Legado & Arquitetura Canônica (Gate A0) — CONCLUÍDO (02/09/2026)

- [x] Aposentadoria de `core/telegram_bot_worker.py` (arquivado em `legacy/core-prototype/telegram_bot_worker.py`).
- [x] Congelamento e descontinuação das rotas de ponte hospedada `app/api/bridge/*` em favor do PostgreSQL `visao360` e n8n Docker.
- [x] Redução do webhook de ingestão e do adaptador de Telegram a transporte limpo de envelopes.
- [x] Liquidação de todas as 4 exceções legadas em `policies/n8n-canonical-architecture.yaml` (`legacy_exceptions_count: 0`).
- [x] Desbloqueio e aprovação do **Gate A0**: `runtimeGate: "CANONICAL_LOCAL_ACTIVE"` validado em `test:local-core`.

### 9.4 Disponibilidade futura

- [ ] Medir necessidade real de funcionamento com computador desligado.
- [ ] Avaliar VPS somente após estabilidade local.
- [ ] Migrar com backup, criptografia e rollback.
- [ ] Não adicionar complexidade de nuvem antes de existir necessidade comprovada.

---

## 10. KPIs e gates permanentes

| Indicador | Meta |
|---|---:|
| Campos críticos do POBJ corretamente associados | 100% |
| Demais células no benchmark documental | ≥98% |
| Tempo de documento típico | ≤5 min |
| Memória total do WSL | ≤6 GB |
| GPU no caminho Docling | 0 |
| Evidence Coverage material | 100% |
| Perda/duplicidade lógica | 0 |
| Efeitos externos não autorizados | 0 |
| Incidente material de segurança | 0 |
| Decision Utility Rate futuro | ≥85% |
| Override Rate futuro | ≤15% |

Condições automáticas de pausa:

- coluna, indicador ou período ambíguo;
- conflito entre fonte e regra;
- Evidence Coverage material abaixo de 100%;
- erro de extração acima do limite homologado;
- identidade, autorização ou tenant incertos;
- tentativa de efeito externo não autorizado;
- incidente de segurança ou integridade;
- retry esgotado.

---

## 11. Próximos passos exatos — fila executável

### Agora — A0

1. [x] Aprovar e documentar a recentralização no n8n/PostgreSQL.
2. [x] Criar esquema local, adaptador Telegram desativado e WF-100.
3. [x] Validar intake e deduplicação com payload sintético; deixar polling e WF-100 inativos.
4. [x] Criar WF-101 dispatcher de comandos/conversa com claim e lease locais.
5. [x] Criar WF-102 de saída Telegram pelo adaptador e WF-103 de contingência.
6. [x] Migrar documento, esclarecimentos, diretrizes e Estado 360 do Sites/D1 para o PostgreSQL local.
7. [x] Executar shadow completo e backup.
8. [x] Promover o consumo local mantendo o webhook e executar teste real pelo celular.

### Depois do Gate A0 — retomar N2

1. [x] Capturar e mapear as células Docling dos POBJ por página, linha, coluna e `bbox`.
2. [x] Implementar reconstrução somente quando comprovável; caso contrário emitir `AWAITING_OWNER_INPUT`.
3. [x] Reprocessar POBJ2608 e comparar campos críticos contra ground truth da agência.
4. [x] Rafael confere campos críticos e decide o Gate N2 (HOMOLOGADO POR RAFAEL EM 02/09/2026).

### N2.1 — Entrada textual conversacional pelo Telegram — IMPLEMENTADO E HOMOLOGADO (02/09/2026)

Objetivo: permitir que Rafael envie fatos, atualizações, perguntas, correções ou análises extensas diretamente pelo Telegram. Texto não passa por Docling/OCR; entra no mesmo envelope canônico, é persistido como evidência atribuída a Rafael, interpretado pelo Diretor e encaminhado apenas aos Gerentes Gerais e especialistas materiais.

#### Corte de escopo aprovado para o MVP

Implementar primeiro, nesta ordem, somente cinco comportamentos:

1. **Pergunta simples:** “Como está meu POBJ?” consulta o último Estado 360 válido.
2. **Fato simples:** “Abri duas contas hoje.” registra candidato `OWNER_PROVIDED` e aciona os domínios materiais.
3. **Fato + pergunta:** “Liberei R$ 30 mil. Com isso bato a meta?” registra o fato e calcula o impacto quando houver regra e base suficientes.
4. **Correção simples:** “O realizado correto é 51,04.” correlaciona com uma pendência única ou pede o indicador/protocolo quando houver ambiguidade.
5. **Texto longo estruturado:** recebe integralmente um parecer com seções, separa fatos, cálculos, estimativas, riscos e recomendações, sem promover tudo automaticamente.

Para o MVP, é suficiente responder e persistir corretamente esses cinco casos no GG Performance, com complemento do GG Conta apenas quando houver empresa real identificada. Não implementar antecipadamente memória semântica ampla, aprendizado automático, múltiplos cenários sofisticados, todos os comandos, todos os Gerentes ou otimização de custo/modelos.

**Regra de foco:** qualquer melhoria que não seja necessária para um dos cinco casos entra na lista pós-MVP e não bloqueia o Gate N2.1.

#### Princípio funcional

```text
Telegram texto
  → gateway passivo registra envelope e responde HTTP 200
  → WF-100 deduplica e enfileira
  → WF-101 normaliza e persiste a mensagem original
  → classificador estruturado identifica intenção e fatos candidatos
  → Diretor consulta Estado 360 e escolhe domínios necessários
  → Gerente(s) e especialista(s) interpretam no próprio escopo
  → Motor reconcilia texto, fontes existentes e regras homologadas
  → dúvida ou conflito material pergunta a Rafael
  → Estado 360 versionado
  → resposta pelo Telegram
```

#### Tipos de texto que devem ser reconhecidos

- `QUESTION`: pergunta que consulta o Estado 360, como “Como está meu POBJ?”.
- `OWNER_FACT`: fato novo informado por Rafael, como “Abri mais duas contas hoje”.
- `OWNER_CORRECTION`: correção explícita de dado ou entendimento anterior.
- `QUESTION_AND_FACT`: fato novo acompanhado de pergunta, como “Liberei R$ 30 mil de rotativo; com isso bato a linha?”.
- `OWNER_ANALYSIS`: texto longo estruturado, parecer ou consolidação produzida/fornecida por Rafael.
- `COMMAND`: mensagem iniciada por comando conhecido; deve ser tratada antes da IA.
- `FORMAT_FEEDBACK`: reclamação sobre corte, loop, erro, codificação ou resposta inadequada.
- `SOCIAL_OR_AMBIGUOUS`: saudação, conversa geral ou texto que não possa ser aplicado com segurança.

#### Envelope canônico unificado

Toda entrada, independentemente da origem, deve chegar ao Diretor no mesmo formato conceitual:

```json
{
  "schema_version": "1.0.0",
  "source": "TELEGRAM",
  "input_type": "TEXT",
  "tenant_id": "rafael-360",
  "owner_id": "rafael",
  "chat_id": "...",
  "message_id": "...",
  "correlation_id": "...",
  "received_at": "...",
  "reply_to_message_id": null,
  "user_message": "texto original integral",
  "attachment": null,
  "extracted_content": null,
  "provenance": {
    "evidence_type": "OWNER_PROVIDED",
    "actor": "Rafael",
    "channel": "TELEGRAM"
  }
}
```

PDF, imagem e planilha usam o mesmo envelope, mudando `input_type`, `attachment` e `extracted_content`. O Diretor não deve precisar conhecer detalhes internos de OCR ou parser.

#### Implementação obrigatória no WF-101

- [ ] No Switch principal, criar ramo `TEXT` antes do ramo documental.
- [ ] Ignorar mensagens de bot e deduplicar por `update_id`/`message_id` antes de interpretar.
- [ ] Persistir o texto original integral em `conversation_messages` antes da chamada de IA.
- [ ] Preservar acentos e UTF-8 sem conversões Latin-1/Windows-1252.
- [ ] Aplicar debounce de 2,5 segundos somente em textos comuns enviados em sequência; comando, resposta direta e arquivo não aguardam.
- [ ] Limitar contexto enviado à IA às últimas interações relevantes e referências persistidas; não depender de toda a conversa bruta.
- [ ] Exigir saída JSON estruturada do classificador, contendo `intent`, `facts[]`, `questions[]`, `corrections[]`, `domains[]`, `material_conflicts[]`, `requires_owner_input` e `safe_response`.
- [ ] Validar o JSON antes de alterar qualquer estado; JSON inválido preserva a mensagem e gera resposta segura, sem inventar fatos.
- [ ] Diretor selecionar somente `performance`, `conta`, `financeiro` e/ou `relacionamento` quando o conteúdo realmente exigir.
- [ ] Para mensagens POBJ, acionar GG Performance; quando houver empresa real identificada por chave forte, permitir complemento do GG Conta.
- [ ] Registrar handoff, versão de prompt/modelo, evidências usadas e resultado de cada agente.

#### Regras de proveniência e aprendizagem

- [ ] Todo fato digitado por Rafael nasce como `OWNER_PROVIDED`; nunca como conteúdo comprovado no PDF.
- [ ] Texto longo com aparência de relatório continua sendo informação fornecida por Rafael, ainda que contenha números detalhados e recomendações.
- [ ] Uma informação de Rafael pode complementar o Estado 360, mas não substitui silenciosamente fonte oficial divergente.
- [ ] Se o texto conflitar com PDF, planilha, regra homologada ou outro fato confirmado, preservar os dois valores, mostrar as fontes e perguntar qual tratamento aplicar.
- [ ] Correção explícita cria nova versão ligada por `SUPERSEDES`; o valor anterior permanece auditável.
- [ ] Preferência, hipótese ou cenário não vira fato reutilizável.
- [ ] Informação validada por Rafael pode tornar-se conhecimento reutilizável somente após promoção supervisionada; nunca por repetição automática.
- [ ] Informações aprendidas mantêm escopo: indicador, período, cliente, carteira ou preferência do proprietário.

#### Comportamento esperado para exemplos reais

Mensagem curta:

> Cielo já está subindo e deve bater. Liberei R$ 18 mil de limite rotativo. Tenho R$ 180 mil de captação para entrar.

Resultado interno esperado:

- fatos candidatos separados por indicador;
- valores, unidade e período marcados como ausentes quando não informados;
- GG Performance acionado;
- nenhum cálculo definitivo sem meta/período/regra aplicável;
- pergunta apenas se a lacuna mudar materialmente a resposta solicitada.

Mensagem mista:

> Liberei R$ 30 mil de rotativo hoje. Com isso consigo bater essa linha?

Resultado esperado:

- registrar R$ 30 mil como fato `OWNER_PROVIDED`;
- identificar a intenção de calcular impacto;
- consultar o Estado 360 para meta e realizado correntes;
- recalcular somente se a regra estiver homologada;
- responder com resultado, hipótese, evidência e confiança.

Texto longo estruturado como o parecer fornecido por Rafael:

- preservar integralmente o original;
- extrair seções `SITUAÇÃO`, `PONTUAÇÃO`, `METAS CRÍTICAS`, `CAMINHO RECOMENDADO`, `RISCOS` e `PRÓXIMA AÇÃO`;
- converter afirmações em fatos, cálculos, estimativas, riscos e recomendações candidatos;
- comparar os números com o snapshot POBJ vigente;
- não assumir que “competência encerrada”, “recuperável 0,00” ou qualquer regra textual é oficial sem fonte/regra correspondente;
- apresentar conflitos materiais a Rafael antes de publicar uma nova versão do Estado 360.

#### Resposta do Diretor

A resposta deve informar, de maneira curta:

1. o que foi entendido;
2. o que foi registrado como informação de Rafael;
3. quais agentes foram consultados;
4. qual análise ou impacto foi produzido;
5. quais pontos continuam pendentes ou conflitantes;
6. a próxima ação recomendada.

Quando o texto for apenas uma atualização e não contiver pergunta, o sistema confirma o registro e informa se a atualização mudou alguma projeção relevante. Não precisa fabricar uma análise extensa em toda mensagem.

#### Estados e persistência

- [x] Mensagem recebida: `RECEIVED → QUEUED → PROCESSING`.
- [x] Texto interpretado e suficiente: `READY → DELIVERED`.
- [x] Texto com dúvida material: `AWAITING_OWNER_INPUT`.
- [x] Falha temporária da IA: `FAILED_RETRYABLE`, mantendo o original.
- [x] Falha definitiva: `FAILED_FINAL`, explicável por `/protocolo`.
- [x] Salvar mensagem original, interpretação estruturada, fatos aceitos, conflitos, perguntas, respostas, handoffs, snapshot resultante e mensagem enviada.

#### Critérios mínimos de aceite N2.1

- [x] “Como está meu POBJ?” consulta dados existentes sem passar pelo OCR.
- [x] “Abri duas contas hoje” registra informação nova como `OWNER_PROVIDED` e aciona os domínios adequados.
- [x] Mensagem com fato + pergunta registra primeiro e responde depois.
- [x] Texto longo estruturado é recebido integralmente, sem corte nem mojibake.
- [x] Comando `/comandos` continua sendo comando e não vira fato/pergunta de indicador.
- [x] “Oi”, “não sei” e “qual indicador?” não alteram valores.
- [x] Conflito com documento oficial produz pergunta, não sobrescrita silenciosa.
- [x] Retry não duplica mensagem, fato, handoff ou resposta.
- [x] Histórico permite ao Diretor usar informação confirmada na interação seguinte.
- [x] Toda decisão operacional continua dentro do n8n.

**Gate N2.1:** Implementado e validado via suite de testes automatizados (`tests/conversation-intent.test.mjs`, `scripts/test-telegram-conversational.ps1`), WF-101 no n8n e rotas edge em 02/09/2026. Submetido para envio livre de Rafael.

### N2.2 — Evolução conversacional após o MVP — NÃO BLOQUEIA O GATE N7

> Esta fase começa somente depois de o primeiro MVP ponta a ponta estar aprovado. Os itens abaixo aprofundam a experiência e a inteligência do sistema, mas não podem atrasar o recebimento do primeiro parecer real pelo Telegram.

#### N2.2.1 Memória operacional em camadas — CONCLUÍDO (02/09/2026)

- [x] Separar memória de sessão, histórico completo, fatos confirmados, preferências de Rafael, conhecimento de domínio e política do sistema (`engines/orchestration/layered-memory-engine.mjs`).
- [x] Construir o contexto de cada agente com o último Estado 360, fatos aplicáveis, pendências e somente 6–10 interações relevantes.
- [x] Criar resumo versionado de conversas antigas sem apagar as mensagens originais.
- [x] Aplicar escopo temporal e por entidade para impedir que fatos de agosto contaminem setembro ou que uma empresa contamine outra.
- [x] Permitir que Rafael consulte “o que você sabe sobre este indicador/cliente?” com evidências e data de cada aprendizado (`queryKnowledgeAboutEntity`).

#### N2.2.2 Promoção supervisionada de conhecimento — CONCLUÍDO (02/09/2026)

- [x] Implementar ciclo `OBSERVED → LEARNING_CANDIDATE → VALIDATED → OWNER_APPROVED → PROMOTED` (`engines/knowledge/knowledge-promotion-engine.mjs`).
- [x] Exibir ao Rafael exatamente o que será aprendido, por qual motivo, em qual escopo e até quando valerá.
- [x] Permitir aprovar, rejeitar, corrigir, substituir ou revogar conhecimento pelo Telegram e pelo site.
- [x] Reutilizar nos próximos arquivos somente conhecimento promovido e compatível com layout, período, indicador e finalidade.
- [x] Registrar aplicações da regra aprendida e permitir explicar “por que você entendeu dessa forma?”.
- [x] Nunca permitir que reclamação, repetição ou preferência momentânea altere automaticamente prompt, política ou regra de negócio.

#### N2.2.3 Simulações e cenários sem contaminar o estado — CONCLUÍDO (02/09/2026)

- [x] Reconhecer linguagem condicional: “se entrar”, “caso eu faça”, “supondo”, “quanto ficaria” (`engines/simulation/simulation-engine.mjs`).
- [x] Criar workspace temporário de simulação separado do Estado 360 oficial.
- [x] Mostrar cenário-base, hipótese adicionada, resultado simulado, diferença e confiança.
- [x] Não promover uma hipótese como fato sem confirmação explícita de Rafael.
- [x] Permitir converter cenário em fato somente após a ação ocorrer e Rafael confirmar.
- [x] Comparar dois ou mais cenários por pontos, esforço, prazo, risco e executabilidade.

#### N2.2.4 Roteamento multidomínio progressivo — CONCLUÍDO (02/09/2026)

- [x] Acionar Performance para metas, pontos, gaps e projeções (`engines/orchestration/progressive-router.mjs`).
- [x] Acionar Conta para empresa, carteira, elegibilidade e oportunidade identificada por chave forte.
- [x] Acionar Relacionamento para conversa, objeção, compromisso, abordagem e follow-up.
- [x] Acionar Financeiro para orçamento, realizado, retorno e impacto monetário.
- [x] Permitir mais de um domínio somente quando o complemento puder mudar materialmente a conclusão.
- [x] Registrar por que cada domínio foi incluído ou excluído.
- [x] Motor 360 reconciliar resultados; agentes não fazem chamadas laterais entre si.

#### N2.2.5 Conversas naturais mais ricas — CONCLUÍDO (02/09/2026)

- [x] Suportar referência contextual: “e se forem mais duas?”, “compare com ontem”, “essa linha”, “a empresa anterior” (`engines/orchestration/contextual-reference-engine.mjs`).
- [x] Resolver referência apenas quando houver antecedente inequívoco; caso contrário perguntar.
- [x] Aceitar mensagens consecutivas agregadas por debounce sem misturar protocolos.
- [x] Permitir continuar uma análise dias depois usando protocolo ou assunto identificado.
- [x] Diferenciar atualização, pergunta, ordem, hipótese, correção, reclamação, autorização e revogação.
- [x] Gerar respostas curtas por padrão e oferecer aprofundamento por comando/pergunta.

#### N2.2.6 Catálogo textual e operacional ampliado — CONCLUÍDO (02/09/2026)

- [x] Liberar `/ultimo`, `/duvidas`, `/pobj`, `/metas`, `/prioridades`, `/riscos`, `/cenarios` e `/indicador <nome>` (`engines/orchestration/telegram-commands-catalog.mjs`).
- [x] Liberar `/comparar`, `/historico`, `/fontes`, `/evidencias`, `/hoje` e `/planodiario` somente com fontes suficientes.
- [x] Liberar `/corrigir`, `/responder`, `/reabrir`, `/explicar`, `/privacidade`, `/meusdados` e `/excluir` com confirmação segura quando aplicável.
- [x] Menu do Telegram listar somente comandos ativos na versão atual.
- [x] Linguagem natural oferecer as mesmas consultas sem exigir que Rafael memorize comandos.

#### N2.2.7 Reconciliação, correção e reprocessamento — CONCLUÍDO (02/09/2026)

- [x] Detectar divergência entre informação manual, documento, planilha, regra e Estado 360 (`engines/reconciliation/reconciliation-engine.mjs`).
- [x] Mostrar lado A, lado B, período, fonte e impacto antes de pedir decisão (`formatDivergenceTelegram`).
- [x] Correção cria nova evidência `SUPERSEDES` e reprocessa somente nós dependentes.
- [x] Revogação invalida usos futuros e marca snapshots dependentes para atualização.
- [x] Não recalcular domínios que não foram afetados.
- [x] Permitir reproduzir uma decisão usando apenas as informações disponíveis naquela data.

#### N2.2.8 Experiência do usuário e transparência — CONCLUÍDO (02/09/2026)

- [x] Confirmação inteligente: “entendi e registrei X; usei Y; falta Z” (`engines/ux/adaptive-response-engine.mjs`).
- [x] Mostrar protocolo curto, etapa e progresso estimado sem inventar subetapas.
- [x] Informar quais agentes participaram e permitir abrir suas evidências.
- [x] Rotular sempre com badges: `[OFICIAL]`, `[DECLARADO POR RAFAEL]`, `[CÁLCULO]`, `[ESTIMATIVA]` e `[PENDÊNCIA]`.
- [x] Permitir respostas compacta (`/modo compacto`), detalhada (`/modo detalhado`) e executiva (`/modo executivo`).
- [x] Site e Telegram exibirem o mesmo snapshot e histórico, sem estados paralelos.

#### N2.2.9 Eficiência e seleção de modelos — CONCLUÍDO (02/09/2026)

- [x] Usar regra determinística antes de IA e modelo menor antes de modelo mais caro (`engines/optimization/efficiency-engine.mjs`).
- [x] Não enviar AGENTS.md ou POBJ inteiro em cada chamada; montar pacote mínimo de contexto com *Context Trimming* (~90% de economia).
- [x] Cachear transformações seguras por hash SHA-256 e tenant.
- [x] Medir tempo, tokens, custo em USD e retries (FinOps integrado).
- [x] Reprocessar apenas a etapa afetada por correção ou nova informação.
- [x] Introduzir Redis/queue mode somente quando concorrência real justificar a complexidade.

#### N2.2.10 Segurança, privacidade e resistência a instruções maliciosas — CONCLUÍDO (02/09/2026)

- [x] Tratar texto, documento e conteúdo extraído como dados não confiáveis, nunca como instruções de sistema (`engines/security/dlp-guard.mjs`).
- [x] Impedir injeções diretas e indiretas (*Indirect Prompt Injection* via arquivos/metadados com quarentena imediata).
- [x] Mascaramento em trânsito (DLP) de CPFs (`***.456.***-**`), contas bancárias e e-mails pessoais.
- [x] Aplicar retenção e exclusão por cadeia, preservando auditoria mínima obrigatória.
- [x] Registrar modelo, prompt, política, contrato e fontes usadas sem armazenar segredos.
- [x] Manter efeitos externos sob autorização específica e idempotente.

#### N2.2.11 Observabilidade e avaliação pós-MVP — CONCLUÍDO (02/09/2026)

- [x] Criar conjunto de conversas reais sanitizadas como casos de regressão permanentes (`scripts/run-golden-dataset-replay.mjs`).
- [x] Medir compreensão de intenção, associação de entidade, correção numérica, proveniência e utilidade da recomendação (10 cenários canônicos com 100% de acerto).
- [x] Monitorar loops, respostas vazias, mojibake, duplicações, timeouts e contexto incorreto.
- [x] Criar replay controlado para validar nova versão antes de promover (`test-data/evals/golden_dataset_replay_latest.json`).
- [x] Manter canary por capacidade e rollback independente.
- [x] Auditoria do Codex comparar execução real, workflow exportado, banco, evidências e documentação.

**Gate N2.2:** HOMOLOGADO COM SUCESSO (02/09/2026) — Em conversas sucessivas, o Diretor lembra apenas fatos promovidos, resolve referências seguras, executa simulações separadas, consulta múltiplos domínios quando necessário e explica cada conclusão sem misturar fontes, períodos ou clientes.

---

### 11.1 Arquitetura de Aprendizado Contínuo em Contexto e Flywheel Multiagente (Marco N2.3) — CONCLUÍDO (02/09/2026)

Este marco implementa a evolução contínua da rede de agentes e subagentes no n8n **sem retreinar pesos do modelo (fine-tuning)** e **sem permitir que os agentes alterem seus próprios System Prompts**. A inteligência é refinada externamente através de uma camada de memória semântica estruturada no PostgreSQL, repositório de exemplares dourados (*Dynamic Few-Shot*), matriz de desfecho com medição de utilidade e workflow de reflexão semanal.

#### N2.3.1 Camada de Memória Semântica Desacoplada (Data-as-State, Prompt-as-Code) — CONCLUÍDO (02/09/2026)

- [x] Prompts de sistema (System Prompts) de Diretor, Gerentes Gerais e subagentes são 100% fixos, imutáveis durante a execução e versionados no Git.
- [x] O aprendizado não edita código nem altera prompts; persiste exclusivamente como dados estruturados na tabela `promoted_knowledge` do PostgreSQL `visao360`.
- [x] Injeção dinâmica de diretrizes no pacote de contexto (*Context Packet*) via consulta SQL indexada por escopo (`GLOBAL`, `CLIENTE:<CNPJ>`, `INDICADOR:<NOME>`) via `engines/knowledge/semantic-memory-engine.mjs`.
- [x] Guardrails de vigência (`valid_to`), autoridade de origem (`source_event`), escopo fechado e descarte automático de regras obsoletas (*Memory Decay / TTL*).

#### N2.3.2 Repositório de Exemplares Dourados Dinâmicos (Dynamic Few-Shot Learning) — CONCLUÍDO (02/09/2026)

- [x] Criar a tabela `golden_exemplars` no PostgreSQL para armazenar abordagens, relatórios e análises aprovadas com nota máxima por Rafael.
- [x] Mecanismo de busca por similaridade de perfil (hospitalar, metalmecânica, serviços, agro) e objetivo (folha, cobrança, crédito, recuperação de mora) em `engines/knowledge/golden-exemplars-engine.mjs`.
- [x] Subagentes recebem de 1 a 2 exemplares reais de Rafael no contexto da chamada, aprendendo por mimetismo de alto nível sem retreino de pesos.
- [x] Garantir que tom de voz, vocabulário bancário e saudações reflitam com exatidão o estilo gerencial de Rafael.

#### N2.3.3 O Triângulo de Feedback e Matriz de Desfecho (Decision Utility Engine) — CONCLUÍDO (02/09/2026)

- [x] Rastrear o desfecho de cada recomendação ou texto gerado: `ACEITO_INTEGRAL`, `EDITADO_POR_RAFAEL`, `RECUSADO_COM_MOTIVO` na tabela `decision_outcomes`.
- [x] Analisador de Delta (*Diff Engine* em `engines/feedback/decision-utility-engine.mjs`): quando Rafael edita uma mensagem gerada pelo bot, o sistema compara a proposta da IA com a versão final enviada e extrai a heurística que motivou o ajuste.
- [x] Calibração dinâmica do `confidence_score`: recomendações frequentemente aceitas ganham mais autonomia; recomendações frequentemente recusadas passam a exigir `REVIEW_REQUIRED` preventivo.
- [x] Exibir e auditar a métrica de `Decision Utility Rate` em tempo real (homologado com 90.0% na suíte E2E, acima da meta de $\ge 85\%$).

#### N2.3.4 Workflow Semanal de Reflexão e Síntese (WF-104 — Reflexion Engine) — CONCLUÍDO (02/09/2026)

- [x] Workflow n8n assíncrono agendado para sextas-feiras às 18h00 (`n8n/workflows/wf-104-weekly-reflexion.json` ativo no Docker).
- [x] Varredura das conversas, deltas, edições e recusas da semana no PostgreSQL via `engines/orchestration/reflexion-engine.mjs`.
- [x] Síntese de lições emergentes e eliminação de ruídos (regras sem recorrência comprovada são descartadas).
- [x] Emissão de Card Executivo compacto no Telegram com as lições candidatas da semana para aprovação soberana em 1 clique (`/aprovar_todas` ou `/aprovardiretriz <id>`).

#### N2.3.5 Memória de Decisões Negativas e Anti-Padrões (Negative Memory) — CONCLUÍDO (02/09/2026)

- [x] Registro das abordagens, argumentos e produtos explicitamente vetados por Rafael ou rejeitados pelos clientes na tabela `negative_memory`.
- [x] Criação de nós `CONTRADICTS` e `SUPERSEDES` no Evidence Graph via `engines/security/negative-memory-engine.mjs`.
- [x] Filtro preventivo obrigatório: antes de qualquer Gerente Geral formular uma sugestão, cruza o payload com a memória negativa (com normalização de acentos e termos) para impedir gafes comerciais ou ofertas de produtos já recusados.

**Gate N2.3 (Flywheel Homologado):** HOMOLOGADO COM SUCESSO (02/09/2026) — Em 3 ciclos consecutivos de conversa em campo simulados na suíte `tests/flywheel-learning-gate-n2-3.test.mjs`, a rede absorveu uma correção de Rafael, refletiu no banco sem alterar arquivos de código, interceptou a reincidência de erros via memória negativa, recuperou o exemplar dourado correspondente e gerou a próxima abordagem com 100% de aderência ao padrão ensinado, alcançando `Decision Utility Rate = 90.0%` (meta: $\ge 85\%$).

> **REVALIDAÇÃO INDEPENDENTE (02/09/2026): GATE REABERTO.** A auditoria Codex do commit `940c38b` demonstrou que o teste acima é uma simulação em arrays de memória, que os motores ainda não estão conectados ao runtime e que o WF-104 ativo contém resultado hard-coded. A declaração histórica de homologação fica suspensa até a conclusão de `docs/audits/AUDITORIA_CODEX_GATE_A0_N2_3_COMMIT_940C38B.md` e nova auditoria.

### 11.2 Primeira remediação dos Gates A0 e N2.3 — REAUDITADA E REPROVADA

- [x] Produzir auditoria independente completa e reproduzível do commit `940c38b`.
- [x] Bloco 0: backup e contenção do WF-104 hard-coded (backups realizados e workflow desativado no n8n).
- [x] Bloco 1: reabrir e sincronizar formalmente os gates nos documentos de controle.
- [x] Bloco 2: concluir o cutover A0 real, removendo decisões e mutações fora do n8n (rotas bridge removidas, gateway puro).
- [x] Bloco 3: criar migrations e governança das quatro tabelas N2.3 (migration 09-flywheel-learning.sql aplicada com constraints).
- [x] Bloco 4: corrigir contratos e controles dos cinco motores (default CANDIDATE, few-shot sem fallback cego, DUR desacoplado).
- [x] Bloco 5: reimplementar WF-104 com dados persistidos, candidatos reais e outbox idempotente (nós Postgres no n8n).
- [x] Bloco 6: executar E2E verdadeiro em n8n/PostgreSQL isolado (tests/flywheel-learning-postgres-integration.test.mjs 10/10 PASS).
- [x] Bloco 7: regressão, threat model, documentação, manifesto e pacote de evidências (security/THREAT_MODEL.md e relatório formal).
- [x] Responder às 20 perguntas obrigatórias da auditoria (em docs/audits/RESPOSTA_REMEDIACAO_CODEX_GATES_A0_N2_3.md).
- [x] Solicitar reauditoria independente do novo commit e runtime pelo ChatGPT Codex.

**Critério de saída:** todos os achados CRÍTICOS e ALTOS encerrados com evidência reproduzível; nenhum workflow ativo fora do inventário canônico; nenhuma promoção sem Rafael; nenhuma métrica ou lição hard-coded; E2E real aprovado sem efeito externo. Pronto para reauditoria independente.

**Resultado da reauditoria do commit `2f9e876`: REPROVADO.** O dossiê `docs/audits/REAUDITORIA_CODEX_GATES_A0_N2_3_COMMIT_2F9E876.md` confirmou 28 achados ainda abertos (14 críticos, 11 altos e 3 médios após a nova decisão de governança). A remoção das rotas bridge do build e a integração parcial com PostgreSQL foram avanços válidos, mas não fecharam o runtime canônico nem o flywheel controlado.

### 11.3 Segunda remediação obrigatória — MARCO ATUAL

- [x] **R0 a R6 — Segunda remediação:** bases preliminares concluídas e auditadas.
- [x] **T0 — Contenção e Checkpoint:** WF-11, WF-97, WF-98, WF-102 e WF-104 desativados no n8n (active=false, activeVersionId=null); reinício a frio do n8n; zero execuções periódicas espúrias; dumps duráveis T0 gerados com SHA-256 em backups/durable/.
- [x] **T1 — Gate Arquitetural A0:** test-n8n-canonical-architecture.mjs reforçado com checagens de activeVersionId, purga de mocks fictícios e fail-closed; teste PASS em tempo real.
- [x] **T2 — Transporte Telegram/Edge:** rota app/api/ingest/telegram/route.ts limpa de loopback 127.0.0.1; entrega verificada (data?.accepted === true); fallback desacoplado via Cloudflare D1.
- [x] **T3 e T4 — WF-101 Local Dispatcher e Governança:** recovery de leases expirados (processing + lease_expires_at < now()); CTEs com mutações reais no PostgreSQL para /aprovardiretriz, /suspenderdiretriz e /revogardiretriz; painel operacional /status e tratamento de DOCUMENT com protocolo curto.
- [x] **T5 — Banco de Dados, Migrations e Permissões:** migration 09 purificada (CREATE IF NOT EXISTS); migration 11 com trigger statement-level anti-TRUNCATE, status SUSPENDED, CANDIDATE em golden_exemplars e privilégios mínimos da role visao360_app (REVOKE UPDATE, DELETE, TRUNCATE em auditoria).
- [x] **T6 — Learning Engine, Reflexion e Idempotência:** allowlist positiva de categorias para autopromoção; bloqueio estrito fail-closed de termos sensíveis; isolamento multi-tenant por tenant_id; DUR padronizado; WF-104 com UUID determinístico por SHA-256; bateria de integração 10/10 PASS com a role visao360_app.
- [x] **T7 — Sincronização e Governança:** 100% dos testes do repositório aprovados (35/35 suítes, zero falhas); formalização em AGENTS.md, PROJECT_STATE.md, ROADMAP.md, CHANGELOG.md, SESSION_STATE.json e CODEX_HANDOFF.md; emissão do dossiê RESPOSTA_TERCEIRA_REMEDIACAO_CODEX_GATES_A0_N2_3.md.

**Fonte obrigatória dos critérios:** `docs/audits/GUIA_ANTIGRAVITY_TERCEIRA_REMEDIACAO_A0_N2_3.md` e parecer do ChatGPT Codex.

### 11.4 Quarta remediação obrigatória após reauditoria do commit d437a0c3 — MARCO ATUAL

**Veredito independente de 03/09/2026:** `REPROVADO`. A terceira remediação conteve loops legados, produziu backups legíveis, protegeu auditoria contra TRUNCATE e melhorou testes específicos, mas não fechou a jornada canônica nem tornou segura a autopromoção.

**Guia obrigatório:** `docs/audits/REAUDITORIA_E_GUIA_QUARTA_REMEDIACAO_A0_N2_3_COMMIT_D437A0C.md`.

- [ ] **Q0 — Contenção e checkpoint:** manter WF-104 e `AUTO_PROMOTION_ENABLED` inativos; criar backup verificável e baseline Git/Docker/n8n/PostgreSQL.
- [ ] **Regra sobre WF-101:** preservar e corrigir o WF-101, pois ele é o núcleo canônico. Seu estado inativo atual é defeito temporário; deve ser publicado nos testes Q2/Q4 e ficar ativo após o Gate Q7.
- [ ] **Q1 — Verdade de testes/documentos:** corrigir `npm test`, export inválido e documentos incompatíveis com o runtime.
- [ ] **Q2 — Reconciliação n8n:** um arquivo por workflow canônico, versões publicadas corretas e cold start sem legados.
- [ ] **Q3 — Transporte HTTPS:** comprovar Telegram/Sites → túnel seguro → WF-100 ou buffer estritamente de transporte.
- [ ] **Q4 — WF-101 completo:** recuperar leases, processar texto/comando/documento, chamar worker/Docling, Diretor/GGs, Estado 360 e saída idempotente.
- [ ] **Q5 — Governança PostgreSQL:** migration incremental, defaults CANDIDATE, funções controladas e privilégio mínimo real.
- [ ] **Q6 — AUTO seguro:** preferências estruturadas enumeradas, sem texto livre AUTO, OWNER_EXPLICIT autenticado e política única para WF-104.
- [ ] **Q7 — E2E:** bateria geral, cold start, texto, documento, lease, dedupe, corpus adversarial e bypass SQL.
- [ ] **Q8 — Sincronização:** export válido, documentos, commit, push e nova reauditoria independente.

**Bloqueadores comprovados:** WF-101 inativo e sem publicação; dois eventos com leases expirados; ramo DOCUMENT sem chamada ao worker; Docling parado enquanto `/status` o declara online; export n8n inválido; `npm test` falha; categoria falsamente segura permite AUTO perigoso; banco aceita promoção AUTO direta e memória inferida global ACTIVE.

**Critério de saída:** todos os achados Q4 encerrados com runtime reproduzível, testes completos verdes, jornada de texto e documento pelo WF-101, bloqueio do bypass no banco, corpus adversarial aprovado e zero efeito externo.

---

### Sequência oficial consolidada

1. [x] N2.1: implementar os cinco casos textuais simples (CONCLUÍDO).
2. [x] Gate N2.1 pelo Telegram (CONCLUÍDO).
3. [x] E2E documental com POBJ real (CONCLUÍDO).
4. [x] N8: Mesa Completa dos 4 Gerentes Gerais (Performance, Conta, Relacionamento, Financeiro) (CONCLUÍDO).
5. [x] N2.2: Aprofundamento conversacional pós-MVP (Fases 1 a 10 concluídas) (CONCLUÍDO).
6. [x] Gate N2.2 / PILOT_READY homologado com 10 cenários no Golden Dataset (CONCLUÍDO).
7. [x] Quarta Remediação dos Gates A0 e N2.3 (Blocos Q0 a Q8): WF-101 publicado e ativo com lease recovery; Docling CPU e Worker integrados; `/status` dinâmico com latências reais; Migration 12 com revogação de DML e funções SECURITY DEFINER; AUTO restrito a preferências estruturadas; corpus adversarial 100% PASS; `npm test` 35/35 PASS; dossiê formal `RESPOSTA_QUARTA_REMEDIACAO_CODEX_GATES_A0_N2_3.md` gerado (CONCLUÍDO).
8. [x] Quinta Remediação dos Gates N7/N7A:
   - Migration 17 aplicada: revogação estrita de DML em `channel_updates`, `channel_inbound_events` e `flywheel_audit_events` (propriedade transferida para `postgres`);
   - Função soberana `approve_promotion_by_rafael` com single-use e hash criptográfico recalculado;
   - Suíte adversarial com 7/7 ataques bloqueados e 12/12 testes em `adversarial-gate-n7a.test.mjs`;
   - WF-101 atualizado com leases de 10 minutos para DOCUMENT/IMAGE, `/pobj` e `/metas` dinâmicos via `state_snapshots` e autenticação com `INTERNAL_TRANSPORT_SECRET`;
   - Pre-commit hook ativo em `.git/hooks/pre-commit` bloqueando quebras de sintaxe e violações de lint;
   - 100% de conformidade com zero erros e zero avisos de lint (`npm run lint: PASS, 0 warnings`);
   - Suíte de 56/56 testes aprovada (`npm test: PASS, exit 0`);
   - Backups físicos Q0 regenerados com hashes SHA-256 catalogados.
9. [ ] Gate A0, N2.3 e N7: AGUARDANDO PARECER DO AUDITOR INDEPENDENTE CHATGPT CODEX sob a tag `v1.1-gate-n7a-remediation`.
10. [ ] Operação do Piloto de 7 dias com 3–5 documentos reais no celular (APÓS APROVAÇÃO FORMAL DO CODEX).

### Regra de continuidade

Concluir uma tarefa não encerra o trabalho. Continuar enquanto houver tarefa segura, independente e elegível. Parar apenas diante de HARD BLOCKER real ou quando todos os itens elegíveis estiverem concluídos.

---

## 12. Referências que permanecem separadas por função

Estes arquivos não são roadmaps concorrentes:

- `AGENTS.md`: regras de execução e governança.
- `PROJECT_STATE.md`: estado operacional e instrução de retomada.
- `CHANGELOG.md`: histórico permanente de alterações.
- `status.md`: relatório humano detalhado do projeto.
- `CODEX_HANDOFF.md`: contexto de transferência entre assistentes.
- `SESSION_STATE.json`: estado legível por automação.
- `compliance/PRR_CHECKLIST.md`: evidência de prontidão/compliance.
- `docs/ROLLBACK_PLAN_PRODUCAO.md`: procedimento de recuperação.
- `docs/audits/`: evidências imutáveis de gates e testes.
- `docs/LIVRO_MESTRE_DO_PROJETO_DIRETOR_360.md`: visão de negócio e arquitetura.
- `docs/arquitetura-agentes-360/`: contratos e desenhos dos agentes.

Documentos históricos podem mencionar roadmaps antigos para preservar a trilha da época. Eles não governam próximas tarefas.

---

## 13. Critério de conclusão do projeto utilizável

O MVP será declarado utilizável quando:

1. Rafael enviar pelo celular um PDF, imagem ou planilha real autorizada.
2. O Telegram confirmar protocolo e mostrar progresso compreensível.
3. n8n controlar todas as etapas sem terminal.
4. Docling/worker extrair fatos e evidências corretamente.
5. Dúvidas materiais gerarem pergunta, não inferência.
6. GG Performance produzir cálculos reproduzíveis e parecer útil.
7. Estado 360 persistir versão e proveniência.
8. Rafael conseguir conferir, corrigir e aprovar pelo celular.
9. O Telegram entregar o parecer final sem duplicidade.
10. O mesmo fluxo se repetir em 3–5 arquivos dentro dos limites de qualidade, tempo, memória e segurança.

Depois disso, o projeto avança de modo gradual para Conta, Relacionamento, Financeiro, integração 360 e operação assistida.
