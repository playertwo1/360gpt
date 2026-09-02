# ADR-002 — n8n e PostgreSQL como núcleo local do Diretor 360

**Status:** ACEITO POR RAFAEL — implementação incremental

**Data:** 2026-09-02

**Substitui:** uso do Sites/D1 como motor operacional ou fonte oficial

## Decisão

O n8n é a autoridade operacional exclusiva do projeto. Não existe segundo orquestrador, atalho de produção ou lógica equivalente mantida em outro componente.

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

## Regra de mudança

Toda mudança de comportamento começa e termina em artefatos governados pelo n8n:

```text
workflow/subworkflow n8n
→ contrato e política versionados
→ teste do workflow
→ persistência PostgreSQL
→ resposta pelo adaptador
```

É proibido implementar fora do n8n: parser de comandos operacional, slot-filling, roteamento de agentes, prompts ativos, seleção de modelos, cálculo de negócio, decisão de pendência, aprovação, reprocessamento, aprendizado, transição de job ou montagem do parecer final.

São permitidos fora do n8n somente componentes sem autonomia:

- gateway: autenticar, limitar, deduplicar tecnicamente, guardar envelope e devolver HTTP;
- Docling/document-worker: extrair arquivo conforme contrato, sem interpretação;
- PostgreSQL: constraints, transações, consultas e persistência, sem escolher recomendação;
- interface: apresentar dados produzidos pelo Estado 360 e coletar ação do usuário;
- scripts: instalar, testar, fazer backup e operar infraestrutura, nunca processar caso real por fora.

Arquivos legados que hoje violam essa fronteira constam em `policies/n8n-canonical-architecture.yaml`. Eles não são canônicos, ficam congelados e devem ser reduzidos ou removidos no Marco A0.

## Telegram por webhook

O Telegram continuará usando webhook. Como o Telegram exige um destino HTTPS público, a entrada estável será o Sites já hospedado, reduzido a gateway de transporte:

1. valida o segredo, tipo, tamanho, identidade e allowlist;
2. registra `update_id` e devolve HTTP rapidamente;
3. mantém o envelope em fila durável enquanto o computador estiver desligado;
4. WF-97 no Docker reivindica o evento por HTTPS de saída, com lease e idempotência;
5. n8n processa e registra o estado oficial no PostgreSQL local;
6. a resposta volta pelo gateway, sem expor token aos workflows.

O computador não recebe conexões públicas e o editor n8n continua em `127.0.0.1`. Um Quick Tunnel gratuito foi avaliado em 02/09/2026, mas o Telegram recusou o subdomínio recém-gerado por falha de resolução DNS. Por estabilidade, ele não é o caminho canônico. O `telegram-poller` permanece desligado apenas como contingência futura.

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
| Gateway Telegram | validar, enfileirar e transportar mensagens | interpretar conteúdo ou manter Estado 360 oficial |
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
9. ativar o consumo local WF-97/WF-101 e a entrega WF-102;
10. reduzir Sites/D1 a transporte e revogar a lógica duplicada.

Rollback: pausar o claim local preservando a fila hospedada e os registros locais. O webhook permanece estável durante a migração.

## Consequências

- Benefícios: uma fonte de verdade, menos looping por estados divergentes, computador sem porta pública, token isolado e fluxos visíveis no n8n.
- Limites: Telegram e o site dependem de a máquina estar ligada para processamento; o site remoto ainda precisa de uma caixa postal hospedada mínima; a migração precisa de shadow antes do corte.
