# Visão 360

Assistente executivo para gestão de carteira empresarial. O Telegram recebe mensagens e documentos; um agente Diretor entende a solicitação, encaminha a especialistas e consolida riscos, oportunidades, tarefas e evidências em um cockpit privado.

## Fluxo do produto

1. **Entrada segura:** texto, PDF ou Excel chega ao webhook do Telegram, restrito por segredo e lista de chats permitidos.
2. **Diretor:** classifica o material, identifica empresas envolvidas, remove duplicidades e decide quais especialistas consultar.
3. **Gerentes especialistas:** Crédito e Risco; Negócios e Receita; Relacionamento e Agenda; Documentos e Cadastro; Estratégia e Mercado.
4. **Analistas auxiliares:** extraem tabelas, datas, fatos, variações e evidências. Nenhum agente executa decisão bancária de forma autônoma.
5. **Síntese 360:** o Diretor confronta análises, registra divergências e gera prioridades explicáveis.
6. **Cockpit:** o gerente humano aprova, rejeita ou ajusta cada recomendação. Toda ação entra no histórico de auditoria.

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
