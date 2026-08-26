# Status do Projeto Diretor 360

**Data do status:** 26 de agosto de 2026

**Modo de execução:** `OFFLINE_EVAL` — somente dados sintéticos

## Último marco concluído

**Marco 11 — Evolução dos Gerentes Gerais e Especialistas analíticos de domínio concluída.**

- Regras de negócio especializadas e determinísticas implementadas nos quatro domínios de negócio: **Conta**, **Performance**, **Financeiro** e **Relacionamento**.
- **Domínio Conta (`GERENTE_GERAL_CONTA`)**: Identidade sintética validada (`cust-demo-001`), conformidade regulatória preliminar aprovada e aplicação do Gate de Elegibilidade com `IDENTIDADE_CONFIRMADA_SINTETICA` (state `PASS`).
- **Domínio Performance (`GERENTE_GERAL_PERFORMANCE`)**: Produção realizada de R$ 28.000,00 vs. Meta de R$ 35.000,00 (80,0% atingido), cálculo determinístico de gap de R$ 7.000,00 (20,0%) e ação prioritária P1 para aceleração comercial na esteira.
- **Domínio Financeiro (`GERENTE_GERAL_FINANCEIRO`)**: Faturamento médio mensal apurado de R$ 1.250.000,00 superando referência (R$ 1.200.000,00), margem bancária estimada e viabilidade econômica para pacote de serviços e otimização de tarifas.
- **Domínio Relacionamento (`GERENTE_GERAL_RELACIONAMENTO`)**: 4 reuniões executivas registradas, compromisso de retorno alinhado para 05/09/2026 e proposta consultiva customizada estruturada com aprovação humana obrigatória (`PENDING_HUMAN`).
- Workflows do n8n atualizados e publicados: `WF-05` (versão 2.0.0 analítica), `WF-04`, `WF-06` e `WF-07`.
- Políticas de governança atualizadas: `policies/reason-codes.yaml` (reason codes de domínio registrados) e `policies/capability-registry.yaml` (versões 2.0.0 ativas).
- Estado 360 consolidado com 8 achados materiais (`findings`), 1 gate de elegibilidade (`gates`) e 4 ações recomendadas (`recommended_actions`), com linhagem e proveniência íntegras.

## Workflows criados

| Workflow | Finalidade | Estado |
|---|---|---|
| WF-00 | Triagem offline da entrada do Diretor | Concluído |
| WF-01 | Entrada local de texto e arquivos | Concluído |
| WF-02 | Registro persistente e idempotência do evento | Concluído |
| WF-03 | Registro idempotente da decisão de roteamento | Concluído |
| WF-04 | Orquestração dos Gerentes Gerais analíticos | Concluído |
| WF-05 | Gerente Geral determinístico analítico (v2.0.0) | Concluído |
| WF-06 | Motor de Consolidação e publicação do Estado 360 | Concluído |
| WF-07 | Assessor Executivo ancorado no Estado 360 persistido | Concluído |
| WF-08 | Consulta somente leitura do último Estado 360 | Concluído |
| WF-09 | Ponte autenticada: reservar, processar no n8n e publicar Estado 360 hospedado | Criado e homologado; mantido despublicado fora das janelas controladas |

## Testes executados

