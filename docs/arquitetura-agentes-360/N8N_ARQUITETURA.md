# Arquitetura n8n em Docker — Projeto 360

## Papel do n8n

O n8n é o barramento de eventos e executor de workflows. Ele recebe entradas, cria correlação, chama o Diretor, executa os subworkflows dos domínios, persiste estados, controla retries e responde ao canal. Decisões, fórmulas e regras permanecem em motores e contratos versionados.

## Stack inicial recomendada para casa

1. `reverse-proxy`: TLS e entrada HTTPS quando algum webhook precisar ser externo.
2. `n8n-main`: editor, webhooks e orquestração.
3. `postgres-n8n`: banco interno do n8n.
4. `postgres-360`: dados de negócio, handoffs, casos e auditoria; pode usar o mesmo servidor PostgreSQL com banco e usuário separados.
5. `object-storage`: documentos, áudios, imagens e exportações; preferencialmente MinIO ou armazenamento compatível com objetos.
6. `backup`: cópias programadas dos bancos, volume n8n, objetos e chave de criptografia.

Para o volume doméstico inicial, começar sem Redis reduz complexidade. Quando houver concorrência ou processamento pesado, ativar queue mode com Redis e workers. Em queue mode, os workers devem receber as mesmas credenciais e chave de criptografia; task runners acompanham os workers quando usados.

## Separação de dados

- O banco interno do n8n não é a fonte oficial do 360.
- Estado de negócio fica em tabelas próprias: `events`, `documents`, `subjects`, `director_runs`, `agent_runs`, `handoffs`, `final_cases`, `decisions`, `tasks` e `audit_log`.
- Binários ficam fora do banco e fora do JSON dos workflows; o evento transporta apenas referência, hash, tipo e tamanho.
- Prompts, contratos e versões de agentes ficam versionados; cada execução grava quais versões usou.

## Segurança mínima

- Definir e guardar fora do repositório uma `N8N_ENCRYPTION_KEY` estável; incluí-la no plano de recuperação.
- Usar o cofre de credenciais do n8n e arquivos de segredo/secret store do ambiente, nunca valores dentro dos nós.
- Colocar o editor do n8n somente na rede local ou VPN. Expor apenas webhooks necessários.
- Usar TLS por reverse proxy, autenticação forte e segredos distintos por webhook.
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

