# Changelog

## [3.7.0] - 2026-09-01

### Added
- Conhecimento POBJ versionado com aprovação seletiva, revogação, proveniência, isolamento por proprietário e aplicação idempotente.
- Aba `/knowledge` e comandos Telegram `/conhecimento`, `/aprovar` e `/revogarregra`.
- Contrato da ponte para aplicar somente conhecimento `ACTIVE` quando indicador e assinatura do layout coincidirem exatamente.

### Security
- Metas, realizados, valores, competência e pontuação mensal são proibidos no conteúdo reutilizável.
- Mudança de layout ou conflito não produz inferência silenciosa; o fluxo supervisionado permanece responsável por consultar Rafael.

### Validated
- Lint, build e teste estrutural dedicado do conhecimento POBJ aprovados.

### Deployed
- Versão hospedada 41 publicada com migração 0009, aba `/knowledge` e APIs de conhecimento supervisionado.

## [3.6.2] - 2026-09-01

### Added
- Comandos `/progresso`, `/andamento`, `/destravar` e `/reprocessartodos`, com menu oficial validado em 26 comandos.

### Fixed
- Recuperação em massa limitada ao proprietário e somente a falhas ou leases expirados; jobs ativos não são interrompidos.
- Progresso passou a ser rotulado como estimativa por etapa, sem fabricar a subetapa interna do OCR/análise.

### Security
- Removidos scripts e workflow paralelo com credenciais embutidas, envio direto e dados fictícios; nove backups contendo `.env` foram retirados do repositório para quarentena local.
- Restaurados o worker Telegram e o workflow canônico anteriores, preservando webhook, allowlist, fila n8n, contratos e auditoria.

### Deployed
- Versão hospedada 40 publicada; menu Telegram confirmado com 26 comandos e `/progresso` validado pelo webhook real com status `SUCCEEDED`.

## [3.6.1] - 2026-08-31

### Fixed
- Jobs cuja terceira tentativa perdeu o lease agora saem de `PROCESSING` para `FAILED_FINAL` com `BRIDGE_TIMEOUT`, evitando progresso falso permanente.
- `/tentar novamente` e a rota de reabertura zeram `attempt_count`, limpam leases antigos e permitem recuperar também `FAILED_FINAL`.

### Validated
- Lint, build e teste conversacional supervisionado aprovados; bateria geral ficou bloqueada na integração MinerU porque o Docker Desktop não iniciou.

## [3.6.0] - 2026-08-31

### Added
- Fluxo conversacional Telegram com perguntas materiais, estado `AWAITING_OWNER_INPUT`, interpretação estruturada e retomada do mesmo protocolo.
- Catálogo de comandos operacionais, confirmações para ações críticas e menu oficial do bot.
- Parecer multipartes com entregas idempotentes auditadas em `telegram_deliveries`.

### Changed
- WF-11/WF-13 preservam contexto do proprietário e não concluem enquanto houver dúvida material.
- Rotas operacionais e Evidence Graph deixaram de exibir contas fictícias; escopo padrão passou a `tenant-owner/performance-owner`.
- Migração 0008 adiciona persistência conversacional e limpeza de dados demonstrativos hospedados.

### Security
- Respostas de Rafael são registradas como `OWNER_PROVIDED`; fixtures ficam restritas a testes `OFFLINE_EVAL`.

## [Unreleased]

### Deployed
- Versão hospedada 39 publicada com rotas de esclarecimento e migração conversacional; WF-11/WF-13 atualizados, publicados e reiniciados no n8n local.

### Fixed
- Migração passou a preservar integralmente o Evidence Graph append-only; dados demonstrativos históricos ficam isolados por escopo, sem exclusão da auditoria.

### Validated
- M5.8 aceito por Rafael: ciclo real Telegram → OCR → pergunta material → resposta → reprocessamento → parecer final concluído no mesmo protocolo.

### Changed
- A confirmação inicial do Telegram agora informa progresso de 10% e orienta `/protocolo <id>`, que exibe percentual e etapa derivados do estado persistido.

### Changed
- Worker `document-worker`/MinerU e dependências Docker iniciados; agenda do WF-11 publicada no n8n com execução a cada 1 minuto.
- Versão hospedada 37 publicada no endereço público com a correção de retorno ao Telegram.

### Fixed
- Corrigida a resolução do chat autorizado no retorno Telegram quando `owner_id` é UUID de conta; utiliza o único chat da allowlist sem ampliar destinatários.

### Fixed
- Corrigida a validação booleana da extração no WF-11 e publicado o WF-12 como subworkflow interno sem webhook, agenda ou gatilho Telegram.

### Validated
- Gate M4 concluído em arquivo real: OCR MinerU, WF-12, WF-13, persistência e resposta ao Telegram terminaram com `telegram_reply_sent: true`.
- Regra geral reproduziu 13/13 indicadores elegíveis e regras explícitas reproduziram 2/2 indicadores do PDF real, sem divergência e sem sobrescrever a fonte.
- WF-13 reproduziu em shadow os pontos de Consórcio Expert (`4,67`) e Open Finance (`7,00`) do PDF real, com divergência zero e sem sobrescrever a fonte.
- PDF real enviado pelo Telegram percorreu fila, lease, download protegido, OCR MinerU híbrido de 3 páginas e roteamento determinístico exclusivo ao GG Performance; Estado mínimo persistido sem efeitos externos.

### Changed
- Política `POBJ_SCORING_2026_H2` promovida à v1.1.0 `RUNTIME_ACTIVE` por autorização de Rafael, usando `% PROJ. FINAL` no painel mensal e mantendo exceções fora da regra geral.
- Escopo do primeiro MVP congelado na jornada Telegram → OCR → Orquestrador → GG Performance e especialistas → análise → Telegram.
- Conta, Financeiro, Relacionamento e Visão 360 multidomínio movidos explicitamente para depois do gate ponta a ponta do MVP Performance.
- Roadmap n8n reorganizado em M0–M5 com gates verificáveis no uso real pelo celular.

### Added
- Parecer Telegram do GG Performance v1.1.0 com situação geral, pontos fortes, riscos e gaps, cenários conferíveis, caminho recomendado, próxima ação, risco e confiança.
- Payload M4 com snapshot 360 versionado, hash de estado, parecer executivo curto e entrega idempotente ao chat Telegram.
- WF-13 interno do GG Performance para validar o handoff, estruturar tabelas POBJ, reconciliar a fonte, preservar valores reportados, separar direção de metas e produzir parecer consultivo.
- Testes estrutural e funcional do WF-13 com números brasileiros, valores negativos, proveniência e bloqueio de efeitos externos.
- WF-12, Diretor mínimo do MVP, para classificar extrações e gerar handoff estruturado exclusivo ao GG Performance.
- Teste estrutural do WF-12 e gatilho manual seguro no WF-11 para ensaios sem ativar o agendamento.
- Script seguro `release-mineru-memory.ps1` para descarregar os modelos após uso híbrido e manter o serviço pronto.
- MinerU 3.4.5 como parser interno local de PDF e imagem, com todos os modelos armazenados no computador e acesso exclusivo pela rede Docker do n8n.
- Teste automatizado da imagem, saúde, conectividade interna, limite de concorrência e contrato de extração MinerU.

### Changed
- WF-12 passou a chamar o WF-13 como subworkflow interno após o roteamento exclusivo a Performance.
- WF-11 agora chama o Diretor mínimo após validar o OCR e só conclui jobs quando o handoff Performance estiver válido.
- PDFs começam no pipeline econômico e escalam ao híbrido somente diante de evidência vazia ou tabela complexa; imagens continuam no híbrido.
- Concorrência e janela do MinerU limitadas a uma unidade para reduzir picos de memória.
- `document-worker` agora roteia PDF/JPG/PNG ao MinerU híbrido e mantém XLSX/CSV em parsers determinísticos nativos.
- Timeouts do n8n, WF-11 e worker ampliados para acomodar documentos complexos sem travar o recebimento assíncrono.

### Fixed
- Restaurado o gate que impede claim de documento POBJ antes de `local_reviewed`.
- Corrigido aviso de truncamento do worker para ser emitido apenas quando o texto realmente exceder o limite.

### Security
- MinerU não publica porta no host, opera com concorrência 1 e não recebe segredos do Telegram ou Gemini.
- Conteúdo documental continua não confiável e efeitos externos permanecem bloqueados.

### Added
- Serviço interno `document-worker` em Docker com FastAPI, PyMuPDF, Tesseract OCR em português/inglês, Pillow e OpenPyXL.
- Extração híbrida de PDF nativo/escaneado, OCR de JPG/PNG e leitura estruturada de CSV/XLSX com evidências localizáveis.
- Contrato Draft 2020-12 `document-extraction` e testes reais de endpoint multipart, OCR e PDF nativo.
- Roadmap canônico N0–N9 com o n8n como espinha dorsal operacional do Diretor 360.
- WF-11, controlador mestre do MVP, com claim/lease, download protegido, worker subordinado, validação, conclusão e retry.
- Teste estrutural automatizado do WF-11 e importação pelo script oficial.
- Contrato Draft 2020-12 dos estados públicos do processamento assíncrono e teste automatizado do gate R1.
- Protocolo persistente, consulta periódica de status no site e deduplicação de arquivos entre site e Telegram.
- Diretor IA de MVP com Gemini Structured Output para interpretar documentos e devolver indicadores, pontuação, domínios e pareceres em JSON validável.
- Preenchimento automático do painel POBJ com meta, realizado e pontuação extraídos pela IA.
- Aprendizado governado por exemplos das últimas correções aprovadas por Rafael.
- Roadmap de reconstrução assíncrona do MVP real, cobrindo intake, fila, n8n, worker documental, Diretor, quatro Gerentes Gerais, Estado 360, revisão e Telegram ponta a ponta.

