# ROADMAP UNIFICADO — DIRETOR 360

**Versão do planejamento:** 4.2

**Atualizado em:** 2 de setembro de 2026

**Autoridade e proprietário:** Rafael

**Repositório oficial:** `https://github.com/playertwo1/360gpt.git` — branch `main`

**Estado atual:** `IN_PROGRESS`

**Fase atual:** recentralização do runtime `Telegram/Sites → n8n local → Docling/agentes → PostgreSQL → Telegram/Sites`

**Marco atual:** `A0 — n8n e PostgreSQL como núcleo local único`

**Próxima tarefa:** A0.2 — criar o dispatcher local de comandos/conversa e retirar a dependência operacional do WF-11 em endpoints hospedados

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

### A0.2 — Dispatcher local de conversa e comandos — MARCO ATUAL

- [ ] Criar WF-101 para claim com lease dos `channel_inbound_events`.
- [ ] Rotear deterministicamente comandos antes de qualquer esclarecimento ou IA.
- [ ] Migrar `/start`, `/comandos`, `/ajuda`, `/menu`, `/status`, `/progresso`, `/protocolo`, `/pendencias` e `/duvidas` para PostgreSQL/n8n.
- [ ] Migrar `/excluir`, `/excluirultimo`, `/confirmar` e protocolos curtos com confirmação idempotente.
- [ ] Registrar conversa inbound/outbound e impedir que mensagem do próprio bot seja processada.
- [ ] Criar WF-102 de entrega via `telegram-poller:/send`, com divisão segura e idempotência por parte.
- [ ] Criar WF-103 de contingência local, com erro sanitizado e sem aviso duplicado.

### A0.3 — Documento, Docling e orquestração local

- [ ] Substituir claim/download/complete/fail hospedados do WF-11 por tabelas e storage locais.
- [ ] Criar protocolo curto no PostgreSQL na mesma transação do documento.
- [ ] Fazer n8n controlar `RECEIVED → QUEUED → OCR → DIRECTOR → MANAGERS → MOTOR → REVIEW/READY → DELIVERED`.
- [ ] Manter Docling como extrator e consumir `tables[]` antes de Markdown.
- [ ] Converter Diretor, quatro Gerentes Gerais e especialistas em subworkflows versionados, acionando somente domínios materiais.
- [ ] Persistir todo handoff e Estado 360 antes da resposta ao canal.

### A0.4 — Conversa, aprendizado e histórico local

- [ ] Migrar esclarecimentos para `clarification_requests_360`/`clarification_answers_360`.
- [ ] Migrar diretrizes candidatas e aplicações para `learned_directives_360`/`directive_applications_360`.
- [ ] Garantir que correções de Rafael sejam `OWNER_PROVIDED` e só virem conhecimento reutilizável após aprovação.
- [ ] Limitar contexto textual, preservando histórico completo e referências no PostgreSQL.

### A0.5 — Sites reduzido a canal

- [ ] Definir envelope mínimo da caixa postal Sites ↔ n8n.
- [ ] Retirar do runtime hospedado regras, cálculos, slot-filling, comandos, aprendizado e Estado 360 oficial.
- [ ] Manter no D1/R2 somente transporte temporário necessário ao acesso remoto, com retenção e idempotência.
- [ ] Fazer o site consultar respostas e snapshots produzidos pelo núcleo local, sem fabricar fallback demo.

### A0.6 — Shadow, backup e corte controlado

- [ ] Comparar caminho hospedado legado × núcleo local em mensagens, comandos, arquivo e esclarecimento sintéticos.
- [ ] Validar UTF-8, idempotência, debounce, lease, retry, exclusão por cadeia e entrega multipartes.
- [ ] Criar backup verificável de PostgreSQL, n8n e configuração antes do corte.
- [ ] Ativar o modo assíncrono de transporte no gateway hospedado após validar WF-97/WF-101/WF-102.
- [ ] Promover o consumo local sem trocar a URL do webhook.
- [ ] Executar teste real pelo celular e manter rollback documentado.
- [ ] Somente depois do gate, revogar a lógica operacional hospedada duplicada.

**Gate A0:** uma mensagem e um arquivo enviados ao webhook entram na fila de transporte, percorrem o n8n/PostgreSQL no Docker e retornam ao Telegram; comandos não entram em esclarecimento; duplicatas não reprocessam; Sites não governa o estado.

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
- [ ] Conferir manualmente todos os campos críticos de POBJ2608.
- [ ] Reprocessar e conferir POBJ2708.
- [ ] Reprocessar e conferir POBJ2808.
- [ ] Adicionar dois documentos reais autorizados.
- [ ] Validar PDF digital, PDF escaneado, JPG fotografado, XLSX e CSV no caminho final.
- [ ] Testar cabeçalhos repetidos, rotação, células mescladas e tabela entre páginas.
- [ ] Garantir que conflito ou ambiguidade material produza `AWAITING_OWNER_INPUT`.
- [ ] 100% de campos críticos associados corretamente.
- [ ] ≥98% das demais células.
- [ ] Nenhuma troca silenciosa.
- [ ] Tempo ≤5 minutos e pico dentro dos 6 GB do WSL.

