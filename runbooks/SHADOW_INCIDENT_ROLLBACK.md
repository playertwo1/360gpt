# Runbook — Incidente e rollback do Shadow

**Escopo:** Shadow sintético do Diretor 360  
**Autoridade:** Rafael  
**Princípio:** a candidata nunca altera Estado 360, Dashboard, resposta ou ação.

## Acionadores de pausa

- conclusão abaixo de 99%;
- divergência acima de 10%;
- qualquer mutação de estado ou efeito externo;
- vazamento de dado sensível, falha de sanitização ou quebra de isolamento;
- ausência de `release_id`, hash ou telemetria obrigatória.

## Resposta imediata

1. Marcar a observação como `PAUSED` e impedir novas execuções candidatas.
2. Manter a baseline como única saída válida.
3. Preservar logs, hashes, versão, horário e caso sintético afetado.
4. Não apagar observações nem reescrever snapshots históricos.
5. Abrir revisão com problema, impacto, evidência e decisão necessária.

## Investigação

1. Confirmar se a falha é de entrada, roteamento, motor, contrato, telemetria ou infraestrutura.
2. Reproduzir apenas com o caso sintético afetado.
3. Corrigir em nova versão, sem alterar a evidência original.
4. Executar testes unitários, suíte dos 20 casos e bateria geral.

## Retomada

A candidata só retorna ao Shadow após causa identificada, correção versionada, testes aprovados, evidência anexada e autorização de Rafael. Retomada nunca amplia o escopo para dados reais.
