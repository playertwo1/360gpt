# Especialista — Compromissos e Follow-up

- **ID canônico:** `RELATIONSHIP_COMMITMENTS_FOLLOWUP`
- **Versão aprovada:** `1.0.0-approved-design`
- **Lifecycle:** `APPROVED`
- **Owner:** `GERENTE_GERAL_RELACIONAMENTO`
- **Status:** desenho aprovado por Rafael em 27/08/2026; runtime não ativo

## Missão

Manter promessas, dependências e próximos retornos visíveis e auditáveis, sem criar compromisso implícito e sem realizar contato automaticamente.

## Capacidades propostas

- `relationship.commitment.extract_candidate`
- `relationship.commitment.reconcile`
- `relationship.commitment.status`
- `relationship.followup.alert`
- `relationship.inactivity.review`

## Entrada mínima

- linha do tempo e fontes validadas;
- compromissos existentes e suas versões;
- data/hora de referência e fuso;
- último contato confirmado;
- exceções e conclusões confirmadas por Rafael.

## Responsáveis

- `RAFAEL_COMMITMENT`
- `CLIENT_COMMITMENT`
- `BANK_DEPENDENCY`
- `THIRD_PARTY_DEPENDENCY`
- `UNASSIGNED`

## Estados

- `OPEN`
- `DUE_SOON`
- `WAITING_EXTERNAL`
- `OVERDUE`
- `COMPLETED`
- `CANCELLED`
- `NOT_DETERMINABLE`

## Método

1. a IA propõe compromisso somente a partir de linguagem e evidência localizáveis;
2. responsável, beneficiário, entrega, prazo, dependência e condição são separados;
3. o motor determinístico calcula estado usando data, fuso e regras versionadas;
4. compromissos semelhantes são reconciliados sem perder as fontes;
5. alteração posterior supersede, conclui ou cancela o registro com evidência;
6. prazo explícito prevalece sobre a regra genérica de ausência de contato;
7. alertas sugerem revisão e próximo passo, nunca disparam comunicação externa.

`DUE_SOON` terá antecedência configurável. Dias úteis só serão usados quando houver calendário oficial identificado; caso contrário, o sistema exibe a lacuna.

## Regra de 60 dias

Empresa `LINKED` sem contato confirmado há 60 dias gera candidato a alerta, exceto quando houver contato futuro agendado, ordem expressa para aguardar, relacionamento encerrado, marcação de não contatar, vínculo ainda não resolvido ou data `NOT_DETERMINABLE`.

O alerta não pressupõe oferta nem interesse. Ele pede revisão do contexto.

## Saída estruturada

- registro do compromisso e suas fontes;
- responsável, beneficiário, prazo, fuso e dependências;
- estado calculado, regra e versão utilizadas;
- lacunas e conflitos;
- próximo follow-up sugerido e motivo;
- alertas de prazo, atraso ou inatividade;
- histórico de alteração e confirmação.

## Divisão IA × determinístico

A IA extrai candidatos e explica ambiguidades. Datas, vencimento, antecedência, contagem de 60 dias, exceções, transições permitidas e deduplicação exata são determinísticos. Conclusão e cancelamento materiais exigem evidência ou confirmação humana.

## Proibições

- inventar responsável ou prazo;
- considerar silêncio como cancelamento ou recusa;
- encerrar compromisso vencido sem confirmação;
- usar inatividade para gerar oferta automática;
- enviar lembrete, mensagem ou e-mail;
- alterar compromisso do cliente para obrigação de Rafael ou vice-versa.

## Critérios de aceite

- testes de fronteira cobrem prazo, fuso, mês, atraso e antecedência;
- prazo explícito sempre tem prioridade sobre 60 dias;
- todas as exceções válidas impedem alerta indevido;
- compromisso vencido continua aberto até conclusão ou cancelamento confirmado;
- ambiguidade de responsável ou prazo retorna `NOT_DETERMINABLE`;
- correção de data recalcula estado e alertas;
- nenhum alerta possui ferramenta de envio externo.

## Falha segura e rollback

Quando data, responsável ou vínculo forem incertos, não calcular cobrança definitiva: emitir `REVIEW_REQUIRED`. Rollback restaura a versão anterior do registro e recalcula estados, preservando a trilha completa.

## Decisão de Rafael

Especialista aprovado integralmente em 27/08/2026. A aprovação cobre responsáveis, estados, prazos, regra de 60 dias, exceções, controles determinísticos e rollback, mas não autoriza ativação no runtime.
