# Visão 360

Assistente executivo para gestão de carteira empresarial. O Telegram recebe mensagens e documentos; um agente Diretor entende a solicitação, encaminha a especialistas e consolida riscos, oportunidades, tarefas e evidências em um cockpit privado.

Todo o planejamento, checklist, histórico reconciliado e caminho até o Telegram está no [ROADMAP.md](ROADMAP.md), única fonte oficial de próximas tarefas.

## Fluxo do produto

1. **Entrada segura:** texto, PDF ou Excel chega ao webhook do Telegram, restrito por segredo e lista de chats permitidos.
2. **Diretor:** classifica o material, identifica empresas envolvidas, remove duplicidades e decide quais especialistas consultar.
3. **Gerentes especialistas:** Crédito e Risco; Negócios e Receita; Relacionamento e Agenda; Documentos e Cadastro; Estratégia e Mercado.
4. **Analistas auxiliares:** extraem tabelas, datas, fatos, variações e evidências. Nenhum agente executa decisão bancária de forma autônoma.
5. **Consolidação determinística:** o Motor aplica regras explícitas, confronta análises e registra divergências sem inventar fatos.
6. **Síntese e decisão:** o Assessor prepara a visão executiva; Rafael aprova, rejeita ou ajusta cada recomendação. Toda ação entra no histórico de auditoria.

## Segurança desde o início

- Acesso privado e autorização validada no servidor.
- Arquivos em armazenamento de objetos; metadados relacionais no banco.
- Segredos apenas no ambiente hospedado, nunca no código.
- Isolamento por proprietário/carteira e trilha de auditoria.
- Evidências e grau de confiança em cada insight.
- Retenção configurável e possibilidade de exclusão.
- Dados demonstrativos no protótipo; não enviar dados reais antes da homologação do banco.

## Modelo de dados

`companies` → `documents` → `agent_runs` → `insights` → `decisions`, com `audit_log` cobrindo ingestão, leitura e decisões. Os bytes de PDF/Excel ficam no bucket; o banco guarda somente metadados, resultados estruturados e referências.

## Para ativar o Telegram

Configure `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET` e `TELEGRAM_ALLOWED_CHAT_IDS`. Depois publique o site e registre a URL HTTPS `/api/ingest/telegram` no `setWebhook`, enviando o mesmo segredo como `secret_token`.

O endpoint aceita texto e documentos de até 20 MB, responde ao usuário e coloca uma execução do agente Diretor na fila. O processamento de IA será conectado após a definição do provedor aprovado, das políticas internas e dos perfis de especialistas.

## Ambiente local com n8n e Docker

O primeiro corte executável opera somente em `OFFLINE_EVAL`, com dados sintéticos e sem efeitos externos.

1. Abra o Docker Desktop.
2. No PowerShell, execute `./scripts/start-360.ps1`.
3. Acesse `http://localhost:5678` e crie a conta proprietária local.
4. Aplique as migrações: `./scripts/apply-database-migrations.ps1`.
5. Importe a credencial local: `./scripts/import-local-credentials.ps1`.
6. Execute `./scripts/import-workflows.ps1`.
7. Abra **WF-00 — Entrada e triagem do Diretor 360 (OFFLINE_EVAL)** e use **Execute workflow**.

O Compose inicia n8n 2.36.7 e PostgreSQL 17.6, presos a `localhost`. O banco interno do n8n e o banco `visao360` usam usuários distintos. Os contratos e agentes são montados como referência somente leitura; o workflow cria um envelope rastreável, aplica roteamento determinístico por capacidades e valida a fronteira antes de qualquer futura delegação.

Comandos úteis:

- Estado: `docker compose --env-file .env.n8n -f compose.n8n.yaml ps`
- Teste sintético: `./scripts/test-offline-workflow.ps1`
- Logs: `docker compose --env-file .env.n8n -f compose.n8n.yaml logs -f n8n`
- Parar: `docker compose --env-file .env.n8n -f compose.n8n.yaml down`
- Parar sem apagar dados: não use `down -v`; os volumes contêm configurações, credenciais e bancos.

## Teste local de texto e arquivos

O `WF-01 — Webhook de entrada local (OFFLINE_EVAL)` recebe texto ou multipart em `http://localhost:5678/webhook/visao-360/offline-test-input`. A porta continua presa a `localhost`, e toda chamada exige o cabeçalho `X-Visao360-Test-Mode: OFFLINE_EVAL`.

Para preparar e repetir o teste:

1. Gere o PDF fictício: `python ./scripts/generate-test-pdf.py`.
2. Importe os workflows: `./scripts/import-workflows.ps1`.
3. Publique o webhook: `./scripts/publish-test-webhook.ps1`.
4. Envie texto, PDF e JSON: `./scripts/send-test-inputs.ps1`.
5. Valide repetições do mesmo evento: `./scripts/test-idempotency.ps1`.
6. Valide updates sintéticos do Telegram: `./scripts/test-telegram-adapter.ps1`.

O Dashboard local somente leitura fica disponível com `npm run dev` em `http://localhost:3000`. Ele consulta o WF-08 e exibe exclusivamente o último Estado 360 persistido para o cliente sintético.

O procedimento controlado para o piloto externo está em [docs/TELEGRAM-PILOT-RUNBOOK.md](docs/TELEGRAM-PILOT-RUNBOOK.md). A ingestão hospedada permanece desabilitada até a aprovação explícita e o cadastro seguro do bot de teste.

O `WF-02 — Registro idempotente de entrada (OFFLINE_EVAL)` grava o evento, os metadados dos anexos e a auditoria no PostgreSQL em uma única transação. A primeira chamada retorna `PROCESSING`; repetições da mesma chave retornam `DUPLICATE_IGNORED` e apontam para o mesmo `event_id`. O cliente também confirma que cada upload contém exatamente um arquivo e que o SHA-256 calculado pelo n8n coincide com o arquivo local. O conteúdo dos anexos é marcado como `UNTRUSTED`, não altera políticas e não autoriza efeitos externos.