- Entrada sintética de texto, PDF, JSON e planilha XLSX com cálculo e validação de SHA-256.
- Idempotência sequencial e concorrente: primeira execução `SUCCEEDED` e repetições `DUPLICATE_IGNORED` sem novo evento lógico.
- Roteamento determinístico: visão completa para quatro domínios, performance para um domínio e entrada ambígua para revisão manual.
- Consolidação analítica do Marco 11: 8 achados materiais, 1 gate de elegibilidade e 4 ações recomendadas persistidos no snapshot.
- Assessor Executivo: síntese gerada exclusivamente do snapshot persistido com resumo dos achados analíticos dos 4 domínios.
- Dashboard: consulta somente leitura do Estado 360.
- Adaptador Telegram simulado: mensagem, documento PDF e planilha XLSX processados com sucesso; repetições ignoradas.
- Build de produção: `npm run build` aprovado.
- Verificação de código: `npm run lint` aprovado.
- Kill switch local: endpoint do Telegram respondeu `503 ingest_disabled`.
- Controle local de acesso: usuário autorizado recebeu o Dashboard; usuário ausente ou não autorizado foi bloqueado.
- Produção sem autenticação: Dashboard redirecionou para o login do ChatGPT com `307` e a API do Estado respondeu `401 authentication_required`.
- Webhook de produção: requisição externa chegou ao endpoint e recebeu `503 ingest_disabled`, confirmando que a rota está disponível e o processamento permanece desligado.
- Segurança do webhook local: segredo inválido `401`, chat inválido `403`, repetição ignorada e limite excedido `429`.
- Ponte local: autenticação `401`, reserva exclusiva concorrente, fila vazia, conclusão idempotente e corpo acima do limite `413` aprovados.
- Fluxo integrado sintético: hospedagem local → WF-09 → WF-01 a WF-07 → snapshot hospedado, concluído com `bridge_status=SUCCEEDED`.
- Hash canônico validado após serialização pelo PostgreSQL.
- Versão hospedada atual implantada em `https://visao-360-diretor.fael360092.chatgpt.site`.
- Bot real: token anterior revogado; nova credencial validada sem armazenamento no Git ou na documentação.
- Webhook real: chat privado autorizado, segredo obrigatório e nenhum erro registrado na hospedagem.
- Texto real com dados sintéticos: evento concluído com `SUCCEEDED` e novo snapshot publicado.
- PDF real com dados sintéticos: evento concluído com `SUCCEEDED`; MIME `application/pdf`, 3.288 bytes, confiança `UNTRUSTED` e SHA-256 idêntico ao arquivo enviado.
- Planilha XLSX real com dados sintéticos: evento concluído com `SUCCEEDED`; MIME `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, 3.177 bytes, confiança `UNTRUSTED` e SHA-256 verificado.
- Defesa contra prompt injection validada com vetores de injeção em PDF e XLSX tratados exclusivamente como dados não confiáveis sem afetar políticas ou permissões.

## Erros conhecidos

- Não há erro bloqueante conhecido no Marco 11.
- O WF-09, o webhook e os interruptores são usados somente em janelas controladas de homologação; não existe autorização para operação contínua nesta fase.
- Integrações com fontes bancárias e uso de dados reais permanecem desabilitados por decisão de segurança e homologação.
- O n8n pode registrar aviso sobre o task runner Python ausente; os workflows atuais usam JavaScript e não são afetados.

## Decisões tomadas

- Tornar pública somente a fronteira de rede da aplicação para que o Telegram alcance o webhook.
- Proteger Dashboard e API do Estado 360 no servidor com identidade do ChatGPT e `DASHBOARD_ALLOWED_EMAILS`, em modo fechado quando a configuração estiver ausente.
- Autorizar no Dashboard somente `fael@live.de` e `rafa.pedrosa1@gmail.com` nesta fase.
- Usar exclusivamente dados sintéticos em `OFFLINE_EVAL` até aprovação formal do piloto.
- Preferir regras e workflows determinísticos; nenhuma decisão bancária é delegada a modelo.
- Manter Dashboard e Assessor somente leitura sobre snapshots persistidos.
- Guardar metadados estruturados no D1 e arquivos no R2, classificados inicialmente como `UNTRUSTED`.
- Tratar `update_id` do Telegram de forma idempotente antes de qualquer processamento.
- Fazer o n8n buscar trabalhos na hospedagem; a hospedagem nunca inicia conexão com o computador local.
- Usar segredo exclusivo para a ponte, lease de dez minutos, no máximo três tentativas e hash JSON canônico.
- Aplicar limite inicial de dez mensagens por minuto por chat, configurável entre 1 e 60.
- Manter `TELEGRAM_INGEST_ENABLED=false` e confirmações externas desativadas por padrão.
- Manter `BRIDGE_ENABLED=false` e WF-09 despublicado fora da janela de teste.
- Nunca armazenar tokens ou segredos no Git, em documentos ou em arquivos versionados.
- Revogar a credencial antiga do bot depois de sua exposição no histórico e usar somente a nova credencial secreta.
- Autorizar exclusivamente o chat privado confirmado pelo `/start` do próprio usuário.
- Manter a confirmação automática do bot desligada durante a homologação.

## Próximo passo exato

Marco 12 — Implementação da Central de Revisão Manual 360 com fila determinística de reason codes, atribuição de SLA e workflow estruturado de confirmação / saneamento humano para itens com status MANUAL_REVIEW_REQUIRED.
