# Arquitetura n8n em Docker — Projeto 360

## Papel do n8n

O n8n é o barramento de eventos e executor de workflows. Ele recebe entradas, cria correlação, chama o Diretor, executa os subworkflows dos domínios, persiste estados, controla retries e responde ao canal. Decisões, fórmulas e regras permanecem em motores e contratos versionados.

## Stack local canônica

1. `n8n-main`: editor local, webhooks internos e orquestração.
2. `postgres-n8n`: banco interno do n8n.
3. `postgres-360`: fonte oficial de dados de negócio, conversas, handoffs, casos e auditoria; usa o mesmo servidor PostgreSQL com banco e usuário separados.
4. `docling`: extração documental subordinada, em CPU e sob demanda.
5. `telegram-poller`: adaptador de transporte por long polling, sem regra de negócio e sem porta pública.
6. `object-storage`: documentos, áudios, imagens e exportações; pode começar por storage local referenciado e evoluir para MinIO.
7. `backup`: cópias programadas dos bancos, volume n8n, objetos e chave de criptografia.

O MVP não exige reverse proxy nem HTTPS: o Telegram é consumido por long polling e todos os webhooks do n8n permanecem internos. O editor continua acessível apenas em `127.0.0.1:5678`. A decisão completa está em `ADR-002-N8N-NUCLEO-LOCAL.md`.

Para o volume doméstico inicial, começar sem Redis reduz complexidade. Quando houver concorrência ou processamento pesado, ativar queue mode com Redis e workers. Em queue mode, os workers devem receber as mesmas credenciais e chave de criptografia; task runners acompanham os workers quando usados.

## Separação de dados

- O banco interno do n8n não é a fonte oficial do 360.
- Estado de negócio fica em tabelas próprias: `events`, `documents`, `subjects`, `director_runs`, `agent_runs`, `handoffs`, `final_cases`, `decisions`, `tasks` e `audit_log`.
- Binários ficam fora do banco e fora do JSON dos workflows; o evento transporta apenas referência, hash, tipo e tamanho.
- Prompts, contratos e versões de agentes ficam versionados; cada execução grava quais versões usou.

## Segurança mínima

- Definir e guardar fora do repositório uma `N8N_ENCRYPTION_KEY` estável; incluí-la no plano de recuperação.
- Usar o cofre de credenciais do n8n e arquivos de segredo/secret store do ambiente, nunca valores dentro dos nós.
- Colocar o editor do n8n somente na rede local ou VPN. Não expor o editor ou webhooks internos à internet.
- Usar segredo distinto entre adaptadores e n8n. TLS/reverse proxy só será necessário se uma futura entrada pública direta for explicitamente aprovada.
- Restringir nós perigosos e community nodes; instalar somente após revisão.
- Minimizar dados antes de chamar IA externa e bloquear logs de prompt, conversa, documento, token e PII.
- Usar usuários diferentes de banco com permissões mínimas.
- Executar auditoria de segurança e aplicar atualizações controladas, com backup anterior.

## Confiabilidade

- Toda entrada recebe `event_id`, `correlation_id` e `idempotency_key`.
- Inserção do evento e verificação de duplicidade ocorrem antes de chamar IA.
- Cada subworkflow persiste o handoff antes de retornar.
- Retry somente para falha transitória, com quantidade limitada e espera progressiva.
- Falha definitiva vai para `WF-90-EXCECOES`, preservando entrada, etapa, erro sanitizado e ação necessária.
- A resposta ao canal só é enviada depois de o caso final estar salvo.
- Operações externas permanecem com aprovação humana por padrão.

## Backup e recuperação

Salvar PostgreSQL, volume persistente do n8n, armazenamento de objetos, arquivos de configuração e a chave de criptografia. Testar restauração periodicamente. Definir retenção e limpeza de execuções para impedir crescimento indefinido do banco.

## Evolução

Fase 1: instância única, PostgreSQL e armazenamento de objetos.  
Fase 2: Redis, queue mode e workers separados para documentos e IA.  
Fase 3: métricas, alertas, worker dedicado por tipo de carga e recuperação automática controlada.