### Changed
- Checkpoint completo para troca de conta, com SESSION_STATE, PROJECT_STATE, handoff, roadmap e status sincronizados.
- Versão hospedada 36 publicada com liberação de claim para o WF-11 e intake de imagens.
- Repositório oficial migrado para `playertwo1/360gpt`; `playertwo1/360` preservado como remoto legado.
- Intake do site e do Telegram ampliado para aceitar JPG/JPEG e PNG com validação de assinatura.
- Ponte de claim preparada para reservar documentos recebidos de site e Telegram sem exigir pré-revisão local do POBJ.
- Contrato de bridge ampliado com estados de retry/falha, lease e metadados do documento.
- Upload do site e entrada do Telegram agora somente validam, armazenam e enfileiram; OCR, parsing e IA saíram integralmente da requisição de recebimento.
- Confirmação do Telegram passou a informar `RECEBIDO` e protocolo, sem afirmar que Gerentes Gerais processaram o arquivo antes da execução real.
- Para acelerar a ativação, interpretação, roteamento e pareceres dos Gerentes necessários usam uma única chamada inteligente no MVP.
- Publicada a versão hospedada 32 e simplificado o formulário para exigir somente a seleção do arquivo.
- Configurado `gemini-3.5-flash-lite` como modelo principal do ambiente hospedado após o modelo maior apresentar congestionamento 503; modelos maiores permanecem como fallback.
- Suspensos novos testes manuais do processamento síncrono; a próxima implementação oficial passa a ser upload rápido com fila persistente e processamento local assíncrono.
- Publicada a versão hospedada 34 com `DIRECTOR_SYNC_AI_ENABLED=false` na revisão de ambiente 16.
- Publicada a versão hospedada 35 com o intake assíncrono do R1 no endereço oficial.

### Fixed
- Adicionado fallback automático do Gemini 3.7 Flash congestionado para o Gemini 3.5 Flash disponível.
- Corrigido o uso de `ArrayBuffer` destacado após a extração de PDFs pelo `unpdf`.
- Substituídas mensagens residuais do fluxo n8n pela descrição correta do Diretor IA.
- Adequado o schema nullable ao formato aceito pelo Gemini 3.5 e permitido fallback quando o modelo principal rejeitar o schema com HTTP 400.
- Impedido que falhas do Diretor IA abram o extrator simples legado; a interface agora distingue `IA PRONTA`, `FALHA IA` e `AGUARDANDO IA`.
- Adicionados os pareceres individuais dos Gerentes acionados à revisão do documento.

### Security
- Arquivo continua autenticado, preservado no R2 e auditado; conteúdo é tratado como não confiável e instruções internas do documento são ignoradas.
- A chave Gemini está armazenada apenas como segredo do ambiente hospedado, nunca no Git.
- R0 criou backup sem arquivos `.env` ou segredos, verificou duas cópias no Google Drive e restaurou o dump n8n em banco isolado.
- O caminho síncrono legado passou a exigir `DIRECTOR_SYNC_AI_ENABLED=true`; ausente ou falso, nenhum modelo é chamado durante o upload.

## [3.2.39] - 2026-08-29

### Changed
- Simplificado o envio POBJ para exigir somente o arquivo; competência e data-base são inferidas automaticamente quando presentes.
- Mantida revisão humana obrigatória quando a inferência não for possível.

## [3.2.38] - 2026-08-29

### Changed
- Registrada aprovação de Rafael para uso somente leitura supervisionado da reconciliação POBJ de agosto.

### Security
- Fonte permanece `DRAFT` e desconectada até o gate técnico; nenhum processamento ou efeito externo foi iniciado.

## [3.2.37] - 2026-08-29

### Added
- Registro DRAFT da reconciliação das três planilhas POBJ de agosto, com fonte principal, hashes e métricas coincidentes.

### Security
- Fonte real permanece `INACTIVE`; escopo limitado a `meta`, `realizado` e `periodo`, sem efeitos externos.

## [3.2.36] - 2026-08-29

### Changed
- Revalidada a preparação de ingestão sintética C1/C2: carteira PJ, plano diário, especialistas de Conta e linhagem.

## [3.2.35] - 2026-08-29

### Changed
- Validação sintética A5 concluída: catálogo fechado, autorização humana, bloqueio de ações indevidas e idempotência.

### Security
- Nenhuma ação externa real foi executada; efeitos permanecem condicionados a autorização específica.

## [3.2.34] - 2026-08-29

### Added
- Onda A4 somente leitura supervisionada validada para os quatro domínios, com Evidence Graph íntegro.

### Security
- Despacho humano obrigatório preservado; nenhum efeito externo foi executado.

## [3.2.33] - 2026-08-29

### Changed
- Gate P8 e primeiro canary sintético Performance aprovados por Rafael após revisão humana.

## [3.2.32] - 2026-08-29

### Added
- Primeiro canary sintético de Performance autorizado e executado: 10 casos, revisão humana pendente em todos.

### Security
- Canary permaneceu sem mutações de estado e sem efeitos externos.

## [3.2.31] - 2026-08-29

### Added
- Regra explícita `N3_CONSORCIO_EXPERT_LINEAR`, com cálculo linear, mínimo positivo e tetos distintos para POBJ (100%) e PADE (150%).
- Registrados peso PJ Negócios (5 pontos) e fluxo de ajustes até o 4º dia útil via ServiceNow com parecer regional.

## [3.2.30] - 2026-08-29

### Changed
- P2.3 atualizado para refletir as faixas versionadas de ausência de contato (0–30, 31–60, 61–90 e >90 dias), já cobertas pelos testes determinísticos.

## [3.2.29] - 2026-08-29

### Fixed
- Protegida a rota `/api/evidence-graph` com autenticação e autorização do painel.
- Corrigida a referência da bateria de testes no handoff para 23 testes.

### Changed
- Artefatos Python compilados deixaram de ser versionados via `.gitignore`.

## [3.2.28] - 2026-08-29

### Changed
- Homologada a janela supervisionada de `PERFORMANCE_EXECUTABILITY_PLAN` em A3, com três observações consecutivas aprovadas (30/30 casos).
- ROADMAP, PROJECT_STATE e status sincronizados; novas expansões aguardam autorização explícita.

### Security
- Execuções permaneceram em `SHADOW` e `SYNTHETIC_ONLY`, sem dados reais, mutações, efeitos externos ou agentes `ACTIVE`.

## [3.2.27] - 2026-08-28

### Added
- Motor determinístico de plano de executabilidade da Performance em SHADOW, sem seleção de empresas ou efeitos externos.

### Security
- O plano é consultivo, exige seleção de conta posterior e preserva zero mutações e efeitos externos.

## [3.2.26] - 2026-08-28

### Changed
- Primeira expansão A3 homologada: `PERFORMANCE_GAP_SCENARIOS` completou três medições sintéticas consecutivas aprovadas.

### Security
- As 30 execuções preservaram escopo sintético, zero erro, divergência, custo, mutação e efeito externo; próxima expansão requer nova autorização.

## [3.2.25] - 2026-08-28

### Added
- Motor determinístico de gaps e cenários da Performance, em SHADOW sintético supervisionado.

### Security
- O motor só calcula estados e distâncias; não altera dados nem permite efeitos externos.

## [3.2.24] - 2026-08-28

### Changed
- A2 homologado após três medições consecutivas do `PERFORMANCE_SCORING_STATE` em SHADOW sintético.

### Security
- As 30 execuções mantiveram zero erros, divergências, custo, mutações de estado e efeitos externos; A3 continua bloqueada por autorização explícita.

## [3.2.23] - 2026-08-28

### Added
- Gate de execução A2 e teste de rollback da capacidade Performance em SHADOW.

### Security
- O gate bloqueia execução com capacidade inativa, fonte fora de escopo, campo não autorizado, mutação de estado ou efeito externo.

## [3.2.22] - 2026-08-28

### Changed
- A2 iniciada com a única capacidade `PERFORMANCE_SCORING_STATE` em `SHADOW` supervisionado.

### Security
- A2 aceita somente fixtures sintéticas e os campos mínimos `meta`, `realizado` e `periodo`; fonte POBJ real, efeitos externos e mutações de estado de negócio continuam proibidos.

## [3.2.21] - 2026-08-28

### Changed
- A1 do GG Performance homologado após aprovação explícita de Rafael na interface `/canary` para os dez casos sintéticos.

### Security
- A aprovação registrada em D1 preserva `SYNTHETIC_ONLY`; não houve promoção de agente, conexão de fonte real, mutação de estado nem efeito externo.

## [3.2.20] - 2026-08-28

### Added
- Aba `/canary` para Rafael revisar os dez casos da Onda 3 do GG Performance diretamente no site, sem alterar o painel principal.
- Persistência D1 para a rodada sintética e para uma decisão humana imutável, com identidade do revisor, justificativa e trilha em `audit_log`.
- Migração Drizzle `0007_moaning_starbolt.sql` e teste de contrato da interface Canary.

