# Plano de execução até o piloto no Telegram

**Ponto de partida:** 26 de agosto de 2026  
**Escopo:** chegar a um piloto privado do Telegram usando somente dados sintéticos.  
**Forma de execução:** um marco por sessão, sempre com teste e evidência antes de avançar.

## Estado atual

| Componente | Estado |
|---|---|
| Docker Desktop, n8n e PostgreSQL | Concluído e saudável |
| WF-00 — triagem offline | Concluído |
| WF-01 — entrada local de texto e arquivo | Concluído |
| WF-02 — persistência e idempotência | Concluído |
| Testes de texto, PDF, JSON e concorrência | Aprovados |

### Progresso em 26 de agosto de 2026

- Marcos 1 a 8: concluídos e homologados localmente.
- Marco 9: concluído com aplicação HTTPS publicada, migração D1 aplicada e controles administrativos protegidos.
- Marco 10A: concluído com entrada HTTPS pública, Dashboard e Estado 360 protegidos por login do ChatGPT e lista de e-mails, e webhook validado com o kill switch desligado.
- Marco 10B: concluído com ponte autenticada, WF-09, leases, retries, hash canônico e publicação do Estado 360 hospedado validados de ponta a ponta com dados sintéticos.
- Marco 10C: depende do bot exclusivo de teste, chat autorizado, segredos configurados fora do Git e autorização explícita para ligar o kill switch durante o piloto real.

## Programação

| Marco | Entrega principal | Critério para avançar | Estimativa |
|---:|---|---|---:|
| 1 | **WF-03 — Registro do roteamento:** persistir domínios escolhidos, capacidades, exclusões, regra aplicada e dependências | Uma entrada cria somente uma decisão de roteamento rastreável; duplicatas não criam novas decisões | 1 sessão |
| 2 | **Contratos mínimos dos domínios:** schemas e catálogo `ACTIVE` para Conta, Performance, Financeiro e Relacionamento | Toda fronteira valida JSON; capacidade inexistente gera `MANUAL_REVIEW_REQUIRED` | 1 sessão |
| 3 | **Gerentes Gerais em modo simulado:** workflows filhos com dados sintéticos e sem ferramentas externas | Diretor chama somente Gerentes necessários; limite de quatro domínios e três especialistas por domínio respeitado | 2 sessões |
| 4 | **Motor de Consolidação 360:** deduplicação, conflitos, gates e prioridades determinísticos | Handoffs válidos geram um Estado 360; conflito permanece explícito e não é resolvido por IA | 2 sessões |
| 5 | **Estado 360 e Assessor:** snapshot imutável, resumo executivo e resposta ancorada em evidências | Resumo e detalhes usam o mesmo snapshot; informação ausente produz `REFRESH_REQUIRED` | 1–2 sessões |
| 6 | **Dashboard local somente leitura:** visão do cliente, oportunidades, pendências, compromissos e evidências | Nenhuma tela altera o Estado 360; cada item permite chegar à origem | 2 sessões |
| 7 | **Adaptador Telegram simulado:** fixtures no formato de `update`, texto e anexos, sem conexão externa | Updates sintéticos percorrem todo o fluxo; `update_id` funciona como parte da idempotência | 1 sessão |
| 8 | **Barreira de segurança do Telegram:** segredo do webhook, allowlist de chats, classificação, tamanho/tipo de arquivo, rate limit, kill switch e mensagens sem dado sensível | Chat não autorizado, segredo inválido e arquivo proibido são rejeitados e auditados | 1–2 sessões |
| 9 | **Infraestrutura HTTPS de piloto:** escolher hospedagem/túnel, configurar domínio, certificados, backups e retenção | Endpoint HTTPS estável, segredos fora do código, restauração testada e acesso administrativo protegido | 1–2 sessões |
| 10 | **Conexão do bot de teste:** cadastrar webhook e executar homologação ponta a ponta | Texto, PDF e planilha sintéticos entram uma vez, chegam ao Dashboard e retornam somente confirmação segura no Telegram | 1 sessão |

**Estimativa total:** 13 a 16 sessões de trabalho. A conexão real do bot ocorre somente no marco 10.

## Portão de prontidão para conectar o Telegram

O bot só poderá ser conectado quando todos estes controles estiverem aprovados:

- bot exclusivo de teste e token armazenado como segredo;
- URL HTTPS definida e protegida por segredo do webhook;
- lista fechada de usuários ou chats autorizados;
- `update_id` tratado de forma idempotente;
- arquivos validados antes de qualquer extração;
- conteúdo externo sempre marcado como `UNTRUSTED`;
- trilha de auditoria e correlação ponta a ponta;
- kill switch testado;
- resposta do piloto sem dados bancários ou informações sensíveis;
- backup e procedimento de recuperação documentados;
- somente dados sintéticos durante a homologação.

## Testes obrigatórios do piloto

1. Enviar a mesma mensagem três vezes e persistir apenas um evento lógico.
2. Enviar PDF e planilha sintéticos e conferir tamanho, tipo e SHA-256.
3. Rejeitar chat fora da allowlist sem revelar informações.
4. Rejeitar webhook com segredo incorreto.
5. Tratar instruções dentro de documentos como dados, nunca como comandos.
6. Simular indisponibilidade do banco e confirmar retry sem duplicidade.
7. Acionar o kill switch e confirmar que nenhuma nova entrada é processada.
8. Abrir o Dashboard e navegar do resumo até a evidência de origem.

## Fora do piloto

- dados reais de clientes;
- aprovação de crédito, alteração cadastral ou movimentação financeira;
- contato comercial automático;
- uso de modelos ou serviços externos sem aprovação específica;
- implantação para toda a carteira antes de homologação de segurança e conformidade.

## Próxima execução

Criar um bot exclusivo de teste no BotFather e enviar `/start` para ele. Depois, configurar `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET` e o chat privado autorizado como segredos da hospedagem, sem registrar esses valores no Git ou nesta conversa. Em seguida, ativar ponte e Telegram somente durante uma mensagem sintética controlada para concluir o Marco 10C.
