# Status do Projeto Diretor 360

**Data do status:** 26 de agosto de 2026

**Modo de execução:** `OFFLINE_EVAL` — somente dados sintéticos

## Último marco concluído

**Marco 10B — Ponte autenticada entre hospedagem, n8n e Dashboard.**

- Aplicação publicada em HTTPS com uma rota externa alcançável pelo Telegram.
- Dashboard 360 e API do Estado 360 protegidos no servidor por login do ChatGPT e lista fechada de e-mails autorizados.
- Acesso autorizado para `fael@live.de` e `rafa.pedrosa1@gmail.com`.
- Versão hospedada implantada com D1 para dados estruturados e R2 para arquivos.
- Migração aplicada com a tabela `telegram_updates` disponível no banco hospedado.
- Fila com lease de dez minutos, três tentativas e conclusão idempotente implementada.
- Estado 360 hospedado em snapshots imutáveis, com hash canônico estável entre n8n, PostgreSQL e D1.
- Dashboard alterado para ler o read model hospedado, sem tentar acessar o computador local pela nuvem.
- Entrada e confirmações do Telegram permanecem desativadas por padrão; nenhuma credencial real foi configurada.
- O Marco 10C só será concluído depois da conexão e homologação de um bot exclusivo de teste.

## Workflows criados

| Workflow | Finalidade | Estado |
|---|---|---|
| WF-00 | Triagem offline da entrada do Diretor | Concluído |
| WF-01 | Entrada local de texto e arquivos | Concluído |
| WF-02 | Registro persistente e idempotência do evento | Concluído |
| WF-03 | Registro idempotente da decisão de roteamento | Concluído |
| WF-04 | Orquestração dos Gerentes Gerais necessários | Concluído |
| WF-05 | Gerente Geral determinístico em modo simulado | Concluído |
| WF-06 | Motor de Consolidação e publicação do Estado 360 | Concluído |
| WF-07 | Assessor Executivo ancorado no Estado 360 persistido | Concluído |
| WF-08 | Consulta somente leitura do último Estado 360 | Concluído |
| WF-09 | Ponte autenticada: reservar, processar no n8n e publicar Estado 360 hospedado | Criado, testado e despublicado por segurança |

## Testes executados

- Entrada sintética de texto, PDF, JSON e arquivo com cálculo de SHA-256.
- Idempotência sequencial e concorrente: primeira execução `SUCCEEDED` e repetições `DUPLICATE_IGNORED` sem novo evento lógico.
- Roteamento determinístico: visão completa para quatro domínios, performance para um domínio e entrada ambígua para revisão manual.
- Consolidação: cenários `READY` e `MANUAL_REVIEW_REQUIRED` preservados sem resolução automática de conflitos.
- Assessor: respostas geradas exclusivamente do snapshot persistido.
- Dashboard: consulta somente leitura do Estado 360.
- Adaptador Telegram simulado: mensagem e documento processados uma vez; repetição ignorada.
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
- Versão hospedada atual implantada em `https://visao-360-diretor.fael360092.chatgpt.site` com Telegram e ponte desligados.

## Erros conhecidos

- Não há erro bloqueante conhecido no Marco 10B.
- O bot real ainda não está conectado; token, segredo do webhook e allowlist de chat não foram configurados.
- O WF-09 e `BRIDGE_ENABLED` permanecem desligados até o piloto controlado; portanto não há sincronização contínua neste momento.
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

## Próximo passo exato

Criar um bot exclusivo de teste no BotFather e enviar `/start` para ele. Depois, configurar `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET` e o identificador do chat privado autorizado como segredos da hospedagem, sem colocá-los no Git ou nesta conversa. Ativar `BRIDGE_ENABLED`, publicar o WF-09 e habilitar `TELEGRAM_INGEST_ENABLED` somente durante uma mensagem sintética controlada; ao terminar, desligar os dois interruptores e despublicar o WF-09.