### Security
- A interface aceita apenas os resultados sintéticos fixos no servidor; não recebe casos, fontes ou campos pelo navegador.
- Aprovar A1 não conecta POBJ real, não promove agentes e não permite efeitos externos.

### Changed
- Versão 30 publicada em `https://visao-360-diretor.fael360092.chatgpt.site`, com a migração D1 da revisão Canary incluída.

## [3.2.19] - 2026-08-28

### Fixed
- Simulador legado de canary deixou de fabricar decisões, hashes, concordância ou overrides atribuídos a Rafael.
- Bateria geral passou a identificar corretamente a Fase 7 como simulação sintética.

### Security
- Decisões humanas agora só podem existir após revisão explícita; validações confirmaram 14/14 testes e lint aprovados.

## [3.2.18] - 2026-08-28

### Added
- Onda 3 do canary sintético do GG Performance, com dez casos POBJ determinísticos e telemetria de custo/latência.

### Changed
- Executor de canary passou a suportar três ondas supervisionadas (3, 5 e 10 casos).

### Security
- Nenhuma decisão ou override humano foi fabricado; custo foi zero por ausência de chamadas de modelo e efeitos externos permaneceram bloqueados.

## [3.2.17] - 2026-08-28

### Added
- Onda 2 do canary sintético do GG Performance, com cinco casos POBJ determinísticos e relatório de revisão humana.

### Changed
- Executor de canary passou a suportar ondas 1 e 2 sem fabricar decisões humanas.

### Security
- A Onda 2 manteve zero mutações de estado e zero efeitos externos; dados reais continuam desconectados.

## [3.2.16] - 2026-08-28

### Changed
- Rafael formalizado como autoridade exclusiva para aprovar cada fonte, definir campos permitidos/proibidos e autorizar qualquer ampliação de retenção.

### Security
- Fontes, campos ou prazos não podem ser ampliados por inferência; cada autorização deve ser registrada antes do uso.

## [3.2.15] - 2026-08-28

### Changed
- Formalizada a propriedade privada do Diretor 360 por Rafael e sua responsabilidade técnica permanente.
- Removida a previsão de transferência obrigatória para TI/Segurança; delegação futura passa a ser opcional, explícita e revogável.

### Security
- Regras institucionais permanecem aplicáveis apenas a fontes de dados institucionais eventualmente autorizadas, sem alterar a propriedade do projeto.

## [3.2.14] - 2026-08-28

### Changed
- C1 concluído documentalmente com Rafael como responsável técnico interino e autoridade de concessão/revogação de acessos.
- Retenção definida em 24 meses para dados detalhados, até 90 dias para backups e prazo indeterminado somente para agregados não identificáveis.
- Transferência formal para TI/Segurança instituída como requisito antes do ambiente institucional.

### Security
- A autorização documental não ativa fonte real; cadastro, validação e gate técnico continuam obrigatórios antes da primeira conexão.

## [3.2.13] - 2026-08-28

### Changed
- C1 passou a autorizar a planilha POBJ, limitada aos campos meta, realizado e período.

### Security
- CPF e demais dados pessoais não necessários foram explicitamente proibidos para esta finalidade.

## [3.2.12] - 2026-08-28

### Changed
- Registro C1 recebeu a finalidade de acompanhar/analisar POBJ pelo GG Performance, público autenticado por e-mail/convite, responsável de negócio e declaração institucional de Rafael.

### Security
- Fonte/campos mínimos, responsável técnico e política de retenção compatível com minimização permanecem requisitos obrigatórios antes de qualquer conexão com dados reais.

## [3.2.11] - 2026-08-28

### Added
- Executor e teste da Onda 1 do canary sintético do GG Performance, com três casos POBJ determinísticos e revisão humana pendente.
- Relatório `docs/audits/A1_ONDA1_PERFORMANCE_2026-08-28.md`.

### Fixed
- Protocolo do canary deixou de classificar fixtures sintéticas como casos reais e de pressupor decisões de Rafael.

### Security
- O executor bloqueia mutações e efeitos externos; decisões humanas permanecem nulas até revisão explícita.

## [3.2.10] - 2026-08-28

### Changed
- Gate Shadow aprovado explicitamente por Rafael após a consolidação da janela sintética íntegra.
- P8 avançado para estado parcialmente aprovado, mantendo C1 e a escolha do primeiro canary como decisões humanas obrigatórias.

### Security
- A aprovação não conectou fontes reais, não promoveu agentes para `ACTIVE` e não liberou efeitos externos.

## [3.2.9] - 2026-08-28

### Added
- Parecer técnico consolidado do Gate Shadow em `docs/audits/S2_GATE_SHADOW_2026-08-28.md`.

### Changed
- Janela Shadow sintética consolidada após 24/24 medições persistidas no monitor remoto.

### Security
- Confirmados 480/480 casos concluídos, zero divergências, zero mutações de estado e zero efeitos externos; o runtime permanece sem dados reais, agentes `ACTIVE` ou efeitos externos.

## [3.2.0] - 2026-08-28

### Changed
- Roadmap operacional reorganizado em Trilha S isolada, preparação independente P0–P8 e ativação gradual A1–A5.
- `checklist.md` atualizado para refletir a nova sequência de aceite até `ACTIVE_READ_ONLY_SUPERVISED`.
- Shadow separado explicitamente do desenvolvimento, sem alteração de scripts, casos, métricas ou critérios durante a janela.

### Security
- Mantidos bloqueios para dados reais, promoção de agentes e efeitos externos até os gates e aprovações específicos.

## [3.2.1] - 2026-08-28

### Added
- Relatório `docs/audits/RECONCILIACAO_P0_2026-08-28.md` com confronto entre checklist, roadmap, código, testes e estado do Git.

### Changed
- P0 concluído com documentação sincronizada e autorização institucional descrita sem conectar fontes reais.
- RTO/RPO passaram a ser tratados como medições dependentes do ambiente-alvo.
- Fase 8 distinguida entre provisionamento pronto (M8.1) e VPS 24h ainda planejado (M8.2).

## [3.2.2] - 2026-08-28

### Added
- Relatório `docs/audits/REGRESSAO_P1_2026-08-28.md` com a bateria geral, lint, build e validações da base técnica.

### Changed
- P1 concluído com 14/14 testes gerais aprovados, lint sem erros e build de produção aprovado.

### Security
- A regressão permaneceu sintética; nenhum agente foi promovido e nenhum efeito externo foi liberado.

## [3.2.3] - 2026-08-28

### Added
- Relatório `docs/audits/P2_MOTORES_DETERMINISTICOS_2026-08-28.md` com auditoria e testes dos motores POBJ, freshness, GDAD, compromissos e domínio.

### Changed
- P2 avançado com a base determinística comprovada; curvas normativas ausentes e política de ausência de contato permanecem explicitamente abertas.

### Security
- Nenhuma regra foi inventada para preencher lacunas normativas; casos sem evidência permanecem `UNDETERMINED` ou aguardam revisão.

## [3.2.4] - 2026-08-28

### Added
- Relatório `docs/audits/P3_CONTRATOS_GERENTES_2026-08-28.md`.
- `requirements-dev.txt` com `PyYAML==6.0.3` para o teste Python de lifecycle.

### Changed
- P3 concluído: contratos, lifecycle, roteamento, limites e runtime `INACTIVE` dos quatro Gerentes Gerais validados.

## [3.2.5] - 2026-08-28

### Added
- Relatório `docs/audits/P4_ORQUESTRACAO_2026-08-28.md` com validação da jornada integrada e operação assistida sintética.

### Changed
- P4 concluído: roteamento, contexto, dependências, conflitos, Estado 360 e Assessor validados.

### Security
- Operação assistida permaneceu sintética, sem promoção de agentes e sem efeitos externos.

## [3.2.6] - 2026-08-28

### Added
- Relatório `docs/audits/P5_SEGURANCA_LGPD_2026-08-28.md`.

### Changed
- P5 avançado: controles técnicos de segurança e LGPD aprovados; campos da autorização operacional permanecem pendentes de confirmação humana.

### Security
- Nenhuma fonte real foi conectada e nenhum dado real foi processado.

## [3.2.7] - 2026-08-28

### Added
- Relatórios `docs/audits/P6_PRONTIDAO_OPERACIONAL_2026-08-28.md` e `docs/audits/P7_CANARY_PREPARACAO_2026-08-28.md`.

### Changed
- P6 aprovado e P7 preparado; prontidão técnica, rollback, carga e canary sintético documentados.

### Security
- Execução do canary, promoção de agentes, dados reais e efeitos externos permanecem bloqueados até o Gate Shadow e aprovação explícita.

## [3.2.8] - 2026-08-28

### Added
- Pré-verificação `docs/audits/P8_PRE_GATE_READINESS_2026-08-28.md`, com dependências e critérios para o Gate geral.

### Changed
- P8 marcado como pré-verificado, permanecendo `NOT_READY` até 24/24 Shadow e decisões humanas obrigatórias.

## [3.1.6] - 2026-08-28

### Fixed
- Consolidado o teste local do Evidence Graph com cálculo canônico de hash, proteção contra acesso anônimo e verificação append-only.
- Padronizada a execução em PowerShell 7 (`pwsh`) para impedir divergências de codificação do Windows PowerShell legado.

