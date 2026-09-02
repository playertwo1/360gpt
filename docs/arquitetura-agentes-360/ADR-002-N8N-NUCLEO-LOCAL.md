# ADR-002 — n8n e PostgreSQL como núcleo local do Diretor 360

**Status:** ACEITO POR RAFAEL — implementação incremental

**Data:** 2026-09-02

**Substitui:** uso do Sites/D1 como motor operacional ou fonte oficial

## Decisão

O Diretor 360 terá um único núcleo operacional local:

```text
Telegram ─┐
          ├─ adaptadores de canal ─→ n8n ─→ Docling ─→ Diretor
Sites ────┘                              │             ├─ GG Conta → especialistas
                                        │             ├─ GG Performance → especialistas
                                        │             ├─ GG Financeiro → especialistas
                                        │             └─ GG Relacionamento → especialistas
                                        └──────────→ PostgreSQL / Estado 360
                                                       │
                                                       └─→ Diretor → adaptador → Telegram/Sites
```

- Telegram e Sites recebem e exibem mensagens; não calculam, não decidem e não mantêm a verdade de negócio.
- n8n controla fila, estado, lease, retries, roteamento, subworkflows, perguntas e entrega.
- Docling apenas extrai texto, estrutura, tabelas e proveniência; não interpreta regra de negócio.
- Diretor, Gerentes Gerais e especialistas operam como subworkflows versionados do n8n.
- PostgreSQL `visao360` é a fonte oficial de documentos, conversas, jobs, perguntas, diretrizes, handoffs e Estado 360.
- O banco interno `n8n` continua restrito à configuração e às execuções da ferramenta.

## Telegram sem HTTPS

O canal Telegram usará `getUpdates` por long polling. Um adaptador mínimo local:

1. busca updates;
2. respeita allowlist;
3. entrega o update ao webhook interno do n8n;
4. avança o offset somente depois da persistência confirmada;
5. oferece `sendMessage` e `sendChatAction` na rede Docker, mantendo o token fora dos workflows.

Esse caminho não exige domínio, certificado, túnel ou exposição do editor n8n. O adaptador não possui regra de negócio. O serviço nasce desativado e só será promovido após desligar o webhook remoto do bot, porque Telegram não permite webhook e `getUpdates` simultaneamente.

## Sites acessível fora de casa

Um site hospedado não consegue chamar `localhost`. Para continuar acessível em qualquer lugar sem abrir a máquina para a internet, o Sites pode manter uma caixa postal mínima de transporte:

- entrada: recebe mensagem/arquivo e guarda envelope cifrado ou referência temporária;
- coleta: n8n local busca os envelopes quando a máquina estiver disponível;
- saída: n8n deposita a resposta e o site a exibe;
- nenhum comando, regra, cálculo, esclarecimento, conhecimento ou Estado 360 é oficial no Sites/D1.

Se Rafael optar por site exclusivamente local, essa caixa postal poderá ser retirada. O acesso remoto ao painel local poderá ser tratado depois por VPN, sem publicar o editor n8n.

## Fronteiras obrigatórias

| Componente | Pode | Não pode |
|---|---|---|
| Telegram/Sites | transportar entrada e saída | decidir, calcular, completar lacunas |
| Adaptador Telegram | polling, allowlist, enviar mensagem/action | interpretar conteúdo |
| n8n | orquestrar e registrar transições | inventar regra de negócio |
| Docling | extrair com proveniência | corrigir célula ambígua |
| Agentes | interpretar dentro do escopo | executar efeito externo não autorizado |
| PostgreSQL | guardar verdade operacional e histórico | substituir fonte original |

## Migração sem big bang

1. congelar novas regras no Sites;
2. criar esquema local canônico;
3. instalar adaptador Telegram desativado;
4. criar intake e entrega n8n locais;
5. migrar comandos, protocolos, confirmações e conversas;
6. migrar documentos, perguntas e diretrizes;
7. comparar resultados antigo × novo em shadow;
8. fazer backup;
9. desligar webhook Telegram e ativar polling local;
10. reduzir Sites/D1 a transporte e revogar a lógica duplicada.

Rollback: reativar o webhook remoto somente após pausar o polling, mantendo registros locais e trilha de auditoria. Nunca operar ambos simultaneamente.

## Consequências

- Benefícios: uma fonte de verdade, menos looping por estados divergentes, operação local sem HTTPS, token isolado e fluxos visíveis no n8n.
- Limites: Telegram e o site dependem de a máquina estar ligada para processamento; o site remoto ainda precisa de uma caixa postal hospedada mínima; a migração precisa de shadow antes do corte.
