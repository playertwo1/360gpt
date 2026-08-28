# Gate de promoção para SHADOW

**Versão:** 1.0.0  
**Estado:** READY_FOR_OWNER_APPROVAL  
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
- [ ] Escopo de tráfego saneado e autorizado definido por Rafael.
- [ ] Janela de observação, SLOs e limiares de pausa definidos.
- [ ] Backup/restauração do ambiente de execução confirmados.

## Critérios de saída

O gate só pode ser promovido quando as três pendências acima tiverem evidência registrada e Rafael aprovar explicitamente a versão, o escopo e a janela. A promoção é registrada como:

```text
OFFLINE_EVAL → SHADOW
```

Em `SHADOW`, qualquer falha seleciona a baseline; nenhuma saída candidata pode persistir estado, responder usuário ou executar ação externa.