### Security
- Mantidos dados exclusivamente sintéticos, sem efeitos externos, durante a validação.

## Não publicado — reconciliação arquitetural e contratos por domínio

- Criado manifesto central verificável para Diretor, quatro Gerentes Gerais e 21 especialistas.
- Separados os estados de desenho, implementação e runtime; aprovação deixa de significar ativação.
- Preservados oito fluxos sintéticos legados sem ativar os novos agentes.
- Migrados o registro de capacidades e o roteamento para lifecycle explícito e falha segura.
- Conhecimento consolidado como capacidade transversal; antigo Gerente de Conhecimento e filhos aposentados.
- Criados contratos específicos de entrada e resposta para Performance, Financeiro e Relacionamento.
- Performance passou a exigir data-base, fonte oficial, piso, teto, pontos, esforço e defasagem.
- Financeiro passou a separar orçamento, realizado, variação, concentração e grau de atribuição.
- Relacionamento passou a exigir finalidade, consentimento, linha do tempo, incertezas e aprovação humana.
- Rafael permanece como autoridade final; runtime novo e dados reais permanecem sem liberação automática.
- Adicionados seis exemplos sintéticos canônicos e testes para piso próximo, teto superado, defasagem, GDAD parcial, atribuição desconhecida e compromisso vencido.
- Criado contrato Performance–Conta mediado pelo Motor 360; a fase inicial trabalha no nível da meta e proíbe empresa, conta ou origem por ação.
- Criado gate formal da Etapa B, pendente apenas de aprovação explícita de Rafael.
- Gate da Etapa B homologado por Rafael em 27/08/2026; nenhuma capacidade foi ativada.
- Iniciada a Etapa C com motor POBJ determinístico para piso, meta, teto, produção pendente, projeção e ranking de até cinco indicadores.
- Pontos intermediários agora exigem curva oficial; sem regra versionada, o motor retorna `UNDETERMINED`.
- Versionada a regra geral oficial do POBJ 2026: piso de 70%, teto de 150% e multiplicadores de 0%, 50%, 75% e 100%.
- Implementada a fórmula oficial `peso × atingimento limitado × multiplicador`, preservando o valor bruto e mantendo não resolvida a exibição de 6,375 como 6,37 no manual.
- Registradas as exceções que não podem herdar a regra geral: Sucesso de Equipe - Crédito, EncantaBRA, Vencidos Até 59 dias, Consórcio, Cartões, Seguros e Aceleradores.
- Confirmado no plano oficial POBJ de 26/08/2026 que a atualidade deve ser avaliada pela `DT.BASE` de cada indicador, e não apenas pela data-base geral do relatório.
- Criado motor determinístico de atualidade por indicador, com estados `CURRENT`, `POSSIBLY_LAGGED`, `LAGGED_WITH_PENDING`, `UNKNOWN` e `INVALID_FUTURE_DATE`.
- Produção pendente passou a exigir estado de evidência e permanece projeção não oficial; o placar publicado nunca é sobrescrito.
- Indicador fora da tolerância versionada deixa o ranking automático até reconciliação; a tolerância ainda depende de calibração por fonte e não é inventada pelo agente.
- Criada política `CALIBRATING` com cinco planos oficiais de agosto e ativação explicitamente proibida.
- Identificadas cadências distintas entre Crédito, Vencidos, Cartões e Seguros; um limite global de dias foi rejeitado como desenho de produção.
- Motor de atualidade passou a aceitar `SOURCE_WATERMARK`, comparando a `DT.BASE` à data esperada da própria fonte; modo por dias permanece apenas como fallback controlado.


### v2.0 — AGENTS do Diretor Geral 360 consolidado

- Publicada a identidade do Diretor como parceiro executivo, integrador crítico e orquestrador dos quatro Gerentes Gerais.
- Formalizadas as abas individuais de Conta, Performance, Financeiro e Relacionamento.
- Instituídos desafio construtivo, provocação respeitosa, agenda executiva, memória em camadas e promoção governada de conhecimento.
- Atualizada a parceria prioritária Conta–Performance e os modos Conversa Direta, Visão do Diretor e Evento.
- Separados placar oficial, produção pendente, cenários, impacto financeiro e valor de carteira.
- Mantidas as regras técnicas de proveniência, segurança, resiliência, auditoria, homologação e rollback.
- Documento promovido para v2.0 `APPROVED_DESIGN`; runtime permanece inativo até implementação e avaliação.

## Não publicado — Gerente Geral Financeiro v2.0 aprovado

> Gerente Geral e cinco especialistas aprovados por Rafael em 27/08/2026. Runtime permanece inativo.

- `dashboard-pj` adotado somente como referência funcional; dados demonstrativos, fórmulas, thresholds e recomendações fixas não foram homologados.
- GDAD reconhecido como fonte oficial de orçamento, realizado, saldo médio, spread, resultado, volume e variação.
- Snapshot oficial histórico de julho de 2026 registrado como primeira linha de base real, preservando hierarquia e impedindo dupla contagem.
- Cálculos permanecem determinísticos e valores publicados prevalecem sobre recálculos de validação.
- Diagnóstico aprovado nas filas `PROTECT`, `RECOVER`, `INVESTIGATE`, `MONITOR` e `LEARN`.
- Cenários e atribuição separados do oficial, com linha de base sem ação, risco, canibalização e POBJ em bloco próprio.
- Aprendizado usa `LOW_SAMPLE`, escopo, evidência, validade e proibição de generalização automática.
- Cinco especialistas aprovados: Fontes e Reconciliação; Cálculo e Estado; Diagnóstico e Concentração; Cenários e Atribuição; Desfechos e Aprendizado.
- Máximo de quatro especialistas por execução; nenhum contato ou operação externa é autorizado.

## 2026-08-27 — GG Conta 4.38.0: catálogo de especialistas concluído

- Concluída e aprovada a especificação do especialista `CONTA_CREDITO_APRENDIZADO` 1.0.0.
- Adicionados 29 códigos fechados de snapshot, decisão, contratação, utilização, desempenho, padrões, hipóteses, leakage, drift e abstenção.
- `reason-codes.yaml` avançou para 1.6.0.
- Formalizados integração, handoff canônico e 28 critérios de aceite do especialista de crédito.
- Os seis especialistas do GG Conta estão especificados e aprovados na versão 1.0.0.
- GG Conta 4.38.0 marcado como domínio aprovado, pendente de implementação técnica, contratos especializados e testes integrados.

## 2026-08-27 — GG Conta 4.37.0: governança do aprendizado de crédito

- Especialista `CONTA_CREDITO_APRENDIZADO` avançou para 0.5.0.
- Criados registro e sete estados de hipótese.
- Formalizados doze requisitos para eventual promoção a modelo.
- Incluídos calibração, análise de erros, drift, abstenção, validade, rollback, monitoramento e kill switch.
- Qualquer estimativa futura deverá ser rotulada como analítica e sem valor de aprovação institucional.

## 2026-08-27 — GG Conta 4.36.0: métricas de aprendizado de crédito

- Especialista `CONTA_CREDITO_APRENDIZADO` avançou para 0.4.0.
- Formalizadas métricas de decisão, contratação, utilização, prazo, condições e desempenho.
- Aprovadas faixas configuráveis: menos de 3, 3–29 e 30 ou mais decisões comparáveis.
- Incluídos controles para dependência entre tentativas, mudança de política, desbalanceamento, incerteza e maturação temporal.
- Reforçada proteção contra exposição de grupos pequenos e reidentificação.

## 2026-08-27 — GG Conta 4.35.0: resultado e desempenho de crédito

- Especialista `CONTA_CREDITO_APRENDIZADO` avançou para 0.3.0.
- Separados resultado da tentativa, contratação, utilização e desempenho posterior.
- Formalizados estados, campos e horizontes de acompanhamento.
- Aprovação deixou de ser tratada automaticamente como bom resultado e negativa não implica preparação inadequada.
- Criadas salvaguardas explícitas contra vazamento temporal e alteração retroativa do snapshot.

## 2026-08-27 — GG Conta 4.34.0: snapshot de tentativa de crédito

- Especialista `CONTA_CREDITO_APRENDIZADO` avançou para 0.2.0.
- Aprovado snapshot anterior à decisão com proposta, risco, conta, situação econômica, políticas e qualidade.
- Snapshot tornou-se imutável após submissão; correções geram versões vinculadas.
- Resultado posterior não pode ser gravado como informação conhecida antes da decisão.
- Definidos dados mínimos comparáveis com lacunas explícitas, sem preenchimento por suposição.

## 2026-08-27 — GG Conta 4.33.0: missão de Crédito e Aprendizado

- Criada a versão 0.1.0 do especialista `CONTA_CREDITO_APRENDIZADO`.
- Aprovadas missão, pergunta principal, responsabilidades, objetos, comparabilidade, resultados, níveis de aprendizado e salvaguardas.
- Aprendizado inicial limitado a casos individuais e padrões descritivos.
- Proibidas sondagem do motor, contorno de controles, garantia de resultado e alteração automática de políticas.

## 2026-08-27 — GG Conta 4.32.0: Risco e Elegibilidade 1.0.0