**Gate N2:** um arquivo POBJ real produz fatos localizáveis e corretos. Se houver célula materialmente unida, o sistema pergunta em vez de calcular.

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

- [ ] Identidade usa identificadores fortes.
- [ ] Elegibilidade específica por produto/operação/ação.
- [ ] Restrição divergente gera revisão, nunca veto genérico.
- [ ] Não calcula POBJ ou rentabilidade.
- [ ] Não transforma pré-aprovação em promessa.
- [ ] Carteira real autorizada antes de citar empresas.
- [ ] Canary limitado e aprovação explícita.

### N8.2 — GG Relacionamento

- [ ] Conversas e compromissos possuem evidência textual.
- [ ] Hipóteses permanecem rotuladas.
- [ ] Responsável, prazo e follow-up rastreáveis.
- [ ] Inferência não vira necessidade confirmada.
- [ ] Redação ou contato externo exige autorização específica.
- [ ] Canary limitado e aprovação explícita.

### N8.3 — GG Financeiro

- [ ] Orçamento, realizado, estimativa e cenário separados.
- [ ] Fórmula, escala, moeda, período e arredondamento reproduzíveis.
- [ ] Ausência é `NOT_AVAILABLE`.
- [ ] Nenhum retorno financeiro fabricado.
- [ ] Nenhuma aprovação de crédito ou efeito financeiro.
- [ ] Canary limitado e aprovação explícita.

### N8.4 — Integração 360

- [ ] Caso próprio validado por domínio.
- [ ] Caso multidomínio com dependências pelo Diretor.
- [ ] Máximo de quatro especialistas por domínio.
- [ ] Gerentes não fazem chamadas laterais.
- [ ] Motor registra convergência, complemento, trade-off e conflito.
- [ ] Dashboard mostra visão 360 e evidências por domínio.

**Gate N8:** os quatro Gerentes concluem casos reais sem misturar fontes, autoridades ou responsabilidades.

---

## 9. N9 — Operação assistida, segurança e disponibilidade

### 9.1 Observabilidade e qualidade

- [ ] Métricas de duração, sucesso, retries, custo e correções.
- [ ] Taxa de extração correta por formato e layout.
- [ ] Evidence Coverage de 100% em afirmações materiais.
- [ ] Override e utilidade das recomendações.
- [ ] Alertas de fila parada, lease expirado e serviço indisponível.
- [ ] Sete dias de operação assistida sem perda ou duplicidade.

### 9.2 Segurança e privacidade

- [ ] Prompt injection em documento e Telegram.
- [ ] Tentativa de exfiltração e acesso cruzado.
- [ ] Fronteira de privilégios entre domínios.
- [ ] Kill switches de Telegram, IA, capacidade e sistema.
- [ ] Segredos fora de Git e logs.
- [ ] Retenção, exclusão e revogação testadas.
- [ ] Zero efeitos externos não autorizados.

### 9.3 Backup e recuperação

- [ ] Backup verificável de PostgreSQL, n8n e artefatos essenciais.
- [ ] Restauração isolada testada.
- [ ] RPO/RTO medidos no ambiente atual.
- [ ] Rollback por workflow, capacidade, domínio e release.
- [ ] Manifesto de release e hashes.

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
4. [ ] Criar WF-101 dispatcher de comandos/conversa com claim e lease locais.
5. [ ] Criar WF-102 de saída Telegram pelo adaptador e WF-103 de contingência.
6. [ ] Migrar documento, esclarecimentos, diretrizes e Estado 360 do Sites/D1 para o PostgreSQL local.
7. [ ] Executar shadow completo e backup.
8. [ ] Promover o consumo local mantendo o webhook e executar teste real pelo celular.

### Depois do Gate A0 — retomar N2

1. [ ] Capturar e mapear as células Docling dos POBJ por página, linha, coluna e `bbox`.
2. [ ] Implementar reconstrução somente quando comprovável; caso contrário emitir `AWAITING_OWNER_INPUT`.
3. [ ] Reprocessar POBJ2608/2708/2808 e mais dois arquivos autorizados.
4. [ ] Rafael confere campos críticos e decide o Gate N2.

### Depois do Gate N2

1. [ ] Rebuild e regressão do worker.
2. [ ] Testes WF-11, WF-12 e WF-13 com contrato 1.1.0.
3. [ ] Execução manual do WF-11.
4. [ ] Ativação controlada da agenda.
5. [ ] Teste de lacuna e conversa supervisionada.
6. [ ] Piloto com 3–5 documentos.
7. [ ] Gate N7 no celular.

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
