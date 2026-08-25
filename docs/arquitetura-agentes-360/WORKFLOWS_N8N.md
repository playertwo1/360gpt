# Catálogo de workflows n8n — Projeto 360

## Workflows principais

| Código | Workflow | Responsabilidade |
|---|---|---|
| `WF-00` | Entrada 360 | Webhooks, agenda e importações; autentica e cria o envelope |
| `WF-01` | Normalização e idempotência | Hash, duplicidade, referência de arquivo e persistência inicial |
| `WF-02` | Diretor — triagem | Intenção, identidade e seleção de domínios |
| `WF-03` | Qualidade e privacidade | Porta de dados, minimização e bloqueios |
| `WF-10` | Gerente da Conta | Orquestra os especialistas da carteira |
| `WF-20` | Gerente de Performance | Orquestra os especialistas POBJ |
| `WF-30` | Analista Financeiro | Orquestra GDAD, resultado e retorno |
| `WF-40` | Analista de Conversas | Orquestra entendimento, resposta e pitch |
| `WF-50` | Diretor — consolidação | Conflitos, deduplicação, prioridade e caso final |
| `WF-60` | Aprovação humana | Solicita decisão de Rafael para ações externas ou materiais |
| `WF-70` | Entrega | Responde ao Telegram, app ou painel e registra o envio |
| `WF-80` | Resultado e aprendizado | Registra desfecho e aciona aprendizados permitidos |
| `WF-90` | Exceções | Dead-letter, retry manual e alertas técnicos sanitizados |

## Padrão de subworkflow

Cada especialista é um subworkflow chamado por `Execute Sub-workflow` ou webhook interno autenticado. Entrada e saída obedecem aos contratos compartilhados. O subworkflow não conhece o canal final, não envia mensagem ao cliente e não chama outro domínio diretamente; devolve dependências ao responsável que o acionou.

## Paralelismo permitido

- Após qualidade aprovada, Conta, Performance e Financeiro podem analisar em paralelo quando independentes.
- Conversas pode analisar contexto e sentimento em paralelo, mas pitch e resposta comercial esperam os pareceres necessários.
- Crédito espera qualidade e risco.
- Comercial espera risco; pitch espera Comercial quando envolver produto.
- Consolidação espera todos os handoffs solicitados ou o timeout controlado com estado `PARTIAL`.

## Aprovação humana

Enviar mensagem, criar compromisso externo, registrar decisão material ou disparar automação que afete cliente passa por `WF-60`, salvo ação previamente autorizada e reversível. A aprovação grava responsável, horário, versão da recomendação e alterações feitas.