- Concluída e aprovada a especificação do especialista `CONTA_RISCO_ELEGIBILIDADE` 1.0.0.
- Adicionados 22 códigos fechados de Rating, Sale, restrições, políticas, elegibilidade, reprocessamento e exceção humana.
- `reason-codes.yaml` avançou para 1.5.0 sem duplicar códigos existentes.
- Formalizados integração, handoff canônico e 24 critérios de aceite.
- Especialista marcado como pronto para implementação e testes, sem autoridade para aprovar crédito ou executar alteração institucional.

## 2026-08-27 — GG Conta 4.31.0: gates e revisão de risco

- Especialista `CONTA_RISCO_ELEGIBILIDADE` avançou para 0.4.0.
- Gates passaram a usar apenas `PASS` e `MANUAL_REVIEW_REQUIRED`, sem rótulo genérico de bloqueio.
- Exigido menor escopo possível entre cliente, produto, operação e ação.
- Formalizados requisitos de PASS, conteúdo da revisão, saneamento e reprocessamento.
- Resolução de pendência passou a exigir nova execução e preservação do gate anterior.

## 2026-08-27 — GG Conta 4.30.0: regularização e histórico de risco

- Especialista `CONTA_RISCO_ELEGIBILIDADE` avançou para 0.3.0.
- Separadas baixa confirmada e primeira observação sem restrição.
- Criados estados pós-regularização sem linguagem de liberação automática.
- Formalizados reincidência, preservação histórica, nova análise legítima e divergência entre fontes.
- Proibidas tentativas destinadas a sondar o motor ou contornar controles.

## 2026-08-27 — GG Conta 4.29.0: Rating, Sale e restrições

- Especialista `CONTA_RISCO_ELEGIBILIDADE` avançou para 0.2.0.
- Rating e Sale passaram a preservar valor bruto e depender de tabela oficial versionada para interpretação direcional.
- Formalizados dados e oito estados de restrição, deterioração combinada e precedência de fontes.
- Escala 1–7 registrada como política condicionada à confirmação institucional antes do uso com dados reais.
- Melhora ou baixa não produzem aprovação automática e piora combinada eleva cuidado sem decidir crédito.

## 2026-08-27 — GG Conta 4.28.0: missão de Risco e Elegibilidade

- Criada a versão 0.1.0 do especialista `CONTA_RISCO_ELEGIBILIDADE`.
- Aprovadas missão, pergunta principal, responsabilidades, estados, gate por escopo, salvaguardas e resultado esperado.
- Separados risco, restrição, elegibilidade, decisão do motor, decisão humana e execução.
- Formalizado que impedimento confirmado afeta somente cliente, produto, operação ou ação alcançada pela regra.

## 2026-08-27 — GG Conta 4.27.0: Atividade e Centralização 1.0.0

- Concluída e aprovada a especificação do especialista `CONTA_ATIVIDADE_CENTRALIZACAO` 1.0.0.
- Adicionados 25 códigos fechados de atividade, movimentação, centralização, produtos e limites.
- `reason-codes.yaml` avançou para 1.4.0 sem duplicar códigos já existentes.
- Formalizados integração, handoff canônico e 20 critérios de aceite.
- Especialista marcado como pronto para implementação e testes, sem autoridade para conceder crédito, calcular retorno, pontos ou abordagem.

## 2026-08-27 — GG Conta 4.26.0: limites e uso responsável

- Especialista `CONTA_ATIVIDADE_CENTRALIZACAO` avançou para 0.5.0.
- Criados dez estados de limite e eventos de concessão, utilização, revisão e vencimento.
- Separados pré-aprovação, limite ativo e elegibilidade definitiva.
- Formalizado que crédito somente pode ser considerado diante de necessidade, viabilidade, risco e benefício plausível.
- Proibida sugestão de endividamento apenas para geração de meta.

## 2026-08-27 — GG Conta 4.25.0: produtos e profundidade

- Especialista `CONTA_ATIVIDADE_CENTRALIZACAO` avançou para 0.4.0.
- Separados contratação, ativação e utilização de produtos.
- Criados dez estados de uso e seis níveis de profundidade.
- Produto sem uso passou a exigir investigação antes de gerar alerta ou oportunidade.
- Cobertura e saturação passaram a utilizar somente a base elegível como denominador.

## 2026-08-27 — GG Conta 4.24.0: centralização e share

- Especialista `CONTA_ATIVIDADE_CENTRALIZACAO` avançou para 0.3.0.
- Separadas centralização confirmada, estimada, somente interna e desconhecida.
- Share passou a exigir fluxo, período, numerador, denominador, fonte, cobertura e confiança.
- Centralização passou a ser avaliada por tipo de fluxo, sem percentual geral enganoso.
- Formalizado que fluxo externo somente representa oportunidade potencial quando houver necessidade, benefício, adequação e elegibilidade.

## 2026-08-27 — GG Conta 4.23.0: métricas de atividade

- Especialista `CONTA_ATIVIDADE_CENTRALIZACAO` avançou para 0.2.0.
- Criados cinco níveis de atividade e oito tendências de movimentação.
- Formalizados métricas, períodos comparáveis, fluxos e tratamento de sazonalidade.
- Queda passou a considerar materialidade absoluta, relativa, histórica e contextual.
- Adiadas regras numéricas até calibração com dados reais e aprovação de Rafael.

## 2026-08-27 — GG Conta 4.22.0: missão de Atividade e Centralização

- Criada a versão 0.1.0 do especialista `CONTA_ATIVIDADE_CENTRALIZACAO`.
- Aprovadas missão, pergunta principal, responsabilidades, sete dimensões, salvaguardas e resultado esperado.
- Separada contratação de uso efetivo e quantidade de produtos de profundidade real.
- Formalizado que share externo depende de dado autorizado e que limite ocioso não representa problema isoladamente.

## 2026-08-27 — GG Conta 4.21.0: Ciclo de Vida e Saúde 1.0.0

- Concluída e aprovada a especificação do especialista `CONTA_CICLO_VIDA_SAUDE` 1.0.0.
- Adicionados 26 códigos fechados de checkpoint, saúde, recuperação, atividade, risco, atrito, concentração, saturação e oxigenação.
- `reason-codes.yaml` avançou para 1.3.0.
- Formalizados handoff canônico e 24 critérios de aceite.
- Especialista marcado como pronto para implementação e testes, sem autoridade para executar ações ou substituir outros domínios.

## 2026-08-27 — GG Conta 4.20.0: visão coletiva da carteira

- Especialista `CONTA_CICLO_VIDA_SAUDE` avançou para 0.6.0.
- Aprovado painel coletivo de composição, saúde, risco, atividade, concentração, saturação, capacidade futura e atrito.
- Exigidos período, data-base, numerador, denominador, cobertura, confiança e rastreabilidade.
- Proibida combinação de fontes ou períodos incompatíveis e exposição de itens sem autorização.
- Adiada criação de score único até haver histórico e calibração suficientes.

## 2026-08-27 — GG Conta 4.19.0: atrito e clientes-chave

- Especialista `CONTA_CICLO_VIDA_SAUDE` avançou para 0.5.0.
- Atrito passou a ser medido por eventos objetivos e percepção humana identificada.
- Cliente-chave passou a considerar valor financeiro, comercial, regional, relacional e dificuldade de reposição.
- Criada matriz valor × atrito com revisão humana obrigatória para eventual saída.
- Deterioração de cliente-chave passou a gerar prioridade de cuidado e necessidade de oxigenação.

## 2026-08-27 — GG Conta 4.18.0: sinais e prioridade de cuidado

- Especialista `CONTA_CICLO_VIDA_SAUDE` avançou para 0.4.0.
- Aprovados sinais negativos e positivos de maturação, atividade, risco, acompanhamento e recuperação.
- Criadas prioridades qualitativas P0–P3 e revisão manual, sem pesos arbitrários.
- Formalizado ciclo do alerta com evidência, prazo, conclusão verificável, cooldown e reabertura.
- Mantida separação entre prioridade de cuidado e prioridade de Performance.

## 2026-08-27 — GG Conta 4.17.0: saúde e tendência

- Especialista `CONTA_CICLO_VIDA_SAUDE` avançou para 0.3.0.
- Separadas condição atual de saúde e tendência temporal.
- Criados oito estados de saúde e cinco tendências.
- Exigidos períodos comparáveis para determinar tendência.
- Formalizado que melhora de Rating, Sale ou restrição não representa liberação automática.
- Permitidas combinações como saudável em piora e frágil em recuperação para evitar classificações simplistas.

## 2026-08-27 — GG Conta 4.16.0: checkpoints de Ciclo de Vida

- Especialista `CONTA_CICLO_VIDA_SAUDE` avançou para 0.2.0.
- Formalizados D0, D30, D60, D90 e D120 com objetivos e resultados verificáveis.
- D0 passou a preservar a linha de base de Rating, Sale e restrições.
- D120 passou a produzir classificação explícita de maturidade e condição.
- Contas maduras receberam monitoramento contínuo, revisão mensal de sinais e revisão estrutural trimestral.
- Eventos críticos podem antecipar revisão sem apagar o histórico dos checkpoints.

## 2026-08-27 — GG Conta 4.15.0: missão de Ciclo de Vida e Saúde

- Criada a versão 0.1.0 do especialista `CONTA_CICLO_VIDA_SAUDE` para construção conjunta com Rafael.
- Aprovadas missão, pergunta principal, saúde multidimensional, resultados esperados e limites.
- Incorporado acompanhamento histórico de entrada, baixa e reincidência de restrições e de melhora, estabilidade ou piora de Sale e Rating interno.
- Separadas detecção e prioridade de cuidado, em Ciclo de Vida, da avaliação técnica de elegibilidade, em Risco e Elegibilidade.

