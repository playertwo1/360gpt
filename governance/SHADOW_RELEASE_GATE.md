# Gate de promoção para SHADOW

**Versão:** 1.0.0  
**Estado:** OBSERVING_SYNTHETIC_SHADOW  
**Escopo:** motores determinísticos POBJ, freshness, GDAD e compromissos  
**Efeitos permitidos:** nenhum; Estado 360, Dashboard, respostas e ações permanecem inalterados.

## Evidências obrigatórias

- [x] Etapas A e B homologadas.
- [x] Roteamento determinístico e envelope baseline/candidata implementados.
- [x] Suíte sintética de 20 casos concluída.
- [x] Telemetria de equivalência e divergência validada.
- [x] Sanitização de PII validada.
- [x] Fallback para baseline em falha da candidata validado.
- [x] 14/14 testes gerais aprovados.
- [x] Runtime dos novos especialistas permanece `INACTIVE`.
- [x] Escopo definido por Rafael: somente os 20 casos sintéticos canônicos, sem dados reais.
- [x] Janela inicial de observação: 24 horas; SLO de conclusão ≥99%; pausa se divergência >10% ou qualquer efeito proibido.
- [x] Backup verificável criado em `backup-shadow-gate-20260827-000001.zip`, íntegro nas duas cópias do Google Drive e contendo os artefatos do gate.

## Aprovação

Rafael autorizou o avanço marco a marco nesta conversa em 27/08/2026. A autorização aplica-se exclusivamente ao Shadow sintético descrito acima; não autoriza dados reais, respostas externas ou ativação `ACTIVE`.

## Janela em execução

- Início registrado: 27/08/2026 22:52:04 (America/Sao_Paulo).
- Primeira medição: 20/20 casos concluídos, equivalência de 100%, zero mutações e zero efeitos externos.
- Revisão da janela: após 24 horas, ou antes somente se houver alerta de divergência/segurança.

## Critérios de saída

O gate só pode ser promovido quando as três pendências acima tiverem evidência registrada e Rafael aprovar explicitamente a versão, o escopo e a janela. A promoção é registrada como:

```text
OFFLINE_EVAL → SHADOW
```

Em `SHADOW`, qualquer falha seleciona a baseline; nenhuma saída candidata pode persistir estado, responder usuário ou executar ação externa.
