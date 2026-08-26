# Status do Projeto Diretor 360

**Data do status:** 26 de agosto de 2026

**Modo de execução:** `OFFLINE_EVAL` — somente dados sintéticos

## Último marco concluído

**Marco 10C — Piloto privado no Telegram concluído e homologado (Texto, PDF e Planilha XLSX).**

- Aplicação publicada em HTTPS com uma rota externa alcançável pelo Telegram.
- Dashboard 360 e API do Estado 360 protegidos no servidor por login do ChatGPT e lista fechada de e-mails autorizados.
- Acesso autorizado para `fael@live.de` e `rafa.pedrosa1@gmail.com`.
- Versão hospedada implantada com D1 para dados estruturados e R2 para arquivos.
- Migração aplicada com a tabela `telegram_updates` disponível no banco hospedado.
- Fila com lease de dez minutos, três tentativas e conclusão idempotente implementada.
- Estado 360 hospedado em snapshots imutáveis, com hash canônico estável entre n8n, PostgreSQL e D1.
- Dashboard alterado para ler o read model hospedado, sem tentar acessar o computador local pela nuvem.
- Bot exclusivo de teste conectado ao webhook HTTPS com token renovado, segredo de webhook e allowlist de um único chat privado.
- Mensagem sintética, PDF sintético e Planilha XLSX sintética percorreram com sucesso o fluxo Telegram → hospedagem → WF-09 → WF-01 a WF-07 → Estado 360.
- Validação de integridade e segurança concluída: hashes SHA-256 exatos, arquivos classificados como `UNTRUSTED`, defesa contra prompt injection validada e status de execução `SUCCEEDED`.
- Reversão de segurança aplicada ao término da homologação: `TELEGRAM_INGEST_ENABLED=false`, `BRIDGE_ENABLED=false`, WF-09 despublicado e nenhuma credencial exposta no repositório.

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
| WF-09 | Ponte autenticada: reservar, processar no n8n e publicar Estado 360 hospedado | Criado e homologado; mantido despublicado fora das janelas controladas |

## Testes executados

- Entrada sintética de texto, PDF, JSON e planilha XLSX com cálculo e validação de SHA-256.
- Idempotência sequencial e concorrente: primeira execução `SUCCEEDED` e repetições `DUPLICATE_IGNORED` sem novo evento lógico.
- Roteamento determinístico: visão completa para quatro domínios, performance para um domínio e entrada ambígua para revisão manual.
- Consolidação: cenários `READY` e `MANUAL_REVIEW_REQUIRED` preservados sem resolução automática de conflitos.
- Assessor: respostas geradas exclusivamente do snapshot persistido.
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

- Não há erro bloqueante conhecido no Marco 10C.
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

Marco 11 — Evolução dos Gerentes Gerais e Especialistas analíticos de domínio com regras de negócio completas para Conta, Performance, Financeiro e Relacionamento. Implementar a catalogação e execução de especialistas de domínio sob a orquestração do WF-04/WF-05, mantendo rastreabilidade e segregação de funções.