## 2026-08-27 — GG Conta 4.14.0: Prospecção e Oxigenação 1.0.0

- Concluída e aprovada a especificação do especialista `CONTA_PROSPECCAO_OXIGENACAO` 1.0.0.
- Adicionados 22 códigos fechados para prospect, pré-aprovação, abertura, ativação e handoff D0.
- `reason-codes.yaml` avançou para 1.2.0.
- Formalizados handoff canônico e 18 critérios de aceite.
- Especialista marcado como pronto para implementação e testes, sem autorização automática para contato ou abertura.

## 2026-08-27 — GG Conta 4.13.0: handoff de abertura e ativação

- Especialista `CONTA_PROSPECCAO_OXIGENACAO` avançou para 0.7.0.
- Criado handoff em duas etapas: abertura inicia D0; ativação transfere a responsabilidade principal para Ciclo de Vida.
- Formalizados critérios válidos e eventos que não comprovam ativação isoladamente.
- Definido conteúdo mínimo do histórico transferido e tratamento de situações especiais.
- Ausência ou conflito de regra oficial de ativação passou a exigir revisão manual.

## 2026-08-27 — GG Conta 4.12.0: atualidade do funil

- Especialista `CONTA_PROSPECCAO_OXIGENACAO` avançou para 0.6.0.
- Criados alertas configuráveis de 30, 60 e 90 dias sem atualização.
- Formalizadas validade de pré-aprovações, pausa, perda, descarte, ausência de retorno, reativação e retenção.
- Proibidos descarte e exclusão automáticos por baixo potencial, ausência de resposta ou condição vencida.
- Exigida preservação do histórico em perda, expiração e reativação.

## 2026-08-27 — GG Conta 4.11.0: priorização de prospects

- Especialista `CONTA_PROSPECCAO_OXIGENACAO` avançou para 0.5.0.
- Separados potencial estratégico de Conta e impacto fornecido por Performance.
- Criadas classificações qualitativas iniciais sem pesos arbitrários.
- Definidas matriz de tratamento, oito critérios de desempate e salvaguardas.
- Mantida a decisão consolidada no Diretor e a decisão operacional em Rafael.

## 2026-08-27 — GG Conta 4.10.0: funil de prospecção

- Especialista `CONTA_PROSPECCAO_OXIGENACAO` avançou para 0.4.0.
- Formalizados doze estágios do recebimento ao handoff D0 e seis estados laterais.
- Diferenciadas abertura institucional e ativação efetiva.
- Permitido avanço não linear quando sustentado por evidência, sem tornar visita obrigatória.
- Exigidos motivo, responsável, data e evidência para cada transição, pausa, perda, descarte ou reativação.

## 2026-08-27 — GG Conta 4.9.0: dados progressivos de prospecção

- Especialista `CONTA_PROSPECCAO_OXIGENACAO` avançou para 0.3.0.
- Separados dados mínimos de entrada, dados de qualificação, condições bancárias e acompanhamento comercial.
- Permitido ingresso simples no funil sem exigir dados que ainda serão obtidos durante a qualificação.
- Formalizados histórico de estágio, próxima ação, prazo, responsável e evidências das atualizações.
- Proibido preenchimento de dados ausentes por suposição.

## 2026-08-27 — GG Conta 4.8.0: origens de prospecção

- Especialista `CONTA_PROSPECCAO_OXIGENACAO` avançou para 0.2.0.
- Aprovadas dez origens de candidatos, incluindo indicações internas, prospecção própria, referências, bases empresariais, novas empresas, ex-clientes e grupos relacionados.
- Exigidos origem, recebimento, data-base, validade, responsável, finalidade e restrições de uso.
- Registrado que origem autorizada não substitui validação de identidade, qualidade, atualidade ou legitimidade de uso.

## 2026-08-27 — GG Conta 4.7.0: missão de Prospecção e Oxigenação

- Criada a versão 0.1.0 do especialista `CONTA_PROSPECCAO_OXIGENACAO` para construção conjunta com Rafael.
- Aprovadas missão, pergunta principal, conceito de oxigenação, definição de sucesso e limites iniciais.
- Separados os marcos de conversão, ativação e qualidade inicial.
- Formalizado o handoff futuro para Ciclo de Vida com preservação do histórico.

## 2026-08-27 — GG Conta 4.6.0: Identidade e Qualidade 1.0.0

- Criada a especificação canônica do especialista `CONTA_IDENTIDADE_QUALIDADE`.
- Formalizados entradas, suficiência contextual, validação, normalização, deduplicação, precedência, conflitos, saída e critérios de aceite.
- Mantida continuidade de registros válidos quando parte do lote estiver inválida.
- Determinada revisão manual somente para o escopo materialmente afetado.
- Adicionados 14 códigos fechados de identidade, qualidade, fonte, período, OCR e instrução embutida; `reason-codes.yaml` avançou para 1.1.0.

## 2026-08-27 — GG Conta 4.5.0: especialistas aprovados

- Aprovado catálogo com seis especialistas e limite de quatro acionamentos por execução.
- Formalizados Identidade e Qualidade; Prospecção e Oxigenação; Ciclo de Vida; Atividade e Centralização; Risco e Elegibilidade; Crédito e Aprendizado.
- Definidos gatilhos de roteamento, precedências e dependências internas.
- Removida do GG Conta toda dependência do Bibliotecário ou de um GG Conhecimento transversal.
- Regras de Conta passam a vir de políticas oficiais versionadas disponíveis no sistema; ausência, vencimento ou conflito gera `MANUAL_REVIEW_REQUIRED`.
- A migração do antigo Bibliotecário para subagente de Performance será tratada na revisão daquele domínio, sem alteração concorrente neste trabalho.

## 2026-08-27 — GG Conta 4.4.0: fronteiras entre domínios

- Formalizado que o GG Conta é proprietário da saúde do cliente e da carteira, sem absorver cálculos e interpretações especializados de outros domínios.
- Ampliadas as proibições relativas a metas, rentabilidade, abordagem, normas, crédito, ações externas, bloqueio amplo e julgamento subjetivo de atrito.
- Definidas as responsabilidades de Conta, Performance, Financeiro, Relacionamento, Conhecimento e Diretor na composição do Estado 360.
- Separadas prioridade de cuidado e prioridade de performance como eixos independentes e simultaneamente visíveis.
- Criada a regra de composição de oportunidades: Conta confirma situação e elegibilidade; os demais domínios complementam; Diretor consolida; Rafael decide.

## 2026-08-27 — GG Conta 4.3.0: escopo principal aprovado

- Aprovados oito eixos de atuação: identidade e dados; ciclo de vida; atividade; centralização; risco e crédito; saúde coletiva; atrito; cuidado e priorização.
- Formalizado o acompanhamento contínuo da carteira, da prospecção à eventual saída.
- Diferenciada abertura cadastral de ativação efetiva e relacionamento sustentável.
- Incluídas análises temporais de movimentação, profundidade, centralização, concentração, saturação e capacidade comercial futura.
- Incorporado atrito como indicador operacional baseado em evidências, sem rotulação subjetiva do cliente.
- Delimitadas as interfaces: Conta identifica a necessidade; Relacionamento prepara a abordagem; Financeiro calcula impacto; Performance conecta oportunidades às metas.

## 2026-08-27 — GG Conta 4.2.0: candidatos a novas contas

- Incluída a gestão de candidatos a novas contas sugeridos pelo banco, inclusive com produtos ou limites pré-aprovados.
- Formalizados identificação, origem, deduplicação, vigência das condições e classificação do vínculo do prospect.
- Definido o funil de acompanhamento do recebimento à abertura e ativação.
- Conectada a aquisição de novos clientes à oxigenação, diversificação, redução de concentração e capacidade comercial futura da carteira.
- Estabelecida a continuidade obrigatória após a abertura pelo ciclo D0–D120 e carteira madura.
- Registrado que pré-aprovação é condição informada e datada, não garantia de contratação ou aprovação definitiva.

## 2026-08-27 — GG Conta 4.1.0: missão aprovada

- Reposicionado o GG Conta de validador predominantemente cadastral para guardião e desenvolvedor ativo da carteira PJ.
- Incorporado o acompanhamento integral do ciclo de relacionamento: prospecção, abertura, ativação, maturação, manutenção, desenvolvimento, recuperação e eventual saída.
- Incluída a responsabilidade de acompanhar saúde coletiva, oxigenação, concentração, dependência de clientes-chave, cobertura de produtos, saturação comercial e capacidade futura de gerar oportunidades.
- Formalizada a integração prioritária entre GG Conta e GG Performance, preservando as responsabilidades próprias de cada domínio.
- Registrado que dados de Financeiro, Relacionamento, Conhecimento e Performance alimentam o parecer de Conta por meio do Diretor, sem delegação lateral.
- Missão, pergunta principal e princípio operacional aprovados por Rafael; escopo e especialistas permanecem em revisão.

## Não publicado — Gerente Geral de Relacionamento v2.0 aprovado

> Desenho aprovado por Rafael em 27/08/2026. Especialistas ainda serão revisados individualmente e o runtime permanece inalterado.

- Projeto `Minhas-respostas` adotado como referência funcional, sem copiar exemplos estáticos, heurísticas de sentimento ou mistura de responsabilidades.
- Criados três modos de trabalho: `UNDERSTAND`, `PREPARE` e `RESPOND`.
- Formalizada separação entre fato textual, necessidade, objeção, inferência, hipótese, pergunta de descoberta, compromisso e sugestão de abordagem.
- Gerente passa a atuar como memória de conversas, guardião de compromissos, preparador consultivo e parceiro crítico de interpretação.
- Rascunhos permanecem em `PENDING_HUMAN_APPROVAL`; nenhum contato externo é enviado automaticamente.
- Prevista conversa direta na aba Relacionamento com compartilhamento apenas de fatos e aprendizados promovidos ao Estado 360.
- Proposto catálogo de cinco especialistas, limitado a quatro por execução.
- Criadas as cinco especificações candidatas em `SANDBOX`: Fontes e Linha do Tempo; Necessidades, Objeções e Descoberta; Compromissos e Follow-up; Estratégia e Redação; Desfechos e Aprendizado.
- Especialistas receberam IDs canônicos, contratos de entrada e saída, fronteiras sem sobreposição, revisão humana, trilha de auditoria, critérios de aceite, falha segura e rollback.
- Conteúdo importado passou a ser tratado como dado não confiável, com isolamento contra instruções embutidas; ferramentas de envio externo permanecem indisponíveis.
- Formalizada a divisão entre interpretação por IA e controles determinísticos para hashes, versões, datas, estados, alertas e invalidações.
- Especialista `RELATIONSHIP_SOURCES_TIMELINE` aprovado por Rafael em 27/08/2026; desenho promovido para `APPROVED`, mantendo o runtime inativo.
- Os cinco especialistas do Gerente Geral de Relacionamento foram aprovados integralmente por Rafael em 27/08/2026 e promovidos para `APPROVED`; nenhum foi ativado no runtime.
- Aprovadas fontes controladas da primeira fase: texto, WhatsApp exportado, notas, áudio, e-mail, PDF, imagem e registro manual.
- Definida preservação do original e estados `LINKED`, `UNRESOLVED`, `MULTIPLE_CANDIDATES` e `PORTFOLIO_GENERAL`, sem vínculo silencioso.
- Aprovada gestão de compromissos por responsável, estados de follow-up, prazo explícito prioritário e alerta de ausência de contato após 60 dias com exceções.
- Aprovada preparação estruturada com leituras alternativas, perguntas, abordagem, rascunhos e critério de sucesso, adaptada por canal e tom sem alterar fatos.
- Aprovado aprendizado relacional baseado em desfechos, sem confundir silêncio, rapidez, sentimento, correlação ou rejeição de produto com intenção comprovada.

## Não publicado — Gerente Geral de Performance v5.3 aprovado

> Desenho do Gerente Geral e dos cinco especialistas aprovado por Rafael em 27/08/2026. O runtime continua inalterado até implementação, avaliações e promoção próprias para `ACTIVE`.

- Gerente Geral de Performance redesenhado a partir do projeto `Performance-PJ-mobile`, do manual POBJ e dos relatórios diários oficiais fornecidos por Rafael.
- Performance e Conta definidos como núcleo prioritário do plano comercial: Performance mede reconhecimento e risco profissional; Conta identifica onde a produção pode acontecer na carteira.
- Criado catálogo de cinco especialistas de Performance, limitado a quatro por execução: Fontes e Reconciliação, Pontuação e Estado, Gap e Cenários, Executabilidade e Plano, Desfechos e Aprendizado.
- `Next Best Actions` preservado com até cinco prioridades, comparando piso, faixas, 100%, teto, pontos marginais, esforço, prazo, elegibilidade, DCO e executabilidade.
- Incluído desafio estratégico para questionar hábitos, metas cronicamente baixas e caminhos pouco explorados, sem contrariar Rafael sem evidência.
- Relatórios diários POBJ enviados por Rafael classificados como fontes oficiais; hash, extração e reconciliação permanecem controles técnicos de ingestão.
- Especialista de Fontes e Reconciliação aprovado com manual normalmente semestral, metas mensais versionadas, revisões intramês, data-base por indicador e controle de produção ainda não refletida.
- Especialista de Pontuação e Estado aprovado com separação obrigatória entre placar oficial, produção pendente de atualização e cenário determinístico após reconhecimento.
- Especialista de Gap, Mudanças e Cenários aprovado com classificação de urgência temporal, considerando dias úteis, execução, data-base e janela provável de reconhecimento da competência mensal.
- Especialista de Executabilidade e Plano aprovado com fila diária viva e até cinco prioridades; na fase inicial opera por meta, sem empresa ou origem por ação, até o cadastro de contas e a integração com Conta estarem prontos.
- Especialista de Desfechos e Aprendizado aprovado com reconciliação entre execução e reconhecimento, operação inicial sem empresa por ação, tratamento `LOW_SAMPLE` e horizontes mensal, recorrente e estratégico.
- Separados placar oficial, produção operacional pendente e cenários potenciais; IA não calcula pontos nem altera regras POBJ.
- Formalizada parceria Performance–Conta por dependências mediadas pelo Motor 360, sem chamadas laterais entre gerentes.
- Diferenciadas produção originada na carteira existente e aquisição de contas novas, com pipelines e evidências próprios.
- Proposta arquitetura de abas individuais para conversa direta com cada Gerente Geral, mantendo Diretor para visão transversal e Motor 360 para auditoria e compartilhamento.
- Conversas passam a gerar contexto de sessão, candidatos a aprendizado, fatos confirmados e aprendizados aprovados, impedindo que hipótese vire fato automaticamente.
- Adotado tratamento `LOW_SAMPLE` para o início com poucas empresas e poucos desfechos.
- Financeiro reconhecido como domínio em amadurecimento, com estados `NOT_AVAILABLE`, `LEARNING`, `ESTIMATED` e `VALIDATED`; sua ausência não fabrica retorno nem bloqueia Conta e Performance.
- Registrada necessidade de versionar `AGENTS.md`, base dos Gerentes Gerais, schemas, políticas de memória e UI antes da ativação.

## 2026-08-26 — Correção do canal Telegram real

- Diagnosticado webhook sem URL ativa e ingestão hospedada desabilitada, com mensagens pendentes no Telegram.
- Site v9 publicado e webhook oficial ativado na rota hospedada autenticada.
- Confirmação imediata habilitada para cada mensagem aceita.
- Conclusão da ponte passou a responder ao chat Telegram de origem com status, achados, ações, lacunas e protocolo.
- Resposta final protegida por registro de auditoria para reduzir duplicidade e permitir retry após falha.
- Teste real comprovou ingestão, armazenamento protegido de PDF, reserva da fila, download pela ponte, processamento no n8n, publicação do Estado 360 e resposta final no Telegram.
- Fila pendente anterior drenada sem erro; processamento permanece sequencial, em ciclos de aproximadamente um minuto.

## 2026-08-27 — Etapa B e compatibilidade Windows

- Corrigido o teste de contratos de Conta para o formato canônico v2.0 do registro de capacidades e manifesto.
- Corrigida a resolução de caminhos nos testes direcionais para execução nativa no Windows.
- Bateria completa atualizada e aprovada com 14/14 testes.

## 2026-08-27 — Marco C1: baseline dos motores

- Validada a linha de base dos motores POBJ e freshness, incluindo piso, teto, ranking, pendências e watermark.
- Confirmada a coerência dos contratos direcionais e da integração inicial Performance–Conta.
- Bateria completa permaneceu aprovada com 14/14 testes; especialistas novos continuam inativos.

## 2026-08-27 — Marco C2a: motores determinísticos iniciais

- Criado `engines/finance/gdad-engine.mjs` para totais, variação, atingimento e atribuição conservadora.
- Criado `engines/relationship/commitments-engine.mjs` para prazos, vencimento e preservação de compromissos abertos.
- Adicionados testes sintéticos com valores inválidos, atribuição desconhecida e compromisso vencido.

## 2026-08-27 — Marco C2b: contrato e base de Shadow

- Conectado o GDAD ao contrato de resposta do especialista Financeiro.
- Criado comparador Shadow com sanitização de PII, hashes de baseline/candidata e bloqueio explícito de mutação e efeitos externos.
- Testes do adaptador financeiro e do comparador Shadow aprovados.

## 2026-08-27 — Marco D1: roteamento do Diretor

- Criado roteador determinístico com seleção por finalidade, exclusões explícitas e limite de quatro domínios.
- Runtime dos especialistas permanece `INACTIVE`; classificação ambígua gera revisão manual.
- Testes de seleção, visão completa e fallback aprovados.

## 2026-08-27 — Marco D2: envelope de Shadow

- Criado envelope de execução baseline/candidata com roteamento determinístico e fallback seguro.
- Sanitização de PII, hashes e bloqueio de mutação de Estado 360 e efeitos externos mantidos por contrato.
- Testes de divergência e classificação ambígua aprovados.

## 2026-08-27 — Marco D3: telemetria de Shadow

- Criado agregador de telemetria para equivalência, divergência, erros e contagem de efeitos proibidos.
- Suíte sintética de 20 comparações validou taxa de equivalência e ausência de mutação/efeito externo.

## 2026-08-27 — Marco E1: homologação sintética

- Executados os 20 casos canônicos em envelope Shadow com contexto saneado.
- Cobertura: 20/20 execuções concluídas, equivalência sintética de 100% e zero mutações/efeitos externos.

## 2026-08-27 — Marco E2: fallback e rollback

- Fallback determinístico para baseline implementado quando a candidata falha.
- Bloqueio de mutação de Estado 360 e efeitos externos validado nos caminhos de sucesso e erro.
- Gate formal de promoção para Shadow criado em `governance/SHADOW_RELEASE_GATE.md`.

## 2026-08-27 — Marco E3: gate aprovado para Shadow sintético

- Escopo aprovado: 20 casos sintéticos, janela inicial de 24 horas, SLO de conclusão de 99%.
- Limiares de pausa definidos para divergência acima de 10% ou qualquer efeito proibido.
- Backup do gate criado e verificado nas duas cópias do Google Drive.

## 2026-08-27 — Marco E4: início da observação Shadow

- Janela sintética de 24 horas iniciada com escopo restrito aos 20 casos canônicos.
- Primeira medição: 20/20 concluídos, equivalência de 100%, zero mutações e zero efeitos externos.
- Bateria geral mantida em 14/14 testes aprovados.

## 2026-08-27 — Marco E4b: executor periódico

- Criado `scripts/run-shadow-observation.mjs` para executar os 20 casos e persistir telemetria horária.
- Executor encerra com alerta quando conclusão fica abaixo de 99%, divergência supera 10% ou ocorre efeito proibido.
- Arquivos de observação foram mantidos fora do Git por serem evidências operacionais geradas.
- Automação horária `Shadow sintético 24h` ativada por 24 execuções na tarefa atual.

## 2026-08-27 — Marco E4c: consolidação e resposta a incidentes

- Criado consolidador de medições com taxas agregadas e decisão automática de pausa.
- Criado `runbooks/SHADOW_INCIDENT_ROLLBACK.md` com acionadores, investigação e retomada controlada.
- Primeira consolidação permaneceu saudável: 20/20 casos, zero erros, divergências ou efeitos.

## 2026-08-26 — Base canônica dos Gerentes Gerais

- Formalizadas quatro áreas de acompanhamento: Conta, Performance, Financeiro e Relacionamento.
- Conhecimento/Bibliotecário classificado como função transversal de suporte, não como quinta área de resultado.
- Criados documentos canônicos ausentes para Financeiro e Relacionamento.
- Conta, Performance e Conhecimento reestruturados com fronteiras, dependências, entregas e pontos para refinamento de Rafael.
- Performance passou a exigir mínimo de pontuação, faixas, fórmula, itens computáveis, teto, realizado, gap, projeção e memória de cálculo.
- Documento histórico de arquitetura marcado explicitamente como legado.
- Limite alinhado em quatro especialistas acionados por domínio.

## 2026-08-26 — Evals L2–L4 independentes do gabarito

- Campos de gabarito passaram a ser removidos antes de qualquer inferência avaliada.
- L2 foi delimitado explicitamente à extração de identidade PJ: razão social e CNPJ.
- Adicionada prova negativa de invariância: adulterar `entities`, `expected_status` ou `ground_truth_decision` não pode mudar a previsão.
- L3 passou a rejeitar referências de evidência vazias, duplicadas, malformadas ou com caracteres de caminho.
- Relatório dos Evals atualizado para `2.1.0-independent-ground-truth`.

## 2026-08-26 — Endurecimento da verificação de backups

- O teste H9 passou a abrir cada backup ZIP e confirmar que ele contém entradas válidas.
- O teste deixou de apresentar RTO/RPO fixos como se fossem medição; agora sinaliza corretamente que a medição operacional depende de restauração controlada.
- Bateria geral mantida em 13/13 testes aprovados.

## 2026-08-26 — Auditoria retrospectiva Fases 0–7

- Bateria híbrida executada com 13/13 testes aprovados.
- Auditoria retrospectiva registrada em `docs/audits/AUDITORIA_RETROSPECTIVA_FASES_0_A_7_2026-08-26.md`.
- Contratos JSON corrigidos para declarar `$schema` Draft 2020-12 e `$id` válido.
- Endpoints de canário, FinOps e laudo PDF protegidos por autenticação e autorização do usuário do Dashboard.
- Erros de lint nos endpoints corrigidos; build e compilação Python validados.
- Registradas limitações que permanecem: avaliações L2–L4 com risco de leakage, canário e recuperação ainda simulados, rotas com dependência de runtime Node, métricas do Dashboard estáticas e necessidade de evidência formal para dados reais.
- Ambiente mantido em `OFFLINE_EVAL`; nenhuma integração externa ou dado real foi ativado.
## 2026-08-27 — Marco E4d: persistência saneada da telemetria Shadow

- Criada tabela D1 idempotente para métricas agregadas de observações sintéticas, sem conteúdo dos casos ou identificadores de clientes.
- Criada API protegida por segredo para escrita e por usuário autorizado para leitura.
- O coletor rejeita campos extras, dados fora de `SYNTHETIC_ONLY`, métricas inconsistentes e payloads acima do limite.
- Dashboard passou a apresentar progresso da janela, equivalência, divergência e efeitos proibidos usando a fonte persistida.
- Executor local mantém operação sem upload quando o segredo não está configurado e nunca imprime o segredo.
- Executor periódico carrega a configuração local ignorada pelo Git, permitindo que a automação horária persista as medições sem expor o segredo.
- Versão hospedada publicada, acesso do endereço alinhado às integrações protegidas e primeira medição agregada persistida com HTTP 201.
## 2026-08-28 — Marco E4e: monitoramento ativo da janela Shadow

- Registrada no status a autorização institucional existente para dados reais, sem ampliar automaticamente o escopo operacional do gate sintético.
- Criado monitor de 24 medições com detecção de atraso, lacunas horárias, quebra de SLO, divergência e efeitos proibidos.
- API de telemetria passou a devolver a saúde agregada da janela após leitura e escrita.
- Dashboard passou a exibir medições restantes, próxima coleta, lacunas e alertas.
- Parecer automático é gerado ao completar a janela ou quando houver pausa obrigatória; Rafael permanece como decisor do gate.
## 2026-08-28 — Ajuste visual: métricas Shadow em aba própria

- Dashboard principal restaurado ao conteúdo anterior à inclusão do painel Shadow.
- Métricas, alertas e progresso da janela movidos para a aba independente `/shadow`.
- Link discreto para a nova aba mantido na navegação executiva.
## 2026-08-28 — Restauração da experiência Stitch/POBJ

- Recuperada a sequência construída entre 16:41 e 17:29 de 27/08: interface mobile AMOLED, importação segura, extração, revisão e aprovação individual do POBJ.
- Restauradas priorização de gaps, próximas ações e integração do site/Telegram com a fila única do n8n.
- Métricas Shadow preservadas fora da experiência principal, acessíveis pela aba `Mais`.
- Criado ponto de retorno Git `backup/pre-stitch-restore-20260828-0012` antes da restauração.
## 2026-08-28 — Correção da navegação para Métricas Shadow

- Substituída a transição interna pela navegação completa nas rotas protegidas.
- Corrigido o retorno silencioso à página inicial ao abrir `/shadow`.

## [3.1.0] - 2026-08-28

### Added
- `PROJECT_STATE.md` como ponto único de retomada operacional.
- Regras de execução autônoma, continuidade e bloqueios no `AGENTS.md`.

### Changed
- Formalizada a sincronização obrigatória entre `ROADMAP.md`, `PROJECT_STATE.md` e `CHANGELOG.md`.

### Security
- Mantida a exigência de não versionar segredos e de interromper apenas para bloqueios que exigem intervenção humana.

## [3.1.1] - 2026-08-28

### Changed
- `AGENTS.md` avançado para v2.1 com a especificação integral de execução autônoma, sincronização, retomada e continuidade.
- `ROADMAP.md`, `PROJECT_STATE.md` e `CHANGELOG.md` formalizados como controles sincronizados obrigatórios.

### Security
- Notificação de interrupção limitada a HARD BLOCKERS reais e realizada apenas por mecanismo seguro, sem credenciais no repositório.

## [3.1.2] - 2026-08-28

### Added
- Matriz auditável de fontes, regras, limites e rollback dos quatro Gerentes Gerais.
- Modelo de registro para autorização de dados reais, mantido sem preenchimento e sem conexão de fonte.

### Changed
- A2–A4 do roadmap concluídos com validação sintética, controles de rollback, auditoria, SLA e FinOps.

### Security
- Dados reais, agentes `ACTIVE` e efeitos externos continuam bloqueados.

## [3.1.3] - 2026-08-28

### Added
- Pacote de evidências e decisão para o Gate Shadow.
- Protocolo individual de canary do GG Performance, com ondas, métricas, pausa e rollback.

### Security
- Gate Shadow não libera dados reais ou efeitos externos; canary permanece supervisionado e bloqueado até aprovação explícita.

## [3.1.4] - 2026-08-28

### Fixed
- Removidos avisos de lint no Dashboard e na suíte Shadow sem alterar comportamento funcional.

### Changed
- Build de produção revalidado com sucesso.

## [3.1.5] - 2026-08-28

### Added
- Teste de restauração PostgreSQL em contêiner efêmero, sem gravar dump em disco.

### Security
- Exercício isolado não escreve no banco de origem e remove automaticamente o contêiner temporário.
